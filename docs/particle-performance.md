# 手機端粒子效能：分級降載

> 起因：首頁在 iPhone 17 上跑得順，但比較舊的手機「超卡」。
>
> ⚠️ 這份文件寫的時候首頁還叫 `/index-same`（跟舊的三張 canvas 版並排比較用），
> 後來它取代了舊版成為 `/`，舊版搬到 `/index-old`。下面提到 `/index-same` 的地方
> 指的都是**現在的首頁**。
> 這份文件記錄查到的原因、可用的旋鈕、以及分階段的處理方式。
>
> 相關文件：[`point-cloud-effect.md` §10 效能陷阱](./point-cloud-effect.md)、
> [`living-particle-motion.md` §8 效能](./living-particle-motion.md)、
> 成本模型的原始出處在 `app/composables/useParticleBudget.js` 檔頭。

---

## 0. 先修正三個常見的誤解

### 「調整動態」省不到效能

| 以為是效能旋鈕 | 實際上 | 出處 |
|---|---|---|
| `setSimSpeed` | 只是 `dt` 的乘數，每幀照跑全部 7 個 pass | `particle-life-gpu.js:1136`、`:1403` 起 |
| `PLAmbient`（環境擾動） | 純 setTimeout 排程，每 1.2~18 秒發一次 `disturb()`；`writeDisturb()` 本來就每個 active frame 都跑 | `particle-ambient.js`、`particle-life-gpu.js:1412` |
| `engine.pause()` 交錯 toggle 做隔幀 | **在需要它的情境下會讓事情更糟**，見 §5 | — |

真正有效的只有三個：**粒子數（∝ N²）**、**rMax（∝ rMax²）**、**DPR（只影響 render pass 6/7）**。

### 「幀率低 = 裝置太舊」只對一半

同樣掉幀，可能是真的跑不動、發熱降頻、低耗電模式、其他分頁搶 GPU、或只是開場那幾百毫秒在編譯 shader。
**一次性取樣很容易把暫時的判成永久的** —— 現有程式碼正是這樣（§3）。

### fps 的絕對值會騙人

iPhone 17 是 120Hz ProMotion，舊機是 60Hz。現在寫死的門檻 `fps < 45`：

- 120Hz 裝置就算掉了一半幀（120 → 60）也判「很好」
- 60Hz 裝置跑滿也永遠上不了 60

要看的是**幀時間分佈**（p50 / p95）對「這台機器實際交得出來的節奏」比，不是 fps 絕對值。

---

## 1. 成本模型

引擎的力場計算是空間雜湊。每顆粒子掃自己周圍 `(2·cellSubdivisions+1)²` 個格子：

```
cellSize   = max(8, rMax / cellSubdivisions)          particle-life-gpu.js:961
搜尋窗邊長 = (2·cellSubdivisions + 1) × cellSize
每幀候選對 ≈ N² × 搜尋窗面積 / canvas 面積
```

**對 N 是平方、對 canvas 面積是反比、對 rMax 是平方。**

實測基準（`useParticleBudget.js` 檔頭，同一台 M 系列 Mac、只改視窗寬度、DPR 1）：

| | 候選對 | fps |
|---|---|---|
| 52000 顆 @1440×900 | 47 M | 60 |
| 52000 顆 @390×844 | 185 M | 13 |

> ⚠️ 本文件其他地方的「候選對」數字都是**用這條公式推算的**（校準常數 0.59 對回上面兩點），
> **不是實機量測**。借到舊手機實測之後請回來取代。

每幀的 pass 與成本歸屬（`particle-life-gpu.js:1403-1540`）：

| Pass | 成本正比於 |
|---|---|
| 1 binFill / 3 sort / 5 advance | N |
| 2 prefixSum | binCount × log |
| **4 computeForces** | **N × 鄰居數 ← 計算主宰項** |
| 6a glow render | N × (pointSize × glowSize × zoom × dpr)² ← **填充率殺手** |
| 6b circle render | N × (pointSize × dpr)²，面積約是 glow 的 1/100 |
| 7 composeHdr | canvas 像素數（固定一次全螢幕） |

只有 6a / 6b / 7 隨 DPR² 放大；bin 網格用 CSS px，**降 DPR 不減 compute**。

---

## 2. 層級一：沒有 WebGPU 的手機走的是災難路徑

`makeEngine`（`particle-life-gpu.js:1831`）在 `!navigator.gpu`（或任何 WebGPU 例外）時**靜默** fallback 到
`particle-life.js`。呼叫端只能靠 `engine.backend` 事後得知，而站上目前只把它顯示在 hero 右下角、
**從未用於任何決策**。

