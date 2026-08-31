import { createExecutionContext, waitOnExecutionContext, env } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../src/index'

const IncomingRequest = Request

describe('GET /health', () => {
  it('回傳 200 並確認 D1 binding 有接上', async () => {
    const request = new IncomingRequest('http://example.com/health')
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ status: 'ok', db: [{ ok: 1 }] })
  })
})
