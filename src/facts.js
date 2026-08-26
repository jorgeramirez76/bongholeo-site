import { features } from './product-flags.js'
import { inCuffsHoodieProduct } from './pending-products.js'

// Single source of truth for every fact the site states.
//
// React (App.jsx) renders from here, and scripts/build-shell.mjs generates the
// crawler-visible static block, the JSON-LD graph and public/llms.txt from the
// same objects at build time. Nothing about the site's content is stated twice
// by hand — edit here and `npm run build` propagates it everywhere.
//
// Rules for editing:
//   • Every date is the real, verified date. Video dates are YouTube upload
//     dates; meeting dates are only used where a published source confirms them.
//   • Press entries must actually name Bongholeo or Mike Vintzileos.
//   • Bong/420 flavour belongs in visible human copy only — never in `seo`,
//     never in a product title, never in schema keywords.

export const site = {
  url: 'https://bongholeo.com',
  name: 'Bongholeo',
  email: 'admin@bongholeo.com',
  instagram: 'https://www.instagram.com/bongholeo/',
  youtube: 'https://www.youtube.com/@Bongholeo420',
  youtubeChannel: 'https://www.youtube.com/channel/UCMEhjgjJbD27K7ZSQwKnkzg',
  wikidata: 'https://www.wikidata.org/wiki/Q140528260',
}

// Title + description are the two surfaces the positioning rule keeps civic.
export const seo = {
  title: 'Bongholeo — Official Site | NJ Civic Satire, As Seen on TMZ & Kimmel',
  description:
    "Official site of Bongholeo — Mike Vintzileos' New Jersey civic-satire project, featured on TMZ, Jimmy Kimmel and USA Today. The Cranford council video, the public record, press and merch.",
  ogTitle: 'Bongholeo — the Social Justice Waterpipe',
  ogDescription:
    'Civic satire at New Jersey town-council meetings. Watch the Cranford performance covered by TMZ, Jimmy Kimmel and USA Today, follow the public record, and shop the official crest.',
}

export const person = {
  name: 'Mike Vintzileos',
  alternateName: ['Bongholeo', 'Bong Holeo', 'Bongholio', 'Bonholio', 'Social Justice Waterpipe'],
  disambiguatingDescription:
    'New Jersey satirist and performance artist known for the civic-satire persona Bongholeo, the Social Justice Waterpipe.',
  description:
    "New Jersey satirist, performance artist, and free-speech / civic activist. As the persona Bongholeo — the Social Justice Waterpipe — he delivers satirical public comment at town-council meetings to advocate for local government accountability and the public's right to be heard. Featured on TMZ, Jimmy Kimmel, USA Today, NJ.com, Stereogum, NJ 101.5 and News 12 New Jersey.",
}

// Verified 2026-08-19 from the channel's own about page.
export const stats = {
  outlets: 6,
  subscribers: 6700,
  videos: 200,
}

// Record grid. `uploadDate` is the real YouTube upload timestamp — verified
// 2026-08-19 via each watch page's datePublished.
export const videos = [
  {
    id: 'l1uSHa7NeiE',
    label: 'CRANFORD, NJ · THE VIRAL PERFORMANCE',
    title: 'The performance that went national.',
    copy: '"I\'M A BIG DAMN BONG!" — the Cranford appearance featured on TMZ, Jimmy Kimmel, USA Today and outlets across the country.',
    image: '/media/bongholeo-hero.webp',
    source: 'FEATURED ON TMZ & KIMMEL',
    uploadDate: '2026-07-11T08:02:28-07:00',
    schemaName: '"I\'m a Big Damn Bong!" — Bongholeo\'s Cranford, NJ council meeting performance',
    schemaDescription:
      'Bongholeo delivers public comment at the Cranford Township Committee meeting of July 7, 2026, performing a parody in a giant purple bong costume. The clip was covered by TMZ, USA Today, Stereogum, NJ 101.5 and News 12 New Jersey.',
  },
  {
    id: 'DyoEMgCqJrQ',
    label: 'JACKSON, NJ · JULY 28, 2026',
    title: 'Taking the mayor at his word.',
    copy: 'The most-watched tape of the summer — a song performance aimed at the Jackson Township mayor, in front of a packed council chamber.',
    image: '/media/jackson-mayor.webp',
    source: 'SOCIAL JUSTICE WATERPIPE',
    uploadDate: '2026-07-30T18:10:26-07:00',
    schemaName: 'Mocking & Trolling Mayor of Jackson, NJ',
    schemaDescription:
      'A song performance directed at the mayor of Jackson Township, New Jersey, at the council meeting of July 28, 2026. Published July 30, 2026 on the Social Justice Waterpipe channel.',
  },
  {
    id: 'ho6Mg-hGlb8',
    label: 'CRANFORD, NJ · DECEMBER 2025',
    title: 'Police swarm the council meeting.',
    copy: 'An earlier Cranford meeting, seven months before the video that went national. The room was already full of officers.',
    image: '/media/cranford-action.webp',
    source: 'FIELD TAPE',
    uploadDate: '2025-12-22T12:03:08-08:00',
    schemaName: 'Cranford, NJ Police Swarm Council Meeting!',
    schemaDescription:
      'Footage from a Cranford Township Committee meeting published December 22, 2025 on the Social Justice Waterpipe channel.',
  },
]

