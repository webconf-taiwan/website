-- Migration number: 0005 	 2026-09-01T05:21:35.361Z

-- Session Token／密碼重設 Token 改成雜湊儲存（SHA-256），欄位改名 token_hash
-- 求自我說明——避免之後有人誤以為這欄位存的是明文 token，可以直接拿去當
-- Bearer token 或重設連結用（見 Todolist0901-資安.md 2-2）。
--
-- 先清空舊資料：既有列存的是明文 token，改成雜湊比對邏輯之後這些明文列不會再
-- 被任何查詢命中（等同全部失效），留著沒有意義，直接清掉，不留曖昧的過渡狀態。
-- 影響：這次部署後所有人（含你自己）現有的登入 session 都要重新登入一次；
-- 尚未使用的忘記密碼連結也會失效，需要重新走一次忘記密碼流程。
DELETE FROM sessions;
DELETE FROM password_reset_tokens;

ALTER TABLE sessions RENAME COLUMN token TO token_hash;
ALTER TABLE password_reset_tokens RENAME COLUMN token TO token_hash;
