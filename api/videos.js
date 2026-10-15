// Auto-updating video feed: pulls the Social Justice Waterpipe channel RSS
// server-side (no API key) so the site shows the newest uploads. When the feed
// fails, it serves the newest taped appearances from facts.js instead.
import { parseFeed, routeVideos } from '../src/latest-videos.js'

const CHANNEL_ID = 'UCMEhjgjJbD27K7ZSQwKnkzg'
// A hung feed must not hold the function open; the page is fine without it.
const FEED_TIMEOUT_MS = 4000

export default async function handler(req, res) {
  // Each distinct query string is its own edge-cache entry, so ?anything
  // would skip the cache and refetch YouTube. Send every variant to the one
  // cached URL; the site itself never adds a query.
  if (req.url?.includes('?')) {
    res.statusCode = 308
    res.setHeader('Location', '/api/videos')
    res.setHeader('Cache-Control', 'public, s-maxage=86400')
    return res.end()
  }
  try {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    })
    if (!r.ok) throw new Error(`feed ${r.status}`)
    const videos = parseFeed(await r.text())
    if (!videos.length) throw new Error('feed had no videos')
    // The channel posts a few times a week: six hours fresh, then up to a week
    // of serving this list while the edge refreshes it in the background.
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=604800')
    res.status(200).json({ videos, live: true })
  } catch (error) {
    // Log it: otherwise a dead feed leaves no trace in Vercel's logs.
    console.error(`videos: YouTube feed failed (${error.message}); serving the route's recent tapes`)
    // Never cache the fallback, so it cannot replace a good list at the edge
    // and the next request asks YouTube again.
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ videos: routeVideos, live: false })
  }
}
