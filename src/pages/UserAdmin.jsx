import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Briefcase, Lock, LogOut, Plus, Trash2, Pencil, Check, X, Loader2,
  Users, MessageSquare, LayoutDashboard, Crown, Search, RefreshCw,
  Shield, UserCircle, Inbox, Sparkles, ChevronRight,
  ExternalLink, Save, Eye, EyeOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import '../styles/team-admin.css'
import {
  teamAdminLogin,
  teamAdminVerifyOtp,
  teamAdminResendOtp,
  validateTeamSession,
  fetchAdminJobs,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  fetchAdminStats,
  fetchAdminUsers,
  deleteAdminUser,
  toggleUserPremium,
  fetchAdminTickets,
  updateAdminTicket,
  deleteAdminTicket,
  getTeamAdminToken,
  setTeamAdminToken,
  clearTeamAdminToken,
  isTeamAdminAuthError,
} from '../services/teamAdminService'

const TEAM_EMAIL = 'team@nyrvexa.in'

// Debug helper (disabled in production)
const dbg = () => {}

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Platform health at a glance' },
  { id: 'users', label: 'Users', icon: Users, desc: 'Manage accounts and Pro access' },
  { id: 'support', label: 'Support', icon: MessageSquare, desc: 'Customer inquiries from /support' },
  { id: 'jobs', label: 'Premium Jobs', icon: Briefcase, desc: 'Curated listings for Pro members' },
]

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'remote', label: 'Remote' },
  { value: 'freelance', label: 'Freelance' },
]

const CATEGORIES = ['Engineering', 'Design', 'Product', 'Data', 'Marketing', 'Sales', 'Operations', 'Other']

const EMPTY_JOB = {
  title: '', company: '', location: '', job_type: 'full-time', experience: '', salary: '',
  category: 'Engineering', skills: '', description: '', requirements: '',
  apply_url: '', apply_email: '', is_featured: false, is_active: true,
}

const STATUS_BADGE = {
  open: 'ta-badge-open',
  in_progress: 'ta-badge-progress',
  resolved: 'ta-badge-resolved',
  closed: 'ta-badge-closed',
}

