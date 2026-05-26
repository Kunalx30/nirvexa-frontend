import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import {
  MessageSquare, Briefcase, FileText,
  Map, Mic, Bookmark, User, Newspaper,
  LogOut, Menu, X, Zap, TrendingUp, Building2,
  ChevronDown,   GitBranch, LifeBuoy, Mail
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

const GRADIENT_PRESETS = [
  { id: 'aurora', label: 'Deep Aurora', from: '#2563eb', to: '#a855f7', text: '#ffffff' },
  { id: 'indigo', label: 'Indigo Twilight', from: '#4f46e5', to: '#06b6d4', text: '#ffffff' },
  { id: 'emerald', label: 'Emerald Sea', from: '#059669', to: '#10b981', text: '#ffffff' },
  { id: 'sunset', label: 'Warm Sunset', from: '#ea580c', to: '#e11d48', text: '#ffffff' },
  { id: 'steel', label: 'Midnight Steel', from: '#374151', to: '#1f2937', text: '#ffffff' },
  { id: 'rose', label: 'Rose Gold', from: '#db2777', to: '#fda4af', text: '#ffffff' },
  { id: 'cosmic', label: 'Cosmic Nebula', from: '#7c3aed', to: '#c084fc', text: '#ffffff' },
  { id: 'gold', label: 'Amber Gold', from: '#d97706', to: '#f59e0b', text: '#ffffff' },
]

const NAV_LINKS = [
  { to: '/chat',          label: 'AI Chat',     icon: MessageSquare },
  { to: '/jobs',          label: 'Jobs',        icon: Briefcase     },
  { to: '/resume',        label: 'Resume',      icon: FileText      },
  { to: '/career',        label: 'Career Path', icon: Map           },
  { to: '/skills',        label: 'Skill Match', icon: Zap           },
  { to: '/interview',     label: 'Interview',   icon: Mic           },
  { to: '/news',          label: 'News',        icon: Newspaper     },
  { to: '/salary',        label: 'Salary',      icon: TrendingUp    },
  { to: '/company',       label: 'Company',     icon: Building2     },
  { to: '/roadmap-graph', label: 'Roadmaps',    icon: GitBranch     },
]

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const avatarUrl = user?.avatar_url || user?.avatarUrl || null
  const activePreset = GRADIENT_PRESETS.find(p => p.id === avatarUrl)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        .nb {
          position:sticky;top:0;z-index:200;
          background:rgba(255,255,255,.94);
          backdrop-filter:saturate(180%) blur(20px);
          -webkit-backdrop-filter:saturate(180%) blur(20px);
          border-bottom:1px solid #e8e8e8;
          font-family:'DM Sans',system-ui,sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .nb-in {
          max-width:1400px;margin:0 auto;padding:0 20px;height:58px;
          display:flex;align-items:center;justify-content:space-between;gap:8px;
        }

        /* ── Logo ── */
        .nb-logo {
          display:flex;align-items:center;gap:8px;
          text-decoration:none;flex-shrink:0;
        }
        .nb-lsq {
          width:30px;height:30px;background:#0a0a0a;border-radius:8px;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;font-weight:700;color:#fafafa;flex-shrink:0;
        }
        .nb-lname {
          font-size:15px;font-weight:600;color:#0a0a0a;
          letter-spacing:-.4px;white-space:nowrap;
        }

        /* ── Right cluster: nav + divider + profile ── */
        .nb-right {
          display:flex;align-items:center;gap:6px;
          flex-shrink:0;
        }

        /* ── Nav links ── */
        .nb-links {
          display:flex;align-items:center;gap:2px;
        }

        /* ── Each pill ── */
        .nb-link {
          display:inline-flex;align-items:center;gap:8px;
          height:34px;
          padding:0 12px;
          border-radius:10px;
          font-size:13px;font-weight:550;
          color:#5a5a5a;
          text-decoration:none;
          white-space:nowrap;
          transition:
            background .18s ease,
            color .18s ease,
            transform .18s ease;
          flex-shrink:0;
        }

        .nb-link-icon {
          flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          width:18px;height:18px;
        }

        .nb-link-label {
          font-size:12.5px;font-weight:500;
          opacity:.95;
          white-space:nowrap;
        }

        .nb-link:hover {
          background:#f0f0f0;
          color:#0a0a0a;
          transform:translateY(-1px);
        }

        .nb-link.active {
          color:#0a0a0a;
          background:#ececec;
        }

        /* ── Divider ── */
        .nb-divider {
          width:1px;height:22px;background:#e4e4e4;
          flex-shrink:0;margin:0 2px;
        }

        /* ── Profile ── */
        .nb-profile { position:relative; }
        .nb-profile-btn {
          display:flex;align-items:center;gap:7px;
          padding:4px 10px 4px 4px;border-radius:24px;
          border:1px solid #e4e4e4;background:#fff;cursor:pointer;
          transition:all .2s;
        }
        .nb-profile-btn:hover { border-color:#c4c4c4;box-shadow:0 2px 8px rgba(0,0,0,.06); }
        .nb-avatar {
          width:28px;height:28px;border-radius:50%;background:#0a0a0a;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;color:#fafafa;
          overflow:hidden;
        }
        .nb-avatar-lottie { width:34px;height:34px; transform:translate(-3px,-3px); }
        .nb-profile-name { font-size:13px;font-weight:500;color:#0a0a0a;letter-spacing:-.2px; }
        .nb-profile-btn svg { color:#a3a3a3;transition:transform .2s; }
        .nb-profile-btn.open svg:last-child { transform:rotate(180deg); }

        .nb-dropdown {
          position:absolute;top:calc(100% + 8px);right:0;min-width:180px;
          background:#fff;border:1px solid #e4e4e4;border-radius:14px;
          box-shadow:0 8px 32px rgba(0,0,0,.08);padding:6px;z-index:300;
          animation:dropIn .2s ease;
        }
        @keyframes dropIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        .nb-drop-item {
          display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;
          border-radius:9px;font-size:13px;font-weight:450;color:#6b6b6b;
          background:none;border:none;cursor:pointer;text-decoration:none;
          font-family:'DM Sans',sans-serif;transition:all .15s;text-align:left;
        }
        .nb-drop-item:hover { background:#f3f3f3;color:#0a0a0a; }
        .nb-drop-item.danger:hover { background:#fef2f2;color:#ef4444; }
        .nb-drop-sep { height:1px;background:#f0f0f0;margin:4px 6px; }

        /* ── Auth ── */
        .nb-auth { display:flex;align-items:center;gap:6px; }
        .nb-login { font-size:13px;font-weight:500;color:#6b6b6b;text-decoration:none;padding:7px 16px;border-radius:20px;transition:all .2s; }
        .nb-login:hover { color:#0a0a0a;background:#f3f3f3; }
        .nb-signup { font-size:13px;font-weight:600;background:#0a0a0a;color:#fafafa;padding:8px 20px;border-radius:22px;text-decoration:none;transition:opacity .2s,transform .2s; }
        .nb-signup:hover { opacity:.82;transform:translateY(-1px); }

        /* ── Mobile ── */
        .nb-mobile-btn { display:none;background:none;border:1px solid #e4e4e4;border-radius:9px;padding:6px;cursor:pointer;color:#6b6b6b;transition:all .2s; }
        .nb-mobile-btn:hover { color:#0a0a0a;background:#f3f3f3; }
        .nb-mobile { display:none;border-top:1px solid #e4e4e4;background:#fff;padding:12px 16px;animation:dropIn .25s ease; }
        .nb-mobile-links { display:grid;grid-template-columns:1fr 1fr;gap:4px; }
        .nb-mobile-link { display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;font-size:13px;font-weight:450;color:#6b6b6b;text-decoration:none;transition:all .15s; }
        .nb-mobile-link:hover { background:#f3f3f3;color:#0a0a0a; }
        .nb-mobile-link.active { background:#f0f0f0;color:#0a0a0a;font-weight:550; }
        .nb-mobile-logout { display:flex;align-items:center;gap:8px;width:100%;margin-top:8px;padding:10px 14px;border-radius:12px;border:none;background:none;font-size:13px;font-weight:450;color:#ef4444;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s; }
        .nb-mobile-logout:hover { background:#fef2f2; }

        @media(max-width:1024px){
          .nb-links { display:none; }
          .nb-divider { display:none; }
          .nb-profile-name { display:none; }
          .nb-mobile-btn { display:flex; }
          .nb-mobile.open { display:block; }
        }
      `}</style>

      <nav className="nb">
        <div className="nb-in">

          {/* Logo — left */}
          <Link to="/" className="nb-logo">
            <img src="/logo.png" alt="Nyrvexa Logo" className="nb-logo-img" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span className="nb-lname">Nyrvexa</span>
          </Link>

          {/* Everything on the right */}
          <div className="nb-right">

            {isAuthenticated && (
              <>
                <div className="nb-links">
                  {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`nb-link${location.pathname === to ? ' active' : ''}`}
                    >
                      <span className="nb-link-icon">
                        <Icon size={17} strokeWidth={1.9} />
                      </span>
                      <span className="nb-link-label">{label}</span>
                    </Link>
                  ))}
                </div>
                <div className="nb-divider" />
              </>
            )}

            {isAuthenticated ? (
              <div className="nb-profile" ref={profileRef}>
                <button
                  className={`nb-profile-btn${profileOpen ? ' open' : ''}`}
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div
                    className="nb-avatar"
                    style={{
                      background: activePreset
                        ? `linear-gradient(135deg, ${activePreset.from}, ${activePreset.to})`
                        : 'linear-gradient(135deg, #2563eb, #a855f7)',
                      color: activePreset ? activePreset.text : '#ffffff',
                    }}
                  >
                    {getInitials(user?.name)}
                  </div>
                  <span className="nb-profile-name">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={13} />
                </button>
                {profileOpen && (
                  <div className="nb-dropdown">
                    <Link to="/profile" className="nb-drop-item" onClick={() => setProfileOpen(false)}>
                      <User size={15} /> Profile
                    </Link>
                    <Link to="/saved" className="nb-drop-item" onClick={() => setProfileOpen(false)}>
                      <Bookmark size={15} /> Saved Jobs
                    </Link>
                    <Link
                      to="/support"
                      className="nb-drop-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LifeBuoy size={15} /> Support
                    </Link>
                    <div className="nb-drop-sep" />
                    <button className="nb-drop-item danger" onClick={() => { setProfileOpen(false); handleLogout() }}>
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nb-auth">
                <Link to="/login" className="nb-login">Log in</Link>
                <Link to="/register" className="nb-signup">Sign Up</Link>
              </div>
            )}

            {isAuthenticated && (
              <button className="nb-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>

        </div>

        {/* Mobile menu */}
        {isAuthenticated && (
          <div className={`nb-mobile${mobileOpen ? ' open' : ''}`}>
            <div className="nb-mobile-links">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={`nb-mobile-link${location.pathname === to ? ' active' : ''}`}>
                  <Icon size={15} /> {label}
                </Link>
              ))}
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className={`nb-mobile-link${location.pathname === '/profile' ? ' active' : ''}`}>
                <User size={15} /> Profile
              </Link>
              <Link to="/saved" onClick={() => setMobileOpen(false)}
                className={`nb-mobile-link${location.pathname === '/saved' ? ' active' : ''}`}>
                <Bookmark size={15} /> Saved Jobs
              </Link>
              <Link
                to="/support"
                className={`nb-mobile-link${location.pathname === '/support' ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <LifeBuoy size={15} /> Support
              </Link>
            </div>
            <button className="nb-mobile-logout" onClick={handleLogout}>
              <LogOut size={15} /> Log out
            </button>
          </div>
        )}
      </nav>
    </>
  )
}