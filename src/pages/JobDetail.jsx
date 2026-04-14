import Layout from '../components/layout/Layout'
import { useParams, Link } from 'react-router-dom'
import { Bookmark, MapPin, DollarSign, Clock, ExternalLink, ArrowLeft, Sparkles, Building2, Briefcase } from 'lucide-react'
import { useState } from 'react'

// 🔥 SAME DATA (SYNC WITH JOBS PAGE)
const JOBS = [
  {
    id: 1,
    title: 'Data Analyst',
    company: 'TCS',
    location: 'Bangalore',
    salary: '₹5–8 LPA',
    experience: '0-2 years',
    type: 'Full-time',
    skills: ['SQL', 'Excel', 'Python'],
    description:
      'We are looking for a Data Analyst to analyze business data, build dashboards, and generate insights for decision making. You will work closely with the product team to understand data needs and build robust data pipelines. Strong proficiency in SQL and basic understanding of Python is required.',
    summary:
      'This is an entry-level to mid-level role ideal for candidates looking to solidify their analytics foundation. The emphasis on SQL and Python suggests a strong data querying and scripting component.',
    applyLink: 'https://www.linkedin.com/jobs',
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'Infosys',
    location: 'Hyderabad',
    salary: '₹6–10 LPA',
    experience: '1-3 years',
    type: 'Full-time',
    skills: ['React', 'JavaScript', 'CSS'],
    description:
      'Build modern web applications using React. Collaborate with design teams and optimize UI performance. You will be responsible for translating UI/UX design wireframes to actual code that will produce visual elements of the application.',
    summary:
      'Standard frontend role heavily focused on React ecosystem. Good fit if you have prior experience with modern state management and component-driven architecture.',
    applyLink: 'https://www.linkedin.com/jobs',
  },
]

export default function JobDetail() {
  const { id } = useParams()
  const [saved, setSaved] = useState(() => {
  return localStorage.getItem(`job_${id}`) === 'true'
})

  const job = JOBS.find(j => j.id === Number(id))

  const toggleSave = () => {
  const newValue = !saved
  setSaved(newValue)
  localStorage.setItem(`job_${id}`, newValue)
}

  if (!job) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Briefcase size={48} className="text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Listing Unavailable</h2>
          <p className="text-gray-500 font-light mb-6">This job may have expired or been removed.</p>
          <Link to="/jobs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Job Board
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">
        
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── BACK NAVIGATION ── */}
        <div className="mb-6 z-10 relative pt-4">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 z-10 relative">

          {/* ── MAIN CONTENT (LEFT COLUMN) ──────────────────────────────── */}
          <div className="md:col-span-2 space-y-8">

            {/* HEADER CARD */}
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-gray-400 font-medium">
                    <Building2 size={18} className="text-gray-500" /> {job.company}
                  </div>
                </div>

                {/* Mobile Actions Header */}
                <button 
                  onClick={() => setSaved(!saved)}
                  className="sm:hidden p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center w-full"
                >
                  <Bookmark size={20} className={saved ? 'text-blue-400 fill-blue-400' : 'text-gray-400'} />
                </button>
              </div>

              {/* META INFO PILLS */}
              <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-white/5">
                <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                  <MapPin size={16} className="text-gray-500" /> {job.location}
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">
                  <DollarSign size={16} /> {job.salary}
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                  <Clock size={16} className="text-gray-500" /> {job.experience}
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/10 text-indigo-400">
  {job.type}
</div>
              </div>

              {/* DESKTOP ACTIONS */}
              <div className="hidden sm:flex gap-4">
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25"
                >
                  Apply Externally <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-medium transition-all border ${
                    saved 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Bookmark size={18} className={saved ? 'fill-blue-400' : ''} />
                  {saved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>

            {/* AI ANALYSIS CARD */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Sparkles size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-blue-400" />
                  <h3 className="text-blue-400 font-semibold tracking-wide uppercase text-sm">AI Career Match Analysis</h3>
                </div>
                <p className="text-gray-200 text-base sm:text-lg font-light leading-relaxed">
                  {job.summary}
                </p>
              </div>
            </div>

            {/* DESCRIPTION & SKILLS CARD */}
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8">
              
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4">Required Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span
                      key={skill}
                      className="text-sm font-medium px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Role Description</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-400 text-base font-light leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ── SIDEBAR (RIGHT COLUMN) ──────────────────────────────────── */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white px-2">
              Similar Opportunities
            </h3>

            <div className="flex flex-col gap-4">
              {JOBS.filter(j => j.id !== job.id).map(sim => (
                <Link
                  to={`/jobs/${sim.id}`}
                  key={sim.id}
                  className="group bg-[#111116]/60 backdrop-blur-sm border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 block"
                >
                  <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors mb-1">
                    {sim.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="font-medium text-gray-300">{sim.company}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>{sim.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {sim.skills.slice(0, 2).map(skill => (
                      <span key={skill} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">
                        {skill}
                      </span>
                    ))}
                    {sim.skills.length > 2 && (
                       <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 text-gray-500">
                         +{sim.skills.length - 2}
                       </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Mobile Apply Button (Sticky Bottom) */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/10 z-50">
               <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-4 rounded-xl shadow-lg shadow-blue-500/25"
                >
                  Apply Externally <ExternalLink size={16} />
                </a>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  )
}