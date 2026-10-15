// Product photos (each gallery and imagesByColor entry in facts.js) are
// 1024 px wide. `npm run merch-sizes` makes 320 px and 640 px copies next to
// them, so thumbnails and small cards no longer download the full photo.
// scripts/build-shell.mjs fails the build if a copy is missing.
export const MERCH_WIDTHS = [320, 640]
export const ORIGINAL_WIDTH = 1024

export const resized = (src, width) => src.replace(/\.webp$/, `-${width}w.webp`)

export const srcSetFor = (src) =>
  [...MERCH_WIDTHS.map((width) => `${resized(src, width)} ${width}w`), `${src} ${ORIGINAL_WIDTH}w`].join(', ')

// Every local photo that is served at several sizes.
export const sizedImages = (products) => [...new Set(products.flatMap((product) => [
  ...(product.gallery || []).map((image) => image.src),
  ...Object.values(product.imagesByColor || {}),
]))]

// The product page's main photo and the static shell's photo share these
// sizes, so the browser picks the same file for both and downloads it once.
export const MAIN_SIZES = '(max-width: 820px) 88vw, 46vw'
export const THUMB_SIZES = '(max-width: 820px) 22vw, 11vw'
export const CARD_SIZES = '(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw'
