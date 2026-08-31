# Todolist 0831 — 管理者後台功能擴充（含後端架構重構）

> 這份是持續更新的規格書。**待確認事項（第 18 節）已全部收斂完成**，可以開始分派 sub-agent 執行。

## 目錄

1. 現況
2. 範圍（本次要做的事）
3. 後端架構決策
4. API 總覽
5. 功能規格：管理者 CRUD
6. 功能規格：欄位規劃
7. 功能規格：權限（角色）
8. 功能規格：Change Password
9. 功能規格：忘記密碼機制
10. 功能規格：登入 Token 與 Refresh Token 評估
11. API 文件（Swagger / OpenAPI）
12. 開發流程
13. 待辦分工
14. 協作方式與角色分工
15. 測試帳號管理規範
16. 時程評估
17. 驗收機制
18. **待確認事項總表**

---

## 1. 現況

- 列表頁：`app/pages/admin/admins.vue`，只顯示 email、建立時間，無任何操作功能。
- 後端：`backend/src/routes/admins.ts`，目前只有 `GET /admins`（列出全部）。
- 代理層：`server/api/admin/admins.get.js`，轉發 cookie session 到 backend。
- 資料表：`admins`（見 `backend/migrations/0001_create_admins_and_sessions.sql`）。

## 2. 範圍（本次要做的事）

原本只規劃管理者列表功能，討論過程中範圍擴大到後端架構本身，目前實際範圍是：

1. 管理者 CRUD（新增／查看／編輯／批次刪除）
2. Change Password（登入後自助修改密碼）
3. 忘記密碼機制（未登入前，Gmail SMTP 寄信＋Token 重設）
4. 後端架構重構：全部路由（新舊都算）改成 controller 分層
5. API 文件：Swagger/OpenAPI，涵蓋新舊全部 API
6. 測試建置：`vitest` + `@cloudflare/vitest-plugin`，整合測試為主

## 3. 後端架構決策

- **現況（已查證 `backend/src/routes/*.ts`）**：目前沒有 controller／service 分層，業務邏輯直接寫在 Hono 路由 handler 裡，只有跨路由共用的部分被抽出來（驗證邏輯在 `middleware/auth.ts`，密碼雜湊／session token 在 `utils/crypto.ts`）。這不是傳統 Express／NestJS 的三層架構，但是 Hono 這類輕量 Workers 框架常見的主流寫法。
- **定案：全部（新 API ＋現有 4 支路由）一起重構成 controller 分層。**
  ```
  backend/src/
    controllers/
      adminsController.ts   — createAdmin / listAdmins / getAdmin / updateAdmin / batchDeleteAdmins
      authController.ts     — login / logout / me / changePassword / forgotPassword / resetPassword
      menuController.ts     — getMenu / updateMenu
      healthController.ts   — check
    routes/
      admins.ts / auth.ts / menu.ts / health.ts   — 只做路徑註冊 + 掛 middleware，邏輯呼叫對應 controller
    middleware/auth.ts（沿用現有）
    utils/
      crypto.ts（沿用現有）
      password.ts（新增，密碼強度驗證）
      smtp.ts（新增，Gmail SMTP client）
  ```
  controller 是單純的 async function，接 Hono 的 `Context`、回傳 `c.json(...)`，跟現在寫在路由裡的 handler 簽名一樣，只是搬到獨立檔案——不用額外框架，好維護也好測試。
- **特別注意 `menu.ts`**：選單功能已經上線串接（前台 Header/Footer、後台選單編輯頁都在用），重構時**只搬程式碼位置，不能改變任何行為**。重構前先用 `curl` 記錄 `GET /menu`、`PUT /menu` 目前的實際回應當基準，重構完再用同樣的 `curl` 比對，回應內容與狀態碼要完全一致才算過關。

## 4. API 總覽

