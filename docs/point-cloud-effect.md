# 點雲視覺效果原理筆記 — Particle Life 引擎

> 對象：`demo/` 內的 WebConf 2026 視覺 demo（截圖中的星雲／點雲畫面）。
> 目的：搞懂它的動態原理與架構，作為之後延伸（圖片轉點雲、多點雲漸變）的基礎文件。

---

## 1. 核心觀念：這不是「點雲圖」，是「活的模擬」

畫面上的每一顆點**不是預先算好的座標**，而是一顆持續在跑物理模擬的粒子。
整套效果是 **Particle Life（粒子生命）**：

- 全場有 N 顆粒子（Hero 版 64,000–116,000 顆），每顆有位置、速度、以及一個「物種」編號（3–7 種）。
- 物種之間有一張 **互動矩陣（interaction matrix）**：`matrix[i][j]` 是 -1 到 1 的數字，代表「物種 i 看到物種 j 時，是被吸引（正值）還是被排斥（負值）」。
- 每一幀，每顆粒子看它半徑 `rMax`（約 60–85px）內的鄰居，依矩陣算出合力，加上近距離的通用排斥力（`repel`，避免粒子疊在一起），積分出新位置。
- 就這麼簡單的規則，會**湧現**出細胞群落、蟲鏈、追逐漩渦、膜結構……這就是截圖裡那些「星雲、菌落」的來源。它們不是畫出來的，是長出來的。

品牌語彙上的對應：粒子 ≡ Agent、互動矩陣 ≡ Connection、模擬本身 ≡ Code。

---

## 2. 每次重整都不一樣：三層隨機 + 連續參數

每次頁面載入時隨機抽一組「標本」，所以永遠不會看到兩次相同畫面。隨機的東西有四類：

| 隨機項 | 數量 | 檔案 | 作用 |
| --- | --- | --- | --- |
| **色盤 palette** | 8 組（每組 7 色，對應物種數上限） | `components.jsx` 的 `PALETTES`、`index.html` 抽選 | blue / amber / parchment / mixed / bioluminescence / coral / fluoro / slime |
| **初始排列 seedPattern** | 18 種 | `particle-life-seeds.js`（`window.PLSeeds`） | 粒子出生時的空間佈局：disk、ring、spiral、yinYang、chromaticFlower、wavyBands、orbitalBelts… |
| **力矩陣 preset** | 22 種 | `particle-life-rules.js`（`window.PLRules`） | 決定後續「長成什麼行為」：cellular（細胞群落）、snake（追尾蛇行）、rps（三方追逐）、predator（獵食）、membrane（細胞膜）… |
| **連續參數** | — | `components.jsx` Hero boot | 物種數 3–7、粒子數 64k–116k、forceFactor、friction、rMax、glow 強度等，各在安全範圍內隨機 |

關鍵設計：**seedPattern 決定「開場第一眼」，preset 決定「之後怎麼活」**。
開場時粒子按 pattern 排成漂亮的結構（彩虹圓盤、雙螺旋…），幾秒後 particle-life 規則接管，把結構「溶解」成湧現的生命形態。開場印象＋持續演化，兩段都好看。

### Seed pattern 的通用介面（延伸的關鍵）

所有 pattern 都是同一個簽名的生成函式：

```js
// write(i, x, y, vx, vy, type) — 寫入第 i 顆粒子
function myPattern(write, N, T, W, H) { /* ... */ }
```

`PLSeeds.PATTERNS` 是一個 registry，CPU 引擎與 GPU 引擎共用。
**→ 未來「圖片轉點雲」只要新增一個 pattern 函式即可接進整套系統（見 §7）。**

---

## 3. 引擎架構

兩套引擎、同一個 API，`window.makeEngine(canvas, opts)` 自動選擇：

```
WebGPU 可用 → particle-life-gpu.js  (spatial-hash compute，6-12 萬顆 @60fps)
      失敗 → particle-life.js       (canvas2D + WebGL2 compute fallback，約 1 萬顆)
```

### GPU 每幀管線（particle-life-gpu.js）

