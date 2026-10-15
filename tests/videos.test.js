import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/videos.js'

const response = () => ({
  statusCode: 200, headers: {}, body: null,
  setHeader(name, value) { this.headers[name] = value; return this },
  status(code) { this.statusCode = code; return this },
  json(body) { this.body = body; return this },
  end() { return this },
})

test('query strings redirect to the one cached URL without calling YouTube', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => { throw new Error('should not fetch') })
  try {
    const res = response()
    await handler({ url: '/api/videos?probe=1' }, res)
    assert.equal(res.statusCode, 308)
    assert.equal(res.headers.Location, '/api/videos')
    assert.equal(fetch.mock.callCount(), 0)
  } finally {
    fetch.mock.restore()
  }
})

test('a failed YouTube feed is logged with its status', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('gone', { status: 404 }))
  const log = mock.method(console, 'error', () => {})
  try {
    await handler({ url: '/api/videos' }, response())
    assert.equal(log.mock.callCount(), 1)
    assert.match(log.mock.calls[0].arguments[0], /feed 404/)
  } finally {
    fetch.mock.restore()
    log.mock.restore()
  }
})
