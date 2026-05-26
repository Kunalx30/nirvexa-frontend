import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useUsage } from '../hooks/useUsage'
import { fetchPremiumJobs } from '../services/jobs'
import {
  Crown, Sparkles, MapPin, Briefcase, ExternalLink, Mail, Loader2,
  ArrowLeft, Lock, RefreshCw, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import '../styles/premium-jobs.css'

function formatPosted(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d) / 86400000)
  if (days < 1) return 'Posted today'
  if (days < 30) return `Posted ${days}d ago`
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export default function PremiumJobs() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { isPremium, loading: usageLoading } = useUsage()

  const [jobs, setJobs] = useState([])
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const canAccess = unlocked && isPremium
  const selected = jobs.find((j) => j.id === selectedId) ?? null

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchPremiumJobs()
      const body = res.data || {}
      const list = body.jobs ?? body.data?.jobs ?? []
      const items = Array.isArray(list) ? list : []
      setJobs(items)
      setUnlocked(!!body.unlocked)
      if (items.length > 0) {
        setSelectedId((prev) => (items.some((j) => j.id === prev) ? prev : items[0].id))
      } else {
        setSelectedId(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load premium jobs')
      setJobs([])
      setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!authLoading && isAuthenticated) load()
  }, [authLoading, isAuthenticated, isPremium, load])

  const handleApply = (job) => {
    if (!canAccess || job?.locked) {
      navigate('/pricing?locked=premium_jobs')
      return
    }
    if (job.apply_url) {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer')
    } else if (job.apply_email) {
      window.location.href = `mailto:${job.apply_email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`
    } else {
      toast.error('No apply link provided for this role')
    }
  }

  const selectJob = (job) => {
    setSelectedId(job.id)
    if (!canAccess) {
      navigate('/pricing?locked=premium_jobs')
    }
  }

  return (
    <Layout>
      <div className="pj-page">
        <header className="pj-topbar">
          <div className="pj-topbar-left">
            <button type="button" className="pj-back" onClick={() => navigate('/jobs')}>
              <ArrowLeft size={16} /> Jobs
            </button>
            <div className="pj-topbar-title">
              <h1>Premium Jobs</h1>
              <p>Curated by the Nyrvexa team</p>
            </div>
          </div>
          {canAccess ? (
            <span className="pj-pro-pill">
              <Sparkles size={14} /> Pro · {jobs.length} role{jobs.length !== 1 ? 's' : ''}
            </span>
          ) : !usageLoading ? (
            <Link to="/pricing?locked=premium_jobs" className="pj-btn-upgrade-sm">
              <Crown size={14} /> Upgrade
            </Link>
          ) : null}
        </header>

        {loading && (
          <div className="pj-center-state">
            <Loader2 size={36} className="animate-spin" />
            <p>Loading listings…</p>
          </div>
        )}

        {error && !loading && (
          <div className="pj-center-state">
            <AlertCircle size={40} style={{ opacity: 0.4 }} />
            <p>{error}</p>
            <button type="button" className="pj-back" style={{ marginTop: 16 }} onClick={load}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="pj-center-state">
            <Briefcase size={48} style={{ opacity: 0.25 }} />
            <p>No premium listings yet. Check back soon.</p>
            <button type="button" className="pj-back" style={{ marginTop: 16 }} onClick={() => navigate('/jobs')}>
              Browse all jobs
            </button>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="pj-workspace">
            <aside className="pj-list-pane">
              <div className="pj-list-header">
                {jobs.length} exclusive listing{jobs.length !== 1 ? 's' : ''}
              </div>
              <div className="pj-list-scroll">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    className={`pj-list-item ${selectedId === job.id ? 'active' : ''}`}
                    onClick={() => selectJob(job)}
                  >
                    {job.is_featured && <span className="pj-featured-tag">Featured</span>}
                    <p className="pj-list-item-title">{job.title}</p>
                    <p className="pj-list-item-meta">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ''}
                    </p>
                    {canAccess && job.salary && (
                      <p className="pj-list-item-salary">{job.salary}</p>
                    )}
                  </button>
                ))}
              </div>
            </aside>

            <main className="pj-detail-pane">
              {!canAccess && !usageLoading && (
                <div className="pj-detail-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="pj-upgrade-panel">
                    <Lock size={36} style={{ color: 'var(--pj-gold)' }} />
                    <h2>Pro members only</h2>
                    <p>
                      Unlock full job details, salary ranges, and direct apply links for all
                      {' '}{jobs.length} curated role{jobs.length !== 1 ? 's' : ''}.
                    </p>
                    <Link to="/pricing?locked=premium_jobs" className="pj-btn-upgrade">
                      <Crown size={18} /> Get Nyrvexa Pro
                    </Link>
                  </div>
                </div>
              )}

              {canAccess && selected && (
                <div className="pj-detail-scroll">
                  <div className="pj-detail-head">
                    <h2>{selected.title}</h2>
                    <p className="pj-detail-company">{selected.company}</p>
                    {selected.location && (
                      <p className="pj-detail-location">
                        <MapPin size={16} /> {selected.location}
                      </p>
                    )}
                    {selected.salary && (
                      <p className="pj-detail-salary">{selected.salary}</p>
                    )}
                    <div className="pj-meta-row">
                      {selected.job_type && <span className="pj-meta-chip">{selected.job_type}</span>}
                      {selected.experience && <span className="pj-meta-chip">{selected.experience}</span>}
                      {selected.category && <span className="pj-meta-chip">{selected.category}</span>}
                      {selected.created_at && (
                        <span className="pj-meta-chip">{formatPosted(selected.created_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="pj-apply-bar">
                    <button type="button" className="pj-btn-apply" onClick={() => handleApply(selected)}>
                      {selected.apply_url ? (
                        <><ExternalLink size={18} /> Apply now</>
                      ) : selected.apply_email ? (
                        <><Mail size={18} /> Email application</>
                      ) : (
                        <>View role</>
                      )}
                    </button>
                  </div>

                  {selected.description && (
                    <section className="pj-section">
                      <h3>About the role</h3>
                      <p>{selected.description}</p>
                    </section>
                  )}

                  {selected.requirements && (
                    <section className="pj-section">
                      <h3>Requirements</h3>
                      <p>{selected.requirements}</p>
                    </section>
                  )}

                  {selected.skills?.length > 0 && (
                    <section className="pj-section">
                      <h3>Skills</h3>
                      <div className="pj-skills">
                        {selected.skills.map((s) => (
                          <span key={s} className="pj-skill">{s}</span>
                        ))}
                      </div>
                    </section>
                  )}

                  {selected.posted_by && (
                    <p style={{ fontSize: 13, color: 'var(--pj-muted)' }}>
                      Listed by {selected.posted_by}
                    </p>
                  )}
                </div>
              )}

              {canAccess && !selected && (
                <div className="pj-detail-empty">
                  <Briefcase size={40} style={{ opacity: 0.3 }} />
                  <h2>Select a role</h2>
                  <p>Choose a listing from the left to view details.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </Layout>
  )
}
