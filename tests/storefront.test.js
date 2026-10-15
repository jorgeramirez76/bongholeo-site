import { mock, test } from 'node:test'
import assert from 'node:assert/strict'
import { READ_TIMEOUT_MS, storefrontRequest, timeoutSignal } from '../src/storefront.js'
import { withRetry } from '../src/retry.js'

const request = (options) => storefrontRequest({ domain: 'shop.test', token: 'public-token', query: '{ shop { name } }', ...options })

// A request that never answers, the way one can on a flaky phone network. It
// only ends when its signal aborts, as a real fetch does.
const hang = (_url, init) => new Promise((_resolve, reject) => {
  init.signal?.addEventListener('abort', () => reject(init.signal.reason))
})

const withFetch = async (fake, run) => {
  const fetch = mock.method(globalThis, 'fetch', fake)
  try { return await run(fetch) } finally { fetch.mock.restore() }
}

test('a read that hangs is cut off and counts as retryable', async () => {
  await withFetch(hang, async () => {
    await assert.rejects(request({ timeoutMs: 20 }), (error) => {
      assert.equal(error.message, 'Storefront timed out')
      assert.equal(error.retryable, true)
      return true
    })
  })
})

test('after a hang the retry gets another chance and succeeds', async () => {
  let calls = 0
  const fake = (url, init) => {
    calls += 1
    return calls === 1 ? hang(url, init) : Promise.resolve(new Response(JSON.stringify({ data: { ok: true } })))
  }
  const data = await withFetch(fake, () => withRetry(() => request({ timeoutMs: 20 }), { wait: async () => {} }))
  assert.deepEqual(data, { ok: true })
  assert.equal(calls, 2)
})

test('a request without timeoutMs (checkout) sends no abort signal', async () => {
  await withFetch(async () => new Response(JSON.stringify({ data: {} })), async (fetch) => {
    await request({})
    assert.equal(fetch.mock.calls[0].arguments[1].signal, undefined)
  })
})

test('Shopify errors say whether another try could help', async () => {
  const reply = (body, status = 200) => async () => new Response(JSON.stringify(body), { status })
  const failure = async (fake) => withFetch(fake, () => request({ timeoutMs: READ_TIMEOUT_MS }).then(() => null, (error) => error))
  assert.equal((await failure(reply({}, 503))).retryable, true)
  assert.equal((await failure(reply({}, 401))).retryable, false)
  assert.equal((await failure(reply({ errors: [{ message: 'Throttled', extensions: { code: 'THROTTLED' } }] }))).retryable, true)
  const invalid = await failure(reply({ errors: [{ message: 'Field does not exist' }] }))
  assert.equal(invalid.message, 'Field does not exist')
  assert.equal(invalid.retryable, false)
})

test('timeoutSignal aborts after the given time', async () => {
  const signal = timeoutSignal(10)
  assert.equal(signal.aborted, false)
  await new Promise((resolve) => setTimeout(resolve, 30))
  assert.equal(signal.aborted, true)
})

test('browsers without AbortSignal.timeout still cut off a hung read', async () => {
  const native = AbortSignal.timeout
  AbortSignal.timeout = undefined
  try {
    await withFetch(hang, async () => {
      await assert.rejects(request({ timeoutMs: 20 }), { message: 'Storefront timed out', retryable: true })
    })
  } finally {
    AbortSignal.timeout = native
  }
})
