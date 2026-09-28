// /llms.txt —— 給 AI 助理／答案引擎讀的站點摘要（https://llmstxt.org）。
// 內容全部從 app/constants/data 組出來，不另外維護一份文字：改 seo.json、議程、
// FAQ、講者名單，這裡就跟著變。
// ⚠️ FAQ 排除 is_placeholder 的題目，理由同 VenueFaq.vue 的 FAQPage 結構化資料。
import seo from '../../app/constants/data/seo.json'
import home from '../../app/constants/data/index.json'
import agenda from '../../app/constants/data/agenda.json'
import faq from '../../app/constants/data/faq.json'
import speakers from '../../app/constants/data/speakers.json'

export default defineEventHandler((event) => {
  const base = (getSiteConfig(event).url || '').replace(/\/+$/, '')
  const { site, event: ev } = seo
  const v = ev.venue
  const indexed = Object.entries(seo.pages).filter(([, p]) => !p.noindex)

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    '## 活動資訊',
    '',
    `- 日期：${ev.start_date} 至 ${ev.end_date}`,
    `- 地點：${v.name}（${v.region}${v.locality}${v.street_address}）`,
    `- 購票：${base}/${ev.ticket_anchor}`,
    ...(home.ticket?.items || []).map(t => `- ${t.title}：NT$ ${t.price} ${t.unit || ''}`.trim()),
    '',
    '## 頁面',
    '',
    ...indexed.map(([route, p]) => `- [${p.title}](${base}${route})${p.description ? `：${p.description}` : ''}`),
    '',
    '## 講者',
    '',
    ...speakers.items
      .filter(s => s.show_on_home)
      .map(s => `- ${s.name}：${[s.org, s.role].filter(Boolean).join(' ')}`),
    '',
    '## 議程',
    '',
    ...(agenda.items || []).map(a => `- ${a.title} —— ${a.speaker_name}（${a.speaker_title}）`),
    '',
    '## 常見問答',
    '',
    ...faq.items
      .filter(q => !q.is_placeholder)
      .flatMap(q => [`### ${q.question}`, '', q.answer, ''])
  ]

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
