// 密碼強度規則（見 Todolist0831.md 第 8 節）：至少 8 碼、大小寫字母都要有、至少 1 個特殊符號。
// 前端也會做同一套檢查，這裡是後端最後一道防線，不能只靠前端擋。
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false
  if (!/[a-z]/.test(password)) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/[^A-Za-z0-9]/.test(password)) return false
  return true
}