// Every entry verified to load and to name Bongholeo or Mike Vintzileos.
export const press = [
  {
    outlet: 'NJ.COM',
    title: 'Franklin Township residents confront officials over Flock camera surveillance',
    date: 'AUG 14, 2026',
    dateISO: '2026-08-14',
    href: 'https://www.nj.com/somerset/2026/08/nj-residents-push-back-on-camera-surveillance-program-we-can-police-without-stalking.html',
  },
  {
    outlet: 'NJ 101.5',
    title: 'Franklin Township Flock camera pushback: what\u2019s happening',
    date: 'AUG 18, 2026',
    dateISO: '2026-08-18',
    href: 'https://nj1015.com/flock-safety-cameras-franklin-township/',
  },
  {
    outlet: 'USA TODAY',
    title: 'Watch man in bong costume freestyle at New Jersey committee meeting',
    date: 'JUL 10, 2026',
    dateISO: '2026-07-10',
    href: 'https://www.usatoday.com/story/news/crime/2026/07/10/man-dressed-bong-costume-freestyle-committee-meeting-video-new-jersey/90875825007/',
  },
  {
    outlet: 'TMZ',
    title: 'Man Dressed As Bong Crashes New Jersey Township Committee Meeting',
    date: 'JUL 9, 2026',
    dateISO: '2026-07-09',
    href: 'https://www.tmz.com/2026/07/09/man-dressed-as-bong-interrupts-new-jersey-township-committee-meeting/',
  },
  {
    outlet: 'STEREOGUM',
    title: 'One Man Sings Lizzo While Dressed As A Bong',
    date: 'JUL 10, 2026',
    dateISO: '2026-07-10',
    href: 'https://stereogum.com/2504792/cranford-committee-meeting-one-man-sings-lizzo-while-dressed-as-a-bong-next-speaker-arrested-after-singing-morrissey/news',
  },
  {
    outlet: 'NJ 101.5',
    title: 'Giant purple bong disrupts local council meeting',
    date: 'JUL 10, 2026',
    dateISO: '2026-07-10',
    href: 'https://nj1015.com/bonholio-cranford-council-meeting/',
  },
  {
    outlet: 'NEWS 12',
    title: '"My name is Bong Holeo" — strange cast of characters disrupts Cranford meeting',
    date: 'JUL 8, 2026',
    dateISO: '2026-07-08',
    href: 'https://newjersey.news12.com/2026/07/08/my-name-is-bong-holeo-strange-cast-of-characters-disrupts-cranford-township-meeting/1hjpCCZjm7VEQTLGHjheE6',
  },
]

