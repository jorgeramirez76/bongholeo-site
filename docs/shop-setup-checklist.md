# Bongholeo Shop — Activation Checklist (Jorge's steps)
_The site's headless cart (`src/shop.js`) is already built and waiting. Do these and the shop goes live at bongholeo.com/#shop. Same proven stack as FLYLYFE._

## 1. Create the Shopify store (~5 min)
- shopify.com → start a new store, name it **Bongholeo**.
- Plan: **Basic ($39/mo)** — enough for headless + Apliiq (identical to FLYLYFE).
- Skip theme building — we're headless; the store just holds products + hosts checkout.

## 2. Get a Storefront API token
- Admin → **Settings → Apps and sales channels → Develop apps → Create an app** ("Bongholeo Headless").
- **Configuration → Storefront API**, enable: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_read_checkouts`, `unauthenticated_write_checkouts`.
- **Install app → API credentials → copy the Storefront API access token.**
- Note the store domain (e.g. `bongholeo.myshopify.com`; we can connect `shop.bongholeo.com` later like FLYLYFE).

## 3. Set 3 env vars in Vercel
Project **bongholeo-site → Settings → Environment Variables** (Production):
- `VITE_SHOPIFY_DOMAIN` = `your-store.myshopify.com`
- `VITE_SHOPIFY_STOREFRONT_TOKEN` = token from step 2
- `VITE_SHOPIFY_COLLECTION` = `bongholeo`
- Redeploy. The merch cards auto-flip from "coming soon" to live **Add to cart → Shopify checkout**.

## 4. Apliiq fulfillment (after the store exists)
- Apliiq → **Stores → Add custom store** → copy **App Key + Shared Secret**.
- Hand me those (or drop into `~/.bongholeo/apliiq_creds.json`, chmod 600). Then I run the build (reusing `~/flylyfe-apliiq`): upload the crest art, create the tee/hoodie designs (front print), SKU-match them to Shopify.

## 5. Say "go"
- With the store connected to the Shopify MCP (switch-shop to Bongholeo), I create the **`bongholeo` collection + products**, wire Apliiq fulfillment, run a $0 test checkout, and confirm the live shop end-to-end.

---
_Blocking order: **1 → 2 → 3** makes the shop UI live (empty). **4 → 5** puts real, fulfillable product in it._
