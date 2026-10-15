import { mock, test } from 'node:test'
import assert from 'node:assert/strict'
import { findShopProblems } from '../src/shop-health.js'
import { products, saleColors } from '../src/facts.js'
import handler, { checkShop } from '../api/cron/shop-health.js'

const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL']
const variant = (size, color, { available = true, amount = '59.99' } = {}) => ({
  id: `gid://shopify/ProductVariant/${size}-${color}`,
  availableForSale: available,
  price: { amount },
  selectedOptions: [{ name: 'Size', value: size }, ...(color ? [{ name: 'Color', value: color }] : [])],
})
const hoodieFacts = {
  handle: 'hoodie', name: 'Hoodie', price: '59.99',
  colors: ['Black', 'White', 'Sport Grey'], soldOutColors: ['Sport Grey'], sizes,
}
const liveHoodie = (overrides = {}) => ({
  handle: 'hoodie',
  variants: { nodes: hoodieFacts.colors.flatMap((color) => sizes.map((size) => variant(size, color, overrides[`${size}/${color}`] ?? { available: color !== 'Sport Grey' }))) },
})

test('saleColors leaves out sold-out colours', () => {
  assert.deepEqual(saleColors(hoodieFacts), ['Black', 'White'])
  assert.deepEqual(saleColors({ name: 'No colours' }), [])
})

test('a shop that matches the facts has no problems', () => {
  assert.deepEqual(findShopProblems([hoodieFacts], [liveHoodie()], { code: 'GAVELS15', applicable: true }), [])
})

test('reports an advertised colour/size Shopify will not sell', () => {
  const problems = findShopProblems([hoodieFacts], [liveHoodie({ 'M/White': { available: false } })])
  assert.deepEqual(problems, ['Hoodie / White / M: advertised on the site but Shopify will not sell it'])
})

test('reports a sold-out colour that sells again', () => {
  const problems = findShopProblems([hoodieFacts], [liveHoodie({ 'L/Sport Grey': { available: true } })])
  assert.equal(problems.length, 1)
  assert.match(problems[0], /Sport Grey: Shopify sells it again/)
})

test('reports price drift, missing products and a dead discount', () => {
  const problems = findShopProblems(
    [hoodieFacts, { handle: 'gone', name: 'Gone Tee', price: '39.99' }],
    [liveHoodie({ 'S/Black': { amount: '64.99' } })],
    { code: 'GAVELS15', applicable: false },
  )
  assert.deepEqual(problems, [
    'Hoodie: Shopify charges $64.99 but the site says $59.99',
    'Gone Tee: not in the Shopify collection, so the site cannot sell it',
    'Discount GAVELS15: no longer applies at checkout, but the site promises 15% off automatically',
  ])
})

test('a product with no colours or sizes in facts only needs one buyable variant', () => {
  const facts = { handle: 'gavels', name: 'Gavels Hoodie', price: '59.99' }
  const live = (available) => ({ handle: 'gavels', variants: { nodes: sizes.map((size) => variant(size, null, { available })) } })
  assert.deepEqual(findShopProblems([facts], [live(true)]), [])
  assert.deepEqual(findShopProblems([facts], [live(false)]), ['Gavels Hoodie: no variant can be bought'])
})

// Shopify as the site's own facts say it should be.
const liveFromFacts = () => products.map((product) => ({
  handle: product.handle,
  variants: {
    nodes: (product.colors?.length ? product.colors : [null]).flatMap((color) => (product.sizes?.length ? product.sizes : ['One size']).map((size) =>
      variant(size, color, { amount: product.price, available: !(product.soldOutColors || []).includes(color) }))),
  },
}))

const withFetch = async (fake, run) => {
  const real = globalThis.fetch
  globalThis.fetch = fake
  try { return await run() } finally { globalThis.fetch = real }
}
const storefrontFake = ({ applicable = true } = {}) => async (url, init) => {
  assert.match(url, /^https:\/\/shop\.test\/api\/[\d-]+\/graphql\.json$/)
  const { query } = JSON.parse(init.body)
  const data = query.includes('cartCreate')
    ? { cartCreate: { cart: { discountCodes: [{ code: 'GAVELS15', applicable }] }, userErrors: [] } }
    : { collection: { products: { nodes: liveFromFacts() } } }
  return new Response(JSON.stringify({ data }), { status: 200 })
}
const env = { VITE_SHOPIFY_DOMAIN: 'shop.test', VITE_SHOPIFY_STOREFRONT_TOKEN: 'public-token' }

