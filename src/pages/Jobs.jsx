import Layout from '../components/layout/Layout'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePagePersistedState } from '../context/PageStateContext'
import { Search, MapPin, Bookmark, Briefcase, DollarSign, IndianRupee, Clock, Globe, Loader2, AlertCircle, ChevronDown, Crown, ChevronRight } from 'lucide-react'
import { useUsage } from '../hooks/useUsage'
import { fetchJobs, saveJob, deleteSavedJob, fetchJobFilterOptions } from '../services/jobs'
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

// CountUp helper for dynamic metrics
function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!end) { setCount(0); return; }
    let startTime = null
    let animationFrame
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      // Use easeOutQuart for smooth deceleration
      const p = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - p, 4)
      setCount(Math.floor(easeOut * end))
      if (p < 1) animationFrame = requestAnimationFrame(step)
    }
    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  return count
}

// Time formatting helper
function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

export default function Jobs() {
  const navigate = useNavigate()
  const { isPremium } = useUsage()

  // ── Search & Filter State ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]        = usePagePersistedState('jobs_search_query', '')
  const [filterLocation, setFilterLocation]  = usePagePersistedState('jobs_filter_location', '')
  const [filterCompany, setFilterCompany]    = usePagePersistedState('jobs_filter_company', '')
  const [filterSource, setFilterSource]      = usePagePersistedState('jobs_filter_source', 'all')
  const [filterPostedWithin, setFilterPostedWithin] = usePagePersistedState('jobs_filter_posted_within', 'all')
  const [filterType, setFilterType]          = usePagePersistedState('jobs_filter_type', 'all')
  const debouncedSearch    = useDebounce(searchQuery, 500)
  const debouncedLocation  = useDebounce(filterLocation, 500)
  const debouncedCompany   = useDebounce(filterCompany, 500)

  // ── Jobs Data State ────────────────────────────────────────────────────────
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [paginationError, setPaginationError] = useState(false)
  const [page, setPage]       = usePagePersistedState('jobs_page', 1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalJobs, setTotalJobs] = useState(0)
  const LIMIT = 30
  const animatedTotal = useCountUp(totalJobs, 1200)

  // ── Saved Jobs State ───────────────────────────────────────────────────────
  const [savedMap, setSavedMap] = useState({})   
  const [savingId, setSavingId] = useState(null)  

  const [dynamicSources, setDynamicSources] = useState([])
  const [dynamicTypes, setDynamicTypes] = useState([])
  const [sourceCounts, setSourceCounts] = useState({})
  const [typeCounts, setTypeCounts] = useState({})

  // ── Load Filter Options ────────────────────────────────────────────────────
  useEffect(() => {
    fetchJobFilterOptions()
      .then(res => {
        const data = res.data || {}
        setDynamicSources(data.sources || [])
        setDynamicTypes(data.types || [])
        setSourceCounts(data.source_counts || {})
        setTypeCounts(data.type_counts || {})
      })
      .catch(err => console.error("Could not load filter options", err))
  }, [])


  // ── Load Jobs ──────────────────────────────────────────────────────────────
  const loadJobs = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (pageNum === 1) { setLoading(true); setError(null); setPaginationError(false); }
      else { setLoadingMore(true); setPaginationError(false); }

      const params = {
        page: pageNum,
        limit: LIMIT,
      }
      if (debouncedSearch)   params.q             = debouncedSearch
      if (debouncedLocation) params.location      = debouncedLocation
      if (debouncedCompany)  params.company       = debouncedCompany
      if (filterType !== 'all') params.type       = filterType
      if (filterSource !== 'all') params.source   = filterSource
      if (filterPostedWithin !== 'all') params.posted_within = filterPostedWithin

      const res  = await fetchJobs(params)
      const data = res.data?.data || res.data || {}
      const list = Array.isArray(data) ? data : data.jobs || []
      
      // Extract total from backend, fallback to length if unknown
      const apiTotal = !Array.isArray(data) && (data.total || data.totalCount || data.count)
      setTotalJobs(apiTotal ? parseInt(apiTotal) : (list.length === LIMIT ? list.length + 500 : list.length))

      setJobs(prev => replace ? list : [...prev, ...list])
      setHasMore(list.length === LIMIT)
      setPage(pageNum)
    } catch (err) {
      if (pageNum === 1) {
        setError(err.response?.data?.message || 'Failed to load jobs. Please try again.')
      } else {
        setPaginationError(true)
        toast.error('Rate limit reached or network error. Please wait and try again.')
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, debouncedLocation, debouncedCompany, filterSource, filterType, filterPostedWithin])

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
        await deleteSavedJob(savedMap[jobId])
        setSavedMap(prev => {
          const next = { ...prev }
          delete next[jobId]
          return next
        })
        toast.success('Removed from saved jobs')
      } else {
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

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadJobs(page + 1, false)
    }
  }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        .jobs-page {
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #0a0a0a;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          min-height: 100vh;
          position: relative;
        }

        .jobs-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(228,228,228,.28) 1px, transparent 1px),
            linear-gradient(90deg, rgba(228,228,228,.28) 1px, transparent 1px);
          background-size: 28px 28px;
          background-position: -1px -1px;
          pointer-events: none;
          z-index: 0;
        }

        .jobs-content-wrap {
          position: relative;
          z-index: 10;
        }

        /* Header */
        .jh-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px;
          background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(228, 228, 228, 0.8);
          font-size: 11.5px; font-weight: 600; color: #4b5563;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          backdrop-filter: blur(8px);
        }
        .jh-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(34px, 5vw, 50px);
          line-height: 1.1; letter-spacing: -1.5px; margin: 0 0 8px;
          color: #0a0a0a;
        }
        .jh-sub {
          font-size: 15px; color: #6b6b6b; margin: 0 0 32px;
          line-height: 1.5;
        }

        /* Filters Panel */
        .jf-container {
          background: rgba(255, 255, 255, 0.8); 
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(228, 228, 228, 0.7);
          border-radius: 24px; padding: 24px; margin-bottom: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        }
        .jf-search-row {
          position: relative; margin-bottom: 16px;
        }
        .jf-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #6b7280;
        }
        .jf-input-main {
          width: 100%; background: rgba(249, 249, 249, 0.8); border: 1px solid rgba(228, 228, 228, 0.8);
          border-radius: 16px; padding: 14px 16px 14px 44px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0a0a0a;
          outline: none; transition: all 0.25s ease;
        }
        .jf-input-main:focus { border-color: #0a0a0a; background: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
        .jf-input-main::placeholder { color: #9ca3af; }
        
        .jf-spin { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #0a0a0a; }

        .jf-filters-row {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        @media (max-width: 640px) {
          .jf-filters-row { grid-template-columns: 1fr; }
        }
        .jf-input-sub {
          background: rgba(249, 249, 249, 0.8); border: 1px solid rgba(228, 228, 228, 0.8);
          border-radius: 12px; padding: 11px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #0a0a0a;
          outline: none; transition: all 0.25s ease; width: 100%;
        }
        .jf-input-sub:focus { border-color: #0a0a0a; background: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
        .jf-clear {
          background: #fff; border: 1px solid #e4e4e4; color: #4b5563;
          font-size: 13.5px; font-weight: 600; padding: 11px 20px;
          border-radius: 12px; cursor: pointer; transition: all 0.2s;
        }
        .jf-clear:hover { background: #f3f3f3; color: #0a0a0a; border-color: #c4c4c4; }

        /* Job Grid */
        .jg-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 24px;
        }
        
        /* Job Card */
        .jc-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 24px; 
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease, border-color 0.4s ease;
          display: flex; flex-direction: column; cursor: pointer;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(255,255,255,0.2);
          animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .jc-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.4);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        /* Glow top bar on hover */
        .jc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #2563eb, #7c3aed, #db2777);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .jc-card:hover::before {
          opacity: 1;
        }

        .jc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
        .jc-company-info { display: flex; align-items: center; gap: 14px; }
        
        .jc-logo {
          width: 44px; height: 44px; flex-shrink: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #374151;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 700; font-family: 'DM Serif Display', serif;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .jc-title { font-size: 16.5px; font-weight: 700; color: #111827; line-height: 1.35; margin: 0 0 3px; font-family: 'DM Sans', sans-serif;}
        .jc-company { font-size: 13.5px; color: #4b5563; font-weight: 600; display: flex; align-items: center; gap: 6px; margin: 0; }
        .jc-time { font-size: 11px; color: #9ca3af; display: flex; align-items: center; gap: 4px; margin-top: 2px; }

        .jc-save-btn {
          background: rgba(243, 244, 246, 0.8); border: none; cursor: pointer; padding: 9px;
          color: #9ca3af; transition: all 0.25s ease; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-left: 8px;
        }
        .jc-save-btn:hover { background: #fee2e2; color: #ef4444; transform: scale(1.08); }
        .jc-save-btn.saved { color: #ef4444; background: #fee2e2; }
        .jc-save-btn.saved svg { fill: #ef4444; }

        .jc-summary {
          font-size: 13.5px; color: #4b5563; line-height: 1.55; margin-bottom: 18px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .jc-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .jc-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 10px; font-size: 12.5px; font-weight: 600;
          background: rgba(243, 244, 246, 0.8); color: #4b5563;
          transition: all 0.2s ease;
        }
        .jc-pill:hover { background: #e5e7eb; }
        .jc-pill.salary { color: #047857; background: #d1fae5; }
        .jc-pill.type { color: #1d4ed8; background: #dbeafe; }

        .jc-skills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 20px; flex: 1; }
        .jc-skill {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          padding: 4px 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; color: #6b7280;
          transition: all 0.2s ease;
        }
        .jc-skill:hover { border-color: #cbd5e1; color: #1f2937; background: #f9fafb; }

        .jc-footer {
          display: flex; justify-content: space-between; align-items: center; margin-top: auto;
          padding-top: 14px; border-top: 1px dashed rgba(229, 231, 235, 0.8);
        }

        .jc-source-tag { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; font-size: 12px; font-weight: 500;}

        .jc-btn {
          background: #f3f4f6; color: #374151; border: none;
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 6px;
        }
        .jc-card:hover .jc-btn { background: #0a0a0a; color: #fafafa; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        /* Loading / Error / Empty states */
        .js-empty {
          text-align: center; padding: 60px 20px; background: rgba(255, 255, 255, 0.8); border: 1px dashed #c4c4c4;
          border-radius: 24px; margin-top: 20px; backdrop-filter: blur(8px);
        }
        .js-empty svg { color: #a3a3a3; margin: 0 auto 16px; }
        .js-empty h3 { font-size: 18px; font-weight: 600; color: #0a0a0a; margin: 0 0 6px; }
        .js-empty p { font-size: 14px; color: #6b6b6b; margin: 0; }

        .js-load-more {
          display: flex; justify-content: center; margin-top: 40px;
        }
        .js-lm-btn {
          background: #fff; border: 1px solid #0a0a0a; color: #0a0a0a;
          padding: 12px 24px; border-radius: 30px; font-size: 13.5px; font-weight: 650;
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .js-lm-btn:hover:not(:disabled) { background: #0a0a0a; color: #fafafa; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .js-lm-btn:disabled { opacity: 0.5; cursor: not-allowed; border-color: #e4e4e4; color: #a3a3a3; }
        
        .js-loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .js-skeleton {
          background: rgba(255,255,255,0.7); border: 1px solid rgba(228,228,228,0.6); border-radius: 24px; padding: 24px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .js-sk-bar { background: #f0f0f0; border-radius: 4px; margin-bottom: 12px; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        /* Layout headers */
        .jobs-header-row {
          display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between;
          gap: 20px; margin-bottom: 32px;
        }
        .jobs-header-text { flex: 1; min-width: 240px; }
        
        .premium-entry-btn {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 20px; border-radius: 16px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          color: #fafafa; text-align: left;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          flex-shrink: 0; max-width: 100%;
        }
        .premium-entry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
        }
        .premium-entry-icon {
          width: 42px; height: 42px; border-radius: 11px;
          background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.35);
          display: flex; align-items: center; justify-content: center; color: #fbbf24;
          flex-shrink: 0;
        }
        .premium-entry-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #fbbf24; margin: 0 0 3px;
        }
        .premium-entry-title { font-size: 14.5px; font-weight: 700; margin: 0; line-height: 1.3; }
        .premium-entry-sub { font-size: 11.5px; color: rgba(250,250,250,0.65); margin: 3px 0 0; }
        .premium-entry-arrow { color: rgba(250,250,250,0.5); flex-shrink: 0; margin-left: auto; }
      `}</style>

      <div className="jobs-page">
        <div className="jobs-header-row">
          <div className="jobs-header-text">
            <div className="jh-pill">
              <Briefcase size={14} /> AI Job Aggregator
            </div>            <h1 className="jh-title">Discover Opportunities</h1>
            <p className="jh-sub" style={{ marginBottom: 0 }}>
              {loading
                ? 'Searching live job data...'
                : `Curated live roles matching your criteria. ${animatedTotal > 0 ? `${animatedTotal.toLocaleString()} jobs available` : ''}`}
            </p>
          </div>

          <button
            type="button"
            className="premium-entry-btn"
            onClick={() => navigate('/premium-jobs')}
            aria-label="Open Nyrvexa Premium Jobs"
          >
            <div className="premium-entry-icon">
              <Crown size={22} />
            </div>
            <div>
              <p className="premium-entry-label">Nyrvexa Premium</p>
              <p className="premium-entry-title">Premium Jobs</p>
              <p className="premium-entry-sub">
                {isPremium ? 'Curated roles · Pro access' : 'Exclusive hand-picked roles'}
              </p>
            </div>
            <ChevronRight size={20} className="premium-entry-arrow" />
          </button>
        </div>

        {/* Filters */}
        <div className="jf-container">

          <div className="jf-search-row">
            <Search className="jf-icon" size={18} />
            <input
              type="text"
              placeholder="Search by job title, company, or skills (AI-powered)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="jf-input-main"
            />
            {searchQuery !== debouncedSearch && <Loader2 className="jf-spin animate-spin" size={16} />}
          </div>
          <div className="jf-filters-row">
            <input
              placeholder="Location (e.g. Bangalore)"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="jf-input-sub"
            />
            <input
              placeholder="Company"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="jf-input-sub"
            />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="jf-input-sub"
            >
              <option value="all">All Sources</option>
              {dynamicSources.map(src => (
                <option key={src} value={src}>{src.charAt(0).toUpperCase() + src.slice(1)}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="jf-input-sub"
            >
              <option value="all">All Types</option>
              {dynamicTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</option>
              ))}
            </select>
            <select
              value={filterPostedWithin}
              onChange={(e) => setFilterPostedWithin(e.target.value)}
              className="jf-input-sub"
            >
              <option value="all">Any Time</option>
              <option value="1">Past 24 hours</option>
              <option value="3">Past 3 days</option>
              <option value="7">Past 7 days</option>
              <option value="14">Past 14 days</option>
              <option value="30">Past 30 days</option>
            </select>
            <button onClick={() => { setSearchQuery(''); setFilterLocation(''); setFilterCompany(''); setFilterSource('all'); setFilterType('all'); setFilterPostedWithin('all'); }} className="jf-clear">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="js-loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="js-skeleton">
                <div className="js-sk-bar" style={{ width: '70%', height: '24px', marginBottom: '16px' }} />
                <div className="js-sk-bar" style={{ width: '40%', height: '16px', marginBottom: '24px' }} />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <div className="js-sk-bar" style={{ width: '80px', height: '24px' }} />
                  <div className="js-sk-bar" style={{ width: '100px', height: '24px' }} />
                </div>
                <div className="js-sk-bar" style={{ width: '100%', height: '44px', marginTop: 'auto' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="js-empty" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
            <AlertCircle size={40} color="#ef4444" />
            <h3 style={{ color: '#ef4444' }}>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => loadJobs(1, true)} className="js-lm-btn" style={{ marginTop: '16px' }}>Try Again</button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            <div className="jg-grid">
              {jobs.map(job => (
                <div key={job.id} className="jc-card" onClick={() => navigate(`/jobs/${job.id}`)}>
                  
                  <div className="jc-header">
                    <div className="jc-company-info">
                      <div className="jc-logo">
                        {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h2 className="jc-title">{job.title}</h2>
                        <p className="jc-company">{job.company}</p>
                        {job.posted_at && (
                          <span className="jc-time">
                            <Clock size={10} /> Posted {timeAgo(job.posted_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => toggleSave(e, job.id)}
                      disabled={savingId === job.id}
                      className={`jc-save-btn ${savedMap[job.id] ? 'saved' : ''}`}
                      title={savedMap[job.id] ? "Remove from saved" : "Save job"}
                    >
                      {savingId === job.id ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  {job.ai_summary && (
                    <div className="jc-summary">
                      {job.ai_summary}
                    </div>
                  )}

                  <div className="jc-pills">
                    {job.location && <div className="jc-pill"><MapPin size={14} /> {job.location}</div>}
                    {job.salary && (
                      <div className="jc-pill salary">
                        {/(₹|inr|rs|lpa)/i.test(job.salary) || job.source?.toLowerCase() === 'internshala' ? <IndianRupee size={14} /> : <DollarSign size={14} />} {job.salary}
                      </div>
                    )}
                    {job.job_type && <div className="jc-pill type"><Briefcase size={14} /> {job.job_type.replace('-', ' ')}</div>}
                  </div>

                  {job.skills?.length > 0 && (
                    <div className="jc-skills">
                      {job.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="jc-skill">{skill}</span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="jc-skill" style={{ background: 'transparent', border: 'none' }}>
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="jc-footer">
                    {job.source && (
                      <span className="jc-source-tag">
                        <Globe size={14} /> {job.source}
                      </span>
                    )}
                    <button className="jc-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && jobs.length > 0 && (
              <div className="js-load-more">
                <button onClick={loadMore} disabled={loadingMore} className="js-lm-btn">
                  {loadingMore ? (
                    <><Loader2 size={16} className="animate-spin" /> Loading...</>
                  ) : paginationError ? (
                    'Rate Limit Hit • Try Again'
                  ) : (
                    <><ChevronDown size={16} /> Load More Jobs</>
                  )}
                </button>
              </div>
            )}

            {jobs.length === 0 && (
              <div className="js-empty">
                <Search size={40} />
                <h3>No jobs found</h3>
                <p>Try different search terms or clear your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
