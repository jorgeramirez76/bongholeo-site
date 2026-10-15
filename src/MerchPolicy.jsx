import { policyPath, policySummary, seller } from './merch-policy.js'

export default function MerchPolicy() {
  return <section aria-labelledby="merch-policy-title" style={{ padding: '28px 7vw', lineHeight: 1.7 }}>
    <h2 id="merch-policy-title">Shipping &amp; returns</h2>
    <p>{policySummary}</p>
    <p>{seller.note} Flylyfe’s {seller.policies.map((policy, i) => <span key={policy.href}>{i ? (i === seller.policies.length - 1 ? ' and ' : ', ') : ''}<a href={policy.href} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{policy.label.toLowerCase()}</a></span>)} apply to checkout.</p>
    <p><a href={policyPath} style={{ color: 'inherit', textDecoration: 'underline' }}>Read shipping rates, destinations and the full return policy →</a></p>
  </section>
}
