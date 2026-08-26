// Staged release facts. This module is intentionally unreferenced while the
// hoodie awaits verified Apliiq/Shopify records and Headless-only publication.
// At launch, add this object to the active products list only after every
// release gate in IN_CUFFS_HOODIE_PREFLIGHT.md passes.
export const inCuffsHoodieProduct = {
  handle: 'bongholeo-in-cuffs-hoodie',
  tag: 'NEXT RELEASE',
  route: '/products/bongholeo-in-cuffs-hoodie',
  name: 'Bongholeo In Cuffs Hoodie',
  description:
    'Black Gildan 18500 Heavy Blend pullover hoodie with the illustrated Bongholeo In Cuffs scene in a full-color front transfer.',
  image: '/media/merch/bongholeo-in-cuffs-hoodie-black-male.webp',
  imagesByColor: {
    Black: '/media/merch/bongholeo-in-cuffs-hoodie-black-male.webp',
  },
  gallery: [
    { src: '/media/merch/bongholeo-in-cuffs-hoodie-black-male.webp', alt: 'Dark-blond male model wearing the black Bongholeo In Cuffs hoodie' },
    { src: '/media/merch/bongholeo-in-cuffs-hoodie-black-female.webp', alt: 'Blonde female model wearing the black Bongholeo In Cuffs hoodie' },
  ],
  price: '59.99',
  colors: ['Black'],
  sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  defaultSelection: { Size: 'M', Color: 'Black' },
  page: {
    kicker: 'BONGHOLEO · NEXT RELEASE',
    title: 'Bongholeo',
    emphasis: 'In Cuffs Hoodie.',
    lead: 'The illustrated Bongholeo In Cuffs scene on a black fleece pullover, resized specifically for the hoodie front and its pouch-pocket clearance.',
    features: [
      'Gildan 18500 Heavy Blend unisex pullover hoodie',
      '8 oz 50/50 cotton-poly fleece',
      'Full-color front transfer sized for the hoodie print area',
      'Printed to order in the USA',
    ],
    storyLabel: 'THE ARTWORK',
    storyTitle: 'Satire under',
    storyEmphasis: 'custody.',
    story: 'The illustration is fictional civic satire; it does not claim Bongholeo was arrested at the July 7, 2026 Cranford meeting. He was not.',
  },
}
