# 讓粒子場「活起來」— 動態效果實作要領

> 對象：`app/components/Home/ParticleField.vue`（首頁固定背景粒子場）、
> `app/components/HomeSame/Field.vue`（一鏡到底版）、`app/utils/particleFieldLooks.js`
> （效果目錄）與 `public/particle-kit/`（引擎）。
> 目的：把 2026-08 這次做首頁 PL.I → PL.II 收攏效果時，**踩過的坑與判斷依據**寫下來，
> 讓之後做類似效果（其他區塊、其他頁、換圖）能直接照著走，不必重新撞一次。
>
> 2026-08 下旬補上：力矩陣的**兩種**失效模式與量化判準（§1.1.1、§7）、
> 「維持開場構圖」而不把畫面凍住的做法（§10）、效果目錄與網址參數（§11）。
>
> 引擎本身的原理（Particle Life、spatial hash、HDR 渲染、圖片轉點雲）看
> [`point-cloud-effect.md`](./point-cloud-effect.md)。本文只談**動態與編排**。

---

## 0. 一句話總結

> 「生動」不是調參調出來的，是**選對力矩陣**（非對稱）＋**讓位置永遠由物理決定**（不要用
> JS 插值去驅動位置）。剩下的都是圍繞這兩件事的工程細節。

---

## 1. 為什麼有些粒子場看起來「呆板」