function useDebounce(value, ms = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function ConfirmModal({ open, title, message, confirmLabel, danger, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="ta-modal-backdrop" role="dialog" aria-modal="true">
      <div className="ta-modal">
        <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', color: '#6b6b6b', fontSize: 14, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="ta-btn ta-btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`ta-btn ${danger ? 'ta-btn-danger' : 'ta-btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block" style={{ marginBottom: 16 }}>
      <span className="ta-label">
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </span>
      {hint && <p className="ta-hint">{hint}</p>}
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  )
}

export default function UserAdmin() {
  const [step, setStep] = useState(() => (getTeamAdminToken() ? 'checking' : 'login'))
  const [email, setEmail] = useState(TEAM_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [lastRefresh, setLastRefresh] = useState(null)

  const [stats, setStats] = useState(null)
  const [overviewTickets, setOverviewTickets] = useState([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const debouncedUserSearch = useDebounce(userSearch)
  const [usersLoading, setUsersLoading] = useState(false)

  const [tickets, setTickets] = useState([])
  const [ticketFilter, setTicketFilter] = useState('')
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [ticketNotes, setTicketNotes] = useState({})

  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobForm, setJobForm] = useState(EMPTY_JOB)
  const [editingJobId, setEditingJobId] = useState(null)
  const [showJobForm, setShowJobForm] = useState(false)

  const [confirm, setConfirm] = useState(null)
  const verifyInFlight = useRef(false)

  const activeNav = NAV.find((n) => n.id === activeTab) || NAV[0]
  const proRate = useMemo(() => {
    if (!stats?.total_users) return 0
    return Math.round((stats.premium_users / stats.total_users) * 100)
  }, [stats])

  const handleSessionExpired = useCallback(() => {
    clearTeamAdminToken()
    setStep('login')
    setPassword('')
    setOtp('')
    toast.error('Session expired. Please sign in again.')
  }, [])

  useEffect(() => {
    window.addEventListener('team-admin-session-expired', handleSessionExpired)
    return () => window.removeEventListener('team-admin-session-expired', handleSessionExpired)
  }, [handleSessionExpired])

  useEffect(() => {
    if (step !== 'checking') return undefined
    let cancelled = false
    // #region agent log
    dbg('D', 'UserAdmin.jsx:sessionCheck', 'checking_stored_token', { hasToken: !!getTeamAdminToken() })
    // #endregion
    validateTeamSession()
      .then(() => {
        // #region agent log
        dbg('D', 'UserAdmin.jsx:sessionCheck', 'session_valid', {})
        // #endregion
        if (!cancelled) setStep('dashboard')
      })
      .catch((err) => {
        // #region agent log
        dbg('D', 'UserAdmin.jsx:sessionCheck', 'session_invalid', {
          status: err?.response?.status,
          message: err?.response?.data?.message,
        })
        // #endregion
        if (!cancelled) {
          clearTeamAdminToken()
          setStep('login')
        }
      })
    return () => { cancelled = true }
  }, [step])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const [statsRes, openTicketsRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminTickets({ per_page: 5, status: 'open' }),
      ])
      setStats(statsRes.data)
      setOverviewTickets(openTicketsRes.data?.tickets || [])
      setLastRefresh(new Date())
      // #region agent log
      dbg('E', 'UserAdmin.jsx:loadStats', 'stats_loaded', {
        totalUsers: statsRes.data?.total_users,
        ticketsCount: openTicketsRes.data?.tickets?.length,
      })
      // #endregion
    } catch (err) {
      // #region agent log
      dbg('E', 'UserAdmin.jsx:loadStats', 'stats_failed', { status: err?.response?.status })
      // #endregion
      if (!isTeamAdminAuthError(err)) toast.error('Failed to load overview metrics')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const res = await fetchAdminUsers({ search: debouncedUserSearch, per_page: 100 })
      setUsers(res.data?.users || [])
      setLastRefresh(new Date())
    } catch (err) {
      if (!isTeamAdminAuthError(err)) toast.error('Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }, [debouncedUserSearch])

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true)
    try {
      const params = { per_page: 100 }
      if (ticketFilter) params.status = ticketFilter
      const res = await fetchAdminTickets(params)
      const list = res.data?.tickets || []
      setTickets(list)
      const notes = {}
      list.forEach((t) => { notes[t.id] = t.admin_notes || '' })
      setTicketNotes(notes)
      setLastRefresh(new Date())
    } catch (err) {
      if (!isTeamAdminAuthError(err)) toast.error('Failed to load support tickets')
    } finally {
      setTicketsLoading(false)
    }
  }, [ticketFilter])

  const loadJobs = useCallback(async () => {
    setJobsLoading(true)
    try {
      const res = await fetchAdminJobs()
      setJobs(res.data?.jobs || [])
      setLastRefresh(new Date())
    } catch (err) {
      if (!isTeamAdminAuthError(err)) toast.error('Failed to load premium jobs')
    } finally {
      setJobsLoading(false)
    }
  }, [])

  const refreshTab = useCallback(() => {
    if (activeTab === 'overview') return loadStats()
    if (activeTab === 'users') return loadUsers()
    if (activeTab === 'support') return loadTickets()
    return loadJobs()
  }, [activeTab, loadStats, loadUsers, loadTickets, loadJobs])

  useEffect(() => {
    if (step !== 'dashboard') return
    refreshTab()
  }, [step, activeTab, refreshTab])

  useEffect(() => {
    if (step !== 'dashboard' || activeTab !== 'users') return
    loadUsers()
  }, [debouncedUserSearch, step, activeTab, loadUsers])

  useEffect(() => {
    if (step === 'dashboard' && activeTab === 'jobs' && jobs.length === 0) loadJobs()
  }, [step, activeTab, jobs.length, loadJobs])

  const handleLogin = async (e) => {
    e.preventDefault()
    clearTeamAdminToken()
    setLoading(true)
    try {
      const res = await teamAdminLogin(email.trim().toLowerCase(), password)
      // #region agent log
      dbg('B', 'UserAdmin.jsx:handleLogin', 'login_ok', {})
      // #endregion
      toast.success(res.data?.message || 'Verification code sent')
      setStep('otp')
    } catch (err) {
      // #region agent log
      dbg('B', 'UserAdmin.jsx:handleLogin', 'login_failed', {
        status: err?.response?.status,
        message: err?.response?.data?.message,
      })
      // #endregion
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (verifyInFlight.current) return
    verifyInFlight.current = true
    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const res = await teamAdminVerifyOtp(normalizedEmail, otp)
      const token = res.data?.data?.access_token
      // #region agent log
      dbg('C', 'UserAdmin.jsx:handleVerifyOtp', 'verify_response', {
        hasToken: !!token,
        success: res.data?.success,
      })
      // #endregion
      if (!token) throw new Error('No token')
      setTeamAdminToken(token, normalizedEmail)
      toast.success('Welcome to Nyrvexa Operations')
      setStep('dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification code'
      toast.error(
        msg.includes('expired') || msg.includes('Invalid')
          ? `${msg}. Go back and sign in again, or tap Resend code.`
          : msg
      )
    } finally {
      verifyInFlight.current = false
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      const res = await teamAdminResendOtp(email.trim().toLowerCase())
      toast.success(res.data?.message || 'New code sent')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend code')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearTeamAdminToken()
    setStep('login')
    setPassword('')
    setOtp('')
  }

  const saveJob = async (e) => {
    e.preventDefault()
    if (!jobForm.title.trim() || !jobForm.company.trim()) {
      toast.error('Title and company are required')
      return
    }
    setLoading(true)
    try {
      const payload = { ...jobForm, title: jobForm.title.trim(), company: jobForm.company.trim() }
      if (editingJobId) {
        await updateAdminJob(editingJobId, payload)
        toast.success('Listing updated')
      } else {
        await createAdminJob(payload)
        toast.success('Published — visible on Jobs page (Premium corner) when Live is on')
      }
      setJobForm(EMPTY_JOB)
      setEditingJobId(null)
      setShowJobForm(false)
      loadJobs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save listing')
    } finally {
      setLoading(false)
    }
  }

  const openNewJob = () => {
    setEditingJobId(null)
    setJobForm(EMPTY_JOB)
    setShowJobForm(true)
  }

  const openEditJob = (job) => {
    setEditingJobId(job.id)
    setJobForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      job_type: job.job_type || 'full-time',
      experience: job.experience || '',
      salary: job.salary || '',
      category: job.category || 'Engineering',
      skills: (job.skills || []).join(', '),
      description: job.description || '',
      requirements: job.requirements || '',
      apply_url: job.apply_url || '',
      apply_email: job.apply_email || '',
      is_featured: !!job.is_featured,
      is_active: job.is_active !== false,
    })
    setShowJobForm(true)
  }

  const handleTogglePremium = async (user) => {
    try {
      await toggleUserPremium(user.id, !user.is_premium)
      toast.success(user.is_premium ? 'Pro access revoked' : 'Pro access granted')
      loadUsers()
      loadStats()
    } catch {
      toast.error('Could not update subscription')
    }
  }

  const saveTicketNotes = async (ticket) => {
    try {
      await updateAdminTicket(ticket.id, { admin_notes: ticketNotes[ticket.id] || '' })
      toast.success('Internal notes saved')
      loadTickets()
    } catch {
      toast.error('Could not save notes')
    }
  }

  if (step === 'checking') {
    return (
      <div className="ta-root ta-auth">
        <div className="ta-auth-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#171717' }} />
          <p style={{ margin: 0, color: '#6b6b6b', fontSize: 14 }}>Verifying session…</p>
        </div>
      </div>
    )
  }

  /* ── Auth screens ─────────────────────────────────────────── */
  if (step === 'login' || step === 'otp') {
    return (
      <div className="ta-root ta-auth">
        <div className="ta-auth-card">
          <div className="ta-auth-brand">
            <img src="/logos.png" alt="Logo" className="ta-auth-logo" style={{ objectFit: 'contain' }} />
            <h1 className="ta-auth-title">Nyrvexa Operations</h1>
            <p className="ta-auth-sub">
              Secure internal console for team members.
              <br />Not part of the public product.
            </p>
          </div>

          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <Field label="Team email" required>
                <input
                  type="email"
                  className="ta-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </Field>
              <Field label="Password" required>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="ta-input"
                    style={{ paddingRight: 44 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              <button type="submit" className="ta-btn ta-btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Lock size={16} /> Continue</>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ fontSize: 14, color: '#6b6b6b', marginBottom: 20, lineHeight: 1.5 }}>
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
              <Field label="Verification code" required>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="ta-input"
                  style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.35em', fontWeight: 700 }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </Field>
              <button
                type="submit"
                className="ta-btn ta-btn-primary"
                style={{ width: '100%' }}
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Verifying…' : 'Access dashboard'}
              </button>
              <button
                type="button"
                className="ta-btn ta-btn-ghost"
                style={{ width: '100%', marginTop: 12 }}
                onClick={() => { clearTeamAdminToken(); setStep('login') }}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                type="button"
                className="ta-btn ta-btn-ghost"
                style={{ width: '100%', marginTop: 8, fontSize: 13 }}
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend code
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: '#a3a3a3', marginTop: 28 }}>
            <Shield size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Authorized personnel only · Activity may be logged
          </p>
        </div>
      </div>
    )
  }

  /* ── Dashboard shell ──────────────────────────────────────── */
  return (
    <div className="ta-root">
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel || 'Confirm'}
        danger={confirm?.danger}
        loading={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm?.onConfirm) await confirm.onConfirm()
          setConfirm(null)
        }}
      />

      <aside className="ta-sidebar">
        <div className="ta-sidebar-brand">
          <img src="/logos.png" alt="Logo" className="ta-auth-logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <h1>Nyrvexa Ops</h1>
          <p>Internal console</p>
        </div>
        <nav className="ta-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`ta-nav-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={18} />
              {label}
              {id === 'support' && stats?.open_tickets > 0 && (
                <span className="ta-nav-badge">{stats.open_tickets}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="ta-sidebar-foot">
          <button type="button" className="ta-nav-btn" onClick={handleLogout}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="ta-main">
        <header className="ta-topbar">
          <div>
            <h2>{activeNav.label}</h2>
            <p>{activeNav.desc}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {lastRefresh && (
              <span style={{ fontSize: 12, color: '#6b6b6b' }}>
                Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button type="button" className="ta-btn ta-btn-secondary" onClick={refreshTab}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </header>

        <div className="ta-content">
          {/* Mobile tab strip */}
          <div className="ta-mobile-nav" style={{ display: 'none' }}>
            {NAV.map((n) => (
              <button key={n.id} type="button" className={`ta-btn ${activeTab === n.id ? 'ta-btn-primary' : 'ta-btn-secondary'}`} onClick={() => setActiveTab(n.id)}>
                {n.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              {statsLoading && !stats ? (
                <div className="ta-empty"><Loader2 className="animate-spin" size={32} /></div>
              ) : (
                <>
                  <div className="ta-stat-grid" style={{ marginBottom: 24 }}>
                    {[
                      { label: 'Total users', value: stats?.total_users ?? 0, icon: Users, bg: '#dbeafe', color: '#1d4ed8' },
                      { label: 'Pro subscribers', value: stats?.premium_users ?? 0, icon: Crown, bg: '#fef3c7', color: '#b45309' },
                      { label: 'Free accounts', value: stats?.free_users ?? 0, icon: UserCircle, bg: '#f3f4f6', color: '#4b5563' },
                      { label: 'Open tickets', value: stats?.open_tickets ?? 0, icon: Inbox, bg: '#fee2e2', color: '#b91c1c' },
                    ].map((s) => (
                      <div key={s.label} className="ta-card ta-stat">
                        <div className="ta-stat-icon" style={{ background: s.bg, color: s.color }}>
                          <s.icon size={22} />
                        </div>
                        <div>
                          <div className="ta-stat-value">{s.value}</div>
                          <div className="ta-stat-label">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ta-card" style={{ padding: 24, marginBottom: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Quick insights</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                      <div>
                        <p className="ta-hint">Pro conversion</p>
                        <p style={{ fontSize: 24, fontWeight: 700, margin: '4px 0 0' }}>{proRate}%</p>
                      </div>
                      <div>
                        <p className="ta-hint">Total support tickets</p>
                        <p style={{ fontSize: 24, fontWeight: 700, margin: '4px 0 0' }}>{stats?.total_tickets ?? 0}</p>
                      </div>
                      <div>
                        <p className="ta-hint">Live premium jobs</p>
                        <p style={{ fontSize: 24, fontWeight: 700, margin: '4px 0 0' }}>
                          {stats?.live_premium_jobs ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ta-card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Needs attention</h3>
                      <button type="button" className="ta-btn ta-btn-ghost" style={{ fontSize: 13 }} onClick={() => setActiveTab('support')}>
                        View all <ChevronRight size={14} />
                      </button>
                    </div>
                    {overviewTickets.length === 0 ? (
                      <div className="ta-empty" style={{ padding: 32 }}>
                        <Check size={32} />
                        <p>No open support tickets</p>
                      </div>
                    ) : (
                      overviewTickets.map((t) => (
                        <div key={t.id} className="ta-ticket">
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <strong style={{ fontSize: 14 }}>{t.ticket_ref}</strong>
                            <span className={`ta-badge ${STATUS_BADGE.open}`}>open</span>
                          </div>
                          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b6b6b' }}>{t.user_email}</p>
                          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5 }}>{t.message.slice(0, 120)}{t.message.length > 120 ? '…' : ''}</p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="ta-toolbar">
                <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a3a3a3' }} />
                  <input
                    className="ta-input"
                    style={{ paddingLeft: 38 }}
                    placeholder="Search name or email…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: 13, color: '#6b6b6b' }}>{users.length} shown</span>
              </div>
              <div className="ta-card ta-table-wrap">
                {usersLoading ? (
                  <div className="ta-empty"><Loader2 className="animate-spin" size={28} /></div>
                ) : users.length === 0 ? (
                  <div className="ta-empty"><Users size={40} /><p>No users match your search</p></div>
                ) : (
                  <table className="ta-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Plan</th>
                        <th>Joined</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10, background: '#f3f4f6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: 14,
                              }}>
                                {(u.name || u.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{u.name}</div>
                                <div style={{ fontSize: 13, color: '#6b6b6b' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`ta-badge ${u.is_premium ? 'ta-badge-pro' : 'ta-badge-free'}`}>
                              {u.is_premium ? <><Crown size={10} /> Pro</> : 'Free'}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: '#6b6b6b' }}>{formatDate(u.created_at)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="ta-btn ta-btn-secondary"
                              style={{ padding: '6px 12px', fontSize: 12, marginRight: 8 }}
                              onClick={() => handleTogglePremium(u)}
                            >
                              {u.is_premium ? 'Revoke Pro' : 'Grant Pro'}
                            </button>
                            <button
                              type="button"
                              className="ta-btn ta-btn-danger"
                              style={{ padding: '6px 12px', fontSize: 12 }}
                              onClick={() => setConfirm({
                                title: 'Delete user account',
                                message: `Permanently remove ${u.email}? All associated data may be lost.`,
                                confirmLabel: 'Delete',
                                danger: true,
                                onConfirm: async () => {
                                  setLoading(true)
                                  try {
                                    await deleteAdminUser(u.id)
                                    toast.success('User deleted')
                                    loadUsers()
                                    loadStats()
                                  } catch {
                                    toast.error('Delete failed')
                                  } finally {
                                    setLoading(false)
                                  }
                                },
                              })}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === 'support' && (
            <>
              <div className="ta-toolbar">
                {['', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
                  <button
                    key={s || 'all'}
                    type="button"
                    className={`ta-btn ${ticketFilter === s ? 'ta-btn-primary' : 'ta-btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: 13 }}
                    onClick={() => setTicketFilter(s)}
                  >
                    {s ? s.replace('_', ' ') : 'All'}
                  </button>
                ))}
              </div>
              <div className="ta-card">
                {ticketsLoading ? (
                  <div className="ta-empty"><Loader2 className="animate-spin" size={28} /></div>
                ) : tickets.length === 0 ? (
                  <div className="ta-empty">
                    <MessageSquare size={40} />
                    <p>No tickets in this view</p>
                    <p className="ta-hint">Submissions from nyrvexa.in/support appear here</p>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div key={t.id} className="ta-ticket">
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{t.ticket_ref}</span>
                          <span style={{ color: '#d4d4d4', margin: '0 8px' }}>|</span>
                          <span style={{ fontWeight: 500 }}>{t.user_name || 'Guest'}</span>
                          <a href={`mailto:${t.user_email}`} style={{ marginLeft: 8, fontSize: 13, color: '#0d9488' }}>
                            {t.user_email} <ExternalLink size={12} style={{ display: 'inline' }} />
                          </a>
                        </div>
                        <select
                          className="ta-input"
                          style={{ width: 'auto', minWidth: 140 }}
                          value={t.status}
                          onChange={async (e) => {
                            try {
                              await updateAdminTicket(t.id, { status: e.target.value })
                              toast.success('Status updated')
                              loadTickets()
                              loadStats()
                            } catch {
                              toast.error('Update failed')
                            }
                          }}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <span className={`ta-badge ${STATUS_BADGE[t.status] || 'ta-badge-closed'}`} style={{ marginBottom: 8 }}>
                        {t.subject}
                      </span>
                      <p style={{ margin: '12px 0', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{t.message}</p>
                      <p style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 12 }}>Received {formatDate(t.created_at)}</p>
                      <div className="ta-panel" style={{ margin: '0 -20px -20px', borderRadius: 0 }}>
                        <label className="ta-label">Internal notes (team only)</label>
                        <textarea
                          className="ta-input"
                          rows={2}
                          value={ticketNotes[t.id] ?? ''}
                          onChange={(e) => setTicketNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
                          placeholder="Resolution steps, follow-up reminders…"
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                          <button type="button" className="ta-btn ta-btn-secondary" onClick={() => saveTicketNotes(t)}>
                            <Save size={14} /> Save notes
                          </button>
                          <button
                            type="button"
                            className="ta-btn ta-btn-danger"
                            onClick={() => setConfirm({
                              title: 'Delete ticket',
                              message: `Remove ${t.ticket_ref} permanently?`,
                              confirmLabel: 'Delete',
                              danger: true,
                              onConfirm: async () => {
                                await deleteAdminTicket(t.id)
                                toast.success('Ticket removed')
                                loadTickets()
                                loadStats()
                              },
                            })}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'jobs' && (
            <>
              <div className="ta-toolbar">
                <button type="button" className="ta-btn ta-btn-primary" onClick={openNewJob}>
                  <Plus size={16} /> New listing
                </button>
                <span style={{ fontSize: 13, color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} /> Shown on Jobs page → Premium corner (Pro users)
                </span>
              </div>

              {showJobForm && (
                <form onSubmit={saveJob} className="ta-card" style={{ padding: 24, marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
                      {editingJobId ? 'Edit listing' : 'Create premium listing'}
                    </h3>
                    <button type="button" className="ta-btn ta-btn-ghost" onClick={() => { setShowJobForm(false); setEditingJobId(null) }}>
                      <X size={18} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 16px' }}>
                    <Field label="Job title" required><input className="ta-input" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required /></Field>
                    <Field label="Company" required><input className="ta-input" value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} required /></Field>
                    <Field label="Location"><input className="ta-input" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Bangalore · Hybrid" /></Field>
                    <Field label="Job type">
                      <select className="ta-input" value={jobForm.job_type} onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}>
                        {JOB_TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Experience"><input className="ta-input" value={jobForm.experience} onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })} /></Field>
                    <Field label="Salary"><input className="ta-input" value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} /></Field>
                    <Field label="Category">
                      <select className="ta-input" value={jobForm.category} onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Skills" hint="Comma-separated"><input className="ta-input" value={jobForm.skills} onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })} /></Field>
                  </div>
                  <Field label="Description"><textarea className="ta-input" rows={4} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} /></Field>
                  <Field label="Requirements"><textarea className="ta-input" rows={3} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} /></Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Apply URL"><input type="url" className="ta-input" value={jobForm.apply_url} onChange={(e) => setJobForm({ ...jobForm, apply_url: e.target.value })} /></Field>
                    <Field label="Apply email"><input type="email" className="ta-input" value={jobForm.apply_email} onChange={(e) => setJobForm({ ...jobForm, apply_email: e.target.value })} /></Field>
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                      <input type="checkbox" checked={jobForm.is_featured} onChange={(e) => setJobForm({ ...jobForm, is_featured: e.target.checked })} />
                      Featured (top of list)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                      <input type="checkbox" checked={jobForm.is_active} onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })} />
                      Live on website
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="ta-btn ta-btn-primary" disabled={loading}>
                      {loading ? 'Saving…' : editingJobId ? 'Save changes' : 'Publish listing'}
                    </button>
                    <button type="button" className="ta-btn ta-btn-secondary" onClick={() => { setShowJobForm(false); setEditingJobId(null) }}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="ta-card ta-table-wrap">
                {jobsLoading ? (
                  <div className="ta-empty"><Loader2 className="animate-spin" size={28} /></div>
                ) : jobs.length === 0 ? (
                  <div className="ta-empty">
                    <Briefcase size={40} />
                    <p>No premium listings yet</p>
                    <button type="button" className="ta-btn ta-btn-primary" style={{ marginTop: 12 }} onClick={openNewJob}>Create first listing</button>
                  </div>
                ) : (
                  <table className="ta-table">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Posted</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{job.title}</div>
                            <div style={{ fontSize: 13, color: '#6b6b6b' }}>{job.company} · {job.location || 'Remote'}</div>
                          </td>
                          <td>
                            {job.is_featured && <span className="ta-badge ta-badge-pro" style={{ marginRight: 6 }}>Featured</span>}
                            <span className={`ta-badge ${job.is_active ? 'ta-badge-live' : 'ta-badge-hidden'}`}>
                              {job.is_active ? 'Live' : 'Hidden'}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: '#6b6b6b' }}>{formatDate(job.created_at)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" className="ta-btn ta-btn-secondary" style={{ padding: 8, marginRight: 6 }} title={job.is_active ? 'Hide' : 'Publish'} onClick={async () => {
                              try {
                                await updateAdminJob(job.id, { is_active: !job.is_active })
                                toast.success(job.is_active ? 'Listing hidden' : 'Listing is live')
                                loadJobs()
                                if (activeTab === 'overview') loadStats()
                              } catch { toast.error('Update failed') }
                            }}>
                              {job.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button type="button" className="ta-btn ta-btn-secondary" style={{ padding: 8, marginRight: 6 }} onClick={() => openEditJob(job)}><Pencil size={16} /></button>
                            <button type="button" className="ta-btn ta-btn-danger" style={{ padding: 8 }} onClick={() => setConfirm({
                              title: 'Delete listing',
                              message: `Remove "${job.title}" at ${job.company}?`,
                              confirmLabel: 'Delete',
                              danger: true,
                              onConfirm: async () => {
                                await deleteAdminJob(job.id)
                                toast.success('Listing removed')
                                loadJobs()
                              },
                            })}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
