import { createExecutionContext, waitOnExecutionContext, env } from 'cloudflare:test'
import { describe, it, expect, beforeAll } from 'vitest'
import worker from '../src/index'
import { hashPassword } from '../src/utils/crypto'

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

function authed(token: string, extra?: RequestInit): RequestInit {
  return {
    ...extra,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(extra?.headers ?? {}) }
  }
}

describe('登入（POST /auth/login）', () => {
  beforeAll(async () => {
    const hash = await hashPassword('Correct#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'super_admin')")
      .bind('login-user@webconf.local', hash)
      .run()
  })

  it('email 或 password 未填，回 400', async () => {
    const { response, body } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login-user@webconf.local' })
    })
    expect(response.status).toBe(400)
    expect(body.error).toBe('email 和 password 必填')
  })

  it('密碼錯誤，回 401，訊息跟帳號不存在時一致', async () => {
    const wrongPassword = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login-user@webconf.local', password: 'WrongPassword#1' })
    })
    const noSuchUser = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'no-such-user@webconf.local', password: 'WrongPassword#1' })
    })
    expect(wrongPassword.response.status).toBe(401)
    expect(noSuchUser.response.status).toBe(401)
    expect(wrongPassword.body.error).toBe(noSuchUser.body.error)
  })

  it('登入成功，回傳 token／expiresAt／admin，且 admin 不含 password_hash', async () => {
    const { response, body } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login-user@webconf.local', password: 'Correct#123' })
    })
    expect(response.status).toBe(200)
    expect(typeof body.token).toBe('string')
    expect(typeof body.expiresAt).toBe('string')
    const admin = body.admin as Record<string, unknown>
    expect(admin).toMatchObject({ email: 'login-user@webconf.local', role: 'super_admin' })
    expect(admin.password_hash).toBeUndefined()
  })

  it('連續失敗 5 次後鎖定，第 6 次起回 429（見 Todolist0901-資安.md 2-1）', async () => {
    const email = 'lockout-target@webconf.local'
    const hash = await hashPassword('LockoutTest#1')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind(email, hash)
      .run()

    for (let i = 0; i < 5; i++) {
      const { response } = await call('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'WrongPassword#1' })
      })
      expect(response.status).toBe(401)
    }

    const { response: lockedWrong } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'WrongPassword#1' })
    })
    expect(lockedWrong.status).toBe(429)

    // 鎖定中，就算密碼打對也一樣擋下來——鎖定檢查排在驗證密碼之前。
    const { response: lockedCorrect } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'LockoutTest#1' })
    })
    expect(lockedCorrect.status).toBe(429)
  })

  it('登入成功會清掉失敗次數計數（不會殘留到下次）', async () => {
    const email = 'reset-counter@webconf.local'
    const hash = await hashPassword('ResetCounter#1')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind(email, hash)
      .run()

    for (let i = 0; i < 3; i++) {
      await call('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Wrong' })
      })
    }
    const { response: success } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'ResetCounter#1' })
    })
    expect(success.status).toBe(200)

    // 登入成功後再打錯 3 次，總數沒有累加到超過門檻，不該被鎖。
    for (let i = 0; i < 3; i++) {
      const { response } = await call('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Wrong' })
      })
      expect(response.status).toBe(401)
    }
  })
})

