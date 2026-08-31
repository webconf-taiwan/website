import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { Bindings } from '../index'
import { check } from '../controllers/healthController'

export const health = new OpenAPIHono<{ Bindings: Bindings }>()

const checkRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Health'],
  summary: '健康檢查，順便驗證 D1 binding 是否正常',
  responses: {
    200: {
      description: '服務正常',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('ok'),
            db: z.array(z.object({ ok: z.number() }))
          })
        }
      }
    }
  }
})

health.openapi(checkRoute, check)
