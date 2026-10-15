# bongholeo.com

The official Bongholeo site: a Vite + React storefront and public-record page. Merch checkout is handed to the Flylyfe Shopify store through the Storefront API; this site holds no payment or personal data.

## Deploying

- Production deploys **only by pushing to `main`** on GitHub. The Vercel project `bongholeo-site` builds and deploys every push to `main`.
- Never run `vercel --prod` from a local folder. A local copy can be behind `main` and would ship old pages.
- To undo a bad deploy at once: Vercel → `bongholeo-site` → Deployments → Instant Rollback to the previous production deployment. After an Instant Rollback, new pushes to `main` do not go live until you undo the rollback (or promote a newer deployment) in Vercel. To undo a change in the code instead: `git revert <commit>` and push to `main`. Never reset or force-push `main`.

## Where things live

- `src/facts.js` is the single source of truth for everything the site states (videos, press, appearances, FAQs, products). `src/pending-products.js` holds the In Cuffs hoodie facts, switched on by `src/product-flags.js`.
- `scripts/build-shell.mjs` runs before every build and generates the crawler HTML, JSON-LD, product-page offers, `public/llms.txt`, `public/sitemap.xml`, `public/shipping-returns.html` and `src/merch-sized.js` from those facts. Edit facts, not the generated output.
- `src/merch-policy.js` holds the shipping and returns policy and the seller-of-record line (Flylyfe).
- `src/shop.js` talks to Shopify from the browser through `src/storefront.js`, which cuts off a read that hangs for 8 seconds so it is retried (`src/retry.js`) instead of loading forever; `src/shop-config.js` holds the API version and the 15%-off code.
- `src/attribution.js` records where a visit came from (UTM tags, referring site, landing page) and `src/shop.js` sends it with the cart, so Shopify shows each order's source under Additional details. Tag links you post, for example `https://bongholeo.com/?utm_source=instagram&utm_medium=bio`.
- `api/videos.js` serves the "Latest from the channel" list from YouTube's RSS feed. When the feed fails it serves the newest taped appearances from `facts.js` (see `src/latest-videos.js`) and does not cache that answer.
- `api/cron/shop-health.js` runs daily (see `crons` in `vercel.json`) and checks that Shopify still sells what `facts.js` advertises, at the advertised price, with the discount working.
- `IN_CUFFS_*` files are the release and rollback runbooks for the In Cuffs tee and hoodie.

## Commands

```sh
npm ci            # install
npm run dev       # local dev server
npm run lint      # oxlint
npm test          # unit tests (node:test, no network; Node 21 or later)
npm run build     # build-shell, then the unit tests, then vite build into dist/
npm run indexnow  # after a deploy: ping IndexNow with every URL in public/sitemap.xml
npm run merch-sizes # after adding a product photo: make its 320/640 px copies (needs ffmpeg)
```

Run `npm run lint` and `npm run build` before pushing to `main`. Vercel's build runs the same `npm run build`, so a failing unit test stops the deploy and the live site stays as it was. The Vercel project uses Node 24.x; the test command's file pattern needs Node 21 or later.

## Environment variables (Vercel → bongholeo-site → Settings → Environment Variables)

- `VITE_SHOPIFY_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_TOKEN`, `VITE_SHOPIFY_COLLECTION`: the public Storefront API settings. Without them the shop shows "coming soon".
- `CRON_SECRET`: when set, only Vercel's scheduled call can run the daily shop check. It is also required for email alerts: without it the check still runs and logs, but never sends email, so nobody can use the URL to flood the inbox.
- `RESEND_API_KEY`, `RESEND_FROM`, `SHOP_HEALTH_ALERT_TO`: optional; when all three are set (and `CRON_SECRET` is), the daily shop check emails any problem it finds. Without them, problems show only in Vercel's logs and cron history.

## Adding product photos

Product photos live in `public/media/merch/` as 1024 × 1536 WebP files and are listed in a product's `gallery` / `imagesByColor` in `src/facts.js` (or `src/pending-products.js`). After adding one, run `npm run merch-sizes` (needs ffmpeg) and commit the `-320w` and `-640w` copies it makes. If you cannot run it, the site still builds and deploys: the build prints a warning and that photo is served full size (slower on phones) until the copies are added. `src/merch-sized.js` records which photos have their copies; the build rewrites it, so commit it when it changes.

## When Shopify changes

If a colour stops selling, a price changes, or a product leaves the `bongholeo` collection, update `src/facts.js` (or `soldOutColors` in `src/pending-products.js`) in the same change, then push to `main`. The daily shop check reports any mismatch it finds.
