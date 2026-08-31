import { createExecutionContext, waitOnExecutionContext, env } from 'cloudflare:test'
import { describe, it, expect, beforeAll } from 'vitest'
import worker from '../src/index'
import { hashPassword } from '../src/utils/crypto'

const IncomingRequest = Request

async function call(path: string, init?: RequestInit) {
  const request = new IncomingRequest(`http://example.com${path}`, init)
  const ctx = createExecutionContext()
  const response = await worker.fetch(request, env, ctx)
  await waitOnExecutionContext(ctx)
  return { response, body: await response.json() }
}

// Menu 這支是從既有 API 重構過來的（controller 分層），重構規則是「行為不能變」。
// 這裡測的是使用者實際會踩到的路徑：讀取、未登入寫入、壞資料寫入、寫入後讀回是否一致，
// 不是針對內部實作細節。
describe('GET /menu, PUT /menu 迴歸測試', () => {
  let token: string

  beforeAll(async () => {
    const passwordHash = await hashPassword('Test#Password123')
    await env.DB.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)')
      .bind('menu-test@webconf.local', passwordHash)
      .run()

    const { body } = await call('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'menu-test@webconf.local', password: 'Test#Password123' })
    })
    token = (body as { token: string }).token
  })

  it('GET /menu 回傳 migration 種好的初始資料', async () => {
    const { response, body } = await call('/menu')
    expect(response.status).toBe(200)
    const { nav_items, menu_groups } = body as { nav_items: unknown[]; menu_groups: unknown[] }
    expect(nav_items).toHaveLength(6)
    expect(menu_groups).toHaveLength(3)
  })

  it('PUT /menu 沒帶 token，回 401 且不寫入', async () => {
    const { response, body } = await call('/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    expect(response.status).toBe(401)
    expect(body).toEqual({ error: '未登入' })
  })

  it('PUT /menu 帶不合法 body（不是陣列），回 400', async () => {
    const { response, body } = await call('/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nav_items: 'not-an-array', menu_groups: [] })
    })
    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'nav_items 和 menu_groups 必填，且必須是陣列' })
  })

  it('PUT /menu 更新後，GET /menu 讀回的內容跟寫入的完全一致', async () => {
    const newMenu = {
      nav_items: [{ id: 'x', label: 'X', href: '#x', target: '_self', side: 'left', is_highlight: false }],
      menu_groups: [{ title: 'T', links: [{ label: 'L', href: '#', target: '_self' }] }]
    }
    const put = await call('/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newMenu)
    })
    expect(put.response.status).toBe(200)
    expect(put.body).toEqual({ ok: true })

    const get = await call('/menu')
    expect(get.body).toEqual(newMenu)
  })
})
