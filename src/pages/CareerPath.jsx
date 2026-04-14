import Layout from '../components/layout/Layout'
import { useState } from 'react'
import { 
  Sparkles, 
  Map, 
  AlertTriangle, 
  BookOpen, 
  Loader2, 
  Target, 
  Compass, 
  Milestone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function CareerPath() {
  const [goal, setGoal] = useState('')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const generateRoadmap = () => {
    if (!goal.trim() || !skills.trim()) return

    setLoading(true)

    // 🔥 FIX 1: DYNAMIC SKILL CALCULATION
    const userSkills = skills.toLowerCase().split(',').map(s => s.trim())
    const requiredSkills = ['SQL', 'Python', 'Power BI', 'Statistics'] // Display casing
    const missing = requiredSkills.filter(skill => !userSkills.includes(skill.toLowerCase()))
    
    // Dynamic Level Logic for Fix 4
    const level = userSkills.length > 2 && missing.length <= 2 ? 'Intermediate Level' : 'Beginner Level'

    // 🔥 FAKE AI RESPONSE
    setTimeout(() => {
      setResult({
        level: level,
        roadmap: [
          {
            stage: 'Foundation',
            steps: [
              'Learn Excel & Data Handling',
              'Understand Statistics basics'
            ]
          },
          {
            stage: 'Core Skills',
            steps: [
              'Master SQL',
              'Learn Python (Pandas, NumPy)'
            ]
          },
          {
            stage: 'Advanced',
            steps: [
              'Data Visualization (Power BI/Tableau)',
              'Build real-world projects'
            ]
          },
          {
            stage: 'Career Launch',
            steps: [
              'Create portfolio',
              'Prepare interviews',
              'Apply for jobs'
            ]
          }
        ],
        missingSkills: missing,
        resources: [
          'SQL - LeetCode + Mode Analytics',
          'Python - Kaggle + YouTube',
          'Power BI - Microsoft Learn'
        ]
      })
      setLoading(false)
    }, 2000)
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 w-fit mb-2 backdrop-blur-sm">
            <Compass size={14} />
            <span>AI Career Architect</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Path Generator
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Input your current skills and target role to generate a step-by-step, actionable roadmap tailored to your specific goals.
          </p>
        </div>

        {/* ── INPUT SECTION ─────────────────────────────────────── */}
        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 mb-10 z-10 relative shadow-2xl">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Target Role</label>
              <div className="relative group">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Data Analyst"
                  value={goal}
                  // 🔥 FIX 3: CLEAR OLD RESULT ON NEW INPUT
                  onChange={(e) => {
                    setGoal(e.target.value)
                    setResult(null)
                  }}
                  className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Current Skills (Comma Separated)</label>
              <div className="relative group">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Excel, C++"
                  value={skills}
                  // 🔥 FIX 3: CLEAR OLD RESULT ON NEW INPUT
                  onChange={(e) => {
                    setSkills(e.target.value)
                    setResult(null)
                  }}
                  className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={generateRoadmap}
              // 🔥 FIX 2: EMPTY SKILL INPUT UX
              disabled={!goal.trim() || !skills.trim() || loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Architecting Path...
                </>
              ) : (
                <>
                  <Map size={18} />
                  Generate Roadmap
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RESULTS BENTO GRID ────────────────────────────────── */}
        {result && (
          <div className="grid md:grid-cols-3 gap-6 z-10 relative animate-fade-in">

            {/* ROADMAP TIMELINE (Spans 2 columns) */}
            <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                <Milestone className="text-blue-400" size={24} />
                Strategic Roadmap
              </h3>
              
              {/* 🔥 FIX 4: ADD LEVEL INDICATOR */}
              <p className="text-gray-400 text-sm mb-8">
                Based on your current skills, you are at <span className="text-blue-400 font-medium">{result.level}</span>
              </p>

              <div className="relative border-l-2 border-white/10 ml-4 space-y-10 pb-4">
                {result.roadmap.map((stage, i) => (
                  <div key={i} className="relative pl-8">
                    {/* Glowing Node */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#111116] border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    </div>
                    
                    <h4 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                      Phase {i + 1}: {stage.stage}
                    </h4>
                    
                    <div className="space-y-3">
                      {stage.steps.map((step, j) => (
                        <div key={j} className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-xl p-4">
                          <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-500" />
                          <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIDEBAR: SKILL GAP & RESOURCES */}
            <div className="space-y-6">
              
              {/* SKILL GAP */}
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  Skill Gap Analysis
                </h3>
                {result.missingSkills.length > 0 ? (
                  <>
                    <p className="text-gray-400 text-sm font-light mb-5">
                      To achieve your goal, you need to acquire these high-priority skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-lg border border-amber-500/20 tracking-wide"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <CheckCircle2 size={16} />
                    <p className="text-sm font-medium">You have the required core skills!</p>
                  </div>
                )}
              </div>

              {/* RESOURCES */}
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl h-full">
                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-400" />
                  Curated Resources
                </h3>
                <ul className="space-y-3">
                  {result.resources.map((res, i) => {
                    const [tool, source] = res.split(' - ')
                    return (
                      <li key={i} className="group flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-colors cursor-default">
                        <span className="text-emerald-300 text-sm font-medium">{tool}</span>
                        <div className="flex items-center justify-between text-gray-400 text-xs">
                          <span>{source}</span>
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-400" />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

            </div>

          </div>
        )}

      </div>
    </Layout>
  )
}