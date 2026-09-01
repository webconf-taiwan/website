// 密碼雜湊與 session token。刻意不用 bcrypt——Workers runtime 沒有原生支援，
// 硬裝只能靠 nodejs_compat 生效與否賭一把。Web Crypto（globalThis.crypto.subtle）
// 是 Workers 內建 API，PBKDF2 一樣是業界認可的雜湊法，不需要額外依賴。
//
// 迭代次數：Workers Free 方案每個請求只有 10ms CPU time 硬限制（超過直接噴錯，
// 不是變慢），本機實測 100,000 次迭代約 12ms，已經超過上限；60,000 次約 7.3ms，
// 留了安全餘裕給其他處理（JSON parse、路由等）。之後如果升級 Workers Paid（CPU
// time 寬鬆很多），可以再調高，見 Todolist0901-資安.md 2026-09-01 的紀錄。
//
// 格式是自我描述的 `${iterations}:${saltHex}:${hashHex}`——把這次雜湊實際用的
// 迭代次數存進字串本身，而不是只依賴這裡的常數。這樣以後再調 PBKDF2_ITERATIONS，
// 既有帳號的密碼雜湊還是能用當初存的次數正確驗證，不會逼所有人重設密碼。
// 舊格式（沒有 iterations 前綴的 `saltHex:hashHex`）視為用 LEGACY_ITERATIONS
// 雜湊出來的，向下相容。
const PBKDF2_ITERATIONS = 60_000
const LEGACY_ITERATIONS = 100_000
const encoder = new TextEncoder()

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':')

  // 新格式：iterations:saltHex:hashHex。舊格式（重構前留下的帳號）只有兩段
  // saltHex:hashHex，沒有存迭代次數，視為用 LEGACY_ITERATIONS 雜湊出來的。
  const [iterationsStr, saltHex, hashHex] = parts.length === 3
    ? parts
    : [String(LEGACY_ITERATIONS), parts[0], parts[1]]

  if (!saltHex || !hashHex) return false
  const iterations = Number(iterationsStr)
  if (!Number.isInteger(iterations) || iterations <= 0) return false

  const salt = fromHex(saltHex)
  const expected = fromHex(hashHex)
  const actual = await pbkdf2(password, salt, iterations)
  if (actual.length !== expected.length) return false

  // 固定時間比較，避免用回傳時間差猜出雜湊內容。
  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i]
  return diff === 0
}

export function generateSessionToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)))
}

// Session Token／密碼重設 Token 存進資料庫前先雜湊過（見 Todolist0901-資安.md
// 2-2）：萬一 DB 外洩，拿到的是雜湊值，不能直接拿去當 Bearer token 或重設連結用。
// 這裡不用 PBKDF2——token 本身就是 32 bytes（256 bit）高熵的隨機字串，不是使用者
// 選的密碼，沒有「容易被字典攻擊猜中」的風險，用一般 SHA-256 雜湊、查表比對即可，
// 不需要 PBKDF2 那種刻意拖慢暴力嘗試速度的設計。
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token))
  return toHex(new Uint8Array(digest))
}