```
particles → binFillSize     每個空間格子的粒子數（atomic 計數）
          → binPrefixSum    平行前綴和（Hillis-Steele scan）
          → particleSort    依格子重排粒子（讓鄰居查詢連續讀取）
          → computeForces   每顆粒子只掃相鄰 (1+2k)² 個格子 ← 效能核心
          → particleAdvance 摩擦 + 積分 + 邊界 wrap + disturb 脈衝
          → renderGlow      instanced quad 加法混合進 rgba16float HDR
          → renderCircle    銳利圓核疊在光暈上
          → composeHDR      ACES tonemap + gamma 2.2 + dither → 畫布
```

- **Spatial hash** 是能跑 10 萬顆的原因：不用 O(N²) 兩兩比對，只查鄰近格子。
- **HDR + ACES tonemap** 是質感的原因：粒子用加法混合疊亮度，密集處自然「發光過曝再壓回」，出現截圖裡星雲核心那種亮心暈邊。
- Hero 因密度太高關掉 glow pass（`showGlow: false`），只留銳利小點；小型 plate（1.5k–10k 顆）才開光暈。
- 全頁多個 canvas 共用一個 `GPUDevice`（singleton），每個引擎自己持有 pipeline 與 buffer。
- `simSpeed: 0.5`：**模擬半速、渲染全速**。畫面 60fps 滑順，但生態演化放慢一倍，呈現「呼吸感」而非亂竄。

---

## 4. 「一直是活的」的秘密：四層環境擾動

光有 particle life，畫面幾十秒後會收斂成靜態圖。Demo 用四層排程好的 `disturb(x, y, radius, strength)`（徑向脈衝、線性衰減）持續攪動，全部在 `components.jsx` 的 `startBreath()`：

| 層 | 週期 | 行為 | 視覺閱讀 |
| --- | --- | --- | --- |
| **Metabolism 代謝** | 每 2.2–4s | 小半徑（60–120px）、輕推力 | 細胞層級的微顫 |
| **Breath 呼吸** | 每 5–10s | 大半徑（200–400px）、強推力，50% 機率 0.5–1.1s 後補一發衛星脈衝 | 整個區域鼓一下 |
| **Noise field 亂流** | 每 1.2–2.4s | 用 2D 偽雜訊採樣 10 個點，在 |noise| 最高的 2 個熱點發脈衝，強度隨雜訊值 | 一股「洋流」掃過場域 |
| **Tide 潮汐** | 每 10–18s | 沿一條隨機直線，每 220ms 連發 4 記大脈衝（半徑約 30–40% 畫面） | 一道浪打過培養皿，重組全場 |

加上滑鼠移動即時觸發 `disturb(x, y, 360, 16)`，游標會真的「攪動」粒子場。

**這是最值得留用的模式**：任何點雲效果（包括未來的靜態圖片點雲）掛上這四層擾動排程，就會從「一張圖」變成「一個活體」。

---

## 5. 引擎 API 速查

```js
const engine = await window.makeEngine(canvas, {
  species, count, preset, palette,          // 生態組成
  seedPattern,                              // 'auto' 或 18 種名稱之一
  forceFactor, friction, repel, rMax, minR, // 物理
  simSpeed, cameraZoom,                     // 播放速度 / 取景
  pointSize, particleOpacity,               // 點的外觀
  glowSize, glowIntensity, glowSteepness, showGlow,  // 光暈
});

// 執行期控制（GPU / CPU 兩套引擎同介面）
engine.disturb(x, y, r, s);        // 徑向脈衝（動態感的來源）
engine.setPalette(...); engine.setPreset(name); engine.setSpecies(n);
engine.setForce(v); engine.setRMax(v); engine.setFriction(v); engine.setRepel(v);
engine.setSimSpeed(v); engine.setCameraZoom(v); engine.setCount(n); // setCount 會整場重生
engine.setSeedPattern(name); engine.respawn(patternOverride);       // 換佈局重生
await engine.readParticles();      // GPU buffer 讀回 [{x,y,vx,vy,s}] — SVG 匯出用
engine.pause(bool); engine.destroy();
```

檔案載入順序（無 build step，直接 `<script>`）：

```
particle-life-seeds.js → particle-life-rules.js → particle-life.js
→ particle-life-gpu.js → tweaks-panel.jsx → components.jsx → codex.jsx → applications.jsx
```

本地跑：`python3 -m http.server 8765` 開 `demo/index.html` 即可（JSX 由瀏覽器內 Babel 轉譯）。

---

## 6. 固定開場：把「隨機」收斂成「策展」

