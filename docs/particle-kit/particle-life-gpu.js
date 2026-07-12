/* particle-life-gpu.js — WebGPU spatial-hash particle engine
 *
 * Full port of the SandboxScience GPU pipeline (DicSo92/SandboxScience,
 * AGPL-3.0-or-later) preserving the exact WGSL shader math so we get the
 * same visual character. Pipeline per frame:
 *
 *   1. binFillSize      — atomic count of particles per spatial bin
 *   2. binPrefixSum     — Hillis-Steele parallel scan over bin counts
 *   3. particleSort     — rewrite particles in bin-sorted order
 *   4. computeForces    — only scan neighbouring (1+2k)² bins per particle
 *   5. particleAdvance  — friction + integrate + wrap + disturb impulse
 *   6. renderGlow       — instanced quads into HDR rgba16float
 *   7. composeHdr       — ACES tonemap + gamma + dither → swap chain
 *
 * Public API matches window.ParticleLife.create so Hero can swap in:
 *   window.ParticleLifeGPU.create(canvas, opts) -> Promise<engine>
 *   window.ParticleLifeGPU.isSupported() -> boolean
 *
 * Engine instance surface:
 *   destroy, setPalette, setPreset, setSpecies, setBgFade, setCount,
 *   setPointSize, setGlow, setForce, setRMax, disturb, pause,
 *   get size, get config, get backend ('webgpu'), get particles ([]),
 *   get matrix (null — GPU-resident)
 *
 * Adapted shaders live in /tmp/sandbox-science-ref or the project's
 * sandbox-src/ (depending on which clone is present). The WGSL bodies
 * inlined below are byte-for-byte identical to the originals except:
 *   • particleAdvance.wgsl gets a Disturb uniform (group 3) for the
 *     hero's two-layer breath pulses.
 *   • SimOptions struct includes cellSubdivisions for the spatial-hash
 *     compute pass — other shaders ignore the trailing fields.
 */

