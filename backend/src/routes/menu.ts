import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { Bindings } from '../index'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { getMenu, updateMenu } from '../controllers/menuController'
import { ErrorSchema } from '../schemas/common'

export const menu = new OpenAPIHono<{ Bindings: Bindings; Variables: AuthVariables }>()

const NavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  target: z.string(),
  side: z.string(),
  is_highlight: z.boolean()
})

const MenuLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  target: z.string()
})

const MenuGroupSchema = z.object({
  title: z.string(),
  links: z.array(MenuLinkSchema)
})

const getMenuRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Menu'],
  summary: '讀取 Header/Footer 選單（公開，不用登入）',
  responses: {
    200: {
      description: '選單內容',
      content: {
        'application/json': {
          schema: z.object({
            nav_items: z.array(NavItemSchema),
            menu_groups: z.array(MenuGroupSchema)
          })
        }
      }
    },
    404: {
      description: '選單資料尚未初始化',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

// 注意：body 這裡刻意不接 Zod schema 驗證。updateMenu controller 自己手動檢查
// nav_items / menu_groups 是否為陣列並回自訂錯誤訊息，這支路由是從既有 API 重構
// 過來的，重構規則是「行為不能變」，所以驗證邏輯維持在 controller 裡，不讓
// zod-openapi 的自動驗證搶在前面、換掉原本的錯誤回應格式。
const updateMenuRoute = createRoute({
  method: 'put',
  path: '/',
  tags: ['Menu'],
  summary: '更新 Header/Footer 選單（需登入）',
  description: 'Request body：`{ nav_items: NavItem[], menu_groups: MenuGroup[] }`，整包覆蓋、不做逐筆 diff。',
  security: [{ Bearer: [] }],
  middleware: [requireAuth] as const,
  responses: {
    200: {
      description: '更新成功',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true) }) } }
    },
    400: {
      description: 'nav_items 或 menu_groups 不是陣列',
      content: { 'application/json': { schema: ErrorSchema } }
    },
    401: {
      description: '未登入或登入已過期',
      content: { 'application/json': { schema: ErrorSchema } }
    }
  }
})

menu.openapi(getMenuRoute, getMenu)
menu.openapi(updateMenuRoute, updateMenu)
