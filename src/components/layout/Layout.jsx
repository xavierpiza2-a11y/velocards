import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '@/hooks/useAuthStore'

const navItems = [
  { to: '/',           label: 'Accueil'    },
  { to: '/boosters',   label: 'Boosters'   },
  { to: '/collection', label: 'Collection' },
  { to: '/marche',     label: 'Marché'     },
]

export default function Layout() {
  const { profile, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-noir-400 flex flex-col">
      {/* Navbar */}
      <header className="bg-noir-300 border-b border-gold-dark/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <NavLink to="/" className="font-display text-xl tracking-[4px] text-gold-400 shrink-0">
            VÉLO<span className="text-gold-200">CARDS</span>
          </NavLink>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-body tracking-wide transition-colors duration-150 ${
                    isActive
                      ? 'text-gold-400 bg-gold-400/10'
                      : 'text-gold-400/50 hover:text-gold-400/80 hover:bg-gold-400/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin() && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-mono tracking-widest transition-colors duration-150 ${
                    isActive
                      ? 'text-gold-200 bg-gold-400/20 border border-gold-400/40'
                      : 'text-gold-400/40 hover:text-gold-400/70 border border-transparent'
                  }`
                }
              >
                ADMIN
              </NavLink>
            )}
          </nav>

          {/* Profil + points */}
          <div className="flex items-center gap-3 shrink-0">
            {profile && (
              <span className="font-mono text-xs text-gold-400 bg-gold-dark/60 px-3 py-1 rounded-full border border-gold-400/20">
                {(profile.points ?? 0).toLocaleString()} pts
              </span>
            )}
            <button
              onClick={handleLogout}
              className="btn-ghost text-xs tracking-widest font-mono"
            >
              QUITTER
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-dark/30 py-4 text-center">
        <p className="font-mono text-[10px] tracking-[3px] text-gold-400/30">
          VÉLOCARDS UCI PRO · SAISON 2025 · COLLECTION OFFICIELLE
        </p>
      </footer>
    </div>
  )
}
