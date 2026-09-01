-- Migration number: 0006 	 2026-09-01T05:28:30.857Z

-- 敏感操作稽核紀錄（見 Todolist0901-資安.md 3-2）：新增／編輯／刪除管理者、
-- 密碼變更／重設，都要留一筆「誰、何時、對誰做了什麼」，事後才有辦法追查。
--
-- actor_id／target_id 刻意不加 REFERENCES 外鍵：稽核紀錄的價值就在於帳號被刪掉
-- 之後還查得到「這個人身上發生過什麼事」，如果用 ON DELETE SET NULL，帳號一被
-- 刪除，這筆帳號被刪除之前的所有紀錄會被回頭清空 target_id，等於刪除的瞬間
-- 抹掉了最需要留存的歷史——這是實際測試時發現的真實問題，不是預先想像的假設。
-- 額外存 actor_email／target_email 快照：帳號被刪除後 id 沒辦法再 join 回
-- admins 表查到 email，快照起來才能讓事後查紀錄的人看得懂是誰。
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_id INTEGER,
  target_email TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor_id ON admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_id ON admin_audit_log(target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
