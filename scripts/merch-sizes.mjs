// Makes the 320 px and 640 px copies of every product photo listed in
// src/facts.js (see src/merch-images.js). Run it after adding a photo, then
// commit the new files:
//   npm run merch-sizes
// Needs ffmpeg with libwebp on PATH. Copies that already exist are left alone.
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { products } from '../src/facts.js'
import { MERCH_WIDTHS, resized, sizedImages } from '../src/merch-images.js'

const publicDir = fileURLToPath(new URL('../public', import.meta.url))
let made = 0
for (const src of sizedImages(products)) {
  for (const width of MERCH_WIDTHS) {
    const out = publicDir + resized(src, width)
    if (existsSync(out)) continue
    const run = spawnSync('ffmpeg', [
      '-loglevel', 'error', '-i', publicDir + src,
      '-vf', `scale=${width}:-2`, '-c:v', 'libwebp', '-quality', '80', '-compression_level', '6',
      '-map_metadata', '-1', out,
    ], { stdio: 'inherit' })
    if (run.error) throw new Error(`could not run ffmpeg (${run.error.message}); install ffmpeg and try again`)
    if (run.status !== 0) throw new Error(`ffmpeg failed for ${src} at ${width} px`)
    made += 1
    console.log(`made ${resized(src, width)}`)
  }
}
console.log(`merch-sizes: ${made} new file(s)`)
