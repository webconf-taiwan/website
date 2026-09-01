import type { MiddlewareHandler } from 'hono'
import type { Bindings } from '../index'
import { hashToken } from '../utils/crypto'

type SessionRow = {
  id: number
  email: string
  role: string
  expiresAt: string
}

export type AuthVariables = {
  admin: { id: number; email: string; role: string }
}

// session 7 天過期，跟前端 Nuxt server route 設的 cookie maxAge 要對齊
// （website/server/api/admin/login.post.js）。authController.ts 的 login() 也用
// 這個常數，兩邊要一致，所以定義在這裡統一 export，不各自寫一份。
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

// 掛在任何「先登入才能看」的路由前面：驗 Authorization: Bearer <token>，查 session
// 過期了沒，通過的話把目前登入的管理者塞進 context（c.get('admin')），後面的 handler
// 不用再各自查一次。原本這段驗證邏輯寫在 /auth/me 裡，現在 /admins 這個新資源也要用，
// 抽成共用 middleware，「誰登入了」只查一次寫一次，兩支路由不用各刻一份。
// role 一併查出來：管理者 CRUD 的權限判斷（誰能改 role、誰能新增管理者）都要用到，
// 不查出來的話每支 controller 都要自己再查一次目前登入者的角色。
export const requireAuth: MiddlewareHandler<{ Bindings: Bindings; Variables: AuthVariables }> = async (c, next) => {
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return c.json({ error: '未登入' }, 401)

  // 資料庫裡存的是 token 的雜湊值，不是明文（見 Todolist0901-資安.md 2-2），
  // 查詢前要先把收到的 token 雜湊一次，才能跟 DB 裡的 token_hash 對上。
  const tokenHash = await hashToken(token)

  const session = await c.env.DB
    .prepare(
      `SELECT admins.id as id, admins.email as email, admins.role as role, sessions.expires_at as expiresAt
       FROM sessions
       JOIN admins ON admins.id = sessions.admin_id
       WHERE sessions.token_hash = ?`
    )
    .bind(tokenHash)
    .first<SessionRow>()

  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json({ error: '登入已過期' }, 401)
  }

  // 滑動過期（見 Todolist0901-資安.md 3-3）：每次驗證通過就把這筆 session 的
  // expires_at 往後延，讓「還在用」的登入不會因為固定 7 天到期被迫重新登入，
  // 但真的一段時間沒動作，還是會照原本的到期時間失效。
  // 不擋這次請求本身——延長失敗不影響這次驗證結果，下次請求還會再試一次。
  const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  await c.env.DB
    .prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?')
    .bind(newExpiresAt, tokenHash)
    .run()

  c.set('admin', { id: session.id, email: session.email, role: session.role })
  await next()
}
