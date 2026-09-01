import type { Context } from 'hono'
import type { Bindings } from '../index'
import type { AuthVariables } from '../middleware/auth'
import { hashPassword } from '../utils/crypto'
import { writeAuditLog } from '../utils/auditLog'

type Env = { Bindings: Bindings; Variables: AuthVariables }

// 五組角色，見 Todolist0831.md 第 7 節。identifier 對照：
// super_admin=最高管理者、lead=總召組、design=設計組、dev=開發組、agenda=議程組。
export const VALID_ROLES = ['super_admin', 'lead', 'design', 'dev', 'agenda'] as const
export type Role = (typeof VALID_ROLES)[number]

// 只有這兩組能調整／指定其他管理者的 role（見第 5 節「管理者權限調整」）。
// 新增管理者的 role 欄位是必填，所以「誰能設定 role」跟「誰能呼叫新增 API」
// 在邏輯上是同一件事——沒辦法呼叫一支要求填 role、卻不给你填的 API。
const ROLE_MANAGERS: readonly Role[] = ['super_admin', 'lead']

type AdminRow = {
  id: number
  email: string
  name: string | null
  role: Role
  last_login_at: string | null
  created_at: string
}

const ADMIN_COLUMNS = 'id, email, name, role, last_login_at, created_at'

// listAdmins 是既有的 API，重構過來時故意保持行為不變（見 admins.ts 的重構規則）。
// 這次順便把新欄位（name/role/last_login_at）補進 SELECT——這是刻意的擴充，
// 不是行為保留的範圍：管理者列表頁本來就需要顯示這些欄位（見 Todolist0831.md 第 6 節），
// 純新增欄位不影響既有只讀 id/email/created_at 的呼叫端。
//
// 權限範圍（定案）：不是 Super Admin／總召組的呼叫者，列表只會看到自己一筆，
// 其他三組（設計組／開發組／議程組）看不到別人的帳號資訊。
export async function listAdmins(c: Context<Env>) {
  const caller = c.get('admin')
  const canSeeAll = ROLE_MANAGERS.includes(caller.role as Role)

  const { results } = await (canSeeAll
    ? c.env.DB.prepare(`SELECT ${ADMIN_COLUMNS} FROM admins ORDER BY created_at DESC`)
    : c.env.DB.prepare(`SELECT ${ADMIN_COLUMNS} FROM admins WHERE id = ?`).bind(caller.id)
  ).all<AdminRow>()

  return c.json({ admins: results }, 200)
}

export async function getAdmin(c: Context<Env>) {
  const caller = c.get('admin')
  const id = Number(c.req.param('id'))

  // 非管理者角色只能查自己（2026-09-01 補，見 Todolist0901-資安.md 1-2）：
  // 跟 listAdmins 的可見範圍規則一致——原本這支 API 沒做這個檢查，等於用另一支
  // API 繞過了列表頁刻意做的權限收斂（IDOR）。
  if (!ROLE_MANAGERS.includes(caller.role as Role) && caller.id !== id) {
    return c.json({ error: '沒有權限查看這個管理者' }, 403)
  }

  const admin = await c.env.DB
    .prepare(`SELECT ${ADMIN_COLUMNS} FROM admins WHERE id = ?`)
    .bind(id)
    .first<AdminRow>()

  if (!admin) {
    return c.json({ error: '找不到這個管理者' }, 404)
  }
  return c.json({ admin }, 200)
}

type CreateAdminInput = {
  email: string
  password: string
  name: string
  role: Role
}