「每次重整都不一樣」聽起來浪漫，但全隨機一定會抽到醜的組合。好消息是：**所有隨機都發生在 JS 端的載入瞬間，模擬本身是確定性的**，所以開場完全可以鎖住，只讓後續演變自由。

### 隨機發生在四個地方

| 位置 | 隨機了什麼 | 醜的風險 |
| --- | --- | --- |
| `index.html` 頂部 `_pick()` | 色盤 × preset 的離散組合 | 某些組合就是不搭（低風險，色盤都經過設計） |
| Hero boot（`components.jsx`） | species 數、count、force/friction/rMax/glow 等連續參數 | 範圍已收在安全區間，但邊緣值疊加仍可能糊掉或太稀 |
| seed pattern 內部 | 旋轉角、抖動、環數、花瓣數……（`rnd = Math.random`） | **主要風險**：如 `rings` 抽到 2 環 vs 8 環、花瓣 2 vs 7，構圖差很多 |
| 部分 rule preset | `swarm`/`membrane`/`patchwork` 矩陣內含隨機項 | 行為偶爾偏噪 |

### 收斂策略（三層，可疊加）

**第一層：白名單組合（最重要，成本最低）**
不改任何引擎程式碼——把「全域隨機抽」改成「從一份**審過的標本庫**裡抽」：

```js
// 每一筆都是人工看過、確認好看的完整參數組
const SPECIMENS = [
  { palette: 'bioluminescence', seedPattern: 'rainbowSpiral', preset: 'cellular',
    species: 6, count: 90000, forceFactor: 0.95, friction: 0.31, rMax: 72, /* … */ },
  { palette: 'amber', seedPattern: 'chromaticFlower', preset: 'snake', /* … */ },
  // ……策展 10–20 組
];
const spec = SPECIMENS[(Math.random() * SPECIMENS.length) | 0];
```

重整仍有變化（在庫內輪替），但每一種都保證好看。sandbox 的「參數集」功能（`sandbox.html` 的 Params 面板，可 save/export JSON）就是為此準備的——**在 sandbox 裡調到滿意 → export JSON → 收進標本庫**，這是現成的策展工作流。

**第二層：seeded RNG，讓初始構圖逐像素可重現**
第一層鎖住了參數，但 seed pattern 內部的 `Math.random`（旋轉角、環數、花瓣數）仍會變。要讓「同一筆標本每次開場長一模一樣」，把 `particle-life-seeds.js` 開頭的 `const rnd = Math.random` 換成可注入種子的 PRNG：

```js
// mulberry32 — 一行種子式 PRNG
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = Math.random;
window.PLSeeds.setSeed = (s) => { rnd = s == null ? Math.random : mulberry32(s); };
```

標本庫每筆加一個 `seed: 20260814`，respawn 前呼叫 `setSeed(spec.seed)`。同理可處理 `swarm`/`membrane` 的矩陣隨機項。這樣一筆標本 = 一個完全確定的開場畫面，之後的演變（disturb 排程仍用 `Math.random`、GPU 浮點誤差累積）自然發散——正是「開場固定、後續自由」的分界。

**第三層：URL 參數覆寫，方便策展與除錯**
`?specimen=3` 或 `?palette=amber&pattern=spiral&seed=1234` 直接指定，截圖、回報「這組醜」、跨裝置驗收都有明確座標。

### 建議的落地形態

新網站直接以「標本庫」為第一公民：全隨機模式只留在 sandbox 當探索工具，正式站永遠從審過的庫裡抽。策展流程 = sandbox 調參 → export JSON → 加 seed 欄位 → 丟進 `SPECIMENS`。醜的組合根本進不了正式站。

---

## 7. 延伸方向 A：圖片 → 點雲

目標：給一張圖，產生它的粒子點雲版本。做法是**新增一個 seed pattern**，完全不動引擎：

### 流程

1. **離屏取樣**：把圖畫進 offscreen canvas，`getImageData()` 讀像素。
2. **重要性採樣（importance sampling）**：以像素的亮度（暗底亮圖）或 alpha 作為權重，建立累積分布，抽 N 個點——亮的地方粒子密、暗的地方稀疏。比固定網格採樣自然，且 N 可以任意指定（配合引擎的 count）。
3. **座標映射**：圖片座標 → 模擬座標（置中、等比、留邊界 margin，可參考現有 pattern 的 `0.46 * min(W, H)` 慣例）。
4. **顏色 → 物種量化**：引擎沒有逐粒子 RGB，只有「物種 → 色盤顏色」。把每個採樣點的像素色，量化到目前 palette 7 色中最接近的一色（建議在 Oklab/Lab 空間算距離），該色的 index 就是 `type`。
5. **註冊 pattern**：

