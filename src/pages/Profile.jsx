import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../utils/helpers'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { fetchAlerts, createAlert, deleteAlert } from '../services/jobs'
import { updateProfile, changePassword, fetchInterviewSessions, updatePublicSettings } from '../services/api'
import {
  Settings, MapPin, Briefcase, Zap, ShieldCheck, History,
  ArrowRight, BrainCircuit, Plus, Trash2, Loader2, Bell,
  X, RefreshCw, Eye, EyeOff, CheckCircle2, TrendingUp,
  Mic, Clock, Star, Moon, Sun, Globe, ExternalLink, Copy
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white border border-[#e4e4e4] rounded-3xl p-8 w-full max-w-md shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
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
                className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <button onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8b8b] hover:text-[#4b5563]">
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
                className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <button onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8b8b] hover:text-[#4b5563]">
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
              className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#fafafa] text-sm font-semibold transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-sm">
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
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || user?.avatarUrl || '')
  const [userName, setUserName] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [nameEdited, setNameEdited] = useState(false)

  // ── Tab Management ──
  const [activeTab, setActiveTab] = useState('profile')

  // ── Public Profile Settings state ─────────────────────────────────────────
  const [ppBio, setPpBio]                     = useState(user?.bio || '')
  const [ppLinkedin, setPpLinkedin]             = useState(user?.linkedin_url || '')
  const [ppGithub, setPpGithub]                 = useState(user?.github_url || '')
  const [ppPortfolio, setPpPortfolio]           = useState(user?.portfolio_url || '')
  const [ppLocation, setPpLocation]             = useState(user?.location_label || '')
  const [ppSkills, setPpSkills]                 = useState(user?.skills || [])
  const [ppSkillInput, setPpSkillInput]         = useState('')
  const [ppTargetRoles, setPpTargetRoles]       = useState(user?.target_roles || [])
  const [ppRoleInput, setPpRoleInput]           = useState('')
  const [ppPublic, setPpPublic]                 = useState(user?.public_profile_enabled ?? true)
  const [ppShowScores, setPpShowScores]         = useState(user?.show_interview_scores ?? true)
  const [ppShowSkillMatch, setPpShowSkillMatch] = useState(user?.show_skill_match ?? true)
  const [ppShowResume, setPpShowResume]         = useState(user?.show_resume_download ?? false)
  const [ppSaving, setPpSaving]                 = useState(false)
  const [ppEdited, setPpEdited]                 = useState(false)

  useEffect(() => {
    if (user) {
      if (user.name) setUserName(user.name)
      setPpBio(user.bio || '')
      setPpLinkedin(user.linkedin_url || '')
      setPpGithub(user.github_url || '')
      setPpPortfolio(user.portfolio_url || '')
      setPpLocation(user.location_label || '')
      setPpSkills(user.skills || [])
      setPpTargetRoles(user.target_roles || [])
      setPpPublic(user.public_profile_enabled ?? true)
      setPpShowScores(user.show_interview_scores ?? true)
      setPpShowSkillMatch(user.show_skill_match ?? true)
      setPpShowResume(user.show_resume_download ?? false)
      setSkills(user.skills || [])
      setPrefLocation(user.preferred_location || '')
      setJobType(user.job_type || 'full-time')
      setExpLevel(user.experience_level || 'fresher')
      setAvatarUrl(user.avatar_url || user.avatarUrl || '')
    }
  }, [user])

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

  // ── Public Profile Settings handlers ──────────────────────────────────────
  const ppAddSkill = () => {
    const s = ppSkillInput.trim()
    if (!s) return
    if (ppSkills.map(x => x.toLowerCase()).includes(s.toLowerCase())) {
      toast.error('Skill already added'); return
    }
    setPpSkills(prev => [...prev, s])
    setPpSkillInput('')
    setPpEdited(true)
  }
  const ppRemoveSkill = (skill) => {
    setPpSkills(prev => prev.filter(s => s !== skill))
    setPpEdited(true)
  }
  const ppAddRole = () => {
    const r = ppRoleInput.trim()
    if (!r) return
    if (ppTargetRoles.map(x => x.toLowerCase()).includes(r.toLowerCase())) {
      toast.error('Role already added'); return
    }
    setPpTargetRoles(prev => [...prev, r])
    setPpRoleInput('')
    setPpEdited(true)
  }
  const ppRemoveRole = (role) => {
    setPpTargetRoles(prev => prev.filter(r => r !== role))
    setPpEdited(true)
  }
  const savePublicSettings = async () => {
    setPpSaving(true)
    try {
      const res = await updatePublicSettings({
        bio: ppBio,
        linkedin_url: ppLinkedin,
        github_url: ppGithub,
        portfolio_url: ppPortfolio,
        location_label: ppLocation,
        skills: ppSkills,
        target_roles: ppTargetRoles,
        public_profile_enabled: ppPublic,
        show_interview_scores: ppShowScores,
        show_skill_match: ppShowSkillMatch,
        show_resume_download: ppShowResume,
      })
      const updated = res.data?.user || res.data?.data?.user
      if (updated && setUser) setUser(updated)
      toast.success('Public profile settings saved!')
      setPpEdited(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save settings')
    } finally {
      setPpSaving(false)
    }
  }
  const copyProfileUrl = () => {
    const url = `${window.location.origin}/u/${user?.username || ''}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Profile link copied!'),
      () => toast.error('Could not copy')
    )
  }

  const calculateProfileStrength = () => {
    let score = 0
    let reasons = []

    if (userName.trim().length >= 2) {
      score += 20
    } else {
      reasons.push('Add your name')
    }

    if (ppBio.trim().length > 10) {
      score += 20
    } else {
      reasons.push('Write a professional bio summary')
    }

    if (skills && skills.length > 0) {
      score += 20
    } else {
      reasons.push('Add core technical skills')
    }

    if (prefLocation && expLevel && jobType) {
      score += 20
    } else {
      reasons.push('Set career preferences')
    }

    if (alerts && alerts.length > 0) {
      score += 20
    } else {
      reasons.push('Set up an AI Job Alert')
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
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-rose-600'
  }

  const modeBadgeColor = (mode) => {
    const map = {
      hr: 'bg-blue-50 border-blue-100 text-blue-600',
      technical: 'bg-purple-50 border-purple-100 text-purple-600',
      stress: 'bg-rose-50 border-rose-100 text-rose-600',
      mock: 'bg-teal-50 border-teal-100 text-teal-600',
    }
    return map[mode] || 'bg-gray-50 border-gray-100 text-gray-500'
  }

  const tabs = [
    { id: 'profile', label: 'Profile Details', icon: Settings },
    { id: 'career', label: 'Skills & Career', icon: BrainCircuit },
    { id: 'alerts', label: 'Job Alerts', icon: Bell },
    { id: 'interviews', label: 'Interview History', icon: History },
    { id: 'security', label: 'Privacy & Security', icon: ShieldCheck },
  ]

  // ── Tab Render Functions ───────────────────────────────────────────────────
  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Basic details */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#e4e4e4]/80">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-sm border border-[#e4e4e4]/40 revert-dark select-none"
            style={{
              background: activePreset
                ? `linear-gradient(135deg, ${activePreset.from}, ${activePreset.to})`
                : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            }}
          >
            {getInitials(userName || user?.name || 'U')}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0a0a0a] tracking-tight">{user?.name || 'User'}</h3>
            <p className="text-[#6b6b6b] text-sm font-light">{user?.email || 'No email'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                user?.is_premium 
                  ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' 
                  : 'bg-[#fafafa] border-[#e4e4e4] text-[#8b8b8b]'
              }`}>
                {user?.is_premium ? 'Pro Member' : 'Free Member'}
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight mb-4">Basic Details</h3>
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
                className="flex-1 bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
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
              className="w-full bg-[#f3f3f3] border border-[#e4e4e4] text-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Directory and Bio settings */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight">Public Profile Details</h3>
            <p className="text-[#8b8b8b] text-xs font-light mt-0.5">Customize how you appear to recruiters on your public link.</p>
          </div>
          {ppEdited && (
            <button
              onClick={savePublicSettings}
              disabled={ppSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {ppSaving ? (
                <><Loader2 size={13} className="animate-spin" /> Saving...</>
              ) : (
                <>Save Profile</>
              )}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8b8b8b] mb-1.5 block">Professional Summary / Bio</label>
            <textarea
              rows={3}
              value={ppBio}
              onChange={(e) => { setPpBio(e.target.value); setPpEdited(true) }}
              placeholder="A short summary of your background, experience, goals, and what you build..."
              className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8b8b8b] mb-1.5 block">Location Label</label>
              <input
                type="text"
                value={ppLocation}
                onChange={(e) => { setPpLocation(e.target.value); setPpEdited(true) }}
                placeholder="e.g. Bangalore, India (Hybrid)"
                className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-[#8b8b8b] mb-1.5 block">LinkedIn Link</label>
              <input
                type="text"
                value={ppLinkedin}
                onChange={(e) => { setPpLinkedin(e.target.value); setPpEdited(true) }}
                placeholder="linkedin.com/in/username"
                className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-[#8b8b8b] mb-1.5 block">GitHub Link</label>
              <input
                type="text"
                value={ppGithub}
                onChange={(e) => { setPpGithub(e.target.value); setPpEdited(true) }}
                placeholder="github.com/username"
                className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-[#8b8b8b] mb-1.5 block">Personal Portfolio Website</label>
              <input
                type="text"
                value={ppPortfolio}
                onChange={(e) => { setPpPortfolio(e.target.value); setPpEdited(true) }}
                placeholder="https://yourwebsite.com"
                className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCareerTab = () => (
    <div className="space-y-6">
      {/* Core Technical Skills */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight">Core Technical Skills</h3>
            <p className="text-[#8b8b8b] text-xs font-light mt-0.5">Used for AI matching, search suggestions, and automated recommendations.</p>
          </div>
          {skillsEdited && (
            <button
              onClick={saveSkills}
              disabled={savingSkills}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {savingSkills ? (
                <><Loader2 size={13} className="animate-spin" /> Saving...</>
              ) : (
                <>Save Skills</>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
          {skills.length > 0 ? skills.map((skill, i) => (
            <span key={i}
              className="group flex items-center gap-1.5 bg-[#fafafa] border border-[#e4e4e4] text-[#4b5563] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-[#cbd5e1] hover:text-[#0a0a0a] transition-all">
              {skill}
              <button onClick={() => removeSkill(skill)}
                className="text-[#8b8b8b] hover:text-red-500 transition-colors ml-0.5">
                <X size={12} />
              </button>
            </span>
          )) : (
            <p className="text-[#8b8b8b] text-sm italic">No skills added yet. Type below to add.</p>
          )}
        </div>

        <div className="flex gap-2 max-w-sm">
          <input
            type="text"
            placeholder="e.g. React, Python, SQL"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSkill() }}
            className="flex-1 bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
          />
          <button onClick={addSkill}
            className="px-4 py-2 bg-white border border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] hover:bg-[#fafafa] rounded-xl text-sm font-semibold transition-all flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Target Roles & Public Skills */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight">Public Profile Portfolio Details</h3>
            <p className="text-[#8b8b8b] text-xs font-light mt-0.5">Define target roles and direct public skill highlights shown on your recruiter profile page.</p>
          </div>
          {ppEdited && (
            <button
              onClick={savePublicSettings}
              disabled={ppSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {ppSaving ? (
                <><Loader2 size={13} className="animate-spin" /> Saving...</>
              ) : (
                <>Save Portfolio</>
              )}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Target Roles */}
          <div>
            <label className="text-xs text-[#8b8b8b] mb-1.5 block">Target Job Roles</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
              {ppTargetRoles.length > 0 ? ppTargetRoles.map((role, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-[#fafafa] border border-[#e4e4e4] text-[#4b5563] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-[#cbd5e1] hover:text-[#0a0a0a] transition-all">
                  {role}
                  <button type="button" onClick={() => ppRemoveRole(role)} className="text-[#8b8b8b] hover:text-red-500 transition-colors ml-0.5"><X size={10} /></button>
                </span>
              )) : (
                <span className="text-[#8b8b8b] text-xs italic">No target roles specified.</span>
              )}
            </div>
            <div className="flex gap-2 max-w-xs">
              <input type="text" placeholder="Add target role..."
                value={ppRoleInput}
                onChange={(e) => setPpRoleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ppAddRole() } }}
                className="flex-1 bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button type="button" onClick={ppAddRole}
                className="px-3 py-1.5 bg-white border border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] hover:bg-[#fafafa] rounded-xl text-xs font-semibold transition-all flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
          </div>

          {/* Public Skills */}
          <div className="border-t border-[#e4e4e4]/80 pt-4">
            <label className="text-xs text-[#8b8b8b] mb-1.5 block">Public Skills List</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
              {ppSkills.length > 0 ? ppSkills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-[#fafafa] border border-[#e4e4e4] text-[#4b5563] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-[#cbd5e1] hover:text-[#0a0a0a] transition-all">
                  {skill}
                  <button type="button" onClick={() => ppRemoveSkill(skill)} className="text-[#8b8b8b] hover:text-red-500 transition-colors ml-0.5"><X size={10} /></button>
                </span>
              )) : (
                <span className="text-[#8b8b8b] text-xs italic">No specific public skills. (Falls back to core technical skills list).</span>
              )}
            </div>
            <div className="flex gap-2 max-w-xs">
              <input type="text" placeholder="Add public skill..."
                value={ppSkillInput}
                onChange={(e) => setPpSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ppAddSkill() } }}
                className="flex-1 bg-[#fafafa] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button type="button" onClick={ppAddSkill}
                className="px-3 py-1.5 bg-white border border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] hover:bg-[#fafafa] rounded-xl text-xs font-semibold transition-all flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Career Preferences */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight">Career Preferences</h3>
          {prefsEdited && (
            <button onClick={savePreferences} disabled={savingPrefs}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60">
              {savingPrefs ? (
                <><Loader2 size={12} className="animate-spin" /> Saving...</>
              ) : (
                <>Save Prefs</>
              )}
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Preferred Location */}
          <div>
            <label className="text-xs text-[#8b8b8b] mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Preferred Location
            </label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(loc => {
                const isSel = prefLocation === loc
                return (
                  <button key={loc} onClick={() => { setPrefLocation(loc); setPrefsEdited(true) }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSel
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] hover:bg-[#fafafa] hover:border-[#cbd5e1]'
                    }`}>
                    {loc}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="text-xs text-[#8b8b8b] mb-2 flex items-center gap-1.5">
              <Briefcase size={12} /> Job Type
            </label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map(type => {
                const isSel = jobType === type
                return (
                  <button key={type} onClick={() => { setJobType(type); setPrefsEdited(true) }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      isSel
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] hover:bg-[#fafafa] hover:border-[#cbd5e1]'
                    }`}>
                    {type.replace('-', ' ')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="text-xs text-[#8b8b8b] mb-2 flex items-center gap-1.5">
              <TrendingUp size={12} /> Experience Level
            </label>
            <div className="flex flex-wrap gap-2">
              {EXP_LEVELS.map(level => {
                const isSel = expLevel === level
                return (
                  <button key={level} onClick={() => { setExpLevel(level); setPrefsEdited(true) }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      isSel
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] hover:bg-[#fafafa] hover:border-[#cbd5e1]'
                    }`}>
                    {level}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center justify-between mb-6 border-b border-[#e4e4e4]/80 pb-4">
          <div>
            <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight flex items-center gap-2">
              <Zap className="text-amber-600" size={20} /> AI Job Alerts
            </h3>
            <p className="text-[#8b8b8b] text-xs font-light mt-0.5">Let our search co-pilot poll matching jobs and drop digests in your inbox.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAlerts}
              className="p-2 rounded-xl text-[#8b8b8b] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors" title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 text-xs font-bold rounded-xl transition-all shadow-sm">
              {showForm ? <X size={14} /> : <Plus size={14} />}
              {showForm ? 'Cancel' : 'New Alert'}
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-6 p-5 bg-[#fafafa] border border-[#e4e4e4] rounded-xl space-y-4">
            <p className="text-xs font-bold text-[#8b8b8b] uppercase tracking-wider">Create New Job Alert</p>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Keywords <span className="text-[#8b8b8b] font-light">(comma separated, e.g. React, Python)</span></label>
              <input type="text" placeholder="e.g. Frontend Engineer, Analyst"
                value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)}
                className="w-full bg-white border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Location Preference <span className="text-[#8b8b8b] font-light">(optional)</span></label>
              <input type="text" placeholder="e.g. Bangalore, Remote"
                value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-white border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Email Alert Frequency</label>
              <div className="flex gap-2">
                {FREQUENCIES.map(f => (
                  <button key={f} onClick={() => setFrequency(f)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all capitalize ${
                      frequency === f
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] hover:bg-[#fafafa]'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleCreateAlert} disabled={creating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-sm text-sm disabled:opacity-60">
              {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Bell size={16} /> Create Alert</>}
            </button>
          </div>
        )}

        {/* Alerts list */}
        {alertsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-16 bg-[#fafafa] border border-[#e4e4e4] rounded-2xl animate-pulse" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#fafafa] border border-dashed border-[#e4e4e4] rounded-2xl">
            <Bell size={28} className="text-[#8b8b8b] mx-auto mb-3" />
            <p className="text-[#4b5563] text-sm font-semibold">No alerts set up yet.</p>
            <p className="text-[#8b8b8b] text-xs mt-1">Get custom job matching alerts delivered directly to your inbox.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id}
                className="flex items-start justify-between gap-4 p-4 bg-white border border-[#e4e4e4] hover:border-[#cbd5e1] hover:shadow-sm rounded-xl transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(alert.keywords || []).map((kw, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-md">
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
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      alert.is_active
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-[#fafafa] border-[#e4e4e4] text-[#8b8b8b]'
                    }`}>
                      {alert.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDeleteAlert(alert.id)} disabled={deletingId === alert.id}
                  className="p-2 rounded-xl text-[#8b8b8b] hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-50">
                  {deletingId === alert.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderInterviewsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center justify-between mb-6 border-b border-[#e4e4e4]/80 pb-4">
          <div>
            <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight flex items-center gap-2">
              <History className="text-purple-600" size={20} /> Interview History
            </h3>
            <p className="text-[#8b8b8b] text-xs font-light mt-0.5">Review performance logs from your voice and text mock simulator sessions.</p>
          </div>
          <button onClick={loadSessions}
            className="p-2 rounded-xl text-[#8b8b8b] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        {sessionsLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-28 bg-[#fafafa] border border-[#e4e4e4] rounded-xl animate-pulse" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-[#fafafa] border border-dashed border-[#e4e4e4] rounded-2xl">
            <Mic size={30} className="text-[#8b8b8b] mb-3" />
            <p className="text-[#4b5563] text-sm font-semibold">No interview sessions found.</p>
            <p className="text-[#8b8b8b] text-xs mt-1">Practice mock interviews to generate score insights and report cards.</p>
            <Button size="sm" variant="secondary" className="mt-4 border-[#e4e4e4] bg-white text-[#4b5563] hover:text-[#0a0a0a]"
              onClick={() => window.location.href = '/interview'}>
              Start AI Mock Interview
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {sessions.map(session => (
              <div key={session.id}
                className="p-5 bg-white border border-[#e4e4e4] hover:border-[#cbd5e1] hover:shadow-sm rounded-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border capitalize ${modeBadgeColor(session.mode)}`}>
                      {session.mode}
                    </span>
                    {session.difficulty && (
                      <span className="text-[10px] text-[#8b8b8b] font-medium uppercase tracking-wider capitalize">{session.difficulty}</span>
                    )}
                  </div>
                  <p className="text-[#0a0a0a] font-bold text-sm tracking-tight mb-2 truncate">{session.role}</p>

                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className={`text-base font-bold ${scoreColor(session.total_score || 0)}`}>
                      {session.total_score ? Math.round(session.total_score) : '—'}
                    </span>
                    <span className="text-[#8b8b8b] text-xs">/ 100</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8b8b8b] pt-3 border-t border-[#fafafa]">
                  {session.avg_wpm > 0 ? (
                    <span className="flex items-center gap-1">
                      <TrendingUp size={11} /> {Math.round(session.avg_wpm)} WPM
                    </span>
                  ) : <span>—</span>}
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
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Public Profile Visibility */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex justify-between items-center mb-6 border-b border-[#e4e4e4]/80 pb-4">
          <div>
            <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight flex items-center gap-2">
              <Globe className="text-indigo-600" size={20} /> Public Profile Visibility
            </h3>
            <p className="text-[#8b8b8b] text-xs font-light mt-0.5">Toggle what recruiters can see when checking your landing page.</p>
          </div>
          {ppEdited && (
            <button
              onClick={savePublicSettings}
              disabled={ppSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {ppSaving ? (
                <><Loader2 size={13} className="animate-spin" /> Saving...</>
              ) : (
                <>Save Config</>
              )}
            </button>
          )}
        </div>

        <div className="space-y-5">
          <label className="flex items-start gap-3.5 cursor-pointer group">
            <input type="checkbox" checked={ppPublic}
              onChange={(e) => { setPpPublic(e.target.checked); setPpEdited(true) }}
              className="mt-1 rounded border-[#e4e4e4] bg-[#fafafa] text-indigo-600 focus:ring-indigo-500/30"
            />
            <div>
              <span className="text-sm font-semibold text-[#0a0a0a] group-hover:text-indigo-600 transition-colors">Enable Public Landing Page</span>
              <p className="text-xs text-[#6b6b6b] font-light mt-0.5">Allow recruiters to check your profile at `{window.location.origin}/u/{user?.username || 'username'}`</p>
            </div>
          </label>

          <label className="flex items-start gap-3.5 cursor-pointer group">
            <input type="checkbox" checked={ppShowScores}
              onChange={(e) => { setPpShowScores(e.target.checked); setPpEdited(true) }}
              className="mt-1 rounded border-[#e4e4e4] bg-[#fafafa] text-indigo-600 focus:ring-indigo-500/30"
            />
            <div>
              <span className="text-sm font-semibold text-[#0a0a0a] group-hover:text-indigo-600 transition-colors">Display Interview Performance Scores</span>
              <p className="text-xs text-[#6b6b6b] font-light mt-0.5">Highlight mock interview metrics (content, relevance, structures) to recruiters.</p>
            </div>
          </label>

          <label className="flex items-start gap-3.5 cursor-pointer group">
            <input type="checkbox" checked={ppShowSkillMatch}
              onChange={(e) => { setPpShowSkillMatch(e.target.checked); setPpEdited(true) }}
              className="mt-1 rounded border-[#e4e4e4] bg-[#fafafa] text-indigo-600 focus:ring-indigo-500/30"
            />
            <div>
              <span className="text-sm font-semibold text-[#0a0a0a] group-hover:text-indigo-600 transition-colors">Display Resume Skill Gap Analysis</span>
              <p className="text-xs text-[#6b6b6b] font-light mt-0.5">Show matching and missing keywords analysis from your latest uploaded resume.</p>
            </div>
          </label>

          <label className="flex items-start gap-3.5 cursor-pointer group">
            <input type="checkbox" checked={ppShowResume}
              onChange={(e) => { setPpShowResume(e.target.checked); setPpEdited(true) }}
              className="mt-1 rounded border-[#e4e4e4] bg-[#fafafa] text-indigo-600 focus:ring-indigo-500/30"
            />
            <div>
              <span className="text-sm font-semibold text-[#0a0a0a] group-hover:text-indigo-600 transition-colors">Enable Resume Download</span>
              <p className="text-xs text-[#6b6b6b] font-light mt-0.5">Allow guests to view and download your latest resume PDF directly.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight flex items-center gap-2 mb-2">
          <ShieldCheck className="text-green-600" size={20} /> Security & Account Credentials
        </h3>
        <p className="text-[#6b6b6b] text-sm font-light mb-5">
          Modify your security settings. We recommend changing your passwords periodically to maintain workspace security.
        </p>
        <button onClick={() => setShowPasswordModal(true)}
          className="px-5 py-2.5 bg-white border border-[#e4e4e4] hover:bg-[#fafafa] text-[#0a0a0a] hover:border-[#cbd5e1] text-sm font-semibold rounded-xl transition-all shadow-sm">
          Change Account Password
        </button>
      </div>

      {/* Theme Appearance */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <h3 className="text-[#0a0a0a] font-serif text-lg tracking-tight flex items-center gap-2 mb-2">
          {isDarkMode ? <Moon className="text-indigo-600" size={19} /> : <Sun className="text-amber-500" size={19} />}
          Theme Preferences
        </h3>
        <p className="text-[#6b6b6b] text-sm font-light mb-5">
          Select your default dashboard theme workspace. This updates your interface styles instantly.
        </p>
        <button onClick={toggleDarkMode}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e4e4e4] hover:bg-[#fafafa] hover:border-[#cbd5e1] text-[#0a0a0a] text-sm font-semibold rounded-xl transition-all shadow-sm">
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          {isDarkMode ? 'Switch to Light Workspace' : 'Switch to Dark Workspace'}
        </button>
      </div>
    </div>
  )

  return (
    <Layout>
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-12 font-sans text-[#0a0a0a] selection:bg-indigo-500/30 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 rg-grid-bg opacity-30 pointer-events-none z-0" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 z-10 relative pt-4 border-b border-[#e4e4e4]/80 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl rg-serif text-[#0a0a0a] tracking-tight">Account Workspace</h1>
            <p className="text-[#6b6b6b] font-light mt-1">Configure your professional identity, career matches, and co-pilot settings.</p>
          </div>
          {user?.username && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyProfileUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#fafafa] border border-[#e4e4e4] text-[#4b5563] hover:text-[#0a0a0a] rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                <Copy size={13} /> Copy Link
              </button>
              <button
                onClick={() => window.open(`/u/${user.username}`, '_blank')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                View Profile <ExternalLink size={13} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 z-10 relative">
          {/* Left Column: Tabs Navigation & Profile Strength card */}
          <div className="lg:col-span-1 space-y-6">
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-3 lg:pb-0 border-b border-[#e4e4e4]/60 lg:border-b-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white border border-[#e4e4e4] text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.015)]'
                        : 'text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#fafafa]'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-[#8b8b8b]'} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            {/* Profile Strength Check Card */}
            <div className="bg-white border border-[#e4e4e4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-2.5 mb-3">
                <Zap className="text-indigo-600" size={18} />
                <h4 className="text-sm font-bold text-[#0a0a0a] tracking-tight">Workspace Setup</h4>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-1.5 items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-full">
                    {profileStrength}% Complete
                  </span>
                  <span className="text-[#6b6b6b] font-medium">
                    {profileStrength === 100 ? 'Expert' : profileStrength >= 75 ? 'Professional' : 'Beginner'}
                  </span>
                </div>
                <div className="overflow-hidden h-2 flex rounded-full bg-gray-100 border border-[#e4e4e4]/20">
                  <div
                    style={{ width: `${profileStrength}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-700 ease-out rounded-full"
                  />
                </div>
              </div>
              {pendingTasks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#e4e4e4]/60">
                  <p className="text-[11px] font-bold text-[#8b8b8b] uppercase tracking-wider mb-2">Setup Checklist:</p>
                  <ul className="space-y-1.5 text-xs text-[#6b6b6b]">
                    {pendingTasks.map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Tab Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'career' && renderCareerTab()}
            {activeTab === 'alerts' && renderAlertsTab()}
            {activeTab === 'interviews' && renderInterviewsTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </div>
        </div>
      </div>
    </Layout>
  )
}
