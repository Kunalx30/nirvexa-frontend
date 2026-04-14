import Layout from '../components/layout/Layout'
import { useState } from 'react'
import { ExternalLink, Bookmark, Trash2, Building2, MapPin, FolderOpen } from 'lucide-react'

export default function SavedJobs() {
  // 🔥 FIX 5: REALISTIC DATA
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Data Analyst Intern',
      company: 'Wipro',
      location: 'Remote',
      status: 'Saved',
      notes: '',
      url: '#'
    },
    {
      id: 2,
      title: 'Junior Machine Learning Engineer',
      company: 'Infosys',
      location: 'Hyderabad',
      status: 'Applied',
      notes: 'Applied on company portal. Waiting for the HackerRank assessment link.',
      url: '#'
    }
  ])

  const statuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

  // Helper to give semantic colors to active statuses
  const getActiveStatusStyles = (status) => {
    switch(status) {
      case 'Applied': return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      case 'Interview': return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      case 'Offer': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      case 'Rejected': return 'bg-rose-500/10 border-rose-500/30 text-rose-400'
      // 🔥 FIX 1: STATUS COLORS
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400' 
    }
  }

  const updateStatus = (id, newStatus) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === id ? { ...job, status: newStatus } : job
      )
    )
  }

  const updateNotes = (id, value) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === id ? { ...job, notes: value } : job
      )
    )
  }

  // 🔥 FIX 2: CONFIRM DELETE
  const removeJob = (id) => {
    if (!window.confirm('Remove this job from tracker?')) return
    setJobs(prev => prev.filter(job => job.id !== id))
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 w-fit mb-2 backdrop-blur-sm">
            <Bookmark size={14} />
            <span>Application Tracker</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Saved Jobs
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Track your applications, manage interview stages, and keep notes on your career opportunities.
          </p>
        </div>

        {/* ── JOB LIST ──────────────────────────────────────────── */}
        {jobs.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl mt-6 z-10 relative">
            <FolderOpen size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your tracker is empty</h3>
            <p className="text-gray-500 font-light max-w-sm mx-auto">
              You haven't saved any jobs yet. Browse the job board and bookmark opportunities to track them here.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 z-10 relative">
            {jobs.map(job => (
              <div
                key={job.id}
                className="group bg-[#111116]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col"
              >
                {/* TOP: Title & Actions */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
                        {job.title}
                      </h3>
                      {/* 🔥 FIX 4: STATUS BADGE DISPLAY */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getActiveStatusStyles(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5"><Building2 size={14} className="text-gray-500"/> {job.company}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-500"/> {job.location}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeJob(job.id)}
                    className="p-2 rounded-xl text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors -mr-2 -mt-2"
                    title="Remove Job"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* STATUS TOGGLES */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 ml-1">Pipeline Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <button
                        key={status}
                        onClick={() => updateStatus(job.id, status)}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 ${
                          job.status === status
                            ? getActiveStatusStyles(status)
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NOTES AREA */}
                <div className="mb-6 flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 ml-1">Private Notes</p>
                  <textarea
                    placeholder="Add interview notes, contacts, or reminders..."
                    value={job.notes}
                    onChange={(e) => updateNotes(job.id, e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/5 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none min-h-[80px]"
                  />
                  {/* 🔥 FIX 3: EMPTY NOTES UX */}
                  {!job.notes && (
                    <p className="text-xs text-gray-600 mt-1.5 ml-1 transition-opacity">
                      No notes added yet.
                    </p>
                  )}
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                    <Bookmark size={14} className="fill-gray-500" />
                    Saved to Tracker
                  </div>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    View Details
                    <ExternalLink size={14} className="text-gray-400" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}