```js
// 預先算好 samples = [{x, y, type}, ...]（正規化 0–1 座標）
window.PLSeeds.PATTERNS.fromImage = (write, N, T, W, H) => {
  for (let i = 0; i < N; i++) {
    const p = samples[i % samples.length];
    write(i, p.x * W, p.y * H, 0, 0, p.type % T);
  }
};
engine.respawn('fromImage');
```

### 兩種呈現模式

- **靜態標本**：`forceFactor` 調到 0（或 `pause`），圖形不散開；只掛 §4 的擾動層讓它微微呼吸——擾動推開後靠 morph 回位力（見方向 B）拉回。
- **溶解模式**：正常開啟 particle-life 力，圖片形狀維持幾秒後被規則「吃掉」，長成生態——開場是 logo/圖片，之後活起來。這其實就是現有 demo「pattern 開場 → 規則接管」的同一套敘事。

顏色對位小技巧：若想讓點雲更貼近原圖色彩，可以反向操作——先統計圖片主色，動態組一個 7 色 palette 餵給引擎，而不是遷就既有色盤。

### ✅ 已實作（2026-07，`app/pages/people.vue` + `particle-image.js`）

工作流與踩過的坑，供之後加新人像時照抄。**加新講師三步驟**（工具都在 `docs/people-src/`）：

```bash
cd docs/people-src
swift cutout.swift <原圖> /tmp/raw.png          # ① Vision 去背
python3 cleanup.py /tmp/raw.png people-0N.png 0.03   # ② 轉正/裁邊/alpha 收縮
python3 bake.py people-0N.png ../../public/people/people-0N.json people-0N 32000  # ③ 烘 JSON
```
然後把 `people-0N` 加進 `people.vue` 的 `PEOPLE` 陣列即可。

1. **離線去背**：macOS 原生 Vision（`VNGenerateForegroundInstanceMaskRequest`，
   `cutout.swift` 單檔腳本）抽人物 → `cleanup.py`（PIL）轉正、裁邊、alpha MinFilter
   收縮 1px 去背景殘邊。
2. **烘 JSON 點資料**：`bake.py` 是 `PLImage.prepare` 的 Python 移植（用 PIL 讀像素，
   同一套重要性採樣 + k-means 量化 + Uint16/base64 打包），產出的 `v:1` 資料格式與
   瀏覽器版**完全相容**——免開瀏覽器 console，直接寫檔。32k 點約 208KB。正式站用
   `PLImage.prepareFromData(json)` 載入——**不必公開原始照片**、比 PNG 小、免解圖。
   原圖 cutout（`people-0N.png`）與三支工具都收在 `docs/people-src/`（不進 public）。
3. **互動模式「hover 擴散、離開凍結、點擊倒帶」**：
   - 預設 `pause(true)` 凍結完整人形（先跑 2 幀渲染出畫面再凍；pause 會跳過渲染，
     canvas 保留最後一幀）。
   - **坑：任何正自吸引矩陣（cellular / self > 0）會把人像凝結成菌落圓點**。
     氣體感要用 wavefield 式正弦相位環流 + 全域微斥力：
     `m[i][j] = 0.45·sin(2π(j−i)/n) − 0.08`，self −0.06，forceFactor 0.3、simSpeed 0.3。
   - **倒帶重組（不改引擎的 morph 替代）**：`readParticles()` 讀回目前狀態 →
     與目標點做「同物種內掃描線排序配對」（GPU 每幀 spatial sort 會打亂粒子順序，
     index 對不上原點位，但同色可互換所以無妨）→ easing 逐幀插值、借
     `respawn('__rewind')`（臨時 pattern）整批上傳。倒帶期間 `setForce(0)`。
     32k 點 × 60fps 上傳約 640KB/幀，桌機無壓力。
4. 效能守則照 §10：hover 才跑、離屏/分頁隱藏凍結、行動裝置粒子減半。

## 8. 延伸方向 B：多組點雲之間的漸變（morph）

