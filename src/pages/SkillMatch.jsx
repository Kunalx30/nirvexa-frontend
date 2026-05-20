import Layout from '../components/layout/Layout'
import { useMemo, useState } from 'react'
import {
  Sparkles, Target, Loader2, CheckCircle2, XCircle,
  TrendingUp, BookOpen, Zap, Plus, X, ExternalLink,
  Layers, PanelRightOpen, Search
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const SKILL_SUGGESTIONS = [
  'Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'Java', 'React',
  'Node.js', 'Machine Learning', 'Data Analysis', 'AWS', 'Docker',
  'Figma', 'Product Management', 'Communication', 'Leadership',
]

function scoreTone(score) {
  if (score >= 70) {
    return {
      label: 'Strong match',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      bar: 'bg-emerald-500',
      note: "You already cover most of this role. Polish the priority gaps and start applying."
    }
  }
  if (score >= 40) {
    return {
      label: 'Buildable match',
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
      note: 'You have a workable base. A few targeted skills will noticeably lift your fit.'
    }
  }
  return {
    label: 'Learning track',
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    bar: 'bg-rose-500',
    note: 'Start with the priority skills first, then move into the broader missing list.'
  }
}

export default function SkillMatch() {
  const [skills, setSkills] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [targetJob, setTargetJob] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

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
    if (skills.length === 0 || !targetJob.trim()) {
      toast.error('Add at least one skill and a target job title')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/career/skill-gap', {
        user_skills: skills,
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
  const tone = scoreTone(matchPct)
  const nextSkills = useMemo(() => {
    const priority = result?.priority_skills || []
    const missing = result?.missing_skills || []
    return [...new Set([...priority, ...missing])].slice(0, 6)
  }, [result])

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .sm-sans, .sm-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .sm-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .sm-grid-bg {
          background-image:
            linear-gradient(rgba(228,228,228,.42) 1px, transparent 1px),
            linear-gradient(90deg, rgba(228,228,228,.42) 1px, transparent 1px);
          background-size: 28px 28px;
          background-position: -1px -1px;
        }
        @keyframes smFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .sm-fade { animation: smFade .25s ease both; }
      `}</style>

      <div className="sm-sans sm-grid-bg max-w-6xl mx-auto px-4 sm:px-6 pb-16 relative">
        <section className="pt-6 pb-5">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#e4e4e4] px-3 py-1.5 text-xs font-semibold text-[#0a0a0a] shadow-sm">
            <Zap size={13} className="text-blue-600" />
            AI Skill Matcher
          </div>
          <div className="mt-3 grid lg:grid-cols-[1fr_330px] gap-5 items-end">
            <div>
              <h1 className="sm-serif text-3xl sm:text-5xl text-[#0a0a0a] leading-tight">Match your skills to a role.</h1>
              <p className="mt-2 text-[#525252] text-sm sm:text-base max-w-2xl">
                Add what you know, choose the target job, and get a classified view of strengths, gaps, priorities, and learning resources.
              </p>
            </div>
            <div className="rounded-lg border border-[#e4e4e4] bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b]">Readout</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ['Skills', skills.length],
                  ['Match', result ? `${matchPct}%` : '--'],
                  ['Gaps', result?.missing_skills?.length ?? '--'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-3">
                    <p className="text-lg font-black text-[#111] leading-none">{value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-[#8b8b8b]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_310px] gap-5 items-start">
          <div className="rounded-lg border border-[#e4e4e4] bg-white p-5 sm:p-6 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-[#6b6b6b] uppercase tracking-wider mb-2 block">Target Job Title *</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={15} />
                  <input
                    type="text"
                    placeholder="e.g. Data Analyst, Frontend Developer"
                    value={targetJob}
                    onChange={e => { setTargetJob(e.target.value); setResult(null) }}
                    className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-lg px-4 py-3.5 pl-11 focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6b6b6b] uppercase tracking-wider mb-2 block">Add Skills *</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={15} />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={handleInputKey}
                    placeholder="Type a skill and press Enter"
                    className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-lg px-4 py-3.5 pl-11 pr-12 focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(inputVal)}
                    disabled={!inputVal.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md bg-[#0a0a0a] text-white inline-flex items-center justify-center disabled:bg-[#d4d4d4]"
                    title="Add skill"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-3 min-h-[58px]">
              <div className="flex flex-wrap gap-2 items-center">
                {skills.length === 0 && (
                  <span className="text-sm font-semibold text-[#a3a3a3]">Your selected skills will appear here</span>
                )}
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-md bg-[#0a0a0a] border border-[#0a0a0a] text-white px-2.5 py-1 text-xs font-semibold">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-white/70 hover:text-white transition-colors" title={`Remove ${s}`}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Quick add</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 12).map(s => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="inline-flex items-center gap-1 rounded-md bg-white border border-[#e4e4e4] px-2.5 py-1.5 text-xs font-semibold text-[#525252] transition hover:border-[#0a0a0a] hover:text-[#111] hover:-translate-y-px"
                  >
                    <Plus size={10} /> {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={skills.length === 0 || !targetJob.trim() || loading}
              className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-7 py-3 rounded-lg transition-all shadow-sm hover:-translate-y-0.5 disabled:transform-none text-sm"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                : <><Sparkles size={16} /> Analyze Match</>
              }
            </button>
          </div>

          <aside className="rounded-lg border border-[#e4e4e4] bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <PanelRightOpen size={14} />
              Skill Focus
            </div>
            <div className="mt-4 space-y-3">
              {(result ? nextSkills : skills.slice(0, 6)).map((skill, i) => (
                <div key={`${skill}-${i}`} className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] px-3 py-2">
                  <p className="text-xs font-black text-[#111]">{skill}</p>
                  <p className="mt-1 text-[10px] font-semibold text-[#8b8b8b] uppercase">
                    {result ? (i < (result.priority_skills?.length || 0) ? 'Priority' : 'Gap') : 'Current skill'}
                  </p>
                </div>
              ))}
              {!result && skills.length === 0 && (
                <p className="text-sm text-[#6b6b6b] leading-relaxed">Add skills and run analysis to see the highest-impact learning priorities here.</p>
              )}
            </div>
          </aside>
        </section>

        {result && (
          <section className="mt-5 space-y-5 sm-fade">
            <div className={`rounded-lg border ${tone.border} ${tone.bg} p-5 sm:p-6 shadow-sm`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6b6b6b]">
                    <TrendingUp size={14} />
                    Match score
                  </div>
                  <h2 className={`mt-2 text-5xl font-black leading-none ${tone.text}`}>{matchPct}%</h2>
                  <p className="mt-2 text-sm font-semibold text-[#3a3a3a]">{tone.label}</p>
                  <p className="mt-1 text-sm text-[#525252] max-w-2xl">{tone.note}</p>
                </div>
                <div className="w-full sm:w-80">
                  <div className="h-3 rounded-full bg-white/80 border border-white overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${tone.bar}`} style={{ width: `${matchPct}%` }} />
                  </div>
                  {result.market_insight && (
                    <p className="mt-3 rounded-lg border border-white/80 bg-white/70 p-3 text-xs leading-relaxed text-[#525252]">
                      {result.market_insight}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
              <div className="rounded-lg border border-[#e4e4e4] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-[#111] mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Skills You Have
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(result.matching_skills || []).length > 0 ? result.matching_skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md font-semibold">
                      {s}
                    </span>
                  )) : (
                    <p className="text-sm text-[#8b8b8b]">No direct matches were returned.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-[#e4e4e4] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-[#111] mb-4 flex items-center gap-2">
                  <XCircle size={16} className="text-rose-600" />
                  Skills to Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(result.missing_skills || []).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
                {result.priority_skills?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#e4e4e4]">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Focus first</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.priority_skills.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-md font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {result.recommended_courses?.length > 0 && (
              <div className="rounded-lg border border-[#e4e4e4] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-[#111] mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  Recommended Learning Resources
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {result.recommended_courses.map((course, i) => (
                    <a
                      key={i}
                      href={course.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 p-3 bg-[#fcfcfc] border border-[#e4e4e4] rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <Layers size={14} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#111] text-sm group-hover:text-blue-700 font-semibold leading-snug">
                          {course.resource}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#8b8b8b] text-xs capitalize">{course.skill}</span>
                          {course.is_free && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-bold">
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
          </section>
        )}
      </div>
    </Layout>
  )
}