那支 fallback 引擎：

| 事實 | 位置 | 後果 |
|---|---|---|
| `dpr = min(devicePixelRatio, 2)` 硬寫，**不看 `config.maxDpr`** | `particle-life.js:122, 202` | DPR-3 手機拿到 2，比 WebGPU 路徑的 1.25 多 **2.56 倍**填充 |
| `count: opts.count ?? 1400` —— 但我們**有**傳 count | `:126` | 8525 / 8772 顆跑在 **JS 主執行緒**的空間雜湊 + canvas2d 逐顆 `drawImage` |
| **沒有 `setTargets` / `setMorph`** | API 表面 `:974-1021` | 見下 |

最後一項的連鎖後果最嚴重。`MobileField.buildHold()` 的守門是：

```js
if (!engine?.readParticles || !engine.setTargets) return false
```

`readParticles` 有、`setTargets` 沒有 → return false → `ready` 永遠是 false →
`frame()` 每幀在 `if (!ready || !holdBase) return` 提早跳出。
`SpeakerPortrait.buildTargets()` 同理。

也就是說在這些裝置上：**開場構圖、人像收攏、閃動、換人的炸開重組，全部靜默失效** ——
但仍然照跑 8500+ 顆的 CPU 模擬與 DPR 2 的填充。

> **付了最高的成本，拿到壞掉的畫面。**

⚠️ **待查證**：WebGPU 在 iOS Safari 的出貨版本（我的理解是 Safari 26 / iOS 26，但需確認）。
若成立，絕大多數還沒升級的 iPhone 全部走這條路 —— 跟「iPhone 17 順、舊手機超卡」完全吻合。

> ✅ **首頁已處理**（階段 2）：`!navigator.gpu` 在建引擎「之前」就判到底檔，
> 點數 8525 → 1800，並額外 `setForce(0)` 讓人像停在正確的位置而不是化開。
> ⚠️ **`/index-old`（舊的三張 canvas 版）與 `/people` 還沒處理** —— 它們的引擎完全沒有這層判斷。

---

## 3. 層級二：`SpeakerPortrait` 為一個已停用的力場付全額搜尋成本

`SpeakerPortrait.vue` 建引擎時：

```js
forceFactor: LOCK_FORCE,   // 0.1 = 引擎 setForce 的下限
rMax: 55,
```

檔頭白紙黑字寫著力場被**刻意壓死**、畫面完全交給 seek 主導（那是「人像不會被力場抽成菌落」的關鍵）。
但 `rMax` 照抄了桌機的 55。

rMax 是「互動力場的作用半徑」。在 342² 的觀景區上：

| rMax | cellSize | 搜尋窗 | 佔 canvas | 相對成本 |
|---|---|---|---|---|
| 55（原本） | 27.5 | 137.5² | **16.2%** | 1.00 |
| 40 | 20.0 | 100² | 8.6% | 0.53 |
| **30（現行）** | **15.0** | **75²** | **4.8%** | **0.30** |
| 24 | 12.0 | 60² | 3.1% | 0.19 |
| 20（引擎下限 clamp 前） | 10.0 | 50² | 2.1% | 0.13 |

**`55 → 30` = 算力剩 0.30 倍（推算），而密度、平均粒距、五官清晰度完全不變。**

### 視覺等價的實測

「清晰度不變」這件事是量過的，不是推的。方法：在 390×844 的首頁上停在 PL.III，
用 `engine.setRMax()` 逐一切到 55 / 40 / 30 / 24（`setRMax` 只重配 bin buffer，**不 respawn、
不動 targets**，所以是乾淨的對照），各等 5.5 秒後截圖，把觀景區切成 6px 網格比亮度分布。

⚠️ 關鍵是**對照組**：閃動每秒都在換目標點，所以必須先量「同一個 rMax 相隔 1.5 秒」的差異
當雜訊底線，否則會把閃動誤讀成 rMax 的影響。

| | 佔格率 | 平均亮度 | 與 rMax 55 的相關係數 | 平均差（/255） |
|---|---|---|---|---|
| rMax 55（基準） | 0.319 | 16.17 | 1.0000 | 0.00 |
| rMax 40 | 0.319 | 16.14 | 0.9854 | 1.89 |
| **rMax 30** | 0.322 | 16.18 | **0.9823** | **2.12** |
| rMax 24 | 0.322 | 16.14 | 0.9833 | 2.03 |
| **對照組**（同 rMax 30，相隔 1.5 秒） | — | — | **0.9867** | **1.85** |

