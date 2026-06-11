import { Outlet, NavLink } from 'react-router-dom'

const adminNav = [
  { to: '/admin/cards',    label: 'CARTES',        icon: '🃏' },
  { to: '/admin/boosters', label: 'BOOSTERS',      icon: '📦' },
  { to: '/admin/users',    label: 'UTILISATEURS',  icon: '👥' },
]

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono text-[10px] tracking-[3px] bg-gold-400 text-noir-900 px-2 py-0.5 rounded">
            ADMIN
          </span>
          <span className="font-mono text-[10px] tracking-[4px] text-gold-400/50">
            PANNEAU D'ADMINISTRATION
          </span>
        </div>
        <h1 className="font-display text-4xl tracking-widest text-gold-200">
          DASHBOARD
        </h1>
        <div className="h-px bg-gold-dark/60 mt-3" />
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-44 shrink-0">
          <nav className="space-y-1">
            {adminNav.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg font-mono text-[11px] tracking-widest transition-all duration-150 ${
                    isActive
                      ? 'bg-gold-400/15 text-gold-300 border border-gold-400/30'
                      : 'text-gold-400/40 hover:text-gold-400/70 hover:bg-gold-400/5'
                  }`
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