| Method | Route | 說明 | 狀態 |
|---|---|---|---|
| GET | `/health` | 健康檢查 | 既有，搬進 controller |
| POST | `/auth/login` | 登入 | 既有，搬進 controller |
| GET | `/auth/me` | 取得目前登入者 | 既有，搬進 controller |
| POST | `/auth/logout` | 登出 | 既有，搬進 controller |
| GET | `/menu` | 讀取選單（公開） | 既有，搬進 controller，**需迴歸驗證** |
| PUT | `/menu` | 更新選單（需登入） | 既有，搬進 controller，**需迴歸驗證** |
| GET | `/admins` | 列出所有管理者 | 既有，搬進 controller |
| POST | `/admins` | 新增管理者 | 新增 |
| GET | `/admins/:id` | 查看單筆管理者 | 新增 |
| PUT | `/admins/:id` | 編輯管理者（`name` 全員可改；`role` 僅 Super Admin／總召組可改） | 新增 |
| DELETE | `/admins` | 批次刪除管理者（單筆刪除傳一筆 id） | 新增 |
| POST | `/auth/change-password` | 修改自己的密碼 | 新增 |
| POST | `/auth/forgot-password` | 忘記密碼－寄送重設信（不測試寄信本身） | 新增 |
| POST | `/auth/reset-password` | 忘記密碼－帶 Token 設新密碼 | 新增 |

## 5. 功能規格：管理者 CRUD

**刪除管理者 API**
- backend 只提供一支批次刪除 API，不另外做單筆刪除 API；列表批次操作、內頁單筆刪除都呼叫同一支，單筆刪除時傳入一筆資料即可。

**列表頁操作（`app/pages/admin/admins.vue`）**
- 每列加入勾選框（可單選），提供全選按鈕，操作欄位加入刪除功能、串接批次刪除 API。

**查看管理者內頁**
- 顯示欄位詳見「6. 欄位規劃」。頁面提供刪除按鈕（呼叫批次刪除 API，傳單筆）與進入編輯頁的入口。

**新增管理者**
- **定案：欄位包含 `email`、密碼（初始密碼）、`name`、`role`。**
- `role` 欄位一樣受「管理者權限調整」那條規則限制：只有 Super Admin／總召組能在新增時設定 `role`，其他三組即使能新增管理者，也不能指定或看到 `role` 欄位（跟編輯頁的規則保持一致，這點是邏輯上的延伸，不是新決定，先記著）。

**編輯管理者內頁**
- 可編輯資訊：目前定案僅「名字」可編輯。
- Email、密碼、建立時間：只顯示，不透過這個表單修改（密碼修改走獨立的 Change Password API）。
- 提供儲存按鈕，完成更新。

**管理者權限調整（編輯頁）**
- 編輯管理者時「調整權限（role）」這個功能，僅開放 **Super Admin** 與 **總召組** 能操作；其他三組（設計組／開發組／議程組）就算能看到編輯頁，也不能看到／不能改權限欄位。
- **實作要求（非待確認，一定要做）**：後端 API 層一定要驗證呼叫者角色，不能只靠前端隱藏 UI——UI 隱藏是體驗，API 檢查才是真正的權限控管。
- **定案：最後一位 Super Admin 不能被降級或刪除。** 編輯管理者 API（改 `role`）與批次刪除 API 都要加這條保護：操作前先查目前 `role = 'super_admin'` 的人數，如果目標是最後一位 Super Admin，且這次操作會讓他不再是 Super Admin（降級）或被移除（刪除），就擋下來回錯誤，不能執行。
- **定案：Super Admin／總召組彼此的權限可以互相調整。** 兩組互相改對方的 role 是允許的，唯一的例外仍是上面「最後一位 Super Admin 不能被降級或刪除」這條保護規則。
- **定案：不能刪除自己的帳號，也不能把管理者刪光。** 批次刪除 API 要擋兩種情況：① 請求裡包含目前登入者自己的 id ② 執行後系統會變成零管理者。兩種都要回錯誤、不能執行。

## 6. 功能規格：欄位規劃

**現有欄位**
- Email：顯示於列表、內頁。
- 密碼：僅顯示狀態（例如「已設定」），不顯示明文，也不在一般編輯表單修改。
- 建立時間：顯示於列表、內頁。

**新增欄位**
- 名字（Name）：新增欄位，內頁提供編輯功能。
- 最後登入時間（Last Login）：新增欄位，**定案：列表、內頁都要顯示**。需在登入成功時寫入時間戳。
- 用戶編號：**定案：不需要，直接用 `id`。** 後台管理者是內部帳號，不是對外客戶會看到的資料，不用額外編一組對外編號。

