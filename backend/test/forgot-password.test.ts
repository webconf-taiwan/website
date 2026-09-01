import { createExecutionContext, waitOnExecutionContext, env } from 'cloudflare:test'
import { describe, it, expect, beforeEach } from 'vitest'
import worker from '../src/index'
import { hashPassword, hashToken } from '../src/utils/crypto'

// 原本規劃用 vi.mock() 攔截 utils/mailer.ts 的 sendPasswordResetEmail()，驗證
// 「有沒有正確呼叫、參數對不對」（見 Todolist0831.md 第 9 節）。實測發現
// @cloudflare/vitest-plugin 執行的 SUT 程式碼是在真正的 workerd runtime 裡跑，
// vi.mock() 的攔截沒辦法跨過去生效（mock 函式呼叫次數量測到的永遠是 0），
// 這是框架本身的限制，不是程式碼的問題。改用 Todolist0831.md 原本就定案的
// 主要策略：直接對真實資料庫驗證——forgot-password 呼叫後直接查
// password_reset_tokens 有沒有正確寫入；reset-password 的驗證邏輯則用「在測試裡
// 用 hashToken() 算出一組已知明文／雜湊配對，直接寫進 DB」的方式完整測過，
// 不透過 HTTP 層產生 Token（因為雜湊化之後，HTTP 層本來就拿不到明文 Token）。
const IncomingRequest = Request

async function call(path: string, init?: RequestInit) {
  const request = new IncomingRequest(`http://example.com${path}`, init)
  const ctx = createExecutionContext()
  const response = await worker.fetch(request, env, ctx)
  await waitOnExecutionContext(ctx)
  return { response, body: await response.json() as Record<string, unknown> }
}

