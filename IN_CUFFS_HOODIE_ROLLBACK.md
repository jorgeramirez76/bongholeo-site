# Bongholeo In Cuffs Hoodie — live release and rollback

Last verified: 2026-08-25 (America/New_York). Inventory and SKU lines updated 2026-10-14 from a read-only Shopify Admin check (see the Inventory line and the live SKU table).

Deploys: production deploys only by pushing to `main` on GitHub (Vercel project `bongholeo-site` auto-deploys it). Never run `vercel --prod` from a local folder; local copies can be behind `main`.

## Live state

- Canonical storefront route: `https://bongholeo.com/products/bongholeo-in-cuffs-hoodie`
- Source release commit: `dbad4a8`
- Vercel production deployment at release (historical; production has been redeployed from `main` since): `bongholeo-site-67qg807lc-jorge-ramirezs-projects-612f8185.vercel.app`
- Shopify product: `gid://shopify/Product/8934030344345`
- Handle: `bongholeo-in-cuffs-hoodie`
- Status: `ACTIVE`
- Published only to `Flylyfe Headless` (`gid://shopify/Publication/191515984025`)
- Shopify Online Store is not selected; `onlineStoreUrl` and `publishedAt` are null
- Collection membership: only `Bongholeo` (`gid://shopify/Collection/357236211865`)
- Media: two lifestyle photos only (male and female); no production artwork is customer-facing
- Product options: Black, White, Sport Grey; S, M, L, XL, 2XL, 3XL
- Retail price: $59.99 for all 18 variants
- Inventory: Black and White variants are not tracked and continue selling, matching the print-to-order convention. Since 2026-09-09 the six Sport Grey variants are tracked at quantity 0 with "continue selling" off, so Shopify will not sell them. The site lists Sport Grey as sold out through `soldOutColors` in `src/pending-products.js`.

## Apliiq production records

- Connected store: `Flylyfe` (Shopify)
- Blank: Gildan 18500 Heavy Blend pullover hoodie
- Base authenticated design cost: $15.50
- Dropship cost with one full-color front transfer: $22.99 before shipping, tax, optional branding, or size adjustments
- Final transfer placement: centered Front, 7.25 × 10.88 inches, above the pouch pocket
- The official Apliiq Shopify integration identifies fulfillment items by their exact `APQ-` SKU, so the Shopify SKU decides which design is printed. The existing draft variants were preserved instead of using Apliiq's destructive “switch product” flow.

Live Shopify SKUs (read 2026-10-14):

| Shopify color | SKU pattern | Apliiq design | Status |
| --- | --- | --- | --- |
| Black | `APQ-6046253S{size}A1` | `6046253` | Selling. Changed from `6046254` after 2026-08-25; no record of who changed it or why. Not yet confirmed in Apliiq. |
| White | `APQ-6046261S{size}A1` | `6046261` (clean light-garment design) | Selling. Unchanged since release. |
| Sport Grey | `APQ-6046260S{size}A1` | `6046260` | Not for sale (see Inventory). Changed from `6046261` after 2026-08-25. Not yet confirmed in Apliiq. |

At release (2026-08-25) the record was: Black/smoke design `6046254`; White and Sport Grey shared the clean design `6046261`.

Still to confirm (owner, Apliiq dashboard): open designs `6046253` and `6046260` and check the garment color and the approved 7.25 × 10.88 inch front transfer, and that the store mapping points the Black variants at `6046253`. No hoodie order has been placed yet, so the new mapping has never been exercised. Prefer this dashboard check to a test order, which Apliiq may import and charge for.

Rule: whenever a SKU or Apliiq design changes in Shopify, update this table the same day with the reason and a dated "verified" line.

## Validation evidence

- Shopify Admin visually showed `Active` and only `Flylyfe Headless`.
- Admin GraphQL showed the Headless publication as published, with no Online Store publication and no online-store URL.
- At release, all 18 live Storefront API combinations were available for sale at $59.99 (Sport Grey stopped selling on 2026-09-09).
- A cart and Shopify checkout handoff were verified using M / Sport Grey; no order was placed.
- Desktop and 390 × 844 mobile layouts, both gallery photos, Merch card, canonical URL, Product JSON-LD, and sitemap entry passed.
- `www.flylyfe.com` and `shop.flylyfe.com` returned 404 for the hoodie route. The Fly Lyfe homepage and sitemap contain no hoodie handle or title.
- `npm run lint` and `npm run build` passed, with no browser console warnings or errors on the live product and Merch pages.

## Rollback

1. In Shopify Admin, change this product to `DRAFT`. This removes it from Headless immediately without deleting the product, variants, media, collection membership, or Apliiq designs.
2. Re-open Publishing → Manage and verify Online Store remains unselected. If a channel rollback is preferred while keeping the product active, deselect only `Flylyfe Headless` and save.
3. In the site repository, set `features.inCuffsHoodie` to `false`, run lint/build, commit, and push to `main`; Vercel deploys `main` automatically. This removes the Merch entry, route build, homepage schema item, llms.txt item, and sitemap URL together. Until it ships, the daily shop check (`api/cron/shop-health.js`) reports the hoodie as missing from the collection; that is expected.
4. For a code-level rollback, revert `dbad4a8` and push the revert to `main`. Do not reset the branch or delete the staged media commits. For an immediate rollback without a commit, use Vercel → `bongholeo-site` → Deployments → Instant Rollback to the previous production deployment; later pushes to `main` stay off production until that rollback is undone in Vercel.
5. Leave the hoodie's Apliiq designs saved unless a separate reviewed cleanup is requested. They do not create public pages or orders by themselves.
6. Verify the canonical Bongholeo route is gone, the Shopify product is not returned by Headless, and both Fly Lyfe product paths remain 404.

No products, variants, media, Apliiq designs, or collection records need to be deleted for rollback.
