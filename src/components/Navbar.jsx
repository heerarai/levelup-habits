import { NavLink } from 'react-router-dom'
import { BarChart3, CalendarDays, Home, Trophy, User } from 'lucide-react'
import Logo from './Logo'

const LINKS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/plans', label: 'Plans', icon: CalendarDays },
  { to: '/challenges', label: 'Challenges', icon: Trophy },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-violet-100 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <NavLink to="/home" aria-label="LevelUp home"><Logo /></NavLink>
          <nav className="hidden gap-1 md:flex" aria-label="Main">
            {LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-grape text-white shadow-md shadow-violet-200' : 'text-slate-700 hover:bg-violet-50'
                  }`
                }
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar on phones */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-violet-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Main"
      >
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold ${isActive ? 'text-grape' : 'text-slate-500'}`
            }
          >
            <Icon className="h-5 w-5" /> {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
