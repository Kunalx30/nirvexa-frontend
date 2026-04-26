import Layout from '../components/layout/Layout'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Bookmark, Briefcase, DollarSign, Clock, Globe, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import { fetchJobs, saveJob, deleteSavedJob } from '../services/jobs'
import toast from 'react-hot-toast'

// Debounce helper
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Jobs() {
  const navigate = useNavigate()

  // ── Search & Filter State ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]     = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterType, setFilterType]       = useState('All Types')
  const debouncedSearch   = useDebounce(searchQuery, 500)
  const debouncedLocation = useDebounce(filterLocation, 500)

  // ── Jobs Data State ────────────────────────────────────────────────────────
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [page, setPage]       = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const LIMIT = 20

  // ── Saved Jobs State ───────────────────────────────────────────────────────
  // Map of job_id → saved_job record id (so we can delete)
  const [savedMap, setSavedMap] = useState({})   // { job_id: saved_record_id }
  const [savingId, setSavingId] = useState(null)  // which job is being saved right now

  // ── Load Jobs ──────────────────────────────────────────────────────────────
  const loadJobs = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (pageNum === 1) { setLoading(true); setError(null) }
      else setLoadingMore(true)

      const params = {
        page: pageNum,
        limit: LIMIT,
      }
      if (debouncedSearch)   params.q        = debouncedSearch
      if (debouncedLocation) params.location = debouncedLocation
      if (filterType !== 'All Types') params.type = filterType

      const res  = await fetchJobs(params)
      const data = res.data?.data || res.data || []
      const list = Array.isArray(data) ? data : data.jobs || []

      setJobs(prev => replace ? list : [...prev, ...list])
      setHasMore(list.length === LIMIT)
      setPage(pageNum)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, debouncedLocation, filterType])

  // Re-fetch when filters change — always page 1
  useEffect(() => {
    loadJobs(1, true)
  }, [loadJobs])

  // ── Save / Unsave ──────────────────────────────────────────────────────────
  const toggleSave = async (e, jobId) => {
    e.stopPropagation()
    if (savingId === jobId) return
    setSavingId(jobId)
    try {
      if (savedMap[jobId]) {
        // Already saved → delete it
        await deleteSavedJob(savedMap[jobId])
        setSavedMap(prev => {
          const next = { ...prev }
          delete next[jobId]
          return next
        })
        toast.success('Removed from saved jobs')
      } else {
        // Not saved → save it
        const res = await saveJob(jobId, 'Saved')
        const savedRecord = res.data?.data || res.data
        setSavedMap(prev => ({ ...prev, [jobId]: savedRecord.id }))
        toast.success('Job saved!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update saved jobs')
    } finally {
      setSavingId(null)
    }
  }

  // ── Load More ──────────────────────────────────────────────────────────────
  const loadMore = () => loadJobs(page + 1, false)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-8 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 w-fit mb-2 backdrop-blur-sm">
            <Briefcase size={14} />
            <span>AI Job Aggregator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Discover Opportunities
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            {loading
              ? 'Searching live job data...'
              : <span>Showing <span className="text-white font-medium">{jobs.length}</span> open roles matching your criteria.</span>
            }
          </p>
        </div>

        {/* ── SEARCH & FILTERS TOOLBAR ────────────────────────────────────── */}
        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 mb-10 z-10 relative shadow-2xl">

          {/* Main Search — wired to FAISS semantic search via ?q= */}
          <div className="relative mb-4 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by job title, company, or skills (AI-powered)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm sm:text-base"
            />
            {/* Searching indicator */}
            {searchQuery !== debouncedSearch && (
              <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              placeholder="Location (e.g. Bangalore)"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option className="bg-[#111116]">All Types</option>
              <option className="bg-[#111116]">Full-time</option>
              <option className="bg-[#111116]">Internship</option>
              <option className="bg-[#111116]">Remote</option>
              <option className="bg-[#111116]">Contract</option>
            </select>
            <button
              onClick={() => { setSearchQuery(''); setFilterLocation(''); setFilterType('All Types') }}
              className="col-span-2 lg:col-span-1 text-sm text-gray-500 hover:text-white border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/5 rounded-xl px-4 py-2.5 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* ── LOADING STATE ───────────────────────────────────────────────── */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111116]/80 border border-white/5 rounded-3xl p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded-lg w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-1/3 mb-6" />
                <div className="flex gap-2 mb-5">
                  <div className="h-6 bg-white/5 rounded-md w-20" />
                  <div className="h-6 bg-white/5 rounded-md w-24" />
                  <div className="h-6 bg-white/5 rounded-md w-16" />
                </div>
                <div className="flex gap-2 mb-6">
                  <div className="h-5 bg-white/5 rounded-md w-12" />
                  <div className="h-5 bg-white/5 rounded-md w-16" />
                  <div className="h-5 bg-white/5 rounded-md w-10" />
                </div>
                <div className="h-10 bg-white/5 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* ── ERROR STATE ─────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="text-center py-16 px-4 bg-rose-500/5 border border-rose-500/20 rounded-3xl z-10 relative">
            <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-gray-400 font-light mb-6">{error}</p>
            <button
              onClick={() => loadJobs(1, true)}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── JOB GRID ────────────────────────────────────────────────────── */}
        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 gap-5 z-10 relative">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="group bg-[#111116]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative z-10 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-2">
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors truncate">
                          {job.title}
                        </h2>
                        <p className="text-gray-400 text-sm font-medium mt-1 flex items-center gap-1.5">
                          {job.company}
                          {job.source && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-gray-600" />
                              <span className="flex items-center gap-1"><Globe size={12}/> {job.source}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => toggleSave(e, job.id)}
                        disabled={savingId === job.id}
                        className="p-2 -mr-2 -mt-2 rounded-full hover:bg-white/5 transition-colors flex-shrink-0"
                      >
                        {savingId === job.id
                          ? <Loader2 size={20} className="text-blue-400 animate-spin" />
                          : <Bookmark
                              size={20}
                              className={`transition-colors ${
                                savedMap[job.id]
                                  ? 'text-blue-400 fill-blue-400'
                                  : 'text-gray-500 hover:text-gray-300'
                              }`}
                            />
                        }
                      </button>
                    </div>

                    {/* Meta Pills */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {job.location && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-gray-300">
                          <MapPin size={12} className="text-gray-500" /> {job.location}
                        </div>
                      )}
                      {job.salary && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">
                          <DollarSign size={12} /> {job.salary}
                        </div>
                      )}
                      {job.experience && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-gray-300">
                          <Clock size={12} className="text-gray-500" /> {job.experience}
                        </div>
                      )}
                      {job.type && (
                        <div className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/10 text-indigo-400">
                          {job.type}
                        </div>
                      )}
                    </div>

                    {/* Skills Tags */}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6 flex-1">
                        {job.skills.slice(0, 5).map(skill => (
                          <span
                            key={skill}
                            className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 text-gray-600">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`) }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold py-3 rounded-xl transition-all group-hover:border-blue-500/30 mt-auto"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── LOAD MORE ─────────────────────────────────────────────── */}
            {hasMore && jobs.length > 0 && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-2xl transition-all disabled:opacity-50"
                >
                  {loadingMore
                    ? <><Loader2 size={16} className="animate-spin" /> Loading...</>
                    : <><ChevronDown size={16} /> Load More Jobs</>
                  }
                </button>
              </div>
            )}

            {/* ── EMPTY STATE ───────────────────────────────────────────── */}
            {jobs.length === 0 && (
              <div className="text-center py-20 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl mt-6 z-10 relative">
                <Search size={40} className="text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                <p className="text-gray-500 font-light">
                  Try different search terms or clear your filters.
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </Layout>
  )
}