describe('取得目前登入者（GET /auth/me）與登出（POST /auth/logout）', () => {
  let token: string

  beforeAll(async () => {
    const hash = await hashPassword('MeTest#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, 'super_admin')")
      .bind('me-user@webconf.local', hash, 'Me 測試')
      .run()
    token = await login('me-user@webconf.local', 'MeTest#123')
  })

  it('沒帶 token，回 401', async () => {
    const { response } = await call('/auth/me')
    expect(response.status).toBe(401)
  })

  it('帶有效 token，回傳目前登入者', async () => {
    const { response, body } = await call('/auth/me', authed(token))
    expect(response.status).toBe(200)
    expect((body.admin as Record<string, unknown>).email).toBe('me-user@webconf.local')
  })

  it('登出後，同一個 token 不能再用', async () => {
    const { response: logoutResp } = await call('/auth/logout', authed(token, { method: 'POST' }))
    expect(logoutResp.status).toBe(200)

    const { response: afterLogout } = await call('/auth/me', authed(token))
    expect(afterLogout.status).toBe(401)
  })
})

describe('修改密碼（POST /auth/change-password）', () => {
  it('成功修改：舊密碼正確、新密碼符合規則，且撤銷其他裝置 session、保留這次的 token', async () => {
    const hash = await hashPassword('OldPass#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('change-pw-user@webconf.local', hash)
      .run()

    const tokenA = await login('change-pw-user@webconf.local', 'OldPass#123')
    const tokenB = await login('change-pw-user@webconf.local', 'OldPass#123')

    const { response } = await call('/auth/change-password', authed(tokenA, {
      method: 'POST',
      body: JSON.stringify({ old_password: 'OldPass#123', new_password: 'NewPass#456', new_password_confirm: 'NewPass#456' })
    }))
    expect(response.status).toBe(200)

    // tokenB（另一個裝置的 session）應該被撤銷了。
    const { response: bAfter } = await call('/auth/me', authed(tokenB))
    expect(bAfter.status).toBe(401)

    // tokenA（這次操作當下用的）應該還能用。
    const { response: aAfter } = await call('/auth/me', authed(tokenA))
    expect(aAfter.status).toBe(200)

    // 新密碼真的能登入。
    const { response: newLogin } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'change-pw-user@webconf.local', password: 'NewPass#456' })
    })
    expect(newLogin.status).toBe(200)
  })

  it('新密碼與確認密碼不一致，回 400', async () => {
    const hash = await hashPassword('OldPass#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('change-pw-mismatch@webconf.local', hash)
      .run()
    const token = await login('change-pw-mismatch@webconf.local', 'OldPass#123')

    const { response, body } = await call('/auth/change-password', authed(token, {
      method: 'POST',
      body: JSON.stringify({ old_password: 'OldPass#123', new_password: 'NewPass#456', new_password_confirm: 'Different#1' })
    }))
    expect(response.status).toBe(400)
    expect(body.error).toBe('新密碼與確認密碼不一致')
  })

  it('新密碼不符合強度規則，回 400', async () => {
    const hash = await hashPassword('OldPass#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('change-pw-weak@webconf.local', hash)
      .run()
    const token = await login('change-pw-weak@webconf.local', 'OldPass#123')

    const { response, body } = await call('/auth/change-password', authed(token, {
      method: 'POST',
      body: JSON.stringify({ old_password: 'OldPass#123', new_password: 'weak', new_password_confirm: 'weak' })
    }))
    expect(response.status).toBe(400)
    expect(body.error).toBe('新密碼至少 8 碼，需包含大小寫字母與至少 1 個特殊符號')
  })

  it('舊密碼錯誤，回 401；連續失敗 5 次後鎖定，回 429', async () => {
    const hash = await hashPassword('OldPass#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('change-pw-lockout@webconf.local', hash)
      .run()
    const token = await login('change-pw-lockout@webconf.local', 'OldPass#123')

    for (let i = 0; i < 5; i++) {
      const { response } = await call('/auth/change-password', authed(token, {
        method: 'POST',
        body: JSON.stringify({ old_password: 'WrongOld#1', new_password: 'NewPass#456', new_password_confirm: 'NewPass#456' })
      }))
      expect(response.status).toBe(401)
    }

    const { response } = await call('/auth/change-password', authed(token, {
      method: 'POST',
      body: JSON.stringify({ old_password: 'OldPass#123', new_password: 'NewPass#456', new_password_confirm: 'NewPass#456' })
    }))
    expect(response.status).toBe(429)
  })
})
