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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#111116] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Change Password</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current password */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Repeat new password"
              className="w-full bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all">
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
        setSessions(Array.isArray(data) ? data : [])
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
    if (score >= 75) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-rose-400'
  }

  const modeBadgeColor = (mode) => {
    const map = {
      hr: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      technical: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      stress: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      mock: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    }
    return map[mode] || 'bg-gray-500/10 border-gray-500/20 text-gray-400'
  }

  return (
    <Layout>
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-12 font-sans selection:bg-indigo-500/30">

        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-10 z-10 relative pt-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Account Workspace</h1>
            <p className="text-gray-400 font-light mt-1">Manage your professional identity and AI preferences.</p>
          </div>
          <Button variant="secondary" size="sm" className="gap-2"
            onClick={() => toast('Public profile coming soon')}>
            View Public Profile <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">

          {/* ── USER TILE ── */}
          <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-purple-500/20 border border-white/10">
                  {getInitials(user?.name || 'U')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name || 'User'}</h2>
                  <p className="text-gray-400 text-base font-light">{user?.email || 'No email available'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="badge-blue text-xs px-3 py-1">Member</span>
                    <span className="text-gray-600 text-xs font-medium">
                      {user?.experience_level ? user.experience_level.charAt(0).toUpperCase() + user.experience_level.slice(1) : 'Fresher'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECURITY ── */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col justify-between transition-all hover:border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-emerald-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">Security</h3>
              </div>
              <p className="text-gray-400 text-sm font-light mb-5">
                Keep your account secure. We recommend changing passwords regularly.
              </p>
            </div>
            <Button variant="secondary" className="w-full justify-center"
              onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
          </div>

          {/* ── PROFESSIONAL SKILLS ── */}
          <div className="md:col-span-3 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">Professional Skills</h3>
              </div>
              {skillsEdited && (
                <button onClick={saveSkills} disabled={savingSkills}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
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
                  className="group flex items-center gap-1.5 bg-dark-700 border border-white/10 text-gray-200 text-sm font-medium px-4 py-2 rounded-full hover:border-white/20 transition-all">
                  {skill}
                  <button onClick={() => removeSkill(skill)}
                    className="text-gray-600 hover:text-rose-400 transition-colors ml-1">
                    <X size={12} />
                  </button>
                </span>
              )) : (
                <p className="text-gray-600 text-sm">No skills added yet. Type below to add.</p>
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
                className="flex-1 bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button onClick={addSkill}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all flex items-center gap-1.5">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* ── CAREER PREFERENCES ── */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg tracking-tight flex items-center gap-3">
                <Settings className="text-gray-400" size={18} /> Career Preferences
              </h3>
              {prefsEdited && (
                <button onClick={savePreferences} disabled={savingPrefs}
                  className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-xl transition-all disabled:opacity-60">
                  {savingPrefs
                    ? <><Loader2 size={12} className="animate-spin" /> Saving...</>
                    : <><CheckCircle2 size={12} /> Save</>}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Preferred Location */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={11} /> Preferred Location
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(loc => (
                    <button key={loc} onClick={() => { setPrefLocation(loc); setPrefsEdited(true) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        prefLocation === loc
                          ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                          : 'bg-white/3 border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20'
                      }`}>
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={11} /> Job Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map(type => (
                    <button key={type} onClick={() => { setJobType(type); setPrefsEdited(true) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                        jobType === type
                          ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                          : 'bg-white/3 border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <TrendingUp size={11} /> Experience Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXP_LEVELS.map(level => (
                    <button key={level} onClick={() => { setExpLevel(level); setPrefsEdited(true) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                        expLevel === level
                          ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                          : 'bg-white/3 border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20'
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── JOB ALERTS ── */}
          <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="text-amber-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">AI Job Alerts</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadAlerts}
                  className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors" title="Refresh">
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-sm font-semibold rounded-xl transition-all">
                  {showForm ? <X size={14} /> : <Plus size={14} />}
                  {showForm ? 'Cancel' : 'New Alert'}
                </button>
              </div>
            </div>

            {/* Create form */}
            {showForm && (
              <div className="mb-6 p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Create New Alert</p>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Keywords <span className="text-gray-600">(comma separated)</span></label>
                  <input type="text" placeholder="e.g. Python, Data Analyst, React"
                    value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Location <span className="text-gray-600">(optional)</span></label>
                  <input type="text" placeholder="e.g. Bangalore, Remote"
                    value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email Frequency</label>
                  <div className="flex gap-2">
                    {FREQUENCIES.map(f => (
                      <button key={f} onClick={() => setFrequency(f)}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all capitalize ${
                          frequency === f
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleCreateAlert} disabled={creating}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20">
                  {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Bell size={16} /> Create Alert</>}
                </button>
              </div>
            )}

            {/* Alerts list */}
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                <Bell size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-light">No alerts set up yet.</p>
                <p className="text-gray-600 text-xs mt-1">Create one above to get daily job matches by email.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id}
                    className="flex items-start justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(alert.keywords || []).map((kw, i) => (
                          <span key={i} className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400">
                            {kw}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {alert.location && <span className="flex items-center gap-1"><MapPin size={11} /> {alert.location}</span>}
                        <span className="capitalize flex items-center gap-1"><Zap size={11} className="text-amber-500" /> {alert.frequency}</span>
                        {alert.created_at && (
                          <span>Created {new Date(alert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          alert.is_active
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-gray-500/10 border-gray-500/20 text-gray-500'
                        }`}>
                          {alert.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAlert(alert.id)} disabled={deletingId === alert.id}
                      className="p-2 rounded-xl text-gray-600 hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex-shrink-0 disabled:opacity-50">
                      {deletingId === alert.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── INTERVIEW HISTORY ── */}
          <div className="md:col-span-3 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="text-purple-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">Interview History</h3>
              </div>
              <button onClick={loadSessions}
                className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>

            {sessionsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <Mic size={32} className="text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm font-light">No mock interview sessions recorded yet.</p>
                <p className="text-gray-600 text-xs mt-1">Complete a voice or text interview to see your history here.</p>
                <Button size="sm" variant="secondary" className="mt-4"
                  onClick={() => window.location.href = '/interview'}>
                  Start Practice
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map(session => (
                  <div key={session.id}
                    className="p-5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                    {/* Mode + difficulty */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border capitalize ${modeBadgeColor(session.mode)}`}>
                        {session.mode}
                      </span>
                      {session.difficulty && (
                        <span className="text-[11px] text-gray-500 capitalize">{session.difficulty}</span>
                      )}
                    </div>

                    {/* Role */}
                    <p className="text-white font-medium text-sm mb-1 truncate">{session.role}</p>

                    {/* Score */}
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={13} className="text-amber-400" />
                      <span className={`text-lg font-bold ${scoreColor(session.total_score || 0)}`}>
                        {session.total_score ? Math.round(session.total_score) : '—'}
                      </span>
                      <span className="text-gray-600 text-xs">/ 100</span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
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