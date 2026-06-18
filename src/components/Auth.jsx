import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ onBack }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Revisa tu email para confirmar tu cuenta')
    }

    setLoading(false)
  }

  function toggleMode() {
    setMode(m => (m === 'login' ? 'register' : 'login'))
    setError('')
    setSuccess('')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack}>← Volver</button>

        <h1 className="auth-title">
          {mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
        </h1>

        {success ? (
          <div className="auth-success">{success}</div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Contraseña</label>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading
                ? 'Cargando...'
                : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className="auth-toggle">
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button onClick={toggleMode}>
            {mode === 'login' ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