## 7. 功能規格：權限（角色）

- 先開欄位（例如 `role`），五組角色本身先定義好，完整的權限矩陣其餘細節之後再談；年度相關的權限這次先不用處理。
- 共五組：① 最高管理者（Super Admin，權限最多）② 總召組 ③ 設計組 ④ 開發組 ⑤ 議程組。
- **定案：管理者列表的可見範圍**——Super Admin／總召組可以看到全部管理者；其他三組（設計組／開發組／議程組）呼叫 `GET /admins` 只會看到自己一筆，看不到其他管理者的帳號資訊。已實作於 `adminsController.ts` 並驗證。

## 8. 功能規格：Change Password API

- 需求：需驗證原密碼；填寫新密碼與確認密碼，兩者須一致才能通過。
- Route：`POST /auth/change-password`（放在 `auth.ts`，跟 `/auth/login`、`/auth/logout` 同一組）。改的一定是「目前登入者自己」的密碼，用 `requireAuth` 拿到的 `c.get('admin').id` 就知道是誰，不用也不該讓 URL 帶 `:id`（避免有人夾帶別人的 id 亂改）。
- Request body：`{ old_password, new_password, new_password_confirm }`
- 驗證順序：① `requireAuth` 確認已登入 → ② 比對 `new_password` 與 `new_password_confirm`，不一致回 400 → ③ 檢查 `new_password` 是否符合強度規則（至少 8 碼、大小寫字母、至少 1 個特殊符號），不符合回 400 → ④ 用現有 `password_hash` 驗證 `old_password`，不正確回 401 → ⑤ 通過後用同一套 PBKDF2 邏輯（`backend/src/utils/crypto.ts`）雜湊新密碼並寫回 → ⑥ **撤銷該管理者名下其他裝置的既有 session**（`DELETE FROM sessions WHERE admin_id = ? AND token != ?`，保留這次操作當下用的 token，其餘全部刪除，強制其他裝置重新登入）。
- **定案：Change Password 成功後要撤銷其他裝置的既有 session。**

**個人資料頁顯示規則（前端）**
- 不可修改欄位（例如 Email）：用純文字顯示，不用 input 框。
- 密碼：用 `••••••` 遮罩顯示，不在一般編輯表單裡修改；密碼欄位旁提供獨立的「修改密碼」按鈕（筆圖示）。**定案：這個入口放在「編輯管理者」頁面，且不限於編輯自己的帳號，編輯任何管理者都會顯示**（`app/pages/admin/admins/[id]/edit.vue`）。注意：目前 Change Password API 只能改「操作者自己」的密碼，所以在別人的編輯頁點這個圖示，實際改的是操作者自己的密碼，不是正在編輯的那個人——這個語意落差先照使用者指示做，之後可能需要再討論。

**修改密碼流程（前端）**
- 專屬欄位輸入：舊密碼、新密碼、確認新密碼；按下「確認變更」後前端才呼叫 API。
- 密碼強度規則：至少 8 碼、需同時包含大寫與小寫英文字母、至少 1 個特殊符號。
- 前端驗證（送出前完整檢查，逐項提示）：新密碼與確認密碼是否一致／是否符合強度規則／舊密碼欄位不可為空。
- 後端仍要重複做同一套驗證——前端驗證只是體驗優化，真正擋住不合法請求的是後端。

## 9. 功能規格：忘記密碼機制（未登入前）

**流程**
1. 使用者輸入 Email。
2. 後端寄出驗證信（Gmail SMTP），信件內容是一組帶 Token 的重設連結，**不直接附密碼**。
3. 使用者點連結，帶 Token 進入「設定新密碼」頁。
4. 點擊確認後驗證：(a) Token 是否有效（有效期限先訂 24 小時）(b) 新密碼與確認密碼是否一致。