目標：多張圖各自轉成點雲後，每隔幾秒漸變到下一張。

### ✅ 已實作（2026-07，`people.vue` sticky 三講師捲動漸變）

不必動 shader——把 §7.4 的「倒帶」機制一般化成 `tweenToSpec(eng, spec, ms, tag, {fromPalette, toPalette})`
就是 morph：`readParticles()` 讀回現況 → 與目標人像做**同物種掃描線配對** → easing 逐幀
插值位置、借 `respawn(臨時 pattern)` 整批上傳。GSAP ScrollTrigger 讓右側每個區塊捲到畫面
中央時觸發 `requestMorph(i)`（連跳幾位會逐一補上），十萬顆粒子集體遷徙成下一位講師。

**換色順滑的關鍵坑**：morph 換人時色盤也要換，但

- `setPalette()` 內含 `rebuildBindGroups()`（重建十幾個 bind group）→ 逐幀呼叫會**卡頓**；
  且一次性換色是**瞬間跳色**。
- 解法：引擎新增輕量 `setColors(palette)`——只 `writeColors()`（重寫 128B 顏色 buffer），
  **跳過 rebuildBindGroups**（colorsBuffer 尺寸不變時既有 bind group 仍有效）。morph 時
  以**同一 easing** 把色盤在**線性光空間**逐幀插值（naive sRGB 插值中點會發灰），顏色隨
  形狀一起流過去。由於配對讓粒子的 type index t 在新舊人像間一致（都是「第 t 亮的色」），
  `fromPalette[t] → toPalette[t]` 的插值天然對位，開場不跳色、過程不卡。

粒子順序無法跨人像對位（GPU spatial sort 每幀打亂）不影響——同色可互換。所有人像採樣點數
需一致（都 32k），色盤長度一致（都 7）故免 `setSpecies`。

### 若要「每隔幾秒自動漸變」而非捲動觸發

引擎原生**沒有** morph 力場；上面的 `tweenToSpec` 是不改引擎的替代（respawn 覆寫位置）。
若要粒子在形狀「裡面」持續游動、用磁場式拉力遷徙，仍可走下面的 shader 路線：

### 現況（原生力場）

引擎目前**沒有** morph 力：力只有三種來源（互動矩陣、近距排斥、disturb 脈衝）。`respawn()` 是瞬間重生不是漸變。所以要加一個「目標點吸引」機制，有兩條路：

### 路線 1（推薦）：在 GPU 引擎加 target buffer + seek 力

在 `particleAdvance` shader（`particle-life-gpu.js`，disturb 已經證明這裡可以插自訂力）加：

```
storage buffer targets: array<vec2f>   // 每顆粒子的目標位置
uniform morph: { strength: f32 }       // 0 = 關閉，>0 = 吸引強度

// shader 內：
if (morph.strength > 0.0) {
  let to = targets[i] - particle.pos;
  particle.v += to * morph.strength * dt;   // 弾簧式吸引，可加距離上限/緩動
}
```

配套的 JS API：`engine.setTargets(Float32Array)`、`engine.setMorphStrength(v)`。

**切換編排**（每張圖停留幾秒後漸變）：

```
待機：morphStrength 低（0.02–0.05）＋ particle-life 力照常 ＋ 四層擾動
      → 圖形維持得住，但粒子在形狀「裡面」持續游動，活的
切換：把 targets buffer 換成下一張圖的點位
      → 拉高 morphStrength、可同時把 forceFactor 淡出到 0.2 倍
      → 粒子群像被磁場拉走一樣流向新圖形（1.5–3s，用 easing 控制 strength 曲線）
到位：morphStrength 降回待機值、forceFactor 淡回
```

這樣漸變過程本身就是演出：不是 crossfade，而是十萬顆粒子集體遷徙。

### 路線 2（快速原型）：CPU 引擎先驗證

`particle-life.js` 的 CPU 路徑粒子陣列就在 JS 裡，直接在 step 迴圈加 seek 力即可，一小時內能看到效果，調好參數再搬進 WGSL。

### 對位（correspondence）問題

哪顆粒子去哪個目標點，決定漸變好不好看：

