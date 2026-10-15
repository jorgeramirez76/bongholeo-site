// Product photos (each gallery and imagesByColor entry in facts.js) are
// 1024 px wide. `npm run merch-sizes` makes 320 px and 640 px copies next to
// them, so thumbnails and small cards no longer download the full photo.
// scripts/build-shell.mjs records in src/merch-sized.js which photos have
// their copies. A photo without them is served full size (and the build warns)
// instead of breaking the page or the deploy.
import { sizedPhotos } from './merch-sized.js'

export const MERCH_WIDTHS = [320, 640]
export const ORIGINAL_WIDTH = 1024

export const resized = (src, width) => src.replace(/\.webp$/, `-${width}w.webp`)

// Every width of a photo. Pages use srcSetFor, which checks the copies exist.
export const allSizes = (src) =>
  [...MERCH_WIDTHS.map((width) => `${resized(src, width)} ${width}w`), `${src} ${ORIGINAL_WIDTH}w`].join(', ')

const withCopies = new Set(sizedPhotos)
// The photo's srcset, or undefined (the full photo only) until its copies exist.
export const srcSetFor = (src) => (withCopies.has(src) ? allSizes(src) : undefined)
// The smallest copy for a thumbnail, or the full photo until its copies exist.
export const thumbFor = (src) => (withCopies.has(src) ? resized(src, MERCH_WIDTHS[0]) : src)

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
