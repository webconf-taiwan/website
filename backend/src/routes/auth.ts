import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { Bindings } from '../index'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { login, me, logout, changePassword, forgotPassword, resetPassword } from '../controllers/authController'
import { ErrorSchema } from '../schemas/common'

export const auth = new OpenAPIHono<{ Bindings: Bindings; Variables: AuthVariables }>()

const AdminSchema = z.object({
  id: z.number(),
  email: z.string(),
  role: z.string()
})

// 注意：body 刻意不接 Zod schema 驗證，理由跟 menu.ts 的 PUT /menu 一樣——
// login controller 自己手動檢查 email/password 是否為空並回自訂錯誤訊息，
// 這支是從既有 API 重構過來的，要保持行為不變，驗證邏輯留在 controller 裡。
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: '登入，成功回傳 session token',
  description: 'Request body：`{ email: string, password: string }`',
  responses: {
    200: {
      description: '登入成功',
      content: {
        'application/json': {
          schema: z.object({
            token: z.string(),
            expiresAt: z.string(),
            admin: AdminSchema
          })
        }
      }
    },
    400: {
      description: 'email 或 password 未填',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    401: {
      description: '帳號或密碼錯誤',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const meRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Auth'],
  summary: '取得目前登入者',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  responses: {
    200: {
      description: '目前登入的管理者',
      content: { 'application/json': { schema: z.object({ admin: AdminSchema }) } }
    },
    401: {
      description: '未登入或登入已過期',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Auth'],
  summary: '登出，撤銷目前這個 token',
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: '一律回成功（沒帶 token 或 token 已經失效也一樣回 ok）',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true) }) } }
    }
  }
})

const changePasswordRoute = createRoute({
  method: 'post',
  path: '/change-password',
  tags: ['Auth'],
  summary: '修改自己的密碼（需登入），成功後撤銷其他裝置的既有 session',
  description: 'Request body：`{ old_password, new_password, new_password_confirm }`',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  responses: {
    200: {
      description: '修改成功',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true) }) } }
    },
    400: {
      description: '欄位缺漏、新密碼與確認密碼不一致、或不符合強度規則',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    401: {
      description: '未登入、登入已過期，或原密碼不正確',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const forgotPasswordRoute = createRoute({
  method: 'post',
  path: '/forgot-password',
  tags: ['Auth'],
  summary: '忘記密碼－產生重設 Token（寄信這一步尚未實作，見 description）',
  description: 'Request body：`{ email }`。**注意：目前只會產生 Token 並存進 `password_reset_tokens`，還沒有真的寄出 Email，這段待日後補上 Gmail SMTP client。** 不管 email 是否存在都回同樣的成功訊息。',
  responses: {
    200: {
      description: '一律回成功',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true) }) } }
    },
    400: {
      description: 'email 未填',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const resetPasswordRoute = createRoute({
  method: 'post',
  path: '/reset-password',
  tags: ['Auth'],
  summary: '忘記密碼－帶 Token 設定新密碼',
  description: 'Request body：`{ token, new_password, new_password_confirm }`',
  responses: {
    200: {
      description: '設定成功',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true) }) } }
    },
    400: {
      description: '欄位缺漏、Token 無效或過期、或新密碼不符合規則',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

auth.openapi(loginRoute, login)
auth.openapi(meRoute, me)
auth.openapi(logoutRoute, logout)
auth.openapi(changePasswordRoute, changePassword)
auth.openapi(forgotPasswordRoute, forgotPassword)
auth.openapi(resetPasswordRoute, resetPassword)
