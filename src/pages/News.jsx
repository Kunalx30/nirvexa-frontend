import Layout from '../components/layout/Layout'
import { useState, useEffect } from 'react'
import { Newspaper, ExternalLink, Clock, Globe, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const TABS = [
  { label: 'All',          value: 'all'         },
  { label: 'AI',           value: 'ai'          },
  { label: 'Data Science', value: 'data-science' },
  { label: 'Startups',     value: 'startups'    },
]

export default function News() {
  const [active, setActive]     = useState('all')
  const [news, setNews]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNews = async (showToast = false) => {
    if (showToast) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await api.get(`/news?category=${active}&limit=40`)
      const articles = res.data?.articles || res.data?.data || res.data || []
      setNews(Array.isArray(articles) ? articles : [])
      if (showToast) toast.success('News refreshed!')
    } catch (err) {
      toast.error('Failed to load news')
      setNews([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchNews() }, [active])

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      const diff = Date.now() - d.getTime()
      const h = Math.floor(diff / 3600000)
      if (h < 1) return 'Just now'
      if (h < 24) return `${h}h ago`
      const days = Math.floor(h / 24)
      return `${days}d ago`
    } catch { return '' }
  }

  return (
    <Layout>\n      <style>{`\n        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');\n        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }\n        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }\n      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-50/80 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 z-10 relative pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-xs font-medium text-[#0a0a0a] w-fit mb-2">
            <Globe size={14} /> Live Industry Feed
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight">Career & Tech News</h1>
              <p className="text-[#4a4a4a] text-base font-medium max-w-xl mt-1">
                AI-summarized articles from TechCrunch, YourStory, ET Tech, Hacker News, and more.
              </p>
            </div>
            <button
              onClick={() => fetchNews(true)}
              disabled={refreshing}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#fcfcfc] hover:bg-white border border-[#e4e4e4] rounded-xl text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#c4c4c4] text-xs shadow-sm transition-all mt-1"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8 z-10 relative">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                active === tab.value
                  ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-md'
                  : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#c4c4c4] shadow-sm'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-[#6b6b6b]">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Loading news...</span>
          </div>
        )}

        {/* News grid */}
        {!loading && news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 z-10 relative">
            {news.map((item, i) => (
              <a
                key={item.id || i}
                href={item.url || item.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c4c4c4] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 flex flex-col flex-1">
                  {/* Category badge */}
                  {item.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#6b6b6b] w-fit mb-3">
                      {item.category}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-base font-bold text-[#0a0a0a] leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h2>

                  {/* AI summary */}
                  {item.summary && (
                    <>
                      <div className="flex items-center gap-1 mb-1.5">
                        <Sparkles size={10} className="text-purple-600" />
                        <span className="text-[10px] text-purple-600 font-medium uppercase tracking-wide">AI Summary</span>
                      </div>
                      <p className="text-[#6b6b6b] text-sm font-light leading-relaxed mb-4 flex-1 line-clamp-3">
                        {item.summary}
                      </p>
                    </>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#e4e4e4]">
                    <div className="flex items-center gap-1.5 text-[#8b8b8b]">
                      <Newspaper size={12} />
                      <span className="text-xs">{item.source}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(item.published_at || item.time) && (
                        <div className="flex items-center gap-1 text-[#a3a3a3]">
                          <Clock size={11} />
                          <span className="text-xs">{item.time || formatTime(item.published_at)}</span>
                        </div>
                      )}
                      <ExternalLink size={13} className="text-[#a3a3a3] group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && news.length === 0 && (
          <div className="text-center py-20 bg-[#f9f9f9] border border-dashed border-[#c4c4c4] rounded-2xl shadow-inner">
            <Newspaper size={36} className="text-[#a3a3a3] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">No articles found</h3>
            <p className="text-[#8b8b8b] text-sm">No recent news for this category. Try refreshing.</p>
            <button
              onClick={() => fetchNews(true)}
              className="mt-4 px-4 py-2 bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl text-sm text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#c4c4c4] hover:bg-white shadow-sm transition-all"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}
