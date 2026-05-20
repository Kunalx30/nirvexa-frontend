import Layout from '../components/layout/Layout'
import { useState } from 'react'
import {
  Building2, Loader2, Code2, Users, MessageSquare,
  Star, MapPin, Globe, ExternalLink,
  ThumbsUp, ThumbsDown, Briefcase, Monitor, Coffee,
  ChevronRight, Search, TrendingUp, Award, Clock,
  Shield, Zap, Heart, CheckCircle2, X,
  Layers, MousePointerClick, PanelRightOpen, Sparkles,
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Infosys', 'TCS', 'Wipro',
  'Flipkart', 'Zomato', 'PhonePe', 'Razorpay', 'Swiggy', 'Meesho',
]

const SENTIMENT_CONFIG = {
  positive: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Positive' },
  mixed:    { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500',   label: 'Mixed'    },
  negative: { color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',     dot: 'bg-rose-500',    label: 'Critical' },
}

const STAGE_STYLES = [
  { ring: 'border-blue-200',    dot: 'bg-blue-500',    wash: 'bg-blue-50'    },
  { ring: 'border-emerald-200', dot: 'bg-emerald-500', wash: 'bg-emerald-50' },
  { ring: 'border-amber-200',   dot: 'bg-amber-500',   wash: 'bg-amber-50'   },
  { ring: 'border-purple-200',  dot: 'bg-purple-500',  wash: 'bg-purple-50'  },
  { ring: 'border-rose-200',    dot: 'bg-rose-500',    wash: 'bg-rose-50'    },
]

const LinkedInIcon = ({ size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

/* ── helpers ── */
function normalizeText(val) {
  if (!val) return ''
  if (Array.isArray(val)) return val.join(' ')
  return String(val)
}
function normalizeResearch(data) {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) return data.map(normalizeResearch)
  const KEEP_ARRAYS = new Set(['tech_stack','interview_tips','perks','common_roles','top_departments','preferred_background','genuine_reviews'])
  const out = {}
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val) && !KEEP_ARRAYS.has(key) && val.length > 0 && typeof val[0] === 'string') {
      out[key] = normalizeText(val)
    } else if (Array.isArray(val)) {
      out[key] = val.map(item => typeof item === 'object' ? normalizeResearch(item) : item)
    } else if (typeof val === 'object' && val !== null) {
      out[key] = normalizeResearch(val)
    } else {
      out[key] = val
    }
  }
  return out
}

/* ── sub-components ── */
function Tag({ children, color = 'blue' }) {
  const palette = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    teal:   'bg-teal-50 border-teal-200 text-teal-700',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
    pink:   'bg-rose-50 border-rose-200 text-rose-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }
  return (
    <span className={`px-2.5 py-1 border text-[11px] rounded-md font-semibold ${palette[color]}`}>
      {children}
    </span>
  )
}

function StarRating({ rating }) {
  const num = parseFloat(rating) || 0
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.6l-2.6 1.3.5-2.9-2.1-2 2.9-.4z"
            fill={i < Math.round(num) ? '#f59e0b' : 'none'}
            stroke={i < Math.round(num) ? '#f59e0b' : '#d1d5db'} strokeWidth="0.8" />
        </svg>
      ))}
      <span className="text-[11px] font-bold text-[#6b6b6b] ml-1">{num.toFixed(1)}</span>
    </div>
  )
}