async function login(email: string, password: string) {
  const { body } = await call('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return body.token as string
}

// 繞過 HTTP 層直接塞一筆已知明文／雜湊配對的重設 Token，用來測 reset-password
// 的驗證邏輯（見上方檔案開頭說明：雜湊化之後沒辦法從 forgot-password 的 HTTP
// 回應或 mock 攔截拿到明文 Token，只能用這種方式取得已知明文）。
async function seedResetToken(adminId: number, plainToken: string, ttlMinutes = 60) {
  const tokenHash = await hashToken(plainToken)
  // SQLite 的 datetime() modifier 要自己帶正負號（例如 '-60 minutes'），
  // 不能在外面固定寫死 '+'，不然負數會變成 '+-60 minutes' 這種無法解析的字串，
  // 讓 datetime() 回傳 NULL，寫入時直接違反 expires_at 的 NOT NULL 限制。
  const sign = ttlMinutes >= 0 ? '+' : '-'
  const modifier = `${sign}${Math.abs(ttlMinutes)} minutes`
  await env.DB
    .prepare(`INSERT INTO password_reset_tokens (token_hash, admin_id, expires_at) VALUES (?, ?, datetime('now', ?))`)
    .bind(tokenHash, adminId, modifier)
    .run()
}

beforeEach(async () => {
  // reset-password 的節流用 IP 當 key，測試請求沒有 CF-Connecting-IP header，
  // 一律落在同一個 'unknown' key 上——每個 it() 開始前先清掉，避免前一個測試案例
  // 的失敗次數殘留，把這次測試誤判成被鎖定（見 Todolist0901-資安.md 2-1）。
  await env.LOGIN_ATTEMPTS.delete('reset-password:unknown')
})

describe('忘記密碼－產生 Token（POST /auth/forgot-password）', () => {
  it('email 存在：password_reset_tokens 多一筆，存的是雜湊值不是明文', async () => {
    const hash = await hashPassword('OldPass#123')
    const { meta } = await env.DB
      .prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('forgot-user@webconf.local', hash)
      .run()

    const before = await env.DB.prepare('SELECT COUNT(*) as count FROM password_reset_tokens WHERE admin_id = ?')
      .bind(meta.last_row_id).first<{ count: number }>()

    const { response, body } = await call('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'forgot-user@webconf.local' })
    })
    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)

    const after = await env.DB.prepare('SELECT token_hash FROM password_reset_tokens WHERE admin_id = ?')
      .bind(meta.last_row_id).all<{ token_hash: string }>()
    expect(after.results.length).toBe((before?.count ?? 0) + 1)
    // 64 碼是 SHA-256 雜湊的 hex 長度，不會是明文 token 的原始格式。
    expect(after.results[0].token_hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('email 不存在：一樣回成功訊息，但不會新增任何 Token（防止帳號列舉）', async () => {
    const before = await env.DB.prepare('SELECT COUNT(*) as count FROM password_reset_tokens').first<{ count: number }>()

    const { response, body } = await call('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'no-such-admin@webconf.local' })
    })
    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)

    const after = await env.DB.prepare('SELECT COUNT(*) as count FROM password_reset_tokens').first<{ count: number }>()
    expect(after?.count).toBe(before?.count ?? 0)
  })

  it('email 未填，回 400', async () => {
    const { response, body } = await call('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    expect(response.status).toBe(400)
    expect(body.error).toBe('email 必填')
  })
})

describe('忘記密碼－帶 Token 設定新密碼（POST /auth/reset-password）', () => {
  it('完整流程：正確 token → 設定新密碼成功 → 新密碼能登入 → 舊 session 全部失效', async () => {
    const hash = await hashPassword('OldPass#123')
    const { meta } = await env.DB
      .prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('full-flow@webconf.local', hash)
      .run()
    const oldToken = await login('full-flow@webconf.local', 'OldPass#123')

    await seedResetToken(meta.last_row_id, 'plain-reset-token-full-flow')

    const { response: resetResp } = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'plain-reset-token-full-flow', new_password: 'BrandNew#789', new_password_confirm: 'BrandNew#789' })
    })
    expect(resetResp.status).toBe(200)

    // 忘記密碼視為裝置不可信任，全部既有 session（包含重設前的登入）都要失效。
    const { response: meAfter } = await call('/auth/me', { headers: { Authorization: `Bearer ${oldToken}` } })
    expect(meAfter.status).toBe(401)

    const { response: newLogin } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'full-flow@webconf.local', password: 'BrandNew#789' })
    })
    expect(newLogin.status).toBe(200)
  })

  it('token 用過一次後不能再用（used_at 標記生效）', async () => {
    const hash = await hashPassword('OldPass#123')
    const { meta } = await env.DB
      .prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('reuse-token@webconf.local', hash)
      .run()
    await seedResetToken(meta.last_row_id, 'plain-reset-token-reuse')

    const first = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'plain-reset-token-reuse', new_password: 'First#12345', new_password_confirm: 'First#12345' })
    })
    expect(first.response.status).toBe(200)

    const { response, body } = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'plain-reset-token-reuse', new_password: 'Second#6789', new_password_confirm: 'Second#6789' })
    })
    expect(response.status).toBe(400)
    expect(body.error).toBe('重設連結無效或已過期')
  })

  it('token 過期後不能使用', async () => {
    const hash = await hashPassword('OldPass#123')
    const { meta } = await env.DB
      .prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('expired-token@webconf.local', hash)
      .run()
    // 負的分鐘數＝已經過期的時間點，不用真的等 24 小時。
    await seedResetToken(meta.last_row_id, 'plain-reset-token-expired', -60)

    const { response, body } = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'plain-reset-token-expired', new_password: 'NewPass#123', new_password_confirm: 'NewPass#123' })
    })
    expect(response.status).toBe(400)
    expect(body.error).toBe('重設連結無效或已過期')
  })

  it('錯誤的 token 直接回 400', async () => {
    const { response, body } = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'totally-wrong-token', new_password: 'NewPass#123', new_password_confirm: 'NewPass#123' })
    })
    expect(response.status).toBe(400)
    expect(body.error).toBe('重設連結無效或已過期')
  })

  it('新密碼與確認密碼不一致，回 400', async () => {
    const hash = await hashPassword('OldPass#123')
    const { meta } = await env.DB
      .prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('mismatch-reset@webconf.local', hash)
      .run()
    await seedResetToken(meta.last_row_id, 'plain-reset-token-mismatch')

    const { response, body } = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'plain-reset-token-mismatch', new_password: 'NewPass#123', new_password_confirm: 'Different#1' })
    })
    expect(response.status).toBe(400)
    expect(body.error).toBe('新密碼與確認密碼不一致')
  })

  it('新密碼不符合強度規則，回 400', async () => {
    const hash = await hashPassword('OldPass#123')
    const { meta } = await env.DB
      .prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('weak-reset@webconf.local', hash)
      .run()
    await seedResetToken(meta.last_row_id, 'plain-reset-token-weak')

    const { response, body } = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'plain-reset-token-weak', new_password: 'weak', new_password_confirm: 'weak' })
    })
    expect(response.status).toBe(400)
    expect(body.error).toBe('新密碼至少 8 碼，需包含大小寫字母與至少 1 個特殊符號')
  })

  it('反覆嘗試無效 token 5 次後，同一來源鎖定 15 分鐘，回 429', async () => {
    for (let i = 0; i < 5; i++) {
      const { response } = await call('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: `bad-token-${i}`, new_password: 'NewPass#123', new_password_confirm: 'NewPass#123' })
      })
      expect(response.status).toBe(400)
    }

    const { response } = await call('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'yet-another-bad-token', new_password: 'NewPass#123', new_password_confirm: 'NewPass#123' })
    })
    expect(response.status).toBe(429)
  })
})
