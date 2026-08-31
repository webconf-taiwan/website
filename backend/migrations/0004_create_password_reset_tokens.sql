-- Migration number: 0004 	 2026-08-31T03:47:02.483Z

-- 忘記密碼流程用的一次性 Token。跟 sessions 表同一個理由，存在 DB 裡才能查得到、
-- 也才能標記成已使用（used_at 非 NULL 就代表用過，不能再拿來重設密碼）。
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_admin_id ON password_reset_tokens(admin_id);
