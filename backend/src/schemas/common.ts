import { z } from '@hono/zod-openapi'

// 所有錯誤回應共用這個形狀（見各 controller 的 c.json({ error: '...' }, status)）。
export const ErrorSchema = z.object({
  error: z.string()
}).openapi('Error')
