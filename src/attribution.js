// Where a visit came from, sent to Shopify as cart attributes so each order
// shows its source under "Additional details" in Shopify Admin. Without it
// Shopify recorded the only Bongholeo order so far as "direct". The details
// are taken on the first page of the visit and kept for the tab's session,
// because buyers often land on one page and buy on another.
const KEY = 'bongholeo:landing'
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const clip = (value) => String(value).trim().slice(0, 200)

// UTM tags, the referring site (its origin only, never its path or query)
// and the landing path. No personal data.
export function landingDetails({ href, referrer }) {
  const url = new URL(href)
  const details = {}
  for (const key of UTM) {
    const value = clip(url.searchParams.get(key) || '')
    if (value) details[key] = value
  }
  if (referrer) {
    try {
      const from = new URL(referrer)
      if (from.host !== url.host) details.referrer = from.origin
    } catch { /* not a URL: leave it out */ }
  }
  details.landing_page = clip(url.pathname)
  return details
}

export const toAttributes = (details) => Object.entries(details || {})
  .filter(([, value]) => typeof value === 'string' && value)
  .map(([key, value]) => ({ key, value }))

export function rememberLanding() {
  try {
    if (sessionStorage.getItem(KEY)) return
    sessionStorage.setItem(KEY, JSON.stringify(landingDetails({ href: location.href, referrer: document.referrer })))
  } catch { /* storage blocked: the order just goes without a source */ }
}

export function cartAttributes() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null')
    return toAttributes(saved || landingDetails({ href: location.href, referrer: document.referrer }))
  } catch {
    return []
  }
}