export async function createAdmin(c: Context<Env>) {
  const caller = c.get('admin')
  const body = await c.req.json().catch(() => null) as Partial<CreateAdminInput> | null

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const role = body?.role

  if (!email || !password || !name || !role) {
    return c.json({ error: 'email、password、name、role 都必填' }, 400)
  }
  if (!VALID_ROLES.includes(role as Role)) {
    return c.json({ error: `role 必須是以下其中之一：${VALID_ROLES.join(', ')}` }, 400)
  }
  // role 必填，而只有 Super Admin／總召組能指定 role，所以這支 API 實質上
  // 只有這兩組能成功呼叫（見上方 ROLE_MANAGERS 註解）。
  if (!ROLE_MANAGERS.includes(caller.role as Role)) {
    return c.json({ error: '沒有權限新增管理者' }, 403)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM admins WHERE email = ?').bind(email).first()
  if (existing) {
    return c.json({ error: '這個 email 已經有管理者帳號了' }, 409)
  }

  const passwordHash = await hashPassword(password)
  const { meta } = await c.env.DB
    .prepare('INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
    .bind(email, passwordHash, name, role)
    .run()

  // 剛 INSERT 完立刻用同一個 id 查回來，理論上一定查得到；型別上 first() 仍回傳
  // nullable，用 non-null assertion 明確表達「這裡不可能是 null」，而不是放寬回應型別。
  const admin = (await c.env.DB
    .prepare(`SELECT ${ADMIN_COLUMNS} FROM admins WHERE id = ?`)
    .bind(meta.last_row_id)
    .first<AdminRow>())!

  await writeAuditLog(c.env, {
    actorId: caller.id,
    actorEmail: caller.email,
    action: 'admin.create',
    targetId: admin.id,
    targetEmail: admin.email,
    detail: { role: admin.role }
  })

  return c.json({ admin }, 201)
}

type UpdateAdminInput = {
  name?: string
  role?: Role
}

export async function updateAdmin(c: Context<Env>) {
  const id = Number(c.req.param('id'))
  const caller = c.get('admin')
  const body = await c.req.json().catch(() => null) as UpdateAdminInput | null

  if (!body || (body.name === undefined && body.role === undefined)) {
    return c.json({ error: '至少要提供 name 或 role 其中一項' }, 400)
  }

  const target = await c.env.DB
    .prepare(`SELECT ${ADMIN_COLUMNS} FROM admins WHERE id = ?`)
    .bind(id)
    .first<AdminRow>()
  if (!target) {
    return c.json({ error: '找不到這個管理者' }, 404)
  }

  const isManager = ROLE_MANAGERS.includes(caller.role as Role)
  const updates: string[] = []
  const values: unknown[] = []
  const nameChange: { from: string | null; to?: string } = { from: target.name }
  let roleChange: { from: Role; to: Role } | undefined

  if (body.name !== undefined) {
    // 非管理者只能改自己的 name（2026-09-01 定案，見 Todolist0901-資安.md 1-3、5）；
    // Super Admin／總召組維持能改任何人，跟能改 role 是同一組人。
    if (!isManager && caller.id !== id) {
      return c.json({ error: '沒有權限修改這個管理者的名字' }, 403)
    }
    const name = body.name.trim()
    if (!name) {
      return c.json({ error: 'name 不能是空字串' }, 400)
    }
    updates.push('name = ?')
    values.push(name)
    nameChange.to = name
  }

  if (body.role !== undefined) {
    if (!isManager) {
      return c.json({ error: '沒有權限調整權限（role）' }, 403)
    }
    if (!VALID_ROLES.includes(body.role)) {
      return c.json({ error: `role 必須是以下其中之一：${VALID_ROLES.join(', ')}` }, 400)
    }
    // 最後一位 Super Admin 不能被降級（見第 5 節保護規則）。
    if (target.role === 'super_admin' && body.role !== 'super_admin') {
      const { results } = await c.env.DB
        .prepare("SELECT COUNT(*) as count FROM admins WHERE role = 'super_admin'")
        .all<{ count: number }>()
      if ((results[0]?.count ?? 0) <= 1) {
        return c.json({ error: '這是最後一位 Super Admin，不能被降級' }, 409)
      }
    }
    updates.push('role = ?')
    values.push(body.role)
    roleChange = { from: target.role, to: body.role }
  }

  values.push(id)
  await c.env.DB
    .prepare(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  // 剛更新完的同一筆一定查得到，理由同 createAdmin。
  const admin = (await c.env.DB
    .prepare(`SELECT ${ADMIN_COLUMNS} FROM admins WHERE id = ?`)
    .bind(id)
    .first<AdminRow>())!

  if (nameChange?.to !== undefined) {
    await writeAuditLog(c.env, {
      actorId: caller.id,
      actorEmail: caller.email,
      action: 'admin.update_name',
      targetId: id,
      targetEmail: target.email,
      detail: nameChange
    })
  }
  if (roleChange) {
    await writeAuditLog(c.env, {
      actorId: caller.id,
      actorEmail: caller.email,
      action: 'admin.update_role',
      targetId: id,
      targetEmail: target.email,
      detail: roleChange
    })
  }

  return c.json({ admin }, 200)
}

export async function batchDeleteAdmins(c: Context<Env>) {
  const caller = c.get('admin')

  // 只有 Super Admin／總召組能刪除其他管理者（2026-09-01 補，見
  // Todolist0901-資安.md 1-1）——這是這波資安補強最先修的洞：改之前任何登入者
  // 都能刪除任何其他管理者帳號，跟 createAdmin／updateAdmin 的 role 欄位漏掉同一種檢查。
  if (!ROLE_MANAGERS.includes(caller.role as Role)) {
    return c.json({ error: '沒有權限刪除管理者' }, 403)
  }

  const body = await c.req.json().catch(() => null) as { ids?: unknown } | null
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is number => typeof id === 'number') : []

  if (ids.length === 0) {
    return c.json({ error: 'ids 必填，且必須是非空陣列' }, 400)
  }
  if (ids.includes(caller.id)) {
    return c.json({ error: '不能刪除自己的帳號' }, 400)
  }

  const placeholders = ids.map(() => '?').join(', ')

  const { results: totalRows } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM admins').all<{ count: number }>()
  const totalCount = totalRows[0]?.count ?? 0
  const { results: targetRows } = await c.env.DB
    .prepare(`SELECT id, email, role FROM admins WHERE id IN (${placeholders})`)
    .bind(...ids)
    .all<{ id: number; email: string; role: string }>()

  if (targetRows.length >= totalCount) {
    return c.json({ error: '不能把管理者刪光，至少要留一位' }, 400)
  }

  // 最後一位 Super Admin 不能被刪除（見第 5 節保護規則）。
  const deletingSuperAdmins = targetRows.filter((row) => row.role === 'super_admin').length
  if (deletingSuperAdmins > 0) {
    const { results: superAdminRows } = await c.env.DB
      .prepare("SELECT COUNT(*) as count FROM admins WHERE role = 'super_admin'")
      .all<{ count: number }>()
    const superAdminCount = superAdminRows[0]?.count ?? 0
    if (superAdminCount - deletingSuperAdmins < 1) {
      return c.json({ error: '不能刪除最後一位 Super Admin' }, 409)
    }
  }

  await c.env.DB.prepare(`DELETE FROM admins WHERE id IN (${placeholders})`).bind(...ids).run()

  // 批次刪除一次影響多筆，沒有單一 target_id 可填，把每一筆的 id／email／role
  // 都存進 detail，事後查紀錄才看得出這次刪的是誰。
  await writeAuditLog(c.env, {
    actorId: caller.id,
    actorEmail: caller.email,
    action: 'admin.delete',
    detail: { targets: targetRows.map((row) => ({ id: row.id, email: row.email, role: row.role })) }
  })

  return c.json({ ok: true as const, deleted: targetRows.length }, 200)
}
