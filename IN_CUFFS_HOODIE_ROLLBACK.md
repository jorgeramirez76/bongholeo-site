# Bongholeo In Cuffs Hoodie — live release and rollback

Last verified: 2026-08-25 (America/New_York)

## Live state

- Canonical storefront route: `https://bongholeo.com/products/bongholeo-in-cuffs-hoodie`
- Source release commit: `dbad4a8`
- Vercel production deployment: `bongholeo-site-67qg807lc-jorge-ramirezs-projects-612f8185.vercel.app`
- Shopify product: `gid://shopify/Product/8934030344345`
- Handle: `bongholeo-in-cuffs-hoodie`
- Status: `ACTIVE`
- Published only to `Flylyfe Headless` (`gid://shopify/Publication/191515984025`)
- Shopify Online Store is not selected; `onlineStoreUrl` and `publishedAt` are null
- Collection membership: only `Bongholeo` (`gid://shopify/Collection/357236211865`)
- Media: two lifestyle photos only (male and female); no production artwork is customer-facing
- Product options: Black, White, Sport Grey; S, M, L, XL, 2XL, 3XL
- Retail price: $59.99 for all 18 variants
- Inventory is not tracked, matching the established print-to-order storefront convention

## Apliiq production records

- Connected store: `Flylyfe` (Shopify)
- Blank: Gildan 18500 Heavy Blend pullover hoodie
- Base authenticated design cost: $15.50
- Dropship cost with one full-color front transfer: $22.99 before shipping, tax, optional branding, or size adjustments
- Final transfer placement: centered Front, 7.25 × 10.88 inches, above the pouch pocket
- Black/smoke design: `6046254`
- White/Sport Grey clean design: `6046261`
- Black variants use `APQ-6046254...` SKUs
- White and Sport Grey variants use `APQ-6046261...` SKUs. The two light garment colors intentionally share the design's size SKU; the Shopify Color option identifies the garment color.
- The black saved design also retains an unused White color selection from the initial design save. No Shopify White variant points to that design; White and Sport Grey point only to the clean light-garment design.
- The official Apliiq Shopify integration identifies fulfillment items by their exact `APQ-` SKU. The existing draft variants were preserved instead of using Apliiq's destructive “switch product” flow.

## Validation evidence

- Shopify Admin visually showed `Active` and only `Flylyfe Headless`.
- Admin GraphQL showed the Headless publication as published, with no Online Store publication and no online-store URL.
- All 18 live Storefront API combinations were available for sale at $59.99.
- A cart and Shopify checkout handoff were verified using M / Sport Grey; no order was placed.
- Desktop and 390 × 844 mobile layouts, both gallery photos, Merch card, canonical URL, Product JSON-LD, and sitemap entry passed.
- `www.flylyfe.com` and `shop.flylyfe.com` returned 404 for the hoodie route. The Fly Lyfe homepage and sitemap contain no hoodie handle or title.
- `npm run lint` and `npm run build` passed, with no browser console warnings or errors on the live product and Merch pages.

## Rollback

1. In Shopify Admin, change this product to `DRAFT`. This removes it from Headless immediately without deleting the product, variants, media, collection membership, or Apliiq designs.
2. Re-open Publishing → Manage and verify Online Store remains unselected. If a channel rollback is preferred while keeping the product active, deselect only `Flylyfe Headless` and save.
3. In the site repository, set `features.inCuffsHoodie` to `false`, run lint/build, commit, push, and deploy. This removes the Merch entry, route build, homepage schema item, llms.txt item, and sitemap URL together.
4. For a code-level rollback, revert `dbad4a8` and deploy the resulting commit. Do not reset the branch or delete the staged media commits.
5. Leave the two Apliiq designs saved unless a separate reviewed cleanup is requested. They do not create public pages or orders by themselves.
6. Verify the canonical Bongholeo route is gone, the Shopify product is not returned by Headless, and both Fly Lyfe product paths remain 404.

No products, variants, media, Apliiq designs, or collection records need to be deleted for rollback.
