import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { track } from '@vercel/analytics'
import './index.css'
import { shopConfigured, fetchProducts, createCheckout, formatPrice } from './shop.js'
import { videos, press, faqs, appearances, stats, products } from './facts.js'

const merch = products.map((p, i) => ({
  id: p.handle || `fallback-${i}`, name: p.name, edition: 'BONGHOLEO', copy: p.description,
  price: `$${p.price}`, image: p.image, imagesByColor: p.imagesByColor, route: p.route,
  tag: p.tag || (i === 0 ? 'THE FIRST DROP' : i === 1 ? 'THE HEAVYWEIGHT' : 'NEW RELEASE'),
  bg: '#e9e5df', photo: true,
}))
const enabledProductHandles = new Set(products.map((product) => product.handle))

// Shopify's CDN resizes on request; without a width it ships the raw upload.
const cdnImage = (url, width = 800) => (url ? `${url}${url.includes('?') ? '&' : '?'}width=${width}` : url)

// Shopify descriptions are long; cut at a word boundary so cards never end mid-word.
const trim = (text, max) => {
  const t = (text || '').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…'
}

const Arrow = () => <svg className="arrow" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 14 14 4M6 4h8v8" /></svg>

function Count({ to, suffix = '' }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now(); const dur = 1400
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur)
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [playing, setPlaying] = useState(null)
  const [liveProducts, setLiveProducts] = useState(null)
  const [buying, setBuying] = useState(null)
  const [sel, setSel] = useState({})
  const lenisRef = useRef(null)
  const closeMenu = () => setMenuOpen(false)

  const [latest, setLatest] = useState([])

  useEffect(() => {
    if (shopConfigured) fetchProducts().then(setLiveProducts).catch(() => setLiveProducts(null))
    fetch('/api/videos').then((r) => r.json()).then((d) => setLatest((d.videos || []).slice(0, 6))).catch(() => {})
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 })
    lenisRef.current = lenis
    return () => { lenis.destroy(); lenisRef.current = null }
  }, [])

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    // Lenis forces html scroll-behavior:auto and its own scrollTo is rAF-based, so
    // native 'smooth' and lenis.scrollTo both no-op here. A synchronous window.scrollTo
    // lands reliably and Lenis syncs to the new position without fighting it.
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 8)
  }

  // Lenis makes scrollIntoView and lenis.scrollTo no-ops (see scrollToId), so
  // every programmatic scroll goes through this synchronous form.
  const scrollToEl = (selector, offset, fallbackId) => {
    const el = document.querySelector(selector)
    if (!el) return scrollToId(fallbackId)
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset)
  }

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('.rv:not(.in), .rv-img:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [latest, liveProducts])

  useEffect(() => {
    if (!liveProducts?.length) return
    setSel((prev) => {
      const next = { ...prev }
      for (const p of liveProducts) {
        if (next[p.handle]) continue
        const v = p.variants.nodes.find((x) => x.availableForSale) || p.variants.nodes[0]
        if (v?.selectedOptions) next[p.handle] = Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value]))
      }
      return next
    })
  }, [liveProducts])

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
  const optionValues = (item, name) => {
    const vals = [...new Set(item.variants.flatMap((v) => v.selectedOptions.filter((o) => o.name === name).map((o) => o.value)))]
    if (name !== 'Size') return vals
    // Order the known sizes, then append anything Shopify adds that isn't listed.
    return [...SIZE_ORDER.filter((s) => vals.includes(s)), ...vals.filter((v) => !SIZE_ORDER.includes(v))]
  }
  // Shopify carries a photo per variant, so picking Black shows the black tee.
  // Fall back to the product image when a size/colour pair isn't resolvable yet.
  const variantImage = (item) => {
    if (!item.live) return null
    const chosen = sel[item.id]
    const localByColour = chosen?.Color && item.imagesByColor?.[chosen.Color]
    if (localByColour) return localByColour
    const byColour = chosen && item.variants.find((v) => v.image?.url && v.selectedOptions.every((o) => o.name !== 'Color' || chosen[o.name] === o.value))
    return cdnImage((matchedVariant(item)?.image?.url) || byColour?.image?.url)
  }
  const variantAlt = (item) => {
    const colour = sel[item.id]?.Color
    const base = /bongholeo/i.test(item.name) ? item.name : `${item.name} — Bongholeo`
    return colour ? `${base}, ${colour}` : base
  }

  const matchedVariant = (item) => {
    const s = sel[item.id]
    if (!s) return null
    return item.variants.find((v) => v.availableForSale && v.selectedOptions.every((o) => s[o.name] === o.value))
  }

  const buy = async (variantId, id) => {
    setBuying(id)
    track('add_to_cart', { item: id })
    try {
      const url = await createCheckout([{ merchandiseId: variantId, quantity: 1 }])
      if (url) { track('begin_checkout', { item: id }); window.location.href = url }
      else setBuying(null)
    } catch {
      setBuying(null)
    }
  }

  const shopBg = ['#0d0912', '#2b0d3a', '#f3ead4']
  const scopedLiveProducts = liveProducts?.filter((product) => enabledProductHandles.has(product.handle))
  const shopItems = scopedLiveProducts && scopedLiveProducts.length
    ? scopedLiveProducts.map((p, i) => {
        const variants = p.variants.nodes.filter((v) => v.selectedOptions)
        const fact = products.find((item) => item.handle === p.handle)
        return {
          id: p.handle, name: p.title, edition: 'BONGHOLEO',
          copy: trim(p.description, 150),
          price: formatPrice(p.priceRange.minVariantPrice),
          image: cdnImage(p.featuredImage?.url) || fact?.image || '/media/brand/bongholeo-logo.webp',
          imagesByColor: fact?.imagesByColor, route: fact?.route,
          tag: fact?.tag || (/hoodie/i.test(p.title) ? 'WORN AT THE PODIUM' : 'AS SEEN ON KIMMEL'), bg: shopBg[i % shopBg.length],
          live: true, variants,
          optionNames: variants[0] ? variants[0].selectedOptions.map((o) => o.name) : [],
        }
      })
    : merch
  return <main id="top">
    <a className="skip-link" href="#content">Skip to content</a>
    <div className="bulletin"><span>NEW JERSEY · PUBLIC COMMENT · CIVIC SATIRE</span><strong>{shopConfigured ? 'FIRST DROP · 15% OFF — APPLIED AT CHECKOUT' : 'AS SEEN ON TMZ & JIMMY KIMMEL'}</strong></div>
    <header>
      <a className="logo" href="#top" aria-label="Bongholeo home"><img className="logo-img" src="/media/brand/bongholeo-logo.webp" alt="Bongholeo — Gavels the Truth" /></a>
      <nav className="desktop-nav" aria-label="Primary navigation"><a href="#record">WATCH THE VIDEO</a><a href="#story">THE STORY</a><a href="#press">PRESS</a><a href="#contact">CONTACT</a><a className="nav-shop" href="#shop" onClick={() => track('nav_shop')}>SHOP MERCH</a></nav>
      <div className="header-end"><a className="instagram" href="https://www.instagram.com/bongholeo/" target="_blank" rel="noreferrer">@BONGHOLEO <Arrow /></a><button className="menu-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button></div>
      <nav className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Mobile navigation"><a href="#record" onClick={closeMenu}>WATCH THE VIDEO</a><a href="#shop" onClick={closeMenu}>SHOP MERCH</a><a href="#story" onClick={closeMenu}>THE STORY</a><a href="#press" onClick={closeMenu}>PRESS</a><a href="#contact" onClick={closeMenu}>CONTACT</a><a href="https://www.instagram.com/bongholeo/" target="_blank" rel="noreferrer">INSTAGRAM</a></nav>
    </header>

    <section className="hero" id="content" aria-labelledby="hero-title">
      <img className="hero-photo" src="/media/bongholeo-hero.webp" alt="Bongholeo, the purple bong-costume guy, addressing the Cranford, New Jersey township committee meeting in a giant purple bong costume" fetchPriority="high" />
      <div className="hero-shade" />
      <div className="hero-copy"><p className="eyebrow"><span>LIVE FROM THE PODIUM</span> CRANFORD, NEW JERSEY</p><h1 id="hero-title"><span className="sr-only">Bongholeo — the Social Justice Waterpipe: </span><span className="hl"><span className="hw" style={{ '--d': '.25s' }}>GOVERNMENT</span></span><br /><span className="hl"><span className="hw" style={{ '--d': '.38s' }}>WORKS</span></span> <span className="hl"><span className="hw" style={{ '--d': '.47s' }}>FOR</span></span><br /><em><span className="hl"><span className="hw" style={{ '--d': '.6s' }}>THE</span></span> <span className="hl"><span className="hw" style={{ '--d': '.72s' }}>PEOPLE.</span></span></em></h1><div className="hero-bottom"><p>Bongholeo uses civic satire and the public record to ask a simple question: are local New Jersey governments serving residents, or the private interests that profit from public decisions?</p><div className="hero-ctas"><button className="watch-button" type="button" onClick={() => { track('watch_video', { video: 'hero-viral' }); setPlaying(videos[0].id); requestAnimationFrame(() => { const el = document.querySelector('.card-1 .record-image'); if (!el) return scrollToId('record'); const r = el.getBoundingClientRect(); window.scrollTo(0, r.top + window.scrollY - Math.max(16, (window.innerHeight - r.height) / 2)) }) }}><span className="yt-logo" aria-hidden="true"><svg viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="20" rx="5" fill="#FF0000" /><path d="M11 5.5 L21 10 L11 14.5 Z" fill="#ffffff" /></svg></span><span className="watch-text">WATCH THE VIRAL VIDEO<small>FEATURED ON TMZ &amp; JIMMY KIMMEL</small></span></button><a className="shop-cta" href="#shop" onClick={(e) => { e.preventDefault(); track('hero_shop'); scrollToEl('.merch-card', 72, 'shop') }}>GET THE VIRAL TEE · $39.99 <Arrow /></a><a className="hero-yt-link" href="https://www.youtube.com/watch?v=l1uSHa7NeiE" target="_blank" rel="noreferrer" onClick={() => track('outbound_youtube', { video: 'hero-secondary' })}>or watch on YouTube ↗</a></div></div></div>
      <div className="hero-stamp" aria-hidden="true"><b>07</b><span>JUL<br />2026</span></div><div className="photo-credit">FRAME: CRANFORD TV35 · JULY 7, 2026</div>
    </section>

    <section className="asseenon" aria-label="Press features">
      <span className="asseenon-label">AS SEEN ON</span>
      <div className="asseenon-logos"><span>USA TODAY</span><i>◆</i><span>TMZ</span><i>◆</i><span>JIMMY KIMMEL</span><i>◆</i><span>STEREOGUM</span><i>◆</i><span>NEWS 12 NEW JERSEY</span><i>◆</i><span>NJ 101.5</span><i>◆</i><span>NJ.COM</span></div>
    </section>

    <section className="stats" aria-label="The record in numbers">
      <article className="rv"><b><Count to={stats.outlets} /></b><span>National + regional outlets on the story</span></article>
      <article className="rv" style={{ '--rd': '120ms' }}><b><Count to={stats.subscribers} suffix="+" /></b><span>Subscribers on the channel</span></article>
      <article className="rv" style={{ '--rd': '240ms' }}><b><Count to={stats.videos} /></b><span>Videos on the public record</span></article>
    </section>

    <section className="statement" id="story" aria-labelledby="statement-title">
      <div className="section-tag rv">01 / WHY BONGHOLEO EXISTS</div><div className="statement-grid"><h2 id="statement-title" className="rv" style={{ '--rd': '90ms' }}>PUBLIC OFFICE<br />IS A PUBLIC<br /><span>TRUST.</span></h2><div className="statement-copy rv" style={{ '--rd': '180ms' }}><p className="lead">Local government exists to serve the people who live in the community. Public officials are there to represent residents and act in the public interest.</p><p>Bongholeo is Mike Vintzileos' civic-satire persona: a public-meeting intervention designed to make that responsibility impossible to ignore.</p><p className="mission-statement">The project brings attention to decisions that appear to favor developers, campaign contributors, or private entities over the people who bear the consequences. The costume is absurd. The principle is not: the public deserves to be heard, represented, and served.</p><a className="text-link" href="#record">EXPLORE THE PUBLIC RECORD <Arrow /></a></div></div>
      <div className="tenets"><article className="rv"><b>01</b><h3>Show up.</h3><p>Public participation starts by entering the room.</p></article><article className="rv" style={{ '--rd': '130ms' }}><b>02</b><h3>Say it plainly.</h3><p>Satire can reveal what procedure tries to hide.</p></article><article className="rv" style={{ '--rd': '260ms' }}><b>03</b><h3>Keep the tape.</h3><p>The performance ends. The public record remains.</p></article></div>
    </section>

    <section className="record" id="record" aria-labelledby="record-title">
      <div className="record-head"><div className="rv"><div className="section-tag light">02 / THE PUBLIC RECORD</div><h2 id="record-title">WATCH<br />WHAT<br /><em>HAPPENED.</em></h2></div><p className="rv" style={{ '--rd': '140ms' }}>Official footage, field tapes, and public-comment interventions. No renderings. No recreations. Just the room as it happened.</p></div>
      <div className="record-grid">{videos.map((video, index) => <div className={`record-card card-${index + 1} rv`} style={{ '--rd': `${index * 110}ms` }} key={video.id}><div className="record-image rv-img" style={{ '--rd': `${index * 110 + 150}ms` }}>{playing === video.id ? <iframe className="record-embed" src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> : <button className="record-play-btn" type="button" onClick={() => setPlaying(video.id)} aria-label={`Play video: ${video.title}`}><img src={video.image} alt={`${video.title} — ${video.label}`} loading={index === 0 ? 'eager' : 'lazy'} /><span className="source-label">{video.source}</span><span className="card-play">▶</span></button>}</div><div className="card-meta"><span>{video.label}</span><span>0{index + 1}</span></div><a className="record-title-link" href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer"><h3>{video.title} <Arrow /></h3></a><p>{video.copy}</p>{index === 0 && <a className="record-shop-link" href="/cranford-july-7-2026" onClick={() => track('outbound_cranford')}>READ WHAT HAPPENED ON JULY 7 <Arrow /></a>}{index === 0 && shopConfigured && <a className="record-shop-link" href="#shop" onClick={() => track('record_shop')}>WEAR THE BONG THAT WENT VIRAL <Arrow /></a>}</div>)}</div>
      {latest.length > 0 && <div className="latest rv"><div className="latest-head"><span className="live-pill"><i />AUTO-UPDATED</span><h3>Latest from the channel</h3></div><p className="latest-note">Straight from the channel feed — meetings, other speakers and other towns. The featured tapes above may appear here too.</p><div className="latest-grid">{latest.map((v) => <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" onClick={() => track('outbound_youtube', { video: v.id })}><div className="latest-thumb"><img src={v.thumb} alt={v.title} loading="lazy" /></div><h4>{v.title}</h4><time>{new Date(v.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></a>)}</div></div>}

      <div className="route rv">
        <div className="route-head"><h3>The route</h3><p>Where the costume has turned up, most recent first. Every line links to the tape — and the meeting that went national has <a href="/cranford-july-7-2026">its own full account</a>.</p></div>
        <ol className="route-list">{appearances.map((a) => <li key={a.date + a.town} className={a.highlight ? 'is-key' : undefined}>
          <time dateTime={a.date}>{a.display}</time>
          <div><h4>{a.town}</h4><p>{a.what}</p>{a.videoId && <a href={`https://www.youtube.com/watch?v=${a.videoId}`} target="_blank" rel="noreferrer" onClick={() => track('outbound_youtube', { video: a.videoId, from: 'route' })}>Watch the tape <Arrow /></a>}</div>
        </li>)}</ol>
      </div>
    </section>

    <section className="merch" id="shop" aria-labelledby="merch-title">
      <div className="merch-head"><div className="rv"><div className="section-tag">03 / THE MERCH TABLE</div><h2 id="merch-title">MERCH FOR<br /><em>THE PEOPLE.</em></h2></div><p className="rv" style={{ '--rd': '140ms' }}>{shopConfigured ? 'You just watched him sing at a New Jersey town hall in a giant purple bong — the clip TMZ, Jimmy Kimmel and USA Today all ran. This is the exact crest he wore to the podium. Wear the thing that went viral — pick your size and check out below.' : 'The first drop is the Bongholeo crest — no spin, only truth, worn loud. The shop opens soon.'}</p></div>
      {shopConfigured && <div className="merch-proof rv"><span>The costume from the clip — now on a shirt.</span><div className="merch-proof-logos"><b>TMZ</b><i>◆</i><b>JIMMY KIMMEL</b><i>◆</i><b>USA TODAY</b><i>◆</i><b>STEREOGUM</b></div></div>}
      <div className="merch-grid">{shopItems.map((item, mi) => <article className="merch-card rv" style={{ '--rd': `${mi * 120}ms` }} key={item.id}>{item.route ? <a href={item.route} className="merch-image-link" aria-label={`View ${item.name}`}><div className={`merch-image${item.photo ? ' is-photo' : ''}`} style={{ background: item.bg }}><span className="merch-tag">{item.tag}</span><img src={variantImage(item) || item.image} alt={variantAlt(item)} loading="lazy" />{!item.live && <span className="merch-soon">COMING SOON</span>}</div></a> : <div className={`merch-image${item.photo ? ' is-photo' : ''}`} style={{ background: item.bg }}><span className="merch-tag">{item.tag}</span><img src={variantImage(item) || item.image} alt={variantAlt(item)} loading="lazy" />{!item.live && <span className="merch-soon">COMING SOON</span>}</div>}<div className="merch-meta"><span>{item.edition}</span><span>{item.price}</span></div><h3>{item.route ? <a href={item.route}>{item.name}</a> : item.name}</h3><p>{item.copy}</p>{item.route && <a className="merch-details" href={item.route}>VIEW DETAILS <Arrow /></a>}{item.live && <div className="merch-selects">{item.optionNames.map((name) => <label className="merch-select" key={name}><span>{name.toUpperCase()}</span><select value={sel[item.id]?.[name] || ''} onChange={(e) => setSel({ ...sel, [item.id]: { ...sel[item.id], [name]: e.target.value } })}>{optionValues(item, name).map((v) => <option key={v} value={v}>{v}</option>)}</select></label>)}</div>}{item.live && <button className="merch-add" type="button" disabled={!matchedVariant(item) || buying === item.id} onClick={() => { const mv = matchedVariant(item); if (mv) buy(mv.id, item.id) }}>{!matchedVariant(item) ? 'UNAVAILABLE' : buying === item.id ? 'OPENING CHECKOUT…' : `ADD TO CART · ${item.price}`}</button>}{item.live && <span className="merch-secure">Secure Shopify checkout, hosted by our fulfillment partner · printed &amp; shipped to order</span>}</article>)}</div>
      {shopConfigured && <div className="merch-trust">PRINTED TO ORDER · SECURE SHOPIFY CHECKOUT · HEAVYWEIGHT RING-SPUN COTTON</div>}
      {shopConfigured && <div className="merch-offer"><b>15% OFF</b> THE FIRST DROP — APPLIED AUTOMATICALLY AT CHECKOUT, NO CODE NEEDED</div>}
      <div className="merch-cta"><p>{shopConfigured ? 'The drop is live — wear the thing that went viral.' : 'Be first when the drop lands.'}</p>{shopConfigured ? <button className="merch-button" type="button" onClick={() => { track('merch_cta_shop'); scrollToEl('.merch-add', 180, 'shop') }}>GRAB THE CREST <Arrow /></button> : <a className="merch-button" href="https://www.instagram.com/bongholeo/" target="_blank" rel="noreferrer">FOLLOW @BONGHOLEO FOR THE DROP <Arrow /></a>}</div>
      <div className="merch-lifestyle"><div className="merch-lifestyle-photo rv-img"><img src="/media/merch/gavels-tee-black-womens.webp" alt="The Bongholeo Gavels The Truth tee in black, worn on a New Jersey street" loading="lazy" /></div><div className="merch-lifestyle-copy rv" style={{ '--rd': '160ms' }}><span className="merch-lifestyle-tag">WORN IN THE WILD</span><h3>Put it on the public <em>record.</em></h3><p>The Gavels The Truth tee — heavyweight cotton, oversized front print. Out on the street where the record actually lives.</p></div></div>
    </section>

    <div className="marquee" aria-label="Bongholeo themes"><div><span>PUBLIC RECORD</span><i>◆</i><span>PUBLIC COMMENT</span><i>◆</i><span>BIG BONG ENERGY</span><i>◆</i><span>PUBLIC RECORD</span><i>◆</i><span>PUBLIC COMMENT</span><i>◆</i></div></div>

    <section className="press" id="press" aria-labelledby="press-title">
      <div className="press-heading rv"><div className="section-tag">04 / NATIONAL ATTENTION</div><h2 id="press-title">THE STORY<br />LEFT THE <span>ROOM.</span></h2><p>Coverage from national and regional outlets. Each link opens the original reporting.</p></div>
      <div className="press-list">{press.map((item, index) => <a className="rv" style={{ '--rd': `${index * 70}ms` }} key={item.href} href={item.href} target="_blank" rel="noreferrer"><span className="press-number">{String(index + 1).padStart(2, '0')}</span><strong>{item.outlet}</strong><h3>{item.title}</h3><time>{item.date}</time><Arrow /></a>)}</div>
    </section>

    <section className="follow" aria-labelledby="follow-title"><div className="follow-photo rv-img"><img src="/media/cranford-action.webp" alt="Bongholeo performing during public comment in Cranford" loading="lazy" /><span>THE RECORD CONTINUES</span></div><div className="follow-copy rv" style={{ '--rd': '150ms' }}><div className="section-tag light">05 / FOLLOW THE SIGNAL</div><h2 id="follow-title">SEE WHAT<br />HAPPENS<br /><em>NEXT.</em></h2><p>New appearances, full meeting footage, and clips from the public record.</p><div className="follow-links"><a href="https://www.instagram.com/bongholeo/" target="_blank" rel="noreferrer" onClick={() => track('outbound_instagram')}><span>INSTAGRAM</span><strong>@bongholeo</strong><Arrow /></a><a href="https://www.youtube.com/channel/UCMEhjgjJbD27K7ZSQwKnkzg" target="_blank" rel="noreferrer" onClick={() => track('outbound_youtube', { video: 'channel' })}><span>YOUTUBE</span><strong>Social Justice Waterpipe</strong><Arrow /></a></div></div></section>

    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="section-tag rv">06 / COMMON QUESTIONS</div>
      <div className="faq-grid"><h2 id="faq-title" className="rv" style={{ '--rd': '90ms' }}>WHO IS<br /><em>BONGHOLEO?</em></h2><div className="faq-list">{faqs.map((f, i) => <div className="faq-item rv" style={{ '--rd': `${i * 70}ms` }} key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}</div></div>
    </section>

    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="section-tag rv">07 / GET IN TOUCH</div>
      <div className="contact-grid"><h2 id="contact-title" className="rv" style={{ '--rd': '90ms' }}>SPEAK<br />INTO THE<br /><em>MIC.</em></h2><div className="contact-copy rv" style={{ '--rd': '180ms' }}><p>Press, bookings, tips, public-comment invites — or just to say the public record is open. Reach out directly.</p><a className="contact-email" href="mailto:admin@bongholeo.com">admin@bongholeo.com <Arrow /></a><div className="contact-socials"><a href="https://www.instagram.com/bongholeo/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span><strong>@bongholeo</strong><Arrow /></a><a href="https://www.youtube.com/@Bongholeo420" target="_blank" rel="noreferrer"><span>YOUTUBE</span><strong>Social Justice Waterpipe</strong><Arrow /></a></div></div></div>
    </section>

    <div className="footer-echo" aria-hidden="true">BONGHOLEO</div>
    <footer><a className="logo" href="#top"><img className="logo-img" src="/media/brand/bongholeo-logo.webp" alt="Bongholeo — Gavels the Truth" /></a><p>PUBLIC COMMENT / CIVIC SATIRE / NEW JERSEY</p><a className="jrg-link" href="https://thejorgeramirezgroup.com" target="_blank" rel="noreferrer">SITE BY THE JORGE RAMIREZ GROUP <Arrow /></a><a href="#top">TOP ↑</a></footer>
  </main>
}

export default App
