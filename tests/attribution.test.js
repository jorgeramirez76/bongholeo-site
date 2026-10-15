import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createWithSource, landingDetails, toAttributes } from '../src/attribution.js'

test('UTM tags, the referring site and the landing path are kept', () => {
  const details = landingDetails({
    href: 'https://bongholeo.com/products/bongholeo-in-cuffs-tee?utm_source=instagram&utm_medium=bio&utm_campaign=in-cuffs&fbclid=abc',
    referrer: 'https://l.instagram.com/some/path?u=private',
  })
  assert.deepEqual(details, {
    utm_source: 'instagram', utm_medium: 'bio', utm_campaign: 'in-cuffs',
    referrer: 'https://l.instagram.com',
    landing_page: '/products/bongholeo-in-cuffs-tee',
  })
})

test('an internal or missing referrer is left out', () => {
  assert.deepEqual(landingDetails({ href: 'https://bongholeo.com/', referrer: 'https://bongholeo.com/cranford-july-7-2026' }), { landing_page: '/' })
  assert.deepEqual(landingDetails({ href: 'https://bongholeo.com/', referrer: '' }), { landing_page: '/' })
})

test('long values are clipped and empty ones dropped before they reach Shopify', () => {
  const details = landingDetails({ href: `https://bongholeo.com/?utm_source=${'x'.repeat(500)}&utm_medium=`, referrer: '' })
  assert.equal(details.utm_source.length, 200)
  assert.equal('utm_medium' in details, false)
  assert.deepEqual(toAttributes({ a: 'one', b: '', c: null }), [{ key: 'a', value: 'one' }])
})

// A stand-in for cartCreate that records the attributes of every call.
const cartCreate = (replies) => {
  const calls = []
  const create = async (attributes) => {
    calls.push(attributes)
    const reply = replies[calls.length - 1]
    if (reply instanceof Error) throw reply
    return reply
  }
  return { calls, create }
}
const cart = { cartCreate: { cart: { checkoutUrl: 'https://checkout.test/c/1' }, userErrors: [] } }
const source = [{ key: 'utm_source', value: 'instagram' }]

test('the cart carries the source when Shopify accepts it', async () => {
  const { calls, create } = cartCreate([cart])
  assert.equal(await createWithSource(create, source), cart)
  assert.deepEqual(calls, [source])
})

test('a cart Shopify refuses with the source is created again without it', async () => {
  const userError = { cartCreate: { cart: null, userErrors: [{ field: ['input', 'attributes', '0', 'key'], message: 'is invalid' }] } }
  const graphqlError = new Error('Variable $attributes of type [AttributeInput!] was provided invalid value')
  for (const first of [userError, graphqlError]) {
    const { calls, create } = cartCreate([first, cart])
    assert.equal(await createWithSource(create, source), cart)
    assert.deepEqual(calls, [source, []])
  }
})

test('a failure that is not about the source still reaches the buyer', async () => {
  const { calls, create } = cartCreate([new Error('Storefront 503'), new Error('Storefront 503')])
  await assert.rejects(createWithSource(create, source), /Storefront 503/)
  assert.equal(calls.length, 2)
})

test('with no source there is a single request', async () => {
  const { calls, create } = cartCreate([cart])
  await createWithSource(create, [])
  assert.deepEqual(calls, [[]])
})
