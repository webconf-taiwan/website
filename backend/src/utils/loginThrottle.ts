import type { Bindings } from '../index'

// 登入節流與鎖定（見 Todolist0901-資安.md 2-1）：擋暴力嘗試帳密、暴力猜密碼重設
// Token。用 KV 存失敗次數，天生支援 TTL 自動過期，不用自己寫清除機制。
//
// 這是應用層的「同一個帳號／同一個 IP 連續失敗」節流，跟 Cloudflare Dashboard
// 層級的 IP Rate Limiting Rule（擋大量不同帳號的嘗試）是互補的兩層防護，不是
// 互相取代——Dashboard 那層需要你手動設定，見 Todolist0901-資安.md 第 8 節。
const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 60 * 15 // 鎖定 15 分鐘
// KV key 的 TTL 抓鎖定時間的兩倍：失敗次數還沒到鎖定門檻前，這筆計數也該在合理
// 時間內自動清掉，不要無限期累積一個永遠不會鎖定但一直存在的計數器。
const KEY_TTL_SECONDS = LOCKOUT_SECONDS * 2

type ThrottleState = { count: number; lockedUntil?: number }

function keyFor(scope: string, identifier: string): string {
  return `${scope}:${identifier.toLowerCase()}`
}

// 呼叫端在「真正驗證帳密／Token 之前」先呼叫這支，鎖定中就直接擋掉，
// 不要浪費一次 PBKDF2 驗證（本身也要花 CPU time，見 Todolist0901-資安.md 3-1）。
export async function isLocked(env: Bindings, scope: string, identifier: string): Promise<boolean> {
  const raw = await env.LOGIN_ATTEMPTS.get(keyFor(scope, identifier))
  if (!raw) return false
  const state = JSON.parse(raw) as ThrottleState
  return typeof state.lockedUntil === 'number' && state.lockedUntil > Date.now()
}

// 驗證失敗時呼叫，累加失敗次數，到門檻就標記鎖定。
export async function recordFailure(env: Bindings, scope: string, identifier: string): Promise<void> {
  const key = keyFor(scope, identifier)
  const raw = await env.LOGIN_ATTEMPTS.get(key)
  const state: ThrottleState = raw ? (JSON.parse(raw) as ThrottleState) : { count: 0 }
  state.count += 1
  if (state.count >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_SECONDS * 1000
  }
  await env.LOGIN_ATTEMPTS.put(key, JSON.stringify(state), { expirationTtl: KEY_TTL_SECONDS })
}

// 驗證成功時呼叫，清掉這個帳號／IP 的失敗紀錄，不要讓下次不小心打錯一次密碼
// 就繼續累加舊的失敗次數。
export async function clearFailures(env: Bindings, scope: string, identifier: string): Promise<void> {
  await env.LOGIN_ATTEMPTS.delete(keyFor(scope, identifier))
}
