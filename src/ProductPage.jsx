import MerchPolicy from './MerchPolicy.jsx'
import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import { createCheckout, fetchProduct, formatPrice, shopConfigured } from './shop.js'
import { products } from './facts.js'
import './product.css'

const HANDLE = document.body.dataset.productHandle || 'bongholeo-in-cuffs-tee'
const facts = products.find((product) => product.handle === HANDLE)
const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL', '3XL']
const defaultSelection = facts.defaultSelection || { Size: 'M', Color: facts.colors?.[0] || 'Black' }

const Arrow = () => <svg className="arrow" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 14 14 4M6 4h8v8" /></svg>

export default function ProductPage() {
  const [product, setProduct] = useState(null)
  const [selection, setSelection] = useState(defaultSelection)
  const [activeImage, setActiveImage] = useState(facts.gallery[0])
  const [buying, setBuying] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    if (!shopConfigured) return
    fetchProduct(HANDLE)
      .then((live) => {
        setProduct(live)
        const variants = live?.variants?.nodes || []
        const preferred = variants.find((variant) => variant.availableForSale && variant.selectedOptions.every((option) => defaultSelection[option.name] === option.value))
        const first = preferred || variants.find((variant) => variant.availableForSale) || variants[0]
        if (first) setSelection(Object.fromEntries(first.selectedOptions.map((option) => [option.name, option.value])))
      })
      .catch(() => setLoadFailed(true))
  }, [])

  useEffect(() => {
    const color = selection.Color?.toLowerCase()
    if (!color) return
    const match = facts.gallery.find((image) => image.src.includes(`-${color}-male`))
    if (match) setActiveImage(match)
  }, [selection.Color])

  const variants = product?.variants?.nodes || []
  const optionNames = variants[0]?.selectedOptions?.map((option) => option.name) || ['Size', 'Color']
  const optionValues = (name) => {
    const values = variants.length
      ? [...new Set(variants.flatMap((variant) => variant.selectedOptions.filter((option) => option.name === name).map((option) => option.value)))]
      : name === 'Size' ? facts.sizes : facts.colors
    return name === 'Size' ? SIZE_ORDER.filter((size) => values.includes(size)) : values
  }
  const matchedVariant = variants.find((variant) => variant.availableForSale && variant.selectedOptions.every((option) => selection[option.name] === option.value))
  const price = product ? formatPrice(product.priceRange.minVariantPrice) : `$${facts.price}`

  const buy = async () => {
    if (!matchedVariant) return
    setBuying(true)
    track('add_to_cart', { item: HANDLE, route: 'product' })
    try {
      const checkoutUrl = await createCheckout([{ merchandiseId: matchedVariant.id, quantity: 1 }])
      if (checkoutUrl) {
        track('begin_checkout', { item: HANDLE, route: 'product' })
        window.location.href = checkoutUrl
        return
      }
    } catch {
      // Keep the product page usable if Shopify is temporarily unavailable.
    }
    setBuying(false)
  }

  return <main className="product-page">
    <header className="product-header">
      <a href="/" aria-label="Bongholeo home"><img src="/media/brand/bongholeo-logo.webp" alt="Bongholeo — Gavels the Truth" /></a>
      <a href="/#shop">BACK TO MERCH <Arrow /></a>
    </header>

    <section className="product-layout" aria-labelledby="product-title">
      <div className="product-media">
        <div className="product-main-image"><img src={activeImage.src} alt={activeImage.alt} /></div>
        <div className="product-thumbs" aria-label="Product photographs">
          {facts.gallery.map((image) => <button type="button" key={image.src} className={activeImage.src === image.src ? 'is-active' : undefined} onClick={() => setActiveImage(image)} aria-label={`Show ${image.alt}`} aria-pressed={activeImage.src === image.src}><img src={image.src} alt="" /></button>)}
        </div>
      </div>

      <div className="product-copy">
        <span className="product-kicker">{facts.page.kicker}</span>
        <h1 id="product-title">{facts.page.title}<br /><em>{facts.page.emphasis}</em></h1>
        <p className="product-price">{price}</p>
        <p className="product-lead">{facts.page.lead}</p>
        <ul>{facts.page.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>

        <div className="product-options">
          {optionNames.map((name) => <label key={name}><span>{name.toUpperCase()}</span><select value={selection[name] || ''} onChange={(event) => setSelection({ ...selection, [name]: event.target.value })}>{optionValues(name).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}
        </div>

        <button className="product-buy" type="button" onClick={buy} disabled={!matchedVariant || buying}>{buying ? 'OPENING CHECKOUT…' : matchedVariant ? `ADD TO CART · ${price}` : loadFailed ? 'SHOPIFY TEMPORARILY UNAVAILABLE' : 'LOADING LIVE OPTIONS…'}</button>
        <p className="product-secure">Secure Shopify checkout · produced and fulfilled through Apliiq · no order is placed until checkout is completed</p>
      </div>
    </section>

    <MerchPolicy />
    <section className="product-story" aria-labelledby="product-story-title">
      <span>{facts.page.storyLabel}</span>
      <h2 id="product-story-title">{facts.page.storyTitle} <em>{facts.page.storyEmphasis}</em></h2>
      <p>{facts.page.story}</p>
    </section>
    <section className="product-story" aria-labelledby="related-merch-title">
      <h2 id="related-merch-title">More official Bongholeo merch</h2>
      <ul>{products.filter((item) => item.route && item.handle !== HANDLE).map((item) => <li key={item.handle}><a href={item.route}>{item.name}</a></li>)}</ul>
      <p><a href="/#shop">All official Bongholeo merch</a></p>
    </section>
  </main>
}