// The route. Every `date` is the DATE OF THE MEETING, taken from the source
// video's own description or from press coverage — never the YouTube upload
// date, which usually runs a few days later. Verified one by one 2026-08-19.
export const appearances = [
  {
    date: '2026-08-19',
    display: 'AUG 19, 2026',
    town: 'Kenilworth, NJ',
    what: 'Livestreamed from Kenilworth, where the $1.8 billion AI data center approved in 2025 is still being fought.',
    videoId: 'KYzuV_rERZA',
  },
  {
    date: '2026-08-11',
    display: 'AUG 11, 2026',
    town: 'Franklin Township, NJ (Somerset County)',
    what: 'Public comment against the township’s Flock Safety automated licence-plate-reader expansion, cut short when the mayor demanded personal details before he could continue. NJ.com and New Jersey 101.5 both covered the meeting and named him.',
    videoId: 'uiN44-Zc5x4',
  },
  {
    date: '2026-08-04',
    display: 'AUG 4, 2026',
    town: 'Parsippany, NJ',
    what: 'Recorded a police officer pacing outside the doorway while two women testified about government retaliation — and only during their testimony.',
    videoId: 'SC7fk0LOOcA',
  },
  {
    date: '2026-07-28',
    display: 'JUL 28, 2026',
    town: 'Jackson, NJ',
    what: 'First time in Jackson: a song performance aimed at Mayor Jennifer Kuhn in front of a packed council chamber. The most-watched tape of the summer.',
    videoId: 'DyoEMgCqJrQ',
  },
  {
    date: '2026-07-16',
    display: 'JUL 16, 2026',
    town: 'Roselle Park, NJ',
    what: 'Recorded the borough council meeting where a councilman was questioned by a resident over how his organisation had been described publicly.',
    videoId: '9ByAE33JZG8',
  },
  {
    date: '2026-07-07',
    display: 'JUL 7, 2026',
    town: 'Cranford, NJ',
    what: 'The Cranford Township Committee meeting that went national: public comment delivered in the purple costume, as a parody of Lizzo’s "About Damn Time." Covered by TMZ, USA Today, Stereogum, News 12 New Jersey and NJ 101.5.',
    videoId: 'l1uSHa7NeiE',
    highlight: true,
  },
  {
    date: '2026-07-01',
    display: 'JUL 1, 2026',
    town: 'Kenilworth, NJ',
    what: 'The mayor and council ended the meeting early in the middle of public comment on the $1.8 billion AI data center. Residents carried on outside the building.',
    videoId: 'WOxNeAan1A8',
  },
  {
    date: '2026-06-18',
    display: 'JUN 18, 2026',
    town: 'Roselle Park, NJ',
    what: 'Back at the borough council to question a councilwoman about a public post — and to document the borough attorney shutting down the back-and-forth that public comment used to allow.',
    videoId: 'zm-NEAV5Jj0',
  },
  {
    date: '2026-06-17',
    display: 'JUN 17, 2026',
    town: 'Kenilworth, NJ',
    what: 'Residents packed the borough council chamber over the AI data center and the council declined to hear them out. One resident took the floor with "The People’s Gavel."',
    videoId: 'xogCIKo3sgM',
  },
]

// Answer-shaped: each answer stands alone if an AI engine extracts it with no
// surrounding context. Town, date and outlet live inside the answer text.
export const faqs = [
  {
    q: 'Who is Bongholeo?',
    a: 'Bongholeo is the civic-satire persona of New Jersey activist Mike Vintzileos. Dressed as a giant purple bong, he delivers deadpan public comment at New Jersey town-council meetings to spotlight local government accountability and the public’s right to be heard. He also publishes the full meeting footage on his YouTube channel, Social Justice Waterpipe (@Bongholeo420).',
  },
  {
    q: 'Is Bongholeo real or satire?',
    a: 'It’s satire — a costumed performance-art persona, performed by a real person at real public meetings. The costume is absurd on purpose; the point underneath it is serious: residents deserve to be heard by the governments they pay for.',
  },
  {
    q: 'What is Bongholeo’s real name?',
    a: 'Mike Vintzileos, a New Jersey activist. Bongholeo — also written Bong Holeo, Bongholio or Bonholio — is the character he performs, also known as the Social Justice Waterpipe.',
  },
  {
    q: 'Where was the viral bong-costume council meeting?',
    a: 'The Cranford Township Committee meeting in Cranford, New Jersey, on July 7, 2026. He gave public comment in the costume as a parody of Lizzo’s "About Damn Time," opening by spelling his name for the record: "B-O-N-G-H-O-L-E-O." The clip was covered by TMZ, USA Today, Stereogum, News 12 New Jersey and NJ 101.5, and aired on Jimmy Kimmel Live.',
  },
  {
    q: 'Was Bongholeo arrested at the Cranford meeting?',
    a: 'No — not at that meeting. At the Cranford Township Committee meeting on July 7, 2026, Bongholeo finished his public comment and left the podium. A different speaker at that same meeting, William Thilly, was arrested and charged; those charges are separate from Bongholeo and are allegations that had not been adjudicated at the time of reporting.',
  },
  {
    q: 'What does Bongholeo actually campaign for?',
    a: 'Public-comment rights and local government accountability. Recurring subjects include the rules towns use to limit residents at the microphone — time limits, prop bans and mid-comment shutdowns — plus specific local fights: the Flock Safety automated license-plate-reader contract in Franklin Township, Somerset County, and the $1.8 billion AI data center in Kenilworth.',
  },
  {
    q: 'Where has Bongholeo appeared recently?',
    a: 'Between June and August 2026 he gave public comment in Kenilworth, Roselle Park, Cranford, Jackson, Parsippany and Franklin Township in Somerset County. NJ.com and New Jersey 101.5 both covered the Franklin Township Flock-camera meeting of August 11, 2026 and named him. The full route, with the date of every meeting, is on this site, and every tape is on the Social Justice Waterpipe channel.',
  },
  {
    q: 'How do I invite Bongholeo to my town’s meeting?',
    a: 'Email admin@bongholeo.com with the town, the meeting date and what the issue is. Press enquiries and bookings go to the same address.',
  },
  {
    q: 'Where can I watch the clips?',
    a: 'On the Social Justice Waterpipe YouTube channel (@Bongholeo420), which has roughly 200 videos of New Jersey public meetings, and here at bongholeo.com, where the latest uploads appear automatically.',
  },
  {
    q: 'Where can I buy Bongholeo merch?',
    a: 'Official Bongholeo merch — including the "Gavels The Truth" crest tee, the "In Cuffs" illustrated tee, and the heavyweight hoodie — is sold on this site at bongholeo.com, printed to order and checked out through Shopify.',
  },
]

