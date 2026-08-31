import type { Context } from 'hono'
import type { Bindings } from '../index'
import type { AuthVariables } from '../middleware/auth'

type Env = { Bindings: Bindings; Variables: AuthVariables }

// Header / Footer 選單。DB schema 見 migrations/0002_create_site_menu.sql
// （單列兩個 JSON 欄位，理由寫在那份 migration 裡）。
type SiteMenuRow = {
  nav_items_json: string
  menu_groups_json: string
}

// 公開讀取：首頁 Header/Footer 本身也要打這支（見
// website/server/api/global.get.js 怎麼把這支結果併進 /api/global），不用登入。
export async function getMenu(c: Context<Env>) {
  const row = await c.env.DB
    .prepare('SELECT nav_items_json, menu_groups_json FROM site_menu WHERE id = 1')
    .first<SiteMenuRow>()

  if (!row) {
    return c.json({ error: '選單資料尚未初始化，請先跑 migration' }, 404)
  }

  return c.json({
    nav_items: JSON.parse(row.nav_items_json),
    menu_groups: JSON.parse(row.menu_groups_json)
  }, 200)
}

// 儲存：要登入。後台編輯頁是整份表單一起送出，這裡也整包覆蓋，不做逐筆 diff。
export async function updateMenu(c: Context<Env>) {
  const body = await c.req.json().catch(() => null)

  if (!Array.isArray(body?.nav_items) || !Array.isArray(body?.menu_groups)) {
    return c.json({ error: 'nav_items 和 menu_groups 必填，且必須是陣列' }, 400)
  }

  await c.env.DB
    .prepare('UPDATE site_menu SET nav_items_json = ?, menu_groups_json = ?, updated_at = datetime(\'now\') WHERE id = 1')
    .bind(JSON.stringify(body.nav_items), JSON.stringify(body.menu_groups))
    .run()

  return c.json({ ok: true as const }, 200)
}
