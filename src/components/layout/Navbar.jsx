import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import {
  MessageSquare, Briefcase, FileText,
  Map, Mic, Bookmark, User, Newspaper,
  LogOut, Menu, X, Zap, TrendingUp, Building2
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/chat',      label: 'AI Chat',      icon: MessageSquare },
  { to: '/jobs',      label: 'Jobs',         icon: Briefcase     },
  { to: '/resume',    label: 'Resume',       icon: FileText      },
  { to: '/career',    label: 'Career Path',  icon: Map           },
   { to: '/skills',    label: 'Skill Match',  icon: Zap           },
  { to: '/interview', label: 'Interview',    icon: Mic           },
  { to: '/saved',     label: 'Saved',        icon: Bookmark      },
  { to: '/news',      label: 'News',         icon: Newspaper     },
  { to: '/salary',  label: 'Salary',  icon: TrendingUp },
{ to: '/company', label: 'Company', icon: Building2  },
]

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-bold text-lg">NirVexa</span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === to
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm text-gray-300">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <button onClick={() => setOpen(!open)} className="md:hidden text-gray-400">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && isAuthenticated && (
        <div className="md:hidden border-t border-dark-600 bg-dark-800 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-dark-700 w-full transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}   