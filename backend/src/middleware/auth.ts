import type { MiddlewareHandler } from 'hono'
import type { Bindings } from '../index'

type SessionRow = {
  id: number
  email: string
  role: string
  expiresAt: string
}

export type AuthVariables = {
  admin: { id: number; email: string; role: string }
}

// 掛在任何「先登入才能看」的路由前面：驗 Authorization: Bearer <token>，查 session
// 過期了沒，通過的話把目前登入的管理者塞進 context（c.get('admin')），後面的 handler
// 不用再各自查一次。原本這段驗證邏輯寫在 /auth/me 裡，現在 /admins 這個新資源也要用，
// 抽成共用 middleware，「誰登入了」只查一次寫一次，兩支路由不用各刻一份。
// role 一併查出來：管理者 CRUD 的權限判斷（誰能改 role、誰能新增管理者）都要用到，
// 不查出來的話每支 controller 都要自己再查一次目前登入者的角色。
export const requireAuth: MiddlewareHandler<{ Bindings: Bindings; Variables: AuthVariables }> = async (c, next) => {
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return c.json({ error: '未登入' }, 401)

  const session = await c.env.DB
    .prepare(
      `SELECT admins.id as id, admins.email as email, admins.role as role, sessions.expires_at as expiresAt
       FROM sessions
       JOIN admins ON admins.id = sessions.admin_id
       WHERE sessions.token = ?`
    )
    .bind(token)
    .first<SessionRow>()

  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json({ error: '登入已過期' }, 401)
  }

  c.set('admin', { id: session.id, email: session.email, role: session.role })
  await next()
}
