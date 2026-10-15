# Bongholeo In Cuffs Tee — launch and rollback handoff

Last reconciled: 2026-08-25 20:08 EDT (America/New_York). Rollback steps updated 2026-10-14.

Deploys: production deploys only by pushing to `main` on GitHub (Vercel project `bongholeo-site` auto-deploys it). Never run `vercel --prod` from a local folder; local copies can be behind `main`.

## Current state

- Site slice is live at `https://bongholeo.com/products/bongholeo-in-cuffs-tee` from source commit `0ae7491` (handoff commit `7b68b02`).
- GitHub `origin/main` contains both release commits.
- Vercel production deployment at launch (historical; production has been redeployed from `main` many times since): `dpl_Fm7BP4FekGbY6PPdbhPhNaVbRgbr`
  - Production aliases: `https://bongholeo.com`, `https://www.bongholeo.com`, and `https://bongholeo-site.vercel.app`
  - Do not promote the pre-launch deployment `dpl_AxHk6veRPosUmo1dMcwEno33viaa` (2026-08-20): it predates both In Cuffs products and the `/shipping-returns` page that every Product JSON-LD links to.
- Release checks passed: `npm run lint`, `npm run build`, static canonical/schema/sitemap checks, and `npm audit --omit=dev` (0 vulnerabilities).
- Shopify product: `gid://shopify/Product/8934012289177`
  - Handle: `bongholeo-in-cuffs-tee`
  - Status: `ACTIVE`
  - Price: `$39.99` on all 12 variants
  - Options: Size `S`–`3XL`; Color `Black`, `White`
  - Collection: only `gid://shopify/Collection/357236211865` (`bongholeo`)
  - Shopify Online Store publication `gid://shopify/Publication/187706474649`: not selected and not published; `onlineStoreUrl` is `null`; `publishedAt` is `null`
  - Flylyfe Headless publication `gid://shopify/Publication/191515984025`: selected and published (`publishDate` `2026-08-26T00:02:27Z`)
  - Publication was re-opened and visually verified in Shopify Admin after activation: Online Store unchecked, Flylyfe Headless checked
- Apliiq Bella+Canvas 3001 designs:
  - Black: design `6046092`, artwork `8085796`, color ID `50`, front location ID `6117`, `transfer_print`
  - White: design `6046093`, artwork `8085797`, color ID `65`, front location ID `6117`, `transfer_print`
  - Sizes map to Apliiq size IDs: `S=6`, `M=7`, `L=8`, `XL=1`, `2XL=2`, `3XL=21`
  - SKU pattern: `APQ-{design_id}S{size_id}A1`

## Hosted Shopify files

- Black male lifestyle — `gid://shopify/MediaImage/37265292066969`
  - `https://cdn.shopify.com/s/files/1/0727/1153/6793/files/bongholeo-in-cuffs-black-male.png?v=1787696657`
- Black female lifestyle — `gid://shopify/MediaImage/37265292198041`
  - `https://cdn.shopify.com/s/files/1/0727/1153/6793/files/bongholeo-in-cuffs-black-female.png?v=1787696678`
- White male lifestyle — `gid://shopify/MediaImage/37265292230809`
  - `https://cdn.shopify.com/s/files/1/0727/1153/6793/files/bongholeo-in-cuffs-white-male.png?v=1787696687`
- White female lifestyle — `gid://shopify/MediaImage/37265292263577`
  - `https://cdn.shopify.com/s/files/1/0727/1153/6793/files/bongholeo-in-cuffs-white-female.png?v=1787696694`
- Approved black-garment smoke production master (300 dpi) — `gid://shopify/MediaImage/37265754063001`
- White-garment production master (300 dpi) — `gid://shopify/MediaImage/37265292361881`

The two production masters are not attached to the customer-facing Shopify product media. Their file URLs are deliberately not listed here: Shopify Files are public to anyone with the URL, and this repository is public. Once Apliiq is confirmed to hold its own copy of the artwork and a private backup exists, delete both masters in Shopify Admin → Content → Files, and keep future production masters out of Shopify Files.

## Live verification

- Desktop and 390px mobile layouts were visually checked; no clipping or overlap was found.
- The gallery exposes four separate lifestyle photographs: black male, black female, white male, and white female. Production masters are not customer media.
- Black/White color selection changes the lead media correctly; size selection exposes `S`, `M`, `L`, `XL`, `2XL`, and `3XL`.
- A live `M / Black` cart was created and handed to Shopify checkout successfully. No order was submitted.
- Canonical URL, Product JSON-LD (`$39.99 USD`, four images), Bongholeo Merch entry, and Bongholeo sitemap entry are live.
- Shopify reports exactly one collection (`bongholeo`) and exactly one published catalog (Flylyfe Headless).
- Shopify variant SKUs match Apliiq designs `6046092` and `6046093` for every Black/White size.
- Fly Lyfe exclusion was checked on `www.flylyfe.com`: homepage, Product schema, sitemap, and ten public collection routes contain neither the title nor handle. `shop.flylyfe.com/products/bongholeo-in-cuffs-tee` resolves to the Flylyfe homepage rather than exposing a product page.

## Rollback

1. In Shopify Admin, set product `gid://shopify/Product/8934012289177` to `DRAFT` first. Verify `onlineStoreUrl` remains `null` and both publication checks report not published. The daily shop check (`api/cron/shop-health.js`) will report the tee as missing until it is also removed from `src/facts.js`; that is expected.
2. For a complete catalog rollback, open **Publishing → Manage**, keep **Online Store** unchecked, uncheck **Flylyfe Headless**, and save. Do not delete the product; keeping it preserves all variant IDs and Apliiq SKUs.
3. For an immediate site rollback, open Vercel → `bongholeo-site` → Deployments and use Instant Rollback to the previous production deployment (the one before the change being undone). Re-check `https://bongholeo.com` afterwards. Later pushes to `main` stay off production until the rollback is undone in Vercel. Do not promote an old deployment ID from this document.
4. For a source-level rollback, create a normal revert of runtime commit `0ae7491` and push that revert to `origin/main`; do not reset shared history. The handoff-only commit `7b68b02` does not affect the runtime.
5. Remove the product from collection `gid://shopify/Collection/357236211865` only if a completely clean Admin rollback is required.
6. Leave Apliiq designs `6046092` and `6046093` in place unless the account owner explicitly requests archival; never repoint existing product or variant mappings.

## Release invariant

The product must remain published only to **Flylyfe Headless**. If Shopify ever selects or publishes **Online Store**, return the product to `DRAFT` immediately, remove Online Store in **Publishing → Manage**, and re-verify the Admin API state before reactivation.