三個變體與基準的差異（0.982～0.985）**落在閃動自己的雜訊底線（0.9867）上**，而且
40 → 30 → 24 之間**沒有單調惡化** —— 若 rMax 真的在影響畫面，應該看得到遞減。

→ **rMax 55 在這一區是純粹的浪費，已證實。**

⚠️ 為什麼不從 density 買效能：成本 ∝ d²，但感知細節只 ∝ √d（點畫的解析度就是平均粒距 = 1/√d）。
而這張人像在模擬空間只有約 294px，眼睛與眼鏡框只剩 10~19px 寬 —— 粒距必須 ≤ 3.7px 才有約 3 顆粒子
橫跨一條眼鏡框。`d = 0.075` → 粒距 3.65px，**已經卡在那條線上**。砍 density 就是拿眼鏡框換算力。

---

## 4. 層級三：現有的 fps 自適應幾乎不會觸發

`MobileField.vue`、`Home/Field.vue`、`Home/ParticleField.vue`（`/index-old`）三處同一個 pattern：

```js
setTimeout(() => { if (engine.getFps() < 45) engine.setCount(count / 2) }, 900)
```

| 問題 | 細節 |
|---|---|
| **讀到的多半是初值** | `fpsSmoothed` 初值**硬編 60**（`:702`），EMA α=0.08 要約 40 幀收斂 95%。15fps 的機器上那是 2.7 秒 —— 900ms 讀到的有一半以上還是 60 |
| **一次性、單級、無回升** | 發熱降頻是幾十秒後才發生的 |
| **用了最破壞性的手段** | `setCount` → `allocParticleBuffers`（`:943-956`）destroy targets buffer、`morphPull/morphGrip` 歸零、`targetsGeneration++`。`living-particle-motion.md:312-318` 把它記為「只在低效能機器才觸發、開發機重現不出來」的陰險 bug |
| **最貴的那塊沒有** | `SpeakerPortrait` 完全沒有這段 |

> ✅ **已在階段 3 換掉**：`MobileField` 那段一次性減半已移除，改成
> `useParticleQuality` 的持續量測（連 2 個視窗失敗才降、4 秒冷卻、最多降 2 次）。
> ⚠️ `Home/ParticleField.vue`（4000ms 版）與 `Home/Field.vue` 的那兩份**還在** ——
> 那是桌機路徑，本次範圍外。

`getFps()` 還有三個不適合當判準的性質：

- `instFps` 用**未 clamp** 的 real dt（`:1397`）→ 切分頁回來會被一個 5 秒的 dt 拉出假低點
- `pause(true)` 時 EMA **仍在更新**（`:1391-1399` 在 `if (!config.paused)` 之外）→ 量到的是 rAF 節奏不是渲染負載，**被暫停的那張 canvas 會回報「很順」**
- per-engine，但使用者感受到的是整頁的流暢度
- `readParticles()` 是 GPU→CPU 的 `mapAsync` 硬同步點，會汙染 EMA 好幾秒

---

## 5. 為什麼不用 `engine.pause()` 交錯做隔幀

`frame()` 的 `raf = requestAnimationFrame(frame)` 在 `if (!config.paused)` **外面**（`:1541`），
paused 時整段 encode + submit 被跳過。所以「隔一幀 pause」在外部是做得到的。**但它在需要它的情境下是負收益。**

設 rAF 週期 R（60Hz = 16.7ms）、一幀的 GPU 工作量 W：

| 情境 | 現況 | stride-2 之後 |
|---|---|---|
| W = 8ms（本來就 60fps） | 60fps，GPU duty 48% | 30fps，duty 24%。✅ 有效 —— 但這是**不需要它**的情境 |
| **W = 33ms（現在 30fps，也就是「超卡」那類）** | **30fps**，duty 100% | 週期 = 33 + 16.7 = 49.7ms → **20fps**，duty 66%。❌ 省電是真的，畫面明顯更卡 |
| W = 25ms | 約 30fps | 25 + 16.7 = 41.7ms → 24fps。❌ |

第二層傷害：`writeDelta(smoothedDt)` 只在 active frame 呼叫，而 `smoothedDt` 被 clamp 在
`[0.004, 0.033]`（`:1394-1396`）。W=33ms 時真實幀間隔變 49.7ms，但引擎每個 active frame 只推進 33ms
（撞上限）→ **模擬以真實時間的 0.66 倍前進**，變成「慢 + 頓」。
可以用 `setSimSpeed(base × stride)` 補回演化速率，但 20fps 這件事一點都沒改善。

