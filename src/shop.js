// Shopify Storefront API client for the Bongholeo headless shop.
// Activates automatically once the store env vars are set (Vercel → Project → Environment):
//   VITE_SHOPIFY_DOMAIN            e.g. "shop.bongholeo.com" or "bongholeo.myshopify.com"
//   VITE_SHOPIFY_STOREFRONT_TOKEN  public Storefront API access token
//   VITE_SHOPIFY_COLLECTION        (optional) collection handle to feature, default "bongholeo"
// Until then, shopConfigured is false and the site shows the "coming soon" drop teaser.
// Mirrors the proven FLYLYFE headless pattern: live variants on-site, checkout handed to Shopify.
import { DEFAULT_COLLECTION, DISCOUNT_CODE } from './shop-config.js'
import { withRetry } from './retry.js'
import { READ_TIMEOUT_MS, storefrontRequest } from './storefront.js'
import { cartAttributes, createWithSource } from './attribution.js'

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN

export const shopConfigured = Boolean(DOMAIN && TOKEN)
export const shopCollection = import.meta.env.VITE_SHOPIFY_COLLECTION || DEFAULT_COLLECTION
export { DISCOUNT_CODE }

// Short, analytics-safe reason for a failed Storefront call.
export const failureReason = (error) => String(error?.message || error || 'unknown').slice(0, 120)

const storefront = (query, variables, options) =>
  storefrontRequest({ domain: DOMAIN, token: TOKEN, query, variables, ...options })
// Reads are cut off after READ_TIMEOUT_MS and retried (see storefront.js).
const read = (query, variables) => storefront(query, variables, { timeoutMs: READ_TIMEOUT_MS })

export function formatPrice(money) {
  if (!money) return ''
  const n = parseFloat(money.amount)
  const whole = Number.isInteger(n) ? n : n.toFixed(2)
  return `$${whole}`
}

// Fetch products in the featured collection with their variants.
export async function fetchProducts(handle = shopCollection) {
  const data = await withRetry(() => read(
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
  const data = await withRetry(() => read(
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

// Create a cart from line items and return the Shopify-hosted checkout URL,
// plus whether Shopify accepted the 15%-off code the site promises. The cart
// also carries the visit's traffic source (see attribution.js); a request
// that fails with the source is sent once more without it. Beyond that it is
// not retried automatically: the buyer can press again.
const CART_CREATE = `mutation ($lines: [CartLineInput!]!, $codes: [String!], $attributes: [AttributeInput!]) {
  cartCreate(input: { lines: $lines, discountCodes: $codes, attributes: $attributes }) {
    cart { checkoutUrl discountCodes { code applicable } }
    userErrors { field message }
  }
}`

export async function createCheckout(lines) {
  // The source is nice to have; never let it block a sale (see attribution.js).
  const data = await createWithSource((attributes) => storefront(CART_CREATE, { lines, codes: [DISCOUNT_CODE], attributes }), cartAttributes())
  const err = data?.cartCreate?.userErrors?.[0]
  if (err) throw new Error(err.message)
  const cart = data?.cartCreate?.cart
  return {
    checkoutUrl: cart?.checkoutUrl,
    discountApplicable: Boolean(cart?.discountCodes?.some((d) => d.applicable && d.code.toUpperCase() === DISCOUNT_CODE)),
  }
}
