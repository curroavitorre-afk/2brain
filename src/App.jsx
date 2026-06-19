import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import AppShell from './components/AppShell'

function useInView(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('in-view') },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
}

function BrainSVG() {
  const nodesLeft = [
    [162, 148, 0.0],
    [118, 208, 0.4],
    [96,  270, 0.8],
    [132, 342, 1.2],
    [200, 374, 1.6],
  ]
  const nodesRight = [
    [338, 148, 2.0],
    [382, 208, 2.4],
    [404, 270, 2.8],
    [368, 342, 3.2],
    [300, 374, 3.6],
  ]
  const signalsAmber = [
    { d: 'M 216,115 C 194,140 178,170 175,207 C 172,244 180,276 198,305 C 212,328 222,354 218,385', delay: '0s' },
    { d: 'M 148,155 C 128,185 116,224 115,260 C 114,293 124,320 142,342', delay: '0.6s' },
  ]
  const signalsViolet = [
    { d: 'M 284,115 C 306,140 322,170 325,207 C 328,244 320,276 302,305 C 288,328 278,354 282,385', delay: '1.2s' },
    { d: 'M 352,155 C 372,185 384,224 385,260 C 386,293 376,320 358,342', delay: '1.8s' },
  ]
  const particles = [
    { cy: 68, color: '#F5C842', dur: 8,  delay: '0s' },
    { cy: 72, color: '#F5C842', dur: 11, delay: '-3.67s' },
    { cy: 70, color: '#F5C842', dur: 14, delay: '-9.33s' },
    { cy: 74, color: '#8B5CF6', dur: 9,  delay: '-1.5s' },
    { cy: 76, color: '#8B5CF6', dur: 12, delay: '-6s' },
    { cy: 71, color: '#8B5CF6', dur: 15, delay: '-10s' },
  ]

  return (
    <svg viewBox="0 0 500 500" className="brain-svg" aria-hidden="true">
      <defs>
        <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" result="comp" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glowViolet" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" result="comp" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* LEFT HEMISPHERE — amber */}
      <g filter="url(#glowAmber)">
        <path className="brain-hemi-left"
          d="M 248,108 C 226,100 200,100 174,112 C 148,124 122,146 104,175
             C 84,206 80,240 84,272 C 88,302 106,328 132,348
             C 156,368 188,380 218,386 C 230,390 240,392 248,392 Z"
        />
        <path className="brain-gyrus-left" d="M 220,112 C 198,136 182,165 179,202 C 176,238 183,271 196,300 C 208,326 218,352 216,386" />
        <path className="brain-gyrus-left" d="M 186,126 C 162,154 146,188 142,228 C 138,266 148,300 164,328 C 178,352 195,366 210,380" />
        <path className="brain-gyrus-left" d="M 148,152 C 128,184 116,222 115,258 C 114,292 124,320 140,342" />
        <path className="brain-gyrus-left" d="M 104,200 C 94,232 92,264 98,294 C 106,320 124,342 148,357" />
        <path className="brain-gyrus-left" d="M 88,270 C 96,300 114,327 139,346 C 162,364 190,376 216,384" />
      </g>

      {/* RIGHT HEMISPHERE — violet */}
      <g filter="url(#glowViolet)">
        <path className="brain-hemi-right"
          d="M 252,108 C 274,100 300,100 326,112 C 352,124 378,146 396,175
             C 416,206 420,240 416,272 C 412,302 394,328 368,348
             C 344,368 312,380 282,386 C 270,390 260,392 252,392 Z"
        />
        <path className="brain-gyrus-right" d="M 280,112 C 302,136 318,165 321,202 C 324,238 317,271 304,300 C 292,326 282,352 284,386" />
        <path className="brain-gyrus-right" d="M 314,126 C 338,154 354,188 358,228 C 362,266 352,300 336,328 C 322,352 305,366 290,380" />
        <path className="brain-gyrus-right" d="M 352,152 C 372,184 384,222 385,258 C 386,292 376,320 360,342" />
        <path className="brain-gyrus-right" d="M 396,200 C 406,232 408,264 402,294 C 394,320 376,342 352,357" />
        <path className="brain-gyrus-right" d="M 412,270 C 404,300 386,327 361,346 C 338,364 310,376 284,384" />
      </g>

      {/* CORPUS CALLOSUM */}
      <g opacity="0.6">
        <rect x="238" y="192" width="24" height="116" rx="12"
          fill="none" stroke="#E2E8F0" strokeWidth="2" />
        {[210, 224, 238, 252, 266, 280, 294].map(y => (
          <line key={y} x1="240" y1={y} x2="260" y2={y}
            stroke="#E2E8F0" strokeWidth="1" opacity="0.5" />
        ))}
      </g>

      {/* NEURAL SIGNALS */}
      {signalsAmber.map((s, i) => (
        <path key={`sa${i}`} className="neon-signal-amber" d={s.d} style={{ animationDelay: s.delay }} />
      ))}
      {signalsViolet.map((s, i) => (
        <path key={`sv${i}`} className="neon-signal-violet" d={s.d} style={{ animationDelay: s.delay }} />
      ))}

      {/* ACTIVITY NODES */}
      {nodesLeft.map(([cx, cy, delay], i) => (
        <circle key={`nl${i}`} cx={cx} cy={cy} r="3"
          className="neon-node" fill="#F5C842"
          style={{ animationDelay: `${delay}s` }} />
      ))}
      {nodesRight.map(([cx, cy, delay], i) => (
        <circle key={`nr${i}`} cx={cx} cy={cy} r="3"
          className="neon-node" fill="#8B5CF6"
          style={{ animationDelay: `${delay}s` }} />
      ))}

      {/* ORBITING PARTICLES */}
      {particles.map((p, i) => (
        <g key={`pt${i}`} style={{
          transformOrigin: '250px 250px',
          animation: `orbitParticle ${p.dur}s linear ${p.delay} infinite`,
        }}>
          <circle cx="250" cy={p.cy} r="2" fill={p.color} opacity="0.8" />
        </g>
      ))}
    </svg>
  )
}

