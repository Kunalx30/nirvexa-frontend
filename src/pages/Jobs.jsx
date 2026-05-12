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
  const [paginationError, setPaginationError] = useState(false)
  const [page, setPage]       = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalJobs, setTotalJobs] = useState(0)
  const LIMIT = 30
  const animatedTotal = useCountUp(totalJobs, 1200)

  // ── Saved Jobs State ───────────────────────────────────────────────────────
  const [savedMap, setSavedMap] = useState({})   
  const [savingId, setSavingId] = useState(null)  

  // ── Load Jobs ──────────────────────────────────────────────────────────────
  const loadJobs = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (pageNum === 1) { setLoading(true); setError(null); setPaginationError(false); }
      else { setLoadingMore(true); setPaginationError(false); }

      const params = {
        page: pageNum,
        limit: LIMIT,
      }
      if (debouncedSearch)   params.q        = debouncedSearch
      if (debouncedLocation) params.location = debouncedLocation
      if (filterType !== 'All Types') params.type = filterType

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
  }, [debouncedSearch, debouncedLocation, filterType])

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
          padding: 40px 0 80px;
        }

        /* Header */
        .jh-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px;
          background: #fff; border: 1px solid #e4e4e4;
          font-size: 12px; font-weight: 600; color: #0a0a0a;
          margin-bottom: 16px;
        }
        .jh-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1.1; letter-spacing: -1px; margin: 0 0 8px;
        }
        .jh-sub {
          font-size: 16px; color: #6b6b6b; margin: 0 0 32px;
          line-height: 1.5;
        }

        /* Filters */
        .jf-container {
          background: #fff; border: 1px solid #e4e4e4;
          border-radius: 24px; padding: 24px; margin-bottom: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .jf-search-row {
          position: relative; margin-bottom: 16px;
        }
        .jf-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #a3a3a3;
        }
        .jf-input-main {
          width: 100%; background: #f9f9f9; border: 1px solid #e4e4e4;
          border-radius: 16px; padding: 14px 16px 14px 44px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0a0a0a;
          outline: none; transition: all 0.2s;
        }
        .jf-input-main:focus { border-color: #0a0a0a; background: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
        .jf-input-main::placeholder { color: #a3a3a3; }
        
        .jf-spin { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #0a0a0a; }

        .jf-filters-row {
          display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px;
        }
        @media (max-width: 640px) {
          .jf-filters-row { grid-template-columns: 1fr; }
        }
        .jf-input-sub {
          background: #f9f9f9; border: 1px solid #e4e4e4;
          border-radius: 12px; padding: 10px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0a0a0a;
          outline: none; transition: all 0.2s; width: 100%;
        }
        .jf-input-sub:focus { border-color: #0a0a0a; background: #fff; }
        .jf-clear {
          background: #fff; border: 1px solid #e4e4e4; color: #6b6b6b;
          font-size: 14px; font-weight: 500; padding: 10px 20px;
          border-radius: 12px; cursor: pointer; transition: all 0.2s;
        }
        .jf-clear:hover { background: #f3f3f3; color: #0a0a0a; }

        /* Job Grid */
        .jg-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;
        }
        
        .jc-card {
          background: #fff; border: 1px solid #e4e4e4; border-radius: 20px;
          padding: 24px; transition: all 0.25s ease;
          display: flex; flex-direction: column; cursor: pointer;
          position: relative; overflow: hidden;
        }
        .jc-card:hover {
          border-color: #0a0a0a; transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.06);
        }

        .jc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .jc-title { font-size: 18px; font-weight: 700; color: #0a0a0a; line-height: 1.3; margin: 0 0 4px; }
        .jc-company { font-size: 14px; color: #6b6b6b; font-weight: 500; display: flex; align-items: center; gap: 6px; margin: 0; }
        .jc-source { display: inline-flex; align-items: center; gap: 4px; color: #a3a3a3; font-size: 12px; }

        .jc-save-btn {
          background: none; border: none; cursor: pointer; padding: 4px; margin: -4px;
          color: #a3a3a3; transition: all 0.2s; border-radius: 50%;
        }
        .jc-save-btn:hover { background: #f3f3f3; color: #0a0a0a; }
        .jc-save-btn.saved { color: #0a0a0a; }
        .jc-save-btn.saved svg { fill: #0a0a0a; }

        .jc-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .jc-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 500;
          background: #f9f9f9; border: 1px solid #e4e4e4; color: #3a3a3a;
        }

        .jc-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; flex: 1; }
        .jc-skill {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          padding: 4px 8px; background: #fff; border: 1px solid #e4e4e4; border-radius: 6px; color: #6b6b6b;
        }

        .jc-btn {
          width: 100%; background: #0a0a0a; color: #fafafa; border: none;
          padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; text-align: center; font-family: 'DM Sans', sans-serif;
        }
        .jc-card:hover .jc-btn { background: #222; }

        /* Loading / Error / Empty */
        .js-empty {
          text-align: center; padding: 60px 20px; background: #fff; border: 1px dashed #c4c4c4;
          border-radius: 24px; margin-top: 20px;
        }
        .js-empty svg { color: #a3a3a3; margin: 0 auto 16px; }
        .js-empty h3 { font-size: 20px; font-weight: 600; color: #0a0a0a; margin: 0 0 8px; }
        .js-empty p { font-size: 15px; color: #6b6b6b; margin: 0; }

        .js-load-more {
          display: flex; justify-content: center; margin-top: 40px;
        }
        .js-lm-btn {
          background: #fff; border: 1px solid #0a0a0a; color: #0a0a0a;
          padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .js-lm-btn:hover:not(:disabled) { background: #0a0a0a; color: #fafafa; }
        .js-lm-btn:disabled { opacity: 0.5; cursor: not-allowed; border-color: #e4e4e4; color: #a3a3a3; }
        
        .js-loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .js-skeleton {
          background: #fff; border: 1px solid #e4e4e4; border-radius: 20px; padding: 24px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .js-sk-bar { background: #f0f0f0; border-radius: 4px; margin-bottom: 12px; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>

      <div className="jobs-page">
        {/* Header */}
        <div className="jh-pill">
          <Briefcase size={14} /> AI Job Aggregator
        </div>
        <h1 className="jh-title">Discover Opportunities</h1>
        <p className="jh-sub">
          {loading 
            ? 'Searching live job data...' 
            : `Showing ${animatedTotal.toLocaleString()}${!totalJobs || totalJobs % LIMIT === 0 ? '+' : ''} open roles matching your criteria.`
          }
        </p>

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
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="jf-input-sub"
            >
              <option>All Types</option>
              <option>Full-time</option>
              <option>Internship</option>
              <option>Remote</option>
              <option>Contract</option>
            </select>
            <button onClick={() => { setSearchQuery(''); setFilterLocation(''); setFilterType('All Types') }} className="jf-clear">
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
                    <div>
                      <h2 className="jc-title">{job.title}</h2>
                      <p className="jc-company">
                        {job.company}
                        {job.source && (
                          <span className="jc-source">
                            <span>•</span> <Globe size={10} /> {job.source}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => toggleSave(e, job.id)}
                      disabled={savingId === job.id}
                      className={`jc-save-btn ${savedMap[job.id] ? 'saved' : ''}`}
                    >
                      {savingId === job.id ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <div className="jc-pills">
                    {job.location && <div className="jc-pill"><MapPin size={12} /> {job.location}</div>}
                    {job.salary && <div className="jc-pill" style={{ color: '#059669', background: '#ecfdf5', borderColor: '#d1fae5' }}><DollarSign size={12} /> {job.salary}</div>}
                    {job.experience && <div className="jc-pill"><Clock size={12} /> {job.experience}</div>}
                    {job.type && <div className="jc-pill"><Briefcase size={12} /> {job.type}</div>}
                  </div>

                  {job.skills?.length > 0 && (
                    <div className="jc-skills">
                      {job.skills.slice(0, 5).map(skill => (
                        <span key={skill} className="jc-skill">{skill}</span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="jc-skill" style={{ background: 'transparent', border: 'none' }}>
                          +{job.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <button className="jc-btn">View Full Details</button>
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