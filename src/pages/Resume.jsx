import Layout from '../components/layout/Layout'
import { useState } from 'react'
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Loader2, 
  Target,
  FileCheck
} from 'lucide-react'

export default function Resume() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragging, setDragging] = useState(false)

  // 📁 HANDLE FILE
 const handleFile = (f) => {
  if (!f) return

  if (f.type !== 'application/pdf') {
    alert('Only PDF allowed')
    return
  }

  if (f.size > 5 * 1024 * 1024) {
    alert('File must be under 5MB')
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


  // 🤖 FAKE AI ANALYSIS (PHASE 3)
  const analyzeResume = () => {
    if (!file) return
    setLoading(true)

    // Fake delay to simulate AI processing
    setTimeout(() => {
      setResult({
        score: 82,
        ats: 'Optimized',
        strengths: [
          'Strong technical stack (Python, SQL)',
          'Clear chronological project experience',
          'Clean, machine-readable formatting'
        ],
        improvements: [
          'Add quantified achievements (e.g., "increased by X%")',
          'Strengthen the professional summary section',
          'Include links to live portfolios or GitHub'
        ],
        missing: ['Power BI', 'Statistics', 'Data Visualization', 'A/B Testing']
      })
      setLoading(false)
    }, 2500)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">
        
        {/* Ambient Background Glow */}
        <div className="absolute top-0 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 w-fit mb-2 backdrop-blur-sm">
            <Sparkles size={14} />
            <span>AI Resume Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            ATS Resume Analyzer
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Upload your PDF resume to get instant AI-powered feedback, ATS compatibility scoring, and keyword gap analysis.
          </p>
        </div>

        {/* ── UPLOAD BOX ────────────────────────────────────────── */}
        <div className="mb-8 z-10 relative">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDragEnd={() => setDragging(false)} 
            onDrop={handleDrop}
            className={`relative overflow-hidden border-2 border-dashed rounded-[2rem] p-10 sm:p-16 text-center transition-all duration-300 backdrop-blur-xl flex flex-col items-center justify-center min-h-[300px]
              ${dragging 
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                : 'border-white/10 bg-[#111116]/80 hover:border-white/20 hover:bg-[#111116]'}
            `}
          >
            {/* Inner ambient glow for dropzone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                {file ? <FileCheck size={36} className="text-emerald-400" /> : <UploadCloud size={36} className="text-blue-400" />}
              </div>

              {!file ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">Drag & drop your resume</h3>
                  <p className="text-gray-400 text-sm font-light mb-6">
                    Supports PDF documents up to 5MB
                  </p>
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
                  <p className="text-gray-300 text-sm mb-8 font-medium bg-white/5 inline-flex px-4 py-2 rounded-lg border border-white/10">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-4 justify-center">
                    <button
                      onClick={analyzeResume}
                      disabled={!file || loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Analyzing via AI...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate Report
                        </>
                      )}
                    </button>
                    {!loading && (
                      <button onClick={() => setFile(null)} className="text-gray-500 hover:text-white text-sm transition-colors px-4 py-2">
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── AI RESULT GRID ────────────────────────────────────── */}
        {result && (
          <div className="space-y-6 z-10 relative animate-fade-in">
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* SCORE CARD */}
              <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex items-center justify-between shadow-2xl">
                <div>
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Target size={16} className="text-blue-400" /> Overall Score
                  </h3>
                  <p className="text-gray-500 text-sm font-light mt-4 max-w-sm">
                    Your resume scores in the top 18% of applicants for Data Analyst roles.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[4rem] font-black leading-none tracking-tighter bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {result.score}
                  </span>
                  <span className="text-gray-500 text-xl font-bold">/100</span>
                </div>
              </div>

              {/* ATS COMPATIBILITY CARD */}
             <div className="flex items-center gap-3">
  
  <div
    className={`w-3 h-3 rounded-full animate-pulse ${
      atsStatus === 'Optimized'
        ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
        : 'bg-red-400'
    }`}
  />

  <p
    className={`text-2xl font-bold tracking-tight ${
      atsStatus === 'Optimized'
        ? 'text-white'
        : 'text-red-400'
    }`}
  >
    {atsStatus}
  </p>

</div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* STRENGTHS */}
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-3 text-lg">
                  <CheckCircle2 size={22} className="text-emerald-400" />
                  Key Strengths
                </h3>
                <ul className="space-y-4">
                  {result.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* IMPROVEMENTS */}
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-3 text-lg">
                  <AlertTriangle size={22} className="text-amber-400" />
                  Actionable Improvements
                </h3>
                <ul className="space-y-4">
                  {result.improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* MISSING KEYWORDS */}
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-3 text-lg">
                <XCircle size={22} className="text-rose-400" />
                Missing Industry Keywords
              </h3>
              <p className="text-gray-400 text-sm font-light mb-6">
                Adding these keywords to your skills or experience sections will significantly boost your ATS match rate for Data Analyst positions.
              </p>
              <div className="flex flex-wrap gap-3">
                {result.missing.map((item, i) => (
                  <span
                    key={i}
                    className="text-sm px-4 py-2 bg-rose-500/10 text-rose-300 rounded-lg border border-rose-500/20 font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </Layout>
  )
}