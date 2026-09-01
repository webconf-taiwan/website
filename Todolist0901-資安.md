# Todolist 0901 — 後台會員系統資安補強

> 這份是實際讀完 `backend/src/` 全部 controller、middleware、migrations，以及前端 `server/api/admin/*` 代理層程式碼後整理出來的，每一項都附檔案位置，不是泛用檢查清單。排序＝建議修復優先序，P0 最先處理。

## 0. 本波範圍（定案，2026-09-01）

**這一波把第 1～4 節（P0～P3）＋ `Todolist0831.md` 還沒打勾的項目，全部做完，不留待辦。唯一的例外是「忘記密碼真的寄出 Email」這件事本身**（沒有真實 Gmail 應用程式密碼沒辦法驗證，維持 Todolist0831.md 原本的決定：先不做，只做到產生 Token）。完整清單見第 7 節。

## 目錄

1. P0：權限控管破洞（Broken Access Control）
2. P1：帳密與 Token 安全
3. P2：中風險加固項目
4. P3：低風險／上線前該定案的事
5. 已收斂決定
6. Sub-agent 分工計畫
7. 本波總清單（唯一權威清單，PM 驗收對照這份）
8. 執行前需要你配合的事

---

## 1. P0：權限控管破洞（Broken Access Control）

這三項是「登入了就能做，跟你是哪個角色無關」，違反 Todolist0831.md 第 5、7 節定案的權限模型（角色只有 Super Admin／總召組能動別人的帳號）。

### 1-1. 批次刪除 API 完全沒有角色檢查（最嚴重）

- **檔案**：`backend/src/controllers/adminsController.ts` `batchDeleteAdmins()`（約 179-219 行）
- **現況**：只檢查「不能刪自己」「不能刪光」「不能刪最後一位 Super Admin」，**完全沒有檢查呼叫者的 `role`**。對照 `createAdmin`／`updateAdmin` 都有 `ROLE_MANAGERS.includes(caller.role)` 這行，`batchDeleteAdmins` 漏掉了。
- **影響**：設計組／開發組／議程組（最低權限的三組）只要登入，就能呼叫 `DELETE /admins` 刪掉包含 Super Admin、總召組在內的任何其他管理者帳號，只要不是自己、不會刪光、不會刪到最後一位 Super Admin。等於任何一個帳號都能把其他人全部踢出系統。
- **修法**：在函式最前面加 `if (!ROLE_MANAGERS.includes(caller.role as Role)) return c.json({ error: '沒有權限刪除管理者' }, 403)`，跟 `createAdmin` 同一套邏輯。

### 1-2. 查看單筆管理者 API 沒有做「只能看自己」的限制（IDOR）

- **檔案**：`backend/src/controllers/adminsController.ts` `getAdmin()`（48-59 行）
- **現況**：只掛了 `requireAuth`，沒有比對 `caller.role` 或 `caller.id === id`。
- **影響**：跟 `listAdmins()` 的規則矛盾——列表 API 已經定案「非 Super Admin／總召組只能看到自己一筆」，但同一個人只要改打 `GET /admins/:id` 帶別人的 id，就能拿到任何人的 email、name、role、last_login_at、created_at。等於用另一支 API 繞過了列表頁刻意做的權限收斂。
- **修法**：比照 `listAdmins` 的 `canSeeAll` 判斷，非管理者角色時若 `id !== caller.id` 直接回 403 或 404。

### 1-3. 編輯管理者 API 的 `name` 欄位沒有限制「只能改自己」

- **檔案**：`backend/src/controllers/adminsController.ts` `updateAdmin()`（115-177 行）
- **現況**：`role` 欄位有 `ROLE_MANAGERS` 檢查，但 `name` 欄位完全沒有檢查呼叫者是不是本人或管理者，任何登入者對任何 `id` 送 `{ name: "..." }` 都會成功。
- **影響**：設計組帳號可以把 Super Admin 的顯示名稱改掉。風險比 1-1／1-2 低（改不了權限、看不到密碼），但仍是越權寫入。
- **這條先歸類在「需要你確認」（見第 5 節）**，因為 Todolist0831.md 沒有明講「name 全員可改」是指「全員都能改自己的」還是「全員都能改任何人的」——程式碼目前是後者，需要你拍板要不要收斂成「只能改自己，或本來就要開放給管理者角色改別人的」。

---

