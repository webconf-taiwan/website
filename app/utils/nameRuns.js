// 名字中英混排：中文用 Noto Serif TC（不斜），英文用 Inria Serif Italic。
// 設計稿的「保哥 Will」就是這樣拼的 —— 拆成 runs 之後，之後加講者不必再手動切 span。
// 首頁講者區（Home/Speaker、Home/SpeakerField）與講者頁共用。
const CJK_RUN = /([\u3400-\u9fff\uf900-\ufaff]+)/

export function nameRuns (name = '') {
  return name.split(CJK_RUN).filter(Boolean).map(t => ({ t, zh: CJK_RUN.test(t) }))
}