**API**
- `POST /auth/forgot-password`：輸入 email，寄出帶 Token 的重設連結信。不管 email 是否存在都回同樣的成功訊息，避免被拿來反推帳號是否存在（跟 `/auth/login` 的錯誤訊息設計同一個理由）。
- `POST /auth/reset-password`：body 帶 `{ token, new_password, new_password_confirm }`。驗證順序：(a) Token 是否存在、未過期（24 小時）、未使用過 (b) 新密碼與確認密碼是否一致 (c) 新密碼是否符合強度規則。通過後更新 `password_hash`、把該筆 Token 標記為已使用。

**技術決策**
- **定案：維持 Gmail SMTP（原生協定）**，不改用 Gmail API。實作限制：Workers runtime 沒有現成 SMTP client npm 套件（多數套件寫給 Node.js `net` module），要透過 `cloudflare:sockets` 的 `connect()` 自己刻一個最簡 SMTP client（STARTTLS 握手 + AUTH）。已查證 Cloudflare 官方文件（`developers.cloudflare.com/workers/runtime-apis/tcp-sockets/`）確認 SMTP 在支援協定清單內，技術上可行。
- 曾考慮過的替代方案（Gmail API／交易型郵件服務）已排除，維持原生 SMTP 是使用者的決定。
- Google 官方說明（`support.google.com/mail/answer/7126229`）目前寫「應用程式密碼不建議使用，多數情況下也用不到」，但仍可用；申請應用程式密碼需先開 2FA，憑證放 Wrangler secrets，不寫進程式碼或 repo。
- **Token 儲存**：新增 `password_reset_tokens` 表（`token`、`admin_id`、`expires_at`、`used_at`），一次性使用。

**測試範圍（定案，模擬測試策略）**
- 真正不測試的只剩一件事：SMTP client 有沒有辦法真的跟 `smtp.gmail.com:587` 握手成功、把信送進收件匣——沒有真實 Gmail 憑證沒辦法百分之百驗證，先寫程式、之後才驗證。
- 其餘用「隔離外部依賴」模擬測試：
  - **Token 走真實資料庫路徑**：呼叫 `forgot-password` 後，直接用 `wrangler d1 execute --local` 從 `password_reset_tokens` 撈出真實 Token，完整測 `reset-password` 的驗證邏輯。
  - **寄信函式用 mock 驗證呼叫是否正確**：不開真的 TCP 連線，只驗證 handler 有沒有正確呼叫寄信函式、參數對不對。
  - **SMTP 指令組裝邏輯拆成純函式，單獨單元測試**：STARTTLS、AUTH LOGIN 編碼、信件格式，不需真實 TCP 連線即可驗證格式正確性。

## 10. 功能規格：登入 Token 與 Refresh Token 評估

- **定案：維持現有 session token 機制，不換成 JWT。**
- **現況（已查證 `backend/src/routes/auth.ts`、`backend/src/middleware/auth.ts`）**：目前登入機制**不是 JWT**，而是隨機字串的 opaque session token，存在 D1 的 `sessions` 表；每次請求 `requireAuth` 都會查一次 DB 確認 token 存在且未過期，到期時間 7 天，登出即刪除該筆 session、立即失效。
- **評估理由**：
  - JWT 的核心優勢是「不用查資料庫就能驗證身份」，但現在架構每次請求本來就會查 D1（為了能立即撤銷），換成 JWT 並不會少查這次 DB。
  - JWT 簽出去後在到期前很難提前作廢，除非額外維護一份 blocklist，等於繞回現在這套機制、還多一層複雜度。
  - Refresh Token 的意義是讓 access token 可以設短、同時不用使用者一直重新登入，但兩顆 token 各自要處理儲存、輪替、撤銷、竊取偵測，對目前只有 5 組角色、純內部使用的後台系統來說複雜度大於效益。
  - 如果只是想「7 天內不用一直登入，但太久沒動作要自動登出」，用現有機制加**滑動過期（sliding expiration）**就能達到：每次驗證通過的請求，順手把該筆 session 的 `expires_at` 往後延。

## 11. API 文件（Swagger / OpenAPI）

