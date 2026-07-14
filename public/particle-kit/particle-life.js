// Particle Life — Hub & Spokes / Orbital / Cellular presets
// Exposes: window.ParticleLife = { create(canvas, opts) -> instance }
// instance: { destroy, setPalette, setPreset, setSpecies, disturb(x,y,r,strength) }

(function () {
  'use strict';

  // ---- Interaction matrices ----------------------------------------------------
  // Values in [-1, 1]. Positive = attract, Negative = repel.
  // Each preset returns an N×N matrix.
  function matrixHubSpokes(n) {
    // Species 0 is "hub": attracts all others. Others repel each other lightly.
    const m = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === 0 && j !== 0) m[i][j] = -0.3;       // hub repels spokes a little
        else if (j === 0 && i !== 0) m[i][j] = 0.9;   // spokes attracted to hub
        else if (i === j) m[i][j] = 0.5;              // self-cohesion
        else m[i][j] = -0.15 + 0.05 * ((i + j) % 3);  // spokes mildly avoid each other
      }
    }
    return m;
  }

  function matrixOrbital(n) {
    // Cyclic chain: i attracts i+1, repels i-1. Creates orbiting trains.
    const m = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = 0.4;
        else if (j === (i + 1) % n) m[i][j] = 0.85;
        else if (j === (i - 1 + n) % n) m[i][j] = -0.7;
        else m[i][j] = -0.05;
      }
    }
    return m;
  }

  function matrixCellular(n) {
    // Strong self-attraction, mild cross-species attraction → soft blobs / cells.
    const m = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = 0.85;
        else {
          // alternate attract/repel by parity for membrane-like edges
          const parity = ((i + j) % 2 === 0) ? 1 : -1;
          m[i][j] = parity * (0.15 + 0.1 * Math.abs(i - j) / n);
        }
      }
    }
    return m;
  }

  // Legacy 3 — kept so existing call sites still work even if PLRules
  // hasn't loaded yet (defensive).
  const LEGACY_PRESETS = {
    'hub-spokes': matrixHubSpokes,
    'orbital': matrixOrbital,
    'cellular': matrixCellular,
  };

  // Unified preset dispatcher — looks up window.PLRules (shared with GPU
  // engine, 15+ sandbox ports), reshapes the flat array into the 2D matrix
  // this engine's hot loop uses. Falls back to legacy on any miss.
  // 'auto' picks a random "alive-feeling" preset per call.
  function getPresetMatrix(name, n) {
    const rules = window.PLRules;
    if (rules) {
      const actualName = (name === 'auto') ? rules.pickAlive() : name;
      if (rules.PRESETS[actualName]) {
        const flat = rules.get(actualName, n);
        const m = new Array(n);
        for (let i = 0; i < n; i++) {
          const row = new Array(n);
          for (let j = 0; j < n; j++) row[j] = flat[i * n + j];
          m[i] = row;
        }
        return m;
      }
    }
    const fn = LEGACY_PRESETS[name] || LEGACY_PRESETS.cellular;
    return fn(n);
  }

  // Compat shim — old code reads PRESETS[name](n).
  const PRESETS = new Proxy(LEGACY_PRESETS, {
    get(target, key) {
      if (key in target) return (n) => getPresetMatrix(key, n);
      // For new names (chains1, snake, rps...) return a synthesizer.
      if (typeof key === 'string') return (n) => getPresetMatrix(key, n);
      return undefined;
    },
    has(target, key) {
      if (key in target) return true;
      const rules = window.PLRules;
      return !!(rules && (key === 'auto' || rules.PRESETS[key]));
    },
  });

  // ---- Engine -----------------------------------------------------------------
  function create(canvas, opts = {}) {
    // Renderer selection: opts.webgl=true tries WebGL2 instanced rendering
    // (handles 20k-50k particles at 60fps with soft glow sprites); on failure
    // or by default, falls back to canvas2D. Only ONE context can be created
    // per canvas, so this is decided up front.
    const wantsGL = opts.webgl === true;
    let ctx = null;
    let gl = null;
    let glState = null;
    if (wantsGL) {
      gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true, // trails — we composite over prev frame
      });
    }
    if (!gl) {
      ctx = canvas.getContext('2d', { alpha: true });
    }
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const config = {
      species: opts.species ?? 5,
      count: opts.count ?? 1400,
      preset: opts.preset ?? 'hub-spokes',
      rMax: opts.rMax ?? 80,        // interaction radius (CSS px)
      friction: opts.friction ?? 0.86,
      forceFactor: opts.forceFactor ?? 1.6,
      dt: opts.dt ?? 0.018,
      palette: opts.palette ?? ['#7CC8F2', '#3E8FE0', '#1B3FA8', '#E8E8E8', '#0F1530'],
      bgFade: opts.bgFade ?? 'rgba(10,10,12,0.18)',  // trail fade
      pointSize: opts.pointSize ?? 1.4,
      glow: opts.glow ?? 0.35,
      paused: false,
      mouseRepel: opts.mouseRepel ?? 1.0,
      // Initial layout — see seedByPattern() below.
      seedPattern: opts.seedPattern || 'random',
      // Show engine-builtin FPS overlay (positioned over the canvas's parent).
      // Default false; Hero opts in, other plates leave hidden.
      showFps: opts.showFps ?? false,
      // Slow-motion multiplier on the per-frame integration step. 0.5 = sim
      // evolves at half speed but render stays at full FPS.
      simSpeed: opts.simSpeed ?? 1.0,
    };

    let W = 0, H = 0;

    // ---- Particle storage (Structure-of-Arrays / typed) -------------------
    // Each particle's (x,y,vx,vy,s) used to be an object; that meant every
    // hot-loop access went through V8 hidden-class lookups + GC pressure.
    // SoA + typed arrays gives cache-friendly memory + JIT-friendly numeric
    // hot loops. Allocated once at the max count we expect and reused.
    let pX = null, pY = null, pVX = null, pVY = null;
    let pS = null;                  // Uint8Array — species index per particle
    let pCount = 0;
    function allocParticleStorage(n) {
      pX = new Float32Array(n);
      pY = new Float32Array(n);
      pVX = new Float32Array(n);
      pVY = new Float32Array(n);
      pS = new Uint8Array(n);
      pCount = n;
    }

    let matrix = PRESETS[config.preset](config.species);
    // Flat copy of matrix for hot-loop lookup. matrixFlat[a*species + b] = matrix[a][b].
    // Rebuilt whenever preset or species changes (setPreset / setSpecies).
    let matrixFlat = (() => {
      const n = config.species;
      const out = new Float32Array(n * n);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[i * n + j] = matrix[i][j];
      return out;
    })();
    function rebuildMatrixFlat() {
      const n = config.species;
      matrixFlat = new Float32Array(n * n);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) matrixFlat[i * n + j] = matrix[i][j];
    }

    // ---- Counting-sort spatial grid (SandboxScience-style binning) --------
    // Replaces the per-frame array-of-arrays push pattern (which allocates
    // N empty arrays + grows them every frame). Three passes:
    //   1. count particles per cell  → cellCount
    //   2. exclusive prefix sum      → cellStart[c] = offset of cell c
    //   3. scatter indices           → pIndex[ cellStart[c] .. ) = particle ids
    // Neighbor iteration then reads a contiguous Int32Array slice — purely
    // sequential memory access, the GC never sees a fresh allocation.
    let cellStart = null;   // Int32Array(numCells + 1)
    let cellCount = null;   // Int32Array(numCells), scratch
    let pIndex = null;      // Int32Array(maxN), sorted by cell

    // mouse / disturbance
    let mouse = { x: -9999, y: -9999, active: false, strength: 1.0, radius: 120 };
    let disturbances = []; // transient extra impulses

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (glState) glState.resolution = [W, H, dpr];
      }
    }

    // ---- Initial layouts (SandboxScience-style) ---------------------------
    // Each generator fills the typed-array buffers for n particles with a
    // distinct opening composition. Particle-life rules then evolve that
    // composition into emergent structures over the first few seconds, so
    // the same engine settings produce visibly different journeys on each
    // page load. Species assignment is pattern-aware — e.g. ring uses angle,
    // bands use the band index — so the structure is visible from frame 0.
    function seedByPattern(pattern, n) {
      const species = config.species;
      // Delegate to the shared PLSeeds registry (15+ ported sandbox patterns).
      // Adapter writes into the engine's SoA typed arrays.
      const seeds = window.PLSeeds;
      const write = (i, x, y, vx, vy, t) => {
        pX[i] = x;
        pY[i] = y;
        pVX[i] = vx;
        pVY[i] = vy;
        pS[i] = t;
      };
      if (!seeds) {
        // Defensive scatter if seeds file failed to load
        for (let i = 0; i < n; i++) write(i, Math.random() * W, Math.random() * H, 0, 0, i % species);
        return 'random';
      }
      const actualName = (pattern === 'auto' || !seeds.PATTERNS[pattern]) ? seeds.pickRandom() : pattern;
      seeds.run(actualName, write, n, species, W, H);
      return actualName;
    }

    function seedParticles(n) {
      allocParticleStorage(n);
      seedByPattern(config.seedPattern || 'random', n);
      // pIndex grows with pCount; cell arrays grow with grid size (per-frame).
      if (!pIndex || pIndex.length < n) pIndex = new Int32Array(n);
    }

    function setSpecies(n) {
      config.species = Math.max(2, Math.min(8, n | 0));
      matrix = PRESETS[config.preset](config.species);
      rebuildMatrixFlat();
      // re-stripe species
      const species = config.species;
      for (let i = 0; i < pCount; i++) pS[i] = i % species;
      if (gpu) gpu.rebuildSpecies();
    }

    function setPreset(name) {
      if (!PRESETS[name]) return;
      config.preset = name;
      matrix = PRESETS[name](config.species);
      rebuildMatrixFlat();
    }

    function setPalette(palette) {
      if (Array.isArray(palette) && palette.length >= 2) {
        config.palette = palette.slice();
        sprites = null; // invalidate sprite cache
      }
    }

    function setBgFade(v) { config.bgFade = v; }
    function setCount(n) {
      // canvas2D path: now feasible up to ~25-40k with the sprite cache.
      // GPU path (webgl/webgpu) goes higher; ceiling kept generous either way.
      config.count = Math.max(200, Math.min(120000, n | 0));
      seedParticles(config.count);
    }
    function setPointSize(v) { config.pointSize = v; sprites = null; }
    function setGlow(v) { config.glow = v; sprites = null; }
    function setForce(v) { config.forceFactor = v; }
    function setRMax(v) { config.rMax = v; }

    function disturb(x, y, radius = 140, strength = 6) {
      disturbances.push({ x, y, r: radius, s: strength, life: 1 });
    }

    // ---- GPU compute (WebGL2 ping-pong FBO, opt-in via opts.gpuCompute) ----
    // Runs the brute-force O(N²) particle-life force calc on the GPU in a
    // fragment shader, then reads positions back to pX / pY typed arrays.
    // The render path stays canvas2D drawImage(sprite) — so the visual is
    // bit-for-bit the existing engine. Only the step() body changes.
    //
    // State per particle is packed into a single RGBA32F texture:
    //     R = x, G = y, B = vx, A = vy
    // Two textures + FBOs ping-pong each frame. Species is a separate R8
    // texture written once at seed / setSpecies. Interaction matrix lives
    // in a uniform float array (max 64 entries = 8×8 species).
    let gpu = null;
    if (opts.gpuCompute === true && !ctx) {
      // ctx is canvas2D — gpuCompute needs canvas2D as the render target.
    }
    function initGpuCompute() {
      // Use an offscreen WebGL2 context (the visible canvas is canvas2D).
      const off = document.createElement('canvas');
      off.width = off.height = 4;
      const g = off.getContext('webgl2');
      if (!g) return null;
      if (!g.getExtension('EXT_color_buffer_float')) return null;
      g.getExtension('OES_texture_float_linear'); // optional

      // Texture dimension — square enough to hold pCount particles.
      const TEX_DIM = Math.max(4, Math.ceil(Math.sqrt(pCount)));
      const cap = TEX_DIM * TEX_DIM;

      // ---- Shader sources --------------------------------------------------
      const VS = `#version 300 es
        in vec2 aPos;
        void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

      // 100000 is the loop upper bound — GLSL ES requires a constant-bound
      // loop. Real loop terminates at uCount via the early break.
      const FS = `#version 300 es
        precision highp float;
        precision highp int;
        precision highp sampler2D;
        uniform sampler2D uState;     // RGBA32F: x, y, vx, vy
        uniform sampler2D uSpec;      // R8:      species
        uniform float uMatrix[64];    // up to 8×8 species interaction
        uniform float uW, uH;
        uniform float uRMax;
        uniform float uForceFactor;
        uniform float uFriction;
        uniform float uDt;
        uniform int uCount;
        uniform int uTexDim;
        uniform int uSpeciesN;
        uniform vec4 uMouse;          // x, y, strength, radius
        uniform vec4 uDisturb;        // x, y, radius, strength
        out vec4 outState;

        void main() {
          int x = int(gl_FragCoord.x);
          int y = int(gl_FragCoord.y);
          int i = y * uTexDim + x;
          if (i >= uCount) { outState = vec4(0.0); return; }

          vec4 self = texelFetch(uState, ivec2(x, y), 0);
          vec2 pos = self.xy;
          vec2 vel = self.zw;
          int spec = int(texelFetch(uSpec, ivec2(x, y), 0).r * 255.0 + 0.5);

          vec2 force = vec2(0.0);
          float rMax = uRMax;
          float r2 = rMax * rMax;
          float invR = 1.0 / rMax;
          float beta = 0.3;
          float invBeta = 1.0 / beta;
          float invOmB = 1.0 / (1.0 - beta);
          int speciesN = uSpeciesN;
          int speciesRow = spec * speciesN;

          for (int j = 0; j < 100000; j++) {
            if (j >= uCount) break;
            if (j == i) continue;
            int jx = j % uTexDim;
            int jy = j / uTexDim;
            vec4 other = texelFetch(uState, ivec2(jx, jy), 0);
            vec2 d = other.xy - pos;
            float d2 = dot(d, d);
            if (d2 > r2 || d2 < 0.0001) continue;
            float dist = sqrt(d2);
            float t = dist * invR;
            float f;
            if (t < beta) {
              f = t * invBeta - 1.0;
            } else {
              int jspec = int(texelFetch(uSpec, ivec2(jx, jy), 0).r * 255.0 + 0.5);
              f = uMatrix[speciesRow + jspec] * (1.0 - abs(2.0 * t - 1.0 - beta) * invOmB);
            }
            force += d * (f / dist);
          }

          // Mouse repel
          if (uMouse.z > 0.0) {
            vec2 dm = pos - uMouse.xy;
            float dm2 = dot(dm, dm);
            float mr = uMouse.w;
            if (dm2 < mr * mr && dm2 > 0.01) {
              float dmd = sqrt(dm2);
              float f = (1.0 - dmd / mr) * 6.0 * uMouse.z;
              force += dm * (f / dmd);
            }
          }
          // Disturb impulse
          if (uDisturb.w > 0.0) {
            vec2 dd = pos - uDisturb.xy;
            float dd2 = dot(dd, dd);
            float dr = uDisturb.z;
            if (dd2 < dr * dr && dd2 > 0.01) {
              float ddd = sqrt(dd2);
              float f = (1.0 - ddd / dr) * uDisturb.w;
              force += dd * (f / ddd);
            }
          }

          vec2 newVel = (vel + force * uForceFactor * uDt) * uFriction;
          vec2 newPos = pos + newVel;
          if (newPos.x < 0.0) newPos.x += uW;
          else if (newPos.x >= uW) newPos.x -= uW;
          if (newPos.y < 0.0) newPos.y += uH;
          else if (newPos.y >= uH) newPos.y -= uH;

          outState = vec4(newPos, newVel);
        }`;

      function compile(type, src) {
        const sh = g.createShader(type);
        g.shaderSource(sh, src);
        g.compileShader(sh);
        if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) {
          console.warn('shader:', g.getShaderInfoLog(sh));
          return null;
        }
        return sh;
      }
      const vs = compile(g.VERTEX_SHADER, VS);
      const fs = compile(g.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return null;
      const prog = g.createProgram();
      g.attachShader(prog, vs);
      g.attachShader(prog, fs);
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
        console.warn('prog:', g.getProgramInfoLog(prog));
        return null;
      }

      // Fullscreen quad
      const quadVAO = g.createVertexArray();
      g.bindVertexArray(quadVAO);
      const quadBuf = g.createBuffer();
      g.bindBuffer(g.ARRAY_BUFFER, quadBuf);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([
        -1, -1,  1, -1,  -1, 1,
        -1, 1,  1, -1,  1, 1,
      ]), g.STATIC_DRAW);
      const aPos = g.getAttribLocation(prog, 'aPos');
      g.enableVertexAttribArray(aPos);
      g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0);
      g.bindVertexArray(null);

      function makeFloatTex(w, h, initData) {
        const t = g.createTexture();
        g.bindTexture(g.TEXTURE_2D, t);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA32F, w, h, 0, g.RGBA, g.FLOAT, initData);
        return t;
      }
      function makeU8Tex(w, h, initData) {
        const t = g.createTexture();
        g.bindTexture(g.TEXTURE_2D, t);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        g.texImage2D(g.TEXTURE_2D, 0, g.R8, w, h, 0, g.RED, g.UNSIGNED_BYTE, initData);
        return t;
      }
      function makeFBO(tex) {
        const f = g.createFramebuffer();
        g.bindFramebuffer(g.FRAMEBUFFER, f);
        g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
        return f;
      }

      // Initial state from CPU-seeded pX/pY/pVX/pVY
      const stateInit = new Float32Array(cap * 4);
      for (let i = 0; i < pCount; i++) {
        stateInit[i * 4 + 0] = pX[i];
        stateInit[i * 4 + 1] = pY[i];
        stateInit[i * 4 + 2] = pVX[i];
        stateInit[i * 4 + 3] = pVY[i];
      }
      const specInit = new Uint8Array(cap);
      for (let i = 0; i < pCount; i++) specInit[i] = pS[i];

      let texA = makeFloatTex(TEX_DIM, TEX_DIM, stateInit);
      let texB = makeFloatTex(TEX_DIM, TEX_DIM, null);
      let specTex = makeU8Tex(TEX_DIM, TEX_DIM, specInit);
      let fboA = makeFBO(texA);
      let fboB = makeFBO(texB);

      // Uniforms
      const uState = g.getUniformLocation(prog, 'uState');
      const uSpec = g.getUniformLocation(prog, 'uSpec');
      const uMatrix = g.getUniformLocation(prog, 'uMatrix');
      const uW = g.getUniformLocation(prog, 'uW');
      const uH = g.getUniformLocation(prog, 'uH');
      const uRMax = g.getUniformLocation(prog, 'uRMax');
      const uForceFactor = g.getUniformLocation(prog, 'uForceFactor');
      const uFriction = g.getUniformLocation(prog, 'uFriction');
      const uDt = g.getUniformLocation(prog, 'uDt');
      const uCount = g.getUniformLocation(prog, 'uCount');
      const uTexDim = g.getUniformLocation(prog, 'uTexDim');
      const uSpeciesN = g.getUniformLocation(prog, 'uSpeciesN');
      const uMouseU = g.getUniformLocation(prog, 'uMouse');
      const uDisturbU = g.getUniformLocation(prog, 'uDisturb');

      // Matrix uniform buffer — padded to 64 floats (8×8 max)
      const matrixPadded = new Float32Array(64);

      let ping = 0;
      const readBuf = new Float32Array(cap * 4);

      function rebuildSpecies() {
        const data = new Uint8Array(cap);
        for (let i = 0; i < pCount; i++) data[i] = pS[i];
        g.bindTexture(g.TEXTURE_2D, specTex);
        g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, TEX_DIM, TEX_DIM, g.RED, g.UNSIGNED_BYTE, data);
      }
      function uploadInitialState() {
        const data = new Float32Array(cap * 4);
        for (let i = 0; i < pCount; i++) {
          data[i * 4 + 0] = pX[i];
          data[i * 4 + 1] = pY[i];
          data[i * 4 + 2] = pVX[i];
          data[i * 4 + 3] = pVY[i];
        }
        g.bindTexture(g.TEXTURE_2D, texA);
        g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, TEX_DIM, TEX_DIM, g.RGBA, g.FLOAT, data);
        ping = 0;
      }

      function stepGPU() {
        const readTex = ping === 0 ? texA : texB;
        const writeFbo = ping === 0 ? fboB : fboA;
        const writeTex = ping === 0 ? texB : texA;

        g.useProgram(prog);
        g.bindFramebuffer(g.FRAMEBUFFER, writeFbo);
        g.viewport(0, 0, TEX_DIM, TEX_DIM);

        // Bind input textures
        g.activeTexture(g.TEXTURE0);
        g.bindTexture(g.TEXTURE_2D, readTex);
        g.uniform1i(uState, 0);
        g.activeTexture(g.TEXTURE1);
        g.bindTexture(g.TEXTURE_2D, specTex);
        g.uniform1i(uSpec, 1);

        // Matrix flat into padded buffer
        const sN = config.species;
        matrixPadded.fill(0);
        for (let a = 0; a < sN; a++) for (let b = 0; b < sN; b++) {
          matrixPadded[a * sN + b] = matrixFlat[a * sN + b];
        }
        g.uniform1fv(uMatrix, matrixPadded);

        g.uniform1f(uW, W);
        g.uniform1f(uH, H);
        g.uniform1f(uRMax, config.rMax);
        g.uniform1f(uForceFactor, config.forceFactor);
        g.uniform1f(uFriction, config.friction);
        g.uniform1f(uDt, config.dt * (config.simSpeed ?? 1.0));
        g.uniform1i(uCount, pCount);
        g.uniform1i(uTexDim, TEX_DIM);
        g.uniform1i(uSpeciesN, sN);
        // Mouse
        g.uniform4f(uMouseU,
          mouse.x, mouse.y,
          (mouse.active ? config.mouseRepel * mouse.strength : 0),
          mouse.radius);
        // Disturb — use first active disturbance only (gpu shader keeps it simple)
        const d0 = disturbances[0];
        if (d0) {
          g.uniform4f(uDisturbU, d0.x, d0.y, d0.r, d0.s * d0.life);
        } else {
          g.uniform4f(uDisturbU, 0, 0, 0, 0);
        }

        g.bindVertexArray(quadVAO);
        g.drawArrays(g.TRIANGLES, 0, 6);
        g.bindVertexArray(null);

        // Read back positions into pX/pY (also pVX/pVY for completeness)
        g.bindFramebuffer(g.FRAMEBUFFER, writeFbo);
        g.readPixels(0, 0, TEX_DIM, TEX_DIM, g.RGBA, g.FLOAT, readBuf);
        for (let i = 0; i < pCount; i++) {
          pX[i] = readBuf[i * 4 + 0];
          pY[i] = readBuf[i * 4 + 1];
          pVX[i] = readBuf[i * 4 + 2];
          pVY[i] = readBuf[i * 4 + 3];
        }

        // Decay disturbances (CPU side — small, untyped, same as CPU step)
        for (let k = disturbances.length - 1; k >= 0; k--) {
          disturbances[k].life *= 0.92;
          if (disturbances[k].life < 0.05) disturbances.splice(k, 1);
        }

        ping = 1 - ping;
      }

      function destroyGPU() {
        try {
          g.deleteTexture(texA);
          g.deleteTexture(texB);
          g.deleteTexture(specTex);
          g.deleteFramebuffer(fboA);
          g.deleteFramebuffer(fboB);
          g.deleteBuffer(quadBuf);
          g.deleteVertexArray(quadVAO);
          g.deleteProgram(prog);
          g.deleteShader(vs);
          g.deleteShader(fs);
          const lose = g.getExtension('WEBGL_lose_context');
          if (lose) lose.loseContext();
        } catch (_) {}
      }

      return {
        step: stepGPU,
        destroy: destroyGPU,
        rebuildSpecies,
        uploadInitialState,
        TEX_DIM,
      };
    }

    // GPU init is deferred until after seedParticles runs in the boot block
    // below — initGpuCompute() reads pX/pY/pVX/pVY/pS so storage has to exist.

    function step() {
      if (gpu) { gpu.step(); return; }
      // ---- CPU fallback (unchanged) ------------------------------------
      const r = config.rMax;
      const r2 = r * r;
      const ff = config.forceFactor;
      const dt = config.dt * (config.simSpeed ?? 1.0);
      const fr = config.friction;
      const speciesN = config.species;
      const matFlat = matrixFlat;
      const len = pCount;
      const invCellSize = 1 / r;
      const cellSize = r;

      const cols = Math.max(1, Math.ceil(W * invCellSize));
      const rows = Math.max(1, Math.ceil(H * invCellSize));
      const numCells = cols * rows;

      // ---- Counting-sort bin pass --------------------------------------
      if (!cellStart || cellStart.length !== numCells + 1) {
        cellStart = new Int32Array(numCells + 1);
        cellCount = new Int32Array(numCells);
      } else {
        cellCount.fill(0);
      }
      // Pass 1: count per cell
      for (let i = 0; i < len; i++) {
        let cx = (pX[i] * invCellSize) | 0;
        let cy = (pY[i] * invCellSize) | 0;
        if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
        if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
        cellCount[cy * cols + cx]++;
      }
      // Pass 2: exclusive prefix sum
      let acc = 0;
      for (let c = 0; c < numCells; c++) {
        cellStart[c] = acc;
        acc += cellCount[c];
        cellCount[c] = 0; // reset; reused as scatter cursor
      }
      cellStart[numCells] = acc;
      // Pass 3: scatter
      for (let i = 0; i < len; i++) {
        let cx = (pX[i] * invCellSize) | 0;
        let cy = (pY[i] * invCellSize) | 0;
        if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
        if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
        const c = cy * cols + cx;
        pIndex[cellStart[c] + cellCount[c]++] = i;
      }

      // ---- Force-curve constants (hoisted) -----------------------------
      const beta = 0.3;
      const invBeta = 1 / beta;
      const invR = 1 / r;
      const invOneMinusBeta = 1 / (1 - beta);

      // ---- Per-particle force accumulation + velocity update -----------
      const mouseActive = mouse.active && config.mouseRepel > 0;
      const mouseR = mouse.radius;
      const mouseR2 = mouseR * mouseR;
      const mouseFactor = 6 * config.mouseRepel * mouse.strength;
      const distCount = disturbances.length;

      for (let i = 0; i < len; i++) {
        const pxi = pX[i];
        const pyi = pY[i];
        const psi = pS[i];
        let fx = 0, fy = 0;
        let cx = (pxi * invCellSize) | 0;
        let cy = (pyi * invCellSize) | 0;
        if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
        if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
        const pSpeciesRow = psi * speciesN;

        // Pre-compute neighbor cell range (avoid per-iter bounds check)
        const oxMin = cx > 0 ? -1 : 0;
        const oxMax = cx < cols - 1 ? 1 : 0;
        const oyMin = cy > 0 ? -1 : 0;
        const oyMax = cy < rows - 1 ? 1 : 0;

        for (let oy = oyMin; oy <= oyMax; oy++) {
          const rowBase = (cy + oy) * cols;
          for (let ox = oxMin; ox <= oxMax; ox++) {
            const c = rowBase + cx + ox;
            const startC = cellStart[c];
            const endC = cellStart[c + 1];
            for (let k = startC; k < endC; k++) {
              const j = pIndex[k];
              if (j === i) continue;
              const dx = pX[j] - pxi;
              const dy = pY[j] - pyi;
              const d2 = dx * dx + dy * dy;
              if (d2 > r2 || d2 < 0.0001) continue;
              const d = Math.sqrt(d2);
              const t = d * invR;
              let f;
              if (t < beta) {
                f = t * invBeta - 1;
              } else {
                f = matFlat[pSpeciesRow + pS[j]] * (1 - Math.abs(2 * t - 1 - beta) * invOneMinusBeta);
              }
              const invD = 1 / d;
              fx += dx * invD * f;
              fy += dy * invD * f;
            }
          }
        }

        // Mouse repel
        if (mouseActive) {
          const dx = pxi - mouse.x;
          const dy = pyi - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < mouseR2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / mouseR) * mouseFactor;
            const invD = 1 / d;
            fx += dx * invD * f;
            fy += dy * invD * f;
          }
        }

        // Transient disturbances (small N, untyped)
        for (let k = 0; k < distCount; k++) {
          const d0 = disturbances[k];
          const dx = pxi - d0.x;
          const dy = pyi - d0.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < d0.r * d0.r && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / d0.r) * d0.s * d0.life;
            const invD = 1 / d;
            fx += dx * invD * f;
            fy += dy * invD * f;
          }
        }

        pVX[i] = (pVX[i] + fx * ff * dt) * fr;
        pVY[i] = (pVY[i] + fy * ff * dt) * fr;
      }

      // ---- Integrate + wrap (tight typed-array loop) -------------------
      for (let i = 0; i < len; i++) {
        let x = pX[i] + pVX[i];
        let y = pY[i] + pVY[i];
        if (x < 0) x += W; else if (x >= W) x -= W;
        if (y < 0) y += H; else if (y >= H) y -= H;
        pX[i] = x;
        pY[i] = y;
      }

      // Decay disturbances
      for (let k = disturbances.length - 1; k >= 0; k--) {
        disturbances[k].life *= 0.92;
        if (disturbances[k].life < 0.05) disturbances.splice(k, 1);
      }
    }

    // ---- Sprite cache (SandboxScience-inspired) ----------------------------
    // The visual is identical to the old per-particle arc+fill+arc+fill path,
    // but each species' (halo + core) compound is pre-rendered once into a
    // small offscreen canvas, then drawn per particle via a single drawImage.
    // Net: ~38k arc+fill ops/frame → ~19k drawImage ops/frame, with no
    // beginPath / fillStyle / globalAlpha churn inside the hot loop.
    // Invalidated whenever palette, pointSize, or glow changes.
    let sprites = null;       // array<HTMLCanvasElement>, one per species
    let spriteHalf = 0;       // half-side of the cached sprite (CSS px)

    // SS = supersample factor for the sprite cache. At small pointSize
    // (≤1.5), an 8×8 sprite has only a ~2px-radius core, which canvas2D
    // anti-aliases into a visible square at draw time. Rendering the sprite
    // at SS× more pixels and letting drawImage downsample gives smooth
    // round dots at any size with zero hot-loop cost.
    const SPRITE_SS = 4;
    let spriteDrawSize = 0;   // CSS-px size for drawImage destination

    function rebuildSprites() {
      const ps = config.pointSize;
      const glow = config.glow;
      const haloR = ps * 2.4;
      const half = Math.max(2, Math.ceil(haloR) + 1);
      spriteHalf = half;
      const size = half * 2;
      spriteDrawSize = size;
      const sizeSS = size * SPRITE_SS;
      sprites = config.palette.map(color => {
        const off = document.createElement('canvas');
        off.width = off.height = sizeSS;
        const c = off.getContext('2d');
        // Supersample: scale up the drawing matrix so circle radii (in CSS-px)
        // map to SS× pixels in the backing canvas. drawImage later downsamples
        // with image smoothing for smooth round particles.
        c.scale(SPRITE_SS, SPRITE_SS);
        // 'lighter' INSIDE the sprite mirrors the original per-particle path
        // where halo and core were drawn with composite='lighter' onto canvas.
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = color;
        if (glow > 0) {
          c.globalAlpha = glow * 0.4;
          c.beginPath();
          c.arc(half, half, haloR, 0, 6.283);
          c.fill();
        }
        c.globalAlpha = 1.0;
        c.beginPath();
        c.arc(half, half, ps, 0, 6.283);
        c.fill();
        return off;
      });
    }

    function render() {
      // soft trail fade
      ctx.fillStyle = config.bgFade;
      ctx.fillRect(0, 0, W, H);

      if (!sprites || sprites.length !== config.palette.length) rebuildSprites();

      ctx.globalCompositeOperation = 'lighter';
      // Enable smoothing so the SS-times-supersampled sprite downsamples
      // cleanly into round dots instead of aliasing into squares.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const numColors = sprites.length;
      const half = spriteHalf;
      const dSize = spriteDrawSize;
      const len = pCount;
      // Hot loop: 5-arg drawImage scales the supersampled sprite back down
      // to the intended CSS-px footprint each call.
      for (let i = 0; i < len; i++) {
        ctx.drawImage(sprites[pS[i] % numColors], pX[i] - half, pY[i] - half, dSize, dSize);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
    }

    // FPS tracking shared with the GPU engine surface so callers can swap
    // backends without conditional code. Overlay creation is lazy and the
    // default is hidden — only Hero opts in.
    let raf = 0;
    let _prevTs = 0;
    let _fps = 60;
    let _fpsLastDisplay = 0;
    let _fpsOverlay = null;
    function _ensureFpsOverlay() {
      if (_fpsOverlay) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const existing = parent.querySelector('.pl-fps-overlay');
      if (existing) { _fpsOverlay = existing; return; }
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
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      parent.appendChild(el);
      _fpsOverlay = el;
    }
    function _removeFpsOverlay() {
      if (_fpsOverlay && _fpsOverlay.parentNode) _fpsOverlay.parentNode.removeChild(_fpsOverlay);
      _fpsOverlay = null;
    }

    function loop(ts) {
      if (_prevTs) {
        const real = (ts - _prevTs) / 1000;
        const inst = 1 / Math.max(0.001, real);
        _fps = _fps * 0.92 + inst * 0.08;
      }
      _prevTs = ts;
      if (config.showFps) {
        if (!_fpsOverlay) _ensureFpsOverlay();
        if (_fpsOverlay && ts - _fpsLastDisplay > 200) {
          _fpsLastDisplay = ts;
          const backend = gpu ? 'webgl2' : 'cpu';
          _fpsOverlay.textContent = `${_fps.toFixed(0)} fps · ${pCount.toLocaleString()} · ${backend}`;
        }
      }
      if (!config.paused) {
        step();
        render();
      }
      raf = requestAnimationFrame(loop);
    }

    // events
    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() { mouse.active = false; mouse.x = -9999; mouse.y = -9999; }
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      disturb(e.clientX - rect.left, e.clientY - rect.top, 200, 14);
    }
    function onResize() { resize(); }

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    // boot
    resize();
    seedParticles(config.count);

    // GPU compute opt-in — initialized AFTER seedParticles so pX/pY/pVX/pVY/pS
    // are populated. Silently falls back to CPU if WebGL2 / EXT_color_buffer_float
    // isn't available.
    if (opts.gpuCompute === true) {
      try { gpu = initGpuCompute(); }
      catch (e) { console.warn('[ParticleLife] GPU compute init failed:', e); gpu = null; }
    }

    raf = requestAnimationFrame(loop);

    return {
      // Which compute path actually ran: 'webgl2-compute' if GPU init
      // succeeded, 'canvas2d' otherwise (CPU step on canvas2D render).
      backend: gpu ? 'webgl2-compute' : 'canvas2d',
      destroy() {
        cancelAnimationFrame(raf);
        canvas.removeEventListener('mousemove', onMove);
        canvas.removeEventListener('mouseleave', onLeave);
        canvas.removeEventListener('click', onClick);
        window.removeEventListener('resize', onResize);
        _removeFpsOverlay();
        if (gpu) gpu.destroy();
      },
      setPalette, setPreset, setSpecies, setBgFade, setCount,
      setPointSize, setGlow, setForce, setRMax,
      disturb,
      pause(v) { config.paused = !!v; },
      setMouseRepel(v) { config.mouseRepel = v; mouse.strength = v; },
      setMouseRadius(v) { mouse.radius = v; },
      setShowFps(v) {
        config.showFps = !!v;
        if (config.showFps) _ensureFpsOverlay();
        else _removeFpsOverlay();
      },
      getFps() { return _fps; },
      setSimSpeed(v) { config.simSpeed = Math.max(0.05, Math.min(4, v)); },
      // Async readback so callers can await regardless of backend (CPU
      // returns synchronously inside the Promise).
      async readParticles() {
        const out = new Array(pCount);
        for (let i = 0; i < pCount; i++) {
          out[i] = { x: pX[i], y: pY[i], vx: pVX[i], vy: pVY[i], s: pS[i] };
        }
        return out;
      },
      get config() { return config; },
      // Snapshot path — typed arrays are the source of truth; this getter
      // synthesizes the legacy {x,y,vx,vy,s} array so existing callers
      // (snapshot, SVG download) keep working unchanged.
      get particles() {
        const out = new Array(pCount);
        for (let i = 0; i < pCount; i++) {
          out[i] = { x: pX[i], y: pY[i], vx: pVX[i], vy: pVY[i], s: pS[i] };
        }
        return out;
      },
      // Direct typed-array views (fastest path for callers that can use them)
      get particleArrays() { return { pX, pY, pVX, pVY, pS, count: pCount }; },
      get matrix() { return matrix; },
      get size() { return { W, H }; },
    };
  }

  // ---- Static specimen data pipeline ------------------------------------------
  // formation: 'cell' | 'orbit' | 'binary' | 'spiral' | 'cluster' | 'lattice' | 'nebula' | 'chain'
  //
  // The data layer: specimenPoints(opts, W, H) returns Array<{x,y,r,color,alpha,halo,haloR}>.
  // Output adapters consume that array:
  //   - specimen(canvas, opts)         → paint on a <canvas>
  //   - specimenSVG(opts, size)        → return an <svg> string for download / print
  //   - snapshot(engine)               → grab current particle positions from a LIVE engine
  //   - snapshotSVG(engine, size)      → live engine → SVG string
  //
  // Everything shares the same coordinate system (0..W, 0..H, top-left origin).

  function makeSpecimenRng(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function specimenPoints(opts = {}, W = 400, H = 400) {
    const palette = opts.palette || ['#7CC8F2', '#3E8FE0', '#1B3FA8'];
    const seed = opts.seed ?? 1;
    const count = opts.count ?? 800;
    const spread = opts.spread ?? 0.45;
    const formation = opts.formation || 'cell';
    const dotMin = opts.dotMin ?? 0.6;
    const dotMax = opts.dotMax ?? 1.4;
    const haloRate = opts.haloRate ?? 0.04;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * spread;
    const rng = makeSpecimenRng(seed);

    function place(i) {
      const u1 = Math.max(1e-6, rng());
      const u2 = rng();
      const a = 2 * Math.PI * u2;
      const g = Math.sqrt(-2 * Math.log(u1));
      switch (formation) {
        case 'orbit': {
          if (rng() < 0.7) {
            const rr = radius * (0.78 + rng() * 0.18);
            return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
          }
          const rr = g * radius * 0.18;
          return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
        }
        case 'binary': {
          const which = rng() < 0.5 ? -1 : 1;
          const off = which * radius * 0.42;
          const rr = g * radius * 0.32;
          return [cx + off + rr * Math.cos(a), cy + rr * Math.sin(a)];
        }
        case 'spiral': {
          const t = i / count;
          const ang = a + t * Math.PI * 6;
          const rr = radius * (0.15 + t * 0.85) + g * radius * 0.04;
          return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
        }
        case 'cluster': {
          const nuclei = 4;
          const k = (i + (seed | 0)) % nuclei;
          const ka = (k / nuclei) * Math.PI * 2 + (seed % 7) * 0.3;
          const cxk = cx + Math.cos(ka) * radius * 0.45;
          const cyk = cy + Math.sin(ka) * radius * 0.45;
          const rr = g * radius * 0.22;
          return [cxk + rr * Math.cos(a), cyk + rr * Math.sin(a)];
        }
        case 'lattice': {
          const cells = 7;
          const gx = (i % cells) - (cells - 1) / 2;
          const gy = (Math.floor(i / cells) % cells) - (cells - 1) / 2;
          const j = (rng() - 0.5) * radius * 0.12;
          const j2 = (rng() - 0.5) * radius * 0.12;
          return [cx + gx * radius * 0.22 + j, cy + gy * radius * 0.22 + j2];
        }
        case 'nebula': {
          const off = radius * 0.18;
          const rr = g * radius * 0.55;
          return [cx + off + rr * Math.cos(a), cy - off * 0.4 + rr * Math.sin(a)];
        }
        case 'chain': {
          const t = i / count;
          const x = cx + (t - 0.5) * radius * 1.7;
          const y = cy + Math.sin(t * Math.PI * 4 + (seed % 5)) * radius * 0.3
                   + (rng() - 0.5) * radius * 0.08;
          return [x, y];
        }
        case 'cell':
        default: {
          const rr = g * radius * 0.42;
          if (rng() < 0.08) {
            const ringR = radius * (0.72 + rng() * 0.36);
            return [cx + ringR * Math.cos(a), cy + ringR * Math.sin(a)];
          }
          return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
        }
      }
    }

    const points = new Array(count);
    for (let i = 0; i < count; i++) {
      const [x, y] = place(i);
      const color = palette[(i + (seed | 0)) % palette.length];
      const r = dotMin + rng() * (dotMax - dotMin);
      const halo = rng() < haloRate;
      const haloR = halo ? 2 + rng() * 3 : 0;
      points[i] = { x, y, r, color, alpha: 0.6, halo, haloR };
    }
    return points;
  }

  function paintPoints(ctx, points, opts = {}) {
    if (opts.bg) {
      const { W, H } = opts;
      ctx.fillStyle = opts.bg; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = opts.composite || 'lighter';
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
      if (p.halo) {
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.haloR, 0, 6.283);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function pointsToSVG(points, W, H, opts = {}) {
    const bg = opts.bg
      ? `<rect width="${W}" height="${H}" fill="${opts.bg}"/>`
      : '';
    // composite='lighter' isn't a thing in SVG; the dense dots already read additive enough.
    const halos = [];
    const dots = [];
    for (const p of points) {
      if (p.halo) {
        halos.push(
          `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${p.haloR.toFixed(2)}" fill="${p.color}" fill-opacity="0.22"/>`
        );
      }
      dots.push(
        `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${p.r.toFixed(2)}" fill="${p.color}" fill-opacity="${p.alpha.toFixed(2)}"/>`
      );
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${bg}${halos.join('')}${dots.join('')}</svg>`;
  }

  // canvas output adapter
  function specimen(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const W = Math.floor(rect.width);
    const H = Math.floor(rect.height);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const points = specimenPoints(opts, W, H);
    paintPoints(ctx, points, { W, H, bg: opts.bg });
    return points;
  }

  // svg output adapter (same opts as specimen, optional size override)
  function specimenSVG(opts = {}, size) {
    const W = (opts.size && opts.size.W) || size || 400;
    const H = (opts.size && opts.size.H) || size || 400;
    const points = specimenPoints(opts, W, H);
    return pointsToSVG(points, W, H, { bg: opts.bg });
  }

  // live engine → point array
  function snapshot(engine, opts = {}) {
    const { W, H } = engine.size;
    const cfg = engine.config;
    const palette = cfg.palette;
    const r = opts.pointSize ?? cfg.pointSize ?? 1.3;
    const alpha = opts.alpha ?? 0.7;
    return engine.particles.map(p => ({
      x: p.x, y: p.y, r,
      color: palette[p.s % palette.length],
      alpha, halo: false, haloR: 0,
    }));
  }

  function snapshotSVG(engine, opts = {}) {
    const { W, H } = engine.size;
    const points = snapshot(engine, opts);
    return pointsToSVG(points, W, H, { bg: opts.bg });
  }

  // ---- Shared download helpers (centralized so every plate goes through here) -
  //   downloadSpecimenSVG: seed-based static specimen → svg file
  //   downloadEngineSVG:   live engine snapshot         → svg file
  //   downloadCanvasRaster: any canvas (live or static) → jpg/png file
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadSpecimenSVG(name, opts, size = 1200) {
    const svg = specimenSVG({ bg: '#0a0a0c', ...opts }, size);
    triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`);
  }

  function downloadEngineSVG(name, engine, opts = {}) {
    const svg = snapshotSVG(engine, { bg: '#0a0a0c', ...opts });
    triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`);
  }

  // Async variant — works on both CPU and GPU backends. GPU's particles are
  // resident on the device, so we await engine.readParticles() to map them
  // back, then build the SVG with the same path as snapshot().
  async function downloadEngineSVGAsync(name, engine, opts = {}) {
    if (!engine) return;
    let particles;
    if (engine.readParticles) {
      particles = await engine.readParticles();
    } else {
      particles = engine.particles || [];
    }
    const { W, H } = engine.size;
    const cfg = engine.config;
    const palette = cfg.palette;
    const r = opts.pointSize ?? cfg.pointSize ?? 1.3;
    const alpha = opts.alpha ?? 0.7;
    const points = particles.map(p => ({
      x: p.x, y: p.y, r,
      color: palette[p.s % palette.length],
      alpha, halo: false, haloR: 0,
    }));
    const svg = pointsToSVG(points, W, H, { bg: opts.bg ?? '#0a0a0c' });
    triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`);
  }

  // format: 'jpg' | 'png'. quality applies to jpg only (0..1).
  function downloadCanvasRaster(name, canvas, format = 'jpg', quality = 0.92) {
    if (!canvas || !canvas.toBlob) return;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const ext = format === 'png' ? 'png' : 'jpg';
    // jpg needs a non-transparent background; composite onto ink first
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const ctx = off.getContext('2d');
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.drawImage(canvas, 0, 0);
    off.toBlob((blob) => {
      if (blob) triggerDownload(blob, `${name}.${ext}`);
    }, mime, quality);
  }

  window.ParticleLife = {
    create, specimen, specimenSVG, specimenPoints,
    snapshot, snapshotSVG, pointsToSVG,
    downloadSpecimenSVG, downloadEngineSVG, downloadEngineSVGAsync, downloadCanvasRaster,
    PRESETS,
  };
})();