- **隨機指派**：最簡單，效果是「爆開重組」，其實已經很戲劇化，可以先用這個。
- **同物種內就近指派**：每個物種分開，用空間排序（如 Morton/Z-order 排序後依序配對）近似最近鄰，粒子走短路徑，效果是「流動變形」。10 萬顆做全域最佳匹配不現實，Z-order 近似便宜又夠好。
- **注意**：所有圖的採樣點數 N 要一致（重要性採樣本來就可以指定 N，不是問題）；物種數/色盤若跨圖不同，type 也要在 morph 時過渡（可以接受瞬切，顏色跳變在遷徙混亂中不明顯）。

### 資料格式建議

每張圖預轉成一份 JSON/binary：`{ n, positions: Float32Array(n*2), types: Uint8Array(n), palette?: [...] }`，可離線生成、快取，執行期只做 buffer 上傳。

---

## 9. 版權注意

`particle-life-gpu.js` 的 shader 移植自 [DicSo92/SandboxScience](https://github.com/DicSo92/SandboxScience)，授權 **AGPL-3.0-or-later**，再散布時該部分必須維持 AGPL。若新網站要避開 AGPL，morph/點雲功能自己寫沒問題，但 spatial-hash pipeline 需重新實作或評估授權。

---

## 10. 效能陷阱與對策（實測：M1 Air 會卡、新機也會燙）

demo 效能差**不是引擎的錯**（spatial-hash 管線本身是正經做法），而是用法把成本疊爆。以下是在 demo 原始碼裡實際觀察到的問題，新專案照清單避開即可。

### 陷阱一：全頁引擎同時跑、永不暫停（最大元兇）

`components.jsx:1096-1110` 的 `useVisible` / `useOnceVisible` 原本用 IntersectionObserver 做懶載入，後來被改成**一律回傳 true**（當時需求：「預設都讓粒子系統在運作」）。結果：Hero 的 6–12 萬顆之外，整頁還有幾十個 plate 引擎（9k、14.4k、9.6k、甚至 `count×18` 破萬顆的）從載入起**全部同時模擬**，包括在視窗外三個螢幕遠的。每個引擎每幀 7 個 compute pass + 渲染。

**對策**：裝回 IntersectionObserver，配合現成的 `engine.pause(true/false)`——離開視窗暫停、進入才跑，同時最多 2–3 個引擎在動。想保留「捲到哪都已經在動」的觀感，用折衷：離屏時顯示暫停前抓的靜態影格，進視窗瞬間 `pause(false)` 接手，肉眼無法分辨。另外分頁隱藏時記得 `document.visibilitychange` → `pause(true)`（rAF 在背景分頁只是降頻，不是停止）。

### 陷阱二：粒子預算不看裝置

Hero 固定抽 64k–116k 顆——README 自己寫的基準是「M5 Max 上 60fps」。M1 Air 無風扇、7–8 核 GPU，跑同樣預算必然熱到降頻，降頻後更卡，惡性循環。程式裡沒有任何依裝置調整 count 的邏輯。

**對策**：自適應預算。開場用保守值（如 24k–36k），跑 3–5 秒後讀 `engine.getFps()`：穩定 ≥55 可逐步上調；<45 就砍半（`setCount` 會整場重生，要在開場早期做，不要在使用者盯著看的時候）。無風扇機種自動落在 2–3 萬顆，視覺密度依然足夠。

### 陷阱三：`simSpeed: 0.5` 省的是觀感、不是算力

半速只是把 dt 砍半，模擬**每幀照算**——60fps 就是每秒 60 次完整管線。

**對策**：隔幀步進——sim 30Hz（用完整 dt）、render 60Hz。演化速度與現在完全相同，compute 直接省一半。這是引擎層的小改動，值得做。

### 陷阱四：Retina 下的 HDR 頻寬

DPR 上限 2（`particle-life-gpu.js:635`）。全螢幕 Hero 在 Retina 上是 ~2880×1620 的 `rgba16float` HDR target（8 bytes/像素）加法混合，再全幅 tonemap。點只有 0.8px，DPR 2 的視覺收益極小、成本是 4 倍像素。

**對策**：模擬畫布 DPR 收到 1–1.5。

### 陷阱五：雜項疊加

- 小 plate 開著 glow（加法混合 overdraw 大）——裝飾用途關掉或縮 `glowSize`。
- 各 plate 的 `×3`、`×18` 粒子倍率是視覺調整時加上去的——新專案從低值起跳。
- `CursorTrail` 自己一條 canvas2D rAF 迴圈——可有可無，效能吃緊先砍。
- Babel 在瀏覽器內轉譯 JSX——只拖慢載入不影響發熱，但正式站應改用 build step。

### 新專案效能檢查清單

- [ ] 每個 canvas 都掛 IntersectionObserver → 離屏 `pause(true)`
- [ ] `visibilitychange` → 分頁隱藏全體暫停
- [ ] 粒子預算自適應（保守起步 + fps 實測調整）
- [ ] sim 30Hz / render 60Hz 隔幀步進
- [ ] 模擬畫布 DPR ≤ 1.5
- [ ] 同時活動引擎數 ≤ 3；裝飾 plate 用 1–3k 顆、關 glow
- [ ] 尊重 `prefers-reduced-motion`，並提供低功耗開關

`particle-kit/example.html` 已示範前三項的最小實作。

---

## 11. 如何帶到其他專案（可攜性說明）

這份 md 記錄的是**原理與設計決策**；要在新專案重現效果，分兩種情境：

### 情境 A：帶走 `particle-kit/`（推薦，幾小時內能跑）

本 repo 的 **`particle-kit/`** 資料夾就是打包好的可攜套件——引擎是零依賴的 IIFE（掛在 `window` 上，無 build step、無框架綁定），整個資料夾複製到任何專案即用：

```
particle-life-seeds.js    初始佈局 registry（window.PLSeeds）
particle-life-rules.js    力矩陣 presets（window.PLRules）
particle-life.js          CPU fallback 引擎（window.ParticleLife）
particle-life-gpu.js      WebGPU 引擎 + makeEngine（window.ParticleLifeGPU）
particle-palettes.js      8 組色盤（window.PLPalettes）— 抽自 components.jsx
particle-ambient.js       四層擾動排程（window.PLAmbient）— 抽自 startBreath()
particle-image.js         圖片 → 點雲取樣（window.PLImage）— prepare / prepareFromData
example.html              最小可跑範例（含可視暫停 + fps 自適應粒子數）
point-cloud-effect.md     本文件副本
```

最小整合（`example.html` 有完整可跑版本）：

```html
<script src="particle-life-seeds.js"></script>
<script src="particle-life-rules.js"></script>
<script src="particle-life.js"></script>
<script src="particle-life-gpu.js"></script>
<script src="particle-palettes.js"></script>
<script src="particle-ambient.js"></script>
<script>
  const palette = window.PLPalettes.pick();
  const engine = await window.makeEngine(canvas, {
    palette: palette.particles, bgFade: palette.bgFade,
    /* 其餘參數見 §5，或用 §6 的標本庫 */
  });
  const stopAmbient = window.PLAmbient.start(() => engine);  // 四層擾動
</script>
```

**注意授權**：seeds / rules / GPU shader 移植自 SandboxScience（AGPL-3.0），帶走檔案 = 帶走 AGPL 義務（見 §9）。內部專案或願意開源則無妨。

### 情境 B：只帶這份 md（重寫，避開 AGPL 或換技術棧）

md 內含足夠資訊讓 AI/工程師重寫出同精神的效果——粒子生命規則（§1）、參數範圍（§5）、擾動排程的完整數值（§4）、隨機化與策展架構（§2、§6）。但要有兩個預期：

- **CPU/WebGL 簡化版**（1–2 萬顆粒子）：約一個工作天可完成，視覺精神一致。
- **10 萬顆等級的 WebGPU 版**：spatial-hash pipeline + HDR/ACES 渲染約 1,700 行 shader 與管線程式碼，重寫是數天等級的工程，且質感（glow、tonemap 曲線）需要重新調校，不會自動長得一模一樣。

**結論**：md = 設計圖，`particle-kit/` = 預製元件。新專案想直接複刻 → 整包帶走 `particle-kit/`；想重寫或避開 AGPL → 只帶 md，並預留重新實作與調校的時間。

---

## 12. 一句話總結

> 這個效果 = **Particle Life 模擬（物種互動矩陣產生湧現形態）** × **每次載入隨機抽 色盤/初始佈局/力規則** × **四層排程擾動讓它永遠不靜止** × **HDR 加法混合渲染的星雲質感**。
> 延伸圖片點雲：新增一個 seed pattern 即可接入；延伸多圖漸變：在 advance shader 加 target buffer + seek 力，讓十萬顆粒子集體遷徙過去。
