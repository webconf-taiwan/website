-- Header / Footer 選單。存成單列兩個 JSON 欄位，不拆成 nav_items / menu_groups /
-- links 好幾張關聯表——這份資料本身就是巢狀、筆數少（幾筆到十幾筆），後台編輯頁
-- 也是整包表單一起送出，拆表只會讓每次存檔要處理多筆 diff、多寫一堆 join，划不來。
-- 資料形狀跟原本 website/server/assets/data/global.json 的 header.nav_items /
-- footer.menu_groups 完全一致，只是把持久層從檔案系統搬進 D1。
CREATE TABLE IF NOT EXISTS site_menu (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  nav_items_json TEXT NOT NULL,
  menu_groups_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 種一筆初始資料，內容照抄目前 global.json 裡的既有選單，切換過去畫面不會變。
INSERT OR IGNORE INTO site_menu (id, nav_items_json, menu_groups_json) VALUES (
  1,
  '[{"id":"agenda","label":"AGENDA","href":"#agenda","target":"_self","side":"left","is_highlight":false},{"id":"speaker","label":"SPEAKER","href":"#speaker","target":"_self","side":"left","is_highlight":false},{"id":"venue","label":"VENUE","href":"#venue","target":"_self","side":"left","is_highlight":false},{"id":"sponsors","label":"SPONSORS","href":"#sponsors","target":"_self","side":"right","is_highlight":false},{"id":"history","label":"HISTORY","href":"#history","target":"_self","side":"right","is_highlight":false},{"id":"ticket","label":"TICKET","href":"#ticket","target":"_self","side":"right","is_highlight":true}]',
  '[{"title":"Programme","links":[{"label":"議程資訊","href":"#","target":"_self"},{"label":"講者陣容","href":"#","target":"_self"},{"label":"場域介紹","href":"#","target":"_self"},{"label":"前往購票","href":"#","target":"_self"}]},{"title":"Codex","links":[{"label":"贊助廠商","href":"#","target":"_self"},{"label":"主辦團隊","href":"#","target":"_self"},{"label":"歷史回顧","href":"#","target":"_self"},{"label":"簽到牆","href":"#","target":"_self"}]},{"title":"Connect","links":[{"label":"MAIL","href":"mailto:hi@webconf.tw","target":"_self"},{"label":"FACEBOOK","href":"https://www.facebook.com/WebConfTaiwan/","target":"_blank"},{"label":"INSTAGRAM","href":"https://instagram.com/webconftw/","target":"_blank"},{"label":"THREADS","href":"https://www.threads.com/@webconftw","target":"_blank"}]}]'
);
