import { policyPath, policySummary } from './merch-policy.js'

export default function MerchPolicy() {
  return <section aria-labelledby="merch-policy-title" style={{ padding: '28px 7vw', lineHeight: 1.7 }}>
    <h2 id="merch-policy-title">Shipping &amp; returns</h2>
    <p>{policySummary}</p>
    <p><a href={policyPath} style={{ color: 'inherit', textDecoration: 'underline' }}>Read shipping rates, destinations and the full return policy →</a></p>
  </section>
}
