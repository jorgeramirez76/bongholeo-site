// Shopify Storefront API client for the Bongholeo headless shop.
// Activates automatically once the store env vars are set (Vercel → Project → Environment):
//   VITE_SHOPIFY_DOMAIN            e.g. "shop.bongholeo.com" or "bongholeo.myshopify.com"
//   VITE_SHOPIFY_STOREFRONT_TOKEN  public Storefront API access token
//   VITE_SHOPIFY_COLLECTION        (optional) collection handle to feature, default "bongholeo"
// Until then, shopConfigured is false and the site shows the "coming soon" drop teaser.
// Mirrors the proven FLYLYFE headless pattern: live variants on-site, checkout handed to Shopify.
import { API_VERSION, DEFAULT_COLLECTION, DISCOUNT_CODE } from './shop-config.js'
import { retryableStatus, withRetry } from './retry.js'

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN

export const shopConfigured = Boolean(DOMAIN && TOKEN)
export const shopCollection = import.meta.env.VITE_SHOPIFY_COLLECTION || DEFAULT_COLLECTION
export { DISCOUNT_CODE }

// Short, analytics-safe reason for a failed Storefront call.
export const failureReason = (error) => String(error?.message || error || 'unknown').slice(0, 120)

async function storefront(query, variables) {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw Object.assign(new Error(`Storefront ${res.status}`), { retryable: retryableStatus(res.status) })
  const json = await res.json()
  if (json.errors?.length) {
    const code = json.errors[0].extensions?.code
    throw Object.assign(new Error(json.errors[0].message), { retryable: code === 'THROTTLED' || code === 'INTERNAL_SERVER_ERROR' })
  }
  return json.data
}

export function formatPrice(money) {
  if (!money) return ''
  const n = parseFloat(money.amount)
  const whole = Number.isInteger(n) ? n : n.toFixed(2)
  return `$${whole}`
}

// Fetch products in the featured collection with their variants.
export async function fetchProducts(handle = shopCollection) {
  const data = await withRetry(() => storefront(
    `query ($handle: String!) {
      collection(handle: $handle) {
        products(first: 24) {
          nodes {
            id title handle description
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
            variants(first: 30) {
              nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } image { url altText } }
            }
          }
        }
      }
    }`,
    { handle },
  ))
  return data?.collection?.products?.nodes ?? []
}

// Fetch one exact product for its canonical detail route. Using a handle keeps
// the public route independent of Shopify's numeric IDs while still making the
// live variant IDs the source of truth for checkout.
export async function fetchProduct(handle) {
  const data = await withRetry(() => storefront(
    `query ($handle: String!) {
      product(handle: $handle) {
        id title handle description
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 30) {
          nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } image { url altText } }
        }
      }
    }`,
    { handle },
  ))
  return data?.product ?? null
}

// Create a cart from line items (not retried: the buyer can press again) and return the Shopify-hosted checkout URL,
// plus whether Shopify accepted the 15%-off code the site promises.
export async function createCheckout(lines) {
  const data = await storefront(
    `mutation ($lines: [CartLineInput!]!, $codes: [String!]) {
      cartCreate(input: { lines: $lines, discountCodes: $codes }) {
        cart { checkoutUrl discountCodes { code applicable } }
        userErrors { message }
      }
    }`,
    { lines, codes: [DISCOUNT_CODE] },
  )
  const err = data?.cartCreate?.userErrors?.[0]
  if (err) throw new Error(err.message)
  const cart = data?.cartCreate?.cart
  return {
    checkoutUrl: cart?.checkoutUrl,
    discountApplicable: Boolean(cart?.discountCodes?.some((d) => d.applicable && d.code.toUpperCase() === DISCOUNT_CODE)),
  }
}
