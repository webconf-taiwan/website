import { Hono } from 'hono'
import type { Bindings } from '../index'
import { verifyPassword, generateSessionToken } from '../utils/crypto'

// session 7 天過期，跟前端 Nuxt server route 設的 cookie maxAge 要對齊
// （website/server/api/admin/login.post.js）。
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

type AdminRow = {
  id: number
  email: string
  password_hash: string
}

type SessionRow = {
  id: number
  email: string
  expiresAt: string
}

export const auth = new Hono<{ Bindings: Bindings }>()

auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return c.json({ error: 'email 和 password 必填' }, 400)
  }

  const admin = await c.env.DB
    .prepare('SELECT id, email, password_hash FROM admins WHERE email = ?')
    .bind(email)
    .first<AdminRow>()

  // 帳號不存在跟密碼錯誤回同一句話，不讓對方能用回應內容反推帳號是否存在。
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return c.json({ error: '帳號或密碼錯誤' }, 401)
  }

  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  await c.env.DB
    .prepare('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, admin.id, expiresAt)
    .run()

  return c.json({
    token,
    expiresAt,
    admin: { id: admin.id, email: admin.email }
  })
})

auth.get('/me', async (c) => {
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return c.json({ error: '未登入' }, 401)

  const session = await c.env.DB
    .prepare(
      `SELECT admins.id as id, admins.email as email, sessions.expires_at as expiresAt
       FROM sessions
       JOIN admins ON admins.id = sessions.admin_id
       WHERE sessions.token = ?`
    )
    .bind(token)
    .first<SessionRow>()

  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json({ error: '登入已過期' }, 401)
  }

  return c.json({ admin: { id: session.id, email: session.email } })
})

auth.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '')
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  }
  return c.json({ ok: true })
})