(function () {
  'use strict';

  // =========================================================================
  // WGSL — shared struct definitions
  // =========================================================================
  // SimOptions layout must match sandbox-science exactly so shader bodies stay
  // verbatim. 20 u32/f32 fields = 80 bytes, naturally 16-byte aligned.
  const SIM_OPTIONS_STRUCT = /* wgsl */ `
    struct SimOptions {
      simWidth: f32,
      simHeight: f32,
      gridWidth: u32,
      gridHeight: u32,
      cellSize: f32,
      numParticles: u32,
      numTypes: u32,
      particleSize: f32,
      particleOpacity: f32,
      isWallRepel: u32,
      isWallWrap: u32,
      forceFactor: f32,
      frictionFactor: f32,
      repel: f32,
      extendedGridWidth: u32,
      extendedGridHeight: u32,
      gridOffsetX: u32,
      gridOffsetY: u32,
      mirrorWrapCount: u32,
      cellSubdivisions: u32,
    };
  `;

  const PARTICLE_STRUCT = /* wgsl */ `
    struct Particle {
      x: f32,
      y: f32,
      vx: f32,
      vy: f32,
      particleType: f32,
    };
  `;

  // Shared bin-info helper. Identical to sandbox's getBinInfo.
  const BIN_INFO_FN = /* wgsl */ `
    struct BinInfo {
      gridSize: vec2i,
      binId: vec2i,
      binIndex: i32,
    };

    fn getBinInfo(position: vec2f, options: SimOptions) -> BinInfo {
      var gridSize: vec2i;
      var adjustedPosition = position;
      if (options.isWallWrap == 0u && options.isWallRepel == 0u) {
        gridSize = vec2i(i32(options.extendedGridWidth), i32(options.extendedGridHeight));
        adjustedPosition = position + vec2f(
          f32(options.gridOffsetX) * options.cellSize,
          f32(options.gridOffsetY) * options.cellSize
        );
      } else {
        gridSize = vec2i(i32(options.gridWidth), i32(options.gridHeight));
      }
      let binId = vec2i(
        clamp(i32(floor(adjustedPosition.x / options.cellSize)), 0, gridSize.x - 1),
        clamp(i32(floor(adjustedPosition.y / options.cellSize)), 0, gridSize.y - 1)
      );
      let binIndex = binId.y * gridSize.x + binId.x;
      return BinInfo(gridSize, binId, binIndex);
    }
  `;

  // =========================================================================
  // WGSL — compute shaders
  // =========================================================================
  // binFillSize.wgsl — atomically counts particles per bin. Writes to
  // binSize[binIndex + 1] so binSize[0] stays 0; prefix sum then yields
  // offsets where binSize[k] = start of bin k.
  const BIN_FILL_SIZE_WGSL = SIM_OPTIONS_STRUCT + PARTICLE_STRUCT + BIN_INFO_FN + /* wgsl */ `
    @group(0) @binding(0) var<storage, read> particles: array<Particle>;
    @group(1) @binding(0) var<uniform> options: SimOptions;
    @group(2) @binding(0) var<storage, read_write> binSize: array<atomic<u32>>;

    @compute @workgroup_size(64)
    fn clearBinSize(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= arrayLength(&binSize)) { return; }
      atomicStore(&binSize[id.x], 0u);
    }

    @compute @workgroup_size(64)
    fn fillBinSize(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= options.numParticles) { return; }
      let particle = particles[id.x];
      let binIndex = getBinInfo(vec2f(particle.x, particle.y), options).binIndex;
      atomicAdd(&binSize[binIndex + 1], 1u);
    }
  `;

  // binPrefixSum.wgsl — Hillis-Steele step. Caller dispatches once per
  // iteration with stepSize = 2^iter, ping-ponging source/destination.
  const BIN_PREFIX_SUM_WGSL = /* wgsl */ `
    @group(0) @binding(0) var<storage, read> source: array<u32>;
    @group(0) @binding(1) var<storage, read_write> destination: array<u32>;
    @group(0) @binding(2) var<uniform> stepSize: u32;

    @compute @workgroup_size(64)
    fn prefixSumStep(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= arrayLength(&source)) { return; }
      if (id.x < stepSize) {
        destination[id.x] = source[id.x];
      } else {
        destination[id.x] = source[id.x - stepSize] + source[id.x];
      }
    }
  `;

  // particleSort.wgsl — bin-sort particles using the prefix-summed
  // binOffset array. binSize is reused here as the per-bin write counter
  // (must be cleared before sortParticles is dispatched).
  const PARTICLE_SORT_WGSL = SIM_OPTIONS_STRUCT + PARTICLE_STRUCT + BIN_INFO_FN + /* wgsl */ `
    @group(0) @binding(0) var<storage, read> source: array<Particle>;
    @group(0) @binding(1) var<storage, read_write> destination: array<Particle>;
    @group(0) @binding(2) var<storage, read> binOffset: array<u32>;
    @group(0) @binding(3) var<storage, read_write> binSize: array<atomic<u32>>;
    @group(1) @binding(0) var<uniform> options: SimOptions;

    @compute @workgroup_size(64)
    fn clearSortBinSize(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= arrayLength(&binSize)) { return; }
      atomicStore(&binSize[id.x], 0u);
    }

    @compute @workgroup_size(64)
    fn sortParticles(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= options.numParticles) { return; }
      let particle = source[id.x];
      let binIndex = getBinInfo(vec2f(particle.x, particle.y), options).binIndex;
      let newIdx = binOffset[binIndex] + atomicAdd(&binSize[binIndex], 1u);
      destination[newIdx] = particle;
    }
  `;

  // particleComputeForces.wgsl — neighbourhood-scan force compute. Reads
  // a bin-sorted source, writes back to destination in the same indices.
  const COMPUTE_FORCES_WGSL = SIM_OPTIONS_STRUCT + PARTICLE_STRUCT + BIN_INFO_FN + /* wgsl */ `
    struct InteractionMatrix { data: array<u32> };

    fn get_interaction(index: u32) -> vec3<f32> {
      let word = interactions.data[index];
      let rule = fma(f32((word >> 0u) & 0xFFu), 1.0 / 127.5, -1.0);
      let minR = f32((word >> 8u) & 0xFFu);
      let maxR = f32((word >> 16u) & 0xFFFFu);
      return vec3<f32>(rule, minR, maxR);
    }

    @group(0) @binding(0) var<storage, read> particlesSource: array<Particle>;
    @group(0) @binding(1) var<storage, read_write> particlesDestination: array<Particle>;
    @group(0) @binding(2) var<storage, read> binOffset: array<u32>;
    @group(0) @binding(3) var<storage, read> interactions: InteractionMatrix;
    @group(1) @binding(0) var<uniform> options: SimOptions;

    @compute @workgroup_size(64)
    fn computeForces(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= options.numParticles) { return; }
      let half_width = options.simWidth * 0.5;
      let half_height = options.simHeight * 0.5;
      let is_wrapping = options.isWallWrap == 1u;
      let repelForce = options.repel;
      let cellSubdivisions = i32(options.cellSubdivisions);

      var particle = particlesSource[id.x];
      let myType = u32(particle.particleType);
      let myTypeOffset = myType * options.numTypes;
      let binInfo = getBinInfo(vec2f(particle.x, particle.y), options);

      var binXMin = binInfo.binId.x - cellSubdivisions;
      var binYMin = binInfo.binId.y - cellSubdivisions;
      var binXMax = binInfo.binId.x + cellSubdivisions;
      var binYMax = binInfo.binId.y + cellSubdivisions;
      if (!is_wrapping) {
        binXMin = max(0, binXMin);
        binYMin = max(0, binYMin);
        binXMax = min(binInfo.gridSize.x - 1, binXMax);
        binYMax = min(binInfo.gridSize.y - 1, binYMax);
      }

      var totalForce = vec2f(0.0, 0.0);
      let particlePosition = vec2f(particle.x, particle.y);

      for (var binX = binXMin; binX <= binXMax; binX += 1) {
        for (var binY = binYMin; binY <= binYMax; binY += 1) {
          var realBinX = binX;
          var realBinY = binY;
          if (is_wrapping) {
            if (binX < 0) { realBinX = binX + binInfo.gridSize.x; }
            else if (binX >= binInfo.gridSize.x) { realBinX = binX - binInfo.gridSize.x; }
            if (binY < 0) { realBinY = binY + binInfo.gridSize.y; }
            else if (binY >= binInfo.gridSize.y) { realBinY = binY - binInfo.gridSize.y; }
          }
          let bIdx = u32(realBinY * binInfo.gridSize.x + realBinX);
          let binStart = binOffset[bIdx];
          let binEnd = binOffset[bIdx + 1u];

          for (var j = binStart; j < binEnd; j += 1u) {
            if (j == id.x) { continue; }
            let other = particlesSource[j];
            var r = vec2f(other.x, other.y) - particlePosition;
            if (is_wrapping) {
              if (abs(r.x) >= half_width)  { r.x -= sign(r.x) * options.simWidth; }
              if (abs(r.y) >= half_height) { r.y -= sign(r.y) * options.simHeight; }
            }
            let distSquared = dot(r, r);
            if (distSquared < 0.0001) { continue; }

            let otherType = u32(other.particleType);
            let interaction = get_interaction(myTypeOffset + otherType);
            let maxR = interaction.z;
            if (distSquared < maxR * maxR) {
              let invDist = inverseSqrt(distSquared);
              let dist = distSquared * invDist;
              let minR = interaction.y;
              var force: f32;
              if (dist < minR) {
                force = fma(dist / minR, repelForce, -repelForce);
              } else {
                let rule = interaction.x;
                let mid = (minR + maxR) * 0.5;
                let slope = rule / (mid - minR);
                force = fma(-slope, abs(dist - mid), rule);
              }
              let scaledForce = force * invDist;
              totalForce.x = fma(r.x, scaledForce, totalForce.x);
              totalForce.y = fma(r.y, scaledForce, totalForce.y);
            }
          }
        }
      }

      particle.vx = fma(totalForce.x, options.forceFactor, particle.vx);
      particle.vy = fma(totalForce.y, options.forceFactor, particle.vy);
      particlesDestination[id.x] = particle;
    }
  `;

  // particleAdvance.wgsl + Disturb. The bare sandbox advance is byte-identical;
  // the Disturb block at the top is our addition for the Hero "breath" pulse
  // and is bound on group 3 — other engines that don't supply it can leave
  // the buffer zeroed and the math collapses to a no-op.
  const PARTICLE_ADVANCE_WGSL = SIM_OPTIONS_STRUCT + PARTICLE_STRUCT + /* wgsl */ `
    @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
    @group(1) @binding(0) var<uniform> options: SimOptions;
    @group(2) @binding(0) var<uniform> frameInfo: vec4<f32>; // x: dt seconds
    @group(3) @binding(0) var<uniform> disturb: vec4<f32>;   // x,y,radius,strength

    @compute @workgroup_size(64)
    fn particleAdvance(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= options.numParticles) { return; }
      let width = options.simWidth;
      let height = options.simHeight;
      let deltaTime = frameInfo.x;

      var particle = particles[id.x];
      particle.vx *= (1.0 - options.frictionFactor);
      particle.vy *= (1.0 - options.frictionFactor);

      // Hero disturb impulse: radial push from disturb origin, linear falloff.
      if (disturb.w > 0.0) {
        let dx = particle.x - disturb.x;
        let dy = particle.y - disturb.y;
        let d2 = dx * dx + dy * dy;
        let r = disturb.z;
        if (d2 < r * r && d2 > 0.0001) {
          let d = sqrt(d2);
          let falloff = 1.0 - d / r;
          let push = falloff * disturb.w;
          particle.vx += (dx / d) * push;
          particle.vy += (dy / d) * push;
        }
      }

      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      if (options.isWallRepel == 1u) {
        let margin = options.particleSize;
        if (particle.x < margin || particle.x > width - margin) {
          particle.vx *= -1.0;
          particle.x = clamp(particle.x, margin, width - margin);
        }
        if (particle.y < margin || particle.y > height - margin) {
          particle.vy *= -1.0;
          particle.y = clamp(particle.y, margin, height - margin);
        }
      } else if (options.isWallWrap == 1u) {
        if (particle.x < 0.0) { particle.x += width; }
        else if (particle.x >= width) { particle.x -= width; }
        if (particle.y < 0.0) { particle.y += height; }
        else if (particle.y >= height) { particle.y -= height; }
      }
      particles[id.x] = particle;
    }
  `;

  // =========================================================================
  // WGSL — render shaders
  // =========================================================================
  // particle_render_glow.wgsl — instanced quads, additive into rgba16float HDR.
  const RENDER_GLOW_WGSL = SIM_OPTIONS_STRUCT + PARTICLE_STRUCT + /* wgsl */ `
    struct Camera { centerX: f32, centerY: f32, scaleX: f32, scaleY: f32 };
    struct GlowOptions { glowSize: f32, glowIntensity: f32, glowSteepness: f32 };

    @group(0) @binding(0) var<storage, read> particles: array<Particle>;
    @group(0) @binding(1) var<storage, read> colors: array<vec4<f32>>;
    @group(1) @binding(0) var<uniform> options: SimOptions;
    @group(2) @binding(0) var<uniform> camera: Camera;
    @group(3) @binding(0) var<uniform> glowOptions: GlowOptions;

    struct VertexOutput {
      @builtin(position) position: vec4<f32>,
      @location(0) offset: vec2<f32>,
      @location(1) color: vec4<f32>,
    };

    const QUAD_VERTICES = array<vec2<f32>, 4>(
      vec2<f32>(-1.0, -1.0),
      vec2<f32>( 1.0, -1.0),
      vec2<f32>(-1.0,  1.0),
      vec2<f32>( 1.0,  1.0)
    );

    // Common vertex setup shared by glow + circle: returns transformed quad
    // around the particle center with 'size' half-extent in sim units.
    fn vertex_main(instanceIndex: u32, vertexIndex: u32, size: f32) -> VertexOutput {
      if (instanceIndex >= options.numParticles) {
        return VertexOutput(vec4f(0.0), vec2f(0.0), vec4f(0.0));
      }
      let particle = particles[instanceIndex];
      let color = colors[u32(particle.particleType)];
      let particleCenterPos = vec2f(particle.x, particle.y);

      let cameraScale = vec2f(camera.scaleX, -camera.scaleY);
      let cameraCenter = vec2f(camera.centerX, camera.centerY);
      let transformedCenterPos = fma(particleCenterPos, cameraScale, -cameraCenter * cameraScale);

      let quadOffset = QUAD_VERTICES[vertexIndex];
      let vertexOffset = quadOffset * size * cameraScale;
      let finalPos = transformedCenterPos + vertexOffset;
      return VertexOutput(vec4f(finalPos, 0.0, 1.0), quadOffset, color);
    }

    @vertex
    fn vertexGlow(
      @builtin(instance_index) instanceIndex: u32,
      @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
      return vertex_main(instanceIndex, vertexIndex, options.particleSize * glowOptions.glowSize);
    }

    @vertex
    fn vertexCircle(
      @builtin(instance_index) instanceIndex: u32,
      @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
      return vertex_main(instanceIndex, vertexIndex, options.particleSize);
    }

    @fragment
    fn fragmentGlow(in: VertexOutput) -> @location(0) vec4<f32> {
      let dist_sq = dot(in.offset, in.offset);
      if (dist_sq > 1.0) { discard; }
      let falloff = saturate(1.0 - dist_sq);
      let alpha = pow(falloff, glowOptions.glowSteepness) * glowOptions.glowIntensity;
      if (alpha < 0.0001) { discard; }
      return vec4<f32>(in.color.rgb * alpha, alpha);
    }

    // Sharp core: small disc with antialiased edge via fwidth. Drawn after
    // glow with additive blending so the bright center stays crisp even
    // when many halos overlap.
    @fragment
    fn fragmentCircle(in: VertexOutput) -> @location(0) vec4<f32> {
      let dist_sq = dot(in.offset, in.offset);
      let edge_width = fwidth(dist_sq);
      let alpha = 1.0 - smoothstep(max(0.0, 1.0 - edge_width), 1.0, dist_sq);
      if (alpha < 0.001) { discard; }
      let linear_color = pow(in.color.rgb, vec3<f32>(2.2));
      return vec4<f32>(linear_color * alpha, alpha * options.particleOpacity);
    }
  `;

  // compose_hdr.wgsl — fullscreen triangle, ACES + gamma 2.2 + ordered dither.
  const COMPOSE_HDR_WGSL = /* wgsl */ `
    const offsets = array<vec2<f32>, 3>(
      vec2<f32>(-1.0, -1.0),
      vec2<f32>( 3.0, -1.0),
      vec2<f32>(-1.0,  3.0),
    );

    fn acesTonemap(hdr_color: vec3<f32>) -> vec3<f32> {
      let a = 2.51;
      let b = 0.03;
      let c = 2.43;
      let d = 0.59;
      let e = 0.14;
      return (hdr_color * (a * hdr_color + b)) / (hdr_color * (c * hdr_color + d) + e);
    }
    fn dither(x: vec3f, n: f32) -> vec3f {
      let c = x * 255.0;
      let c0 = floor(c);
      let c1 = c0 + vec3f(1.0);
      let dc = c - c0;
      var r = c0;
      if (dc.r > n) { r.r = c1.r; }
      if (dc.g > n) { r.g = c1.g; }
      if (dc.b > n) { r.b = c1.b; }
      return r / 255.0;
    }

    @group(0) @binding(0) var hdrTexture: texture_2d<f32>;

    struct VertexOutput { @builtin(position) position: vec4<f32> };

    @vertex
    fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
      return VertexOutput(vec4f(offsets[vertexIndex], 0.0, 1.0));
    }
    @fragment
    fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
      let noise = fract(dot(in.position.xy, vec2f(12.9898, 78.233)) * 43758.5453);
      let hdr_color = textureLoad(hdrTexture, vec2i(in.position.xy), 0);
      var color = hdr_color.rgb;
      color = acesTonemap(color);
      color = pow(color, vec3f(0.45454545));
      color = dither(color, noise);
      return vec4f(color, 1.0);
    }
  `;

  // =========================================================================
  // Interaction presets — delegated to window.PLRules (15+ sandbox ports).
  // Hero / plates that pass `preset: 'auto'` get one of the "alive" names
  // randomly per create() call, giving each reload a fresh emergent behaviour
  // (cells, worm chains, predator-prey cycles, organism flocks, …).
  // =========================================================================
  function resolvePreset(name) {
    const rules = window.PLRules;
    if (!rules) {
      // Cellular fallback if rules file failed to load
      return (n) => {
        const m = new Array(n * n);
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) m[i * n + j] = (i === j) ? 0.8 : -0.55;
        return m;
      };
    }
    const actualName = (name === 'auto' || !rules.PRESETS[name]) ? rules.pickAlive() : name;
    return (n) => rules.get(actualName, n);
  }

  // =========================================================================
  // Seed dispatcher — delegates to window.PLSeeds for the full ported sandbox
  // catalogue (random, disk/rainbowDisk, ring/rainbowRing, rings/rainbowRings,
  // spiral/rainbowSpiral/twinSpirals/spiralArms, soft+linked clusters, yinYang,
  // chromaticFlower, wavyBands, orbitalBelts, chaoticBands). Passing 'auto'
  // picks one at random per call — the way Hero gets variety on reload.
  // =========================================================================
  function seedPattern(name, n, species, W, H, arr) {
    const seeds = window.PLSeeds;
    const write = (i, x, y, vx, vy, t) => {
      const k = i * 5;
      arr[k] = x;
      arr[k + 1] = y;
      arr[k + 2] = vx;
      arr[k + 3] = vy;
      arr[k + 4] = t;
    };
    if (!seeds) {
      // Defensive fallback if particle-life-seeds.js failed to load — just
      // scatter so the canvas isn't blank.
      for (let i = 0; i < n; i++) write(i, Math.random() * W, Math.random() * H, 0, 0, i % species);
      return;
    }
    const actualName = (name === 'auto' || !seeds.PATTERNS[name]) ? seeds.pickRandom() : name;
    seeds.run(actualName, write, n, species, W, H);
    return actualName;
  }

  // =========================================================================
  // Utilities
  // =========================================================================
  function hexToRGB(hex) {
    let h = (hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h || '888888', 16);
    return [((n >> 16) & 0xFF) / 255, ((n >> 8) & 0xFF) / 255, (n & 0xFF) / 255];
  }

  function packInteractions(rules, minR, maxR) {
    const out = new Uint32Array(rules.length);
    const mnB = Math.max(0, Math.min(255, Math.round(minR)));
    const mxS = Math.max(0, Math.min(65535, Math.round(maxR)));
    for (let i = 0; i < rules.length; i++) {
      const r = Math.max(-1, Math.min(1, rules[i]));
      const rB = Math.max(0, Math.min(255, Math.round((r + 1) * 0.5 * 255)));
      out[i] = (rB & 0xFF) | ((mnB & 0xFF) << 8) | ((mxS & 0xFFFF) << 16);
    }
    return out;
  }

  function isSupported() {
    return typeof navigator !== 'undefined' && !!navigator.gpu;
  }

  // Shared WebGPU device — requested once and reused by every engine instance
  // on the page. Each instance still creates its own pipelines + buffers, but
  // sharing the device avoids the per-instance adapter handshake cost (~tens of
  // ms each) and keeps total GPU memory pressure sane when many plates run.
  let _sharedDevicePromise = null;
  function getSharedDevice() {
    if (!_sharedDevicePromise) {
      _sharedDevicePromise = (async () => {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (!adapter) throw new Error('WebGPU adapter request failed');
        const device = await adapter.requestDevice();
        device.addEventListener?.('uncapturederror', (e) => {
          // eslint-disable-next-line no-console
          console.warn('[ParticleLifeGPU] uncaptured', e.error?.message || e);
        });
        // Re-resolve the promise if the device is lost so the next caller
        // gets a fresh device instead of forever-failing buffer creates.
        device.lost?.then(() => { _sharedDevicePromise = null; });
        return device;
      })();
    }
    return _sharedDevicePromise;
  }

  // =========================================================================
  // Engine factory
  // =========================================================================
  async function create(canvas, opts = {}) {
    if (!isSupported()) throw new Error('WebGPU not available');

    const device = await getSharedDevice();

    const ctx = canvas.getContext('webgpu');
    if (!ctx) throw new Error('webgpu canvas context unavailable');

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format: presentationFormat, alphaMode: 'premultiplied' });

    // -----------------------------------------------------------------------
    // Config — sandbox-science defaults baked in. Hero overrides via opts.
    // -----------------------------------------------------------------------
    const config = {
      species: opts.species ?? 7,
      count: opts.count ?? 30000,
      preset: opts.preset ?? 'cellular',
      palette: opts.palette ?? ['#7CC8F2', '#3E8FE0', '#1B3FA8', '#E8E8E8', '#0F1530', '#9CD7F5', '#5EA8E6'],
      // pointSize is the sharp CORE radius in sim units. Glow halo is drawn
      // on a quad of (pointSize × glowSize) — so glowSize is the halo/core
      // ratio. Defaults match sandbox-science (size 10 + intensity 0.066 +
      // steepness ~1.5). Steepness < 2 keeps the alpha falloff GENTLE so
      // the halo reads as actual blurry glow instead of a hard duplicate
      // of the particle shape (which is what high steepness collapses to).
      pointSize: opts.pointSize ?? 3.5,
      glowSize: opts.glowSize ?? 10.0,
      glowIntensity: opts.glowIntensity ?? 0.05,
      glowSteepness: opts.glowSteepness ?? 1.5,
      forceFactor: opts.forceFactor ?? 1.0,
      friction: opts.friction ?? 0.3,           // per-frame damping
      repel: opts.repel ?? 1.0,
      minR: opts.minR ?? 5,
      rMax: opts.rMax ?? 70,
      cellSubdivisions: opts.cellSubdivisions ?? 2,
      particleOpacity: opts.particleOpacity ?? 1.0,
      seedPattern: opts.seedPattern ?? 'random',
      showFps: opts.showFps ?? false,
      // simSpeed scales the per-frame integration step. 1.0 = real-time;
      // 0.5 = same render rate but the field evolves at half speed (motion
      // reads slower / more cinematic without dropping FPS). Hero uses 0.5
      // so the swarming chains "breathe" rather than rush.
      simSpeed: opts.simSpeed ?? 1.0,
      // Camera zoom — multiplies the NDC scale so particles take up more
      // of the screen. 1.0 = full sim visible; 1.5 = "moved camera 50%
      // closer" — central 67% of the sim is on-screen, particle quads
      // and glow halos scale up to match. Edges clip; wrap still works
      // (out-of-view particles just reappear out-of-view on the opposite
      // side). No shader change required — the existing camera.scaleXY
      // multiply in vertexGlow / vertexCircle does all the work.
      cameraZoom: opts.cameraZoom ?? 1.0,
      // Render the soft glow halo pass? When true (default), each particle
      // gets a big additive quad behind it (pointSize × glowSize wide).
      // At hero density + zoom the halos pile up into bloom, so Hero
      // turns this OFF and shows only sharp core circles. Tiny plates
      // keep it on because at low count the bloom reads as atmosphere.
      showGlow: opts.showGlow ?? true,
      paused: false,
    };

    // Engine state — populated by resize / allocBuffers / seedParticles
    let W = 0, H = 0;                // sim space = canvas CSS pixels
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cellSize = 0;
    let gridW = 0, gridH = 0;
    let binCount = 0;
    let prefixIter = 0;
    let prevTimestamp = 0;
    let smoothedDt = 1 / 120;        // start small until first real measurement
    let fpsSmoothed = 60;
    let fpsLastDisplayUpdate = 0;
    let fpsOverlay = null;           // lazily created DOM node

    // Buffers
    let particleBufferA = null, particleBufferB = null;
    let interactionsBuffer = null;
    let colorsBuffer = null;
    let simOptionsBuffer = null;
    let binOffsetBuffer = null;
    let binOffsetTempBuffer = null;
    let sortBinSizeBuffer = null;
    const PREFIX_MAX_ITER = 32;       // 2^32 bins ≫ anything realistic
    const prefixStepSizeBuffers = []; // pre-filled u32 = (1 << i) per buffer
    let cameraBuffer = null;
    let glowBuffer = null;
    let deltaTimeBuffer = null;       // vec4<f32>; .x = dt
    let disturbBuffer = null;         // vec4<f32>; xyzw = x,y,radius,strength
    let pendingDisturb = null;

    // HDR target
    let hdrTexture = null, hdrView = null;

    // Bind groups (rebuilt when buffers reallocate)
    let bgBinFillParticles = null;
    let bgBinFillBinSize = null;
    let bgPrefixSum_AB = null;        // source = A (binOffset),    dest = B (binOffsetTemp)
    let bgPrefixSum_BA = null;        // source = B,                dest = A
    const bgPrefixStep = [];          // one bind group per stepSize iteration index
    let bgSortIO = null;              // (sourceA, destB, binOffset, sortBinSize)
    let bgSortIO_BA = null;           // unused — sort always reads A writes B
    let bgForcesIO_BA = null;         // (sourceB, destA, binOffset, interactions)
    let bgAdvanceA = null;
    let bgRenderGlowA = null;
    let bgSimOptions = null;
    let bgCamera = null;
    let bgGlowOptions = null;
    let bgDelta = null;
    let bgDisturb = null;
    let bgComposeHdr = null;

    // -----------------------------------------------------------------------
    // Shader modules + pipelines (created once, shared)
    // -----------------------------------------------------------------------
    const modBinFillSize = device.createShaderModule({ label: 'binFillSize', code: BIN_FILL_SIZE_WGSL });
    const modBinPrefix = device.createShaderModule({ label: 'binPrefixSum', code: BIN_PREFIX_SUM_WGSL });
    const modSort = device.createShaderModule({ label: 'particleSort', code: PARTICLE_SORT_WGSL });
    const modForces = device.createShaderModule({ label: 'computeForces', code: COMPUTE_FORCES_WGSL });
    const modAdvance = device.createShaderModule({ label: 'particleAdvance', code: PARTICLE_ADVANCE_WGSL });
    const modGlow = device.createShaderModule({ label: 'renderGlow', code: RENDER_GLOW_WGSL });
    const modCompose = device.createShaderModule({ label: 'composeHdr', code: COMPOSE_HDR_WGSL });

    // ---- Bind group layouts -----------------------------------------------
    const bglBinFill_Particles = device.createBindGroupLayout({
      label: 'bglBinFill_Particles',
      entries: [{ binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } }],
    });
    const bglSimOptions = device.createBindGroupLayout({
      label: 'bglSimOptions',
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      }],
    });
    const bglBinFill_BinSize = device.createBindGroupLayout({
      label: 'bglBinFill_BinSize',
      entries: [{ binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }],
    });
    const bglPrefix = device.createBindGroupLayout({
      label: 'bglPrefix',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    });
    const bglSort = device.createBindGroupLayout({
      label: 'bglSort',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      ],
    });
    const bglForces = device.createBindGroupLayout({
      label: 'bglForces',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      ],
    });
    const bglAdvance = device.createBindGroupLayout({
      label: 'bglAdvance',
      entries: [{ binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }],
    });
    const bglDelta = device.createBindGroupLayout({
      label: 'bglDelta',
      entries: [{ binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }],
    });
    const bglDisturb = device.createBindGroupLayout({
      label: 'bglDisturb',
      entries: [{ binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }],
    });
    const bglRenderGlow = device.createBindGroupLayout({
      label: 'bglRenderGlow',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      ],
    });
    const bglCamera = device.createBindGroupLayout({
      label: 'bglCamera',
      entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }],
    });
    const bglGlowOptions = device.createBindGroupLayout({
      label: 'bglGlowOptions',
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      }],
    });
    const bglCompose = device.createBindGroupLayout({
      label: 'bglCompose',
      entries: [{ binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'unfilterable-float' } }],
    });

    // ---- Pipelines --------------------------------------------------------
    const pipeBinFillClear = device.createComputePipeline({
      label: 'binFillClear',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglBinFill_Particles, bglSimOptions, bglBinFill_BinSize] }),
      compute: { module: modBinFillSize, entryPoint: 'clearBinSize' },
    });
    const pipeBinFill = device.createComputePipeline({
      label: 'binFill',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglBinFill_Particles, bglSimOptions, bglBinFill_BinSize] }),
      compute: { module: modBinFillSize, entryPoint: 'fillBinSize' },
    });
    const pipePrefixSum = device.createComputePipeline({
      label: 'prefixSumStep',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglPrefix] }),
      compute: { module: modBinPrefix, entryPoint: 'prefixSumStep' },
    });
    const pipeSortClear = device.createComputePipeline({
      label: 'sortClear',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglSort, bglSimOptions] }),
      compute: { module: modSort, entryPoint: 'clearSortBinSize' },
    });
    const pipeSort = device.createComputePipeline({
      label: 'particleSort',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglSort, bglSimOptions] }),
      compute: { module: modSort, entryPoint: 'sortParticles' },
    });
    const pipeForces = device.createComputePipeline({
      label: 'computeForces',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglForces, bglSimOptions] }),
      compute: { module: modForces, entryPoint: 'computeForces' },
    });
    const pipeAdvance = device.createComputePipeline({
      label: 'particleAdvance',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglAdvance, bglSimOptions, bglDelta, bglDisturb] }),
      compute: { module: modAdvance, entryPoint: 'particleAdvance' },
    });
    const pipeRenderGlow = device.createRenderPipeline({
      label: 'renderGlow',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglRenderGlow, bglSimOptions, bglCamera, bglGlowOptions] }),
      vertex: { module: modGlow, entryPoint: 'vertexGlow' },
      fragment: {
        module: modGlow,
        entryPoint: 'fragmentGlow',
        targets: [{
          format: 'rgba16float',
          blend: {
            color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
          },
        }],
      },
      primitive: { topology: 'triangle-strip' },
    });
    // Circle render — sharp core dot drawn on top of glow. Same layout, just
    // different entry points + a larger blend (still additive into HDR so
    // overlaps remain bright; ACES tonemap controls the highlight rolloff).
    const pipeRenderCircle = device.createRenderPipeline({
      label: 'renderCircle',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglRenderGlow, bglSimOptions, bglCamera, bglGlowOptions] }),
      vertex: { module: modGlow, entryPoint: 'vertexCircle' },
      fragment: {
        module: modGlow,
        entryPoint: 'fragmentCircle',
        targets: [{
          format: 'rgba16float',
          blend: {
            color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
          },
        }],
      },
      primitive: { topology: 'triangle-strip' },
    });
    const pipeCompose = device.createRenderPipeline({
      label: 'composeHdr',
      layout: device.createPipelineLayout({ bindGroupLayouts: [bglCompose] }),
      vertex: { module: modCompose, entryPoint: 'vertexMain' },
      fragment: { module: modCompose, entryPoint: 'fragmentMain', targets: [{ format: presentationFormat }] },
      primitive: { topology: 'triangle-list' },
    });

    // -----------------------------------------------------------------------
    // Buffer allocators
    // -----------------------------------------------------------------------
    const PARTICLE_STRIDE = 5 * 4;

    function allocParticleBuffers(n) {
      if (particleBufferA) particleBufferA.destroy();
      if (particleBufferB) particleBufferB.destroy();
      const bytes = Math.max(PARTICLE_STRIDE, PARTICLE_STRIDE * n);
      // COPY_SRC added so readParticles() can snapshot the buffer into a
      // staging buffer for SVG / vector export.
      particleBufferA = device.createBuffer({
        label: 'particleA',
        size: bytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
      });
      particleBufferB = device.createBuffer({
        label: 'particleB',
        size: bytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
    }

    function recomputeGridParams() {
      // Cell size = rMax / cellSubdivisions, but never below 8 px to keep
      // bin counts sane on tiny canvases.
      cellSize = Math.max(8, config.rMax / Math.max(1, config.cellSubdivisions));
      gridW = Math.max(1, Math.ceil(W / cellSize));
      gridH = Math.max(1, Math.ceil(H / cellSize));
      binCount = gridW * gridH;
      // Hillis-Steele iterations: ceil(log2(binCount+1)), rounded up to even
      // so the final result lands back in binOffsetBuffer.
      const log2 = Math.ceil(Math.log2(binCount + 1));
      prefixIter = Math.min(PREFIX_MAX_ITER, Math.max(2, Math.ceil(log2 / 2) * 2));
    }

    function allocBinBuffers() {
      if (binOffsetBuffer) binOffsetBuffer.destroy();
      if (binOffsetTempBuffer) binOffsetTempBuffer.destroy();
      if (sortBinSizeBuffer) sortBinSizeBuffer.destroy();
      const bytes = Math.max(16, 4 * (binCount + 1));
      binOffsetBuffer = device.createBuffer({
        label: 'binOffset',
        size: bytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      binOffsetTempBuffer = device.createBuffer({
        label: 'binOffsetTemp',
        size: bytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      sortBinSizeBuffer = device.createBuffer({
        label: 'sortBinSize',
        size: bytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
    }

    function allocPrefixStepBuffers() {
      // One small (16-byte) uniform per iteration with stepSize = 1 << i.
      if (prefixStepSizeBuffers.length) return; // pre-allocate once
      for (let i = 0; i < PREFIX_MAX_ITER; i++) {
        const b = device.createBuffer({
          label: `prefixStep_${i}`,
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(b, 0, new Uint32Array([1 << i, 0, 0, 0]));
        prefixStepSizeBuffers.push(b);
      }
    }

    function writeColors() {
      const slots = Math.max(8, config.species);
      const arr = new Float32Array(slots * 4);
      for (let i = 0; i < config.species; i++) {
        const [r, g, b] = hexToRGB(config.palette[i % config.palette.length]);
        arr[i * 4 + 0] = r;
        arr[i * 4 + 1] = g;
        arr[i * 4 + 2] = b;
        arr[i * 4 + 3] = 1;
      }
      if (!colorsBuffer || colorsBuffer.size < arr.byteLength) {
        if (colorsBuffer) colorsBuffer.destroy();
        colorsBuffer = device.createBuffer({
          label: 'colors',
          size: arr.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
      }
      device.queue.writeBuffer(colorsBuffer, 0, arr);
    }

    function writeInteractions() {
      const gen = resolvePreset(config.preset);
      const rules = gen(config.species);
      const packed = packInteractions(rules, config.minR, config.rMax);
      const need = Math.max(16, packed.byteLength);
      if (!interactionsBuffer || interactionsBuffer.size < need) {
        if (interactionsBuffer) interactionsBuffer.destroy();
        interactionsBuffer = device.createBuffer({
          label: 'interactions',
          size: need,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
      }
      device.queue.writeBuffer(interactionsBuffer, 0, packed);
    }

    function writeOptions() {
      // 20 fields × 4 bytes = 80 bytes (16-byte multiple)
      const buf = new ArrayBuffer(80);
      const f = new Float32Array(buf);
      const u = new Uint32Array(buf);
      f[0] = W; f[1] = H;
      u[2] = gridW; u[3] = gridH;
      f[4] = cellSize;
      u[5] = config.count;
      u[6] = config.species;
      f[7] = config.pointSize;
      f[8] = config.particleOpacity;
      u[9] = 0;                            // isWallRepel
      u[10] = 1;                           // isWallWrap (always for hero)
      f[11] = config.forceFactor;
      f[12] = config.friction;
      f[13] = config.repel;
      u[14] = 0; u[15] = 0;                 // extendedGrid w/h (no-wrap path unused)
      u[16] = 0; u[17] = 0;                 // gridOffset x/y
      u[18] = 0;                           // mirrorWrapCount
      u[19] = config.cellSubdivisions;
      if (!simOptionsBuffer) {
        simOptionsBuffer = device.createBuffer({
          label: 'simOptions',
          size: 80,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
      }
      device.queue.writeBuffer(simOptionsBuffer, 0, buf);
    }

    function writeCamera() {
      // Sim space [0..W, 0..H] → NDC [-1..1] * cameraZoom. Shader inverts
      // Y via -scaleY. Zoom>1 cinematically pulls the camera in; zoom<1
      // pulls it out (more sim visible, particles smaller).
      const zoom = config.cameraZoom ?? 1.0;
      const arr = new Float32Array(4);
      arr[0] = W * 0.5;
      arr[1] = H * 0.5;
      arr[2] = (2.0 * zoom) / Math.max(1, W);
      arr[3] = (2.0 * zoom) / Math.max(1, H);
      if (!cameraBuffer) {
        cameraBuffer = device.createBuffer({
          label: 'camera',
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
      }
      device.queue.writeBuffer(cameraBuffer, 0, arr);
    }

    function writeGlow() {
      const arr = new Float32Array([
        config.glowSize,
        config.glowIntensity,
        config.glowSteepness,
        0,
      ]);
      if (!glowBuffer) {
        glowBuffer = device.createBuffer({
          label: 'glowOptions',
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
      }
      device.queue.writeBuffer(glowBuffer, 0, arr);
    }

    function writeDelta(dt) {
      if (!deltaTimeBuffer) {
        deltaTimeBuffer = device.createBuffer({
          label: 'deltaTime',
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
      }
      // Apply simSpeed here so the shader stays untouched — keeps the
      // multi-pass advance pipeline byte-for-byte sandbox-compatible.
      const scaled = dt * (config.simSpeed ?? 1.0);
      device.queue.writeBuffer(deltaTimeBuffer, 0, new Float32Array([scaled, 0, 0, 0]));
    }

    function writeDisturb() {
      if (!disturbBuffer) {
        disturbBuffer = device.createBuffer({
          label: 'disturb',
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
      }
      const d = pendingDisturb;
      if (d) {
        device.queue.writeBuffer(disturbBuffer, 0, new Float32Array([d.x, d.y, d.r, d.s]));
        d.s *= 0.85;
        if (d.s < 0.05) pendingDisturb = null;
      } else {
        device.queue.writeBuffer(disturbBuffer, 0, new Float32Array([0, 0, 0, 0]));
      }
    }

    function seedAndUpload() {
      const arr = new Float32Array(config.count * 5);
      seedPattern(config.seedPattern, config.count, config.species, W || 800, H || 600, arr);
      device.queue.writeBuffer(particleBufferA, 0, arr);
    }

    // -----------------------------------------------------------------------
    // HDR texture
    // -----------------------------------------------------------------------
    function ensureHDR() {
      const w = Math.max(1, canvas.width);
      const h = Math.max(1, canvas.height);
      if (hdrTexture && hdrTexture.width === w && hdrTexture.height === h) return;
      if (hdrTexture) hdrTexture.destroy();
      hdrTexture = device.createTexture({
        label: 'hdrTexture',
        size: [w, h],
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      hdrView = hdrTexture.createView();
    }

    // -----------------------------------------------------------------------
    // Bind groups
    // -----------------------------------------------------------------------
    function rebuildBindGroups() {
      // Particles read-only — bin fill reads A (the latest state)
      bgBinFillParticles = device.createBindGroup({
        layout: bglBinFill_Particles,
        entries: [{ binding: 0, resource: { buffer: particleBufferA } }],
      });
      bgBinFillBinSize = device.createBindGroup({
        layout: bglBinFill_BinSize,
        entries: [{ binding: 0, resource: { buffer: binOffsetBuffer } }],
      });

      // Prefix sum ping-pong: even iter source→A, odd source→B.
      // Iteration 0 reads binOffsetBuffer (filled by fillBinSize) and writes
      // binOffsetTempBuffer; iter 1 swaps, etc.
      bgPrefixSum_AB = device.createBindGroup({
        layout: bglPrefix,
        entries: [
          { binding: 0, resource: { buffer: binOffsetBuffer } },
          { binding: 1, resource: { buffer: binOffsetTempBuffer } },
          { binding: 2, resource: { buffer: prefixStepSizeBuffers[0] } },
        ],
      });
      bgPrefixSum_BA = device.createBindGroup({
        layout: bglPrefix,
        entries: [
          { binding: 0, resource: { buffer: binOffsetTempBuffer } },
          { binding: 1, resource: { buffer: binOffsetBuffer } },
          { binding: 2, resource: { buffer: prefixStepSizeBuffers[0] } },
        ],
      });

      // Per-iteration bind groups that vary only by which stepSize uniform they bind
      bgPrefixStep.length = 0;
      for (let i = 0; i < prefixIter; i++) {
        const sourceIsA = (i % 2) === 0;
        const sourceBuf = sourceIsA ? binOffsetBuffer : binOffsetTempBuffer;
        const destBuf = sourceIsA ? binOffsetTempBuffer : binOffsetBuffer;
        bgPrefixStep.push(device.createBindGroup({
          layout: bglPrefix,
          entries: [
            { binding: 0, resource: { buffer: sourceBuf } },
            { binding: 1, resource: { buffer: destBuf } },
            { binding: 2, resource: { buffer: prefixStepSizeBuffers[i] } },
          ],
        }));
      }

      // Sort: read A, write B
      bgSortIO = device.createBindGroup({
        layout: bglSort,
        entries: [
          { binding: 0, resource: { buffer: particleBufferA } },
          { binding: 1, resource: { buffer: particleBufferB } },
          { binding: 2, resource: { buffer: binOffsetBuffer } },
          { binding: 3, resource: { buffer: sortBinSizeBuffer } },
        ],
      });

      // Forces: read B sorted, write A with updated velocities
      bgForcesIO_BA = device.createBindGroup({
        layout: bglForces,
        entries: [
          { binding: 0, resource: { buffer: particleBufferB } },
          { binding: 1, resource: { buffer: particleBufferA } },
          { binding: 2, resource: { buffer: binOffsetBuffer } },
          { binding: 3, resource: { buffer: interactionsBuffer } },
        ],
      });

      // Advance: in-place A
      bgAdvanceA = device.createBindGroup({
        layout: bglAdvance,
        entries: [{ binding: 0, resource: { buffer: particleBufferA } }],
      });

      // Render glow: read A + colors
      bgRenderGlowA = device.createBindGroup({
        layout: bglRenderGlow,
        entries: [
          { binding: 0, resource: { buffer: particleBufferA } },
          { binding: 1, resource: { buffer: colorsBuffer } },
        ],
      });

      bgSimOptions = device.createBindGroup({
        layout: bglSimOptions,
        entries: [{ binding: 0, resource: { buffer: simOptionsBuffer } }],
      });
      bgCamera = device.createBindGroup({
        layout: bglCamera,
        entries: [{ binding: 0, resource: { buffer: cameraBuffer } }],
      });
      bgGlowOptions = device.createBindGroup({
        layout: bglGlowOptions,
        entries: [{ binding: 0, resource: { buffer: glowBuffer } }],
      });
      bgDelta = device.createBindGroup({
        layout: bglDelta,
        entries: [{ binding: 0, resource: { buffer: deltaTimeBuffer } }],
      });
      bgDisturb = device.createBindGroup({
        layout: bglDisturb,
        entries: [{ binding: 0, resource: { buffer: disturbBuffer } }],
      });
      bgComposeHdr = device.createBindGroup({
        layout: bglCompose,
        entries: [{ binding: 0, resource: hdrView }],
      });
    }

    // -----------------------------------------------------------------------
    // Resize — read CSS rect, set canvas pixel resolution to DPR, recompute
    // grid, ensure HDR texture, rebuild bind groups touching hdrView.
    // -----------------------------------------------------------------------
    function resize() {
      const rect = canvas.getBoundingClientRect();
      const newW = Math.max(1, Math.floor(rect.width));
      const newH = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(newW * dpr);
      canvas.height = Math.floor(newH * dpr);
      const sizeChanged = (newW !== W) || (newH !== H);
      W = newW; H = newH;
      recomputeGridParams();
      ensureHDR();
      writeOptions();
      writeCamera();
      if (sizeChanged && interactionsBuffer && colorsBuffer && simOptionsBuffer) {
        allocBinBuffers();
        rebuildBindGroups();
      }
    }

    // -----------------------------------------------------------------------
    // Boot
    // -----------------------------------------------------------------------
    resize();
    recomputeGridParams();
    allocParticleBuffers(config.count);
    allocBinBuffers();
    allocPrefixStepBuffers();
    seedAndUpload();
    writeColors();
    writeInteractions();
    writeOptions();
    writeCamera();
    writeGlow();
    writeDelta(smoothedDt);
    writeDisturb();
    rebuildBindGroups();

    // -----------------------------------------------------------------------
    // Frame loop
    // -----------------------------------------------------------------------
    // ---- FPS overlay ------------------------------------------------------
    function ensureFpsOverlay() {
      if (fpsOverlay) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      // Reuse existing one if a previous engine instance left it behind.
      const existing = parent.querySelector('.pl-fps-overlay');
      if (existing) { fpsOverlay = existing; return; }
      const el = document.createElement('div');
      el.className = 'pl-fps-overlay';
      el.style.cssText = [
        'position: absolute',
        'top: 12px',
        'left: 12px',
        'padding: 4px 10px',
        'font: 500 11px/1.4 "IBM Plex Mono", monospace',
        'letter-spacing: 0.06em',
        'color: rgba(255,255,255,0.78)',
        'background: rgba(0,0,0,0.42)',
        'border: 1px solid rgba(255,255,255,0.12)',
        'border-radius: 3px',
        'pointer-events: none',
        'z-index: 5',
        'backdrop-filter: blur(6px)',
        '-webkit-backdrop-filter: blur(6px)',
      ].join(';');
      el.textContent = '— fps';
      // Make parent positioned if not already
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(el);
      fpsOverlay = el;
    }
    function removeFpsOverlay() {
      if (fpsOverlay && fpsOverlay.parentNode) fpsOverlay.parentNode.removeChild(fpsOverlay);
      fpsOverlay = null;
    }
    function updateFpsOverlay(ts) {
      if (!config.showFps) return;
      if (!fpsOverlay) ensureFpsOverlay();
      if (!fpsOverlay) return;
      if (ts - fpsLastDisplayUpdate < 200) return;  // 5 Hz update
      fpsLastDisplayUpdate = ts;
      fpsOverlay.textContent = `${fpsSmoothed.toFixed(0)} fps · ${config.count.toLocaleString()} · webgpu`;
    }

    let raf = 0;
    function frame(ts) {
      // smoothed dt in seconds, clamped to a sane range so a tab-switch
      // doesn't produce a single 5-second jump that flings everything.
      if (prevTimestamp) {
        const real = (ts - prevTimestamp) / 1000;
        const clamped = Math.min(0.033, Math.max(0.004, real));
        smoothedDt = smoothedDt * 0.9 + clamped * 0.1;
        const instFps = 1 / Math.max(0.001, real);
        fpsSmoothed = fpsSmoothed * 0.92 + instFps * 0.08;
      }
      prevTimestamp = ts;
      updateFpsOverlay(ts);

      if (!config.paused) {
        // Re-check HDR every frame in case the canvas was resized
        const cw = Math.max(1, canvas.width), ch = Math.max(1, canvas.height);
        if (!hdrTexture || hdrTexture.width !== cw || hdrTexture.height !== ch) {
          ensureHDR();
          rebuildBindGroups();
        }
        writeDelta(smoothedDt);
        writeDisturb();

        const cmd = device.createCommandEncoder({ label: 'frame' });
        const wgParticles = Math.ceil(config.count / 64);
        const wgBins = Math.ceil((binCount + 1) / 64);

        // 1. Clear binOffset, then fill counts
        {
          const pass = cmd.beginComputePass({ label: 'binFill' });
          pass.setPipeline(pipeBinFillClear);
          pass.setBindGroup(0, bgBinFillParticles);
          pass.setBindGroup(1, bgSimOptions);
          pass.setBindGroup(2, bgBinFillBinSize);
          pass.dispatchWorkgroups(wgBins);
          pass.setPipeline(pipeBinFill);
          pass.dispatchWorkgroups(wgParticles);
          pass.end();
        }

        // 2. Hillis-Steele prefix sum (ping-pong)
        {
          const pass = cmd.beginComputePass({ label: 'prefixSum' });
          pass.setPipeline(pipePrefixSum);
          for (let i = 0; i < prefixIter; i++) {
            pass.setBindGroup(0, bgPrefixStep[i]);
            pass.dispatchWorkgroups(wgBins);
          }
          pass.end();
        }

        // 3. Clear sort counter, then bin-sort particles A → B
        {
          const pass = cmd.beginComputePass({ label: 'sort' });
          pass.setPipeline(pipeSortClear);
          pass.setBindGroup(0, bgSortIO);
          pass.setBindGroup(1, bgSimOptions);
          pass.dispatchWorkgroups(wgBins);
          pass.setPipeline(pipeSort);
          pass.dispatchWorkgroups(wgParticles);
          pass.end();
        }

        // 4. Force compute: B sorted → A (velocities updated)
        {
          const pass = cmd.beginComputePass({ label: 'forces' });
          pass.setPipeline(pipeForces);
          pass.setBindGroup(0, bgForcesIO_BA);
          pass.setBindGroup(1, bgSimOptions);
          pass.dispatchWorkgroups(wgParticles);
          pass.end();
        }

        // 5. Advance positions in-place on A (+disturb)
        {
          const pass = cmd.beginComputePass({ label: 'advance' });
          pass.setPipeline(pipeAdvance);
          pass.setBindGroup(0, bgAdvanceA);
          pass.setBindGroup(1, bgSimOptions);
          pass.setBindGroup(2, bgDelta);
          pass.setBindGroup(3, bgDisturb);
          pass.dispatchWorkgroups(wgParticles);
          pass.end();
        }

        // 6a. Glow render → HDR (clear first, soft halos). Skippable: at
        // hero density + camera zoom the halos pile up into bloom, so
        // showGlow:false renders only the sharp circle cores. When glow
        // is skipped the circle pass takes responsibility for clearing
        // the HDR target itself.
        const renderGlow = config.showGlow !== false;
        if (renderGlow) {
          const pass = cmd.beginRenderPass({
            label: 'glow',
            colorAttachments: [{
              view: hdrView,
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            }],
          });
          pass.setPipeline(pipeRenderGlow);
          pass.setBindGroup(0, bgRenderGlowA);
          pass.setBindGroup(1, bgSimOptions);
          pass.setBindGroup(2, bgCamera);
          pass.setBindGroup(3, bgGlowOptions);
          pass.draw(4, config.count);
          pass.end();
        }

        // 6b. Circle render → same HDR. Sharp cores. loadOp='load' if glow
        // already cleared + populated the texture, else 'clear' (we own
        // the clear when running solo).
        {
          const pass = cmd.beginRenderPass({
            label: 'circle',
            colorAttachments: [{
              view: hdrView,
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: renderGlow ? 'load' : 'clear',
              storeOp: 'store',
            }],
          });
          pass.setPipeline(pipeRenderCircle);
          pass.setBindGroup(0, bgRenderGlowA);
          pass.setBindGroup(1, bgSimOptions);
          pass.setBindGroup(2, bgCamera);
          pass.setBindGroup(3, bgGlowOptions);
          pass.draw(4, config.count);
          pass.end();
        }

        // 7. Compose HDR → canvas
        {
          const pass = cmd.beginRenderPass({
            label: 'compose',
            colorAttachments: [{
              view: ctx.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            }],
          });
          pass.setPipeline(pipeCompose);
          pass.setBindGroup(0, bgComposeHdr);
          pass.draw(3, 1);
          pass.end();
        }

        device.queue.submit([cmd.finish()]);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // -----------------------------------------------------------------------
    // Resize listener — debounced so rapid drags don't churn buffers
    // -----------------------------------------------------------------------
    let resizeRaf = 0;
    function onResize() {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    }
    window.addEventListener('resize', onResize);

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    function destroy() {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', onResize);
      removeFpsOverlay();
      if (hdrTexture) hdrTexture.destroy();
      if (particleBufferA) particleBufferA.destroy();
      if (particleBufferB) particleBufferB.destroy();
      if (interactionsBuffer) interactionsBuffer.destroy();
      if (colorsBuffer) colorsBuffer.destroy();
      if (simOptionsBuffer) simOptionsBuffer.destroy();
      if (binOffsetBuffer) binOffsetBuffer.destroy();
      if (binOffsetTempBuffer) binOffsetTempBuffer.destroy();
      if (sortBinSizeBuffer) sortBinSizeBuffer.destroy();
      if (cameraBuffer) cameraBuffer.destroy();
      if (glowBuffer) glowBuffer.destroy();
      if (deltaTimeBuffer) deltaTimeBuffer.destroy();
      if (disturbBuffer) disturbBuffer.destroy();
      for (const b of prefixStepSizeBuffers) b.destroy();
      prefixStepSizeBuffers.length = 0;
    }

    function setPalette(palette) {
      if (Array.isArray(palette) && palette.length >= 2) {
        config.palette = palette.slice();
        writeColors();
        rebuildBindGroups();
      }
    }
    function setPreset(name) {
      if (name !== 'auto' && !window.PLRules?.PRESETS[name]) return;
      config.preset = name;
      writeInteractions();
      rebuildBindGroups();
    }
    function setSpecies(n) {
      const v = Math.max(2, Math.min(8, n | 0));
      if (v === config.species) return;
      config.species = v;
      writeOptions();
      writeColors();
      writeInteractions();
      seedAndUpload();
      rebuildBindGroups();
    }
    function setBgFade(_v) { /* no-op — HDR clears each frame, no trail */ }
    function setCount(n) {
      const v = Math.max(200, Math.min(200000, n | 0));
      if (v === config.count) return;
      config.count = v;
      allocParticleBuffers(config.count);
      writeOptions();
      seedAndUpload();
      rebuildBindGroups();
    }
    function setPointSize(v) {
      config.pointSize = Math.max(0.1, Math.min(8, v));
      writeOptions();
    }
    function setGlow(v) {
      // v ~ [0..1] but the scroll handler passes 0.2-0.5; map so that v=0.5
      // lands on the sandbox default 0.066 intensity, scaling linearly above.
      config.glowIntensity = Math.max(0.005, Math.min(0.4, v * 0.132));
      writeGlow();
    }
    function setForce(v) {
      // Raw forceFactor — clamped so a runaway scroll multiplier can't
      // accelerate particles to wrap-velocity. Sandbox default is 1.0.
      config.forceFactor = Math.max(0.1, Math.min(2.0, v));
      writeOptions();
    }
    function setRMax(v) {
      config.rMax = Math.max(20, Math.min(160, v));
      writeInteractions();
      recomputeGridParams();
      allocBinBuffers();
      writeOptions();
      rebuildBindGroups();
    }
    function disturb(x, y, r = 260, s = 14) {
      // Overlap successive disturbs: if a previous pulse is still decaying,
      // sum into it rather than replacing — feels much more responsive when
      // the user sweeps the mouse across the field.
      if (pendingDisturb) {
        pendingDisturb.x = x;
        pendingDisturb.y = y;
        pendingDisturb.r = Math.max(pendingDisturb.r, r);
        pendingDisturb.s = Math.min(40, pendingDisturb.s + s * 0.45);
      } else {
        pendingDisturb = { x, y, r, s };
      }
    }
    function setShowFps(v) {
      config.showFps = !!v;
      if (config.showFps) ensureFpsOverlay();
      else removeFpsOverlay();
    }
    function getFps() { return fpsSmoothed; }
    // Live sim-speed control. Useful for slow-motion effects without
    // dropping FPS — picked up on next writeDelta() (every frame).
    function setSimSpeed(v) { config.simSpeed = Math.max(0.05, Math.min(4, v)); }
    function setCameraZoom(z) {
      config.cameraZoom = Math.max(0.2, Math.min(8, z));
      writeCamera();
    }
    function setShowGlow(v) { config.showGlow = !!v; }
    // Live control panel setters — clamp to safe ranges so stats-panel
    // slider drags can't blow the engine up (NaN repel → infinite force,
    // negative friction → exponential blowup, etc.).
    function setFriction(v) {
      config.friction = Math.max(0, Math.min(0.95, v));
      writeOptions();
    }
    function setRepel(v) {
      config.repel = Math.max(0.05, Math.min(10, v));
      writeOptions();
    }
    function setGlowSize(v) {
      config.glowSize = Math.max(0.1, Math.min(30, v));
      writeGlow();
    }
    function setGlowIntensity(v) {
      config.glowIntensity = Math.max(0, Math.min(1, v));
      writeGlow();
    }
    function setGlowSteepness(v) {
      config.glowSteepness = Math.max(0.1, Math.min(12, v));
      writeGlow();
    }
    function setParticleOpacity(v) {
      config.particleOpacity = Math.max(0, Math.min(1, v));
      writeOptions();
    }
    function setSeedPattern(name) {
      if (name === 'auto' || window.PLSeeds?.PATTERNS[name]) {
        config.seedPattern = name;
      }
    }
    // Respawn — re-fill the particle buffer with the current seed pattern
    // (or override). Lets the user "shuffle" the field without losing the
    // current preset / palette / engine config.
    function respawn(patternOverride) {
      if (patternOverride) setSeedPattern(patternOverride);
      seedAndUpload();
    }

    // Snapshot the GPU particle buffer back to CPU as {x, y, vx, vy, s}
    // objects — same shape as window.ParticleLife.snapshot(engine), so the
    // shared SVG export helpers work transparently across backends.
    // Expensive (one mapAsync round-trip ~1-2 frames latency) so download
    // buttons should await it once on click, not poll in a loop.
    async function readParticles() {
      const n = config.count;
      const bytes = PARTICLE_STRIDE * n;
      const staging = device.createBuffer({
        label: 'particleReadback',
        size: bytes,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      });
      try {
        const enc = device.createCommandEncoder({ label: 'snapshot' });
        enc.copyBufferToBuffer(particleBufferA, 0, staging, 0, bytes);
        device.queue.submit([enc.finish()]);
        await staging.mapAsync(GPUMapMode.READ);
        const raw = new Float32Array(staging.getMappedRange().slice(0));
        staging.unmap();
        const out = new Array(n);
        for (let i = 0; i < n; i++) {
          out[i] = {
            x: raw[i * 5],
            y: raw[i * 5 + 1],
            vx: raw[i * 5 + 2],
            vy: raw[i * 5 + 3],
            s: raw[i * 5 + 4] | 0,
          };
        }
        return out;
      } finally {
        staging.destroy();
      }
    }

    return {
      destroy,
      setPalette, setPreset, setSpecies, setBgFade, setCount,
      setPointSize, setGlow, setForce, setRMax,
      disturb,
      setShowFps, getFps, setSimSpeed, setCameraZoom, setShowGlow,
      // Stats-panel control surface — live-tunable engine internals
      setFriction, setRepel, setGlowSize, setGlowIntensity, setGlowSteepness,
      setParticleOpacity, setSeedPattern, respawn,
      readParticles,                   // async — for SVG / vector export
      pause(v) { config.paused = !!v; },
      get size() { return { W, H }; },
      get config() { return config; },
      get particles() { return []; },   // GPU-resident; use readParticles()
      get matrix() { return null; },
      get backend() { return 'webgpu'; },
    };
  }

  window.ParticleLifeGPU = { create, isSupported };

  // -------------------------------------------------------------------------
  // window.makeEngine — try-GPU-first async helper, used by every plate so
  // they all benefit from the spatial-hash + HDR pipeline. Falls back to the
  // canvas2D engine on any failure (no WebGPU, adapter fails, shader bug)
  // without the caller having to branch. Set opts.forceCPU = true to skip
  // GPU (useful for download / snapshot canvases that need pX/pY arrays).
  // -------------------------------------------------------------------------
  window.makeEngine = async function makeEngine(canvas, opts = {}) {
    const wantGPU = !opts.forceCPU && isSupported();
    if (wantGPU) {
      try {
        return await create(canvas, opts);
      } catch (err) {
        console.warn('[makeEngine] WebGPU init failed, falling back:', err);
      }
    }
    // CPU engine is sync; wrap in a Promise for a consistent return type.
    if (!window.ParticleLife || !window.ParticleLife.create) {
      throw new Error('No particle engine available');
    }
    return window.ParticleLife.create(canvas, opts);
  };
})();
