// The homepage "Latest from the channel" list. api/videos.js reads it from the
// channel's RSS feed. YouTube's feed fails often (it returned 404 for weeks in
// 2026), so when it does, the site shows the newest taped appearances from
// facts.js instead of an empty block. Plain JS, so it also loads in Node.
import { appearances } from './facts.js'

export const LATEST_COUNT = 6

export const routeVideos = [...appearances]
  .filter((appearance) => appearance.videoId)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, LATEST_COUNT)
  .map((appearance) => ({
    id: appearance.videoId,
    title: appearance.town,
    // Noon UTC keeps the meeting date from showing as the day before in US time zones.
    published: `${appearance.date}T12:00:00Z`,
    thumb: `https://i.ytimg.com/vi/${appearance.videoId}/hqdefault.jpg`,
  }))

const decode = (text) => text
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

// The newest uploads in a YouTube channel feed, newest first.
export function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, entry]) => ({
      id: entry.match(/<yt:videoId>([^<]+)/)?.[1],
      title: decode(entry.match(/<title>([^<]+)/)?.[1] || ''),
      published: entry.match(/<published>([^<]+)/)?.[1],
      thumb: entry.match(/<media:thumbnail url="([^"]+)"/)?.[1],
    }))
    .filter((video) => video.id)
    .slice(0, LATEST_COUNT)
}