**真正的 sim-stride（compute 30Hz / render 60Hz）需要改引擎**，`point-cloud-effect.md:394` 的待辦
清單有列。但它最多 2 倍，而 §3 + 檔位化合起來有 12–25 倍的調節範圍 —— 所以排在最後，
且屆時要複製 `particle-life-gpu.js` 而非原地改（見 §8）。

---

## 6. 可用旋鈕總表

| 旋鈕 | 成本 | 執行期可改 | 效果 |
|---|---|---|---|
| `count`（density） | **昂貴且破壞性**（respawn + `targetsGeneration++`） | ✅ 需配合重建 targets | ∝ N²，**最大的槓桿** |
| `rMax` | 中等（重配 bin buffer，**無 early-return**） | ✅ | ∝ rMax²，portrait 上幾乎免費 |
| `cellSubdivisions` | 只能建構時給（**沒有 setter**） | ❌ | 約 13% |
| DPR | 中等（重建 HDR + bind group） | ✅ 見 §7 | 只影響 pass 6/7 |
| `setShowGlow` | **零**（純 JS boolean） | ✅ | 省掉面積約 100 倍的 pass。⚠️ 手機兩支都已硬寫 false，**已經領完了** |
| `pointSize` / `particleOpacity` | 便宜（單一 uniform） | ✅ | 不省算力，是**低檔位的視覺補償** |
| `pause` | 零 | ✅ | 已用在 IO / visibility / idle，**已經領完了** |

---

## 7. 執行期改 DPR 不需要重建引擎

引擎沒有 `setMaxDpr`，而且**不可以呼叫它的 `resize()`**：

```js
function resize() {                                    // :1302
  dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr);
  canvas.width  = Math.floor(newW * dpr);
  const sizeChanged = (newW !== W) || (newH !== H);     // ← 只比較 CSS 尺寸
  ensureHDR();                                          // ← 無條件重建 HDR texture
  if (sizeChanged && ...) { allocBinBuffers(); rebuildBindGroups(); }   // ← 有條件
}
```

只改 DPR、CSS 尺寸不變時 `sizeChanged === false` → **bind group 仍指向已 destroy 的 hdrTexture** →
validation error / 黑畫面。

**但直接寫 `canvas.width` 是安全的** —— `frame()` 進入 `if (!config.paused)` 的第一件事就是：

```js
if (!hdrTexture || hdrTexture.width !== cw || hdrTexture.height !== ch) {   // :1404-1408
  ensureHDR();
  rebuildBindGroups();      // ← 這裡是配套的
}
```

而且它早於 `writeDelta` 與 encoder，所以中間不會有任何一幀用到不一致的狀態。
好處：`W/H` 是 CSS px，改 `canvas.width` 不動它 → **targets 不失效、`targetsGeneration` 不跳號、不 respawn**。

⚠️ **待查證**：WebGPU canvas context 在 `canvas.width` 改變後是否自動重配 swap chain。Chrome + Safari 各測一次。

---

## 8. 分階段處理

原則：**先做不需要新機制、可獨立回退的修正；量到數字之後再決定要不要蓋機制。**

### ✅ 階段 1 —— 四處改動，不依賴任何新機制

| 檔案 | 改動 | 效果 |
|---|---|---|
| `Home/SpeakerPortrait.vue` | `rMax: 55 → 30` | 候選對 7.3M → 2.2M（推算）。密度與清晰度不變 |
| `useParticleBudget.js` | `countFor()` 的 rect fallback 退回 `min`，不要退回視窗尺寸 | 修掉佈局競態拿到 1.48 倍點數 |
| `people.vue` ×3 | 補 `maxDpr: maxDpr()` | 手機 DPR 2 → 1.25，填充省 2.56 倍 |
| `people.vue`（sticky 那顆） | `rMax: 55 → 20`（它是 `forceFactor: 0`） | 算力剩 0.13 倍，零視覺風險 |

### 階段 0 —— 讓裝置自己說話（零行為改變）

沒有舊手機就沒有真數字。`app/utils/particleFieldLooks.js` 加 `particleDebugFromLocation()`，
沿用現有 `fieldLookFromLocation()` 同一套白名單解析。

**`?tier=` 與 `?fps=1` 已經跟著階段 2 一起落地了**（見上面的「驗收工具」）。還沒做的是：

- `?stress=N` → density × N，在快機器上重現舊手機的負載形狀（見 §9-3）
- 自訂 HUD（p50 / p95 / vsync / 各引擎的 count）—— 那要等階段 3 的量測器才有東西可顯示

