import { test } from 'node:test'
import assert from 'node:assert/strict'
import { landingDetails, toAttributes } from '../src/attribution.js'

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
