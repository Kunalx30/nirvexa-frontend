import Layout from '../components/layout/Layout'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Bookmark, MapPin, DollarSign, IndianRupee, Clock, ExternalLink,
  ArrowLeft, Sparkles, Building2, Briefcase, Loader2, AlertCircle, Globe, Shield
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchJobById, saveJob, deleteSavedJob, fetchSavedJobs } from '../services/jobs'
import toast from 'react-hot-toast'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedRecordId, setSavedRecordId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJobById(id)
      .then(res => {
        if (cancelled) return
        setJob(res.data?.data || res.data)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.response?.data?.message || 'Could not load this job listing.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    fetchSavedJobs()
      .then(res => {
        const list = res.data?.data || res.data || []
        const match = list.find(sj => String(sj.job_id) === String(id))
        if (match) setSavedRecordId(match.id)
      })
      .catch(() => { })
  }, [id])

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
        setSavedRecordId((res.data?.data || res.data).id)
        toast.success('Job saved!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update saved jobs')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="jd-page">
          <div className="jd-wrap">
            <div className="jd-back-link jd-skeleton" style={{ width: 120, height: 20, marginBottom: 32 }} />
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="jd-card jd-skeleton" style={{ height: 220 }} />
                <div className="jd-card jd-skeleton" style={{ height: 100 }} />
                <div className="jd-card jd-skeleton" style={{ height: 260 }} />
              </div>
              <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="jd-card jd-skeleton" style={{ height: 80 }} />
                <div className="jd-card jd-skeleton" style={{ height: 80 }} />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="jd-page">
          <div className="jd-wrap jd-error-wrap">
            <div className="jd-error-icon">
              {error ? <AlertCircle size={40} strokeWidth={1.5} /> : <Briefcase size={40} strokeWidth={1.5} />}
            </div>
            <h2 className="jd-error-title">
              {error ? 'Could not load job' : 'Listing Unavailable'}
            </h2>
            <p className="jd-error-sub">
              {error || 'This job may have expired or been removed.'}
            </p>
            <Link to="/jobs" className="jd-btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
              <ArrowLeft size={16} />
              Back to Job Board
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const isSaved = !!savedRecordId

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <Layout>
      <style>{styles}</style>
      <div className="jd-page">
        <div className="jd-wrap">

          {/* Back */}
          <Link to="/jobs" className="jd-back-link">
            <ArrowLeft size={15} />
            Back to Search
          </Link>

          <div className="jd-layout">

            {/* ── MAIN COLUMN ─────────────────────────────────────────────── */}
            <div className="jd-main">

              {/* HEADER CARD */}
              <div className="jd-card jd-header-card">

                {/* Logo placeholder + meta */}
                <div className="jd-company-row">
                  <div className="jd-company-logo">
                    {job.company?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="jd-company-name">
                      <Building2 size={14} strokeWidth={2} />
                      {job.company}
                    </div>
                    {job.source && (
                      <div className="jd-company-source">
                        <Globe size={12} strokeWidth={2} /> {job.source}
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="jd-title">{job.title}</h1>

                {/* Pills */}
                <div className="jd-pills">
                  {job.location && (
                    <span className="jd-pill jd-pill-neutral">
                      <MapPin size={13} strokeWidth={2} /> {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="jd-pill jd-pill-green">
                      {/(₹|inr|rs|lpa)/i.test(job.salary) || job.source?.toLowerCase() === 'internshala' ? <IndianRupee size={13} strokeWidth={2} /> : <DollarSign size={13} strokeWidth={2} />} {job.salary}
                    </span>
                  )}
                  {job.experience && (
                    <span className="jd-pill jd-pill-neutral">
                      <Clock size={13} strokeWidth={2} /> {job.experience}
                    </span>
                  )}
                  {job.job_type && (
                    <span className="jd-pill jd-pill-blue">{job.job_type.replace('-', ' ')}</span>
                  )}
                </div>

                {/* Desktop CTA row */}
                <div className="jd-cta-row">
                  {job.apply_url ? (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="jd-btn-primary"
                    >
                      Apply Now
                      <ExternalLink size={15} strokeWidth={2} />
                    </a>
                  ) : (
                    <div className="jd-btn-disabled">No apply link available</div>
                  )}

                  <button
                    onClick={toggleSave}
                    disabled={saving}
                    className={`jd-btn-save ${isSaved ? 'jd-btn-save--saved' : ''}`}
                  >
                    {saving
                      ? <Loader2 size={16} strokeWidth={2} className="jd-spin" />
                      : <Bookmark size={16} strokeWidth={2} style={{ fill: isSaved ? 'currentColor' : 'none' }} />
                    }
                    {isSaved ? 'Saved' : 'Save Job'}
                  </button>
                </div>

                {/* Mobile save */}
                <button
                  onClick={toggleSave}
                  disabled={saving}
                  className={`jd-btn-save jd-btn-save--mobile ${isSaved ? 'jd-btn-save--saved' : ''}`}
                >
                  {saving
                    ? <Loader2 size={16} strokeWidth={2} className="jd-spin" />
                    : <Bookmark size={16} strokeWidth={2} style={{ fill: isSaved ? 'currentColor' : 'none' }} />
                  }
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>

              {/* AI SUMMARY */}
              {job.ai_summary && (
                <div className="jd-card jd-ai-card">
                  <div className="jd-ai-label">
                    <Sparkles size={14} strokeWidth={2} />
                    AI Career Match Analysis
                  </div>
                  <p className="jd-ai-text">{job.ai_summary}</p>
                </div>
              )}

              {/* DESCRIPTION & SKILLS */}
              <div className="jd-card">

                {job.skills?.length > 0 && (
                  <div className="jd-section">
                    <h2 className="jd-section-title">Required Tech Stack</h2>
                    <div className="jd-skills">
                      {job.skills.map(skill => (
                        <span key={skill} className="jd-skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {job.description && (
                  <div className="jd-section" style={{ marginTop: job.skills?.length > 0 ? 28 : 0 }}>
                    <h2 className="jd-section-title">Role Description</h2>
                    <p className="jd-description">{job.description}</p>
                  </div>
                )}

                {job.posted_at && (
                  <p className="jd-posted-date">
                    Posted: {new Date(job.posted_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                )}
              </div>

            </div>

            {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
            <aside className="jd-sidebar">
              <p className="jd-sidebar-label">Quick Actions</p>

              <button onClick={() => navigate('/saved')} className="jd-sidebar-btn">
                <div className="jd-sidebar-icon jd-sidebar-icon--purple">
                  <Bookmark size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="jd-sidebar-btn-title">View Saved Jobs</p>
                  <p className="jd-sidebar-btn-sub">Track your applications</p>
                </div>
              </button>

              <button onClick={() => navigate('/jobs')} className="jd-sidebar-btn">
                <div className="jd-sidebar-icon jd-sidebar-icon--blue">
                  <Briefcase size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="jd-sidebar-btn-title">Browse More Jobs</p>
                  <p className="jd-sidebar-btn-sub">Search all {job.source || ''} listings</p>
                </div>
              </button>

              <div className="jd-secure">
                <Shield size={11} strokeWidth={2} />
                Secure · Encrypted · Built in India
              </div>
            </aside>

          </div>
        </div>

        {/* Mobile sticky apply */}
        <div className="jd-mobile-apply">
          {job.apply_url ? (
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="jd-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Apply Now <ExternalLink size={15} strokeWidth={2} />
            </a>
          ) : (
            <div className="jd-btn-disabled">No apply link available</div>
          )}
        </div>
      </div>
    </Layout>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

  .jd-page {
    min-height: 100vh;
    background: #fafafa;
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    padding-bottom: 80px;
  }

  .jd-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 36px 24px 48px;
  }

  /* Back link */
  .jd-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #a3a3a3;
    text-decoration: none;
    margin-bottom: 28px;
    transition: color .2s;
  }
  .jd-back-link:hover { color: #0a0a0a; }

  /* Layout */
  .jd-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .jd-main {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .jd-sidebar {
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 4px;
  }

  /* Cards */
  .jd-card {
    background: #ffffff;
    border: 1px solid #e4e4e4;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 2px 4px rgba(0,0,0,.03), 0 8px 28px rgba(0,0,0,.05);
  }

  /* Skeleton */
  .jd-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: jd-shimmer 1.4s infinite;
    border: none;
    box-shadow: none;
  }
  @keyframes jd-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Error state */
  .jd-error-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 52vh;
    text-align: center;
  }
  .jd-error-icon { color: #c4c4c4; margin-bottom: 16px; }
  .jd-error-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    color: #0a0a0a;
    letter-spacing: -.8px;
    margin-bottom: 8px;
  }
  .jd-error-sub { font-size: 14px; color: #6b6b6b; margin-bottom: 24px; }

  /* Header card specifics */
  .jd-company-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .jd-company-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #0a0a0a;
    color: #fafafa;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -.5px;
    flex-shrink: 0;
  }
  .jd-company-name {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 600;
    color: #0a0a0a;
    letter-spacing: -.2px;
  }
  .jd-company-source {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #a3a3a3;
    margin-top: 2px;
  }

  /* Title */
  .jd-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(24px, 4vw, 32px);
    font-weight: 400;
    letter-spacing: -1.2px;
    color: #0a0a0a;
    line-height: 1.15;
    margin-bottom: 16px;
  }

  /* Pills */
  .jd-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
  }
  .jd-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 20px;
    letter-spacing: -.1px;
  }
  .jd-pill-neutral {
    background: #f5f5f5;
    color: #4a4a4a;
    border: 1px solid #ebebeb;
  }
  .jd-pill-green {
    background: #f0faf4;
    color: #1a7a42;
    border: 1px solid #d4eedf;
  }
  .jd-pill-blue {
    background: #f0f4ff;
    color: #3355cc;
    border: 1px solid #d4dcf5;
  }

  /* CTA row */
  .jd-cta-row {
    display: flex;
    gap: 10px;
  }

  /* Primary button */
  .jd-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 24px;
    background: #0a0a0a;
    color: #fafafa;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -.3px;
    border: none;
    border-radius: 26px;
    cursor: pointer;
    text-decoration: none;
    transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s;
    flex: 1;
    justify-content: center;
  }
  .jd-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(0,0,0,.16);
  }

  .jd-btn-disabled {
    flex: 1;
    padding: 13px 24px;
    background: #f5f5f5;
    color: #a3a3a3;
    font-size: 14px;
    font-weight: 500;
    border-radius: 26px;
    border: 1px solid #ebebeb;
    text-align: center;
  }

  /* Save button */
  .jd-btn-save {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 13px 20px;
    background: #fafafa;
    color: #0a0a0a;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -.3px;
    border: 1px solid #e4e4e4;
    border-radius: 26px;
    cursor: pointer;
    white-space: nowrap;
    transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s, border-color .2s, color .2s;
  }
  .jd-btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,.08);
    border-color: #c4c4c4;
  }
  .jd-btn-save--saved {
    color: #0a0a0a;
    border-color: #0a0a0a;
  }
  .jd-btn-save--mobile {
    display: none;
    width: 100%;
    justify-content: center;
    margin-top: 12px;
  }
  .jd-spin {
    animation: jd-spin .7s linear infinite;
  }
  @keyframes jd-spin {
    to { transform: rotate(360deg); }
  }

  /* AI Summary card */
  .jd-ai-card {
    background: #fafafa;
    border: 1.5px dashed #d4d4d4;
    box-shadow: none;
  }
  .jd-ai-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #6b6b6b;
    margin-bottom: 10px;
  }
  .jd-ai-text {
    font-size: 15px;
    color: #2a2a2a;
    line-height: 1.65;
    font-weight: 400;
  }

  /* Section */
  .jd-section-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: -.6px;
    color: #0a0a0a;
    margin-bottom: 14px;
  }

  /* Skills */
  .jd-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .jd-skill-tag {
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    background: #f5f5f5;
    border: 1px solid #ebebeb;
    border-radius: 20px;
    color: #3a3a3a;
    letter-spacing: -.1px;
  }

  /* Description */
  .jd-description {
    font-size: 14px;
    color: #5a5a5a;
    line-height: 1.75;
    font-weight: 400;
    white-space: pre-wrap;
  }

  .jd-posted-date {
    font-size: 11px;
    color: #c4c4c4;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }

  /* Sidebar */
  .jd-sidebar-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #a3a3a3;
    padding: 0 4px;
    margin-bottom: 2px;
  }
  .jd-sidebar-btn {
    width: 100%;
    background: #ffffff;
    border: 1px solid #e4e4e4;
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,.03);
    transition: transform .2s, box-shadow .2s, border-color .2s;
  }
  .jd-sidebar-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,.08);
    border-color: #c4c4c4;
  }
  .jd-sidebar-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .jd-sidebar-icon--purple {
    background: #f4f0fe;
    color: #6c47d9;
  }
  .jd-sidebar-icon--blue {
    background: #eef3ff;
    color: #3355cc;
  }
  .jd-sidebar-btn-title {
    font-size: 13px;
    font-weight: 600;
    color: #0a0a0a;
    letter-spacing: -.2px;
    margin: 0 0 2px;
  }
  .jd-sidebar-btn-sub {
    font-size: 11px;
    color: #a3a3a3;
    margin: 0;
  }
  .jd-secure {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 10px;
    color: #c4c4c4;
    margin-top: 8px;
  }

  /* Mobile sticky apply */
  .jd-mobile-apply {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    padding: 14px 20px;
    background: rgba(250,250,250,.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid #e4e4e4;
    z-index: 50;
  }

  @media (max-width: 680px) {
    .jd-layout { flex-direction: column; }
    .jd-sidebar { width: 100%; }
    .jd-cta-row { display: none; }
    .jd-btn-save--mobile { display: inline-flex; }
    .jd-mobile-apply { display: block; }
    .jd-page { padding-bottom: 80px; }
    .jd-card { padding: 22px 20px; border-radius: 16px; }
  }

  @media (max-width: 420px) {
    .jd-wrap { padding: 24px 16px 48px; }
  }
`