# 虛擬綠幕（瀏覽器即時換背景）— 實作說明

> 頁面：`app/pages/greenscreen.vue`（路由 `/greenscreen`）。獨立工具，與粒子效果無關。

開相機 → **瀏覽器即時**把人物去背 → 合成到選定背景 → 可拍照下載 PNG、或錄影下載 webm。
不用實體綠幕、全程在使用者裝置上完成，影像不上傳伺服器。

---

## 1. 為什麼不用現有的 @imgly

`@imgly/background-removal`（人像卡片在用的 ISNet）是**離線高品質單張去背**，一張要幾秒，
**做不了即時視訊**。即時換背景改用 **MediaPipe Tasks Vision `ImageSegmenter`（Selfie
Segmentation）**：模型小（~250KB）、為視訊設計、桌機 GPU 可 ~30fps。兩者並存、各司其職。

## 2. 模型與 wasm：自架（比 @imgly 省心的關鍵）

MediaPipe 的 **wasm 與 npm 的 JS 是同一個套件（`@mediapipe/tasks-vision`）**，版本天生對齊，
不會有 @imgly + onnxruntime-web 那種「CDN wasm 版本要跟 npm JS 版本硬對齊」的地獄。所以直接自架：

- `scripts/copy-mediapipe-wasm.mjs`：把 `node_modules/@mediapipe/tasks-vision/wasm/*` 複製到
  `public/mediapipe/wasm/`。由 `package.json` 的 `postinstall` 觸發（`nuxt prepare && node
  scripts/copy-mediapipe-wasm.mjs`）。此資料夾 **gitignore**（可由安裝重建，~11MB wasm 不進版控）。
- 模型 `public/mediapipe/selfie_segmenter.tflite`（~250KB）**直接 commit**（小、且來源是 Google
  storage，避免執行期外連）。原始下載：
  `https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite`
- 執行期：`FilesetResolver.forVisionTasks('/mediapipe/wasm')` +
  `ImageSegmenter.createFromOptions(fileset, { baseOptions:{ modelAssetPath:'/mediapipe/selfie_segmenter.tflite', delegate:'GPU' }, runningMode:'VIDEO', outputConfidenceMasks:true })`。
  GPU delegate 失敗自動退 CPU。

### 版本鎖定 / Vite

- `@mediapipe/tasks-vision` 在 `package.json` **釘死確切版本**（比照 @imgly 教訓）。升版時記得重跑
  `postinstall` 把新版 wasm 複製過去（版本永遠跟著 npm 套件走，不用另外對齊）。
- `nuxt.config.ts` 的 `vite.optimizeDeps.include` 要含 `@mediapipe/tasks-vision`，否則 dev 會 `@fs`
  404 / 依賴優化失敗，連帶整包 client bundle 掛掉（這正是 @imgly 踩過的坑）。改了 optimizeDeps
  **要重啟 dev server** 才生效。

## 3. 即時合成管線（`renderFrame`）

用 `video.requestVideoFrameCallback` 每幀跑（無此 API 退 `requestAnimationFrame`）：

1. `segmenter.segmentForVideo(video, ts)` 取 `confidenceMasks[0]`（前景機率，模型解析度如 256×256）。
   **時間戳 `ts` 必須嚴格遞增的整數 ms**（程式用 `Math.max(last+1, round(now))` 保證）。
2. 先把**背景**畫到輸出 canvas（見 §4）。
3. **人像圖層**：把相機幀畫到 `personCv` → 用遮罩做 `globalCompositeOperation='destination-in'`
   （把 256×256 遮罩平滑放大到影片尺寸，插值天然**柔化邊緣**）→ 只留人像。
4. 人像**鏡像**（自拍感）疊到背景上；背景不鏡像。
5. 每幀 `res.close()` 釋放遮罩。

- **前景判定**：`confidenceMasks[0]` 為前景機率；若某些裝置結果相反，把 `greenscreen.vue` 的
  `INVERT_MASK` 設 `true` 翻轉。
- **解析度**：跟隨相機 `videoWidth/Height`（getUserMedia ideal 1280×720）。掉幀可在
  getUserMedia 降到 480p。

## 4. 背景庫（`BACKGROUNDS`）

內建：`gradient`（漸層）、`solid`（純色）、`animated`（動態光暈，程序繪製的動態背景）、
`blur`（原背景模糊，像視訊會議）、`upload`（上傳圖片）、`uploadVideo`（**上傳影片**當背景，
用隱藏 `<video loop muted>` 每幀 `drawCover` 繪製當前幀）。前四種免外部素材、開箱即用。

### 加「圖片 / 影片」預設背景（不靠上傳，內建幾組）

- **圖片**：把圖丟進 `public/greenscreen/`，在 `BACKGROUNDS` 加 `{ name, type:'image', src:'/greenscreen/xxx.jpg' }`，
  並在 `drawBackground` 加一個分支：預載 `HTMLImageElement` 後用 `drawCover` 畫。
- **影片（loop）**：`public/greenscreen/xxx.mp4` + 一個隱藏 `<video loop muted playsinline autoplay>`，
  在 `drawBackground` 用 `drawCover(ctx, bgVideoEl, bgVideoEl.videoWidth, ...)` 每幀畫其當前幀。

## 5. 拍照 / 錄影

- **拍照**：`outputCanvas.toBlob('image/png')` → 下載 `greenscreen.png`。
- **錄影**：`outputCanvas.captureStream(30)` →（可選）加相機 audio track →
  `MediaRecorder`（mimeType 用 `isTypeSupported` 挑 vp9 → vp8 → webm → mp4）→ 收集 chunks →
  Blob 下載。**webm** 是瀏覽器原生錄製格式；Safari 支援有限，UI 提示以桌機 Chrome/Edge 為佳。
- **麥克風**：預設關（`withAudio`）。開了才在 getUserMedia 要 audio 權限；要在**開相機前**勾選。

## 6. 效能 / 相容性

- rVFC 只在影片播放時觸發，分頁隱藏自動降頻；`stop()` / unmount 會停迴圈、停 tracks、`segmenter.close()`。
- GPU delegate 優先、失敗退 CPU。
- 相機需 **HTTPS 或 localhost** 才給權限（正式站 OK）。

## 7. 驗證

- 桌機 Chrome 開 `/greenscreen` → 開啟相機 → 換不同背景 → 拍照 / 錄影下載。
- 無頭測試（無實體相機）：用 Chromium flag
  `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` 讓 getUserMedia 回傳測試畫面，
  驗證迴圈運作、背景切換、`toBlob`/`MediaRecorder` 產出 blob（人像遮罩品質需真人相機手測）。
