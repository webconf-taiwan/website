-- 後台帳號與登入 session。
-- password_hash 格式："<16-byte salt hex>:<32-byte PBKDF2 hash hex>"，
-- 產生方式見 scripts/hash-password.mjs（要跟 src/utils/crypto.ts 的參數一致：
-- PBKDF2 / SHA-256 / 100,000 次迭代 / 256 bit）。
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- session token 是隨機字串（不是 JWT），存在這裡才能查得到、也才能主動撤銷（登出即刪列）。
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
