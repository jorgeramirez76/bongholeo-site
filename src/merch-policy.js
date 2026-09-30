// Shared by the visible storefront, static documents and merchant markup.
export const policyUpdated = '2026-09-30'
export const policyPath = '/shipping-returns'
export const policySections = [
  { title: 'Production and delivery', text: 'Every item is printed to order. Production takes 7–10 business days. US delivery usually takes another 2–7 business days after shipment. International delivery times vary by destination.' },
  { title: 'Shipping rates and destinations', text: 'We ship worldwide to 200+ countries, excluding Russia and Belarus. Shipping is calculated by weight at checkout: US standard shipping starts at $11.49 for one tee, and international shipping starts at $19.49 for one tee. Hoodies and orders with multiple items may cost more. Your final shipping charge is shown at checkout. International customers are responsible for import duties, VAT and customs charges due on delivery.' },
  { title: '30-day returns and exchanges', text: 'Unworn, unwashed items in their original condition can be returned for an exchange or refund within 30 days of delivery. Customers pay return shipping for both US and international returns. To start a return or exchange, email admin@bongholeo.com with your order details for return instructions.' },
]
export const policySummary = 'Printed to order in 7–10 business days; US delivery usually adds 2–7 business days after shipment. Weight-based shipping is calculated at checkout. Unworn, unwashed items in original condition qualify for returns or exchanges within 30 days of delivery; customers pay return shipping.'
export function merchantPolicy(product) {
  const policy = {
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy', applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 30, returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      merchantReturnLink: 'https://bongholeo.com/shipping-returns',
    },
  }
  // This is the US rate for one tee, not a flat rate for hoodies or a basket.
  if (/tee/i.test(product.name)) policy.shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
    shippingRate: { '@type': 'MonetaryAmount', value: 11.49, currency: 'USD' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      businessDays: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => `https://schema.org/${day}`) },
      handlingTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY' },
      transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' },
    },
  }
  return policy
}
