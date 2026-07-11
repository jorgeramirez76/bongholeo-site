import './index.css'

const videos = [
  {
    id: 'jyasIwuFL6o',
    tag: 'EDISON, NJ',
    title: 'Bongholeo in Edison, NJ',
    note: 'A public-comment performance from SOCIAL JUSTICE WATERPIPE.',
  },
  {
    id: 'J-zFZnXm7TE',
    tag: 'PUBLIC COMMENT',
    title: 'Bongholeo removed by police from meeting',
    note: 'A documented civic-action moment from the video archive.',
  },
  {
    id: 'khtr6-yMl_8',
    tag: 'CRANFORD, NJ',
    title: 'First Amendment lawsuit filed',
    note: 'Bongholeo and Will Thilly at the Cranford dance-party protest.',
  },
]

const Arrow = () => <span aria-hidden="true" className="arrow">↗</span>

function App() {
  return (
    <main>
      <a className="skip" href="#archive">Skip to archive</a>

      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Bongholeo home">BONGHOLEO<span>®</span></a>
        <nav aria-label="Primary navigation">
          <a href="#manifesto">The work</a>
          <a href="#archive">Archive</a>
          <a href="#contact">Find the pipe</a>
        </nav>
        <a className="insta-link" href="https://www.instagram.com/bongholeo/" target="_blank" rel="noreferrer">Instagram <Arrow /></a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-noise" />
        <p className="eyebrow">NEW JERSEY · PUBLIC COMMENT · SATIRE</p>
        <div className="hero-grid">
          <div>
            <h1 id="hero-title"><span>LOUD</span> ENOUGH<br />TO BE HEARD.</h1>
            <p className="hero-copy">A purple waterpipe walks into public meetings and refuses to let the room pretend nothing is happening.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#archive">WATCH THE ARCHIVE <Arrow /></a>
              <a className="text-link" href="#manifesto">WHAT IS BONGHOLEO? <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <aside className="hero-stamp" aria-label="Bongholeo is a civic-satire persona">
            <div className="stamp-ring">BONGHOLEO · BONGHOLEO · BONGHOLEO · </div>
            <div className="stamp-core">B<br />H</div>
            <small>EST. IN<br />PUBLIC</small>
          </aside>
        </div>
        <div className="ticker" aria-label="Site themes"><span>FREE SPEECH</span><i>✦</i><span>PUBLIC RECORD</span><i>✦</i><span>NO BORING MEETINGS</span><i>✦</i><span>FREE SPEECH</span><i>✦</i><span>PUBLIC RECORD</span></div>
      </section>

      <section className="statement" id="manifesto" aria-labelledby="statement-title">
        <p className="section-label">01 / THE POINT</p>
        <h2 id="statement-title">The costume is the <em>doorway.</em><br />The conversation is the point.</h2>
        <div className="statement-grid">
          <p>Bongholeo is the civic-satire persona of Mike Vintzileos: a very visible reminder that public meetings belong to the public.</p>
          <p>The work lives where humor, performance, and the First Amendment collide — in council chambers, on the record, and in plain sight.</p>
        </div>
      </section>

      <section className="principles" aria-label="Bongholeo principles">
        <article><b>01</b><h3>Make it impossible to ignore.</h3><p>Satire cuts through the institutional hum.</p></article>
        <article><b>02</b><h3>Keep it public.</h3><p>What happens in the room deserves a record.</p></article>
        <article><b>03</b><h3>Ask better questions.</h3><p>Even — especially — when they make the room squirm.</p></article>
      </section>

      <section className="archive" id="archive" aria-labelledby="archive-title">
        <div className="archive-head">
          <div><p className="section-label">02 / SELECTED RECORD</p><h2 id="archive-title">THE <em>WATERPIPE</em> ARCHIVE</h2></div>
          <a className="button button-outline" href="https://www.youtube.com/results?search_query=Bongholeo+SOCIAL+JUSTICE+WATERPIPE" target="_blank" rel="noreferrer">ALL VIDEOS <Arrow /></a>
        </div>
        <div className="video-grid">
          {videos.map((video, index) => (
            <a key={video.id} className={`video-card video-card-${index + 1}`} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">
              <div className="thumb"><img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" /><span className="play">▶</span><span className="episode">0{index + 1}</span></div>
              <div className="video-meta"><p>{video.tag}</p><h3>{video.title}<Arrow /></h3><span>{video.note}</span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="quote" aria-label="Quote">
        <p>“Public comment is not a performance review.<br />It’s a <em>right.</em>”</p>
        <span>— THE WATERPIPE, MORE OR LESS</span>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <p className="section-label">03 / FOLLOW THE SMOKE</p>
        <h2 id="contact-title">THE PIPE HAS<br /><em>PLACES TO BE.</em></h2>
        <p>For the live record, clips, and whatever happens next, follow the public channels.</p>
        <div className="contact-links">
          <a href="https://www.instagram.com/bongholeo/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span><b>@bongholeo</b><Arrow /></a>
          <a href="https://www.youtube.com/results?search_query=Bongholeo+SOCIAL+JUSTICE+WATERPIPE" target="_blank" rel="noreferrer"><span>YOUTUBE</span><b>Social Justice Waterpipe</b><Arrow /></a>
        </div>
      </section>

      <footer>
        <a className="wordmark" href="#top">BONGHOLEO<span>®</span></a>
        <p>Built around the public record. © {new Date().getFullYear()}</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  )
}

export default App
