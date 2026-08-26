# Bongholeo In Cuffs Hoodie — preflight handoff

Last reconciled: 2026-08-25 (America/New_York)

## Safe staged state

- No Shopify product, variants, publication, collection membership, or Apliiq design was created in this phase.
- No site deployment or search-engine-facing change was made.
- `features.inCuffsHoodie` remains `false`, so the staged route, Merch entry, sitemap entry, and schema entry are all excluded from production builds.
- The pending Merch/page facts live in the deliberately unreferenced `src/pending-products.js`; they are absent even from the built JavaScript until final release inputs are verified.
- The live Shopify collection is additionally filtered through the source-controlled enabled product handles. A future Shopify record cannot appear in the Bongholeo Merch grid until this feature is deliberately enabled and deployed.

## Verified product convention

- Blank: Gildan 18500 Heavy Blend unisex pullover hoodie
- Garment: black, 8 oz, 50/50 cotton-poly fleece, front pouch pocket, no zipper
- Sizes: S, M, L, XL, 2XL, 3XL
- Decoration: one full-color front transfer print
- Retail: $59.99 on every size, matching the existing Bongholeo hoodie
- SKU convention: `APQ-{design_id}S{size_id}A1`, with size IDs `S=6`, `M=7`, `L=8`, `XL=1`, `2XL=2`, `3XL=21`
- Collection/publication target: only `bongholeo` and only Flylyfe Headless; Shopify Online Store must remain deselected

The current Apliiq public page shows $40.75 for a one-off 18500 with one imprint. Seller pricing is hidden until an ecommerce store is linked in an authenticated Apliiq session. Apliiq's published dropship formula is the $15.50 base blank plus at least $7.49 for a transfer up to 203 square inches, or $22.99 before plus-size, branding, shipping, tax, or account-specific adjustments. The exact connected-account production cost and margin must be read from the saved design before product creation.

## Artwork geometry

- Tee source preserved unchanged: `outputs/bongholeo-in-cuffs-print-apliiq-12.67x19-300dpi.png`
- Hoodie production copy: `outputs/bongholeo-in-cuffs-print-hoodie-front-10x15-300dpi.png`
- Hoodie copy: 3000 × 4500 pixels, 10 × 15 inches at 300 DPI, transparent PNG
- Apliiq's current Gildan 18500 transfer table lists a 13.5 × 15-inch maximum front area. The 2:3 artwork is height-limited, so 10 × 15 inches is the largest aspect-preserving fit.
- Apliiq recommends tall hoodie-front prints start about 1 inch below the neck and warns that tall prints may need proportional scaling to clear the pouch pocket, especially on smaller sizes. Verify S and 3XL in the designer before activation and allow production to scale smaller garments rather than crop the art.

## Final inputs and release gates

1. Final local path for the separate dark-blond male black-hoodie lifestyle image.
2. Final local path for the separate blonde female black-hoodie lifestyle image.
3. Authenticated Apliiq access sufficient to save the Gildan 18500 Black design and read its exact connected-store production cost.
4. Final Apliiq design ID, artwork ID, placement ID, mockup, and six generated SKUs.
5. Final Shopify product and variant IDs after the Apliiq mapping is verified.

Before enabling `features.inCuffsHoodie`, add the two final WebP images, import `inCuffsHoodieProduct` from `src/pending-products.js` into the active `products` list, replace the route's noindex preflight state with validated OG/Twitter media and Product JSON-LD, verify the exact Shopify handle `bongholeo-in-cuffs-hoodie`, and confirm Headless-only publication.
