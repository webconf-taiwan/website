import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { Bindings } from '../index'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { listAdmins, getAdmin, createAdmin, updateAdmin, batchDeleteAdmins, VALID_ROLES } from '../controllers/adminsController'
import { ErrorSchema } from '../schemas/common'

export const admins = new OpenAPIHono<{ Bindings: Bindings; Variables: AuthVariables }>()

const RoleSchema = z.enum(VALID_ROLES)

const AdminSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  role: RoleSchema,
  last_login_at: z.string().nullable(),
  created_at: z.string()
})

// 這幾支新 API 的 body 一樣不掛 Zod request 驗證，跟既有路由的處理方式一致——
// 這次不是為了保留舊行為，是為了讓 controller 裡的手動驗證跟這裡的文件用同一套
// 措辭（例如「role 必須是以下其中之一」），避免同一件事在兩層各寫一次訊息、之後改一邊忘了改另一邊。
const listAdminsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Admins'],
  summary: '列出所有管理者帳號（需登入）',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  responses: {
    200: {
      description: '管理者清單，依建立時間新到舊排序',
      content: { 'application/json': { schema: z.object({ admins: z.array(AdminSchema) }) } }
    },
    401: {
      description: '未登入或登入已過期',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const getAdminRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Admins'],
  summary: '查看單筆管理者（需登入；非 Super Admin／總召組只能查自己）',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  request: {
    params: z.object({ id: z.string() })
  },
  responses: {
    200: {
      description: '管理者資料',
      content: { 'application/json': { schema: z.object({ admin: AdminSchema }) } }
    },
    401: {
      description: '未登入或登入已過期',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    403: {
      description: '沒有權限查看這個管理者（呼叫者不是 Super Admin／總召組，且 id 不是自己）',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    404: {
      description: '找不到這個管理者',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const createAdminRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admins'],
  summary: '新增管理者（僅 Super Admin／總召組）',
  description: 'Request body：`{ email, password, name, role }`，四個欄位都必填。',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  responses: {
    201: {
      description: '新增成功',
      content: { 'application/json': { schema: z.object({ admin: AdminSchema }) } }
    },
    400: {
      description: '欄位缺漏或 role 不合法',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    401: {
      description: '未登入或登入已過期',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    403: {
      description: '沒有權限新增管理者（呼叫者不是 Super Admin／總召組）',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    409: {
      description: 'email 已存在',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const updateAdminRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Admins'],
  summary: '編輯管理者（name 限本人／Super Admin／總召組可改，role 僅 Super Admin／總召組可改）',
  description: 'Request body：`{ name?, role? }`，至少要提供一項。非 Super Admin／總召組的呼叫者只能修改自己的 `name`，不能修改別人的（也不能修改 `role`）。',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  request: {
    params: z.object({ id: z.string() })
  },
  responses: {
    200: {
      description: '更新成功',
      content: { 'application/json': { schema: z.object({ admin: AdminSchema }) } }
    },
    400: {
      description: '欄位缺漏或不合法',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    401: {
      description: '未登入或登入已過期',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    403: {
      description: '沒有權限調整 role，或沒有權限修改別人的 name',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    404: {
      description: '找不到這個管理者',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    409: {
      description: '最後一位 Super Admin 不能被降級',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

const batchDeleteAdminsRoute = createRoute({
  method: 'delete',
  path: '/',
  tags: ['Admins'],
  summary: '批次刪除管理者（僅 Super Admin／總召組；單筆刪除傳一筆 id 即可）',
  description: 'Request body：`{ ids: number[] }`',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  responses: {
    200: {
      description: '刪除成功',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true), deleted: z.number() }) } }
    },
    400: {
      description: 'ids 缺漏、包含自己的帳號、或會刪光所有管理者',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    401: {
      description: '未登入或登入已過期',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    403: {
      description: '沒有權限刪除管理者（呼叫者不是 Super Admin／總召組）',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    409: {
      description: '會刪除最後一位 Super Admin',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

admins.openapi(listAdminsRoute, listAdmins)
admins.openapi(getAdminRoute, getAdmin)
admins.openapi(createAdminRoute, createAdmin)
admins.openapi(updateAdminRoute, updateAdmin)
admins.openapi(batchDeleteAdminsRoute, batchDeleteAdmins)