起點是設計師給的 demo 動起來很死板，而 [sandbox-science.com/particle-life](https://sandbox-science.com/particle-life)
看起來有生命力。實際去讀 sandbox 的預設值來對照（兩邊引擎是**同一份程式碼**，
`particle-life-gpu.js` 的 shader 就是從 SandboxScience 移植的）：

| 項目 | SandboxScience | 當時的我們 | 差距 |
| --- | --- | --- | --- |
| Repel Force | 1.0 | 1.1 | 無 |
| Force Multiplier | 1.0 | 0.95 | 無 |
| Friction | 0.3 | 0.31 | 無 |
| Species | 7 | 3–7 | 無 |
| **力矩陣** | `Cross 5`（非對稱） | `cellular`（對稱） | **關鍵** |
| **Δt** | 跟著真實影格 | `simSpeed 0.5`（半速） | 大 |
| **邊界** | None（開放空間） | 寫死 wrap | 中 |
| **相機** | Cinematic / Tracker / zoom-pan | 靜態 | 中 |
| 滑鼠 | 持續力場（Attractor/Repeller） | 單發脈衝 `disturb()` | 小 |

**物理常數幾乎一模一樣** —— 所以呆板不是調參問題。

### 1.1 最關鍵：力矩陣的對稱性

```js
// cellular —— 對稱：i 對 j 的作用力 == j 對 i 的作用力
m[i][j] = (i === j) ? 0.8 : -0.55
```

對稱矩陣的系統**存在能量最低態**，會收斂到一堆不動的圓球菌落。加再多擾動也只是把它推開、
然後它再走回去。

```js
// spiral-conveyor —— 非對稱：i 吸引 i+1，但 i+1 去追 i+2，不回頭
self = -0.1;  j === i+1 → 0.7;  j === i+2 → 0.3;  其餘 → -0.6
```

非對稱矩陣**沒有靜止解**，永遠在追逐。這是生命感唯一且最大的來源。

`particle-life-rules.js` 裡的分類：

- **對稱、會定住**：`cellular`、`chains1`、`chains2`、`chains3`、`bipartite`、`ring-road`、
  `symbiosis`、`triad-flocks`、`dimers`、`swarm`、`membrane`
- **非對稱、會一直動**：`spiral-conveyor`、`rps`、`snake`、`orbital`、`tri-spiral`、
  `vortex`、`helical`、`wavefield`、`predator`
- `self` 為**負**（如 `spiral-conveyor` 的 −0.1）→ 絲狀環流，像星雲
- `self` 為**正**（如 `snake` 的 1.0）→ 聚成一顆顆分明的群落，像細胞

> 選 preset 時先問兩題：**對稱嗎？self 是正是負？** 這兩題就決定了 80% 的觀感。

### 1.1.1 非對稱是必要條件，不是充分條件（2026-08 補）

`shells` 曾被歸在「非對稱」那類，但它照樣塌 —— 因為**還有第二個獨立的失效模式**。
把兩者分清楚，才知道該調哪裡：

| | 症狀 | 指標 | 成因 |
| --- | --- | --- | --- |
| **定格** | 結構成形後就不動了 | `speed` → 0 | 力矩陣對稱，存在靜止解 |
| **塌陷** | 擠成少數幾團，畫面大半是空的 | `fill` 低、`clump` 高 | `self` 正值太大，又缺乏把群落推開的力 |

`shells` 的 `SELF = 0.9` 太強，還沒開始追就先各自塌成實心球；
`snake` 的 `self` 一樣是 1.0 卻能用，是因為它對非鄰居給 **0** 而不是負值 ——
群落之間沒有互斥力去把彼此擠成孤立的球。

> **`self` 正值大 + 非鄰居給負值 = 一定塌。** `cellular`（`0.8 / −0.55`）就是這個組合，
> 也是最典型的反例。

實測（1440×900、跑滿 25 秒，指標定義見 §7）：

| preset | fill | clump | speed | 判定 |
| --- | --- | --- | --- | --- |
| `spiral-conveyor` | 0.75 | 0.11 | 131 | ✅ 滿版有內容 |
| `tri-spiral` | 0.82 | 0.06 | 110 | ✅ |
| `rps` | 0.78 | 0.06 | 67 | ✅ |
| `snake` | 0.015 | 0.94 | 28 | ⚠️ 一直在動，但 98% 畫面是空的 |
| `cellular` | — | — | — | ❌ 36000 顆塌成約 8 顆球 |
| `swarm` | — | — | — | ❌ 塌成約 6 顆球 |

⚠️ **這不是我們的參數調壞了。** 拿 sandbox demo 的官方範例（`webconf-visual-2026/sandbox.html`
右上「載入範例」）逐一跑過，5 組裡有 4 組在滿版畫面上就是這個樣子。那些範例是設計來
**出印刷素材**的（每組都帶 `exportGlow` / `exportScale`，那個工具本身叫「取素材實驗場」），
散落的球當標本圖版很好看，當動態背景則是空的。
**直接照搬 sandbox 參數到滿版背景之前，先量一次。**

### 1.2 `simSpeed` 是慢動作，不是「呼吸感」

`particle-life-gpu.js` 的 `writeDelta()` 直接把 dt 乘上 `simSpeed`。0.5 就是字面上的半速。
配上已經收斂的對稱矩陣，觀感就是「慢動作的靜止圖」——**兩個問題疊起來才是 demo 呆板的全貌**。

修對稱性之後，simSpeed 才變成有意義的節奏旋鈕（見 §2）。

### 1.3 相機會動，畫面就會活

`writeCamera()` 原本把中心寫死在 `(W/2, H/2)`，只有 zoom 沒有 pan。這次補了
`cameraX/cameraY` 與 `setCameraOffset(x, y)`。

就算粒子場本身變化很慢，緩慢的推移視差也會讓畫面「活著」。成本是**一次 16 bytes 的
uniform write**，可以放心逐幀呼叫。

```js
// 兩個不同週期的正弦疊加，避免看得出循環
dx = Math.sin(t * 0.021) * 42 + Math.sin(t * 0.006) * 26
dy = Math.cos(t * 0.017) * 30 + Math.sin(t * 0.010) * 16
dz = 1 + 0.035 * Math.sin(t * 0.011)
```

⚠️ 相機平移有上限：粒子只存在於 `[0,W]×[0,H]`，推出這個範圍就會看到空白。
可推的最大比例 = `(zoom − 1) / 2`。

---

## 2. 節奏編排：速度要分段，而且不對稱

單一固定速度一定不對。實際好用的是**三段疊加**：

```
開場   1.5   ← 粒子從 seedPattern 的螺旋構圖「散開」的過程要看得到
待機   0.16  ← 散開後極慢，只是緩緩呼吸
捲動  +0.44  ← 依捲動速度即時加速，停下來再緩降
```

實作在 `driftLoop()`：開場用 hold + smoothstep 的包絡，捲動用 `scrollY` 差分算速度。

### 要領：所有跟隨都要「攻擊快、釋放慢」

```js
const k = target > current ? ATTACK : RELEASE   // ATTACK 0.14, RELEASE 0.022
current += (target - current) * k
```

加速要跟得上手感，減速要拖一下 —— 硬切會很突兀。這個模式在這支元件裡用了三次
（`simSpeed`、`scrollHeat`、`morphAmount`），每次都是對的。

### 捲動中壓低互動力場

```js
forceFactor = FORCE_FACTOR * (1 - SCROLL_CALM * scrollHeat)   // SCROLL_CALM 0.6
```

捲動時暫停「自動擴散」，遷移讀起來乾淨；停下來再放回去，粒子就在輪廓裡重新活過來。

### 別忘了 `PLAmbient`

四層擾動（代謝／呼吸／亂流／潮汐）仍然要掛，但它應該是**底噪**而不是主要動能來源。
修好對稱性之後把 `intensity` 降到 0.55 就夠了 —— 之前調到 1.0 是在「救場」。

---

## 3. 「變形後還要繼續運作」的三條路

這是整個效果的核心決策。三條路都實作過，結論很明確。

### 路線 A — 相機收攏

只移動相機、換色盤，不碰粒子。零成本、全程活著，**但形狀是模擬長出來的，不是指定的圖**。
適合「氛圍變化」，不適合「要變成某個東西」。

### 路線 B — JS 每幀插值位置（`people.vue` 那套）

`readParticles()` 讀回快照 → 與目標點配對 → 每幀 lerp → `respawn()` 整批上傳。

**能動，但有結構性缺陷，不建議用在需要「持續運作」的地方：**

1. **位置由快取軌跡驅動 → 軌跡會過期。** 只要粒子中間自己動過（力場沒完全關掉），
   下次用舊軌跡重算就會把那段漂移抹掉 —— 畫面上是「先彈回原位再走」。
2. 想修這點只有兩種辦法，而且**互斥**：
   - 每幀都重寫位置 → 不會過期，但停著時粒子完全不動（形狀變成死的貼圖）
   - 只在捲動時重寫 → 活的，但停頓後恢復會跳
3. 成本高：48k 粒子每幀上傳約 960KB，第二區塊 fps 掉到 40 出頭。

> 中間我試過「偵測反向/停頓就重新錨定」來繞過 ①，結果引入更糟的 bug：
> 重新錨定會把遷移量 `u = (progress − anchor)/(1 − anchor)` 一起歸零，
> 在 progress ≈ 1 附近錨定就變成 `(1−1)/(1−1)` → **永遠到不了目標**。
> **教訓：不要把「更新位置基準」和「重新開始遷移」綁在同一個參數上。**

**B 的正當用途**：花半小時驗證構圖（位置、大小、色盤對不對），確認視覺方向後換掉。
前置的取樣、配對、色盤邏輯都能沿用到 C，不會白寫。

### 路線 C — shader seek 力（推薦）

在 `particleAdvance` shader 裡把粒子往目標點導引，**而 particle-life 互動力場同時照常跑**。

```wgsl
if (morph.x > 0.0) {
  let pair = targets[u32(particle.slot)];
  let t = mix(pair.xy, pair.zw, morph.z);        // 自由場 ↔ 圖形
  let desiredVx = (t.x - particle.x) * morph.x;  // pull
  let desiredVy = (t.y - particle.y) * morph.x;
  let a = clamp(morph.y * deltaTime, 0.0, 1.0);  // grip
  particle.vx = mix(particle.vx, desiredVx, a);
  particle.vy = mix(particle.vy, desiredVy, a);
}
```

得到的性質全部是「天生的」，不需要任何補償邏輯：

- 停在定位時粒子仍在輪廓裡游動、邊緣會呼吸 —— **形狀是活的**
- 捲動只改一個 uniform，**沒有任何快取軌跡會過期** → 停頓、恢復、反向捲動全都連續
- 位置在 GPU 上算，不再每幀上傳 → fps 回到 60（hero）

JS 端 API：`engine.setTargets(spreadXY, shapeXY)`、`engine.setMorph(pull, grip, blend)`。

---

## 4. 路線 C 的四個坑（每個都花了不少時間）

### 坑一：粒子的 array index 不是穩定身分

`particleSort` **每幀**把粒子重排進 bin 順序，所以 `targets[id.x]` 每幀都對到不同粒子。
`point-cloud-effect.md` §8 建議的 `targets: array<vec2f>` 直接用會錯位。

**解法**：sort 是**整個 struct 搬移**，所以放在 struct 裡的欄位會跟著粒子走。
在 `Particle` 加一個生成時指定、永不改變的 `slot`，shader 用 `targets[u32(particle.slot)]` 查。

```wgsl
struct Particle { x, y, vx, vy, particleType, slot: f32 };   // stride 20 → 24 bytes
```

改 stride 要同步改三處：`PARTICLE_STRIDE`、`seedPattern()` 的 `write()`、`readParticles()`。

### 坑二：彈簧加速度會發散

第一版寫成 `v += k * (t - p) * dt`。看起來很自然，**但 dt 會變**：
`simSpeed` 從待機 0.16 到捲動 0.6 是 4 倍擺幅，在待機調好的 `k` 一捲動就爆掉
（實測平均速度衝到 6672、形狀撐滿整個畫布）。

**解法**：改成一階遲滯，混合係數 `clamp` 到 1 —— **任何 dt 都不可能過衝**：

```wgsl
let a = clamp(grip * deltaTime, 0.0, 1.0);
v = mix(v, desiredV, a);
```

> 通則：任何「每幀施加、強度可調」的力，都要寫成對 dt 無條件穩定的形式。
> 這個專案的 dt 本來就會被 simSpeed 縮放，特別容易中招。

### 坑三：參數量級反直覺

導引比例是 `grip × dt`，而待機時 `dt ≈ 0.0026s`（16ms × simSpeed 0.16）。
所以 `grip = 5` 只導引了 **1.3%**，完全壓不過互動力場，形狀會整個炸開。

實測（`pull` / `grip` → 結果）：

| pull | grip | 平均速度 | 形狀 |
| --- | --- | --- | --- |
| 2.4 | 5 | 6672 | 炸開，撐滿畫布 |
| 8 | 100 | 6 | 守得住，有殘留運動 ✅ |
| 12 | 60 | 10 | 稍鬆，運動更多 ✅ |
| 20 | 100 | 6 | 偏緊 |
| 50 | 100 | **0** | 完全鎖死，變成死的貼圖 |

**可用區間 pull 8–12 / grip 60–100**，目前用 10 / 70。

> 要領：這對數值就是「像不像原圖」與「活不活」之間的旋鈕，
> **調參前先確認自己在哪個量級**，不要從直覺的個位數開始猜。

### 坑四：回程要「主動拉回去」，不能只是放手

只把 seek 關掉的話，粒子會整團留在原地（圖形的位置）慢慢擴散 ——
在 simSpeed 0.16 下慢到像壞掉。實測捲回 hero 後**左半邊佔比 92%**（正常約 50%）。

**解法有兩層，缺一不可：**

1. **target buffer 存兩組**（`array<vec4f>`：`.xy` 自由場、`.zw` 圖形），
   用 `morph.z` 內插。往回捲時目標點會**主動往外移**，把粒子帶回去。
2. **拉力要有釋放延遲**。只做 ① 還是 92% 偏左 —— 因為 `pull` 跟著 progress 一起歸零，
   回到 hero 的瞬間就沒力氣了。改成 attack 快 / release 慢（時間常數約 1.4s），
   progress 歸零後 seek 還會再拉一段才交還給物理。

```js
morphAmount += (e - morphAmount) * (e > morphAmount ? MORPH_ATTACK : MORPH_RELEASE)
engine.setMorph(MORPH_PULL * morphAmount, MORPH_GRIP * morphAmount, e)
//                        ↑ 拖著走                                    ↑ 跟著 progress 走
```

**blend 跟著 progress、pull 拖著走 —— 這個不對稱是刻意的。**

---

## 5. targets 的生命週期（最容易漏掉的一類 bug）

targets 是**模擬空間的絕對座標**，而且住在一個會被重新配置的 GPU buffer 裡。
有兩件事會讓它默默失效，而畫面症狀都是「粒子整個消失」——
因為 seek 對著全 0 的 targets 跑，會把全場粒子吸到座標原點 `(0,0)`。

| 觸發 | 為什麼 |
| --- | --- |
| `setCount()` / `respawn()` | 重新配置 targets buffer，內容全是 0 |
| 視窗改變尺寸 | `W`/`H` 變了，舊座標全錯 |

**特別陰險的是 fps 自適應**：

```js
if (fps < 45) engine.setCount(count / 2)   // 會把稍早建好的 targets 清空
```

這條路徑只在**低效能機器上才觸發**，開發機完全重現不出來。

**解法**：引擎加 `targetsGeneration` 世代編號，`allocParticleBuffers` 每次重配就 +1
並把 `morphPull`/`morphGrip` 歸零；呼叫端每幀比對，對不上就停用 seek 並排程重建。
resize 同樣要失效重建。

```js
if (targetsReady && (engine.targetsGeneration !== targetsGen || W !== targetsW || H !== targetsH)) {
  invalidateTargets()
}
```

**重建前要等場域散開**（`REBUILD_SETTLE_MS = 3000`）——「自由場」那組目標點就是當下的粒子
分布，`setCount` 剛重生成時是一團緊湊的開場螺旋，抓太早會導致之後捲回來回不到滿版。

**順序也很重要**：先讓 fps 自適應定案，再建 targets。原本 targets 建在 2.5s、
`setCount` 在 5s，順序天生就是錯的。

---

## 6. 換圖：怎麼做才會順

### 出圖規則（給設計師的）

`PLImage` 的 `registerPattern` 是把**整張圖**等比置中（contain-fit），
所以**主體在畫布裡的相對位置會被原樣保留**。

> 畫布要留成最終版位的比例、主體放在它該出現的位置。
> 例：`side.png` 是 1440×720、主體佔左 1/3 且切齊左緣 → 點雲就落在版面左側，
> 不必動相機。**別去裁掉空白**。

### 四條硬規格

1. **每張圖取樣同一個點數**（目前 32000）。點數不同會有一撮粒子配不到對，行為會怪。
2. **每張圖同樣的色盤長度**（7）。`species` 生成後不能改，`setSpecies()` 會重建
   bind group 並整場重生。
3. **換色用 `setColors()`，不要用 `setPalette()`。** 後者內含 `rebuildBindGroups()`
   （重建十幾個 bind group），逐幀呼叫會掉幀；`setColors` 只重寫 128 bytes 顏色 buffer。
4. **色盤插值在線性光空間做。** naive sRGB 插值中點會發灰。

### 為什麼這樣就會順

配對是**同物種內**做的（粒子的 species 生成後不能改），所以每顆粒子去的是「自己顏色」的
目標點，type index `t` 在新舊圖之間天然一致 —— `fromPalette[t] → toPalette[t]` 的插值
就對得上，形狀和顏色會一起流過去。

粒子順序對不上沒關係：GPU 每幀 spatial sort 本來就會打亂，但**同色粒子可互換**。

### 執行期取樣 vs 預烘 JSON

| | `prepare(url)` | `prepareFromData(json)` |
| --- | --- | --- |
| 換圖 | 丟檔就好 | 要重烘 |
| 成本 | PNG 全尺寸 + 約 190ms 取樣（32k 點） | JSON 約 209KB，免取樣 |
| 原圖 | 會被公開下載 | 不必公開 |

**開發階段用 `prepare` 直接試，正式站烘成 JSON。** 烘的方式是 console 一行：

```js
copy(JSON.stringify((await PLImage.prepare('/source_images/xxx.png', { count: 32000 })).data))
```

⚠️ **自動量化出來的色盤會偏濁** —— k-means 把大片暗色點雲也算進去，原圖鮮明的顏色會被拉灰。
要還原設計稿的鮮度就手寫色盤覆蓋（`ABOUT_PALETTE_OVERRIDE`）。

---

## 7. 怎麼驗證（不要只靠肉眼）

這次每一個結論都是量出來的。粒子效果的 bug 很難用看的判斷，但**很好量**：

```js
const s = await __field.readParticles()
```

| 想確認什麼 | 量什麼 |
| --- | --- |
| 形狀有沒有形成 | bounding box vs 目標點的理論範圍 |
| 有沒有「還活著」 | 平均速度 `Σ hypot(vx,vy) / n`（0 = 死的貼圖） |
| 有沒有偏一邊 | 左半邊粒子佔比（滿版應該約 50%） |
| 有沒有塌到原點 | `hypot(x,y) < 60` 的比例 |
| 有沒有數值爆掉 | `isFinite(x)` 的數量、平均速度是否異常大 |
| 停頓後有沒有跳 | 停頓前後的質心 + 標準差距離 |
| **有沒有塌成幾顆球** | **`fill` / `clump`（見下）** |

### `fill` / `clump`：一眼判斷「畫面是不是空的」

把畫面切成 96×54 格，兩個數字就能把「滿版有內容 / 塌成幾顆球」分開，
比肉眼看截圖可靠得多（尤其粒子很小的時候）：

```js
async function measure (engine) {
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  const GX = 96, GY = 54
  const grid = new Int32Array(GX * GY)
  let sp = 0
  for (const p of snap) {
    sp += Math.hypot(p.vx, p.vy)
    grid[Math.min(GY - 1, (p.y / H * GY) | 0) * GX + Math.min(GX - 1, (p.x / W * GX) | 0)]++
  }
  const s = Array.from(grid).sort((a, b) => b - a)
  return {
    // 最密的 1% 格子裝了全部粒子的幾成 —— 越高越像「幾顆球」
    clump: s.slice(0, Math.ceil(grid.length * 0.01)).reduce((a, b) => a + b, 0) / snap.length,
    // 有粒子的格子佔比 —— 越低表示畫面越空
    fill: s.filter(v => v > 0).length / grid.length,
    speed: sp / snap.length,
  }
}
```

健康的滿版自由場大約是 `fill 0.7+` / `clump 0.1` / `speed 60+`。
`fill < 0.05` 就是塌了，`speed < 5` 就是定住了。

### 量測陷阱

1. **`readParticles()` 會污染 fps。** 它是一次 `mapAsync` 來回（1–2 幀），
   量 fps 的那一輪不要夾雜它 —— 我一度量到 19fps，實際是 60。
2. **HMR 會留下舊的 rAF 迴圈。** 改完參數後**一定要重新整理**再判斷手感，
   否則新舊兩個 `driftLoop` 會同時寫同一個 uniform，數字完全對不上。
   （跑長時間量測時也別同時編輯檔案 —— HMR 的整頁重載會把量測腳本一起打斷。）
3. **量之前先確認「捲動位置」與「有沒有被暫停」。** 這兩個最容易讓整輪數據作廢：
   頁面若還停在第二區塊，量到的是收攏成圖片的狀態而不是 hero；閒置超過
   `IDLE_STOP_MS` 引擎會 pause，`readParticles()` 會一直回同一份資料
   （症狀：連續幾筆數值**一模一樣**）。自動化量測時要週期性補發 `pointermove`，
   並在結果裡一起回報 `scrollY` 與 `__fieldDbg().paused` 當佐證。
4. **一次只量一組效果的「長期」行為。** 有些矩陣短期健康、長期會退化
   （`snake` 的群落會持續合併），至少要拉到 4 分鐘、每分鐘取樣一次才看得出來。

`ParticleField.vue` 在 dev 模式掛了兩個把手：

```js
__field           // 引擎本身，可直接 setPreset / setMorph / setSimSpeed 即時試
__fieldDbg()      // progress / morphAmount / scrollHeat / force / idlePaused / targetsReady
```

---

## 8. 效能

`point-cloud-effect.md` §10 那份清單仍然適用（IntersectionObserver、visibilitychange、
DPR ≤ 1.5、預算自適應）。這次新增的：

### 密度會吃掉 fps，而且是平方級

48k 粒子被壓進約 1/6 的畫面面積時，spatial hash 每格的鄰居數暴增，
`computeForces` 的成本隨密度平方成長。實測 hero 60fps → 收攏後 41fps。

**這不是 seek 力的成本**（試過各種 pull/grip，fps 幾乎不動）。要改善只能降 `count`、
降 `rMax`，或接受它。

### 閒置停止

滑鼠／捲動／觸控超過 5 秒沒動作就 `pause(true)`。pause 只是跳過計算與渲染，
**canvas 會保留最後一幀**，所以畫面不會消失、只是定格，一動就無縫接回。

⚠️ 活動偵測**不能只認 `pointermove`**：觸控板兩指捲動不發 `pointermove`，
手機更是完全沒有。要一起聽 `scroll` / `wheel` / `pointerdown`，
否則捲動過場時場域會定格，看起來像壞掉。

⚠️ 停住期間**仍要更新 `lastTime` / `lastScrollY`**，否則喚醒那一幀會算出爆炸的
dt 與捲動速度，導致相機瞬移＋模擬速度暴衝。

---

## 9. 雜項

- **WGSL 註解裡不能有反引號。** shader 是 JS template literal，一個 `` ` `` 就會把字串截斷，
  整包 kit 掛掉且錯誤訊息完全看不出關聯（`Unexpected identifier 'v'`）。
  改完 kit 養成習慣跑 `node --check public/particle-kit/*.js`。
- `setForce(0)` 會被引擎夾到下限 **0.1**，不是真的 0。路線 B 時代這會導致「停著也會慢慢飄」。
- 這個 repo 的 ESLint 跑不起來（缺 `typescript` 依賴），改完 `.vue` 沒有 lint 把關，
  縮排要自己顧。
- 固定背景 canvas 要放在 `relative bg-black` 的包裝層裡、用 `fixed inset-0 z-0`，
  內容 `relative z-10`。**不要用 `-z-10`** —— layout 根層的 `bg-white` 會蓋掉它。

---

## 10. 維持「開場構圖」（2026-08 新增）

### 10.1 為什麼要維持

`seedPattern` 畫出來的開場構圖（`softClusters` 的細胞團、`orbitalBelts` 的同心帶、
`chaoticBands` 的亂流條紋…）才是**辨識度的來源**。`particle-life-seeds.js` 的檔頭自己就寫著：

> the opening read is what people see and remember

規則一接管，幾秒內就把它洗掉。更麻煩的是：同一族的力矩陣會收斂到**同一種樣子**。
`spiral-conveyor` / `tri-spiral` / `helical` / `wavefield` / `vortex` 數學上都是
「以 `j − i` 為變數的正弦環狀矩陣」，換名字不換族，最後長出來的都是「飄浮細塵」。

> 想讓 N 組效果看起來真的不同，**別只換 preset 名字**。要嘛換族（`self` 強弱、
> 有沒有角色結構如 `predator` 的獵食者列），要嘛就把開場構圖留住。

### 10.2 ⚠️ 天真做法一定會把畫面凍住

用路線 C 的 seek 力把粒子按在構圖上，**構圖會守住，但畫面會靜止**：

```
#1 鈷藍細胞（snake）  grip 0 → 28
平均速率 27.8 px/s  →  1.1 px/s
```

原因是機制性的：seek 是「收斂到固定點的臨界阻尼彈簧」。粒子一到定位，
`desiredV = (target − pos) × pull` 就是 0，而 `v = mix(v, desiredV, grip·dt)`
會把殘餘速度吃掉。這是**穩定平衡**，不是參數沒調對 ——
`SpeakerField.vue` 有完整紀錄：調 `forceFactor`（0.15→1.0）、掃 `grip/pull`、
加 `PLAmbient` 脈衝、加 `disturb`，全部實測 0～1.4 px/s。

### 10.3 兩個有效解法，看你有沒有空的目標槽

引擎的 seek 有 `spread` / `shape` **兩個**目標槽，`blend` 在兩者之間插值。

**解法 A —— 讓 `blend` 擺盪（`SpeakerField` 用這個）**

`shape` = 原點，`spread` = 原點 + 每顆粒子各自的小隨機偏移，讓 `blend` 在 1 → 0 → 1
之間緩慢來回，每顆粒子就在自己的小範圍內游走。實測 2.4～3.8 px/s，而形狀在數學上
跑不掉（`blend` 回到 1 時每顆必定回到自己的原點）。

- ✅ 運動連續、平滑
- ❌ **需要一個空的目標槽**，而且 `blend` 不能被別人佔用

**解法 B —— 讓「握力自己呼吸」（`ParticleField` / `HomeSame/Field` 用這個）**

當兩個槽都被佔用（首頁是 `blend=0` 構圖、`blend=1` side.png，而 `blend` 是捲動位置
決定的）就不能用 A。改成讓 `grip` 在 `FLOOR ↔ 1` 之間走一個慢週期：

```js
const breathe = FLOOR + (1 - FLOOR) * (0.5 - 0.5 * Math.cos(t / PERIOD_MS * TAU))
engine.setMorph(pull * breathe, grip * breathe, blend)
// PERIOD_MS 7000 / FLOOR 0.18
```

- 鬆的半週期：力場贏，構圖鬆開、粒子照自己的規則流動
- 緊的半週期：seek 贏，粒子被帶回自己的構圖原點

構圖跑不掉（每輪都拉回原點），但畫面**全程**在動。零 buffer 上傳，每幀只多算一個 `cos`。

實測（#3 標本切片，跨整個呼吸週期取樣）：

| grip | 31.8 | 16.1 | 6.3 | 23.0 | 31.1 |
| --- | --- | --- | --- | --- | --- |
| speed | 99.4 | 63.2 | 79.8 | 77.8 | 86.2 |
| fill | 0.42 | 0.42 | 0.46 | 0.48 | 0.41 |

**❌ 不要只做「每隔幾秒換一組隨機目標偏移」而不擺盪。** 我先試過：粒子約 0.2 秒就
追到新位置，剩下 2.2 秒還是靜止，平均速率只有 0.7 px/s。要嘛 A 的連續擺盪，要嘛 B。

### 10.4 實作要點

- 用 `useParticleMorph` 的 `buildSeedTargets(name, N, T, W, H)` 把 seed 產生器
  **當成目標點**再跑一次，產出的 `{tx, ty, tt}` 可以直接餵給 `buildSlotTargets`。
- ⚠️ seed 產生器內部用 `Math.random()`，**每次呼叫結果都不同**。一組 targets 只能算一次，
  重算會讓構圖跳掉。也因此它是「一份新的同款構圖」而不是粒子生成時那一份 ——
  讀起來像「粒子聚攏成形」，這是預期行為。
- 呼吸要乘在**最終的 `setMorph` 上**，不要乘進平滑器的目標值。
  `LOCK_RELEASE` 只有 0.012（約 1.4 秒時間常數），呼吸走那條路會被削掉大半振幅。
- 只讓呼吸作用在「自由場」影格。收攏成圖片／人像的影格需要**穩定**的握力，
  跟著呼吸會忽清忽糊。一鏡到底版是用 `freeWeight`（A/B 兩格裡自由場的權重）當閘門。
- `jitter` 要寫進 scratch buffer。48000 顆是一份 384KB 的 `Float32Array`，
  每 2 秒配一份純粹是餵 GC。

---

## 11. 效果目錄（`app/utils/particleFieldLooks.js`）

5 組效果的完整參數（色盤、力矩陣、開場種子、物理、點大小、光暈、相機、點數預算、
模擬速度、環境擾動、`hold`）集中在這張表，兩張首頁 canvas 共用。要加第 6 組就照那裡的
換算規則加一筆。

| 網址 | 行為 |
| --- | --- |
| （不帶參數） | 每次進站隨機抽一組 |
| `?hero-animation=1`～`5` | 指定一組（也認 id） |
| `?mode=tool` | 右側開切換面板，可即時換效果＋拉「維持開場構圖」的力度 |

dev console：`__fieldLook(3)` / `__fieldHold(60)` / `__fieldDbg()`
（一鏡到底版是 `__sameLook` / `__sameHold` / `__sameDbg`）。

**把 sandbox 參數搬到站上的換算規則**（sandbox 是滿版單一 canvas、沒有別的東西在跑，
站上要跟版面與行動裝置共存，所以三個欄位是等比縮到站上基準而不是照抄）：

```
基準 = 深海流光（線上 hero），sandbox 原值 count 80000 / simSpeed 0.3 / zoom 1.2
       對應站上的 48000 / 0.16 / 1.35

density = 0.037 × (該組 count ÷ 80000)
idle / max = 0.16 / 0.6 × (該組 simSpeed ÷ 0.3)
zoom = 1.35 × (該組 cameraZoom ÷ 1.2)
```

其餘欄位（species / 物理 / pointSize / 透明度 / 光暈）是絕對值，直接照 JSON。

---

## 12. 做新效果時的檢查順序

1. 先選 preset：**對稱嗎？self 正負？非鄰居給 0 還是負值？**（§1.1）這決定 80% 的觀感
2. 量一次 `fill` / `clump` / `speed`（§7）確認沒塌沒定住 —— **在調任何參數之前**
3. `simSpeed` 分段（開場／待機／互動），所有跟隨都攻擊快、釋放慢
4. 相機加緩慢漂移
5. `PLAmbient` 當底噪，`intensity` 0.5 左右
6. 要變形 → 走路線 C，別走 B
7. 目標點記得處理**失效**（`setCount`／`respawn`／resize）與**回程**（兩組 target ＋ 釋放延遲）
8. 要留住開場構圖 → §10，並且**先確認你還有沒有空的目標槽**（決定用解法 A 還是 B）
9. 每一步都用 `readParticles()` 量，別只靠肉眼；改完參數**重新整理**再判斷
10. 拉長到 4 分鐘再量一次 —— 有些矩陣短期健康、長期會退化
