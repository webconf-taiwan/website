import { Hono } from 'hono'
import type { Bindings } from '../index'
import { verifyPassword, generateSessionToken } from '../utils/crypto'
import { requireAuth, type AuthVariables } from '../middleware/auth'

// session 7 天過期，跟前端 Nuxt server route 設的 cookie maxAge 要對齊
// （website/server/api/admin/login.post.js）。
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

type AdminRow = {
  id: number
  email: string
  password_hash: string
}

export const auth = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

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

auth.get('/me', requireAuth, (c) => {
  return c.json({ admin: c.get('admin') })
})

auth.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '')
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  }
  return c.json({ ok: true })
})