### ✅ 階段 2 —— pre-flight 檔位（只往下鎖，不往上猜）

新增 `useParticleQuality.js`（模組層級單例，同 `useParticleStage` / `useViewportMode`）
與 `particleTiers.js`（純資料表，同 `particleFieldLooks.js` 的「表與邏輯分離」）。
**各檔位的實際數值以 `particleTiers.js` 為準**，這裡不重複一份（會腐爛）。

⚠️ 契約同 `useParticleBudget`：**只會減、不會加**。沒有任何 navigator 訊號能證明「這台很快」：

| 訊號 | 用不用 | 理由 |
|---|---|---|
| `navigator.gpu` 存在與否 | ✅ **直接判到底檔** | 全瀏覽器可靠，而且它擋的是 §2 那個量級錯誤 |
| `prefers-reduced-motion` | ✅ 上限鎖低檔 | 使用者「說」的比我們「猜」的可信 |
| `navigator.connection.saveData` | ✅ 上限鎖低檔 | 明確的省電意圖（Chrome/Android only） |
| `navigator.deviceMemory` | ✅ ≤2 / ≤4 往下鎖 | ⚠️ Safari / Firefox 是 `undefined`，**一律當「沒訊號」，不可推論** |
| `hardwareConcurrency` | ❌ | CPU 訊號預測 GPU 負載，big.LITTLE 讓高低階都回 8 |
| UA / 機型表 | ❌ | iOS 一律只回 `"iPhone"`，Android 表必然過時 |
| `devicePixelRatio` / 螢幕尺寸 | ❌ | 跟 GPU 吞吐沒有因果關係 |

**在 iOS 上 pre-flight 幾乎什麼都做不了**（有 WebGPU 的 iPhone 最舊是 11、最新是 17，GPU 差 5~8 倍
但 API 上分不出來），所以真正的工程投入必須放在執行期量測。

三條必須寫進註解的設計理由：

- **`pointSize` 隨檔位放大不是裝飾**：粒子少了、點大小不變 → 畫面變暗變薄，看起來像壞掉而不是刻意的稀。
  維持感知亮度要維持 `N × pointSize²`，即 `pointScale ≈ √(N_滿檔 / N_該檔)`。
- **`dprCap` 降到 1.0 與 `pointSize` 放大必須綁在一起**：`useParticleBudget` 檔頭早就預告
  「壓到 1.0 會讓 pointSize < 1 的核心變次像素、開始閃爍，要一起把 pointSize 加大」。
- **`ambient` 不是效能旋鈕**，低檔位調低是視覺理由（稀疏場上一記大脈衝會把整片打散）。
  ⚠️ **不能關掉** —— 沒有擾動的話場幾十秒後會收斂成靜態圖。

⚠️ 這一階段第一次讓 `prefers-reduced-motion` **真的降低 GPU 負載**（現在六個元件都只關掉漂移 /
呼吸 / 閃動，compute + render pass 一個都沒少），補上 `point-cloud-effect.md` 待辦清單最後一條。

#### ⚠️ 預設是滿檔，不是中間檔

`TIER_DEFAULT = 3`（＝今天線上的樣子），不是設計時想的 t2。理由：**目前只有 pre-flight，
還沒有執行期量測**。若預設就給 t2，等於所有手機（包括跑得很順的）都被無條件降級，而且沒有
任何機制把它們升回來。等階段 3 上線、能真的把降下去的檔位判斷出來之後，才應該改成 2 並配合
開場的一次性升檔。

#### 實測（Playwright，390×844）

| 情境 | 檔位 | 粒子數 | rMax | backend |
|---|---|---|---|---|
| 無訊號（基準） | t3 | **8525** | 72 | webgpu |
| `?tier=0` 強制 | t0 | 1620 | 52 | webgpu |
| `prefers-reduced-motion` | t1 | 3413 | 62 | webgpu |
| **`navigator.gpu` 拔掉** | **t0 + cpuFallback** | **1800** | 47 | **canvas2d** |

- 基準完全等於階段 2 之前的數值（MobileField 8525、SpeakerPortrait 8772 / rMax 30）——
  **機制對無訊號裝置是真正的 no-op**，這是「只會減、不會加」契約的驗收條件。
- 無 WebGPU 那條是 **8525 → 1800，4.7 倍降載**，三個情境都 0 console error / 0 page error。

#### 亮度補償的實測

低檔位放大 `pointSize` / `opacity` 是為了讓「極稀」看起來像刻意的設計而不是壞掉。
用 `?tier=N&hero-animation=2` 各拍一張，量整張的平均亮度：

