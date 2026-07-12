/* particle-life-rules.js — interaction matrix presets shared by CPU + GPU
 *
 * Ported from DicSo92/SandboxScience helpers/utils/rulesGenerator.ts
 * (AGPL-3.0-or-later). Each generator returns a flat row-major n*n array of
 * rule values in [-1, 1] — exactly what both engines expect (CPU stores it
 * as matrix[i][j], GPU packs it into the interactions storage buffer).
 *
 * Picked for "alive-feeling" emergent behaviour — cellular, worm-like,
 * predator/prey, organism flocks. Each yields a distinct visual character:
 *
 *   cellular         strong self-clump → cell colonies (BRAND DEFAULT)
 *   hub-spokes       core species attracts all → flower-like centre
 *   orbital          ring-of-pursuit → orbital chains  (legacy alias)
 *   chains1/2/3      worm-like chains; each species likes immediate neighbours
 *   snake            head chases tail → continuous slithering
 *   rps              rock-paper-scissors → 3-way pursuit dance
 *   bipartite        even↔even attract, odd↔odd attract, mix repels → two species lattices
 *   shells           concentric onion shells nested by species
 *   triadFlocks      species clustered in groups of 3 → cooperative flocks
 *   dimers           even-odd partner bonds → DNA-like pairs
 *   spiralConveyor   forward + skip-1 attraction → corkscrew motion
 *   wavefield        sinusoidal pulse → standing wave nodes
 *   patchwork        random patches → chaotic structure
 *   ringRoad         circular loop topology → ring traffic
 *   triSpiral        three-arm rotating spiral
 *   vortex           alternating spin direction → eddy lattice
 *   helical          DNA-helix ladder
 *
 * All generators tolerate any n ≥ 1 (species count).
 */
