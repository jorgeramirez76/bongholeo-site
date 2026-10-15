// One Shopify Storefront API request. src/shop.js binds it to the site's store;
// it lives here, free of import.meta.env, so tests can load it in Node.
import { API_VERSION } from './shop-config.js'
import { retryableStatus } from './retry.js'

// On flaky in-app-browser networks a request can hang without ever failing,
// and withRetry (retry.js) only acts on a failure. Reads that take longer than
// this are cut off and count as a dropped request, so the page retries and
// then reaches "Try again" instead of waiting forever.
export const READ_TIMEOUT_MS = 8000

// AbortSignal.timeout is missing in older in-app browsers (iOS before 16).
export function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms)
  if (typeof AbortController === 'undefined') return undefined
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

export async function storefrontRequest({ domain, token, query, variables, timeoutMs }) {
  let json
  try {
    const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      signal: timeoutMs ? timeoutSignal(timeoutMs) : undefined,
    })
    if (!res.ok) throw Object.assign(new Error(`Storefront ${res.status}`), { retryable: retryableStatus(res.status) })
    json = await res.json()
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw Object.assign(new Error('Storefront timed out'), { retryable: true })
    }
    throw error
  }
  if (json.errors?.length) {
    const code = json.errors[0].extensions?.code
    throw Object.assign(new Error(json.errors[0].message), { retryable: code === 'THROTTLED' || code === 'INTERNAL_SERVER_ERROR' })
  }
  return json.data
}
