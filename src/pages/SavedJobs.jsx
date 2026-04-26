import Layout from '../components/layout/Layout'
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink, Bookmark, Trash2, Building2, MapPin,
  FolderOpen, Loader2, AlertCircle, RefreshCw
} from 'lucide-react'
import { fetchSavedJobs, updateSavedJob, deleteSavedJob } from '../services/jobs'
import toast from 'react-hot-toast'

const STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

const getStatusStyles = (status) => {
  switch (status) {
    case 'Applied':   return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    case 'Interview': return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    case 'Offer':     return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    case 'Rejected':  return 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    default:          return 'bg-gray-500/10 border-gray-500/30 text-gray-400'
  }
}

export default function SavedJobs() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [notesDraft, setNotesDraft] = useState({})
  const [noteTimers, setNoteTimers] = useState({})

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetchSavedJobs()
      // Backend returns { saved_jobs: [...], total: N }
      const data = res.data?.saved_jobs || res.data?.data || res.data || []
      const list = Array.isArray(data) ? data : []
      setJobs(list)
      const drafts = {}
      list.forEach(sj => { drafts[sj.id] = sj.notes || '' })
      setNotesDraft(drafts)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load saved jobs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Update Status ──────────────────────────────────────────────────────────
  const updateStatus = async (savedJobId, newStatus) => {
    if (updatingId === savedJobId) return
    setUpdatingId(savedJobId)
    setJobs(prev => prev.map(j => j.id === savedJobId ? { ...j, status: newStatus } : j))
    try {
      await updateSavedJob(savedJobId, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
    } catch {
      toast.error('Could not update status')
      load()
    } finally {
      setUpdatingId(null)
    }
  }

  // ── Notes debounced save ───────────────────────────────────────────────────
  const handleNotesChange = (savedJobId, value) => {
    setNotesDraft(prev => ({ ...prev, [savedJobId]: value }))
    setNoteTimers(prev => {
      if (prev[savedJobId]) clearTimeout(prev[savedJobId])
      const timer = setTimeout(async () => {
        try {
          await updateSavedJob(savedJobId, { notes: value })
        } catch {
          toast.error('Could not save notes')
        }
      }, 1000)
      return { ...prev, [savedJobId]: timer }
    })
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const removeJob = async (savedJobId) => {
    if (!window.confirm('Remove this job from your tracker?')) return
    setDeletingId(savedJobId)
    setJobs(prev => prev.filter(j => j.id !== savedJobId))
    try {
      await deleteSavedJob(savedJobId)
      toast.success('Removed from saved jobs')
    } catch {
      toast.error('Could not remove job')
      load()
    } finally {
      setDeletingId(null)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-4">
          <div className="mb-10">
            <div className="h-4 bg-white/5 rounded-full w-28 mb-4 animate-pulse" />
            <div className="h-9 bg-white/5 rounded-lg w-48 mb-3 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-80 animate-pulse" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[#111116]/80 border border-white/5 rounded-3xl p-8 h-64" />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-16">
          <div className="text-center py-20 px-4 bg-rose-500/5 border border-rose-500/20 rounded-3xl">
            <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load saved jobs</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={load}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* HEADER */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 w-fit mb-2 backdrop-blur-sm">
            <Bookmark size={14} />
            <span>Application Tracker</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Saved Jobs</h1>
              <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
                Track your applications, manage interview stages, and keep notes.
                {jobs.length > 0 && (
                  <span className="text-white font-medium"> {jobs.length} job{jobs.length !== 1 ? 's' : ''} tracked.</span>
                )}
              </p>
            </div>
            <button
              onClick={load}
              className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors mt-1"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {jobs.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl mt-6 z-10 relative">
            <FolderOpen size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your tracker is empty</h3>
            <p className="text-gray-500 font-light max-w-sm mx-auto mb-6">
              Browse the job board and tap the bookmark icon on any listing to track it here.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 z-10 relative">
            {jobs.map(sj => {
              // Backend nests full job details under sj.job
              const jobData = sj.job || {}
              return (
                <div
                  key={sj.id}
                  className="group bg-[#111116]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col"
                >
                  {/* TOP */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
                          {jobData.title || 'Job Listing'}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusStyles(sj.status)}`}>
                          {sj.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-medium">
                        {jobData.company && (
                          <span className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-gray-500"/> {jobData.company}
                          </span>
                        )}
                        {jobData.location && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-gray-500"/> {jobData.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeJob(sj.id)}
                      disabled={deletingId === sj.id}
                      className="p-2 rounded-xl text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors -mr-2 -mt-2 disabled:opacity-50"
                    >
                      {deletingId === sj.id
                        ? <Loader2 size={18} className="animate-spin" />
                        : <Trash2 size={18} />
                      }
                    </button>
                  </div>

                  {/* STATUS TOGGLES */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 ml-1">Pipeline Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(status => (
                        <button
                          key={status}
                          onClick={() => updateStatus(sj.id, status)}
                          disabled={updatingId === sj.id}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 disabled:opacity-60 ${
                            sj.status === status
                              ? getStatusStyles(status)
                              : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NOTES */}
                  <div className="mb-6 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 ml-1">Private Notes</p>
                    <textarea
                      placeholder="Add interview notes, contacts, or reminders..."
                      value={notesDraft[sj.id] ?? ''}
                      onChange={(e) => handleNotesChange(sj.id, e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/5 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none min-h-[80px]"
                    />
                    <p className="text-[10px] text-gray-600 mt-1 ml-1">Auto-saved as you type</p>
                  </div>

                  {/* BOTTOM */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                      <Bookmark size={14} className="fill-gray-500" />
                      {sj.saved_at
                        ? `Saved ${new Date(sj.saved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                        : 'Saved to Tracker'
                      }
                    </div>

                    {jobData.id && (
                      <Link
                        to={`/jobs/${jobData.id}`}
                        className="flex items-center gap-1.5 text-white bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        View Details
                        <ExternalLink size={14} className="text-gray-400" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}