- 時機：**backend API 全部完成後、frontend 開始串接前**先產出。
- **範圍：涵蓋全部 API，不只新的**——第 4 節「API 總覽」列的 14 支全部要有文件。
- **定案：`@hono/zod-openapi`**（`OpenAPIHono` 取代 `Hono`，路由用 `createRoute()` 搭配 Zod schema）+ **`@hono/swagger-ui`**（掛 `/docs` 路由）。已查證兩個套件目前仍在維護、版本可用。
- 選這套的理由：Zod schema 同時是執行期驗證與文件產生來源，兩者共用同一份定義，文件不會因為手動維護而跟實際 API 行為兜不起來。代價是所有路由都要用 Zod 定義 schema（目前 backend 完全沒用到 Zod），跟第 3 節的全面重構是同一批工程，一起做。

## 12. 開發流程

1. **對齊規格**：收斂成明確驗收條件再動工。
2. **拆解任務／分派**：依分工拆成子任務，非小改動先講做法再動手。
3. **實作 Backend**：先重構現有 4 支路由成 controller 分層（`menu.ts` 需前後 curl 比對），再依 controller 分層寫新 API。
4. **產出 Swagger／OpenAPI 文件**：backend API 完成後、frontend 串接前先做。
5. **自我驗證（Backend）**：`curl` 驗證基本功能 → 核對欄位與 Swagger 是否一致 → 補測試（整合測試為主、單元測試為輔，`vitest` + `@cloudflare/vitest-plugin`）→ `/code-review` → `/de-ai` 檢查註解與 Swagger 文件用語（不用中國用語或 AI 腔調，一律台灣用語）。
6. **實作 Frontend**：串接時對照 Swagger 文件核對欄位。
7. **RWD 檢查**：`/rwd-check` 多寬度截圖檢查有無跑版。
8. **QA 測試 → 除錯迴圈**：QA 用測試帳號模擬使用者實際操作路徑跑一輪 → 有問題回報對應角色（畫面/串接找前端，API 行為/資料找後端）→ 該角色修完、重跑自己的驗證 → 交還 QA 重測。**這個迴圈會反覆進行，不是跑一次就結束**，直到 QA 一輪下來沒有新問題，才進入下一步。
9. **產出 commit message**：`/commit-flow` 準備繁中訊息，**執行 `git add` 到暫存區，但不自動 `git commit`**（要你明確說「commit 一下」才會執行）。

## 13. 待辦分工（sub-agent 分派待後續指派）

### Backend

- [x] 重構前：`curl` 記錄現有 7 支路由的實際回應，當重構後的比對基準（**`/menu` 這步不能省**）
- [x] 建立 `controllers/` 目錄，把現有邏輯搬進去，路由檔只留註冊
- [x] 重構後：同樣的 `curl` 再打一次，比對回應跟重構前一致（尤其 `/menu`）——已驗證完全一致
- [x] Migration：`admins` 新增 `name`、`last_login_at`、`role` 欄位（`role` 有 CHECK 限制在五組角色內，既有帳號預設 `super_admin`）
- [x] Migration：新增 `password_reset_tokens` 表
- [x] 登入流程（`auth.ts`）：登入成功時寫入 `last_login_at`（`login`、`me` 現在也一併回傳 `role`，前端判斷權限要用）
- [x] 批次刪除 API（Delete，含「最後一位 Super Admin 不能被刪除」「不能刪自己」保護規則，已用 vitest 驗證）
- [x] 新增管理者 API（Create，僅 Super Admin／總召組可呼叫，因為 role 必填且只有這兩組能設定）
- [x] 查看單筆管理者 API（Read）
- [x] 編輯管理者 API（Update，`name` 全員可改，`role` 僅 Super Admin／總召組可改，含「最後一位 Super Admin 不能被降級」保護規則，已用 vitest 驗證）
- [x] Change Password API（含成功後撤銷其他裝置 session，已用 curl 驗證）
- [x] 忘記密碼－寄送重設信 API（**只做到產生 Token 存進資料庫，寄信本身尚未實作，已跟使用者確認先跳過**）
- [x] 忘記密碼－帶 Token 設定新密碼 API（已用 curl 驗證完整流程：產生 Token → 撈出 Token → 設新密碼 → 新密碼可登入）
- [x] 安裝並設定 `@hono/zod-openapi`、`@hono/swagger-ui`，掛 `/docs` 路由（既有 6 支路由已轉成 `OpenAPIHono` + `createRoute()`，`/openapi.json`、`/docs` 都已驗證可用）
- [ ] 產出 Swagger／OpenAPI 文件（既有 6 支已有基本 schema；新增的 7 支要等 API 寫完才補，忘記密碼與 Change Password 的 body 因為要保留既有手動驗證邏輯，暫不掛 Zod request 驗證，僅供文件展示）
- [x] 安裝並設定 `vitest` + `@cloudflare/vitest-plugin`（**訂正**：原文件寫的 `@cloudflare/vitest-pool-workers` 是舊套件，查證 Cloudflare 官方文件後改用目前官方推薦的 `@cloudflare/vitest-plugin`，config 寫法也不同，見 `backend/vitest.config.ts`）
- [ ] 整合測試：新增／查看／編輯／批次刪除／Change Password 的使用者行為
- [ ] 整合測試：忘記密碼流程（mock 寄信函式 + 真實 Token 測 reset-password）
- [x] 整合測試：`GET /menu`、`PUT /menu` 迴歸測試（`test/menu.test.ts`，4 個案例全過）
- [ ] 單元測試：密碼強度驗證邏輯
- [ ] 單元測試：SMTP 指令組裝邏輯

