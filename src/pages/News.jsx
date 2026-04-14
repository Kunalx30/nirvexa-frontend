import Layout from '../components/layout/Layout'
import { useState } from 'react'
import { Newspaper, ExternalLink, Clock, Globe } from 'lucide-react'

const TABS = ['All', 'AI', 'Data Science', 'Startups', 'Govt Jobs']

const NEWS = [
  {
    title: 'AI is transforming hiring in India',
    summary: 'AI tools are now screening resumes and conducting first-round interviews across top tech companies, forcing candidates to adapt their application strategies.',
    source: 'TechCrunch',
    time: '2 hours ago',
    category: 'AI',
    link: '#'
  },
  {
    title: 'Top skills for Data Analysts in 2026',
    summary: 'SQL, Python, Power BI, and statistical modeling remain the most in-demand skills. However, GenAI prompting is rapidly becoming a mandatory requirement.',
    source: 'Analytics India',
    time: '5 hours ago',
    category: 'Data Science',
    link: '#'
  },
  {
    title: 'Indian startups raise $2B funding',
    summary: 'The startup ecosystem shows strong recovery with increased investor confidence, specifically in AI-driven SaaS and climate tech sectors.',
    source: 'YourStory',
    time: '1 day ago',
    category: 'Startups',
    link: '#'
  },
  {
    title: 'Government releases new IT job openings',
    summary: 'Thousands of vacancies announced across PSUs and government tech departments, focusing on cybersecurity and digital infrastructure.',
    source: 'Economic Times',
    time: '6 hours ago',
    category: 'Govt Jobs',
    link: '#'
  },
  {
    title: 'AI tools replacing traditional hiring methods',
    summary: 'Recruiters are shifting towards AI-driven screening and automated behavioral interviews, drastically reducing the time-to-hire metrics.',
    source: 'Business Insider',
    time: '3 hours ago',
    category: 'AI',
    link: '#'
  },
  {
    title: 'Data Science demand continues to grow',
    summary: 'Companies are actively hiring data analysts and ML engineers across non-traditional industries like agriculture, logistics, and retail.',
    source: 'Forbes',
    time: '8 hours ago',
    category: 'Data Science',
    link: '#'
  },
]

export default function News() {
  const [active, setActive] = useState('All')

  const filtered =
    active === 'All'
      ? NEWS
      : NEWS.filter(n => n.category === active)

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">
        
        {/* Ambient Background Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 w-fit mb-2 backdrop-blur-sm">
            <Globe size={14} />
            <span>Live Industry Feed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Career & Tech News
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Curated intelligence from top publications. Stay ahead of hiring trends, AI advancements, and market shifts.
          </p>
        </div>

        {/* ── FILTER TABS ───────────────────────────────────────── */}
        <div className="flex gap-2.5 flex-wrap mb-8 z-10 relative">
          {TABS.map(tab => {
  const count =
    tab === 'All'
      ? NEWS.length
      : NEWS.filter(n => n.category === tab).length

  return (
    <button
      key={tab}
      onClick={() => setActive(tab)}
      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
        active === tab
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg shadow-purple-500/20'
          : 'bg-[#111116]/80 backdrop-blur-md border-white/10 text-gray-400 hover:text-white hover:border-white/20'
      }`}
    >
      {tab} ({count})
    </button>
  )
})}
        </div>

        {/* ── NEWS GRID ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 relative">
          {filtered.map((item, i) => (
            <a
              href={item.link}
              target="_blank"
                rel="noopener noreferrer"
              key={i}
              className="group flex flex-col bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-2xl hover:shadow-blue-500/10 h-full relative overflow-hidden"
            >
              {/* Subtle hover gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex-1 flex flex-col">
                {/* Category Badge */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">
                    {item.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                  {item.title}
                </h2>

                {/* Summary */}
                <p className="text-gray-400 text-sm font-light leading-relaxed mb-6 flex-1">
                  {item.summary}
                </p>

                <p className="text-[10px] font-semibold tracking-wide text-blue-400 uppercase -mt-4 mb-4">
  AI SUMMARY
</p>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Newspaper size={14} className="text-gray-600" />
                    <span className="text-xs font-medium">{item.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={14} className="text-gray-600" />
                    <span className="text-xs">{item.time}</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Action Icon on Hover */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-white/50">
                <ExternalLink size={18} />
              </div>
            </a>
          ))}
        </div>

        {/* ── EMPTY STATE ───────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="text-center py-20 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl mt-6">
            <Newspaper size={40} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-gray-500 font-light">
              We couldn't find any recent news for the '{active}' category. Please check back later.
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}