## 2. P1：帳密與 Token 安全

### 2-1. 登入沒有暴力破解防護

- **檔案**：`backend/src/controllers/authController.ts` `login()`
- **現況**：帳密錯誤時統一回「帳號或密碼錯誤」防止列舉帳號這點做得對，但**沒有失敗次數限制、沒有鎖定、沒有延遲**，可以無限次嘗試。
- **建議**：Cloudflare 有原生 Rate Limiting Rules（Dashboard 設定，不用寫程式）可以先擋 IP 層級的暴力嘗試；應用層再視需要加「同一 email 連續失敗 N 次鎖定 X 分鐘」（用 D1 或 KV 記失敗次數）。`change-password` 驗證舊密碼、`reset-password` 驗證 Token 也一併考慮。

### 2-2. Session Token／密碼重設 Token 在資料庫裡是明文存放

- **檔案**：`migrations/0001_create_admins_and_sessions.sql`（`sessions.token`）、`migrations/0004_create_password_reset_tokens.sql`（`password_reset_tokens.token`）、`middleware/auth.ts`、`authController.ts`
- **現況**：兩張表都直接存原始 random token（32 bytes hex），查詢時 `WHERE token = ?` 直接比對明文。
- **影響**：token 本身熵足夠、目前查無其他漏洞可以外洩 DB，風險是「萬一之後 DB 備份外流或有其他管道讀得到這張表」，攻擊者能直接拿 token 冒用 session／重設任何人密碼，不需要先破解任何東西。業界慣例是存 token 的雜湊值（例如 `SHA-256(token)`），查詢時把輸入雜湊後再比對，原始 token 只回傳給使用者一次，資料庫裡永遠查不到明文。
- **建議**：這條可以晚一點排（目前風險是「防禦縱深」層級，不是立即可被利用的洞），但值得跟 Swagger／測試一起排進这波重構。

---

## 3. P2：中風險加固項目

### 3-1. PBKDF2 迭代次數偏低

- **檔案**：`backend/src/utils/crypto.ts` 第 8 行，`PBKDF2_ITERATIONS = 100_000`
- **現況**：OWASP 現行建議 PBKDF2-HMAC-SHA256 至少 600,000 次迭代（2023 版準則）；100,000 次是幾年前的建議值。
- **備註**：Todolist 裡當初選 PBKDF2 是因為 Workers runtime 沒有 bcrypt，這個選擇本身合理，只是迭代次數該跟著調高。調高前建議先量測 Workers 的 CPU time 限制夠不夠（免費方案有 CPU time 上限），避免登入變太慢或超時。

### 3-2. 沒有操作稽核紀錄（Audit Log）

- **現況**：新增／刪除／改權限這些敏感操作目前都沒有留存「誰、何時、對誰做了什麼」。
- **影響**：配合上面 1-1 的洞，就算修好權限檢查，未來如果真的發生誤刪或惡意操作，也沒有紀錄可以回溯是誰做的。
- **建議**：加一張簡單的 `admin_audit_log` 表（`actor_id`、`action`、`target_id`、`detail`、`created_at`），CRUD／權限異動／密碼重設都寫一筆，不用做到多花俏。

### 3-3. Session 固定 7 天到期，沒有滑動過期或閒置登出

- **現況**：Todolist0831.md 第 10 節已經評估過、認為現階段用不到 Refresh Token，但也提到「滑動過期」是可以之後補的加固項，目前還沒做。
- **影響**：token 一旦外洩，7 天內都有效，沒有「太久沒動作自動登出」的機制降低暴露窗口。
- **建議**：`requireAuth` 驗證通過時順手把該筆 session 的 `expires_at` 往後延，不用整套換掉現有機制。

---

## 4. P3：低風險／上線前該定案的事