| | 粒子數 | pointSize | opacity | 平均亮度 | 亮於 8 的像素 |
|---|---|---|---|---|---|
| t3 | 8525 | 0.80 | 0.55 | 8.21 | 7.45% |
| t2 | 6089 | 0.92 | 0.55 | 7.79 | 7.15% |
| t1 | 3897 | 1.08 | 0.605 | 8.59 | 7.86% |
| t0 | 2192 | 1.36 | 0.66 | 8.95 | 8.35% |

粒子數少了 3.9 倍，感知亮度守在 7.8～9.0 —— 視覺上是「顆粒變粗」而不是「變暗」。

#### ⚠️ 兩個實作時才發現的坑

1. **`opacityScale` 只在 `makeEngine` 給一次是沒用的。**
   `MobileField.frame()` 每幀都會呼叫 `opacityNow()` 再 `setParticleOpacity`，所以建構時
   給的值下一幀就被洗掉 —— 實測 t0 的 opacity 仍停在 look 的原值 0.55。補償必須寫進
   `opacityNow()` 裡面。任何「每幀都會被重寫的旋鈕」都有同一個陷阱（camera、morph 同理）。

2. **CPU 路徑要順手把力場也關掉。**
   `particle-life.js` 沒有 `setTargets` / `setMorph`，所以 seek 完全不存在；而 nebula 帶著
   全域微斥力，人像會慢慢化開成一團噪點。偵測到之後 `engine.setForce(0)`，粒子就停在
   `seedPattern` 撒好的位置：**一張靜態但正確的點雲人像**。這比「會動但爛掉」好，也符合
   「最低檔也不關掉粒子」的要求。判斷用 `if (!engine.setTargets)` 而不是 `backend`，
   因為真正相關的是能力而不是名字。

#### 驗收工具（已可用）

| 參數 | 作用 |
|---|---|
| `?tier=0\|1\|2\|3` | 強制檔位，不做偵測也不做升降。設計師在桌機把視窗縮到 390×844 就能看各檔長相 |
| `?fps=1` | 打開引擎自帶的 overlay（印 `fps · count · backend`）。⚠️ 它印的是 `fpsSmoothed`，初值硬編 60、EMA 慢、paused 時仍在更新 —— **只能當參考，不要拿它做判斷**（見 §4） |
| `window.__pq()` | 檔位、是否強制、cpuFallback，以及各訊號的原始值 |
| `window.__mobileDbg()` / `__samePortraitDbg()` | 多了 `tier` / `cpuFallback` / `rMax` |
| `window.__pqAdapter` | dev only，`adapter.info` 的原始字串。**只記錄不採用** —— 先在真實裝置上收集長什麼樣，之後再決定要不要拿它分檔 |

#### 這一階段接不住的兩種情況

**都是靜態判斷的先天限制**，要階段 3 才處理：

1. **跑久了發熱降頻** —— 開場量不到，而且 iPhone 17 也會
2. **有 WebGPU 但 GPU 很弱的 iPhone** —— iPhone 11 到 17 差 5~8 倍，Safari 沒有任何 API
   分得出來。**這是最大的盲區**

### ✅ 階段 3 —— 執行期監看 + 降檔

一個共用 rAF 量整頁的交幀節奏（**不用 `engine.getFps()`**，理由見 §4）：

- 量**幀時間的 p50 / p95**，用百分位數不用 EMA（一次 GC 的尖峰只會動到 p95，不會帶歪 p50）
- vsync 週期取「視窗內最短幀間隔」吸附到 120/90/60 格點，**每個視窗重估**（ProMotion 是可變更新率）
- 元件用 `markActive(id, bool)` 明講「我現在真的在渲染」。⚠️ **這條最重要** —— 兩張 canvas 都
  pause 時會量到瀏覽器空轉的假順暢讀數，然後觸發錯誤的升檔
- `suspend(ms)` 包住 `readParticles` + `buildSlotTargets`（後者是 O(N log N) 的主執行緒排序）與換人動畫
- 遲滯：連 2 個視窗失敗才降檔、4s 冷卻、整個 page view 最多降 2 次、到底檔就 `stop()`
- **升檔只准開場一次**，且要求 1.6 倍餘裕。⚠️ 發熱降頻是單向棘輪，「fps 一回升就升檔」會製造極限環
  （升檔 → 更熱 → 降頻 → 降檔 → 稍涼 → 升檔…），每圈一次可見的 respawn，穩態剛好停在最燙的點

