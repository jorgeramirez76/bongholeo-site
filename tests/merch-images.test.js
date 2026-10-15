import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MERCH_WIDTHS, resized, srcSetFor, thumbFor } from '../src/merch-images.js'
import { sizedPhotos } from '../src/merch-sized.js'

const publicDir = fileURLToPath(new URL('../public', import.meta.url))

test('a photo with its copies gets every width in srcset and a small thumbnail', () => {
  const src = sizedPhotos[0]
  assert.ok(src, 'the manifest lists at least one photo')
  assert.equal(srcSetFor(src), `${resized(src, 320)} 320w, ${resized(src, 640)} 640w, ${src} 1024w`)
  assert.equal(thumbFor(src), resized(src, 320))
})

test('a new photo without copies is served full size instead of a broken srcset', () => {
  const src = '/media/merch/bongholeo-in-cuffs-hoodie-white-male.webp'
  assert.ok(!sizedPhotos.includes(src))
  assert.equal(srcSetFor(src), undefined)
  assert.equal(thumbFor(src), src)
})

test('every photo the manifest lists has its copies on disk', () => {
  for (const src of sizedPhotos) {
    for (const width of MERCH_WIDTHS) assert.ok(existsSync(publicDir + resized(src, width)), `${resized(src, width)} is missing`)
  }
})
