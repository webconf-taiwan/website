import { describe, it, expect } from 'vitest'
import { isStrongPassword } from '../src/utils/password'

// 密碼強度規則（見 Todolist0831.md 第 8 節）：至少 8 碼、大小寫字母都要有、
// 至少 1 個特殊符號。純函式，不用碰 D1／KV，跑在一般 Node 環境即可，
// 不需要 @cloudflare/vitest-plugin 的 workerd runtime。
describe('isStrongPassword', () => {
  it('符合全部規則，回傳 true', () => {
    expect(isStrongPassword('Abcdefg#1')).toBe(true)
    expect(isStrongPassword('MyP@ssw0rd')).toBe(true)
  })

  it('少於 8 碼，回傳 false', () => {
    expect(isStrongPassword('Ab#1')).toBe(false)
    expect(isStrongPassword('Abc#123')).toBe(false) // 7 碼
  })

  it('剛好 8 碼且符合規則，回傳 true（邊界值）', () => {
    expect(isStrongPassword('Abcdef#1')).toBe(true)
  })

  it('缺小寫字母，回傳 false', () => {
    expect(isStrongPassword('ABCDEFG#1')).toBe(false)
  })

  it('缺大寫字母，回傳 false', () => {
    expect(isStrongPassword('abcdefg#1')).toBe(false)
  })

  it('缺特殊符號，回傳 false', () => {
    expect(isStrongPassword('Abcdefg1')).toBe(false)
  })

  it('只有英文（沒有大小寫混合＋沒有符號），回傳 false', () => {
    expect(isStrongPassword('abcdefgh')).toBe(false)
    expect(isStrongPassword('ABCDEFGH')).toBe(false)
  })

  it('空字串，回傳 false', () => {
    expect(isStrongPassword('')).toBe(false)
  })

  it('數字不算特殊符號，只有大小寫＋數字，回傳 false', () => {
    expect(isStrongPassword('Abcdefg1234')).toBe(false)
  })

  it('中文字元也能通過特殊符號的判斷（非 A-Za-z0-9 就算）', () => {
    // isStrongPassword 目前用 /[^A-Za-z0-9]/ 判斷「特殊符號」，中文字元、空白、
    // emoji 都會落在這個範圍內——這是目前規則的實際行為，不是理想假設，記錄下來
    // 讓之後有人想收斂規則（例如排除中文、只認半形符號）時知道現況是什麼。
    expect(isStrongPassword('Abcdefg中')).toBe(true)
  })
})
