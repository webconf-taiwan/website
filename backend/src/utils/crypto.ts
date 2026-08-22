// 密碼雜湊與 session token。刻意不用 bcrypt——Workers runtime 沒有原生支援，
// 硬裝只能靠 nodejs_compat 生效與否賭一把。Web Crypto（globalThis.crypto.subtle）
// 是 Workers 內建 API，PBKDF2 一樣是業界認可的雜湊法，不需要額外依賴。
//
// 這裡的參數（PBKDF2 / SHA-256 / 100,000 次迭代 / 256 bit）要跟
// scripts/hash-password.mjs 完全一致，兩邊算出來的雜湊才能互相驗證。

const PBKDF2_ITERATIONS = 100_000
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

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt)
  return `${toHex(salt)}:${toHex(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false

  const salt = fromHex(saltHex)
  const expected = fromHex(hashHex)
  const actual = await pbkdf2(password, salt)
  if (actual.length !== expected.length) return false

  // 固定時間比較，避免用回傳時間差猜出雜湊內容。
  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i]
  return diff === 0
}

export function generateSessionToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)))
}
