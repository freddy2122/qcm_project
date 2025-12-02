import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function navLinkClass({ isActive }) {
  const base =
    'px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors'
  return isActive ? `${base} text-slate-900 bg-slate-100` : base
}

export default function SiteHeader() {
  const { user, logout } = useAuth() ?? {}
  const [mobileOpen, setMobileOpen] = useState(false)

  let primaryLinks

  if (user?.is_admin) {
    // Menu spécifique administrateur
    primaryLinks = [
      { to: '/admin', label: 'Tableau de bord admin' },
      // Ici on pourra ajouter plus tard: gestion des professeurs, des QCM, etc.
    ]
  } else if (user?.is_teacher) {
    // Menu spécifique professeur
    primaryLinks = [
      { to: '/', label: 'Accueil', end: true },
      { to: '/teacher/quizzes', label: 'Mes QCM' },
    ]
  } else {
    // Menu standard apprenant
    primaryLinks = [
      { to: '/', label: 'Accueil', end: true },
      { to: '/quiz', label: 'QCM' },
      { to: '/dashboard', label: 'Tableau de bord' },
    ]
  }

  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

  function renderPrimaryLinks(extraClasses = '') {
    return (
      <nav className={`flex flex-col gap-1 md:flex-row md:items-center ${extraClasses}`}>
        {primaryLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    )
  }

  function renderAuthActions(stack = false) {
    if (user) {
      return (
        <div className={`flex items-center gap-3 ${stack ? 'flex-col items-stretch' : ''}`}>
          <div className={`flex items-center gap-3 ${stack ? 'w-full justify-between' : ''}`}>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-semibold flex items-center justify-center">
              {initials || 'M'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout?.()
              setMobileOpen(false)
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      )
    }

    return (
      <div className={`flex items-center gap-3 ${stack ? 'flex-col items-stretch' : ''}`}>
        <Link
          to="/login"
          onClick={() => setMobileOpen(false)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Connexion
        </Link>
        <Link
          to="/register"
          onClick={() => setMobileOpen(false)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow-sm hover:from-indigo-600 hover:to-blue-600 transition-colors"
        >
          Inscription
        </Link>
      </div>
    )
  }

  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white font-bold flex items-center justify-center shadow-inner">
              Q
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-400">Plateforme</p>
              <p className="text-lg font-semibold text-slate-900">QCM interactif</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {renderPrimaryLinks()}
            {renderAuthActions()}
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 text-slate-600"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Basculer le menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5m-9 4.5h9" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={`md:hidden border-t border-slate-200 bg-white ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-4 space-y-4">
          {renderPrimaryLinks('flex-col')}
          {renderAuthActions(true)}
        </div>
      </div>
    </header>
  )
}

