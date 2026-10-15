import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/videos.js'
import { routeVideos } from '../src/latest-videos.js'
import { appearances } from '../src/facts.js'

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

const feed = (entries) => `<?xml version="1.0"?><feed>${entries.map(({ id, title }) => `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>2026-10-01T15:00:00+00:00</published><media:group><media:thumbnail url="https://i1.ytimg.com/vi/${id}/hqdefault.jpg" width="480" height="360"/></media:group></entry>`).join('')}</feed>`

const withFetch = async (respond, run) => {
  const fetch = mock.method(globalThis, 'fetch', respond)
  const log = mock.method(console, 'error', () => {})
  try {
    const res = response()
    await handler({ url: '/api/videos' }, res)
    await run(res, fetch, log)
  } finally {
    fetch.mock.restore()
    log.mock.restore()
  }
}

test('a good feed is parsed, decoded and cached for hours', async () => {
  await withFetch(async () => new Response(feed([{ id: 'abc123', title: 'Kenilworth &amp; the &quot;data center&quot;' }, { id: 'def456', title: 'Jackson' }])), (res) => {
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.live, true)
    assert.deepEqual(res.body.videos.map((v) => v.id), ['abc123', 'def456'])
    assert.equal(res.body.videos[0].title, 'Kenilworth & the "data center"')
    assert.match(res.headers['Cache-Control'], /s-maxage=21600/)
    assert.match(res.headers['Cache-Control'], /stale-while-revalidate=604800/)
  })
})

test('a failed feed serves the route’s recent tapes and is never cached', async () => {
  await withFetch(async () => new Response('gone', { status: 404 }), (res) => {
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.live, false)
    assert.deepEqual(res.body, { videos: routeVideos, live: false })
    assert.equal(res.headers['Cache-Control'], 'no-store')
  })
})

test('an empty feed counts as a failure instead of hiding the block', async () => {
  await withFetch(async () => new Response(feed([])), (res, _fetch, log) => {
    assert.equal(res.body.live, false)
    assert.ok(res.body.videos.length > 0)
    assert.equal(res.headers['Cache-Control'], 'no-store')
    assert.match(log.mock.calls[0].arguments[0], /no videos/)
  })
})

test('the YouTube request carries a timeout', async () => {
  await withFetch(async () => new Response(feed([{ id: 'abc123', title: 'x' }])), (_res, fetch) => {
    assert.ok(fetch.mock.calls[0].arguments[1]?.signal instanceof AbortSignal)
  })
})

test('the fallback list is the newest taped appearances from facts.js', () => {
  const taped = appearances.filter((a) => a.videoId).sort((a, b) => b.date.localeCompare(a.date))
  assert.ok(routeVideos.length > 0 && routeVideos.length <= 6)
  assert.deepEqual(routeVideos.map((v) => v.id), taped.slice(0, 6).map((a) => a.videoId))
  for (const video of routeVideos) {
    assert.match(video.thumb, /^https:\/\/i\.ytimg\.com\/vi\/[\w-]+\/hqdefault\.jpg$/)
    assert.ok(!Number.isNaN(Date.parse(video.published)))
  }
})