function Landing({ onAcceder }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const dot  = document.getElementById('cursor-dot')
    const glow = document.getElementById('cursor-glow')
    if (!dot || !glow) return

    let mx = -200, my = -200

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`
      glow.style.transform = `translate(${mx - 20}px, ${my - 20}px)`
    }

    window.addEventListener('mousemove', onMove)

    const trailId = setInterval(() => {
      if (mx < 0) return
      const t = document.createElement('div')
      t.className = 'cursor-trail'
      t.style.left = `${mx}px`
      t.style.top  = `${my}px`
      document.body.appendChild(t)
      setTimeout(() => t.parentNode?.removeChild(t), 620)
    }, 80)

    return () => {
      window.removeEventListener('mousemove', onMove)
      clearInterval(trailId)
    }
  }, [])

  const card1    = useRef(null)
  const card2    = useRef(null)
  const card3    = useRef(null)
  const step1    = useRef(null)
  const step2    = useRef(null)
  const step3    = useRef(null)
  const demoWrap = useRef(null)

  useInView(card1)
  useInView(card2)
  useInView(card3)
  useInView(step1)
  useInView(step2)
  useInView(step3)
  useInView(demoWrap)

  return (
    <div className="landing">
      <div id="cursor-dot" />
      <div id="cursor-glow" />

      {/* NAV */}
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <span className="nav-logo">2BRAIN</span>
        <button className="nav-acceder" onClick={onAcceder}>Acceder</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="dot-grid" aria-hidden="true" />

        <div className="hero-brain-col">
          <BrainSVG />
        </div>

        <div className="hero-text-col">
          <p className="hero-eyebrow">[ SEGUNDA MENTE PERSONAL ]</p>
          <h1 className="hero-title">
            <span className="hero-word" style={{ animationDelay: '0s' }}>Tu </span>
            <span className="hero-word" style={{ animationDelay: '0.15s' }}>segunda </span>
            <span className="hero-word hero-gold" style={{ animationDelay: '0.3s' }}>mente</span>
            <span className="hero-word" style={{ animationDelay: '0.45s' }}>, </span>
            <span className="hero-word" style={{ animationDelay: '0.6s' }}>siempre </span>
            <span className="hero-word" style={{ animationDelay: '0.75s' }}>activa</span>
          </h1>
          <p className="hero-subtitle">
            Captura cualquier pensamiento. La IA lo organiza, clasifica y resume por ti.
            Nunca pierdas una idea valiosa.
          </p>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="section problem-section">
        <h2 className="section-title">Las ideas no esperan</h2>
        <div className="problem-grid">

          <div className="problem-card animate-on-scroll" ref={card1}>
            <div className="problem-icon-wrap">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <circle cx="18" cy="18" r="13" stroke="#F5C842" strokeWidth="1.5" />
                <line x1="18" y1="9"  x2="18" y2="18" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="18" x2="24" y2="22" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="18" cy="18" r="1.5" fill="#F5C842" />
              </svg>
            </div>
            <h3>Pierdes ideas en el momento</h3>
            <p>Las capturas cuando puedes, no cuando las tienes. El contexto se pierde antes de que llegues al ordenador.</p>
          </div>

          <div className="problem-card animate-on-scroll" ref={card2} style={{ transitionDelay: '0.15s' }}>
            <div className="problem-icon-wrap">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <circle cx="18" cy="18" r="5" stroke="#F5C842" strokeWidth="1.5" />
                <line x1="18" y1="5"  x2="18" y2="9"  stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="27" x2="18" y2="31" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="5"  y1="18" x2="9"  y2="18" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="27" y1="18" x2="31" y2="18" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="8.8"  y1="8.8"  x2="11.7" y2="11.7" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="24.3" y1="24.3" x2="27.2" y2="27.2" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="8.8"  y1="27.2" x2="11.7" y2="24.3" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="24.3" y1="11.7" x2="27.2" y2="8.8"  stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Organizar consume tu tiempo</h3>
            <p>Notion, Apple Notes, Google Keep — cada herramienta exige trabajo manual que te distrae de pensar.</p>
          </div>

          <div className="problem-card animate-on-scroll" ref={card3} style={{ transitionDelay: '0.3s' }}>
            <div className="problem-icon-wrap">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <rect x="4"  y="9"  width="18" height="13" rx="2" stroke="#F5C842" strokeWidth="1.5" />
                <line x1="11" y1="22" x2="11" y2="27" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="7"  y1="27" x2="15" y2="27" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="23" y="13" width="9" height="14" rx="1.5" stroke="#F5C842" strokeWidth="1.5" />
                <circle cx="27.5" cy="24.5" r="1" fill="#F5C842" />
              </svg>
            </div>
            <h3>Fragmentación entre dispositivos</h3>
            <p>Lo que escribes en el móvil no aparece en el ordenador. Tus ideas viven en silos separados.</p>
          </div>

        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section how-section">
        <h2 className="section-title">Escribe. La IA hace el resto.</h2>
        <div className="steps-grid">

          <div className="step animate-from-left" ref={step1}>
            <span className="step-bg-number">1</span>
            <h3 className="step-title">Escribe cualquier pensamiento</h3>
            <p className="step-desc">
              Captura ideas, reflexiones o fragmentos de información al instante, sin preocuparte por la estructura.
            </p>
          </div>

          <div className="step animate-from-left" ref={step2} style={{ transitionDelay: '0.2s' }}>
            <span className="step-bg-number">2</span>
            <h3 className="step-title">La IA organiza al instante</h3>
            <p className="step-desc">
              Categorización automática, resumen inteligente y keywords generadas en segundos. Sin trabajo manual.
            </p>
          </div>

          <div className="step animate-from-left" ref={step3} style={{ transitionDelay: '0.4s' }}>
            <span className="step-bg-number">3</span>
            <h3 className="step-title">Accede desde cualquier lugar</h3>
            <p className="step-desc">
              Todo sincronizado en tiempo real. Tu segunda mente siempre disponible en cualquier dispositivo.
            </p>
          </div>

        </div>
      </section>

      {/* TARJETA DEMO */}
      <section className="section demo-section">
        <div className="animate-scale" ref={demoWrap}>
          <div className="demo-card">
            <span className="demo-badge">Idea de negocio</span>
            <p className="demo-note">
              Crear un servicio de automatización de emails para PYMES que no tienen equipo de marketing
            </p>
            <p className="demo-summary">
              <em>Automatización de emails para PYMES sin equipo de marketing</em>
            </p>
            <div className="demo-keywords">
              <span className="keyword">#automatización</span>
              <span className="keyword">#PYMES</span>
              <span className="keyword">#emails</span>
              <span className="keyword">#marketing</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>2Brain — 2025</p>
      </footer>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('landing')
  const [appView, setAppView] = useState('app')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      if (sess) setAppView('app')
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null
  if (session && appView === 'app') return <AppShell session={session} onGoHome={() => setAppView('landing')} />
  if (view === 'auth') return <Auth onBack={() => setView('landing')} />

  return <Landing onAcceder={() => session ? setAppView('app') : setView('auth')} />
}

export default App
