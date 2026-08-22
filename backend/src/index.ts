import { Hono } from 'hono'
import { health } from './routes/health'

// D1 binding 型別，要跟 wrangler.jsonc 的 d1_databases[].binding（"DB"）對上。
// 新增其他 binding（KV、R2、Secrets…）也統一加在這裡，路由檔案共用同一份型別。
export type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.route('/health', health)

// 之後新增資源就在這裡掛路由，例如：
// app.route('/registrations', registrations)

export default app
