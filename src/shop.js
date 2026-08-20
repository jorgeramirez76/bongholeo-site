// Shopify Storefront API client for the Bongholeo headless shop.
// Activates automatically once the store env vars are set (Vercel → Project → Environment):
//   VITE_SHOPIFY_DOMAIN            e.g. "shop.bongholeo.com" or "bongholeo.myshopify.com"
//   VITE_SHOPIFY_STOREFRONT_TOKEN  public Storefront API access token
//   VITE_SHOPIFY_COLLECTION        (optional) collection handle to feature, default "bongholeo"
// Until then, shopConfigured is false and the site shows the "coming soon" drop teaser.
// Mirrors the proven FLYLYFE headless pattern: live variants on-site, checkout handed to Shopify.

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const API_VERSION = '2026-07'

export const shopConfigured = Boolean(DOMAIN && TOKEN)
export const shopCollection = import.meta.env.VITE_SHOPIFY_COLLECTION || 'bongholeo'

async function storefront(query, variables) {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Storefront ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
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
  const data = await storefront(
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
  )
  return data?.collection?.products?.nodes ?? []
}

// Create a cart from line items and return the Shopify-hosted checkout URL.
export async function createCheckout(lines) {
  const data = await storefront(
    `mutation ($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines, discountCodes: ["GAVELS15"] }) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    { lines },
  )
  const err = data?.cartCreate?.userErrors?.[0]
  if (err) throw new Error(err.message)
  return data?.cartCreate?.cart?.checkoutUrl
}