⚠️ **`setCount` 之後不需要自己重建目標點**，現有機制已完整處理：
`setCount` → `allocParticleBuffers` 把 morph 歸零並 `targetsGeneration++` → 下一幀 `targetsStale()`
抓到世代跳號 → `invalidateTargets()` → `REBUILD_SETTLE_MS` 後 `buildHold()`。
中間那 700ms 因為 `ready=false` 不寫 targets/morph，粒子純靠力場演化，不會被 seek 吸到 (0,0)。

`SpeakerPortrait` **刻意不訂閱換檔**，改成 `await whenTierReady()` 才建引擎 —— 換檔要走 `setCount`，
在人像上那是「整張臉重新點畫」。順帶解掉一個現有的隱形開銷：它建完引擎後 `config.paused` 預設 false，
要跑完 8 幀暖機 + 一次 `readParticles` 才 `syncPause()`，那十幾幀剛好疊在 `MobileField` 開場最忙的時刻。

#### 實測（Playwright 390×844，注入每幀 45ms 的忙碌迴圈）

**健康路徑（無負載，12 個視窗）**：p50 16.7ms、p95 17.3~17.6ms、vsync 正確辨識為
16.67（60Hz）、drop 0、每個視窗 90 個樣本。**tier 全程維持 3、failStreak 0、降檔 0。**
—— 跑得順的裝置不會被誤降，這是這個機制最重要的驗收條件。

**負載路徑**：

| 時間 | p50 | failStreak | 動作 | 粒子數 |
|---|---|---|---|---|
| 注入負載 | 16.7 → 50 | 0 → 1 | **不動**（要連 2 個視窗） | 8525 |
| 下一個視窗 | 50 | 2 | **t3 → t2** | 8525 → **6089** |
| 之後 ~5 秒 | 50 | 0 | 冷卻中，`windows` 不增加 | 6089 |
| 冷卻結束 + 2 視窗 | 50 | 2 | **t2 → t1** | 6089 → **3897** |
| 再撐下去 | 50 | — | **`stop()`**（達 MAX_DEMOTIONS） | 3897 |
| **移除負載** | 回到 16.7 | — | **不升回去** | 3897 |

`FAIL_STREAK`、`COOLDOWN_MS`、`MAX_DEMOTIONS`、`stop()`、以及「刻意不升檔」
全部照設計運作。

**⚠️ 最關鍵的正確性條件：`markActive` 的假順暢防護。**
捲到 PL.IV（兩張 canvas 都離屏 → 都 `pause`），持續動滑鼠 6 秒（所以不是 idle）：
`active: []`、兩顆引擎 `paused: true`、**累積視窗數 0**。
沒有這條的話，量測器會在瀏覽器空轉時讀到「超級順」，然後（在未來有升檔時）錯誤地升檔。

**回歸**：`?tier=1` 強制時 `monitoring: false`（不啟動量測）；桌機首頁
仍是 1 張 canvas / 50000 顆、`__pq` 根本沒被建立（Field.vue 沒接這套）；
平板 t3 / 17836 顆。全部 0 console error / 0 page error。

#### ⚠️ 兩個補丁（實作後才發現的）

**1. 手機的閒置省電會讓動態直接停住 —— 跟裝置效能無關**

`useParticleStage` 的 `IDLE_STOP_MS = 5000` 是照桌機訂的：滑鼠總會抖一下，所以
「連續 5 秒沒有座標變化」確實代表使用者離開了。**但這個推論在手機上是錯的。**
手機使用者「停下來看著 hero 五秒」是完全正常的 —— 沒有滑鼠、不需要捲動、
不產生任何事件。實測（390×844，載入後完全不碰螢幕）：

| 時間 | idle | paused |
|---|---|---|
| 3 秒 | false | false |
| 6.5 秒 | **true** | **true** ← 動態直接停住 |
| 11.5 秒 | true | true |
| 碰一下 | false | false ← 又活過來 |

有使用者（iPhone 15）回報「手機打開動態會直接停住」，就是這個。

修法：門檻改成看 `(pointer: fine)` —— 桌機維持 5 秒（滑鼠抖動是可靠的在場訊號），
觸控裝置拉到 60 秒當純粹的電池保底。手機上真正可靠的「使用者離開了」訊號是
`visibilitychange`（切 App、鎖螢幕），那個各元件早就接了。
⚠️ 用 `(pointer: fine)` 而不是視窗寬度：這裡問的是「有沒有一個會一直抖的指標
裝置」，不是螢幕多大。而且每次 `poke()` 都重新問一次 —— 使用者可能中途插上滑鼠。

