import { supabase } from '../supabaseClient'

export default function AppShell() {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="app-shell">
      <p className="app-shell-title">2Brain App — próximamente</p>
      <button className="signout-btn" onClick={handleSignOut}>
        Cerrar sesión
      </button>
    </div>
  )
}
