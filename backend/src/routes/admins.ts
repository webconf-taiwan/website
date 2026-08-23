import { Hono } from 'hono'
import type { Bindings } from '../index'
import { requireAuth, type AuthVariables } from '../middleware/auth'

type AdminListRow = {
  id: number
  email: string
  created_at: string
}

export const admins = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

// 列出所有管理者帳號。要先登入才能看（requireAuth），這支本身就是在管理
// 「誰能登入後台」，不能比後台其他頁面更寬鬆。
// 刻意不 SELECT password_hash：就算是雜湊過的，也沒有理由離開資料庫，
// 少一個會外流的欄位就少一個風險，前端本來就用不到這欄。
admins.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT id, email, created_at FROM admins ORDER BY created_at DESC')
    .all<AdminListRow>()

  return c.json({ admins: results })
})
