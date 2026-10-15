// Hoodie release facts. src/facts.js includes this product only while its
// source-controlled release flag is enabled.

// Every colour Shopify lists for the hoodie, and the ones it will not sell.
// Since 2026-09-09 all six Sport Grey variants are inventory-tracked at zero
// with overselling off, so Shopify refuses them (checked 2026-10-14). When
// Sport Grey sells again, empty soldOutColors and put it back in the meta
// description in products/bongholeo-in-cuffs-hoodie.html; if it is dropped
// for good, delete it from `colors` too.
const colors = ['Black', 'White', 'Sport Grey']
const soldOutColors = ['Sport Grey']
const onSale = colors.filter((color) => !soldOutColors.includes(color))
const colorList = onSale.length > 2 ? `${onSale.slice(0, -1).join(', ')}, and ${onSale.at(-1)}` : onSale.join(' and ')

export const inCuffsHoodieProduct = {
  handle: 'bongholeo-in-cuffs-hoodie',
  tag: 'NEW RELEASE',
  route: '/products/bongholeo-in-cuffs-hoodie',
  name: 'Bongholeo In Cuffs Hoodie',
  description:
    `Gildan 18500 Heavy Blend pullover hoodie with the illustrated Bongholeo In Cuffs scene in a full-color front transfer, available in ${colorList}.`,
  image: '/media/merch/bongholeo-in-cuffs-hoodie-black-male.webp',
  imagesByColor: {
    Black: '/media/merch/bongholeo-in-cuffs-hoodie-black-male.webp',
  },
  gallery: [
    { src: '/media/merch/bongholeo-in-cuffs-hoodie-black-male.webp', alt: 'Dark-blond male model wearing the black Bongholeo In Cuffs hoodie' },
    { src: '/media/merch/bongholeo-in-cuffs-hoodie-black-female.webp', alt: 'Blonde female model wearing the black Bongholeo In Cuffs hoodie' },
  ],
  price: '59.99',
  colors,
  soldOutColors,
  sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  defaultSelection: { Size: 'M', Color: 'Black' },
  page: {
    kicker: 'BONGHOLEO · NEW RELEASE',
    title: 'Bongholeo',
    emphasis: 'In Cuffs Hoodie.',
    lead: 'The illustrated Bongholeo In Cuffs scene on a heavyweight fleece pullover, sized specifically for the hoodie front and its pouch-pocket clearance.',
    features: [
      'Gildan 18500 Heavy Blend unisex pullover hoodie',
      '8 oz 50/50 cotton-poly fleece',
      colorList,
      '7.25 × 10.88 inch full-color front transfer above the pouch pocket',
      'Printed to order in the USA',
    ],
    storyLabel: 'THE ARTWORK',
    storyTitle: 'Satire under',
    storyEmphasis: 'custody.',
    story: 'The illustration is fictional civic satire; it does not claim Bongholeo was arrested at the July 7, 2026 Cranford meeting. He was not.',
  },
  lastmod: '2026-10-14',
}
