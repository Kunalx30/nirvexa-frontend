import Layout from '../components/layout/Layout'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Bookmark, Briefcase, DollarSign, Clock, Globe } from 'lucide-react'
// 🔥 DUMMY DATA (REALISTIC)
const JOBS = [
  {
    id: 1,
    title: 'Data Analyst',
    company: 'TCS',
    location: 'Bangalore',
    salary: '₹5–8 LPA',
    type: 'Full-time',
    experience: '0-2 years',
    source: 'LinkedIn',
    skills: ['SQL', 'Excel', 'Python'],
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'Infosys',
    location: 'Hyderabad',
    salary: '₹6–10 LPA',
    type: 'Full-time',
    experience: '1-3 years',
    source: 'Naukri',
    skills: ['React', 'JavaScript', 'CSS'],
  },
  {
    id: 3,
    title: 'Machine Learning Engineer',
    company: 'Wipro',
    location: 'Pune',
    salary: '₹8–15 LPA',
    type: 'Full-time',
    experience: '2-5 years',
    source: 'LinkedIn',
    skills: ['Python', 'ML', 'TensorFlow'],
  },
  {
    id: 4,
    title: 'Backend Developer',
    company: 'HCL',
    location: 'Chennai',
    salary: '₹6–12 LPA',
    type: 'Full-time',
    experience: '1-4 years',
    source: 'Wellfound',
    skills: ['Node.js', 'MongoDB'],
  },
]

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const [saved, setSaved] = useState([])

  // Filters
  const [filterLocation, setFilterLocation] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [filterType, setFilterType] = useState('All Types')
  const [filterExp, setFilterExp] = useState('All Levels')
  const [filterSource, setFilterSource] = useState('All')

  // 🔥 FILTER LOGIC (CORE)
  const filteredJobs = JOBS.filter(job => {
    const search = searchQuery.toLowerCase()

    const matchesSearch =
      job.title.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search) ||
      job.skills.some(skill => skill.toLowerCase().includes(search))

    const matchesLocation =
      !filterLocation ||
      job.location.toLowerCase().includes(filterLocation.toLowerCase())

    const matchesSkill =
      !filterSkill ||
      job.skills.some(skill =>
        skill.toLowerCase().includes(filterSkill.toLowerCase())
      )

    const matchesType =
      filterType === 'All Types' || job.type === filterType

    const matchesExp =
      filterExp === 'All Levels' || job.experience === filterExp

    const matchesSource =
      filterSource === 'All' || job.source === filterSource

    return (
      matchesSearch &&
      matchesLocation &&
      matchesSkill &&
      matchesType &&
      matchesExp &&
      matchesSource
    )
  })

  const toggleSave = (id) => {
    setSaved(prev =>
      prev.includes(id)
        ? prev.filter(j => j !== id)
        : [...prev, id]
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-8 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 w-fit mb-2 backdrop-blur-sm">
            <Briefcase size={14} />
            <span>AI Job Aggregator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Discover Opportunities
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Showing <span className="text-white font-medium">{filteredJobs.length}</span> open roles matching your criteria.
          </p>
        </div>

        {/* ── SEARCH & FILTERS TOOLBAR ──────────────────────────── */}
        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 mb-10 z-10 relative shadow-2xl">
          
          {/* Main Search */}
          <div className="relative mb-4 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by job title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              placeholder="Location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
            />
            <input
              placeholder="Skill (e.g. React)"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
            />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option className="bg-[#111116]">All</option>
              <option className="bg-[#111116]">LinkedIn</option>
              <option className="bg-[#111116]">Naukri</option>
              <option className="bg-[#111116]">Wellfound</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option className="bg-[#111116]">All Types</option>
              <option className="bg-[#111116]">Full-time</option>
              <option className="bg-[#111116]">Internship</option>
            </select>
            <select
              value={filterExp}
              onChange={(e) => setFilterExp(e.target.value)}
              className="col-span-2 lg:col-span-1 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option className="bg-[#111116]">All Levels</option>
              <option className="bg-[#111116]">0-2 years</option>
              <option className="bg-[#111116]">1-3 years</option>
              <option className="bg-[#111116]">2-5 years</option>
            </select>
          </div>
        </div>

        {/* ── JOB GRID ──────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 z-10 relative">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="group bg-[#111116]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col relative overflow-hidden"
            >
              {/* Subtle hover gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex-1 flex flex-col">
                {/* Header: Title & Save */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mt-1 flex items-center gap-1.5">
                      {job.company}
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className="flex items-center gap-1"><Globe size={12}/> {job.source}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleSave(job.id)}
                    className="p-2 -mr-2 -mt-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <Bookmark
                      size={20}
                      className={`transition-colors ${
                        saved.includes(job.id)
                          ? 'text-blue-400 fill-blue-400'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    />
                  </button>
                </div>

                {/* Meta Info Pills */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-gray-300">
                    <MapPin size={12} className="text-gray-500" /> {job.location}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">
                    <DollarSign size={12} /> {job.salary}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-gray-300">
                    <Clock size={12} className="text-gray-500" /> {job.experience}
                  </div>
                  <div className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/10 text-indigo-400">
  {job.type}
</div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6 flex-1">
                  {job.skills.map(skill => (
                    <span
                      key={skill}
                      className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button
  onClick={() => navigate(`/jobs/${job.id}`)}
  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold py-3 rounded-xl transition-all group-hover:border-blue-500/30"
>
  View Full Details
</button>
              </div>
            </div>
          ))}
        </div>

        {/* ── EMPTY STATE ───────────────────────────────────────── */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-20 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl mt-6 z-10 relative">
            <Search size={40} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-gray-500 font-light">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}