(function () {
  'use strict';

  const flat = (m) => {
    const n = m.length;
    const out = new Array(n * n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let v = m[i] && typeof m[i][j] === 'number' ? m[i][j] : 0;
        if (v < -1) v = -1; else if (v > 1) v = 1;
        out[i * n + j] = v;
      }
    }
    return out;
  };

  // ============================================================
  // Brand baseline (our originals — kept for backward compat)
  // ============================================================
  function cellular(n) {
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) m[i][j] = (i === j) ? 0.8 : -0.55;
    }
    return flat(m);
  }
  function hubSpokes(n) {
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === 0 || j === 0) m[i][j] = 0.85;
        else if (i === j) m[i][j] = 0.45;
        else m[i][j] = (i % 2 === j % 2) ? 0.2 : -0.35;
      }
    }
    return flat(m);
  }
  function orbital(n) {
    // Our original "orbital" — each species attracts next-in-cycle strongly,
    // repels others. Ported sandbox `snake` is close but with self-attract.
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === (i + 1) % n) m[i][j] = 0.95;
        else if (i === j) m[i][j] = -0.05;
        else m[i][j] = -0.4;
      }
    }
    return flat(m);
  }

  // ============================================================
  // Sandbox ports — picked for emergent organic behaviour
  // ============================================================
  function chains1(n) {
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i || j === (i + 1) % n || j === (i + n - 1) % n) m[i][j] = 1;
        else m[i][j] = -1;
      }
    }
    return flat(m);
  }
  function chains2(n) {
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = 1;
        else if (j === (i + 1) % n || j === (i + n - 1) % n) m[i][j] = 0.2;
        else m[i][j] = -1;
      }
    }
    return flat(m);
  }
  function chains3(n) {
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = 1;
        else if (j === (i + 1) % n || j === (i + n - 1) % n) m[i][j] = 0.2;
        else m[i][j] = 0;
      }
    }
    return flat(m);
  }
  function snake(n) {
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = 1;
        else if (j === (i + 1) % n) m[i][j] = 0.2;
        else m[i][j] = 0;
      }
    }
    return flat(m);
  }
  function rockPaperScissors(n) {
    const A = 0.9, R = -0.7, S = -0.1;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = S;
        else if (j === (i + 1) % n) m[i][j] = A;
        else if (j === (i + n - 1) % n) m[i][j] = R;
        else m[i][j] = 0;
      }
    }
    return flat(m);
  }
  function bipartite(n) {
    const INTRA = 0.8, INTER = -0.8, S = 0.2;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        const sameBloc = (i % 2) === (j % 2);
        m[i][j] = (j === i) ? S : (sameBloc ? INTRA : INTER);
      }
    }
    return flat(m);
  }
  function shells(n) {
    const SELF = 0.9, NEXT = 0.3, FAR = -0.6;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = SELF;
        else if (j === (i + 1) % n) m[i][j] = NEXT;
        else m[i][j] = FAR;
      }
    }
    return flat(m);
  }
  function triadFlocks(n) {
    const IN = 0.9, OUT = -0.7, SELF = 0.1;
    const gid = (t) => Math.floor(t / 3);
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = SELF;
        else m[i][j] = (gid(i) === gid(j)) ? IN : OUT;
      }
    }
    return flat(m);
  }
  function dimers(n) {
    const STRONG = 1.0, REP = -0.9, SELF = 0;
    const partner = (t) => t ^ 1;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = SELF;
        else if (j === partner(i)) m[i][j] = STRONG;
        else m[i][j] = REP;
      }
    }
    return flat(m);
  }
  function spiralConveyor(n) {
    const A1 = 0.7, A2 = 0.3, R = -0.6, SELF = -0.1;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = SELF;
        else if (j === (i + 1) % n) m[i][j] = A1;
        else if (j === (i + 2) % n) m[i][j] = A2;
        else m[i][j] = R;
      }
    }
    return flat(m);
  }
  function wavefield(n) {
    const AMP = 0.9, SELF = -0.05;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = SELF;
        else {
          const phase = 2 * Math.PI * (j - i) / n;
          m[i][j] = Math.sin(phase) * AMP;
        }
      }
    }
    return flat(m);
  }
  function patchwork(n) {
    const p = 0.35, POS = 0.9, NEG = -0.9, SELF = 0.0;
    const rnd = (i, j) => Math.abs((Math.sin(i * 73856093 ^ j * 19349663) * 43758.5453) % 1);
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = SELF;
        else {
          const r = rnd(i, j);
          m[i][j] = r < p ? POS : (r < 2 * p ? NEG : 0);
        }
      }
    }
    return flat(m);
  }
  function ringRoad(n) {
    const SELF = -0.05, KA = 1, KR = Math.ceil(n / 3), A = 0.85, R = -0.8;
    const circ = (d) => Math.min((d + n) % n, (-d + n) % n);
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = SELF;
        else {
          const d = circ(j - i);
          m[i][j] = (d <= KA) ? A : ((d <= KR) ? 0.2 : R);
        }
      }
    }
    return flat(m);
  }
  function triSpiral(n) {
    const SELF = -0.05, A1 = 0.7, A3 = 0.55;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = SELF;
        else {
          const ph = 2 * Math.PI * (j - i) / n;
          m[i][j] = A1 * Math.sin(ph) + A3 * Math.sin(3 * ph);
        }
      }
    }
    return flat(m);
  }
  function vortex(n) {
    const SELF = -0.05, AMP = 0.8;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = SELF;
        else {
          const ph = 2 * Math.PI * (j - i) / n;
          const parity = ((i + j) % 2 === 0) ? 1 : -1;
          m[i][j] = parity * AMP * Math.sin(ph);
        }
      }
    }
    return flat(m);
  }
  function helical(n) {
    const SELF = -0.05, A = 0.7, B = 0.4, K = 2 * Math.PI / n;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = SELF;
        else m[i][j] = A * Math.sin(K * (j - i)) + B * Math.cos(K * (i + j));
      }
    }
    return flat(m);
  }
  function randomMatrix(n) {
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) m[i][j] = Math.random() * 2 - 1;
    }
    return flat(m);
  }

  // --- New organic presets -------------------------------------------------
  // Predator-prey — species 0 is the apex predator. It chases all others;
  // all others flee from species 0. Within-prey: mild self-attraction so
  // herds form, weak cross-attraction so they mix. Reads as a school being
  // hunted across the petri dish.
  function predator(n) {
    const PURSUE = 0.95, FLEE = -0.95, HERD = 0.55, MIX = 0.1, SELF = 0.05;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = (i === 0 ? -0.2 : SELF);
        else if (i === 0) m[i][j] = PURSUE;          // pred chases all
        else if (j === 0) m[i][j] = FLEE;            // prey flees pred
        else if (((i + j) % 3) === 0) m[i][j] = HERD;
        else m[i][j] = MIX;
      }
    }
    return flat(m);
  }

  // Symbiosis — each species has a designated partner two indices away
  // (so 0↔2, 1↔3, 2↔4 …) that it strongly attracts; others slightly repel.
  // Reads as bonded pairs drifting through space, like algal-fungal lichen.
  function symbiosis(n) {
    const BOND = 1.0, REP = -0.4, SELF = 0.2;
    const partner = (t) => (t + 2) % n;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (j === i) m[i][j] = SELF;
        else if (j === partner(i) || i === partner(j)) m[i][j] = BOND;
        else m[i][j] = REP;
      }
    }
    return flat(m);
  }

  // Swarm — everything weakly attracts everything, but self-attract is
  // strong. Forms a big amoeba-blob that slowly pulses and reshapes. The
  // "ant colony moving as one" feel.
  function swarm(n) {
    const SELF = 0.95, OTHER = 0.18;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        m[i][j] = (i === j) ? SELF : OTHER + (Math.random() - 0.5) * 0.12;
      }
    }
    return flat(m);
  }

  // Membrane — one species (last index) forms a boundary that repels all
  // others, others weakly attract each other → "cell wall + cytoplasm".
  function membrane(n) {
    const WALL = -0.8, INSIDE = 0.4, SELF_WALL = 0.9, SELF_IN = 0.2;
    const m = new Array(n);
    const wall = n - 1;
    for (let i = 0; i < n; i++) {
      m[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        if (i === j) m[i][j] = (i === wall) ? SELF_WALL : SELF_IN;
        else if (i === wall || j === wall) m[i][j] = WALL;
        else m[i][j] = INSIDE + (Math.random() - 0.5) * 0.1;
      }
    }
    return flat(m);
  }

  // ============================================================
  // Registry
  // ============================================================
  const PRESETS = {
    // Brand defaults — kept first so existing callers still work
    cellular,
    'hub-spokes': hubSpokes,
    orbital,
    // Sandbox "alive" ports
    chains1, chains2, chains3,
    snake,
    rps: rockPaperScissors,
    bipartite,
    shells,
    'triad-flocks': triadFlocks,
    dimers,
    'spiral-conveyor': spiralConveyor,
    wavefield,
    patchwork,
    'ring-road': ringRoad,
    'tri-spiral': triSpiral,
    vortex,
    helical,
    // Organic / biological additions
    predator, symbiosis, swarm, membrane,
    random: randomMatrix,
  };

  // Names of "alive-feeling" presets — Hero picks from this list for variety
  // (random / patchwork / wavefield can produce noise so they're optional).
  // Curated to favour distinct creature-formations: chains (worms),
  // cellular/colony, predator-prey chase, dimers/symbiosis pairs, etc.
  const ALIVE_NAMES = [
    'cellular', 'hub-spokes', 'orbital',
    'chains1', 'chains2', 'chains3',
    'snake', 'rps', 'bipartite', 'shells',
    'triad-flocks', 'dimers',
    'spiral-conveyor', 'wavefield',
    'ring-road', 'tri-spiral', 'vortex', 'helical',
    'predator', 'symbiosis', 'swarm', 'membrane',
  ];

  function get(name, n) {
    const fn = PRESETS[name] || PRESETS.cellular;
    return fn(n);
  }
  function pickAlive() {
    return ALIVE_NAMES[(Math.random() * ALIVE_NAMES.length) | 0];
  }

  window.PLRules = { PRESETS, get, names: Object.keys(PRESETS), aliveNames: ALIVE_NAMES, pickAlive };
})();
