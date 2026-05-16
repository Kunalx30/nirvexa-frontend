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

  const renderResourceLink = (r, isSidebar = false) => {
    const urlMatch = r.match(/(https?:\/\/[^\s]+)/)
    if (urlMatch) {
      const url = urlMatch[0]
      let label = r.replace(url, '').replace(/:\s*$/, '').trim()
      if (!label) label = 'View Resource'
      
      if (isSidebar) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#3a3a3a] hover:text-blue-600 font-medium text-xs flex items-center gap-1 transition-colors leading-snug break-all w-fit mt-0.5">
            {label} <ExternalLink size={10} className="shrink-0" />
          </a>
        )
      }
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2.5 py-1 bg-blue-50/80 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-colors w-fit inline-flex">
          {label} <ExternalLink size={10} />
        </a>
      )
    }
    
    if (isSidebar) {
       return <p className="text-[#3a3a3a] font-medium text-xs leading-snug">{r}</p>
    }
    return <span className="text-[11px] px-2.5 py-1 bg-[#fcfcfc] border border-[#e4e4e4] rounded-lg text-[#6b6b6b] inline-flex">{r}</span>
  }

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-blue-50/80 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-xs font-medium text-[#0a0a0a] w-fit mb-2">
            <Compass size={14} /> AI Career Architect
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight tracking-tight">Path Generator</h1>
          <p className="text-[#4a4a4a] text-base font-medium max-w-2xl mt-1">
            Enter your current skills and target role to get a step-by-step AI roadmap tailored to the Indian job market.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 mb-10 z-10 relative shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-5">

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider ml-1">Current Role (optional)</label>
              <input
                type="text"
                placeholder="e.g. Student, Junior Developer"
                value={currentRole}
                onChange={e => { setCurrentRole(e.target.value); setResult(null) }}
                className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider ml-1">Target Role *</label>
              <div className="relative group">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b] group-focus-within:text-[#0a0a0a] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="e.g. Data Analyst, ML Engineer"
                  value={targetRole}
                  onChange={e => { setTargetRole(e.target.value); setResult(null) }}
                  className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl px-4 py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider ml-1">Current Skills * (comma separated)</label>
              <div className="relative group">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b] group-focus-within:text-[#0a0a0a] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="e.g. Excel, Python, SQL"
                  value={skills}
                  onChange={e => { setSkills(e.target.value); setResult(null) }}
                  className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl px-4 py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider ml-1">Experience</label>
              <div className="flex gap-2 flex-wrap">
                {EXPERIENCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={`px-3 py-2 rounded-xl text-xs border font-medium transition-all ${
                      experience === opt.value
                        ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm'
                        : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm'
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!targetRole.trim() || !skills.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-bold tracking-tight px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none"
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
            <div className="md:col-span-2 bg-white border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <h3 className="text-xl font-serif text-[#0a0a0a] tracking-tight mb-1 flex items-center gap-3">
                <Milestone className="text-blue-600" size={22} /> Strategic Roadmap
              </h3>
              {result.estimated_total_weeks && (
               <p className="text-[#6b6b6b] font-medium text-sm mb-6 flex items-center gap-1.5">
              <Clock size={13} /> Estimated time: <span className="text-[#0a0a0a] font-bold">{result.estimated_total_weeks} weeks</span>
               </p>
              )}

              <div className="relative border-l-2 border-[#e4e4e4] ml-4 space-y-8 pb-2">
                {(result.steps || []).map((step, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-base font-bold text-[#0a0a0a] tracking-tight">
                        Step {step.step_number}: {step.skill_to_learn}
                      </h4>
                      {step.estimated_weeks && (
                        <span className="text-[11px] text-[#8b8b8b] border border-[#e4e4e4] px-2 py-0.5 bg-[#fcfcfc] rounded-lg shrink-0">
                          ~{step.estimated_weeks}w
                        </span>
                      )}
                    </div>
                    {step.why_important && (
                      <p className="text-[#4a4a4a] font-medium text-sm mb-3 leading-relaxed">{step.why_important}</p>
                    )}
                    {step.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((r, j) => (
                          <div key={j}>{renderResourceLink(r)}</div>
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
              <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5">
                <h3 className="text-[#0a0a0a] font-bold tracking-tight mb-4 flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} className="text-amber-600" /> Skill Gap
                </h3>
                {result.skill_gap?.missing?.length > 0 ? (
                  <>
                    <p className="text-[#8b8b8b] text-xs mb-3">Skills to acquire:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skill_gap.missing.map((s, i) => (
                        <span key={i} className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 shadow-sm">{s}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center font-medium gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
                    <CheckCircle2 size={15} /> You have all core skills!
                  </div>
                )}

                {result.skill_gap?.already_have?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[#8b8b8b] text-xs mb-2">Already have:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skill_gap.already_have.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resources from steps */}
              <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5">
                <h3 className="text-[#0a0a0a] font-bold tracking-tight mb-4 flex items-center gap-2 text-sm">
                  <BookOpen size={16} className="text-emerald-600" /> All Resources
                </h3>
                <ul className="space-y-2">
                  {(result.steps || [])
                    .flatMap(s => (s.resources || []).map(r => ({ resource: r, skill: s.skill_to_learn })))
                    .filter((v, i, arr) => arr.findIndex(x => x.resource === v.resource) === i)
                    .slice(0, 8)
                    .map((item, i) => (
                      <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#fcfcfc] border border-[#e4e4e4] hover:border-[#c4c4c4] hover:shadow-sm hover:-translate-y-px transition-colors">
                        <ChevronRight size={12} className="text-emerald-600 shrink-0" />
                        <div>
                          {renderResourceLink(item.resource, true)}
                          <p className="text-[#8b8b8b] font-medium text-[10px] mt-0.5">{item.skill}</p>
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