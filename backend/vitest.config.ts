import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

// D1 是全新的隔離測試資料庫，跑 migration 之前連 admins／sessions 這些表都不存在，
// 所以要在測試啟動時先把 migrations/ 底下的 SQL 全部套一次。
// readD1Migrations() 只能在 Node 端（這支 config 檔）呼叫，套用本身
// （applyD1Migrations）則要在 Workers runtime 裡執行，所以透過 define 把
// 讀出來的 migrations 陣列傳進 test/apply-migrations.ts 那支 setup file。
const migrationsPath = new URL('./migrations', import.meta.url).pathname
const migrations = await readD1Migrations(migrationsPath)

export default defineConfig({
  test: {
    setupFiles: ['./test/apply-migrations.ts']
  },
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' }
    })
  ],
  define: {
    __D1_MIGRATIONS__: JSON.stringify(migrations)
  }
})
