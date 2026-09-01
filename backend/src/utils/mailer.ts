import type { Bindings } from '../index'

// 忘記密碼信件寄送。實際 Gmail SMTP 連線邏輯尚未實作——已跟使用者確認：這波
// 資安補強（Todolist0901-資安.md）只做到這裡，沒有真實 Gmail 應用程式密碼沒辦法
// 驗證，維持 Todolist0831.md 第 9 節原本的決定（先只產生 Token，不寄信）。
//
// 先把介面接好的理由：authController.ts 的 password_reset_tokens 改成存 Token
// 雜湊值之後（見 Todolist0901-資安.md 2-2），資料庫裡查不到明文 Token 了，沒辦法
// 再用「直接查 DB 撈 Token」的方式測整條忘記密碼流程。有這支函式當呼叫點，測試
// 可以 mock 它、從呼叫參數拿到明文 Token，繼續測 forgot-password → reset-password
// 的完整路徑（見 Todolist0831.md 第 9 節「寄信函式用 mock 驗證呼叫是否正確」）。
export async function sendPasswordResetEmail(env: Bindings, to: string, resetToken: string): Promise<void> {
  // TODO: 接 Gmail SMTP client（cloudflare:sockets 的 connect()，自刻 STARTTLS +
  // AUTH LOGIN 的最簡 SMTP 握手，見 Todolist0831.md 第 9 節技術決策），把 resetToken
  // 組成前台的重設連結（例如 `${APP_URL}/admin/reset-password?token=${resetToken}`）寄出。
  // 目前刻意不做任何事——呼叫端已經把 Token 產生、存好，這支函式只是先佔好位置。
}
