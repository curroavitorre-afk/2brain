import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  Brain, CheckSquare, Lightbulb, Pencil, Check, X,
  Tag, Plus, AlertTriangle, Circle, CheckCircle, Menu,
} from 'lucide-react'
import Onboarding from './Onboarding'

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

const PALETTE = [
  { id: 'p0', color: '#F5C842' },
  { id: 'p1', color: '#8B5CF6' },
  { id: 'p2', color: '#14B8A6' },
  { id: 'p3', color: '#3B82F6' },
  { id: 'p4', color: '#F97316' },
  { id: 'p5', color: '#84CC16' },
  { id: 'p6', color: '#EC4899' },
  { id: 'p7', color: '#9F1239' },
  { id: 'p8', color: '#A8A29E' },
]

const PALETTE_MAP = Object.fromEntries(PALETTE.map(p => [p.id, p.color]))

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 }
const PRIORITY_COLOR = { alta: '#EF4444', media: '#F5C842', baja: '#84CC16' }
const PRIORITY_TEXT  = { alta: '#fff',    media: '#000',    baja: '#000' }

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function categorize(text) {
  const t = normalize(text)
  const rules = [
    { id: 'aprendizaje', kw: ['aprender', 'estudiar', 'investigar', 'curso', 'formacion', 'certificacion', 'quiero aprender', 'tengo que aprender'] },
    { id: 'herramienta', kw: ['herramienta', 'software', 'app', 'plataforma', 'plugin', 'saas', 'semrush', 'hubspot', 'notion', 'canva', 'chatgpt', 'claude', 'wordpress', 'shopify', 'n8n', 'make', 'zapier', 'crm', 'metricool', 'mailchimp'] },
    { id: 'idea-negocio', kw: ['negocio', 'startup', 'emprender', 'monetizar', 'vender', 'resell', 'lanzar', 'servicio', 'empresa', 'pymes'] },
    { id: 'marketing',   kw: ['agencia', 'mi agencia', 'clientes', 'servicios de marketing', 'marketing para'] },
    { id: 'linkedin',    kw: ['linkedin', 'marca personal', 'contenido para', 'visibilidad', 'seguidores', 'engagement'] },
    { id: 'proyecto',    kw: ['breaker', 'impulsa', 'proyecto', 'aceleradora', 'demo day'] },
    { id: 'recurso',     kw: ['club', 'voluntariado', 'comunidad', 'evento', 'meetup', 'libro', 'podcast'] },
    { id: 'reflexion',   kw: ['me di cuenta', 'aprendi que', 'reflexion', 'valores', 'proposito', 'crecimiento personal'] },
    { id: 'habito',      kw: ['habito', 'rutina', 'cada dia', 'todos los dias', 'disciplina', 'constancia'] },
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

function formatDueDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return dateStr < new Date().toISOString().slice(0, 10)
}

async function callGroq(noteId, text, onSuccess) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Analiza este texto y responde SOLO con un JSON válido sin markdown, sin explicaciones, sin bloques de código. El JSON debe tener exactamente estas dos claves: "summary" (frase de máximo 12 palabras en español que capture la esencia del texto) y "keywords" (array de 3 a 5 palabras clave en minúsculas en español). Texto: "${text}"`,
        }],
      }),
    })
    const json = await res.json()
    const raw = json.choices?.[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(raw)
    if (parsed.summary && Array.isArray(parsed.keywords)) {
      await supabase.from('notes').update({ summary: parsed.summary, keywords: parsed.keywords }).eq('id', noteId)
      onSuccess({ summary: parsed.summary, keywords: parsed.keywords })
    }
  } catch {
    // silent fail — note stays saved without enrichment
  }
}

export default function AppShell({ session, onGoHome }) {
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Layout
  const [activeView, setActiveView]   = useState('thoughts')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Notes state
  const [notes, setNotes]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [text, setText]               = useState('')
  const [saving, setSaving]           = useState(false)
  const [filter, setFilter]           = useState('all')
  const [groqPending, setGroqPending] = useState(new Set())

  // Tags state
  const [tags, setTags]                     = useState([])
  const [showTagPanel, setShowTagPanel]     = useState(false)
  const [newTagName, setNewTagName]         = useState('')
  const [newTagPalette, setNewTagPalette]   = useState('p0')
  const [savingTag, setSavingTag]           = useState(false)
  const [tagDropdownFor, setTagDropdownFor] = useState(null)

  // Category editing state
  const [editingCatsFor, setEditingCatsFor] = useState(null)

  // Chat Consejero state
  const [chatOpen, setChatOpen]     = useState(false)
  const [chatQuery, setChatQuery]   = useState('')
  const [chatPrompt, setChatPrompt] = useState('')
  const [copied, setCopied]         = useState(false)

  // Tasks state
  const [tasks, setTasks]               = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [taskTitle, setTaskTitle]       = useState('')
  const [taskDesc, setTaskDesc]         = useState('')
  const [taskPriority, setTaskPriority] = useState('media')
  const [taskDueDate, setTaskDueDate]   = useState('')
  const [savingTask, setSavingTask]     = useState(false)
  const [taskFilter, setTaskFilter]     = useState('all')

  useEffect(() => {
    async function loadData() {
      const [notesRes, tagsRes] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('tags').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
      ])
      if (!notesRes.error) setNotes(notesRes.data || [])
      if (!tagsRes.error) setTags(tagsRes.data || [])
      setLoading(false)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()
      if (profileError || !profile?.onboarding_completed) {
        setShowOnboarding(true)
      }
    }
    loadData()
  }, [session.user.id])

  useEffect(() => {
    if (activeView !== 'tasks') return
    loadTasks()
  }, [activeView]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadTasks() {
    setLoadingTasks(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (!error) setTasks(data || [])
    else console.error('[2brain] tasks table error — create it in Supabase dashboard:', error.message)
    setLoadingTasks(false)
  }

  // ── Notes handlers ──────────────────────────────────────

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
      setGroqPending(prev => new Set([...prev, data.id]))
      callGroq(data.id, trimmed, ({ summary, keywords }) => {
        setNotes(prev => prev.map(n => n.id === data.id ? { ...n, summary, keywords } : n))
        setGroqPending(prev => { const next = new Set(prev); next.delete(data.id); return next })
      })
    }
    setSaving(false)
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave()
  }

  async function handleToggleComplete(note) {
    const { data, error } = await supabase
      .from('notes').update({ completed: !note.completed }).eq('id', note.id).select().single()
    if (!error && data) setNotes(prev => prev.map(n => n.id === note.id ? data : n))
  }

  async function handleDelete(noteId) {
    if (!confirm('¿Eliminar esta nota?')) return
    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== noteId))
      setGroqPending(prev => { const next = new Set(prev); next.delete(noteId); return next })
    }
  }

  async function handleCreateTag() {
    const name = newTagName.trim()
    if (!name || savingTag) return
    setSavingTag(true)
    const newTag = { id: `tag_${Date.now()}`, user_id: session.user.id, name, palette: newTagPalette }
    const { data, error } = await supabase.from('tags').insert([newTag]).select().single()
    if (!error && data) { setTags(prev => [...prev, data]); setNewTagName(''); setNewTagPalette('p0') }
    setSavingTag(false)
  }

  async function handleDeleteTag(tagId) {
    const { error } = await supabase.from('tags').delete().eq('id', tagId)
    if (!error) {
      setTags(prev => prev.filter(t => t.id !== tagId))
      setNotes(prev => prev.map(n => ({ ...n, custom_tags: (n.custom_tags || []).filter(t => t !== tagId) })))
      if (filter === tagId) setFilter('all')
    }
  }

  async function handleAssignTag(note, tagId) {
    const currentTags = note.custom_tags || []
    if (currentTags.includes(tagId)) { setTagDropdownFor(null); return }
    const { data, error } = await supabase.from('notes').update({ custom_tags: [...currentTags, tagId] }).eq('id', note.id).select().single()
    if (!error && data) setNotes(prev => prev.map(n => n.id === note.id ? data : n))
    setTagDropdownFor(null)
  }

  async function handleUnassignTag(note, tagId) {
    const newTags = (note.custom_tags || []).filter(t => t !== tagId)
    const { data, error } = await supabase.from('notes').update({ custom_tags: newTags }).eq('id', note.id).select().single()
    if (!error && data) setNotes(prev => prev.map(n => n.id === note.id ? data : n))
  }

  async function handleToggleCategory(note, catId) {
    const current = note.categories || []
    let next
    if (current.includes(catId)) {
      if (current.length <= 1) return
      next = current.filter(c => c !== catId)
    } else {
      if (current.length >= 3) return
      next = [...current, catId]
    }
    const { data, error } = await supabase.from('notes').update({ categories: next }).eq('id', note.id).select().single()
    if (!error && data) setNotes(prev => prev.map(n => n.id === note.id ? data : n))
  }

  async function completeOnboarding() {
    await supabase.from('profiles').upsert({ id: session.user.id, onboarding_completed: true })
    setShowOnboarding(false)
  }

  // ── Chat Consejero ───────────────────────────────────────

  function generatePrompt(pregunta) {
    if (!pregunta.trim()) return
    const activas = notes.filter(n => !n.completed)
    const completadas = notes.filter(n => n.completed)
    const prompt = `Eres un consejero estratégico personal. Aquí están todas mis notas e ideas actuales:

NOTAS ACTIVAS (${activas.length}):
${activas.map((n, i) => `${i + 1}. [${n.categories.join(', ')}] ${n.text}${n.summary ? ` → ${n.summary}` : ''}`).join('\n')}
${completadas.length > 0 ? `\nNOTAS COMPLETADAS (${completadas.length}):\n${completadas.map((n, i) => `${i + 1}. [${n.categories.join(', ')}] ${n.text}`).join('\n')}\n` : ''}
Mi pregunta: ${pregunta}`
    setChatPrompt(prompt)
  }

  function handleCopyPrompt() {
    if (!chatPrompt) return
    navigator.clipboard.writeText(chatPrompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleClearChat() { setChatQuery(''); setChatPrompt(''); setCopied(false) }

  // ── Tasks handlers ───────────────────────────────────────

  async function handleAddTask() {
    const title = taskTitle.trim()
    if (!title || savingTask) return
    setSavingTask(true)
    const newTask = {
      id: crypto.randomUUID(),
      user_id: session.user.id,
      title,
      description: taskDesc.trim() || null,
      priority: taskPriority,
      due_date: taskDueDate || null,
      completed: false,
      created_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single()
    if (!error && data) {
      setTasks(prev => [data, ...prev])
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('media'); setTaskDueDate('')
    } else if (error) {
      console.error('[2brain] error adding task:', error.message)
    }
    setSavingTask(false)
  }

  async function handleToggleTask(task) {
    const { data, error } = await supabase
      .from('tasks').update({ completed: !task.completed }).eq('id', task.id).select().single()
    if (!error && data) setTasks(prev => prev.map(t => t.id === task.id ? data : t))
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('¿Eliminar esta tarea?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (!error) setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  // ── Derived data ─────────────────────────────────────────

  const usedCategories = CATEGORIES.filter(cat => notes.some(n => n.categories?.includes(cat.id)))

  const filtered = notes.filter(note => {
    if (filter === 'all')       return true
    if (filter === 'active')    return !note.completed
    if (filter === 'completed') return note.completed
    if (filter.startsWith('tag_')) return (note.custom_tags || []).includes(filter)
    return note.categories?.includes(filter)
  })

  const sortedFilteredTasks = [...tasks]
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const pa = PRIORITY_ORDER[a.priority] ?? 3
      const pb = PRIORITY_ORDER[b.priority] ?? 3
      if (pa !== pb) return pa - pb
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    })
    .filter(t => {
      if (taskFilter === 'all')       return true
      if (taskFilter === 'pending')   return !t.completed
      if (taskFilter === 'completed') return t.completed
      return t.priority === taskFilter
    })

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="shell">
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`shell-sidebar${sidebarOpen ? ' shell-sidebar--open' : ''}`}>
        <button className="sidebar-logo sidebar-logo-btn" onClick={onGoHome}>2BRAIN</button>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item${activeView === 'thoughts' ? ' sidebar-nav-item--active' : ''}`}
            onClick={() => { setActiveView('thoughts'); setSidebarOpen(false) }}
          >
            <span className="sidebar-nav-icon"><Lightbulb size={16} /></span>
            Pensamientos
          </button>
          <button
            className={`sidebar-nav-item${activeView === 'tasks' ? ' sidebar-nav-item--active' : ''}`}
            onClick={() => { setActiveView('tasks'); setSidebarOpen(false) }}
          >
            <span className="sidebar-nav-icon"><CheckSquare size={16} /></span>
            Tareas
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-email">{session.user.email}</span>
          <button className="signout-btn" onClick={() => supabase.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main body */}
      <div className="shell-body">
        <header className="shell-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(p => !p)}><Menu size={20} /></button>
          <span className="shell-header-title">
            {activeView === 'thoughts' ? <Lightbulb size={15} /> : <CheckSquare size={15} />}
            {activeView === 'thoughts' ? 'Pensamientos' : 'Tareas'}
          </span>
        </header>

        <main className="shell-main">

          {/* ── THOUGHTS VIEW ── */}
          {activeView === 'thoughts' && (
            <>
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
                  <button className="save-btn" onClick={handleSave} disabled={!text.trim() || saving}>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </div>

              {/* Chat Consejero */}
              <div className="chat-consejero">
                <button
                  className={`chat-consejero-toggle${chatOpen ? ' chat-consejero-toggle--open' : ''}`}
                  onClick={() => setChatOpen(p => !p)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Brain size={16} /> Chat Consejero</span>
                  <span className="chat-consejero-chevron">{chatOpen ? '▲' : '▼'}</span>
                </button>

                {chatOpen && (
                  <div className="chat-consejero-body">
                    <div className="chat-consejero-input-row">
                      <input
                        className="chat-consejero-input"
                        placeholder="¿Qué quieres analizar o decidir?"
                        value={chatQuery}
                        onChange={e => {
                          setChatQuery(e.target.value)
                          if (e.target.value.trim()) generatePrompt(e.target.value)
                          else setChatPrompt('')
                        }}
                        onKeyDown={e => e.key === 'Enter' && generatePrompt(chatQuery)}
                      />
                      {(chatQuery || chatPrompt) && (
                        <button className="chat-consejero-clear" onClick={handleClearChat}><X size={14} /></button>
                      )}
                    </div>

                    <div className="chat-suggestions">
                      {['¿Por qué idea empiezo?', '¿Cuál tiene más potencial?', 'Desarrolla la mejor idea', '¿Qué ideas se conectan?'].map(s => (
                        <button key={s} className="chat-suggestion-btn" onClick={() => { setChatQuery(s); generatePrompt(s) }}>
                          {s}
                        </button>
                      ))}
                    </div>

                    {chatPrompt && (
                      <>
                        <textarea className="chat-prompt-output" readOnly value={chatPrompt} />
                        <div className="chat-consejero-actions">
                          <button
                            className={`chat-copy-btn${chatPrompt ? ' chat-copy-btn--active' : ''}`}
                            onClick={handleCopyPrompt}
                            disabled={!chatPrompt}
                          >
                            {copied
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Check size={13} />Copiado</span>
                              : 'Copiar prompt'
                            }
                          </button>
                          <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="chat-claudeai-link">
                            Abrir Claude.ai ↗
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Filter bar + tag panel */}
              {!loading && notes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    {tags.map(tag => {
                      const color = PALETTE_MAP[tag.palette] ?? '#A8A29E'
                      return (
                        <button
                          key={tag.id}
                          className={`filter-btn${filter === tag.id ? ' filter-btn--active' : ''}`}
                          onClick={() => setFilter(filter === tag.id ? 'all' : tag.id)}
                          style={filter === tag.id ? { borderColor: color, color } : {}}
                        >
                          <span className="filter-tag-dot" style={{ background: color }} />
                          {tag.name}
                        </button>
                      )
                    })}
                    <button
                      className={`tag-add-panel-btn${showTagPanel ? ' tag-add-panel-btn--open' : ''}`}
                      onClick={() => setShowTagPanel(p => !p)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Tag size={11} /> Etiqueta
                    </button>
                  </div>

                  {showTagPanel && (
                    <div className="tag-panel">
                      <div className="tag-panel-header">
                        <span className="tag-panel-title">Etiquetas personalizadas</span>
                        <button className="tag-panel-close" onClick={() => setShowTagPanel(false)}><X size={14} /></button>
                      </div>
                      <div className="tag-panel-create">
                        <input
                          className="tag-name-input"
                          placeholder="Nombre de etiqueta"
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
                          maxLength={30}
                        />
                        <div className="tag-palette">
                          {PALETTE.map(p => (
                            <button
                              key={p.id}
                              className={`tag-swatch${newTagPalette === p.id ? ' tag-swatch--selected' : ''}`}
                              style={{ background: p.color }}
                              onClick={() => setNewTagPalette(p.id)}
                            />
                          ))}
                        </div>
                        <button className="tag-create-btn" onClick={handleCreateTag} disabled={!newTagName.trim() || savingTag}>
                          Crear
                        </button>
                      </div>
                      {tags.length > 0 && (
                        <div className="tag-list">
                          {tags.map(tag => {
                            const color = PALETTE_MAP[tag.palette] ?? '#A8A29E'
                            return (
                              <div
                                key={tag.id}
                                className="tag-list-item"
                                style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}
                              >
                                {tag.name}
                                <button className="tag-list-remove" onClick={() => handleDeleteTag(tag.id)} style={{ color }}><X size={10} /></button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Backdrop for tag dropdown */}
              {tagDropdownFor && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setTagDropdownFor(null)} />
              )}

              {/* Notes grid */}
              {loading ? (
                <p className="notes-state">Cargando notas…</p>
              ) : filtered.length === 0 ? (
                <p className="notes-state">
                  {notes.length === 0 ? 'Escribe tu primera nota arriba.' : 'No hay notas con este filtro.'}
                </p>
              ) : (
                <div className="notes-grid">
                  {filtered.map(note => {
                    const primaryColor = CATEGORY_MAP[note.categories?.[0]]?.color ?? '#475569'
                    const isPending = groqPending.has(note.id)
                    const assignedTags = (note.custom_tags || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean)
                    const availableTags = tags.filter(t => !(note.custom_tags || []).includes(t.id))

                    return (
                      <div key={note.id} className={`note-card${note.completed ? ' note-card--completed' : ''}`}>
                        {/* Category badges */}
                        <div className="note-badges">
                          {(note.categories || []).map(catId => {
                            const cat = CATEGORY_MAP[catId]
                            return cat ? (
                              <span key={catId} className="note-badge" style={{ background: cat.color, color: cat.textColor }}>
                                {cat.label}
                              </span>
                            ) : null
                          })}
                          <button
                            className={`note-cat-edit-btn${editingCatsFor === note.id ? ' note-cat-edit-btn--active' : ''}`}
                            onClick={() => setEditingCatsFor(editingCatsFor === note.id ? null : note.id)}
                            title="Editar categorías"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>

                        {/* Category editor */}
                        {editingCatsFor === note.id && (
                          <div className="cat-editor">
                            {CATEGORIES.map(cat => {
                              const active = (note.categories || []).includes(cat.id)
                              const atMax = (note.categories || []).length >= 3
                              const disabled = !active && atMax
                              return (
                                <button
                                  key={cat.id}
                                  className={`cat-editor-btn${active ? ' cat-editor-btn--active' : ''}${disabled ? ' cat-editor-btn--disabled' : ''}`}
                                  style={active ? { background: cat.color, color: cat.textColor, borderColor: '#F5C842' } : {}}
                                  onClick={() => handleToggleCategory(note, cat.id)}
                                  disabled={disabled}
                                  title={disabled ? 'Máximo 3 categorías' : undefined}
                                >
                                  {cat.label}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {/* Custom tag pills */}
                        {(tags.length > 0 || assignedTags.length > 0) && (
                          <div className="note-tags">
                            {assignedTags.map(tag => {
                              const color = PALETTE_MAP[tag.palette] ?? '#A8A29E'
                              return (
                                <span key={tag.id} className="note-tag-pill" style={{ background: `${color}28`, color, border: `1px solid ${color}50` }}>
                                  {tag.name}
                                  <button className="note-tag-unassign" onClick={() => handleUnassignTag(note, tag.id)} style={{ color }}><X size={10} /></button>
                                </span>
                              )
                            })}
                            {tags.length > 0 && (
                              <div className="note-tag-add" style={{ position: 'relative', zIndex: tagDropdownFor === note.id ? 50 : 'auto' }}>
                                <button
                                  className="note-tag-add-btn"
                                  onClick={() => setTagDropdownFor(tagDropdownFor === note.id ? null : note.id)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                >
                                  <Plus size={10} /> tag
                                </button>
                                {tagDropdownFor === note.id && (
                                  <div className="note-tag-dropdown">
                                    {availableTags.length === 0 ? (
                                      <span className="note-tag-dropdown-empty">Todas asignadas</span>
                                    ) : (
                                      availableTags.map(tag => {
                                        const color = PALETTE_MAP[tag.palette] ?? '#A8A29E'
                                        return (
                                          <button key={tag.id} className="note-tag-dropdown-item" onClick={() => handleAssignTag(note, tag.id)}>
                                            <span className="note-tag-dropdown-dot" style={{ background: color }} />
                                            {tag.name}
                                          </button>
                                        )
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Note text */}
                        <p className="note-text">{note.text}</p>

                        {/* AI enrichment */}
                        {isPending ? (
                          <p className="note-generating">Generando resumen…</p>
                        ) : note.summary ? (
                          <div className="note-enrichment">
                            <p className="note-summary" style={{ borderLeftColor: primaryColor }}>{note.summary}</p>
                            {note.keywords?.length > 0 && (
                              <div className="note-keywords">
                                {note.keywords.map(kw => <span key={kw} className="note-keyword">#{kw}</span>)}
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Footer */}
                        <div className="note-footer">
                          <span className="note-date">{formatDate(note.created_at)}</span>
                          <div className="note-actions">
                            <button
                              className={`note-check${note.completed ? ' note-check--done' : ''}`}
                              onClick={() => handleToggleComplete(note)}
                              title={note.completed ? 'Marcar como activa' : 'Marcar como completada'}
                            >
                              <Check size={14} />
                            </button>
                            <button className="note-delete" onClick={() => handleDelete(note.id)} title="Eliminar nota"><X size={14} /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ── TASKS VIEW ── */}
          {activeView === 'tasks' && (
            <>
              {/* Task form */}
              <div className="task-form">
                <input
                  className="task-form-title-input"
                  placeholder="Título de la tarea (obligatorio)"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                />
                <textarea
                  className="task-form-desc"
                  placeholder="Descripción (opcional)"
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  rows={2}
                />
                <div className="task-form-row">
                  <div className="task-priority-btns">
                    {[
                      { id: 'alta',  label: 'Alta' },
                      { id: 'media', label: 'Media' },
                      { id: 'baja',  label: 'Baja' },
                    ].map(p => (
                      <button
                        key={p.id}
                        className={`task-priority-btn task-priority-btn--${p.id}${taskPriority === p.id ? ` task-priority-btn--active` : ''}`}
                        onClick={() => setTaskPriority(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="date"
                    className="task-due-input"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                  />
                  <button className="task-add-btn" onClick={handleAddTask} disabled={!taskTitle.trim() || savingTask}>
                    {savingTask ? 'Añadiendo…' : 'Añadir tarea'}
                  </button>
                </div>
              </div>

              {/* Task filters */}
              <div className="task-filters">
                {[
                  { key: 'all',       label: 'Todas' },
                  { key: 'pending',   label: 'Pendientes' },
                  { key: 'completed', label: 'Completadas' },
                  { key: 'alta',      label: 'Alta prioridad',  color: '#EF4444' },
                  { key: 'media',     label: 'Media prioridad', color: '#F5C842' },
                  { key: 'baja',      label: 'Baja prioridad',  color: '#84CC16' },
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    className={`filter-btn${taskFilter === key ? ' filter-btn--active' : ''}`}
                    onClick={() => setTaskFilter(key)}
                    style={taskFilter === key && color ? { borderColor: color, color } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Task list */}
              {loadingTasks ? (
                <p className="notes-state">Cargando tareas…</p>
              ) : sortedFilteredTasks.length === 0 ? (
                <p className="notes-state">
                  {tasks.length === 0 ? 'Añade tu primera tarea arriba.' : 'No hay tareas con este filtro.'}
                </p>
              ) : (
                <div className="task-list">
                  {sortedFilteredTasks.map(task => {
                    const overdue = isOverdue(task.due_date) && !task.completed
                    return (
                      <div key={task.id} className={`task-row${task.completed ? ' task-row--completed' : ''}`}>
                        <button
                          className={`task-checkbox${task.completed ? ' task-checkbox--done' : ''}`}
                          onClick={() => handleToggleTask(task)}
                          title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                        >
                          {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                        <div className="task-row-content">
                          <span className={`task-title${task.completed ? ' task-title--done' : ''}`}>
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="task-row-desc">{task.description}</span>
                          )}
                          <div className="task-row-meta">
                            <span
                              className="task-priority-badge"
                              style={{
                                background: PRIORITY_COLOR[task.priority] + '28',
                                color: PRIORITY_COLOR[task.priority],
                                border: `1px solid ${PRIORITY_COLOR[task.priority]}55`,
                              }}
                            >
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            {task.due_date && (
                              <span className={`task-due${overdue ? ' task-due--overdue' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                {overdue && <AlertTriangle size={11} />}{formatDueDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="task-delete" onClick={() => handleDeleteTask(task.id)} title="Eliminar tarea"><X size={14} /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  )
}
