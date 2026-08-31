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

  it('編輯管理者：任何登入者都能改自己以外的 name', async () => {
    const { response, body } = await call(`/admins/${designId}`, authed(designToken, {
      method: 'PUT',
      body: JSON.stringify({ name: '改過的名字' })
    }))
    expect(response.status).toBe(200)
    expect((body.admin as Record<string, unknown>).name).toBe('改過的名字')
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
