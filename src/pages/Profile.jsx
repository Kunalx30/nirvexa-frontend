import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../utils/helpers'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { fetchAlerts, createAlert, deleteAlert } from '../services/jobs'

import {
  Settings, MapPin, Briefcase, Zap, ShieldCheck, History,
  ArrowRight, BrainCircuit, Plus, Trash2, Loader2, Bell,
  X, RefreshCw
} from 'lucide-react'

const FREQUENCIES = ['daily', 'weekly']

export default function Profile() {
  const { user } = useAuth()

  // ── Alerts State ───────────────────────────────────────────────────────────
  const [alerts, setAlerts]             = useState([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [deletingId, setDeletingId]     = useState(null)

  // ── New Alert Form State ───────────────────────────────────────────────────
  const [showForm, setShowForm]         = useState(false)
  const [keywordsInput, setKeywordsInput] = useState('')
  const [location, setLocation]         = useState('')
  const [frequency, setFrequency]       = useState('daily')
  const [creating, setCreating]         = useState(false)

  // ── Fetch alerts on mount ──────────────────────────────────────────────────
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

  useEffect(() => { loadAlerts() }, [])

  // ── Create Alert ───────────────────────────────────────────────────────────
  const handleCreateAlert = async () => {
    const keywords = keywordsInput
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean)

    if (keywords.length === 0) {
      toast.error('Enter at least one keyword')
      return
    }

    setCreating(true)
    try {
      const res = await createAlert({ keywords, location, frequency })
      const newAlert = res.data?.data || res.data
      setAlerts(prev => [newAlert, ...prev])
      toast.success('Alert created!')
      // Reset form
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

  // ── Delete Alert ───────────────────────────────────────────────────────────
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-12 font-sans selection:bg-indigo-500/30">

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-10 z-10 relative pt-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Account Workspace</h1>
            <p className="text-gray-400 font-light mt-1">Manage your professional identity and AI preferences.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => toast('Public profile coming soon')}
          >
            View Public Profile <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">

          {/* USER TILE */}
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
                    <span className="text-gray-600 text-xs font-medium">Joined recently</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={() => toast('Edit profile coming soon')}
              >
                <Settings size={14} /> Edit Details
              </Button>
            </div>
          </div>

          {/* SECURITY */}
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
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => toast('Password change coming soon')}
            >
              Change Password
            </Button>
          </div>

          {/* SKILLS */}
          <div className="md:col-span-3 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">Professional Skills</h3>
              </div>
              <Button size="sm" variant="secondary" onClick={() => toast('Update skills coming soon')}>
                Update Tech Stack
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {user?.skills?.length ? (
                user.skills.map((skill, i) => (
                  <span key={i} className="group relative transition-all duration-300 hover:scale-105">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                    <span className="relative bg-dark-700 border border-white/5 text-gray-200 text-sm font-medium px-5 py-2.5 rounded-full inline-block group-hover:border-transparent transition-colors">
                      {skill}
                    </span>
                  </span>
                ))
              ) : (
                <div className="text-center py-6 w-full bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                  <p className="text-gray-500 text-sm">No skills mapped to your profile yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* PREFERENCES */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <h3 className="text-white font-semibold text-lg tracking-tight mb-6 flex items-center gap-3">
              <Settings className="text-gray-400" size={18} /> Career Preferences
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-gray-500" />
                  <p className="text-gray-400 text-sm">Preferred Location</p>
                </div>
                <p className="text-white font-medium text-sm">{user?.preferred_location || 'Remote'}</p>
              </div>
              <div className="flex items-center justify-between gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-gray-500" />
                  <p className="text-gray-400 text-sm">Job Type</p>
                </div>
                <p className="text-white font-medium text-sm">{user?.job_type || 'Full-time'}</p>
              </div>
            </div>
          </div>

          {/* ── JOB ALERTS ──────────────────────────────────────────────────── */}
          <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="text-amber-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">AI Job Alerts</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadAlerts}
                  className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-sm font-semibold rounded-xl transition-all"
                >
                  {showForm ? <X size={14} /> : <Plus size={14} />}
                  {showForm ? 'Cancel' : 'New Alert'}
                </button>
              </div>
            </div>

            {/* CREATE FORM */}
            {showForm && (
              <div className="mb-6 p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Create New Alert</p>

                {/* Keywords */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    Keywords <span className="text-gray-600">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Python, Data Analyst, React"
                    value={keywordsInput}
                    onChange={e => setKeywordsInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Location <span className="text-gray-600">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, Remote"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email Frequency</label>
                  <div className="flex gap-2">
                    {FREQUENCIES.map(f => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all capitalize ${
                          frequency === f
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleCreateAlert}
                  disabled={creating}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  {creating
                    ? <><Loader2 size={16} className="animate-spin" /> Creating...</>
                    : <><Bell size={16} /> Create Alert</>
                  }
                </button>
              </div>
            )}

            {/* ALERTS LIST */}
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                ))}
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
                  <div
                    key={alert.id}
                    className="flex items-start justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(alert.keywords || []).map((kw, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {alert.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {alert.location}
                          </span>
                        )}
                        <span className="capitalize flex items-center gap-1">
                          <Zap size={11} className="text-amber-500" /> {alert.frequency}
                        </span>
                        {alert.created_at && (
                          <span>
                            Created {new Date(alert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {/* Active badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          alert.is_active
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-gray-500/10 border-gray-500/20 text-gray-500'
                        }`}>
                          {alert.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      disabled={deletingId === alert.id}
                      className="p-2 rounded-xl text-gray-600 hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex-shrink-0 disabled:opacity-50"
                      title="Delete alert"
                    >
                      {deletingId === alert.id
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Trash2 size={16} />
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INTERVIEW HISTORY */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-center gap-3 mb-5">
              <History className="text-purple-400" size={20} />
              <h3 className="text-white font-semibold text-lg tracking-tight">Interview History</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
              <BrainCircuit size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm font-light">No AI mock interview sessions recorded yet.</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() => toast('Interview module coming in Phase 6B')}
              >
                Start Practice
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}