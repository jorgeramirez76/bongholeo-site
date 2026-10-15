// Storefront reads are retried twice with a short backoff before the page
// gives up, so one dropped request (flaky in-app browsers, a Shopify blip)
// does not make the shop look closed for the whole visit. Errors marked
// `retryable: false` (a bad token, a malformed query) fail at once.
export const RETRY_DELAYS_MS = [700, 2000]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function withRetry(load, { delays = RETRY_DELAYS_MS, wait = sleep } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await load()
    } catch (error) {
      if (attempt >= delays.length || error?.retryable === false) throw error
      await wait(delays[attempt])
    }
  }
}

// Rate limits (429, and Shopify's 430) and server errors can clear on their
// own; other HTTP errors will not.
export const retryableStatus = (status) => status === 429 || status === 430 || status >= 500
