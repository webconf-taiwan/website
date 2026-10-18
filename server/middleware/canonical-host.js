// www.webconf.tw → webconf.tw（301）。
// canonical、og:url、JSON-LD 的網址都跟著 request host 走，所以 www 與 apex 兩個 host 都回 200 時，
// 兩邊各自宣稱自己是正本，搜尋引擎／答案引擎會當成重複內容、權重被拆成兩份。
// 只看 host 前綴，不依賴 APP_URL：那是 build variable，漏設時不該讓整站轉錯地方。
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!url.hostname.startsWith('www.')) return
  url.hostname = url.hostname.slice(4)
  url.protocol = 'https:'
  return sendRedirect(event, url.href, 301)
})
