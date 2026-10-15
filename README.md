# bongholeo.com

The official Bongholeo site: a Vite + React storefront and public-record page. Merch checkout is handed to the Flylyfe Shopify store through the Storefront API; this site holds no payment or personal data.

## Deploying

- Production deploys **only by pushing to `main`** on GitHub. The Vercel project `bongholeo-site` builds and deploys every push to `main`.
- Never run `vercel --prod` from a local folder. A local copy can be behind `main` and would ship old pages.
- To undo a bad deploy at once: Vercel → `bongholeo-site` → Deployments → Instant Rollback to the previous production deployment. After an Instant Rollback, new pushes to `main` do not go live until you undo the rollback (or promote a newer deployment) in Vercel. To undo a change in the code instead: `git revert <commit>` and push to `main`. Never reset or force-push `main`.

## Where things live

- `src/facts.js` is the single source of truth for everything the site states (videos, press, appearances, FAQs, products). `src/pending-products.js` holds the In Cuffs hoodie facts, switched on by `src/product-flags.js`.
- `scripts/build-shell.mjs` runs before every build and generates the crawler HTML, JSON-LD, product-page offers, `public/llms.txt`, `public/sitemap.xml` and `public/shipping-returns.html` from those facts. Edit facts, not the generated output.
- `src/merch-policy.js` holds the shipping and returns policy and the seller-of-record line (Flylyfe).
- `src/shop.js` talks to Shopify from the browser; `src/shop-config.js` holds the API version and the 15%-off code.
- `api/videos.js` serves the "Latest from the channel" list from YouTube's RSS feed.
- `api/cron/shop-health.js` runs daily (see `crons` in `vercel.json`) and checks that Shopify still sells what `facts.js` advertises, at the advertised price, with the discount working.
- `IN_CUFFS_*` files are the release and rollback runbooks for the In Cuffs tee and hoodie.

## Commands

```sh
npm ci            # install
npm run dev       # local dev server
npm run lint      # oxlint
npm test          # unit tests (node:test, no network)
npm run build     # build-shell + vite build into dist/
npm run indexnow  # after a deploy: ping IndexNow with every URL in public/sitemap.xml
```

Run `npm run lint`, `npm test` and `npm run build` before pushing to `main`.

## Environment variables (Vercel → bongholeo-site → Settings → Environment Variables)

- `VITE_SHOPIFY_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_TOKEN`, `VITE_SHOPIFY_COLLECTION`: the public Storefront API settings. Without them the shop shows "coming soon".
- `CRON_SECRET`: when set, only Vercel's scheduled call can run the daily shop check.
- `RESEND_API_KEY`, `RESEND_FROM`, `SHOP_HEALTH_ALERT_TO`: optional; when all three are set, the daily shop check emails any problem it finds. Without them, problems show only in Vercel's logs and cron history.

## When Shopify changes

If a colour stops selling, a price changes, or a product leaves the `bongholeo` collection, update `src/facts.js` (or `soldOutColors` in `src/pending-products.js`) in the same change, then push to `main`. The daily shop check reports any mismatch it finds.
