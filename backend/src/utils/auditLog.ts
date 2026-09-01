import type { Bindings } from '../index'

// 敏感操作稽核紀錄（見 Todolist0901-資安.md 3-2）。action 用固定的字串常量，
// 不開放任意字串，避免各處呼叫點各寫各的措辭，事後查紀錄比對不起來。
export type AuditAction =
  | 'admin.create'
  | 'admin.update_name'
  | 'admin.update_role'
  | 'admin.delete'
  | 'admin.change_password'
  | 'admin.reset_password'

type WriteAuditLogParams = {
  // 未登入狀態下觸發的操作（例如忘記密碼重設）沒有 actor，傳 null。
  actorId: number | null
  actorEmail?: string | null
  action: AuditAction
  targetId?: number | null
  targetEmail?: string | null
  // 額外脈絡（例如 role 從什麼改成什麼），存成 JSON 字串，查的人自己解析。
  detail?: Record<string, unknown>
}

export async function writeAuditLog(env: Bindings, params: WriteAuditLogParams): Promise<void> {
  try {
    await env.DB
      .prepare(
        `INSERT INTO admin_audit_log (actor_id, actor_email, action, target_id, target_email, detail)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        params.actorId,
        params.actorEmail ?? null,
        params.action,
        params.targetId ?? null,
        params.targetEmail ?? null,
        params.detail ? JSON.stringify(params.detail) : null
      )
      .run()
  } catch {
    // 稽核紀錄寫入失敗不該擋住本來的操作——這次呼叫點都排在「操作已經成功」之後，
    // 記錄寫失敗只代表少一筆稽核資料，不能讓使用者因此收到錯誤回應。
  }
}
