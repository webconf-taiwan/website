-- Migration number: 0003 	 2026-08-31T03:46:57.211Z

-- 管理者後台功能擴充：新增姓名、最後登入時間、角色欄位。
-- role 用 CHECK 限制在 Todolist0831.md 定案的五組角色內，identifier 用英文，
-- 對應關係：super_admin=最高管理者、lead=總召組、design=設計組、dev=開發組、agenda=議程組。
-- 既有帳號（目前只有網站擁有者本人跟開發測試帳號）預設當作 super_admin，
-- 之後新增的管理者一律由 API 呼叫端明確指定 role，不會用到這個預設值。
ALTER TABLE admins ADD COLUMN name TEXT;
ALTER TABLE admins ADD COLUMN last_login_at TEXT;
ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'super_admin'
  CHECK (role IN ('super_admin', 'lead', 'design', 'dev', 'agenda'));
