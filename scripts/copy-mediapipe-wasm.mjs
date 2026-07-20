// 把 @mediapipe/tasks-vision 的 wasm 執行檔複製到 public/mediapipe/wasm/，供自架載入。
// 自架的好處：wasm 與 npm 的 JS 永遠同版本（同一個套件），不會有跨套件 ABI 不合的問題。
// 由 package.json 的 postinstall 觸發；public/mediapipe/wasm/ 已 gitignore（不進版控）。
import { cp, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'node_modules/@mediapipe/tasks-vision/wasm')
const dest = resolve(root, 'public/mediapipe/wasm')

if (!existsSync(src)) {
  console.warn('[copy-mediapipe-wasm] 找不到來源，略過：', src)
  process.exit(0)
}
await mkdir(dest, { recursive: true })
await cp(src, dest, { recursive: true })
console.log('[copy-mediapipe-wasm] 已複製 wasm →', dest)
