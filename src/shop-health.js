// Compares what src/facts.js tells visitors with what Shopify will actually
// sell. Used by api/cron/shop-health.js; kept free of network code so it can
// be tested (npm test).
import { saleColors } from './facts.js'

const option = (variant, name) => variant.selectedOptions?.find((o) => o.name === name)?.value
const money = (value) => Number(value).toFixed(2)

// products: the facts products. liveProducts: Storefront collection nodes.
// discount: { code, applicable } from a test cart, or null if not tested.
// Returns a list of plain-English problems; empty means the site is truthful.
export function findShopProblems(products, liveProducts, discount = null) {
  const problems = []
  const live = new Map((liveProducts || []).map((product) => [product.handle, product]))

  for (const product of products) {
    const shopify = live.get(product.handle)
    if (!shopify) {
      problems.push(`${product.name}: not in the Shopify collection, so the site cannot sell it`)
      continue
    }
    const variants = shopify.variants?.nodes || []

    const wrongPrices = [...new Set(variants.map((v) => money(v.price?.amount)).filter((p) => p !== money(product.price)))]
    if (wrongPrices.length) {
      problems.push(`${product.name}: Shopify charges $${wrongPrices.join(', $')} but the site says $${product.price}`)
    }

    const colors = saleColors(product)
    const sizes = product.sizes || []
    if (!colors.length && !sizes.length) {
      if (!variants.some((v) => v.availableForSale)) problems.push(`${product.name}: no variant can be bought`)
    } else {
      for (const color of colors.length ? colors : [null]) {
        for (const size of sizes.length ? sizes : [null]) {
          const variant = variants.find((v) => (!color || option(v, 'Color') === color) && (!size || option(v, 'Size') === size))
          const label = [product.name, color, size].filter(Boolean).join(' / ')
          if (!variant) problems.push(`${label}: advertised on the site but missing in Shopify`)
          else if (!variant.availableForSale) problems.push(`${label}: advertised on the site but Shopify will not sell it`)
        }
      }
    }

    for (const color of product.soldOutColors || []) {
      if (variants.some((v) => v.availableForSale && option(v, 'Color') === color)) {
        problems.push(`${product.name} / ${color}: Shopify sells it again, but the site still says sold out (update soldOutColors)`)
      }
    }
  }

  if (discount && !discount.applicable) {
    problems.push(`Discount ${discount.code}: no longer applies at checkout, but the site promises 15% off automatically`)
  }
  return problems
}
