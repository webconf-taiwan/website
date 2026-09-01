import type { Context } from 'hono'
import type { Bindings } from '../index'
import { SESSION_TTL_MS, type AuthVariables } from '../middleware/auth'
import { verifyPassword, hashPassword, generateSessionToken, hashToken } from '../utils/crypto'
import { isStrongPassword } from '../utils/password'
import { sendPasswordResetEmail } from '../utils/mailer'
import { writeAuditLog } from '../utils/auditLog'
import { isLocked, recordFailure, clearFailures } from '../utils/loginThrottle'

type Env = { Bindings: Bindings; Variables: AuthVariables }

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

  // 登入節流（見 Todolist0901-資安.md 2-1）：鎖定中先擋掉，不用先花一次 PBKDF2
  // 驗證的 CPU time。用 email 當 key，不管這個 email 實際存不存在都適用同一套
  // 邏輯，不會另外洩漏「這個帳號是否存在」的訊號。
  if (await isLocked(c.env, 'login', email)) {
    return c.json({ error: '嘗試次數過多，請 15 分鐘後再試' }, 429)
  }

  const admin = await c.env.DB
    .prepare('SELECT id, email, password_hash, role FROM admins WHERE email = ?')
    .bind(email)
    .first<AdminRow>()

  // 帳號不存在跟密碼錯誤回同一句話，不讓對方能用回應內容反推帳號是否存在。
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    await recordFailure(c.env, 'login', email)
    return c.json({ error: '帳號或密碼錯誤' }, 401)
  }

  await clearFailures(c.env, 'login', email)

  const token = generateSessionToken()
  const tokenHash = await hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  // 存進 DB 的是雜湊值（見 Todolist0901-資安.md 2-2），回傳給呼叫端的仍是明文
  // token——雜湊是單向的，DB 裡查不到明文，之後每次驗證都是雜湊輸入再比對。
  await c.env.DB
    .prepare('INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)')
    .bind(tokenHash, admin.id, expiresAt)
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
    const tokenHash = await hashToken(token)
    await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run()
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

  // 登入節流同一套機制，scope 用 caller.id（已經是登入後才能呼叫這支，
  // 不像 login 那樣需要顧慮帳號列舉，直接用 id 當 key 即可）。
  const throttleId = String(caller.id)
  if (await isLocked(c.env, 'change-password', throttleId)) {
    return c.json({ error: '嘗試次數過多，請 15 分鐘後再試' }, 429)
  }

  const admin = await c.env.DB
    .prepare('SELECT id, password_hash FROM admins WHERE id = ?')
    .bind(caller.id)
    .first<{ id: number; password_hash: string }>()
  if (!admin || !(await verifyPassword(oldPassword, admin.password_hash))) {
    await recordFailure(c.env, 'change-password', throttleId)
    return c.json({ error: '原密碼不正確' }, 401)
  }

  await clearFailures(c.env, 'change-password', throttleId)

  const newHash = await hashPassword(newPassword)
  await c.env.DB.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').bind(newHash, admin.id).run()

  // 撤銷這個管理者名下其他裝置的既有 session（定案，見 Todolist0831.md 第 8 節），
  // 保留這次請求當下用的 token，不然自己會被自己登出。DB 存的是雜湊值，比較前
  // 一樣要先把目前這個 token 雜湊一次才對得上。
  const currentToken = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  const currentTokenHash = await hashToken(currentToken)
  await c.env.DB
    .prepare('DELETE FROM sessions WHERE admin_id = ? AND token_hash != ?')
    .bind(admin.id, currentTokenHash)
    .run()

  await writeAuditLog(c.env, {
    actorId: admin.id,
    actorEmail: caller.email,
    action: 'admin.change_password',
    targetId: admin.id,
    targetEmail: caller.email
  })

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
    const tokenHash = await hashToken(token)
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString()
    // 存進 DB 的是雜湊值（見 Todolist0901-資安.md 2-2），明文 token 只透過
    // sendPasswordResetEmail() 往寄信這條路徑傳，資料庫裡永遠查不到明文。
    await c.env.DB
      .prepare('INSERT INTO password_reset_tokens (token_hash, admin_id, expires_at) VALUES (?, ?, ?)')
      .bind(tokenHash, admin.id, expiresAt)
      .run()

    // 寄信本身刻意先不做（已跟使用者確認：這波只做到產生 Token，SMTP 實際連線
    // 之後有真實 Gmail 憑證才會補，見 Todolist0831.md 第 9 節「測試範圍」、
    // utils/mailer.ts）。這裡先呼叫介面，讓整合測試能 mock 它、驗證參數正確。
    await sendPasswordResetEmail(c.env, email, token)
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

  // 這支端點無法用 email 當節流依據——Token 無效時查不到對應帳號，沒有身份可以
  // 拿來當 key。改用來源 IP（Cloudflare 邊緣一定會帶這個 header）：擋同一來源
  // 反覆亂猜 Token 的行為（見 Todolist0901-資安.md 2-1）。
  const clientIp = c.req.header('CF-Connecting-IP') ?? 'unknown'
  if (await isLocked(c.env, 'reset-password', clientIp)) {
    return c.json({ error: '嘗試次數過多，請 15 分鐘後再試' }, 429)
  }

  const tokenHash = await hashToken(token)
  const resetToken = await c.env.DB
    .prepare(
      `SELECT password_reset_tokens.admin_id as admin_id, password_reset_tokens.expires_at as expires_at,
              password_reset_tokens.used_at as used_at, admins.email as admin_email
       FROM password_reset_tokens
       JOIN admins ON admins.id = password_reset_tokens.admin_id
       WHERE password_reset_tokens.token_hash = ?`
    )
    .bind(tokenHash)
    .first<{ admin_id: number; expires_at: string; used_at: string | null; admin_email: string }>()

  if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at) < new Date()) {
    await recordFailure(c.env, 'reset-password', clientIp)
    return c.json({ error: '重設連結無效或已過期' }, 400)
  }
  if (newPassword !== newPasswordConfirm) {
    return c.json({ error: '新密碼與確認密碼不一致' }, 400)
  }
  if (!isStrongPassword(newPassword)) {
    return c.json({ error: '新密碼至少 8 碼，需包含大小寫字母與至少 1 個特殊符號' }, 400)
  }

  await clearFailures(c.env, 'reset-password', clientIp)

  const newHash = await hashPassword(newPassword)
  await c.env.DB.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').bind(newHash, resetToken.admin_id).run()
  await c.env.DB
    .prepare("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE token_hash = ?")
    .bind(tokenHash)
    .run()
  // 忘記密碼代表這個人可能整台裝置都不可信任，順手撤銷所有既有 session，
  // 跟 changePassword 的邏輯一致，但這裡沒有「目前這次請求的 token」可以保留。
  await c.env.DB.prepare('DELETE FROM sessions WHERE admin_id = ?').bind(resetToken.admin_id).run()

  // actorId 傳 null：這個操作發生在登入之前，沒有「呼叫者」可記，只記得對誰做的。
  await writeAuditLog(c.env, {
    actorId: null,
    action: 'admin.reset_password',
    targetId: resetToken.admin_id,
    targetEmail: resetToken.admin_email
  })

  return c.json({ ok: true as const }, 200)
}
