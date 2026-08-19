# Bongholeo Dedicated Store — Migration Runbook (Shopify Starter, $5/mo)

**Goal:** checkout says **"Bongholeo"**, not "Flylyfe." Fixes brand-whiplash at payment.
**Why a new store:** one Shopify store = one checkout brand. Sharing Flylyfe's store can't show
"Bongholeo" without breaking Flylyfe's own checkout. A separate store is the only clean fix.

## Current state (tested 2026-07-12)
- bongholeo.com headless shop works: cartCreate → checkoutUrl succeeds, no errors.
- Checkout currently hands off to **shop.flylyfe.com** (Flylyfe-branded). ← the problem.
- Funnel so far: 64 visitors, 15 watch-video clicks, 6 shop clicks, **0 add-to-cart, 0 orders.**

## STEP 0 — JORGE (I can't create accounts or enter payment)
1. Create a **new** Shopify store named **Bongholeo** (from your existing Shopify account →
   "add store", or shopify.com → start).
2. Put it on the **Starter plan ($5/mo)** (start trial → select Starter).
3. Tell me it's live. That's the only manual step — I do everything below.

## STEPS 1–8 — CLAUDE (once the store exists)
1. **Verify Starter viability** (before wiring): custom-app Storefront API token generates;
   Apliiq app installs + connects for fulfillment. Abort/flag if either fails.
2. **Install Apliiq**, connect fulfillment to the Bongholeo store.
3. **Recreate products in Apliiq** with the "Gavels The Truth" crest art + placement, push to Shopify:
   - Gavels The Truth Tee — $39.99 (S–XXL, white)
   - Gavels The Truth Hoodie — $59.99 (S–XXL, black)
   - (optional) Social Justice Waterpipe sticker — $6
4. **Create collection** `bongholeo`; add the products.
5. **Checkout branding** (Settings → Checkout): Bongholeo crest logo, gold/black colors.
6. **Custom app** (Settings → Develop apps) → enable Storefront API → generate **public token**;
   publish products to it.
7. **(Optional) custom domain** checkout.bongholeo.com for a fully on-brand checkout URL.
8. **Rewire bongholeo.com**: update Vercel env `VITE_SHOPIFY_DOMAIN` / `_STOREFRONT_TOKEN` /
   `_COLLECTION` → redeploy → test end-to-end that checkout shows **Bongholeo**.

## Notes / risks
- Starter caveats to confirm at Step 1: Apliiq-on-Starter, custom-app Storefront token on Starter.
- Deep checkout UI customization is Plus-only — **not needed**; the store name gives us the win.
- Starter has a 5% transaction fee (fine at low volume; revisit if merch takes off → Basic $39/mo).
- Keep Flylyfe and Bongholeo fully separate (own store, token, Apliiq connection, domain).
