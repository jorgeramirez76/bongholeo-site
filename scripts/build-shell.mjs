// Generates every crawler-facing surface from src/facts.js so nothing is
// stated twice by hand: the <title>/meta block, the JSON-LD graph, the static
// pre-hydration HTML inside #root, public/llms.txt and public/sitemap.xml.
//
// Runs before `vite build` (see package.json). Idempotent: running it twice with
// unchanged facts produces byte-identical files.

import { readFileSync, writeFileSync } from 'node:fs'
import { site, seo, person, stats, videos, press, appearances, faqs, products } from '../src/facts.js'

const root = new URL('../', import.meta.url)
const file = (p) => new URL(p, root)
const today = new Date().toISOString().slice(0, 10)
// The event page is a fixed historical account; bump this only when it is edited.
const cranfordUpdated = '2026-08-19'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const between = (src, tag, body) => {
  const start = src.indexOf(`<!-- ${tag}:START`)
  const end = src.indexOf(`<!-- ${tag}:END -->`)
  if (start < 0 || end < 0) throw new Error(`missing ${tag} markers`)
  const startEnd = src.indexOf('-->', start) + 3
  return src.slice(0, startEnd) + '\n' + body + '\n      ' + src.slice(end)
}

/* ---------------------------------------------------------------- head ---- */

const head = `    <title>${esc(seo.title)}</title>
    <meta name="description" content="${esc(seo.description)}" />

    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Bongholeo" />
    <meta property="og:title" content="${esc(seo.ogTitle)}" />
    <meta property="og:description" content="${esc(seo.ogDescription)}" />
    <meta property="og:url" content="${site.url}/" />
    <meta property="og:image" content="${site.url}/media/bongholeo-hero.webp" />
    <meta property="og:image:width" content="1920" />
    <meta property="og:image:height" content="1080" />
    <meta property="og:image:alt" content="Bongholeo addressing the Cranford Township Committee" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(seo.ogTitle)}" />
    <meta name="twitter:description" content="${esc(seo.ogDescription)}" />
    <meta name="twitter:image" content="${site.url}/media/bongholeo-hero.webp" />`

/* -------------------------------------------------------------- json-ld ---- */

