import Layout from '../components/layout/Layout'
import { useState, useEffect } from 'react'
import {
  UploadCloud, FileText, CheckCircle2, XCircle, AlertTriangle,
  Sparkles, Loader2, Target, FileCheck, History, ChevronDown,
  ChevronUp, RefreshCw
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

// ── API calls ──────────────────────────────────────────────────────────────────
const analyzeResumeAPI = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // Groq can take ~15s — give it 60s
  })
}

const fetchResumeHistory = () => api.get('/resume/history')

// ── Helpers ────────────────────────────────────────────────────────────────────
const getAtsStyles = (status) => {
  const s = status?.toLowerCase()
  if (s === 'excellent' || s === 'optimized')
    return {
      dot:   'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]',
      text:  'text-emerald-400',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      label: 'Ready to Apply',
    }
  if (s === 'good')
    return {
      dot:   'bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      text:  'text-blue-400',
      badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      label: 'Good Standing',
    }
  if (s === 'fair' || s === 'needs improvement')
    return {
      dot:   'bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      text:  'text-amber-400',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      label: 'Needs Work',
    }
  return {
    dot:   'bg-rose-400',
    text:  'text-rose-400',
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    label: 'Poor Match',
  }
}

const getScoreGradient = (score) => {
  if (score >= 80) return 'from-emerald-400 to-blue-400'
  if (score >= 60) return 'from-blue-400 to-purple-400'
  if (score >= 40) return 'from-amber-400 to-orange-400'
  return 'from-rose-400 to-pink-400'
}

