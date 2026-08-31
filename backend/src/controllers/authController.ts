import type { Context } from 'hono'
import type { Bindings } from '../index'
import type { AuthVariables } from '../middleware/auth'
import { verifyPassword, hashPassword, generateSessionToken } from '../utils/crypto'
import { isStrongPassword } from '../utils/password'

type Env = { Bindings: Bindings; Variables: AuthVariables }

// session 7 天過期，跟前端 Nuxt server route 設的 cookie maxAge 要對齊
// （website/server/api/admin/login.post.js）。
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7
// 忘記密碼的重設連結 24 小時內有效（見 Todolist0831.md 第 9 節）。
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60 * 24

type AdminRow = {
  id: number
  email: string
  password_hash: string
  role: string
}

export async function login(c: Context<Env>) {
  const body = await c.req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return c.json({ error: 'email 和 password 必填' }, 400)
  }

  const admin = await c.env.DB
    .prepare('SELECT id, email, password_hash, role FROM admins WHERE email = ?')
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

  // 登入成功順手記一筆最後登入時間（見 Todolist0831.md 第 6 節，列表/內頁都要顯示）。
  // 不擋登入流程本身，寫失敗也不影響這次登入是否成功。
  await c.env.DB
    .prepare("UPDATE admins SET last_login_at = datetime('now') WHERE id = ?")
    .bind(admin.id)
    .run()

  return c.json({
    token,
    expiresAt,
    admin: { id: admin.id, email: admin.email, role: admin.role }
  }, 200)
}

export async function me(c: Context<Env>) {
  // role 一起回傳：前端要靠這個判斷要不要顯示「調整權限」相關 UI
  // （見 Todolist0831.md 第 5 節，前端隱藏 UI 只是體驗，後端 API 才是真正的權限控管）。
  return c.json({ admin: c.get('admin') }, 200)
}

export async function logout(c: Context<Env>) {
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '')
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  }
  return c.json({ ok: true as const }, 200)
}

export async function changePassword(c: Context<Env>) {
  const caller = c.get('admin')
  const body = await c.req.json().catch(() => null) as
    { old_password?: string; new_password?: string; new_password_confirm?: string } | null

  const oldPassword = body?.old_password ?? ''
  const newPassword = body?.new_password ?? ''
  const newPasswordConfirm = body?.new_password_confirm ?? ''

  if (!oldPassword || !newPassword || !newPasswordConfirm) {
    return c.json({ error: 'old_password、new_password、new_password_confirm 都必填' }, 400)
  }
  if (newPassword !== newPasswordConfirm) {
    return c.json({ error: '新密碼與確認密碼不一致' }, 400)
  }
  if (!isStrongPassword(newPassword)) {
    return c.json({ error: '新密碼至少 8 碼，需包含大小寫字母與至少 1 個特殊符號' }, 400)
  }

  const admin = await c.env.DB
    .prepare('SELECT id, password_hash FROM admins WHERE id = ?')
    .bind(caller.id)
    .first<{ id: number; password_hash: string }>()
  if (!admin || !(await verifyPassword(oldPassword, admin.password_hash))) {
    return c.json({ error: '原密碼不正確' }, 401)
  }

  const newHash = await hashPassword(newPassword)
  await c.env.DB.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').bind(newHash, admin.id).run()

  // 撤銷這個管理者名下其他裝置的既有 session（定案，見 Todolist0831.md 第 8 節），
  // 保留這次請求當下用的 token，不然自己會被自己登出。
  const currentToken = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  await c.env.DB
    .prepare('DELETE FROM sessions WHERE admin_id = ? AND token != ?')
    .bind(admin.id, currentToken)
    .run()

  return c.json({ ok: true as const }, 200)
}

export async function forgotPassword(c: Context<Env>) {
  const body = await c.req.json().catch(() => null) as { email?: string } | null
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email) {
    return c.json({ error: 'email 必填' }, 400)
  }

  const admin = await c.env.DB.prepare('SELECT id FROM admins WHERE email = ?').bind(email).first<{ id: number }>()

  // 不管 email 存不存在都回一樣的成功訊息，避免被拿來反推帳號是否存在
  // （跟 login 的錯誤訊息設計同一個理由，見 Todolist0831.md 第 9 節）。
  if (admin) {
    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString()
    await c.env.DB
      .prepare('INSERT INTO password_reset_tokens (token, admin_id, expires_at) VALUES (?, ?, ?)')
      .bind(token, admin.id, expiresAt)
      .run()

    // 寄信這一步刻意先不做（已跟使用者確認：這次只做到產生 Token，SMTP 寄信
    // 之後有真實 Gmail 憑證才會補，見 Todolist0831.md 第 9 節「測試範圍」）。
    // TODO: 用 utils/smtp.ts 的 Gmail SMTP client 把 token 組成重設連結寄出。
  }

  return c.json({ ok: true as const }, 200)
}

export async function resetPassword(c: Context<Env>) {
  const body = await c.req.json().catch(() => null) as
    { token?: string; new_password?: string; new_password_confirm?: string } | null

  const token = body?.token ?? ''
  const newPassword = body?.new_password ?? ''
  const newPasswordConfirm = body?.new_password_confirm ?? ''

  if (!token || !newPassword || !newPasswordConfirm) {
    return c.json({ error: 'token、new_password、new_password_confirm 都必填' }, 400)
  }

  const resetToken = await c.env.DB
    .prepare('SELECT admin_id, expires_at, used_at FROM password_reset_tokens WHERE token = ?')
    .bind(token)
    .first<{ admin_id: number; expires_at: string; used_at: string | null }>()

  if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at) < new Date()) {
    return c.json({ error: '重設連結無效或已過期' }, 400)
  }
  if (newPassword !== newPasswordConfirm) {
    return c.json({ error: '新密碼與確認密碼不一致' }, 400)
  }
  if (!isStrongPassword(newPassword)) {
    return c.json({ error: '新密碼至少 8 碼，需包含大小寫字母與至少 1 個特殊符號' }, 400)
  }

  const newHash = await hashPassword(newPassword)
  await c.env.DB.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').bind(newHash, resetToken.admin_id).run()
  await c.env.DB
    .prepare("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE token = ?")
    .bind(token)
    .run()
  // 忘記密碼代表這個人可能整台裝置都不可信任，順手撤銷所有既有 session，
  // 跟 changePassword 的邏輯一致，但這裡沒有「目前這次請求的 token」可以保留。
  await c.env.DB.prepare('DELETE FROM sessions WHERE admin_id = ?').bind(resetToken.admin_id).run()

  return c.json({ ok: true as const }, 200)
}
