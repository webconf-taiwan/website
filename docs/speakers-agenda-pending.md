# 講者／議程：待補資料清單

> 資料檔：`app/constants/data/speakers.json`、`app/constants/data/agenda.json`
> 議程來源：`docs/agenda-src/schedule-2026-10-30.png`（主辦方排程表截圖，2026-10-30）
> 講者詳細資料來源：主辦方的 `speakers.csv`（2026-10-30 匯入：抬頭、介紹、社群連結、講題、摘要、目標會眾、預期收穫、首頁顯示）
> 照片來源：Figma「speaker 講者頁」畫框（node `40005556:46695`），放在 `public/speakers/photos/<id>.webp`（+ `.jpg`）。

已做好的：41 位講者的照片、名單順序、詳細資料，以及兩天議程時段（對得到講者的都已排入）。
下面是還沒定案的部分。補完一項就從這裡刪掉。

---

## 1. 名字寫法，CSV 跟 Figma 不一樣（目前用 Figma／原議程的寫法）

| 目前 | CSV |
| --- | --- |
| Justin 蕭晊莛 | Justin 蕭睦莛 |
| 張耿瑭 | 張耿瑋 |
| James Chou | Jameschou |
| Gordon Chang 張智翔 | Gordon Chang |

## 2. 資料缺漏

- 全部場次的「共筆文件」「投影片」連結（`agenda.json` 各場的 `notes_url`、`slides_url`）。
  連結是空的就不顯示按鈕；設計稿是先上共筆、活動結束後再補投影片。

## 3. CSV 的抬頭欄斷錯位置，已手動修正（待確認）

| CSV 原文 | 目前 |
| --- | --- |
| TSMC Principal・Engineer | TSMC・Principal Engineer |
| GoogleSoftware・Engineer | Google・Software Engineer |
| 國泰金控・DDTSr. Architect | 國泰金控・DDT Sr. Architect |

吳哲宇改用 CSV 的抬頭（墨雨互動設計 / MonoLab・創辦人、新媒體藝術家），原本的第二行頭銜「演算藝術家 Algorithmic Artist」拿掉了。

## 4. 推測的時段對應（待確認）

| 排程表寫法 | 目前對到 | 依據 |
| --- | --- | --- |
| Met Ai - Andree（D1 09:10 A2） | 趙敏含 | MetAI 宇見智能科技・產品總監 |
| 陳育融 - 戰犯音樂（D1 11:00 A2） | 陳律融 | 名字差一字，CSV 寫律森文化・創辦人 |
| Google Angular（D1 10:05 F） | 蔡承軒 | CSV：Google・Software Engineer |
| 國泰金控（D2 09:00 F） | Rich 李琦 | CSV：國泰金控 |
| Aaron - TSMC（D2 14:25 M） | 黃冠中 | CSV：TSMC・副理（另外兩位 TSMC 的已排在別的時段）— **最沒把握** |
| 802 國軍高雄總醫院（D2 14:25 F） | 鄭重男 | CSV：國軍高雄總醫院 |

## 5. 排程表上有、但對不到講者的格子

目前在 `agenda.json` 是 `null`（顯示「議程即將公布」）。依 2026-11-05 排程表截圖：

| 時段 | 場館 | 排程表寫法 |
| --- | --- | --- |
| D1 14:25 - 15:10 | M | Line |
| D2 09:00 - 09:45 | A2 | Bastiane |
| D2 10:00 - 10:45 | M | （空白） |
| D2 16:15 - 17:00 | M | Ruddy |

## 6. 2026-11-07 新增講者，資料不完整

陳正瑋（艦長）`chen-cheng-wei`、陳欽章 `casper-chen`、Fngi 徐方繹 `fngi`，依 Notion 資料建立並排入時段
（D1 14:25 F、D2 11:50 A2、D2 13:30 M＋F 同步）。廖力寬（Damon）排入 D2 13:30 A2。

- 三位都還沒有照片（Notion 照片欄是空的），卡片與抽屜先只顯示淡底色。
- 截圖上被截斷、沒辦法確定的連結，先不放：
  - 陳正瑋 FB：`facebook.com/are…aptain`
  - 陳欽章 FB／X：`facebook.com/cas…77chen`、`x.com/cas…77chen`
  - 徐方繹 LinkedIn：`linkedin.com/in/…ishiu/`；FB 欄填的是 `facebook.com/?lo…=zh_TW`（臉書首頁，不是個人頁）
- 徐方繹介紹最後多一個「T」，判斷是誤植，已拿掉。
- 名字寫法：排程表寫「Casper Chen」，Notion 標題是「陳欽章」，目前用 Notion 的。

## 7. 其他

- Gordon Chang 的抬頭：資料是「Appier・產品副總」，2026-11-05 的排程表寫「Appier, Product Director」，目前沒改。

- 首頁講者照 CSV 的「首頁顯示」改成 6 位（TonyQ、Gipi、尹相志、Max Chen、David Chen、吳哲宇），原本是 10 位。
- 排程表的 10 分鐘、15 分鐘休息沒有放進議程表（原本的資料也只有午休這一列）。
- 其他講者沒有首頁粒子用的去背圖（`portrait`／`portrait_static`）。要上首頁就得補去背 PNG + 粒子靜態圖，做法同 `speaker-01` ~ `speaker-10`。
