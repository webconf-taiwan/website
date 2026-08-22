import { Hono } from 'hono'
import type { Bindings } from '../index'

// 健康檢查用，順便驗證 D1 binding 有沒有接上（deploy 完先打這支確認環境正常）。
export const health = new Hono<{ Bindings: Bindings }>()

health.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT 1 AS ok').all()
  return c.json({ status: 'ok', db: results })
})