### 代理層（`server/api/admin/`、`server/api/`）

- [x] 對應上面所有 backend API 各建一支代理路由（忘記密碼兩支不需要登入，走一般 `server/api/`，不掛在 `server/api/admin/` 底下）

### Frontend

**路由規劃（定案）**：`/admin/admins/new`（新增）、`/admin/admins/[id]`（查看）、`/admin/admins/[id]/edit`（編輯）。

- [x] 列表頁：勾選框、全選、批次刪除操作欄位（`app/pages/admin/admins/index.vue`，原 `admins.vue` 因 Nuxt 路由規則改名）
- [x] 新增管理者頁面／表單（`/admin/admins/new`，含權限判斷：非 Super Admin／總召組會被擋）
- [x] 查看管理者內頁（`/admin/admins/[id]`）
- [x] 編輯管理者頁面（`/admin/admins/[id]/edit`，`role` 欄位依權限唯讀／可編輯）
- [x] 個人資料頁：Change Password 按鈕（筆圖示）＋ 獨立修改密碼區塊（`app/pages/admin/change-password.vue`）
- [x] 忘記密碼頁面（輸入 Email）＋ 重設密碼頁面（帶 Token）（`forgot-password.vue`／`reset-password.vue`，寄信本身尚未實作）

## 14. 協作方式與角色分工

**你提出的五個角色**：前端／後端／PM／QA（測試）／設計師（先進場看目前後台長怎樣，除了評估現況可不可用，也要親自走一次上稿流程，PM 可一起看）。

**我的建議**：
- 「設計師先進場」訂為正式的 **Phase 0**，產出一份具體清單（現有後台哪裡不好用、上稿流程卡在哪），作為後續前端／PM 定稿規格的輸入。設計師比較像一次性 kickoff 稽核，不需要全程留在後續開發階段。
- PM 職責明確包含「驗收守門」：除了排分工、對齊進度，也是最終驗收前的第一關守門人，真正拍板還是你本人。
- 整體順序：**Phase 0 設計師／PM 走查 → 收斂待確認事項 → 後端／前端並行開發 → 【QA 測試 → 回報 → 修正 → 重測】迴圈反覆進行直到沒有新問題 → PM／你本人最終驗收**。
- QA 不是一次性角色，要一直待到最終驗收前，每次有修正就要重測一輪。
- **定案：後端內部拆成兩層**——① **基礎建設**（controller 重構、Swagger 建置、測試框架建置，必須先做完、會卡住後面所有人）② 地基完成後可平行的兩條線：**管理者功能**與**認證與密碼**（各自動不同檔案，互不衝突）。

## 15. 測試帳號管理規範

