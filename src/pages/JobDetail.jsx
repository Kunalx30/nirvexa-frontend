import Layout from '../components/layout/Layout'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Bookmark, MapPin, DollarSign, Clock, ExternalLink,
  ArrowLeft, Sparkles, Building2, Briefcase, Loader2, AlertCircle, Globe
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchJobById, saveJob, deleteSavedJob, fetchSavedJobs } from '../services/jobs'
import toast from 'react-hot-toast'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // ── Job Data State ─────────────────────────────────────────────────────────
  const [job, setJob]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  // ── Save State ─────────────────────────────────────────────────────────────
  const [savedRecordId, setSavedRecordId] = useState(null) // the saved_job row id
  const [saving, setSaving] = useState(false)

  // ── Fetch job by ID ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJobById(id)
      .then(res => {
        if (cancelled) return
        const data = res.data?.data || res.data
        setJob(data)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.response?.data?.message || 'Could not load this job listing.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  // ── Check if this job is already saved ────────────────────────────────────
  useEffect(() => {
    fetchSavedJobs()
      .then(res => {
        const list = res.data?.data || res.data || []
        const match = list.find(sj => String(sj.job_id) === String(id))
        if (match) setSavedRecordId(match.id)
      })
      .catch(() => {})
  }, [id])

  // ── Save / Unsave ──────────────────────────────────────────────────────────
  const toggleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      if (savedRecordId) {
        await deleteSavedJob(savedRecordId)
        setSavedRecordId(null)
        toast.success('Removed from saved jobs')
      } else {
        const res = await saveJob(id, 'Saved')
        const record = res.data?.data || res.data
        setSavedRecordId(record.id)
        toast.success('Job saved!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update saved jobs')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-4">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium mb-6">
            <ArrowLeft size={16} /> Back to Search
          </Link>
          <div className="grid md:grid-cols-3 gap-8 animate-pulse">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#111116]/80 border border-white/5 rounded-3xl p-8">
                <div className="h-8 bg-white/5 rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-white/5 rounded w-1/3 mb-8" />
                <div className="flex gap-3 mb-8 pb-8 border-b border-white/5">
                  {[80, 100, 70, 60].map((w, i) => (
                    <div key={i} className={`h-8 bg-white/5 rounded-lg`} style={{ width: w }} />
                  ))}
                </div>
                <div className="flex gap-4">
                  <div className="h-12 bg-white/5 rounded-xl flex-1" />
                  <div className="h-12 bg-white/5 rounded-xl w-32" />
                </div>
              </div>
              <div className="bg-blue-900/10 border border-blue-500/10 rounded-3xl p-8 h-32" />
              <div className="bg-[#111116]/80 border border-white/5 rounded-3xl p-8 h-48" />
            </div>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-[#111116]/60 border border-white/5 rounded-2xl p-5 h-28" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          {error
            ? <AlertCircle size={48} className="text-rose-400 mb-4" />
            : <Briefcase size={48} className="text-gray-700 mb-4" />
          }
          <h2 className="text-2xl font-bold text-white mb-2">
            {error ? 'Could not load job' : 'Listing Unavailable'}
          </h2>
          <p className="text-gray-500 font-light mb-6">
            {error || 'This job may have expired or been removed.'}
          </p>
          <Link to="/jobs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Job Board
          </Link>
        </div>
      </Layout>
    )
  }

  const isSaved = !!savedRecordId

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── BACK ────────────────────────────────────────────────────────── */}
        <div className="mb-6 z-10 relative pt-4">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 z-10 relative">

          {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-8">

            {/* HEADER CARD */}
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug mb-2">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-400 font-medium">
                    <span className="flex items-center gap-2 text-lg">
                      <Building2 size={18} className="text-gray-500" /> {job.company}
                    </span>
                    {job.source && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Globe size={14} /> {job.source}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile bookmark */}
                <button
                  onClick={toggleSave}
                  disabled={saving}
                  className="sm:hidden p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center w-full gap-2"
                >
                  {saving
                    ? <Loader2 size={20} className="animate-spin text-blue-400" />
                    : <Bookmark size={20} className={isSaved ? 'text-blue-400 fill-blue-400' : 'text-gray-400'} />
                  }
                  <span className="text-sm text-white font-medium">{isSaved ? 'Saved' : 'Save Job'}</span>
                </button>
              </div>

              {/* META PILLS */}
              <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-white/5">
                {job.location && (
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    <MapPin size={16} className="text-gray-500" /> {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">
                    <DollarSign size={16} /> {job.salary}
                  </div>
                )}
                {job.experience && (
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    <Clock size={16} className="text-gray-500" /> {job.experience}
                  </div>
                )}
                {job.type && (
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/10 text-indigo-400">
                    {job.type}
                  </div>
                )}
              </div>

              {/* DESKTOP ACTIONS */}
              <div className="hidden sm:flex gap-4">
                {job.apply_url ? (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25"
                  >
                    Apply Externally <ExternalLink size={16} />
                  </a>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-white/[0.03] border border-white/5 text-gray-500 text-sm font-medium px-6 py-3.5 rounded-xl">
                    No apply link available
                  </div>
                )}

                <button
                  onClick={toggleSave}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-medium transition-all border disabled:opacity-60 ${
                    isSaved
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {saving
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Bookmark size={18} className={isSaved ? 'fill-blue-400' : ''} />
                  }
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>

            {/* AI SUMMARY CARD — shown only if backend returns ai_summary */}
            {job.ai_summary && (
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <Sparkles size={100} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-blue-400" />
                    <h3 className="text-blue-400 font-semibold tracking-wide uppercase text-sm">AI Career Match Analysis</h3>
                  </div>
                  <p className="text-gray-200 text-base sm:text-lg font-light leading-relaxed">
                    {job.ai_summary}
                  </p>
                </div>
              </div>
            )}

            {/* DESCRIPTION & SKILLS */}
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8">

              {job.skills?.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-white mb-4">Required Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <span
                        key={skill}
                        className="text-sm font-medium px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.description && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Role Description</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-400 text-base font-light leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Posted date */}
              {job.posted_at && (
                <p className="text-xs text-gray-600 mt-8">
                  Posted: {new Date(job.posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white px-2">Quick Actions</h3>

            {/* Navigate to saved jobs */}
            <button
              onClick={() => navigate('/saved')}
              className="w-full bg-[#111116]/60 border border-white/5 hover:border-white/15 rounded-2xl p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <Bookmark size={18} className="text-purple-400" />
                <div>
                  <p className="text-white font-semibold group-hover:text-purple-400 transition-colors text-sm">View Saved Jobs</p>
                  <p className="text-gray-500 text-xs mt-0.5">Track your applications</p>
                </div>
              </div>
            </button>

            {/* Back to all jobs */}
            <button
              onClick={() => navigate('/jobs')}
              className="w-full bg-[#111116]/60 border border-white/5 hover:border-white/15 rounded-2xl p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <Briefcase size={18} className="text-blue-400" />
                <div>
                  <p className="text-white font-semibold group-hover:text-blue-400 transition-colors text-sm">Browse More Jobs</p>
                  <p className="text-gray-500 text-xs mt-0.5">Search all {job.source || ''} listings</p>
                </div>
              </div>
            </button>

            {/* Mobile Apply Button (Sticky Bottom) */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/10 z-50">
              {job.apply_url ? (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-4 rounded-xl shadow-lg shadow-blue-500/25"
                >
                  Apply Externally <ExternalLink size={16} />
                </a>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 bg-white/5 border border-white/10 text-gray-500 text-sm font-medium px-6 py-4 rounded-xl">
                  No apply link available
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}