- **安全 Response Headers**：目前沒有設定 `X-Content-Type-Options`、`Referrer-Policy` 等基本安全標頭。因為 backend 目前只被 Nuxt server 端代理呼叫（瀏覽器不會直接打 API），風險低，但舉手之勞可以加。
- **CORS**：目前完全沒設定（`backend/src/index.ts` 沒有掛 `cors()` middleware）。這點現狀反而是安全的——Hono 預設不回應 CORS header，瀏覽器端的跨源 fetch 會被瀏覽器自己擋掉。**只要之後沒有人為了「方便前端呼叫」隨手加 `cors({ origin: '*' })`，就不用特別處理**；如果之後真的要開放瀏覽器直連 backend，記得用白名單 origin，不要用 `*`。
- **D1 資料庫歸屬未定案**：`wrangler.jsonc` 註解裡自己寫著「目前建在 gui 的 Cloudflare 帳號底下，只是開發用；正式要不要搬到團隊共用帳號還沒定案」，正式上線前要決定清楚，避免正式環境的會員資料掛在個人帳號下。
- **之後接 Gmail SMTP 時**：應用程式密碼務必用 `wrangler secret put` 存，不要寫進 `.dev.vars` 或任何會進 repo 的檔案（目前檢查過，還沒有已提交的憑證檔，但排 SMTP 這條時要特別注意）。

---

## 5. 已收斂決定

- **`updateAdmin` 的 `name` 欄位開放範圍（2026-09-01 定案）**：非管理者角色（設計組／開發組／議程組）**只能改自己的 `name`**，帶別人的 `id` 一律回 403；Super Admin／總召組維持能改任何人的 `name`（跟能改 `role` 是同一組人）。
  - 實作方式：`updateAdmin()` 處理 `body.name` 時，比照 `body.role` 的檢查邏輯加一段——`if (!ROLE_MANAGERS.includes(caller.role as Role) && caller.id !== id)` 就回 403。

## 6. Sub-agent 分工計畫

跟 `SOP-開發協作流程.md` 的「基礎建設優先、地基完成才拆平行功能線」原則一致，但這波幾乎全部是 backend＋測試工作，沒有前端角色（既有的錯誤處理 `err.data?.error` 接得住新的錯誤訊息，不需要另外改前端頁面）。

**階段 A：基礎建設（單一 agent 循序處理，不可拆平行）**

這幾項會動到同一批底層檔案（`middleware/auth.ts`、`utils/crypto.ts`），彼此牽動，拆給不同 agent 平行做會衝突：
1. Session Token／密碼重設 Token 雜湊化存放（2-2）
2. PBKDF2 迭代次數調高，含查證 Workers CPU time 限制（3-1）
3. Audit Log 共用寫入工具（新 migration ＋ utility function，3-2）
4. Session 滑動過期（3-3，順手跟 token 雜湊化一起改 `auth.ts`）

**階段 B：功能線（地基完成後平行，彼此不碰同一批檔案）**

- **線 1：權限修復** — 集中改 `adminsController.ts`：批次刪除角色檢查（1-1）、`getAdmin` 權限限制（1-2）、`name` 欄位範圍（1-3，見第 5 節定案）
- **線 2：登入節流與鎖定** — 集中改 `authController.ts`：login／change-password／reset-password 加失敗次數限制（2-1）

**階段 C：驗收層（必須等 A＋B 全部做完才能開始）**

- Swagger／OpenAPI 補齊 7 支新 API，並反映新的權限規則與錯誤碼（新增的 403、429 等）
- 整合測試：CRUD／Change Password／忘記密碼流程
- 單元測試：密碼強度驗證、SMTP 指令組裝邏輯
- QA 實測所有 P0 修復是否真的擋下來（例如用非管理者身份打批次刪除，確認回 403）

**階段 D：PM／你本人最終驗收**，對照第 7 節清單逐項打勾。

## 7. 本波總清單（唯一權威清單）

### 階段 A：基礎建設
- [x] Session Token／密碼重設 Token 雜湊化存放（SHA-256，欄位改名 `token_hash`；curl 全流程驗證過）
- [x] PBKDF2 迭代次數：**改成 60,000 次**（不是原訂的調高）——查證 Cloudflare Workers Free 方案 10ms CPU time 上限，本機實測現有 100,000 次已經超標（約 12ms），降到 60,000 次（約 7.3ms）留安全餘裕；格式改成自我描述的 `iterations:salt:hash`，之後再調不影響舊帳號
- [x] Audit Log 機制（`admin_audit_log` 表＋ `writeAuditLog()`，CRUD／權限異動／密碼變更／重設都有記；**過程中發現並修掉一個真實 bug**：一開始用 `ON DELETE SET NULL` 外鍵，導致刪除管理者後連刪除前的紀錄也被清空 `target_id`，改成純歷史欄位＋email 快照）
- [x] Session 滑動過期（`requireAuth` 每次驗證通過就延長 `expires_at`）

