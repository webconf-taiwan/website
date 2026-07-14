/* particle-ambient.js — 四層環境擾動排程，抽自 demo/components.jsx 的 startBreath()
 *
 * Particle Life 場域若無外力，幾十秒後會收斂成靜態圖。這四層排程好的
 * disturb 脈衝讓它永遠不靜止（參數與 demo Hero 完全一致）：
 *
 *   metabolism  每 2.2–4s   兩發小脈衝（半徑 60–120）      細胞微顫
 *   breath      每 5–10s    一發大脈衝，50% 補一發衛星脈衝  區域鼓動
 *   noiseField  每 1.2–2.4s 偽雜訊採樣 10 點、對前 2 熱點發 洋流感
 *   tide        每 10–18s   沿隨機直線連發 4 記大脈衝       潮汐重組全場
 *
 * 用法：
 *   const stop = window.PLAmbient.start(() => engine);   // 傳 getter，engine 可晚點才 ready
 *   stop();                                              // 清掉所有 timer
 *
 * opts（皆可省略）：
 *   { metabolism: true, breath: true, noiseField: true, tide: true,  // 個別開關
 *     intensity: 1 }                                                 // 全域強度倍率
 */
(function () {
  'use strict';

  function start(getEngine, opts = {}) {
    const on = (k) => opts[k] !== false;
    const gain = typeof opts.intensity === 'number' ? opts.intensity : 1;
    const timers = new Set();
    let stopped = false;

    const later = (fn, ms) => {
      if (stopped) return 0;
      const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
      timers.add(id);
      return id;
    };
    const eng = () => {
      const e = typeof getEngine === 'function' ? getEngine() : getEngine;
      return e && e.disturb ? e : null;
    };

    // 廉價偽 2D 雜訊：多頻率正弦積之和，帶時間項讓整個場漂移。
    const noise2D = (x, y, t) => {
      const a = Math.sin(x * 0.0042 + t * 0.31) * Math.cos(y * 0.0051 + t * 0.27);
      const b = 0.62 * Math.sin(x * 0.0118 - t * 0.19) * Math.cos(y * 0.0089 + t * 0.43);
      const c = 0.38 * Math.sin((x + y) * 0.0073 + t * 0.55);
      return (a + b + c) * 0.55;   // 約 [-1, 1]
    };

    if (on('metabolism')) {
      const metabolism = () => {
        const e = eng();
        if (e) {
          const { W, H } = e.size;
          for (let i = 0; i < 2; i++) {
            e.disturb(
              W * (0.10 + Math.random() * 0.80),
              H * (0.10 + Math.random() * 0.80),
              60 + Math.random() * 60,
              (1.6 + Math.random() * 1.4) * gain,
            );
          }
        }
        later(metabolism, 2200 + Math.random() * 1800);
      };
      metabolism();
    }

    if (on('breath')) {
      const breath = () => {
        later(() => {
          const e = eng();
          if (e) {
            const { W, H } = e.size;
            e.disturb(
              W * (0.15 + Math.random() * 0.7),
              H * (0.15 + Math.random() * 0.7),
              200 + Math.random() * 200,
              (7 + Math.random() * 6) * gain,
            );
            if (Math.random() < 0.5) {
              later(() => {
                const e2 = eng(); if (!e2) return;
                e2.disturb(
                  W * Math.random(), H * Math.random(),
                  120 + Math.random() * 120,
                  (4 + Math.random() * 4) * gain,
                );
              }, 500 + Math.random() * 600);
            }
          }
          breath();
        }, 5000 + Math.random() * 5000);
      };
      breath();
    }

    if (on('noiseField')) {
      const noiseFieldTick = () => {
        const e = eng();
        if (e) {
          const { W, H } = e.size;
          const t = performance.now() * 0.001;
          const best = [];
          for (let i = 0; i < 10; i++) {
            const x = W * (0.05 + Math.random() * 0.9);
            const y = H * (0.05 + Math.random() * 0.9);
            best.push({ x, y, n: Math.abs(noise2D(x, y, t)) });
          }
          best.sort((a, b) => b.n - a.n);
          for (let k = 0; k < 2 && k < best.length; k++) {
            const b = best[k];
            if (b.n < 0.25) continue;           // 只在真正的熱點發射
            e.disturb(b.x, b.y, 220 + b.n * 280, (5 + b.n * 11 + (k === 0 ? 3 : 0)) * gain);
          }
        }
        later(noiseFieldTick, 1200 + Math.random() * 1200);
      };
      later(noiseFieldTick, 800);   // 錯開，避免各層同步
    }

    if (on('tide')) {
      const tide = () => {
        const e = eng();
        if (e) {
          const { W, H } = e.size;
          const m = Math.min(W, H);
          const angle = Math.random() * Math.PI * 2;
          const cx = W * (0.4 + Math.random() * 0.2);
          const cy = H * (0.4 + Math.random() * 0.2);
          const len = m * 0.55;
          const ux = Math.cos(angle), uy = Math.sin(angle);
          const startX = cx - ux * len * 0.5;
          const startY = cy - uy * len * 0.5;
          const steps = 4;
          for (let i = 0; i < steps; i++) {
            later(() => {
              const cur = eng(); if (!cur) return;
              const t = i / (steps - 1);
              cur.disturb(
                startX + ux * len * t,
                startY + uy * len * t,
                m * 0.32 + Math.random() * m * 0.10,
                (16 + Math.random() * 9) * gain,
              );
            }, i * 220);
          }
        }
        later(tide, 10000 + Math.random() * 8000);
      };
      later(tide, 6000);   // 第一波 ~6s 進場，開場注意力期就看得到
    }

    return function stop() {
      stopped = true;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }

  window.PLAmbient = { start };
})();
