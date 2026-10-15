import { test } from 'node:test'
import assert from 'node:assert/strict'
import { retryableStatus, withRetry } from '../src/retry.js'

const noWait = { wait: async () => {} }

test('a read that fails once is retried and succeeds', async () => {
  let calls = 0
  const result = await withRetry(async () => { calls += 1; if (calls === 1) throw new TypeError('Failed to fetch'); return 'ok' }, noWait)
  assert.equal(result, 'ok')
  assert.equal(calls, 2)
})

test('it gives up after the last backoff and rethrows', async () => {
  let calls = 0
  const waits = []
  await assert.rejects(
    withRetry(async () => { calls += 1; throw new Error('Storefront 503') }, { wait: async (ms) => { waits.push(ms) } }),
    /Storefront 503/,
  )
  assert.equal(calls, 3)
  assert.deepEqual(waits, [700, 2000])
})

test('errors marked not retryable fail at once', async () => {
  let calls = 0
  await assert.rejects(withRetry(async () => { calls += 1; throw Object.assign(new Error('Storefront 401'), { retryable: false }) }, noWait))
  assert.equal(calls, 1)
})

test('only rate limits and server errors count as retryable statuses', () => {
  assert.deepEqual([401, 403, 404, 429, 430, 500, 503].map(retryableStatus), [false, false, false, true, true, true, true])
})
