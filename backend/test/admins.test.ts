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
  return { response, body: await response.json() as Record<string, unknown> }
}

async function login(email: string, password: string) {
  const { body } = await call('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return body.token as string
}

function authed(token: string, extra?: RequestInit): RequestInit {
  return {
    ...extra,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(extra?.headers ?? {}) }
  }
}

describe('管理者 CRUD', () => {
  let superAdminToken: string
  let superAdminId: number
  let designToken: string
  let designId: number

  beforeAll(async () => {
    const superAdminHash = await hashPassword('SuperAdmin#123')
    const { meta } = await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'super_admin')")
      .bind('super@webconf.local', superAdminHash)
      .run()
    superAdminId = meta.last_row_id
    superAdminToken = await login('super@webconf.local', 'SuperAdmin#123')

    const create = await call('/admins', authed(superAdminToken, {
      method: 'POST',
      body: JSON.stringify({ email: 'design@webconf.local', password: 'Design#123', name: '設計組成員', role: 'design' })
    }))
    designId = ((create.body.admin as Record<string, unknown>).id) as number
    designToken = await login('design@webconf.local', 'Design#123')
  })

  it('新增管理者：成功建立，回傳不含 password_hash', async () => {
    const { response, body } = await call('/admins', authed(superAdminToken, {
      method: 'POST',
      body: JSON.stringify({ email: 'dev@webconf.local', password: 'Dev#12345', name: '開發組成員', role: 'dev' })
    }))
    expect(response.status).toBe(201)
    const admin = body.admin as Record<string, unknown>
    expect(admin).toMatchObject({ email: 'dev@webconf.local', name: '開發組成員', role: 'dev' })
    expect(admin.password_hash).toBeUndefined()
  })

  it('新增管理者：非 Super Admin／總召組呼叫，回 403', async () => {
    const { response, body } = await call('/admins', authed(designToken, {
      method: 'POST',
      body: JSON.stringify({ email: 'x@webconf.local', password: 'Xx#123456', name: 'x', role: 'dev' })
    }))
    expect(response.status).toBe(403)
    expect(body.error).toBe('沒有權限新增管理者')
  })

  it('新增管理者：email 重複，回 409', async () => {
    const { response } = await call('/admins', authed(superAdminToken, {
      method: 'POST',
      body: JSON.stringify({ email: 'design@webconf.local', password: 'Xx#123456', name: 'x', role: 'dev' })
    }))
    expect(response.status).toBe(409)
  })

  it('批次刪除：非 Super Admin／總召組呼叫，回 403（2026-09-01 補的權限檢查；此時 designId 角色仍是 design）', async () => {
    const { response, body } = await call('/admins', authed(designToken, {
      method: 'DELETE',
      body: JSON.stringify({ ids: [superAdminId] })
    }))
    expect(response.status).toBe(403)
    expect(body.error).toBe('沒有權限刪除管理者')
  })

  it('編輯管理者：非管理者可以改自己的 name', async () => {
    const { response, body } = await call(`/admins/${designId}`, authed(designToken, {
      method: 'PUT',
      body: JSON.stringify({ name: '改過的名字' })
    }))
    expect(response.status).toBe(200)
    expect((body.admin as Record<string, unknown>).name).toBe('改過的名字')
  })

  it('編輯管理者：非管理者不能改別人的 name，回 403（2026-09-01 補的權限檢查）', async () => {
    const { response, body } = await call(`/admins/${superAdminId}`, authed(designToken, {
      method: 'PUT',
      body: JSON.stringify({ name: '想改超管的名字' })
    }))
    expect(response.status).toBe(403)
    expect(body.error).toBe('沒有權限修改這個管理者的名字')
  })

  it('編輯管理者：Super Admin／總召組可以改別人的 name', async () => {
    const { response, body } = await call(`/admins/${designId}`, authed(superAdminToken, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Super Admin 幫忙改的名字' })
    }))
    expect(response.status).toBe(200)
    expect((body.admin as Record<string, unknown>).name).toBe('Super Admin 幫忙改的名字')
  })

  it('編輯管理者：非 Super Admin／總召組改 role，回 403', async () => {
    const { response, body } = await call(`/admins/${designId}`, authed(designToken, {
      method: 'PUT',
      body: JSON.stringify({ role: 'super_admin' })
    }))
    expect(response.status).toBe(403)
    expect(body.error).toBe('沒有權限調整權限（role）')
  })

  it('編輯管理者：Super Admin 改別人的 role 成功', async () => {
    const { response, body } = await call(`/admins/${designId}`, authed(superAdminToken, {
      method: 'PUT',
      body: JSON.stringify({ role: 'lead' })
    }))
    expect(response.status).toBe(200)
    expect((body.admin as Record<string, unknown>).role).toBe('lead')
  })

  it('批次刪除：刪除別人（非自己），成功', async () => {
    const { response, body } = await call('/admins', authed(superAdminToken, {
      method: 'DELETE',
      body: JSON.stringify({ ids: [designId] })
    }))
    expect(response.status).toBe(200)
    expect(body.deleted).toBe(1)
  })

  it('批次刪除：ids 包含自己的 id，回 400，且不會執行', async () => {
    const { response, body } = await call('/admins', authed(superAdminToken, {
      method: 'DELETE',
      body: JSON.stringify({ ids: [superAdminId] })
    }))
    expect(response.status).toBe(400)
    expect(body.error).toBe('不能刪除自己的帳號')
  })
})

describe('查看單筆管理者（GET /admins/:id）', () => {
  let superAdminToken: string
  let designToken: string
  let designId: number
  let otherDesignToken: string
  let otherDesignId: number

  beforeAll(async () => {
    const superAdminHash = await hashPassword('SuperAdmin#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'super_admin')")
      .bind('super2@webconf.local', superAdminHash)
      .run()
    superAdminToken = await login('super2@webconf.local', 'SuperAdmin#123')

    const create = await call('/admins', authed(superAdminToken, {
      method: 'POST',
      body: JSON.stringify({ email: 'design2@webconf.local', password: 'Design#123', name: '設計組A', role: 'design' })
    }))
    designId = ((create.body.admin as Record<string, unknown>).id) as number
    designToken = await login('design2@webconf.local', 'Design#123')

    const createOther = await call('/admins', authed(superAdminToken, {
      method: 'POST',
      body: JSON.stringify({ email: 'design3@webconf.local', password: 'Design#123', name: '設計組B', role: 'design' })
    }))
    otherDesignId = ((createOther.body.admin as Record<string, unknown>).id) as number
    otherDesignToken = await login('design3@webconf.local', 'Design#123')
  })

  it('非管理者查自己，成功', async () => {
    const { response, body } = await call(`/admins/${designId}`, authed(designToken))
    expect(response.status).toBe(200)
    expect((body.admin as Record<string, unknown>).id).toBe(designId)
  })

  it('非管理者查別人，回 403（IDOR 修復，2026-09-01）', async () => {
    const { response, body } = await call(`/admins/${otherDesignId}`, authed(designToken))
    expect(response.status).toBe(403)
    expect(body.error).toBe('沒有權限查看這個管理者')
  })

  it('Super Admin／總召組查任何人，成功', async () => {
    const { response, body } = await call(`/admins/${designId}`, authed(superAdminToken))
    expect(response.status).toBe(200)
    expect((body.admin as Record<string, unknown>).id).toBe(designId)
  })
})