**2. 13.3fps 以下的裝置永遠不會降檔**

視窗關閉的條件原本是「幀數滿 90 **或** 時間到 1500ms，然後幀數不足 20 就丟掉」。
在 1500ms 內湊不到 20 幀（也就是 **13.3fps 以下**）的機器上，視窗永遠不會關閉，
於是永遠不會降檔 —— 而那正是最需要降檔的那群（`useParticleBudget` 檔頭記的
PL.IV/V 手機實測就是 13fps）。

改成幀數是硬性條件、時間只是「夠了就別再等」的上限。實測每幀燒 95ms（約 10fps）：
第 1 個視窗湊滿 20 幀就關閉並快速降到 t2、第 3 個降到 t1、第 5 個 `stop()`，
最終停在 3897 顆。修之前它會永遠停在 8525 顆。

#### 開場快速降檔

正常規則（連 2 個視窗失敗）在弱機上要「暖機 1.2s + 兩個視窗 3s」≈ 開場後 5~6 秒
才降到對的檔位 —— 而那 5 秒正好是 hero，第一印象。所以加一條快速通道：
**第一次降檔前，若單一視窗的 p50 超過門檻的 1.5 倍（明顯不是雜訊），就不等第二次。**

⚠️ 門檻要比 `TARGET_P50_MS` 高很多，因為這一版**不會升回去**，誤判是永久的。
勉強過線的情況（例如被一次字型載入拖慢）必須走原本的兩視窗規則。
p50 本身已經對單一尖峰免疫（那只會動 p95），所以 p50 就超過 1.5 倍代表整個視窗
都在掙扎。只在 `demotions === 0` 時有效 —— 已經降過一次還在掙扎的話，多等 1.5 秒
確認不算什麼，而誤判的代價更高。

實測：p50≈50ms 的情境 **1 個視窗就降檔**（原本要 2 個）；p50 只略高於門檻的情境
**不會**誤觸發，tier 維持 3、降檔 0。

⚠️ **刻意不做「保守起步 + 開場升檔」**（原本計畫的階段 4）。那會讓每一台好機器
都付一次 respawn（`setCount` 是整場重生 + 700ms 重建目標點，看得見）。
維持滿檔起步、只加速降檔的話：好機器**永遠不付 respawn**，弱機約 2 秒就到位。

### 階段 4 —— 執行期 DPR（🔎 先做 §7 那個 5 分鐘驗證）

### 階段 5 —— 複製引擎做 sim-stride（🚧 預設不做）

閘門：階段 1–4 全部上線後，實機在低檔位的 p50 仍 > 33ms。
屆時複製 `particle-life-gpu.js`（**不原地改**）並加 `yarn kit:diff` 讓差異隨時可見。
⚠️ 要一併處理 `smoothedDt` clamp 上限 / 分子步的積分穩定性 —— 那不是文件說的「小改動」。

---

## 9. 沒有舊手機怎麼驗證

| 方法 | 驗得到 | **驗不到** |
|---|---|---|
| `?stress=3&fps=1`，視窗縮到 390×844 | 成本 ∝ N² → 9 倍負載，忠實重現舊手機的 **GPU 負載形狀**；檔位狀態機會不會震盪 | 發熱降頻（Mac 有主動散熱）、手機 TBDR 架構的成本曲線 |
| DevTools **6× CPU throttling** + 點換講者 | `buildSlotTargets` 的 O(N log N) 排序 + `readParticles` 硬同步。卡超過 300ms 就是舊手機換講者的真實體感 | ❌ compute shader、填充率 |
| `?tier=0&fps=1` | 各檔位長相 —— **驗收 `pointScale` / `opacityScale` 補償的唯一實用方式** | 效能 |
| Playwright | 檔位狀態機的確定性回歸 | ❌ 效能 |

**誠實的底線：門檻值不可能在沒有實機的情況下定出來。**
建議借一台舊 iPhone 一次，USB 接 Mac 的 Safari Web Inspector → Timelines，各檔位跑 60 秒，
把 p50 補進 `particleTiers.js` 檔頭。**做這一次，整張表就從推算變成實測。**

---

## 10. 待查證（不要當成已知）

- WebGPU 在 iOS Safari 的最低版本與機種涵蓋範圍
- `adapter.info` 目前各瀏覽器的欄位與去識別程度
- `navigator.hardwareConcurrency` 在 iOS 的實際回傳值（即使查證了仍不建議用）
- WebGPU swap chain 在 `canvas.width` 改變後是否自動重配
- 專案的 Playwright Chromium 有沒有 WebGPU
