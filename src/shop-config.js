// Plain constants shared by the browser shop client (src/shop.js) and the
// server-side daily shop check (api/cron/shop-health.js). Keep this file free
// of import.meta.env so it also loads in Node.
export const API_VERSION = '2026-07'
export const DEFAULT_COLLECTION = 'bongholeo'
// The site promises 15% off the first drop, applied automatically. Checkout
// sends this code with every cart and reports whether Shopify accepted it.
export const DISCOUNT_CODE = 'GAVELS15'