function ReviewCard({ review }) {
  const cfg = SENTIMENT_CONFIG[review.sentiment] || SENTIMENT_CONFIG.mixed
  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#525252] bg-white border border-[#e4e4e4] px-2 py-0.5 rounded-md">{review.source}</span>
            <span className={`text-[10px] font-bold flex items-center gap-1 ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <p className="text-[11px] text-[#8b8b8b] font-medium">{review.role}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <div className="space-y-2">
        {review.pros && (
          <div className="flex items-start gap-2">
            <ThumbsUp size={10} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#3a3a3a] leading-relaxed">{review.pros}</p>
          </div>
        )}
        {review.cons && (
          <div className="flex items-start gap-2">
            <ThumbsDown size={10} className="text-rose-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#3a3a3a] leading-relaxed">{review.cons}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MapEmbed({ mapQuery, headquarters }) {
  const encodedQuery = encodeURIComponent(mapQuery || headquarters || 'Unknown')
  return (
    <div className="rounded-xl overflow-hidden border border-[#e4e4e4] relative">
      <iframe
        title="Company Location"
        src={`https://maps.google.com/maps?q=${encodedQuery}&output=embed&z=13`}
        width="100%" height="220" style={{ border: 0 }}
        allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={`https://maps.google.com/?q=${encodedQuery}`} target="_blank" rel="noopener noreferrer"
        className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white border border-[#e4e4e4] text-blue-600 hover:border-blue-300 hover:bg-blue-50 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm">
        <MapPin size={11} /> Open in Maps
      </a>
    </div>
  )
}

function SectionCard({ icon, title, iconColor = 'text-blue-600', children }) {
  return (
    <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm h-full">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-4 flex items-center gap-2">
        <span className={iconColor}>{icon}</span>{title}
      </h3>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, iconColor, bg, border }) {
  return (
    <div className={`rounded-xl border p-4 ${bg} ${border} flex items-center gap-4`}>
      <div className={`h-10 w-10 rounded-lg bg-white border ${border} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className={`text-xl font-black leading-none ${iconColor}`}>{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mt-1">{label}</p>
      </div>
    </div>
  )
}

/* ── main page ── */
export default function CompanyResearch() {
  const [company, setCompany]     = useState('')
  const [location, setLocation]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [companyName, setCompanyName] = useState('')

  const handleResearch = async () => {
    if (!company.trim()) { toast.error('Enter a company name'); return }
    setLoading(true); setResult(null)
    try {
      const res = await api.post('/career/company-research', { company_name: company.trim(), location: location.trim() })
      setResult(normalizeResearch(res.data.research))
      setCompanyName(res.data.company_name)
      toast.success('Research complete!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Research failed. Try again.')
    } finally { setLoading(false) }
  }

  const r = result

  const statItems = r ? [
    r.glassdoor_rating    && { icon: Star,    label: 'Glassdoor',   value: r.glassdoor_rating,    iconColor: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200'   },
    r.ambitionbox_rating  && { icon: Shield,  label: 'AmbitionBox', value: `${r.ambitionbox_rating}`,  iconColor: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200'    },
    r.size                && { icon: Users,   label: 'Team Size',   value: r.size,                          iconColor: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-200'    },
    (r.founded && r.founded !== 'Unknown') && { icon: Award, label: 'Founded', value: r.founded,           iconColor: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200'  },
  ].filter(Boolean) : []

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .cr { font-family: 'DM Sans', system-ui, sans-serif; }
        .cr-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .cr-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .cr-scroll::-webkit-scrollbar-track { background: #f4f4f4; border-radius: 8px; }
        .cr-scroll::-webkit-scrollbar-thumb { background: #c9c9c9; border-radius: 8px; }
        @keyframes crFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .cr-fade { animation: crFade .28s ease both; }
        .cr-grid-bg {
          background-image: linear-gradient(rgba(228,228,228,.42) 1px,transparent 1px),linear-gradient(90deg,rgba(228,228,228,.42) 1px,transparent 1px);
          background-size: 28px 28px; background-position: -1px -1px;
        }
      `}</style>

      <div className="cr max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative cr-grid-bg">

        {/* ── Header ── */}
        <section className="relative z-10 pt-6 pb-5">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#e4e4e4] px-3 py-1.5 text-xs font-semibold text-[#111] shadow-sm mb-4">
            <Building2 size={13} className="text-blue-600" /> Company Intelligence
          </div>
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-end">
            <div>
              <h1 className="cr-serif text-4xl sm:text-5xl text-[#0a0a0a] leading-tight">
                Research any company.<br />Know before you apply.
              </h1>
              <p className="mt-3 text-[#525252] text-sm sm:text-base max-w-xl">
                Culture, tech stack, hiring profile, real employee reviews and office location — all in one view.
              </p>
            </div>
            {/* Search card */}
            <div className="bg-white border border-[#e4e4e4] rounded-xl p-4 shadow-sm">
              <div className="space-y-2.5 mb-3">
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b8b]" />
                  <input type="text" placeholder="Company name — e.g. Google, Razorpay"
                    value={company}
                    onChange={e => { setCompany(e.target.value); setResult(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleResearch()}
                    className="w-full rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] py-3 pl-10 pr-9 text-sm text-[#111] placeholder-[#a3a3a3] outline-none transition focus:border-[#0a0a0a] focus:bg-white" />
                  {company && (
                    <button onClick={() => { setCompany(''); setResult(null) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8b8b] hover:text-[#111]">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b8b]" />
                  <input type="text" placeholder="Location (optional) — e.g. Bangalore"
                    value={location} onChange={e => setLocation(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleResearch()}
                    className="w-full rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] py-3 pl-10 pr-4 text-sm text-[#111] placeholder-[#a3a3a3] outline-none transition focus:border-[#0a0a0a] focus:bg-white" />
                </div>
              </div>
              <button onClick={handleResearch} disabled={!company.trim() || loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a0a0a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222] disabled:bg-[#d4d4d4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Researching {company}…</>
                  : <><Search size={15} /> Research Company</>}
              </button>
            </div>
          </div>
        </section>

        {/* ── Quick-pick ── */}
        <section className="relative z-10 mb-6">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#6b6b6b]">
            <Layers size={13} /> Quick pick
          </div>
          <div className="cr-scroll flex gap-2 overflow-x-auto pb-2">
            {POPULAR_COMPANIES.map(c => (
              <button key={c} onClick={() => { setCompany(c); setResult(null) }}
                className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition hover:-translate-y-px ${
                  company === c ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-md' : 'border-[#e4e4e4] bg-white text-[#3a3a3a] hover:border-[#a3a3a3]'
                }`}>{c}</button>
            ))}
          </div>
        </section>

        {/* ── Loading ── */}
        {loading && (
          <div className="relative z-10 rounded-xl border border-[#e4e4e4] bg-white p-16 text-center shadow-sm">
            <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-[#525252]">Researching {company}…</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !r && (
          <div className="relative z-10 grid lg:grid-cols-[1fr_300px] gap-5">
            <div className="rounded-xl border border-[#e4e4e4] bg-white p-8 shadow-sm">
              <div className="h-14 w-14 rounded-xl border border-blue-200 bg-blue-50 flex items-center justify-center mb-5">
                <MousePointerClick size={25} className="text-blue-600" />
              </div>
              <h2 className="cr-serif text-2xl text-[#111]">Pick or search a company</h2>
              <p className="mt-2 text-sm text-[#6b6b6b] max-w-xl">
                The research panel will appear here — company overview, ratings, tech stack, hiring profile, reviews, and office location map.
              </p>
            </div>
            <div className="rounded-xl border border-[#e4e4e4] bg-[#fcfcfc] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-3">What you'll get</p>
              {['Company overview & ratings','Tech stack & culture','Work environment & perks','Who they hire','Employee reviews','Interview tips','Office location map'].map(item => (
                <div key={item} className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#3a3a3a]">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════ RESULTS ══════════════════════════ */}
        {r && !loading && (
          <div className="relative z-10 cr-fade space-y-5">

            {/* ── 1. Full-width company overview ── */}
            <div className="rounded-xl border border-[#e4e4e4] bg-white shadow-sm overflow-hidden">
              {/* top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-teal-400 to-purple-500" />
              <div className="p-6 sm:p-8">
                {/* name + location */}
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Company overview</p>
                <h2 className="cr-serif text-3xl sm:text-4xl text-[#0a0a0a] leading-tight">{companyName}</h2>
                {r.headquarters && (
                  <div className="flex items-center gap-1.5 text-[#6b6b6b] text-xs font-semibold mt-2">
                    <MapPin size={12} className="text-blue-600" /> {r.headquarters}
                  </div>
                )}
                {/* summary */}
                {r.summary && (
                  <p className="mt-4 text-sm sm:text-base text-[#444] leading-relaxed max-w-4xl">{r.summary}</p>
                )}
                {/* external links */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {r.website && (
                    <a href={r.website} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525252] hover:text-[#111] bg-white border border-[#e4e4e4] hover:border-[#a3a3a3] px-3 py-2 rounded-lg transition-all">
                      <Globe size={12} /> Website <ExternalLink size={10} />
                    </a>
                  )}
                  {r.linkedin_url && (
                    <a href={r.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525252] hover:text-blue-700 bg-white hover:bg-blue-50 border border-[#e4e4e4] hover:border-blue-200 px-3 py-2 rounded-lg transition-all">
                      <LinkedInIcon size={12} /> LinkedIn <ExternalLink size={10} />
                    </a>
                  )}
                  {r.glassdoor_url && (
                    <a href={r.glassdoor_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525252] hover:text-amber-700 bg-white hover:bg-amber-50 border border-[#e4e4e4] hover:border-amber-200 px-3 py-2 rounded-lg transition-all">
                      <Star size={12} /> Glassdoor <ExternalLink size={10} />
                    </a>
                  )}
                  {r.ambitionbox_url && (
                    <a href={r.ambitionbox_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525252] hover:text-teal-700 bg-white hover:bg-teal-50 border border-[#e4e4e4] hover:border-teal-200 px-3 py-2 rounded-lg transition-all">
                      <Shield size={12} /> AmbitionBox <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              {/* ── 2. Stats row — full width, below overview ── */}
              {statItems.length > 0 && (
                <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(statItems.length, 4)} gap-0 border-t border-[#e4e4e4]`}>
                  {statItems.map((item, i) => (
                    <div key={i} className={`p-5 ${i < statItems.length - 1 ? 'border-r border-[#e4e4e4]' : ''} flex items-center gap-4`}>
                      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${item.bg} ${item.border}`}>
                        <item.icon size={18} className={item.iconColor} />
                      </div>
                      <div>
                        <p className={`text-2xl font-black leading-none ${item.iconColor}`}>{item.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mt-1">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 3. Main 3-col grid ── */}
            <div className="grid xl:grid-cols-[280px_1fr_300px] gap-5 items-start">

              {/* LEFT SIDEBAR */}
              <aside className="space-y-5 xl:sticky xl:top-20">

                {/* Quick facts */}
                <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-4">Quick facts</p>
                  <div className="space-y-4">
                    {[
                      { icon: <Award size={14} />,   color: 'text-purple-600', label: 'Founded',   value: r.founded !== 'Unknown' ? r.founded : null },
                      { icon: <Users size={14} />,   color: 'text-teal-600',   label: 'Size',      value: r.size },
                      { icon: <MapPin size={14} />,  color: 'text-blue-600',   label: 'HQ',        value: r.headquarters },
                      { icon: <Monitor size={14} />, color: 'text-indigo-600', label: 'Work mode', value: r.work_environment?.remote_policy },
                      { icon: <Clock size={14} />,   color: 'text-amber-600',  label: 'Hours',     value: r.work_environment?.work_hours },
                      { icon: <Coffee size={14} />,  color: 'text-rose-500',   label: 'Dress code',value: r.work_environment?.dress_code },
                    ].filter(row => row.value).map((row, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`mt-0.5 shrink-0 ${row.color}`}>{row.icon}</span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] leading-none mb-0.5">{row.label}</p>
                          <p className="text-sm font-semibold text-[#3a3a3a] leading-snug">{row.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Perks */}
                {r.work_environment?.perks?.length > 0 && (
                  <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-3 flex items-center gap-1.5">
                      <Heart size={11} className="text-rose-500" /> Perks & Benefits
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.work_environment.perks.map((p, i) => <Tag key={i} color="green">{p}</Tag>)}
                    </div>
                  </div>
                )}

                {/* Hiring stages */}
                {r.hiring_process && (
                  <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-3">Hiring stages</p>
                    <div className="space-y-2">
                      {r.hiring_process.split(/\d+[.)]\s*|•\s*|\n/).filter(s => s.trim().length > 4).slice(0, 6).map((step, i) => {
                        const style = STAGE_STYLES[i % STAGE_STYLES.length]
                        return (
                          <div key={i} className={`rounded-lg border p-3 flex items-start gap-2.5 ${style.ring} ${style.wash}`}>
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${style.dot} text-white shrink-0 mt-0.5`}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-xs font-semibold text-[#3a3a3a] leading-relaxed">{step.trim()}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </aside>

              {/* MAIN COLUMN */}
              <main className="space-y-5 min-w-0">

                {/* Map */}
                {(r.map_query || r.headquarters) && (
                  <SectionCard icon={<MapPin size={14} />} title="Office Location" iconColor="text-blue-600">
                    {r.headquarters && (
                      <p className="text-xs font-semibold text-[#6b6b6b] mb-3 flex items-center gap-1.5">
                        <MapPin size={10} className="text-blue-600" /> {r.headquarters}
                      </p>
                    )}
                    <MapEmbed mapQuery={r.map_query} headquarters={r.headquarters} />
                  </SectionCard>
                )}

                {/* Tech + Culture */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {r.tech_stack?.length > 0 && (
                    <SectionCard icon={<Code2 size={14} />} title="Tech Stack" iconColor="text-purple-600">
                      <div className="flex flex-wrap gap-1.5">
                        {r.tech_stack.map((t, i) => <Tag key={i} color="purple">{t}</Tag>)}
                      </div>
                    </SectionCard>
                  )}
                  {r.culture_notes && (
                    <SectionCard icon={<Users size={14} />} title="Culture" iconColor="text-teal-600">
                      <p className="text-sm text-[#3a3a3a] leading-relaxed">{r.culture_notes}</p>
                    </SectionCard>
                  )}
                </div>

                {/* Who they hire */}
                {r.hiring_roles && Object.keys(r.hiring_roles).length > 0 && (
                  <SectionCard icon={<Briefcase size={14} />} title="Who They Hire" iconColor="text-amber-600">
                    <div className="space-y-4">
                      {r.hiring_roles.typical_profile && (
                        <p className="text-sm text-[#3a3a3a] leading-relaxed">{r.hiring_roles.typical_profile}</p>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        {r.hiring_roles.common_roles?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Common roles</p>
                            <div className="flex flex-wrap gap-1.5">
                              {r.hiring_roles.common_roles.map((r2, i) => <Tag key={i} color="blue">{r2}</Tag>)}
                            </div>
                          </div>
                        )}
                        {r.hiring_roles.top_departments?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Top departments</p>
                            <div className="flex flex-wrap gap-1.5">
                              {r.hiring_roles.top_departments.map((d, i) => <Tag key={i} color="teal">{d}</Tag>)}
                            </div>
                          </div>
                        )}
                      </div>
                      {r.hiring_roles.seniority_mix && (
                        <div className="flex items-start gap-3">
                          <TrendingUp size={14} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-0.5">Seniority mix</p>
                            <p className="text-sm text-[#3a3a3a] font-semibold">{r.hiring_roles.seniority_mix}</p>
                          </div>
                        </div>
                      )}
                      {r.hiring_roles.preferred_background?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Preferred background</p>
                          <div className="flex flex-wrap gap-1.5">
                            {r.hiring_roles.preferred_background.map((b, i) => <Tag key={i} color="pink">{b}</Tag>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}

              </main>

              {/* RIGHT SIDEBAR */}
              <aside className="space-y-5 xl:sticky xl:top-20">

                {/* Interview prep panel */}
                <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
                    <PanelRightOpen size={14} /> Interview prep
                  </div>
                  {r.interview_tips?.length > 0 && (
                    <ul className="space-y-2">
                      {r.interview_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] px-3 py-2.5">
                          <CheckCircle2 size={13} className="text-amber-600 mt-0.5 shrink-0" />
                          <span className="text-xs font-semibold text-[#3a3a3a] leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Open roles */}
                {r.hiring_roles?.common_roles?.length > 0 && (
                  <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-3">Open for roles</p>
                    <div className="space-y-1.5">
                      {r.hiring_roles.common_roles.slice(0, 7).map((role, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] px-3 py-2.5 text-xs font-semibold text-[#3a3a3a]">
                          <ChevronRight size={12} className="text-blue-600 shrink-0" />{role}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Office vibe */}
                {r.work_environment?.office_vibe && (
                  <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-2 flex items-center gap-1.5">
                      <Zap size={11} className="text-teal-600" /> Office Vibe
                    </p>
                    <p className="text-sm font-semibold text-[#3a3a3a] leading-relaxed">{r.work_environment.office_vibe}</p>
                  </div>
                )}

                {/* Research tip */}
                <div className="rounded-xl border border-[#e4e4e4] bg-[#fcfcfc] p-4">
                  <p className="text-xs font-bold text-[#111] flex items-center gap-2">
                    <Sparkles size={13} className="text-amber-600" /> Research tip
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6b6b6b]">
                    Cross-check ratings on Glassdoor and AmbitionBox. Consistent scores across platforms signal reliable sentiment.
                  </p>
                </div>
              </aside>
            </div>

            {/* ── 4. Employee Reviews — full width, horizontal cards ── */}
            {r.genuine_reviews?.length > 0 && (
              <div className="rounded-xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] flex items-center gap-2">
                    <MessageSquare size={14} className="text-rose-500" /> Employee Reviews
                  </h3>
                  <span className="text-[10px] text-[#8b8b8b] font-medium">AI-synthesised · Glassdoor, AmbitionBox &amp; Blind</span>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {r.genuine_reviews.map((review, i) => {
                    const cfg = SENTIMENT_CONFIG[review.sentiment] || SENTIMENT_CONFIG.mixed
                    const num = parseFloat(review.rating) || 0
                    return (
                      <div key={i} className={`rounded-xl border p-4 flex flex-col gap-3 ${cfg.bg} ${cfg.border}`}>
                        {/* header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-[#525252] bg-white border border-[#e4e4e4] px-2 py-0.5 rounded-md">{review.source}</span>
                              <span className={`text-[10px] font-bold flex items-center gap-1 ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8b8b8b] font-medium">{review.role}</p>
                          </div>
                          {/* star rating */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <svg key={si} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.6l-2.6 1.3.5-2.9-2.1-2 2.9-.4z"
                                  fill={si < Math.round(num) ? '#f59e0b' : 'none'}
                                  stroke={si < Math.round(num) ? '#f59e0b' : '#d1d5db'} strokeWidth="0.8" />
                              </svg>
                            ))}
                            <span className="text-[11px] font-bold text-[#6b6b6b] ml-1">{num.toFixed(1)}</span>
                          </div>
                        </div>
                        {/* pros + cons side by side */}
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          {review.pros && (
                            <div className="bg-white/70 rounded-lg p-2.5 border border-emerald-100">
                              <div className="flex items-center gap-1 mb-1.5">
                                <ThumbsUp size={10} className="text-emerald-600 shrink-0" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Pros</span>
                              </div>
                              <p className="text-[11px] text-[#3a3a3a] leading-relaxed">{review.pros}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div className="bg-white/70 rounded-lg p-2.5 border border-rose-100">
                              <div className="flex items-center gap-1 mb-1.5">
                                <ThumbsDown size={10} className="text-rose-500 shrink-0" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600">Cons</span>
                              </div>
                              <p className="text-[11px] text-[#3a3a3a] leading-relaxed">{review.cons}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── 5. Tech strip — full width bottom ── */}
            {r.tech_stack?.length > 0 && (
              <div className="rounded-xl border border-[#e4e4e4] bg-[#fcfcfc] p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b]">Technologies at {companyName}</p>
                <div className="cr-scroll flex flex-wrap gap-2 pb-1">
                  {r.tech_stack.map((tech, i) => (
                    <span key={i} className="shrink-0 rounded-lg border border-[#e4e4e4] bg-white px-3.5 py-2 text-xs font-semibold text-[#525252] hover:border-[#a3a3a3] hover:text-[#111] transition cursor-default">
                      {tech}
                    </span>
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