// Mirrors the Bongholeo-scoped Shopify collection. Product handles are the
// stable join between this facts layer and the live Storefront API response.
export const products = [
  {
    handle: 'bongholeo-gavels-the-truth-tee',
    tag: 'THE FIRST DROP',
    name: 'Gavels The Truth Tee',
    description:
      "Heavyweight ring-spun cotton tee with the full Bongholeo 'Gavels The Truth' crest, front-printed 11 inches wide.",
    image: '/media/merch/gavels-tee-lifestyle.webp',
    price: '39.99',
  },
  {
    handle: 'bongholeo-gavels-the-truth-hoodie',
    tag: 'THE HEAVYWEIGHT',
    name: 'Gavels The Truth Hoodie',
    description: "Premium black fleece hoodie with the Bongholeo 'Gavels The Truth' crest.",
    image: '/media/merch/gavels-hoodie.webp',
    price: '59.99',
  },
  {
    handle: 'bongholeo-in-cuffs-tee',
    tag: 'NEW RELEASE',
    route: '/products/bongholeo-in-cuffs-tee',
    name: 'Bongholeo In Cuffs Tee',
    description:
      'Bella+Canvas ring-spun cotton tee with the illustrated Bongholeo In Cuffs scene in a jumbo full-color front print, scaled appropriately for each garment size.',
    image: '/media/merch/bongholeo-in-cuffs-black-male.webp',
    imagesByColor: {
      Black: '/media/merch/bongholeo-in-cuffs-black-male.webp',
      White: '/media/merch/bongholeo-in-cuffs-white-male.webp',
    },
    gallery: [
      { src: '/media/merch/bongholeo-in-cuffs-black-male.webp', alt: 'Dark-blond male model wearing the black Bongholeo In Cuffs tee' },
      { src: '/media/merch/bongholeo-in-cuffs-black-female.webp', alt: 'Blonde female model wearing the black Bongholeo In Cuffs tee' },
      { src: '/media/merch/bongholeo-in-cuffs-white-male.webp', alt: 'Dark-blond male model wearing the white Bongholeo In Cuffs tee' },
      { src: '/media/merch/bongholeo-in-cuffs-white-female.webp', alt: 'Blonde female model wearing the white Bongholeo In Cuffs tee' },
    ],
    price: '39.99',
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    defaultSelection: { Size: 'M', Color: 'Black' },
    page: {
      kicker: 'BONGHOLEO · NEW RELEASE',
      title: 'Bongholeo',
      emphasis: 'In Cuffs Tee.',
      lead: 'An illustrated Bongholeo scene built for the public record: the purple waterpipe, the baby seat, the cuffs, and the officers—printed oversized across the front.',
      features: [
        'Bella+Canvas 3001 unisex retail-fit tee',
        'Soft ring-spun cotton',
        'Jumbo full-color front transfer, scaled for garment size',
        'Printed to order in the USA',
      ],
      storyLabel: 'THE ARTWORK',
      storyTitle: 'Satire under',
      storyEmphasis: 'custody.',
      story: 'The illustration is fictional civic satire; it does not claim Bongholeo was arrested at the July 7, 2026 Cranford meeting. He was not.',
    },
    lastmod: '2026-08-25',
  },
  ...(features.inCuffsHoodie ? [inCuffsHoodieProduct] : []),
]
