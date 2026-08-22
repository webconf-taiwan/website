# D1 migrations

目前還沒有任何 schema，這個目錄先放著佔位（git 不追蹤空目錄）。

實際資料表定案後，用 wrangler 產生 migration 檔，不要手刻檔名：

```bash
yarn db:migrations:new <migration 名稱，例如 create_registrations_table>
```

會在這裡產生一支帶編號的 `.sql`，寫好 `CREATE TABLE` 之後：

```bash
# 先套到本機（wrangler dev 用的 SQLite）
yarn db:migrations:local

# 確認沒問題再套到雲端
yarn db:migrations:remote
```
