// Daily check (vercel.json "crons") that what the site says about the shop is
// still true in Shopify: every product in src/facts.js is in the Bongholeo
// collection, every colour × size it advertises can be bought at the price it
// shows, and the automatic 15%-off code still applies to a test cart.
//
// Uses the same public Storefront token as the browser. A problem returns 500
// and is logged, so it shows in Vercel → Logs and the cron history. It is also
// emailed when RESEND_API_KEY, RESEND_FROM and SHOP_HEALTH_ALERT_TO are set.
// Set CRON_SECRET in Vercel so only the scheduled run can call it.
import { products } from '../../src/facts.js'
import { API_VERSION, DEFAULT_COLLECTION, DISCOUNT_CODE } from '../../src/shop-config.js'
import { findShopProblems } from '../../src/shop-health.js'

const TIMEOUT_MS = 10000

const COLLECTION_QUERY = `query ($handle: String!) {
  collection(handle: $handle) {
    products(first: 50) {
      nodes {
        handle
        variants(first: 100) {
          nodes { id availableForSale price { amount } selectedOptions { name value } }
        }
      }
    }
  }
}`

const CART_MUTATION = `mutation ($lines: [CartLineInput!]!, $codes: [String!]) {
  cartCreate(input: { lines: $lines, discountCodes: $codes }) {
    cart { discountCodes { code applicable } }
    userErrors { message }
  }
}`

async function storefront(domain, token, query, variables) {
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Storefront ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

async function emailAlert(problems) {
  const { RESEND_API_KEY, RESEND_FROM, SHOP_HEALTH_ALERT_TO } = process.env
  if (!RESEND_API_KEY || !RESEND_FROM || !SHOP_HEALTH_ALERT_TO) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: SHOP_HEALTH_ALERT_TO.split(',').map((address) => address.trim()).filter(Boolean),
      subject: `bongholeo.com shop check: ${problems.length} problem${problems.length === 1 ? '' : 's'}`,
      text: `The daily bongholeo.com shop check found:\n\n- ${problems.join('\n- ')}\n\nFix the Shopify product or update src/facts.js (or src/pending-products.js) so the site matches what Shopify sells.`,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}`)
  return true
}

export async function checkShop(env = process.env) {
  const domain = env.VITE_SHOPIFY_DOMAIN
  const token = env.VITE_SHOPIFY_STOREFRONT_TOKEN
  if (!domain || !token) return ['Shop check could not run: VITE_SHOPIFY_DOMAIN or VITE_SHOPIFY_STOREFRONT_TOKEN is not set']
  try {
    const data = await storefront(domain, token, COLLECTION_QUERY, { handle: env.VITE_SHOPIFY_COLLECTION || DEFAULT_COLLECTION })
    const live = data?.collection?.products?.nodes ?? []
    const handles = new Set(products.map((product) => product.handle))
    const testVariant = live.filter((product) => handles.has(product.handle)).flatMap((product) => product.variants.nodes).find((variant) => variant.availableForSale)

    const extra = []
    let discount = null
    if (testVariant) {
      const created = (await storefront(domain, token, CART_MUTATION, { lines: [{ merchandiseId: testVariant.id, quantity: 1 }], codes: [DISCOUNT_CODE] }))?.cartCreate
      if (created?.userErrors?.length || !created?.cart) {
        extra.push(`Test cart could not be created: ${created?.userErrors?.[0]?.message || 'no cart returned'}`)
      } else {
        discount = { code: DISCOUNT_CODE, applicable: created.cart.discountCodes.some((d) => d.applicable && d.code.toUpperCase() === DISCOUNT_CODE) }
      }
    }
    return [...findShopProblems(products, live, discount), ...extra]
  } catch (error) {
    return [`Shop check could not run: ${error.message}`]
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' })
  }

  const problems = await checkShop()
  if (!problems.length) return res.status(200).json({ ok: true, products: products.length })

  console.error(`shop-health: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`)
  let alerted = false
  try {
    alerted = await emailAlert(problems)
  } catch (error) {
    console.error(`shop-health: alert email failed: ${error.message}`)
  }
  return res.status(500).json({ ok: false, problems, alerted })
}
