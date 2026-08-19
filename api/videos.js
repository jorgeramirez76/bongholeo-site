// Auto-updating video feed: pulls the Social Justice Waterpipe channel RSS
// server-side (no API key) so the site always shows the newest uploads.
const CHANNEL_ID = 'UCMEhjgjJbD27K7ZSQwKnkzg'

export default async function handler(req, res) {
  try {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)
    if (!r.ok) throw new Error(`feed ${r.status}`)
    const xml = await r.text()
    const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .map(([, e]) => ({
        id: e.match(/<yt:videoId>([^<]+)/)?.[1],
        title: (e.match(/<title>([^<]+)/)?.[1] || '')
          .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        published: e.match(/<published>([^<]+)/)?.[1],
        thumb: e.match(/<media:thumbnail url="([^"]+)"/)?.[1],
      }))
      .filter((v) => v.id)
      .slice(0, 6)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json({ videos })
  } catch {
    res.setHeader('Cache-Control', 's-maxage=300')
    res.status(200).json({ videos: [] })
  }
}
