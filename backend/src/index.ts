import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { health } from './routes/health'
import { auth } from './routes/auth'
import { admins } from './routes/admins'
import { menu } from './routes/menu'

// D1／KV binding 型別，要跟 wrangler.jsonc 的 d1_databases[].binding（"DB"）、
// kv_namespaces[].binding（"LOGIN_ATTEMPTS"）對上。
// 新增其他 binding（R2、Secrets…）也統一加在這裡，路由檔案共用同一份型別。
export type Bindings = {
  DB: D1Database
  // 登入節流用：記錄同一 email 的失敗次數與鎖定狀態（見 utils/loginThrottle.ts）。
  LOGIN_ATTEMPTS: KVNamespace
}

const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.route('/health', health)
app.route('/auth', auth)
app.route('/admins', admins)
app.route('/menu', menu)

// 之後新增資源就在這裡掛路由，例如：
// app.route('/registrations', registrations)

// Session token 用 `Authorization: Bearer <token>` 帶，不是真的 JWT，
// 但 OpenAPI 的 bearer scheme 一樣適用（純粹是「這個 header 長怎樣」的宣告，
// 不代表 token 格式本身是 JWT）。
app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer'
})

app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'WebConf 2026 Admin API',
    version: '1.0.0'
  }
})

app.get('/docs', swaggerUI({ url: '/openapi.json' }))

export default app
