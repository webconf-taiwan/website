import { createExecutionContext, waitOnExecutionContext, env } from 'cloudflare:test'
import { describe, it, expect, beforeAll } from 'vitest'
import worker from '../src/index'
import { hashPassword } from '../src/utils/crypto'

// 這條保護規則要在「整個系統只有一位 Super Admin」的情境下驗證才有意義，
// 所以獨立成一支測試檔案（測試框架是每個檔案各自一份乾淨 D1，不會跟
// admins.test.ts 共用資料，不會被那邊建的其他 super_admin 干擾判斷）。
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

describe('最後一位 Super Admin 保護規則', () => {
  let onlySuperAdminToken: string
  let onlySuperAdminId: number
  let helperToken: string
  let leadToken: string

  beforeAll(async () => {
    const superHash = await hashPassword('OnlySuper#123')
    const { meta } = await env.DB
      .prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'super_admin')")
      .bind('only-super@webconf.local', superHash)
      .run()
    onlySuperAdminId = meta.last_row_id
    onlySuperAdminToken = await login('only-super@webconf.local', 'OnlySuper#123')

    const helperHash = await hashPassword('Helper#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'design')")
      .bind('helper@webconf.local', helperHash)
      .run()
    helperToken = await login('helper@webconf.local', 'Helper#123')

    // 有刪除權限的管理者角色（見 Todolist0901-資安.md 1-1），用來驗證「最後一位
    // Super Admin 不能被刪除」這條保護規則，對有權限的呼叫者一樣要擋下來，
    // 不是靠角色檢查就自動放行。
    const leadHash = await hashPassword('Lead#123')
    await env.DB.prepare("INSERT INTO admins (email, password_hash, role) VALUES (?, ?, 'lead')")
      .bind('lead@webconf.local', leadHash)
      .run()
    leadToken = await login('lead@webconf.local', 'Lead#123')
  })

  it('不能降級最後一位 Super Admin（自己改自己）', async () => {
    const { response, body } = await call(`/admins/${onlySuperAdminId}`, authed(onlySuperAdminToken, {
      method: 'PUT',
      body: JSON.stringify({ role: 'lead' })
    }))
    expect(response.status).toBe(409)
    expect(body.error).toBe('這是最後一位 Super Admin，不能被降級')
  })

  it('沒有刪除權限的角色，連嘗試都會被 403 擋下（2026-09-01 補的權限檢查）', async () => {
    const { response, body } = await call('/admins', authed(helperToken, {
      method: 'DELETE',
      body: JSON.stringify({ ids: [onlySuperAdminId] })
    }))
    expect(response.status).toBe(403)
    expect(body.error).toBe('沒有權限刪除管理者')
  })

  it('不能刪除最後一位 Super Admin（有刪除權限的 lead 角色操作）', async () => {
    const { response, body } = await call('/admins', authed(leadToken, {
      method: 'DELETE',
      body: JSON.stringify({ ids: [onlySuperAdminId] })
    }))
    expect(response.status).toBe(409)
    expect(body.error).toBe('不能刪除最後一位 Super Admin')
  })
})