- 你的規則：各角色自己建立各自的後台測試帳號密碼，測完自行刪除；你原本自己在用的帳號絕對不刪。
- 補充：①「新增管理者」API 完成前，Phase 0 走查階段由我直接對**本機 D1** 手動 insert 一個一次性帳號給設計師／PM 用，走查完就刪。②建議全程只在**本機開發環境（local D1）**操作測試帳號，不碰 remote/production D1。
- 命名建議：統一格式，例如 `test-frontend@...`、`test-backend@...`、`test-qa@...`、`test-design@...`。

## 16. 時程評估（粗估，僅供參考，不是承諾）

- 忘記密碼寄信這塊已經拿掉不確定性（定案先不測試，只寫程式），剩下唯一真正無法預先知道的變數是 **QA 除錯迴圈要跑幾輪**。
- 大致分段（工作階段 = 我實際動工＋驗證的一段連續工作，不是固定日曆天數）：
  1. Phase 0 設計師／PM 走查 + 待確認事項收斂 → 主要是你們的時間
  2. Backend 基礎建設（controller 重構＋Menu 迴歸驗證＋Swagger 建置＋vitest 建置）→ 一個工作階段
  3. 管理者 CRUD → 一個工作階段，可跟第 2 段銜接
  4. 認證與密碼線（Change Password＋忘記密碼兩支 API）→ 一個工作階段
  5. Swagger 文件補齊全部 API → 半個工作階段，可跟 2～4 搭著做
  6. Frontend 六個頁面／功能 → 一到兩個工作階段
  7. RWD 檢查＋commit → 小
  8. QA 除錯迴圈 → **唯一剩下的不可預測變數**
- 扣掉 QA 除錯迴圈本身要跑幾輪，第 1～7 段核心開發工作大致落在 **4～5 個工作階段**，這是相對有把握的估計；總時間最終還是看 QA 迴圈跑幾輪才會底定。

## 17. 驗收機制（待你之後進一步討論，先記錄初步想法）

- 這份文件本身已經在扮演規格書的角色，建議驗收時直接對照第 13 節「待辦分工」逐項打勾，不用另外再生一份驗收文件。
- 技術面可以搭配 `/verify`（實際跑起來操作驗證功能是否如預期）與 `/rwd-check`，QA 測完後由 PM／你本人做最終確認。

---

## 18. 待確認事項總表

**已定案（全部收斂完成，沒有剩餘的待確認事項）**
- [x] Change Password 成功後是否要撤銷其他裝置 session → **定案：要撤銷**（見第 8 節）
- [x] 用戶編號 → **不需要，直接用 `id`**（見第 6 節）
- [x] 最後登入時間顯示位置 → **列表、內頁都要顯示**（見第 6 節）
- [x] 新增管理者欄位 → **`email`、密碼、`name`、`role` 都包含**（`role` 一樣受限於「僅 Super Admin／總召組能設定」，見第 5、6 節）
- [x] 前端路由規劃 → **命名方式確認可用**：`/admin/admins/new`、`/admin/admins/[id]`、`/admin/admins/[id]/edit`（見第 13 節）
- [x] 權限規則細節（五組角色各自能做什麼）→ **明確延後**，這次只先定義有 `role` 欄位，完整權限矩陣之後再談（見第 7 節）
- [x] Super Admin／總召組彼此的權限能否互相調整 → **可以互相調整**，唯一例外是「最後一位 Super Admin 不能被降級／刪除」（見第 5 節）
- [x] 是否要擋刪除自己帳號／刪光所有管理者 → **兩種都要擋**（見第 5 節）
- [x] 登入機制方向 → **維持現有 session token**，不換成 JWT（見第 10 節）
- [x] 角色分工：後端要不要拆成「基礎建設」與「管理者功能／認證密碼」兩條線 → **定案：拆**（見第 14 節）
- [x] 忘記密碼寄信方式 → **定案：Gmail SMTP**（原生協定，需自建 SMTP client，不測試寄信本身，見第 9 節）
- [x] 最後一位 Super Admin 保護規則 → **定案：不能被降級或刪除**（見第 5 節）
- [x] 後端架構 → **定案：controller 分層，新舊路由全部重構**（見第 3 節）
- [x] Swagger 工具 → **定案：`@hono/zod-openapi` + `@hono/swagger-ui`**（見第 11 節）
