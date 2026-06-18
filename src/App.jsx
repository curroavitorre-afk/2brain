import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import AppShell from './components/AppShell'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('landing')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  if (session) return <AppShell session={session} />

  if (view === 'auth') return <Auth onBack={() => setView('landing')} />

  return (
    <div className="app">

      {/* NAV */}
      <nav className="nav">
        <span className="nav-logo">2BRAIN</span>
        <button className="nav-acceder" onClick={() => setView('auth')}>Acceder</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="dot-grid" aria-hidden="true" />
        <div className="hero-content">
          <h1 className="hero-title">Tu segunda mente, siempre activa</h1>
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
          <div className="problem-card">
            <div className="problem-icon">⚡</div>
            <h3>Pierdes ideas en el momento</h3>
            <p>Las capturas cuando puedes, no cuando las tienes.</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">⏰</div>
            <h3>Organizar consume tiempo</h3>
            <p>Notion, Apple Notes, Google Keep requieren trabajo manual.</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">📱</div>
            <h3>Fragmentación entre dispositivos</h3>
            <p>Lo que escribes en el móvil no está en el ordenador.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section how-section">
        <h2 className="section-title">Escribe. La IA hace el resto.</h2>
        <div className="steps-grid">
          <div className="step">
            <span className="step-number">1</span>
            <p>Escribe cualquier pensamiento</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>La IA categoriza, resume y genera keywords al instante</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Accede desde cualquier dispositivo, siempre sincronizado</p>
          </div>
        </div>
      </section>

      {/* TARJETA DEMO */}
      <section className="section demo-section">
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
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>2Brain — Todos los derechos reservados 2025</p>
      </footer>

    </div>
  )
}

export default App
