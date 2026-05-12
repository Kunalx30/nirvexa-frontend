import Layout from '../components/layout/Layout'
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink, Bookmark, Trash2, Building2, MapPin,
  FolderOpen, Loader2, AlertCircle, RefreshCw, Briefcase,
  DollarSign, Clock
} from 'lucide-react'
import { fetchSavedJobs, updateSavedJob, deleteSavedJob } from '../services/jobs'
import toast from 'react-hot-toast'

const STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

const getStatusStyles = (status) => {
  switch (status) {
    case 'Applied': return { background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }
    case 'Interview': return { background: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }
    case 'Offer': return { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }
    case 'Rejected': return { background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }
    default: return { background: '#f9f9f9', borderColor: '#e4e4e4', color: '#6b6b6b' }
  }
}

const getActivePipBg = (status) => {
  switch (status) {
    case 'Applied': return { background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }
    case 'Interview': return { background: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }
    case 'Offer': return { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }
    case 'Rejected': return { background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }
    default: return { background: '#0a0a0a', borderColor: '#0a0a0a', color: '#fafafa' }
  }
}

export default function SavedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [notesDraft, setNotesDraft] = useState({})
  const [noteTimers, setNoteTimers] = useState({})

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchSavedJobs()
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

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        .sj-page {
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #0a0a0a;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 0 80px;
        }

        /* ── Header ── */
        .sj-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px;
          background: #fff; border: 1px solid #e4e4e4;
          font-size: 12px; font-weight: 600; color: #0a0a0a;
          margin-bottom: 16px;
        }
        .sj-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1.1; letter-spacing: -1px; margin: 0 0 8px;
        }
        .sj-sub {
          font-size: 16px; color: #6b6b6b; margin: 0 0 32px; line-height: 1.5;
        }
        .sj-sub strong { color: #0a0a0a; font-weight: 600; }
        .sj-header-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px;
        }
        .sj-refresh-btn {
          background: #fff; border: 1px solid #e4e4e4; color: #6b6b6b;
          padding: 8px 10px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; margin-top: 4px;
        }
        .sj-refresh-btn:hover { background: #f3f3f3; color: #0a0a0a; }

        /* ── Grid ── */
        .sj-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        /* ── Card ── */
        .sj-card {
          background: #fff; border: 1px solid #e4e4e4; border-radius: 20px;
          padding: 26px; display: flex; flex-direction: column;
          transition: all 0.25s ease;
        }
        .sj-card:hover {
          border-color: #0a0a0a;
          box-shadow: 0 12px 32px rgba(0,0,0,0.06);
        }
        .sj-card-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 16px;
        }
        .sj-job-title {
          font-size: 18px; font-weight: 700; color: #0a0a0a;
          line-height: 1.3; margin: 0 0 4px;
        }
        .sj-company-row {
          font-size: 13px; color: #6b6b6b; font-weight: 500;
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .sj-status-badge {
          display: inline-flex; align-items: center;
          padding: 3px 9px; border-radius: 6px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          border: 1px solid; white-space: nowrap; margin-left: 6px;
        }
        .sj-del-btn {
          background: none; border: none; cursor: pointer;
          padding: 4px; border-radius: 50%; color: #a3a3a3;
          transition: all 0.2s; flex-shrink: 0;
        }
        .sj-del-btn:hover { background: #fef2f2; color: #ef4444; }
        .sj-del-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Info pills ── */
        .sj-info-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
        .sj-info-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 500;
          background: #f9f9f9; border: 1px solid #e4e4e4; color: #3a3a3a;
        }

        /* ── Section label ── */
        .sj-section-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.8px; color: #a3a3a3; margin-bottom: 10px;
        }

        /* ── Pipeline ── */
        .sj-pipeline { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .sj-pip-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          border: 1px solid #e4e4e4; background: #f9f9f9; color: #6b6b6b;
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .sj-pip-btn:hover:not(:disabled) { background: #f3f3f3; color: #0a0a0a; }
        .sj-pip-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Notes ── */
        .sj-notes {
          width: 100%; background: #f9f9f9; border: 1px solid #e4e4e4;
          border-radius: 12px; padding: 12px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0a0a0a;
          resize: none; min-height: 72px; outline: none; transition: all 0.2s;
          margin-bottom: 6px;
        }
        .sj-notes:focus { border-color: #0a0a0a; background: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
        .sj-notes::placeholder { color: #a3a3a3; }
        .sj-autosave { font-size: 10px; color: #a3a3a3; margin-bottom: 18px; }

        /* ── Card footer ── */
        .sj-card-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 16px; border-top: 1px solid #e4e4e4; margin-top: auto;
        }
        .sj-saved-date {
          font-size: 12px; color: #a3a3a3; font-weight: 500;
          display: flex; align-items: center; gap: 5px;
        }
        .sj-view-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 16px; background: #0a0a0a; color: #fafafa;
          border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
        }
        .sj-view-btn:hover { background: #222; }

        /* ── Loading skeletons ── */
        .sj-sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        .sj-skeleton {
          background: #fff; border: 1px solid #e4e4e4; border-radius: 20px;
          padding: 26px; animation: sj-pulse 1.5s infinite ease-in-out;
        }
        .sj-sk-bar { background: #f0f0f0; border-radius: 4px; margin-bottom: 12px; }
        @keyframes sj-pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        /* ── Error / Empty ── */
        .sj-empty {
          text-align: center; padding: 60px 20px; background: #fff;
          border: 1px dashed #c4c4c4; border-radius: 24px; margin-top: 20px;
        }
        .sj-empty svg { color: #a3a3a3; margin: 0 auto 16px; }
        .sj-empty h3 { font-size: 20px; font-weight: 600; color: #0a0a0a; margin: 0 0 8px; }
        .sj-empty p  { font-size: 15px; color: #6b6b6b; margin: 0; }
        .sj-browse-btn {
          margin-top: 16px; display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px; background: #0a0a0a; color: #fafafa;
          border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none;
          transition: all 0.2s;
        }
        .sj-browse-btn:hover { background: #222; }
      `}</style>

      <div className="sj-page">

        {/* ── Header ── */}
        <div className="sj-pill">
          <Bookmark size={14} /> Application Tracker
        </div>

        <div className="sj-header-row">
          <div>
            <h1 className="sj-title">Saved Jobs</h1>
            <p className="sj-sub">
              Track applications, manage stages, and keep notes.
              {jobs.length > 0 && !loading && (
                <strong> {jobs.length} job{jobs.length !== 1 ? 's' : ''} tracked.</strong>
              )}
            </p>
          </div>
          <button className="sj-refresh-btn" onClick={load} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="sj-sk-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="sj-skeleton">
                <div className="sj-sk-bar" style={{ width: '65%', height: '22px', marginBottom: '14px' }} />
                <div className="sj-sk-bar" style={{ width: '40%', height: '14px', marginBottom: '22px' }} />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {[80, 100, 70].map((w, j) => <div key={j} className="sj-sk-bar" style={{ width: w, height: '22px' }} />)}
                </div>
                <div className="sj-sk-bar" style={{ width: '100%', height: '60px' }} />
                <div className="sj-sk-bar" style={{ width: '100%', height: '40px', marginTop: '16px' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="sj-empty" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
            <AlertCircle size={40} color="#ef4444" />
            <h3 style={{ color: '#ef4444' }}>Failed to load saved jobs</h3>
            <p>{error}</p>
            <button onClick={load} className="sj-browse-btn" style={{ marginTop: '16px' }}>
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && jobs.length === 0 && (
          <div className="sj-empty">
            <FolderOpen size={40} />
            <h3>Your tracker is empty</h3>
            <p>Browse the job board and tap the bookmark icon on any listing to track it here.</p>
            <Link to="/jobs" className="sj-browse-btn">Browse Jobs</Link>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && jobs.length > 0 && (
          <div className="sj-grid">
            {jobs.map(sj => {
              const jobData = sj.job || {}
              const statusStyle = getStatusStyles(sj.status)

              return (
                <div key={sj.id} className="sj-card">

                  {/* Top row */}
                  <div className="sj-card-top">
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                        <h2 className="sj-job-title">{jobData.title || 'Job Listing'}</h2>
                        <span
                          className="sj-status-badge"
                          style={statusStyle}
                        >
                          {sj.status}
                        </span>
                      </div>
                      <p className="sj-company-row">
                        {jobData.company && <><Building2 size={13} /> {jobData.company}</>}
                        {jobData.location && <><span>·</span><MapPin size={13} /> {jobData.location}</>}
                      </p>
                    </div>
                    <button
                      className="sj-del-btn"
                      onClick={() => removeJob(sj.id)}
                      disabled={deletingId === sj.id}
                      title="Remove"
                    >
                      {deletingId === sj.id
                        ? <Loader2 size={18} className="animate-spin" />
                        : <Trash2 size={18} />
                      }
                    </button>
                  </div>

                  {/* Info pills */}
                  <div className="sj-info-pills">
                    {jobData.type && <span className="sj-info-pill"><Briefcase size={11} /> {jobData.type}</span>}
                    {jobData.salary && <span className="sj-info-pill" style={{ color: '#059669', background: '#ecfdf5', borderColor: '#d1fae5' }}><DollarSign size={11} /> {jobData.salary}</span>}
                    {jobData.experience && <span className="sj-info-pill"><Clock size={11} /> {jobData.experience}</span>}
                  </div>

                  {/* Pipeline status */}
                  <p className="sj-section-label">Pipeline Status</p>
                  <div className="sj-pipeline">
                    {STATUSES.map(status => {
                      const isActive = sj.status === status
                      const activeStyle = isActive ? getActivePipBg(status) : {}
                      return (
                        <button
                          key={status}
                          className="sj-pip-btn"
                          onClick={() => updateStatus(sj.id, status)}
                          disabled={updatingId === sj.id}
                          style={isActive ? { ...activeStyle, border: `1px solid ${activeStyle.borderColor}` } : {}}
                        >
                          {status}
                        </button>
                      )
                    })}
                  </div>

                  {/* Notes */}
                  <p className="sj-section-label">Private Notes</p>
                  <textarea
                    className="sj-notes"
                    placeholder="Add interview notes, contacts, or reminders..."
                    value={notesDraft[sj.id] ?? ''}
                    onChange={(e) => handleNotesChange(sj.id, e.target.value)}
                  />
                  <p className="sj-autosave">Auto-saved as you type</p>

                  {/* Footer */}
                  <div className="sj-card-footer">
                    <span className="sj-saved-date">
                      <Bookmark size={13} />
                      {sj.saved_at
                        ? `Saved ${new Date(sj.saved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                        : 'Saved to Tracker'
                      }
                    </span>
                    {jobData.id && (
                      <Link to={`/jobs/${jobData.id}`} className="sj-view-btn">
                        View Details <ExternalLink size={13} />
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