export default function Resume() {
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [dragging, setDragging] = useState(false)

  const [history, setHistory]             = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [showHistory, setShowHistory]     = useState(false)

  // ── Fetch history on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetchResumeHistory()
      .then(res => {
        const data = res.data?.analyses || res.data?.data || res.data || []
        setHistory(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [])

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are supported')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Analyze ────────────────────────────────────────────────────────────────
  const analyzeResume = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const res  = await analyzeResumeAPI(file)
      // Backend returns fields directly (not wrapped in data)
      const data = res.data?.data || res.data
      setResult(data)
      toast.success('Analysis complete!')
      // Refresh history list
      fetchResumeHistory()
        .then(r => {
          const list = r.data?.analyses || r.data?.data || r.data || []
          setHistory(Array.isArray(list) ? list : [])
        })
        .catch(() => {})
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const atsStyles = result ? getAtsStyles(result.ats_status) : null

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 w-fit mb-2 backdrop-blur-sm">
            <Sparkles size={14} />
            <span>AI Resume Scanner · Nirvexa Resume AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            ATS Resume Analyzer
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Upload your PDF resume to get instant AI-powered feedback, ATS compatibility scoring, and keyword gap analysis.
          </p>
        </div>

        {/* ── UPLOAD BOX ────────────────────────────────────────────────────── */}
        <div className="mb-8 z-10 relative">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDragEnd={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative overflow-hidden border-2 border-dashed rounded-[2rem] p-10 sm:p-16 text-center transition-all duration-300 backdrop-blur-xl flex flex-col items-center justify-center min-h-[280px]
              ${dragging
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                : 'border-white/10 bg-[#111116]/80 hover:border-white/20 hover:bg-[#111116]'}
            `}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm mx-auto">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                {file
                  ? <FileCheck size={36} className="text-emerald-400" />
                  : <UploadCloud size={36} className="text-blue-400" />
                }
              </div>

              {!file ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">Drag & drop your resume</h3>
                  <p className="text-gray-400 text-sm font-light mb-6">Supports PDF documents up to 5MB</p>
                  <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium px-6 py-3 rounded-xl transition-all">
                    Browse Files
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-emerald-400 mb-2">File Ready</h3>
                  <div className="flex items-center justify-center gap-2 text-gray-300 text-sm mb-8 font-medium bg-white/5 px-4 py-2 rounded-lg border border-white/10 mx-auto w-fit max-w-full">
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-4 justify-center">
                    <button
                      onClick={analyzeResume}
                      disabled={loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none"
                    >
                      {loading ? (
                        <><Loader2 size={18} className="animate-spin" /> Analyzing with Groq AI...</>
                      ) : (
                        <><Sparkles size={18} /> Generate Report</>
                      )}
                    </button>
                    {!loading && (
                      <button
                        onClick={() => { setFile(null); setResult(null) }}
                        className="text-gray-500 hover:text-white text-sm transition-colors px-4 py-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {loading && (
                    <p className="text-gray-500 text-xs mt-5 animate-pulse">
                     AI is analyzing your resume… this usually takes around 15 seconds
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── RESULTS ───────────────────────────────────────────────────────── */}
        {result && (
          <div className="space-y-6 z-10 relative">

            {/* Score + ATS row */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* SCORE */}
              <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex items-center justify-between shadow-2xl">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Target size={16} className="text-blue-400" /> Overall Score
                  </h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">
                    {result.overall_score >= 80
                      ? 'Your resume is strong and competitive for most roles.'
                      : result.overall_score >= 60
                      ? 'Good resume — a few improvements will make it stand out.'
                      : 'Your resume needs work before applying to competitive roles.'
                    }
                  </p>
                  {result.model_used && (
                    <p className="text-[11px] text-gray-600 mt-3 font-mono">via {result.model_used}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[4.5rem] font-black leading-none tracking-tighter bg-gradient-to-br ${getScoreGradient(result.overall_score)} bg-clip-text text-transparent`}>
                    {result.overall_score}
                  </span>
                  <span className="text-gray-500 text-xl font-bold">/100</span>
                </div>
              </div>

              {/* ATS */}
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
                  ATS Compatibility
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse flex-shrink-0 ${atsStyles.dot}`} />
                  <p className={`text-2xl font-bold tracking-tight ${atsStyles.text}`}>
                    {result.ats_status}
                  </p>
                </div>
                <span className={`mt-4 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border w-fit ${atsStyles.badge}`}>
                  {atsStyles.label}
                </span>
              </div>
            </div>

            {/* Skills Found */}
            {result.skills_found?.length > 0 && (
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-white font-semibold mb-5 flex items-center gap-3 text-lg">
                  <CheckCircle2 size={22} className="text-blue-400" />
                  Skills Detected in Your Resume
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills_found.map((skill, i) => (
                    <span key={i} className="text-sm font-medium px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths + Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              {result.strengths?.length > 0 && (
                <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                  <h3 className="text-white font-semibold mb-6 flex items-center gap-3 text-lg">
                    <CheckCircle2 size={22} className="text-emerald-400" /> Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {result.strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.improvements?.length > 0 && (
                <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                  <h3 className="text-white font-semibold mb-6 flex items-center gap-3 text-lg">
                    <AlertTriangle size={22} className="text-amber-400" /> Actionable Improvements
                  </h3>
                  <ul className="space-y-3">
                    {result.improvements.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Missing Keywords */}
            {result.missing_keywords?.length > 0 && (
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-3 text-lg">
                  <XCircle size={22} className="text-rose-400" /> Missing Industry Keywords
                </h3>
                <p className="text-gray-400 text-sm font-light mb-6">
                  Adding these to your skills or experience sections will boost your ATS match rate significantly.
                </p>
                <div className="flex flex-wrap gap-3">
                  {result.missing_keywords.map((item, i) => (
                    <span key={i} className="text-sm px-4 py-2 bg-rose-500/10 text-rose-300 rounded-lg border border-rose-500/20 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze another */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => { setFile(null); setResult(null) }}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all"
              >
                <RefreshCw size={14} /> Analyze Another Resume
              </button>
            </div>
          </div>
        )}

        {/* ── HISTORY ───────────────────────────────────────────────────────── */}
        {!historyLoading && history.length > 0 && (
          <div className="mt-12 z-10 relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors mb-4 group"
            >
              <History size={18} className="text-purple-400" />
              <span className="font-semibold">Past Analyses ({history.length})</span>
              {showHistory
                ? <ChevronUp size={16} className="text-gray-600 group-hover:text-gray-400" />
                : <ChevronDown size={16} className="text-gray-600 group-hover:text-gray-400" />
              }
            </button>

            {showHistory && (
              <div className="space-y-3">
                {history.map((item, i) => {
                  const s = getAtsStyles(item.ats_status)
                  return (
                    <div key={item.id || i} className="bg-[#111116]/60 border border-white/5 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-black bg-gradient-to-br ${getScoreGradient(item.overall_score)} bg-clip-text text-transparent`}>
                          {item.overall_score}<span className="text-gray-600 text-sm font-normal">/100</span>
                        </div>
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${s.badge}`}>
                            {item.ats_status}
                          </span>
                          {item.created_at && (
                            <p className="text-gray-600 text-xs mt-1">
                              {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.skills_found?.slice(0, 5).map((skill, j) => (
                          <span key={j} className="text-[10px] font-medium px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">
                            {skill}
                          </span>
                        ))}
                        {item.skills_found?.length > 5 && (
                          <span className="text-[10px] text-gray-600 px-1">+{item.skills_found.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}
