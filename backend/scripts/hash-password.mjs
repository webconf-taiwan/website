// 建立第一個後台帳號用。跑法：
//   node scripts/hash-password.mjs '你的密碼'
// 印出來的雜湊貼進 INSERT INTO admins 的 password_hash 欄位（見下方註解範例）。
//
// 參數要跟 src/utils/crypto.ts 完全一致（PBKDF2 / SHA-256 / 60,000 次迭代 / 256 bit，
// 迭代次數見那份檔案開頭註解為什麼是這個數字），兩邊算出來的雜湊格式才能互相驗證。
// 輸出格式是自我描述的 `iterations:saltHex:hashHex`，之後調整迭代次數不影響舊帳號。

import { webcrypto as crypto } from 'node:crypto'

const password = process.argv[2]
if (!password) {
  console.error('用法：node scripts/hash-password.mjs <密碼>')
  process.exit(1)
}

const PBKDF2_ITERATIONS = 60_000
const encoder = new TextEncoder()

function toHex (bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword (password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, keyMaterial, 256)
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(new Uint8Array(bits))}`
}

const hash = await hashPassword(password)
console.log(hash)
console.log('')
console.log('接著跑（先換成你自己的 email，雲端記得加 --remote）：')
console.log(`  npx wrangler d1 execute webconf-2026-api-db --local --command "INSERT INTO admins (email, password_hash) VALUES ('you@example.com', '${hash}')"`)
