# Bongholeo In Cuffs Tee — launch and rollback handoff

Last reconciled: 2026-08-25 (America/New_York)

## Current state

- Local site slice is complete and passes `npm run lint`, `npm run build`, and the static canonical/schema/sitemap verification.
- Shopify product: `gid://shopify/Product/8934012289177`
  - Handle: `bongholeo-in-cuffs-tee`
  - Status: `DRAFT` (kept non-public while the final publication approval is blocked)
  - Price: `$39.99` on all 12 variants
  - Options: Size `S`–`3XL`; Color `Black`, `White`
  - Collection: only `gid://shopify/Collection/357236211865` (`bongholeo`)
  - Shopify Online Store publication: not published; `onlineStoreUrl` is `null`
  - Flylyfe Headless publication `gid://shopify/Publication/191515984025`: staged while the product remains `DRAFT`; not yet public
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
- Approved black-garment smoke production master — `gid://shopify/MediaImage/37265754063001`
  - `https://cdn.shopify.com/s/files/1/0727/1153/6793/files/bongholeo-in-cuffs-print-black-smoke-12.67x19-300dpi.png?v=1787701715`
- White-garment production master — `gid://shopify/MediaImage/37265292361881`
  - `https://cdn.shopify.com/s/files/1/0727/1153/6793/files/bongholeo-in-cuffs-print-white-12.67x19-300dpi.png?v=1787696705`

The two production masters are not attached to the customer-facing Shopify product media.

## Rollback

1. Set Shopify product `gid://shopify/Product/8934012289177` to `DRAFT`.
2. Remove it from the `bongholeo` collection if an entirely clean admin rollback is required. Do not delete it; keeping the product preserves variant IDs and Apliiq SKUs.
3. Do not publish it to either Shopify publication. If it was later published, unpublish only this product from the affected publication.
4. Revert the site commit that introduces `/products/bongholeo-in-cuffs-tee`, the four local WebP files, the Merch entry, schema, and sitemap entry.
5. Leave Apliiq designs `6046092` and `6046093` in place unless the account owner explicitly requests archival; existing product/SKU mappings must never be repointed.

## Final release gate

The user explicitly approved the existing catalog named **Flylyfe Headless** (`gid://shopify/Publication/191515984025`), and that publication is now staged. Shopify also keeps an Online Store publication staged because the product belongs to the published Bongholeo collection. The API safety layer blocks programmatic removal of that Online Store publication.

Before activation, open this product in Shopify Admin and use **Publishing → Manage** to leave **Flylyfe Headless** selected and deselect **Online Store**, then save. Confirm only Flylyfe Headless remains selected. The product can then be set to `ACTIVE`, after which verification must show the Headless publication as `isPublished: true`, no Online Store publication, and `onlineStoreUrl: null`. Only then deploy and test bongholeo.com.

Shopify automatically staged the product for the Online Store when the draft was created. A brief activation turned that staged entry public, so the product was immediately returned to `DRAFT`; verification then showed `onlineStoreUrl: null` and `isPublished: false`. Do not activate it again until Headless publication and Online Store exclusion can be performed as one controlled release.