const graph = [
  {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: `${site.url}/`,
    name: 'Bongholeo',
    alternateName: ['Social Justice Waterpipe', 'Bong Holeo'],
    description:
      'Civic satire and public-comment footage focused on local New Jersey government accountability.',
    publisher: { '@id': `${site.url}/#person` },
    inLanguage: 'en-US',
  },
  {
    '@type': 'ProfilePage',
    '@id': `${site.url}/#profile`,
    url: `${site.url}/`,
    name: 'Bongholeo — Local Government Works for the People',
    isPartOf: { '@id': `${site.url}/#website` },
    mainEntity: { '@id': `${site.url}/#person` },
    // Omit this optional DateTime until an actual profile-edit timestamp is
    // recorded. A build-day date is neither a DateTime nor a profile update.
  },
  {
    '@type': 'Person',
    '@id': `${site.url}/#person`,
    name: person.name,
    url: `${site.url}/`,
    alternateName: person.alternateName,
    disambiguatingDescription: person.disambiguatingDescription,
    description: person.description,
    image: `${site.url}/media/bongholeo-hero.webp`,
    email: site.email,
    contactPoint: { '@type': 'ContactPoint', contactType: 'Press and bookings', email: site.email },
    subjectOf: press.map((p) => ({
      '@type': 'NewsArticle',
      headline: p.title,
      url: p.href,
      datePublished: p.dateISO,
      publisher: { '@type': 'Organization', name: p.outlet },
    })),
    sameAs: [site.instagram, site.youtubeChannel, site.youtube, site.wikidata],
  },
  ...videos.map((v, i) => ({
    '@type': 'VideoObject',
    '@id': `${site.url}/#video-${i + 1}`,
    name: v.schemaName,
    description: v.schemaDescription,
    thumbnailUrl: `${site.url}${v.image}`,
    uploadDate: v.uploadDate,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    publisher: { '@id': `${site.url}/#person` },
  })),
  {
    '@type': 'ItemList',
    '@id': `${site.url}/#merch`,
    name: 'Official Bongholeo Merch',
    url: `${site.url}/#shop`,
    itemListElement: products.map((p, i) => ({
      '@type': 'Product',
      position: i + 1,
      // Every Product needs its own entity ID. Reusing #shop causes JSON-LD
      // processors to merge separate products and report duplicate fields.
      '@id': `${site.url}${p.route || `/#product-${p.handle}`}`,
      name: p.name,
      description: p.description,
      image: `${site.url}${p.image}`,
      brand: { '@type': 'Brand', name: 'Bongholeo' },
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${site.url}${p.route || `/#shop`}`,
      },
    })),
  },
  {
    '@type': 'FAQPage',
    '@id': `${site.url}/#faq`,
    isPartOf: { '@id': `${site.url}/#website` },
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
]

const productIds = graph
  .flatMap((node) => node['@type'] === 'ItemList' ? node.itemListElement : [])
  .map((product) => product['@id'])

if (new Set(productIds).size !== productIds.length) {
  throw new Error('Merchant schema contains duplicate Product @id values')
}

const ld = `    <script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
  .split('\n')
  .map((l) => '      ' + l)
  .join('\n')}
    </script>`

/* --------------------------------------------------------- static shell ---- */
// What non-rendering crawlers (GPTBot, PerplexityBot, ClaudeBot) actually read.
// React replaces it on mount, so it must carry the same facts the app renders.

const link = (href, text) => `<a href="${esc(href)}" style="color:#e6c887">${esc(text)}</a>`
const h2 = (t) => `      <h2 style="font-size:20px;margin:34px 0 12px">${esc(t)}</h2>`

const staticBlock = [
  `      <h1 style="font-size:30px;line-height:1.15;margin:0 0 18px">Bongholeo — the Social Justice Waterpipe</h1>`,
  `      <p><strong>Bongholeo</strong>, also called the <strong>Social Justice Waterpipe</strong>, is the civic-satire persona of New Jersey activist <strong>Mike Vintzileos</strong>, who delivers deadpan public comment at town-council meetings dressed in a giant purple bong costume. His July 7, 2026 appearance before the Cranford Township Committee — a parody of Lizzo's "About Damn Time" — was covered by TMZ, USA Today, Stereogum, News 12 New Jersey and NJ 101.5, and aired on Jimmy Kimmel Live.</p>`,
  `      <p>Local government exists to serve the people who live in the community. Bongholeo uses satire and the public record to ask whether New Jersey towns are serving residents, or the private interests that profit from public decisions. The costume is absurd; the principle is not.</p>`,
  `      <p>${link(`https://www.youtube.com/watch?v=${videos[0].id}`, 'Watch the viral video')} · ${link('/#shop', 'Shop the merch')} · ${link(site.instagram, '@bongholeo on Instagram')} · ${link(site.youtube, 'Social Justice Waterpipe on YouTube')}</p>`,
  `      <p>The meeting that went national has its own page: ${link('/cranford-july-7-2026', 'The Cranford council meeting, July 7 2026')} — what happened, who was arrested (not Bongholeo), and every outlet that covered it.</p>`,
  h2('The route — recent appearances'),
  '      <ul>',
  ...appearances.map(
    (a) =>
      `        <li><strong>${esc(a.town)} — ${esc(a.display)}.</strong> ${esc(a.what)}${a.videoId ? ` ${link(`https://www.youtube.com/watch?v=${a.videoId}`, 'Footage')}` : ''}</li>`
  ),
  '      </ul>',
  `      <p>Roughly ${stats.videos} meeting tapes are published on the Social Justice Waterpipe channel, which has about ${stats.subscribers.toLocaleString('en-US')} subscribers.</p>`,
  h2('Common questions'),
  ...faqs.flatMap((f) => [
    `      <h3 style="font-size:16px;margin:20px 0 4px">${esc(f.q)}</h3>`,
    `      <p>${esc(f.a)}</p>`,
  ]),
  h2('Press coverage'),
  '      <ul>',
  ...press.map(
    (p) => `        <li>${link(p.href, `${p.outlet} — ${p.title}`)} (${esc(p.date)})</li>`
  ),
  '      </ul>',
  h2('Official merch'),
  '      <ul>',
  ...products.map((p) => `        <li>${esc(p.name)} — $${esc(p.price)}</li>`),
  '      </ul>',
  `      <p>Press, bookings and public-comment invitations: ${link(`mailto:${site.email}`, site.email)}</p>`,
].join('\n')

/* ------------------------------------------------------------- llms.txt ---- */

const llms = `# Bongholeo

> ${person.disambiguatingDescription} Dressed as a giant purple bong, he uses public comment, performance, and official meeting footage to advocate for local government accountability and the public's right to be heard.

## Core purpose

Local government exists to serve and represent community residents. Bongholeo calls attention to public decisions that appear to favor developers, campaign contributors, or private entities over the people who bear the consequences. The costume is absurd; the principle is not: the public deserves to be heard, represented, and served.

## Quick facts

- Persona: Bongholeo, "the Social Justice Waterpipe" (real name Mike Vintzileos)
- Also written: Bong Holeo, Bongholio, Bonholio
- Also known as: the Social Justice Waterpipe (the name of his YouTube channel)
- Sidekick: baby "Bongholito"
- Base: New Jersey. 2026 appearances include Kenilworth, Roselle Park, Cranford, Jackson, Parsippany and Franklin Township (Somerset County)
- Known for: the July 7, 2026 Cranford Township Committee appearance — a parody of Lizzo's "About Damn Time" performed in a giant purple bong costume — covered by national press
- Recurring subjects: public-comment rights, Flock Safety automated license-plate readers in Franklin Township, and the $1.8 billion AI data center in Kenilworth
- Channel: Social Justice Waterpipe (@Bongholeo420) — about ${stats.videos} videos, ~${stats.subscribers.toLocaleString('en-US')} subscribers
- Contact, press & bookings: ${site.email}
- Last updated: ${today}

## Primary sources

- [Official website](${site.url}/): mission, the public record, the appearance route, press and merch
- [The Cranford council meeting, July 7 2026](${site.url}/cranford-july-7-2026): the full account of the meeting that went national, including who was arrested and who was not
- [YouTube — Social Justice Waterpipe](${site.youtube})
- [Instagram — @bongholeo](${site.instagram})
- [Wikidata — ${person.name}](${site.wikidata})

## Recent appearances

${appearances.map((a) => `- ${a.display} — ${a.town}. ${a.what}${a.videoId ? ` https://www.youtube.com/watch?v=${a.videoId}` : ''}`).join('\n')}

## Press coverage

${press.map((p) => `- [${p.outlet} — ${p.title}](${p.href}) (${p.date})`).join('\n')}

## Questions and answers

${faqs.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}

## Merch

${products.map((p) => `- ${p.name} — $${p.price}, printed to order, sold at ${site.url}/#shop`).join('\n')}

## Corrections

- Bongholeo was not arrested at the July 7, 2026 Cranford Township Committee meeting. A different speaker at that meeting, William Thilly, was arrested and charged; those charges are separate from Bongholeo and are allegations.
- Bongholeo is a persona performed by Mike Vintzileos. Both names refer to the same person.
`

/* -------------------------------------------------------------- sitemap ---- */

const newestHome = [appearances[0]?.date, press[0]?.dateISO].filter(Boolean).sort().pop() || today

const urls = [
  { loc: `${site.url}/`, lastmod: newestHome, priority: '1.0', changefreq: 'weekly' },
  { loc: `${site.url}/cranford-july-7-2026`, lastmod: cranfordUpdated, priority: '0.8', changefreq: 'monthly' },
  ...products.filter((p) => p.route).map((p) => ({ loc: `${site.url}${p.route}`, lastmod: p.lastmod || today, priority: '0.8', changefreq: 'monthly' })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`

/* ----------------------------------------------------------------- write --- */

let html = readFileSync(file('index.html'), 'utf8')
html = between(html, 'SEO', head)
html = between(html, 'LDJSON', ld)
html = between(html, 'STATIC', staticBlock)
writeFileSync(file('index.html'), html)

// The event page shares the same generated head fragments where it can.
writeFileSync(file('public/llms.txt'), llms)
writeFileSync(file('public/sitemap.xml'), sitemap)

// Product facts must be available in the initial document as well as after
// React loads. Use the same facts as ProductPage; checkout still gets live
// prices and available variants from Shopify.
for (const product of products.filter((p) => p.route && p.page)) {
  const url = `${site.url}${product.route}`
  const related = products.filter((p) => p.route && p.route !== product.route)
  const shell = `<div id="root">
      <main style="background:#f3ead4;color:#111;min-height:100vh;padding:56px 7vw;font-family:Arial,sans-serif;max-width:1100px;margin:auto">
        <nav aria-label="Breadcrumb"><a href="/">Bongholeo</a> / <a href="/#shop">Official merch</a> / ${esc(product.name)}</nav>
        <h1>${esc(product.name)}</h1>
        <p>${esc(product.page.lead)}</p>
        <img src="${esc(product.gallery[0].src)}" alt="${esc(product.gallery[0].alt)}" width="1024" height="1536" style="max-width:340px;width:100%;height:auto" />
        <p>$${esc(product.price)} USD. Select a size and color for live availability and checkout.</p>
        <h2>Product details</h2>
        <ul>${product.page.features.map((feature) => `<li>${esc(feature)}</li>`).join('')}</ul>
        <p>Colors: ${product.colors.map(esc).join(', ')}. Sizes: ${product.sizes.map(esc).join(', ')}.</p>
        <h2>${esc(product.page.storyTitle)} ${esc(product.page.storyEmphasis)}</h2>
        <p>${esc(product.page.story)}</p>
        <p>Secure Shopify checkout · produced and fulfilled through Apliiq.</p>
        <h2>More official Bongholeo merch</h2>
        <ul>${related.map((p) => `<li><a href="${esc(p.route)}">${esc(p.name)}</a></li>`).join('')}</ul>
        <p><a href="/#shop">All official Bongholeo merch</a></p>
      </main>
    </div>`
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bongholeo', item: `${site.url}/` },
      { '@type': 'ListItem', position: 2, name: product.name, item: url },
    ],
  }
  const path = file(`${product.route.slice(1)}.html`)
  let source = readFileSync(path, 'utf8').replace(/<div id="root">[\s\S]*?<\/div>/, shell)
  source = source.replace(/\s*<script id="product-breadcrumbs" type="application\/ld\+json">[\s\S]*?<\/script>/, '')
  source = source.replace('</head>', `  <script id="product-breadcrumbs" type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>\n  </head>`)
  writeFileSync(path, source)
}

// Fail the build rather than ship an invalid graph.
JSON.parse(ld.slice(ld.indexOf('{'), ld.lastIndexOf('}') + 1))

const words = staticBlock.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
console.log(
  `build-shell: static block ${words} words · ${graph.length} schema nodes · ${appearances.length} appearances · ${press.length} press · ${faqs.length} FAQs · sitemap ${urls.length} URLs · ${today}`
)
