import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../utils/helpers'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { fetchAlerts, createAlert, deleteAlert } from '../services/jobs'
import { updateProfile, changePassword, fetchInterviewSessions } from '../services/api'
import {
  Settings, MapPin, Briefcase, Zap, ShieldCheck, History,
  ArrowRight, BrainCircuit, Plus, Trash2, Loader2, Bell,
  X, RefreshCw, Eye, EyeOff, CheckCircle2, TrendingUp,
  Mic, Clock, Star
} from 'lucide-react'

const FREQUENCIES = ['daily', 'weekly']

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'freelance', 'remote']
const EXP_LEVELS = ['fresher', 'junior', 'mid', 'senior', 'lead']
const LOCATIONS   = ['Remote', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Noida']

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

// ── Password Change Modal ─────────────────────────────────────────────────────
function PasswordModal({ onClose }) {
  const [current, setCurrent]         = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [loading, setLoading]         = useState(false)

  const handleSubmit = async () => {
    if (!current || !newPass || !confirm) {
      toast.error('Fill in all fields')
      return
    }
    if (newPass !== confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (newPass.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await changePassword({ current_password: current, new_password: newPass })
      toast.success('Password changed! Please log in again.')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight">Change Password</h3>
          <button onClick={onClose} className="text-[#8b8b8b] hover:text-[#0a0a0a] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current password */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-white/5 border border-[#e4e4e4] text-[#3a3a3a] placeholder-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8b8b] hover:text-[#3a3a3a]">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-white/5 border border-[#e4e4e4] text-[#3a3a3a] placeholder-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8b8b] hover:text-[#3a3a3a]">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Repeat new password"
              className="w-full bg-white/5 border border-[#e4e4e4] text-[#3a3a3a] placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f3f3f3] text-sm transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0a0a0a] font-semibold text-sm transition-all">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Profile Component ────────────────────────────────────────────────────
export default function Profile() {
  const { user, setUser } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || user?.avatarUrl || '')
  const [userName, setUserName] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [nameEdited, setNameEdited] = useState(false)

  useEffect(() => {
    if (user?.name) setUserName(user.name)
  }, [user?.name])

  const activePreset = GRADIENT_PRESETS.find(p => p.id === avatarUrl)

  // ── Password modal ─────────────────────────────────────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // ── Skills state ───────────────────────────────────────────────────────────
  const [skills, setSkills]           = useState(user?.skills || [])
  const [skillInput, setSkillInput]   = useState('')
  const [savingSkills, setSavingSkills] = useState(false)
  const [skillsEdited, setSkillsEdited] = useState(false)

  // ── Career preferences state ───────────────────────────────────────────────
  const [prefLocation, setPrefLocation]   = useState(user?.preferred_location || '')
  const [jobType, setJobType]             = useState(user?.job_type || 'full-time')
  const [expLevel, setExpLevel]           = useState(user?.experience_level || 'fresher')
  const [savingPrefs, setSavingPrefs]     = useState(false)
  const [prefsEdited, setPrefsEdited]     = useState(false)

  // ── Interview history state ────────────────────────────────────────────────
  const [sessions, setSessions]           = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  // ── Alerts state ───────────────────────────────────────────────────────────
  const [alerts, setAlerts]               = useState([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [deletingId, setDeletingId]       = useState(null)
  const [showForm, setShowForm]           = useState(false)
  const [keywordsInput, setKeywordsInput] = useState('')
  const [location, setLocation]           = useState('')
  const [frequency, setFrequency]         = useState('daily')
  const [creating, setCreating]           = useState(false)

  // ── Load data on mount ─────────────────────────────────────────────────────
  const loadAlerts = () => {
    setAlertsLoading(true)
    fetchAlerts()
      .then(res => {
        const data = res.data?.alerts || res.data?.data || res.data || []
        setAlerts(Array.isArray(data) ? data : [])
      })
      .catch(() => toast.error('Could not load alerts'))
      .finally(() => setAlertsLoading(false))
  }

  const loadSessions = () => {
    setSessionsLoading(true)
    fetchInterviewSessions()
      .then(res => {
        const data = res.data?.sessions || res.data?.data || []
        setSessions(Array.isArray(data) ? data.slice(0, 5) : [])
      })
      .catch(() => {})
      .finally(() => setSessionsLoading(false))
  }

  useEffect(() => {
    loadAlerts()
    loadSessions()
  }, [])

  // ── Skills handlers ────────────────────────────────────────────────────────
  const addSkill = () => {
    const s = skillInput.trim()
    if (!s) return
    if (skills.map(x => x.toLowerCase()).includes(s.toLowerCase())) {
      toast.error('Skill already added')
      return
    }
    setSkills(prev => [...prev, s])
    setSkillInput('')
    setSkillsEdited(true)
  }

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill))
    setSkillsEdited(true)
  }

  const saveSkills = async () => {
    setSavingSkills(true)
    try {
      const res = await updateProfile({ skills })
      if (setUser) setUser(res.data?.data?.user || res.data?.user)
      toast.success('Skills saved!')
      setSkillsEdited(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save skills')
    } finally {
      setSavingSkills(false)
    }
  }

  // ── Preferences handler ────────────────────────────────────────────────────
  const savePreferences = async () => {
    setSavingPrefs(true)
    try {
      const res = await updateProfile({
        preferred_location: prefLocation,
        job_type: jobType,
        experience_level: expLevel,
      })
      if (setUser) setUser(res.data?.data?.user || res.data?.user)
      toast.success('Preferences saved!')
      setPrefsEdited(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save preferences')
    } finally {
      setSavingPrefs(false)
    }
  }

  const saveAvatar = async (src) => {
    setAvatarUrl(src)
    const nextUser = { ...(user || {}), avatar_url: src }
    setUser?.(nextUser)
    try { localStorage.setItem('nirvexa_user', JSON.stringify(nextUser)) } catch {}
    try {
      await updateProfile({ avatar_url: src })
      toast.success('Avatar updated')
    } catch (err) {
      toast.error('Could not sync avatar with server')
    }
  }

  const saveBasicDetails = async () => {
    if (!userName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setSavingName(true)
    try {
      const res = await updateProfile({ name: userName.trim() })
      if (setUser) setUser(res.data?.data?.user || res.data?.user)
      toast.success('Name updated successfully!')
      setNameEdited(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save basic details')
    } finally {
      setSavingName(false)
    }
  }

  const calculateProfileStrength = () => {
    let score = 0
    let reasons = []

    if (userName.trim().length >= 2) {
      score += 15
    } else {
      reasons.push('Add your name')
    }

    if (avatarUrl) {
      score += 15
    } else {
      reasons.push('Select an avatar gradient')
    }

    if (skills && skills.length > 0) {
      score += 25
    } else {
      reasons.push('Add core technical skills')
    }

    if (prefLocation && expLevel && jobType) {
      score += 20
    } else {
      reasons.push('Set your preferred location, job type, and experience')
    }

    if (alerts && alerts.length > 0) {
      score += 25
    } else {
      reasons.push('Set up at least one AI Job Alert')
    }

    return { score, reasons }
  }

  const { score: profileStrength, reasons: pendingTasks } = calculateProfileStrength()

  // ── Alert handlers ─────────────────────────────────────────────────────────
  const handleCreateAlert = async () => {
    const keywords = keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
    if (keywords.length === 0) { toast.error('Enter at least one keyword'); return }
    setCreating(true)
    try {
      const res = await createAlert({ keywords, location, frequency })
      const newAlert = res.data?.data || res.data
      setAlerts(prev => [newAlert, ...prev])
      toast.success('Alert created!')
      setKeywordsInput('')
      setLocation('')
      setFrequency('daily')
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create alert')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Delete this job alert?')) return
    setDeletingId(alertId)
    setAlerts(prev => prev.filter(a => a.id !== alertId))
    try {
      await deleteAlert(alertId)
      toast.success('Alert deleted')
    } catch {
      toast.error('Could not delete alert')
      loadAlerts()
    } finally {
      setDeletingId(null)
    }
  }

  // ── Score color helper ─────────────────────────────────────────────────────
  const scoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-rose-600'
  }

  const modeBadgeColor = (mode) => {
    const map = {
      hr: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
      technical: 'bg-purple-500/10 border-purple-500/20 text-purple-600',
      stress: 'bg-rose-500/10 border-rose-500/20 text-rose-600',
      mock: 'bg-teal-500/10 border-teal-500/20 text-teal-600',
    }
    return map[mode] || 'bg-gray-500/10 border-gray-500/20 text-[#6b6b6b]'
  }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-12 font-sans selection:bg-indigo-500/30">

        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-50/60 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-10 z-10 relative pt-4">
          <div>
            <h1 className="text-3xl font-serif text-[#0a0a0a] tracking-tight">Account Workspace</h1>
            <p className="text-[#6b6b6b] font-light mt-1">Manage your professional identity and AI preferences.</p>
          </div>
          <Button variant="secondary" size="sm" className="gap-2"
            onClick={() => toast('Public profile coming soon')}>
            View Public Profile <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">

          {/* ── USER TILE ── */}
          <div className="md:col-span-2 bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg border border-[#e4e4e4] transition-all duration-300 hover:scale-105"
                  style={{
                    background: activePreset
                      ? `linear-gradient(135deg, ${activePreset.from}, ${activePreset.to})`
                      : 'linear-gradient(135deg, #2563eb, #a855f7)',
                  }}
                >
                  {getInitials(userName || user?.name || 'U')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0a0a0a] tracking-tight">{user?.name || 'User'}</h2>
                  <p className="text-[#6b6b6b] text-base font-light">{user?.email || 'No email available'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="badge-blue text-xs px-3 py-1">
                      {user?.is_premium ? 'Pro Member' : 'Free Member'}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${
                      user?.is_premium
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b]'
                    }`}>
                      {user?.is_premium ? 'Premium tools unlocked' : 'Daily free limits active'}
                    </span>
                    <span className="text-[#a3a3a3] text-xs font-medium">
                      {user?.experience_level ? user.experience_level.charAt(0).toUpperCase() + user.experience_level.slice(1) : 'Fresher'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable basic details */}
            <div className="space-y-4 mt-6 pt-6 border-t border-[#ededed]">
              <h3 className="text-[#0a0a0a] font-bold text-base tracking-tight">Basic Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#8b8b8b] mb-1.5 block">Full Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value)
                        setNameEdited(true)
                      }}
                      className="flex-1 bg-[#fafafa] border border-[#e4e4e4] text-[#3a3a3a] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="Your name"
                    />
                    {nameEdited && (
                      <button
                        onClick={saveBasicDetails}
                        disabled={savingName}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                      >
                        {savingName ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#8b8b8b] mb-1.5 block">Email Address</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-[#f3f3f3] border border-[#e4e4e4] text-[#8b8b8b] rounded-xl px-4 py-2 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Premium presets selection */}
            <div className="mt-6 pt-6 border-t border-[#ededed]">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b]">Profile Theme Gradient</p>
                  <p className="text-sm text-[#6b6b6b] mt-1">Select a premium, professional gradient for your account's visual identity.</p>
                </div>
                {avatarUrl && (
                  <button
                    onClick={() => saveAvatar('')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f3f3f3]"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {GRADIENT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => saveAvatar(p.id)}
                    title={p.label}
                    className={`h-11 w-full rounded-xl border flex items-center justify-center transition-all ${
                      avatarUrl === p.id
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-95 shadow-inner'
                        : 'border-[#e4e4e4] bg-white hover:border-[#a3a3a3] hover:-translate-y-px'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── PROFILE STRENGTH & SECURITY ── */}
          <div className="flex flex-col gap-6">
            {/* Profile strength indicator card */}
            <div className="bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="text-indigo-600" size={20} />
                  <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight">Profile Strength</h3>
                </div>

                <div className="relative pt-1 mb-4">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full text-indigo-600 bg-indigo-50">
                        {profileStrength}% Complete
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-indigo-600">
                        {profileStrength === 100 ? 'Expert' : profileStrength >= 75 ? 'Professional' : profileStrength >= 40 ? 'Intermediate' : 'Beginner'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-[#f3f3f3]">
                    <div
                      style={{ width: `${profileStrength}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 ease-out rounded-full"
                    />
                  </div>
                </div>

                {pendingTasks.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-bold text-[#8b8b8b] uppercase tracking-wider">Next steps:</p>
                    <ul className="space-y-1 text-xs text-[#6b6b6b]">
                      {pendingTasks.map((t) => (
                        <li key={t} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold mt-4 flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    Your profile is fully optimized for AI recommendations!
                  </p>
                )}
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-emerald-600" size={20} />
                  <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight">Security</h3>
                </div>
                <p className="text-[#6b6b6b] text-sm font-light mb-5">
                  Keep your account secure. We recommend changing passwords regularly.
                </p>
              </div>
              <Button variant="secondary" className="w-full justify-center"
                onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
            </div>
          </div>

          {/* ── PROFESSIONAL SKILLS ── */}
          <div className="md:col-span-3 bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-600" size={20} />
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight tracking-tight">Professional Skills</h3>
              </div>
              {skillsEdited && (
                <button onClick={saveSkills} disabled={savingSkills}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-sm text-blue-600 text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                  {savingSkills
                    ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                    : <><CheckCircle2 size={13} /> Save Skills</>}
                </button>
              )}
            </div>

            {/* Skill chips */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
              {skills.length > 0 ? skills.map((skill, i) => (
                <span key={i}
                  className="group flex items-center gap-1.5 bg-dark-700 border border-[#e4e4e4] text-[#3a3a3a] text-sm font-medium px-4 py-2 rounded-full hover:border-[#a3a3a3] transition-all">
                  {skill}
                  <button onClick={() => removeSkill(skill)}
                    className="text-[#a3a3a3] hover:text-rose-600 transition-colors ml-1">
                    <X size={12} />
                  </button>
                </span>
              )) : (
                <p className="text-[#a3a3a3] text-sm">No skills added yet. Type below to add.</p>
              )}
            </div>

            {/* Add skill input */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="e.g. Python, React, SQL"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addSkill() }}
                className="flex-1 bg-white/5 border border-[#e4e4e4] text-[#3a3a3a] placeholder-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button onClick={addSkill}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#e4e4e4] text-[#3a3a3a] rounded-xl text-sm transition-all flex items-center gap-1.5">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* ── CAREER PREFERENCES ── */}
          <div className="bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight tracking-tight flex items-center gap-3">
                <Settings className="text-[#6b6b6b]" size={18} /> Career Preferences
              </h3>
              {prefsEdited && (
                <button onClick={savePreferences} disabled={savingPrefs}
                  className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 shadow-sm text-teal-600 text-xs font-semibold rounded-xl transition-all disabled:opacity-60">
                  {savingPrefs
                    ? <><Loader2 size={12} className="animate-spin" /> Saving...</>
                    : <><CheckCircle2 size={12} /> Save</>}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Preferred Location */}
              <div>
                <label className="text-xs text-[#8b8b8b] mb-1.5 flex items-center gap-1.5">
                  <MapPin size={11} /> Preferred Location
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(loc => (
                    <button key={loc} onClick={() => { setPrefLocation(loc); setPrefsEdited(true) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        prefLocation === loc
                          ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm'
                          : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#3a3a3a] hover:border-[#a3a3a3]'
                      }`}>
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="text-xs text-[#8b8b8b] mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={11} /> Job Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map(type => (
                    <button key={type} onClick={() => { setJobType(type); setPrefsEdited(true) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                        jobType === type
                          ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm'
                          : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#3a3a3a] hover:border-[#a3a3a3]'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-xs text-[#8b8b8b] mb-1.5 flex items-center gap-1.5">
                  <TrendingUp size={11} /> Experience Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXP_LEVELS.map(level => (
                    <button key={level} onClick={() => { setExpLevel(level); setPrefsEdited(true) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                        expLevel === level
                          ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm'
                          : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#3a3a3a] hover:border-[#a3a3a3]'
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── JOB ALERTS ── */}
          <div className="md:col-span-2 bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="text-amber-600" size={20} />
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight tracking-tight">AI Job Alerts</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadAlerts}
                  className="p-2 rounded-xl text-[#8b8b8b] hover:text-[#0a0a0a] hover:bg-[#f3f3f3] transition-colors" title="Refresh">
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm text-amber-600 text-sm font-semibold rounded-xl transition-all">
                  {showForm ? <X size={14} /> : <Plus size={14} />}
                  {showForm ? 'Cancel' : 'New Alert'}
                </button>
              </div>
            </div>

            {/* Create form */}
            {showForm && (
              <div className="mb-6 p-5 bg-[#fcfcfc] border border-[#e4e4e4] shadow-sm rounded-2xl space-y-4">
                <p className="text-xs font-medium text-[#8b8b8b] uppercase tracking-wider">Create New Alert</p>
                <div>
                  <label className="text-xs text-[#6b6b6b] mb-1.5 block">Keywords <span className="text-[#a3a3a3]">(comma separated)</span></label>
                  <input type="text" placeholder="e.g. Python, Data Analyst, React"
                    value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)}
                    className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all" />
                </div>
                <div>
                  <label className="text-xs text-[#6b6b6b] mb-1.5 block">Location <span className="text-[#a3a3a3]">(optional)</span></label>
                  <input type="text" placeholder="e.g. Bangalore, Remote"
                    value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all" />
                </div>
                <div>
                  <label className="text-xs text-[#6b6b6b] mb-1.5 block">Email Frequency</label>
                  <div className="flex gap-2">
                    {FREQUENCIES.map(f => (
                      <button key={f} onClick={() => setFrequency(f)}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all capitalize ${
                          frequency === f
                            ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm'
                            : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm'
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleCreateAlert} disabled={creating}
                  className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none">
                  {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Bell size={16} /> Create Alert</>}
                </button>
              </div>
            )}

            {/* Alerts list */}
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl animate-pulse" />)}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-[#f9f9f9] border border-dashed border-[#c4c4c4] rounded-2xl">
                <Bell size={32} className="text-[#c4c4c4] mx-auto mb-3" />
                <p className="text-[#6b6b6b] text-sm font-medium">No alerts set up yet.</p>
                <p className="text-[#a3a3a3] font-medium text-xs mt-1">Job alerts are included with Pro.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id}
                    className="flex items-start justify-between gap-4 p-4 bg-white shadow-sm border border-[#e4e4e4] hover:border-[#c4c4c4] hover:shadow-md hover:-translate-y-px rounded-2xl transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(alert.keywords || []).map((kw, i) => (
                          <span key={i} className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-600">
                            {kw}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#8b8b8b]">
                        {alert.location && <span className="flex items-center gap-1"><MapPin size={11} /> {alert.location}</span>}
                        <span className="capitalize flex items-center gap-1"><Zap size={11} className="text-amber-500" /> {alert.frequency}</span>
                        {alert.created_at && (
                          <span>Created {new Date(alert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          alert.is_active
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                            : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#8b8b8b] shadow-sm'
                        }`}>
                          {alert.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAlert(alert.id)} disabled={deletingId === alert.id}
                      className="p-2 rounded-xl text-[#a3a3a3] hover:bg-rose-500/10 hover:text-rose-600 transition-colors flex-shrink-0 disabled:opacity-50">
                      {deletingId === alert.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── INTERVIEW HISTORY ── */}
          <div className="md:col-span-3 bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="text-purple-600" size={20} />
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight tracking-tight">Interview History</h3>
                <span className="text-xs font-semibold text-[#8b8b8b]">Last 5 only</span>
              </div>
              <button onClick={loadSessions}
                className="p-2 rounded-xl text-[#8b8b8b] hover:text-[#0a0a0a] hover:bg-[#f3f3f3] transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>

            {sessionsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl animate-pulse" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-[#fcfcfc] rounded-2xl border border-dashed border-white/10">
                <Mic size={32} className="text-[#c4c4c4] mb-3" />
                <p className="text-[#8b8b8b] text-sm font-light">No mock interview sessions recorded yet.</p>
                <p className="text-[#a3a3a3] text-xs mt-1">Complete a voice or text interview to see your history here.</p>
                <Button size="sm" variant="secondary" className="mt-4"
                  onClick={() => window.location.href = '/interview'}>
                  Start Practice
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map(session => (
                  <div key={session.id}
                    className="p-5 bg-white shadow-sm border border-[#e4e4e4] hover:border-[#c4c4c4] hover:shadow-md hover:-translate-y-px rounded-2xl transition-all">
                    {/* Mode + difficulty */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border capitalize ${modeBadgeColor(session.mode)}`}>
                        {session.mode}
                      </span>
                      {session.difficulty && (
                        <span className="text-[11px] text-[#8b8b8b] capitalize">{session.difficulty}</span>
                      )}
                    </div>

                    {/* Role */}
                    <p className="text-[#0a0a0a] font-bold text-sm tracking-tight mb-1 truncate">{session.role}</p>

                    {/* Score */}
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={13} className="text-amber-600" />
                      <span className={`text-lg font-bold ${scoreColor(session.total_score || 0)}`}>
                        {session.total_score ? Math.round(session.total_score) : '—'}
                      </span>
                      <span className="text-[#a3a3a3] text-xs">/ 100</span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-[#a3a3a3]">
                      {session.avg_wpm > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp size={11} /> {Math.round(session.avg_wpm)} wpm
                        </span>
                      )}
                      {session.completed_at && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(session.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}
