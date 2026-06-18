import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const CATEGORIES = [
  { id: 'idea-negocio', label: 'Idea de negocio',     color: '#F5C842', textColor: '#000' },
  { id: 'reflexion',    label: 'Reflexión personal',  color: '#8B5CF6', textColor: '#fff' },
  { id: 'aprendizaje',  label: 'Aprendizaje',         color: '#14B8A6', textColor: '#fff' },
  { id: 'linkedin',     label: 'LinkedIn / Marca',    color: '#3B82F6', textColor: '#fff' },
  { id: 'proyecto',     label: 'Breaker / Proyecto',  color: '#F97316', textColor: '#fff' },
  { id: 'habito',       label: 'Hábito / Rutina',     color: '#84CC16', textColor: '#000' },
  { id: 'recurso',      label: 'Recurso',             color: '#EC4899', textColor: '#fff' },
  { id: 'marketing',    label: 'Marketing Agency',    color: '#9F1239', textColor: '#fff' },
  { id: 'herramienta',  label: 'Herramientas',        color: '#A8A29E', textColor: '#000' },
  { id: 'otro',         label: 'Otro',                color: '#475569', textColor: '#fff' },
]

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function categorize(text) {
  const t = normalize(text)
  const rules = [
    { id: 'aprendizaje', kw: ['aprender', 'estudiar', 'investigar', 'curso', 'formacion', 'certificacion', 'quiero aprender', 'tengo que aprender'] },
    { id: 'herramienta', kw: ['herramienta', 'software', 'app', 'plataforma', 'plugin', 'saas', 'semrush', 'hubspot', 'notion', 'canva', 'chatgpt', 'claude', 'wordpress', 'shopify', 'n8n', 'make', 'zapier', 'crm', 'metricool', 'mailchimp'] },
    { id: 'idea-negocio', kw: ['negocio', 'startup', 'emprender', 'monetizar', 'vender', 'resell', 'lanzar', 'servicio', 'empresa', 'pymes'] },
    { id: 'marketing',  kw: ['agencia', 'mi agencia', 'clientes', 'servicios de marketing', 'marketing para'] },
    { id: 'linkedin',   kw: ['linkedin', 'marca personal', 'contenido para', 'visibilidad', 'seguidores', 'engagement'] },
    { id: 'proyecto',   kw: ['breaker', 'impulsa', 'proyecto', 'aceleradora', 'demo day'] },
    { id: 'recurso',    kw: ['club', 'voluntariado', 'comunidad', 'evento', 'meetup', 'libro', 'podcast'] },
    { id: 'reflexion',  kw: ['me di cuenta', 'aprendi que', 'reflexion', 'valores', 'proposito', 'crecimiento personal'] },
    { id: 'habito',     kw: ['habito', 'rutina', 'cada dia', 'todos los dias', 'disciplina', 'constancia'] },
  ]

  const matched = []
  for (const rule of rules) {
    if (matched.length >= 3) break
    if (rule.kw.some(kw => t.includes(kw))) matched.push(rule.id)
  }
  return matched.length > 0 ? matched : ['otro']
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export default function AppShell({ session }) {
  const [notes, setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText]     = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadNotes() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      if (!error) setNotes(data || [])
      setLoading(false)
    }
    loadNotes()
  }, [session.user.id])

  async function handleSave() {
    const trimmed = text.trim()
    if (!trimmed || saving) return
    setSaving(true)

    const newNote = {
      id: crypto.randomUUID(),
      user_id: session.user.id,
      text: trimmed,
      categories: categorize(trimmed),
      custom_tags: [],
      summary: '',
      keywords: [],
      completed: false,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('notes').insert([newNote]).select().single()
    if (!error && data) {
      setNotes(prev => [data, ...prev])
      setText('')
    }
    setSaving(false)
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave()
  }

  async function handleToggleComplete(note) {
    const { data, error } = await supabase
      .from('notes')
      .update({ completed: !note.completed })
      .eq('id', note.id)
      .select()
      .single()
    if (!error && data) setNotes(prev => prev.map(n => n.id === note.id ? data : n))
  }

  async function handleDelete(noteId) {
    if (!confirm('¿Eliminar esta nota?')) return
    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (!error) setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const usedCategories = CATEGORIES.filter(cat =>
    notes.some(n => n.categories?.includes(cat.id))
  )

  const filtered = notes.filter(note => {
    if (filter === 'all')       return true
    if (filter === 'active')    return !note.completed
    if (filter === 'completed') return note.completed
    return note.categories?.includes(filter)
  })

  return (
    <div className="shell">
      <header className="shell-header">
        <span className="shell-logo">2BRAIN</span>
        <button className="signout-btn" onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </button>
      </header>

      <main className="shell-main">
        {/* Write area */}
        <div className="write-area">
          <textarea
            className="write-textarea"
            placeholder="Escribe cualquier pensamiento..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
          />
          <div className="write-footer">
            <span className="write-hint">Ctrl + Enter para guardar</span>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={!text.trim() || saving}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {!loading && notes.length > 0 && (
          <div className="filters">
            {[
              { key: 'all',       label: 'Todas' },
              { key: 'active',    label: 'Activas' },
              { key: 'completed', label: 'Completadas' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`filter-btn${filter === key ? ' filter-btn--active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
            {usedCategories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn${filter === cat.id ? ' filter-btn--active' : ''}`}
                onClick={() => setFilter(cat.id)}
                style={filter === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Notes */}
        {loading ? (
          <p className="notes-state">Cargando notas…</p>
        ) : filtered.length === 0 ? (
          <p className="notes-state">
            {notes.length === 0 ? 'Escribe tu primera nota arriba.' : 'No hay notas con este filtro.'}
          </p>
        ) : (
          <div className="notes-grid">
            {filtered.map(note => (
              <div key={note.id} className={`note-card${note.completed ? ' note-card--completed' : ''}`}>
                <div className="note-badges">
                  {(note.categories || []).map(catId => {
                    const cat = CATEGORY_MAP[catId]
                    return cat ? (
                      <span key={catId} className="note-badge" style={{ background: cat.color, color: cat.textColor }}>
                        {cat.label}
                      </span>
                    ) : null
                  })}
                </div>
                <p className="note-text">{note.text}</p>
                <div className="note-footer">
                  <span className="note-date">{formatDate(note.created_at)}</span>
                  <div className="note-actions">
                    <button
                      className={`note-check${note.completed ? ' note-check--done' : ''}`}
                      onClick={() => handleToggleComplete(note)}
                      title={note.completed ? 'Marcar como activa' : 'Marcar como completada'}
                    >
                      ✓
                    </button>
                    <button
                      className="note-delete"
                      onClick={() => handleDelete(note.id)}
                      title="Eliminar nota"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
