import { applyD1Migrations, env } from 'cloudflare:test'
import type { D1Migration } from '@cloudflare/vitest-plugin'

declare const __D1_MIGRATIONS__: D1Migration[]

await applyD1Migrations(env.DB, __D1_MIGRATIONS__)