test('checkShop passes when Shopify matches the site facts', async () => {
  assert.deepEqual(await withFetch(storefrontFake(), () => checkShop(env)), [])
})

test('checkShop reports a discount Shopify no longer applies', async () => {
  const problems = await withFetch(storefrontFake({ applicable: false }), () => checkShop(env))
  assert.deepEqual(problems, ['Discount GAVELS15: no longer applies at checkout, but the site promises 15% off automatically'])
})

test('checkShop reports a Storefront outage and missing configuration', async () => {
  const down = async () => new Response('busy', { status: 503 })
  assert.deepEqual(await withFetch(down, () => checkShop(env)), ['Shop check could not run: Storefront 503'])
  assert.match((await checkShop({}))[0], /is not set/)
})

const fakeRes = () => ({ headers: {}, statusCode: 0, body: null,
  setHeader(name, value) { this.headers[name] = value },
  status(code) { this.statusCode = code; return this },
  json(body) { this.body = body; return this } })

// Sets (or, with undefined, removes) environment variables for one test and
// restores them after, so tests behave the same in a Vercel build where the
// real values are set.
const withEnv = async (vars, run) => {
  const saved = Object.fromEntries(Object.keys(vars).map((key) => [key, process.env[key]]))
  const apply = (values) => { for (const [key, value] of Object.entries(values)) { if (value === undefined) delete process.env[key]; else process.env[key] = value } }
  apply(vars)
  try { return await run() } finally { apply(saved) }
}

test('handler refuses calls without the cron secret when one is set', async () => {
  const res = fakeRes()
  await withEnv({ CRON_SECRET: 'test-secret' }, () => handler({ headers: {} }, res))
  assert.equal(res.statusCode, 401)
})

// A shop with one problem (the discount no longer applies), Resend configured,
// and a record of every email the handler tries to send.
const alertSetup = (cronSecret) => {
  const emails = []
  const shop = storefrontFake({ applicable: false })
  const fetch = async (url, init) => {
    if (url.startsWith('https://api.resend.com/')) {
      emails.push(JSON.parse(init.body))
      return new Response('{}', { status: 200 })
    }
    return shop(url, init)
  }
  const vars = { ...env, VITE_SHOPIFY_COLLECTION: undefined, CRON_SECRET: cronSecret,
    RESEND_API_KEY: 'resend-test-key', RESEND_FROM: 'shop-check@example.test', SHOP_HEALTH_ALERT_TO: 'owner@example.test' }
  return { emails, fetch, vars }
}
const quietly = async (run) => {
  const log = mock.method(console, 'error', () => {})
  try { return await run() } finally { log.mock.restore() }
}

test('without CRON_SECRET anyone can run the check, but no alert email is sent', async () => {
  const { emails, fetch, vars } = alertSetup(undefined)
  const res = fakeRes()
  await quietly(() => withEnv(vars, () => withFetch(fetch, () => handler({ headers: {} }, res))))
  assert.equal(res.statusCode, 500)
  assert.equal(res.body.problems.length, 1)
  assert.equal(res.body.alerted, false)
  assert.equal(emails.length, 0)
})

test('the scheduled call emails the problems it finds', async () => {
  const { emails, fetch, vars } = alertSetup('test-secret')
  const res = fakeRes()
  await quietly(() => withEnv(vars, () => withFetch(fetch, () => handler({ headers: { authorization: 'Bearer test-secret' } }, res))))
  assert.equal(res.statusCode, 500)
  assert.equal(res.body.alerted, true)
  assert.equal(emails.length, 1)
  assert.deepEqual(emails[0].to, ['owner@example.test'])
  assert.match(emails[0].text, /GAVELS15/)
})
