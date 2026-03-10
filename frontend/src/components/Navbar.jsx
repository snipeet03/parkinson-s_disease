import { Link, useLocation } from 'react-router-dom'
import { Brain, Mic, Keyboard, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  const navItems = [
    { to: '/voice',     label: 'Voice Test',  icon: Mic },
    { to: '/typing',    label: 'Typing Test', icon: Keyboard },
    { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neural-900/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary-600/20 border border-primary-500/30 rounded-lg flex items-center justify-center group-hover:bg-primary-600/30 transition-colors">
              <Brain size={16} className="text-primary-400" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Neura<span className="text-primary-400">Scan</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === to
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </nav>
  )
}
