import Layout from '../components/layout/Layout'
import { useState } from 'react'
import {
  Sparkles, Map, AlertTriangle, BookOpen, Loader2, Target,
  Compass, Milestone, ArrowRight, CheckCircle2, Clock, ChevronRight
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const EXPERIENCE_OPTIONS = [
  { label: 'Fresher (0 years)', value: 0 },
  { label: '1 year', value: 1 },
  { label: '2 years', value: 2 },
  { label: '3–5 years', value: 4 },
  { label: '5+ years', value: 6 },
]

export default function CareerPath() {
  const [currentRole, setCurrentRole]   = useState('')
  const [targetRole, setTargetRole]     = useState('')
  const [skills, setSkills]             = useState('')
  const [experience, setExperience]     = useState(0)
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState(null)

  const handleGenerate = async () => {
    if (!targetRole.trim() || !skills.trim()) {
      toast.error('Please fill in target role and current skills')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const skillList = skills.split(',').map(s => s.trim()).filter(Boolean)
      const res = await api.post('/career/path', {
        current_role:     currentRole.trim() || 'Student',
        target_role:      targetRole.trim(),
        current_skills:   skillList,
        experience_years: experience,
      })
      setResult(res.data.career_path)
      toast.success('Roadmap generated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate roadmap. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 w-fit mb-2">
            <Compass size={14} /> AI Career Architect
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Path Generator</h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Enter your current skills and target role to get a step-by-step AI roadmap tailored to the Indian job market.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 mb-10 z-10 relative shadow-2xl">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-5">

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Current Role (optional)</label>
              <input
                type="text"
                placeholder="e.g. Student, Junior Developer"
                value={currentRole}
                onChange={e => { setCurrentRole(e.target.value); setResult(null) }}
                className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Target Role *</label>
              <div className="relative group">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="e.g. Data Analyst, ML Engineer"
                  value={targetRole}
                  onChange={e => { setTargetRole(e.target.value); setResult(null) }}
                  className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Current Skills * (comma separated)</label>
              <div className="relative group">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="e.g. Excel, Python, SQL"
                  value={skills}
                  onChange={e => { setSkills(e.target.value); setResult(null) }}
                  className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Experience</label>
              <div className="flex gap-2 flex-wrap">
                {EXPERIENCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                      experience === opt.value
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                        : 'bg-white/3 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!targetRole.trim() || !skills.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none"
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Architecting Path...</>
              : <><Map size={18} /> Generate Roadmap</>
            }
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="grid md:grid-cols-3 gap-6 z-10 relative">

            {/* Roadmap timeline */}
            <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
                <Milestone className="text-blue-400" size={22} /> Strategic Roadmap
              </h3>
              {result.estimated_total_weeks && (
               <p className="text-gray-500 text-sm mb-6 flex items-center gap-1.5">
              <Clock size={13} /> Estimated time: <span className="text-gray-300">{result.estimated_total_weeks} weeks</span>
               </p>
              )}

              <div className="relative border-l-2 border-white/8 ml-4 space-y-8 pb-2">
                {(result.steps || []).map((step, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#111116] border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Step {step.step_number}: {step.skill_to_learn}
                      </h4>
                      {step.estimated_weeks && (
                        <span className="text-[11px] text-gray-500 border border-white/10 px-2 py-0.5 rounded-lg shrink-0">
                          ~{step.estimated_weeks}w
                        </span>
                      )}
                    </div>
                    {step.why_important && (
                      <p className="text-gray-400 text-sm mb-3 leading-relaxed">{step.why_important}</p>
                    )}
                    {step.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((r, j) => (
                          <span key={j} className="text-xs px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-gray-400">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Skill gap */}
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} className="text-amber-400" /> Skill Gap
                </h3>
                {result.skill_gap?.missing?.length > 0 ? (
                  <>
                    <p className="text-gray-500 text-xs mb-3">Skills to acquire:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skill_gap.missing.map((s, i) => (
                        <span key={i} className="text-xs font-medium px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded-lg border border-amber-500/20">{s}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm">
                    <CheckCircle2 size={15} /> You have all core skills!
                  </div>
                )}

                {result.skill_gap?.already_have?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-xs mb-2">Already have:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skill_gap.already_have.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resources from steps */}
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                  <BookOpen size={16} className="text-emerald-400" /> All Resources
                </h3>
                <ul className="space-y-2">
                  {(result.steps || [])
                    .flatMap(s => (s.resources || []).map(r => ({ resource: r, skill: s.skill_to_learn })))
                    .filter((v, i, arr) => arr.findIndex(x => x.resource === v.resource) === i)
                    .slice(0, 8)
                    .map((item, i) => (
                      <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                        <ChevronRight size={12} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-gray-300 text-xs">{item.resource}</p>
                          <p className="text-gray-600 text-[10px]">{item.skill}</p>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}