### 階段 B：權限修復線
- [x] 批次刪除 API 補角色檢查（僅 Super Admin／總召組能刪除其他管理者）——**這是修復前最嚴重的洞，已用 vitest 驗證非管理者呼叫會被 403 擋下**
- [x] `getAdmin` 補權限限制（非管理者只能查自己，IDOR 修復，已用 vitest 驗證）
- [x] `updateAdmin` 的 `name` 欄位補範圍限制（非管理者只能改自己，Super Admin／總召組可改任何人，已用 vitest 驗證）

### 階段 B：登入節流線
- [x] Login／Change Password／Reset Password 加失敗次數限制與鎖定機制（KV 存狀態，5 次失敗鎖 15 分鐘；curl 實測鎖定生效、鎖定中連正確密碼都擋下來、成功登入會清空計數）

### 階段 C：驗收
- [x] Swagger／OpenAPI 文件補齊 7 支新 API（`Todolist0831.md` 未完成項）——實際起服務拉 `/openapi.json` 核對，14 支路由回應碼全部涵蓋（含新增的 403、429）
- [x] 整合測試：新增／查看／編輯／批次刪除／Change Password（`Todolist0831.md` 未完成項；`test/admins.test.ts`、`test/auth.test.ts`）
- [x] 整合測試：忘記密碼流程（`Todolist0831.md` 未完成項；`test/forgot-password.test.ts`）——**原訂用 vi.mock() 攔截寄信函式驗證呼叫參數，實測發現 `@cloudflare/vitest-plugin` 的 SUT 跑在真正的 workerd runtime 裡，vi.mock() 沒辦法跨進去生效，改用 Todolist0831.md 原本就定案的主要策略（直接驗證資料庫、直接注入已知 token/hash 配對測驗證邏輯）**
- [x] 單元測試：密碼強度驗證邏輯（`Todolist0831.md` 未完成項；`test/password.test.ts`，10 個案例含邊界值）
- [ ] 單元測試：SMTP 指令組裝邏輯（`Todolist0831.md` 未完成項）——**做不到**：程式碼裡沒有任何 SMTP 組裝邏輯可以測，`utils/mailer.ts` 目前是空的 stub。這個單元測試的前提是先寫出 STARTTLS／AUTH LOGIN 組裝邏輯，而那正是「寄信本身」的一部分，兩者綁在一起，沒辦法只做測試不做實作，跟下面的排除項是同一件事
- [x] 補測試：階段 A、B 新增的權限檢查、鎖定機制、Token 雜湊化、Audit Log（涵蓋在 `test/admins.test.ts`、`test/auth.test.ts`、`test/admins-super-admin-protection.test.ts` 裡）

全部完成：54 個測試、型別檢查全過。

### 明確排除（不是忘記，是刻意跳過）
- [ ] ~~忘記密碼真的寄出 Email（SMTP 實際寄信＋指令組裝邏輯）~~ — 沒有真實 Gmail 應用程式密碼無法驗證，維持只做到產生 Token；`utils/mailer.ts` 已把介面接好（`sendPasswordResetEmail()`），之後有憑證要接的話直接補內容即可

## 8. 執行前需要你配合的事

- **Token 雜湊化是破壞性變更**：部署那天所有既有 session 會失效（因為舊 token 是明文存的，新邏輯查雜湊值查不到），包含你自己的登入也會被登出，需要重新登入一次。這個代價換來的是「就算 DB 外洩，攻擊者也不能直接拿 token 冒用」，值得做，但先讓你知道會發生什麼事。
- **登入節流需要新增 Cloudflare KV Namespace**：失敗次數＋鎖定狀態用 KV 存最合適（原生支援 TTL 自動過期，不用自己寫清除機制），但目前 `wrangler.jsonc` 沒有掛任何 KV binding，需要跑一次 `wrangler kv namespace create`，會需要你的 Cloudflare 帳號權限（或你授權我直接用你本機已登入的 wrangler CLI跑）。
- **Cloudflare Dashboard 的 IP 層級 Rate Limiting Rule 不是程式碼能設定的**：這是額外一道防線（擋同一 IP 大量嘗試 `/auth/login`），建議之後你自己到 Dashboard 開，我會在完成後附上建議的規則設定值。
- **登入鎖定的預設值**：沒有特別要求的話，我會先用「同一 email 連續失敗 5 次，鎖定 15 分鐘」，之後覺得太嚴或太鬆再調。
