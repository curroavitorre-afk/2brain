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

const WIRE_PATH =
  'M 40,0 L 40,200 Q 40,220 56,220 Q 72,220 72,240 L 72,280 Q 72,300 56,300 Q 40,300 40,320 L 40,580 Q 40,600 56,600 Q 72,600 72,620 L 72,660 Q 72,680 56,680 Q 40,680 40,700 L 40,900'

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

      {/* WIRE NEÓN */}
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 5,
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <style>{`
            @keyframes wireDraw {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </defs>
        <path
          d={WIRE_PATH}
          fill="none"
          stroke="#F5C842"
          strokeWidth="1.5"
          style={{
            filter: 'drop-shadow(0 0 4px #F5C842)',
            strokeDasharray: '920',
            strokeDashoffset: '920',
            animation: 'wireDraw 3s ease forwards',
          }}
        />
        <circle r="3" fill="#F5C842">
          <animateMotion dur="4s" repeatCount="indefinite" path={WIRE_PATH} />
        </circle>
      </svg>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <span className="nav-logo">2BRAIN</span>
        <button className="nav-acceder" onClick={onAcceder}>Acceder</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="dot-grid" aria-hidden="true" />

        <div className="hero-brain-col">
          <img src="/brain.png" alt="2Brain" style={{ width: '480px', maxWidth: '100%' }} />
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
