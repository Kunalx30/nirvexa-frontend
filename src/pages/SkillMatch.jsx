import Layout from '../components/layout/Layout'
import { useState } from 'react'
import {
  Sparkles, Target, Loader2, CheckCircle2, XCircle,
  TrendingUp, BookOpen, Zap, Plus, X, ExternalLink
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const SKILL_SUGGESTIONS = [
  'Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'Java', 'React',
  'Node.js', 'Machine Learning', 'Data Analysis', 'AWS', 'Docker',
  'Figma', 'Product Management', 'Communication', 'Leadership',
]

export default function SkillMatch() {
  const [skills, setSkills]       = useState([])
  const [inputVal, setInputVal]   = useState('')
  const [targetJob, setTargetJob] = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)

  const addSkill = (s) => {
    const trimmed = s.trim()
    if (!trimmed || skills.includes(trimmed)) return
    setSkills(prev => [...prev, trimmed])
    setInputVal('')
    setResult(null)
  }

  const removeSkill = (s) => {
    setSkills(prev => prev.filter(x => x !== s))
    setResult(null)
  }

  const handleInputKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault()
      addSkill(inputVal.replace(/,$/, ''))
    }
  }

  const handleAnalyze = async () => {
    let currentSkills = [...skills]
    if (inputVal.trim()) {
      const newSkill = inputVal.trim().replace(/,$/, '')
      if (!currentSkills.includes(newSkill)) {
        currentSkills.push(newSkill)
      }
      setSkills(currentSkills)
      setInputVal('')
    }

    if (currentSkills.length === 0 || !targetJob.trim()) {
      toast.error('Add at least one skill and a target job title')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/career/skill-gap', {
        user_skills:      currentSkills,
        target_job_title: targetJob.trim(),
      })
      setResult(res.data.skill_gap)
      toast.success('Skill gap analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const matchPct = result?.match_percentage ?? 0
  const barColor = matchPct >= 70 ? 'from-emerald-500 to-teal-400'
    : matchPct >= 40 ? 'from-amber-500 to-yellow-400'
    : 'from-rose-500 to-pink-400'
  const pctColor = matchPct >= 70 ? 'text-emerald-600'
    : matchPct >= 40 ? 'text-amber-600'
    : 'text-rose-600'

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-purple-50/80 blur-[100px] rounded-full pointer-events-none" />

        <div className="pt-4 pb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-xs font-medium text-[#0a0a0a] mb-3">
            <Zap size={13} /> AI Skill Matcher
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight">Skill Gap Analysis</h1>
          <p className="text-[#4a4a4a] text-base font-medium mt-1 max-w-xl">
            Enter your skills and a target job title to see how well you match and what to learn next.
          </p>
        </div>

        <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6 sm:p-8 mb-8 z-10 relative">
          <div className="mb-5">
            <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-2 block ml-1">Target Job Title *</label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={15} />
              <input
                type="text"
                placeholder="e.g. Data Analyst, Frontend Developer"
                value={targetJob}
                onChange={e => { setTargetJob(e.target.value); setResult(null) }}
                className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl px-4 py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-2 block ml-1">Your Skills *</label>
            <div className="bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl p-3 min-h-[52px] flex flex-wrap gap-2 items-center focus-within:border-[#0a0a0a] focus-within:ring-1 focus-within:ring-[#0a0a0a] focus-within:bg-white transition-all shadow-sm">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0a0a0a] border border-[#0a0a0a] text-white shadow-sm text-xs rounded-lg font-medium">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-white transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleInputKey}
                placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
                className="flex-1 min-w-[140px] bg-transparent text-[#0a0a0a] placeholder-[#a3a3a3] text-sm focus:outline-none"
              />
            </div>
            <p className="text-[#a3a3a3] text-xs mt-1.5 ml-1">Press Enter or comma to add each skill</p>
          </div>

          <div className="mb-6">
            <p className="text-[#8b8b8b] text-xs font-semibold uppercase tracking-wider mb-2 block">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fcfcfc] border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm text-xs transition-all"
                >
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={(skills.length === 0 && !inputVal.trim()) || !targetJob.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
              : <><Sparkles size={16} /> Analyze Match</>
            }
          </button>
        </div>

        {result && (
          <div className="space-y-5 z-10 relative">
            <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-600" /> Match Score
                </h3>
                <span className={`text-3xl font-bold ${pctColor}`}>{matchPct}%</span>
              </div>
              <div className="h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${barColor}`}
                  style={{ width: `${matchPct}%` }}
                />
              </div>
              <p className="text-[#6b6b6b] font-medium text-xs mt-2">
                {matchPct >= 70
                  ? "Strong match — you're well-qualified for this role."
                  : matchPct >= 40
                  ? 'Moderate match — a few key skills will significantly improve your chances.'
                  : 'Low match — focus on acquiring the missing skills below.'}
              </p>
              {result.market_insight && (
                <p className="text-gray-400 text-xs mt-3 p-3 bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl shadow-sm hover:border-[#c4c4c4] transition-all leading-relaxed">
                  {result.market_insight}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {result.matching_skills?.length > 0 && (
                <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
                  <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                    <CheckCircle2 size={15} className="text-emerald-600" /> Skills You Have
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matching_skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm text-xs rounded-lg font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.missing_skills?.length > 0 && (
                <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
                  <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                    <XCircle size={15} className="text-rose-600" /> Skills to Learn
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 shadow-sm text-xs rounded-lg font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  {result.priority_skills?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#e4e4e4]">
                      <p className="text-[#8b8b8b] text-xs font-semibold uppercase tracking-wider mb-2 block">Focus on these first:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.priority_skills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 shadow-sm text-xs rounded font-medium">
                            ⚡ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {result.recommended_courses?.length > 0 && (
              <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                  <BookOpen size={15} className="text-blue-600" /> Recommended Learning Resources
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {result.recommended_courses.map((course, i) => (
                    <a
                      key={i}
                      href={course.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 p-3 bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl shadow-sm hover:border-blue-300 hover:bg-[#f0f9ff] transition-colors group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#3a3a3a] text-sm group-hover:text-blue-600 font-medium transition-colors leading-snug">
                          {course.resource}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#8b8b8b] text-xs capitalize">{course.skill}</span>
                          {course.is_free && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-semibold">
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-[#8b8b8b] group-hover:text-blue-600 transition-colors shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}