import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Download, ExternalLink, Link as LinkIcon, Loader2,
  MapPin, Share2, ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchPublicProfile } from '../services/api'

const GRADIENTS = {
  aurora: ['#2563eb', '#a855f7'],
  indigo: ['#4f46e5', '#06b6d4'],
  emerald: ['#059669', '#10b981'],
  sunset: ['#ea580c', '#e11d48'],
  steel: ['#374151', '#1f2937'],
  rose: ['#db2777', '#fda4af'],
  cosmic: ['#7c3aed', '#c084fc'],
  gold: ['#d97706', '#f59e0b'],
}

function initials(name) {
  return (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U'
}

function gradientStyle(value) {
  if (value?.startsWith('linear-gradient')) return { background: value }
  const pair = GRADIENTS[value] || GRADIENTS.aurora
  return { background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})` }
}

function Chip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-[#fafafa] border-[#e4e4e4] text-[#4b5563]',
    green: 'bg-green-50 border-green-200 text-green-700 font-semibold',
    red: 'bg-red-50 border-red-200 text-red-700 font-semibold',
    dark: 'bg-indigo-50 border-indigo-100 text-indigo-700 font-semibold',
  }
  return <span className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

function Card({ title, children, className = '' }) {
  return (
    <section className={`bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.015)] ${className}`}>
      {title && <h2 className="mb-5 text-xl font-serif text-[#0a0a0a] tracking-tight">{title}</h2>}
      {children}
    </section>
  )
}

function RadarScoreChart({ data }) {
  const center = 150
  const radius = 94
  const levels = [0.25, 0.5, 0.75, 1]
  const pointsFor = (scale = 1) => data.map((item, index) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2
    const valueScale = scale === 1 ? Math.max(0, Math.min(100, item.score)) / 100 : scale
    return [
      center + Math.cos(angle) * radius * valueScale,
      center + Math.sin(angle) * radius * valueScale,
    ]
  })
  const polygon = pointsFor().map(point => point.join(',')).join(' ')

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      {levels.map(level => (
        <polygon
          key={level}
          points={pointsFor(level).map(point => point.join(',')).join(' ')}
          fill="none"
          stroke="#e4e4e4"
          strokeWidth="1"
        />
      ))}
      {data.map((item, index) => {
        const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2
        const axisEnd = [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius]
        const label = [center + Math.cos(angle) * (radius + 24), center + Math.sin(angle) * (radius + 24)]
        return (
          <g key={item.metric}>
            <line x1={center} y1={center} x2={axisEnd[0]} y2={axisEnd[1]} stroke="#e4e4e4" />
            <text x={label[0]} y={label[1]} textAnchor="middle" dominantBaseline="middle" fill="#6b6b6b" fontSize="11" fontWeight="600" fontFamily="sans-serif">
              {item.metric}
            </text>
          </g>
        )
      })}
      <polygon points={polygon} fill="#4f46e5" fillOpacity="0.15" stroke="#4f46e5" strokeWidth="2" />
      {pointsFor().map(([x, y], index) => (
        <circle key={data[index].metric} cx={x} cy={y} r="3" fill="#4f46e5" />
      ))}
    </svg>
  )
}

export default function PublicProfile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    fetchPublicProfile(username)
      .then(res => setProfile(res.data))
      .catch(err => {
        if ([403, 404].includes(err.response?.status)) setNotFound(true)
        else toast.error('Could not load public profile')
      })
      .finally(() => setLoading(false))
  }, [username])

  const radarData = useMemo(() => {
    const scores = profile?.interview_scores
    if (!scores) return []
    return [
      { metric: 'Content', score: scores.content || 0 },
      { metric: 'Clarity', score: scores.clarity || 0 },
      { metric: 'Depth', score: scores.depth || 0 },
      { metric: 'Relevance', score: scores.relevance || 0 },
      { metric: 'Confidence', score: scores.confidence || 0 },
      { metric: 'Structure', score: scores.structure || 0 },
    ]
  }, [profile])

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center text-[#0a0a0a]">
        <div className="flex items-center gap-3 text-[#6b6b6b] text-sm">
          <Loader2 className="animate-spin text-indigo-600" size={18} />
          Loading profile
        </div>
      </main>
    )
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 text-[#0a0a0a]">
        <Card className="max-w-md text-center">
          <h1 className="text-2xl font-serif text-[#0a0a0a]">Profile not found</h1>
          <p className="mt-2 text-sm text-[#6b6b6b] font-light">This public profile is unavailable or has been made private by the candidate.</p>
        </Card>
      </main>
    )
  }

  const socialLinks = [
    profile.linkedin_url && { label: 'LinkedIn', href: profile.linkedin_url, icon: LinkIcon },
    profile.github_url && { label: 'GitHub', href: profile.github_url, icon: LinkIcon },
    profile.portfolio_url && { label: 'Portfolio', href: profile.portfolio_url, icon: ExternalLink },
  ].filter(Boolean)

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-8 sm:px-6 lg:px-8 text-[#0a0a0a] font-sans selection:bg-indigo-500/20 relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 rg-grid-bg opacity-30 pointer-events-none z-0" />

      <div className="mx-auto max-w-5xl z-10 relative">
        <section className="overflow-hidden rounded-3xl border border-[#e4e4e4] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          {/* Header Banner Area */}
          <div className="h-32 sm:h-44 w-full" style={gradientStyle(profile.theme_gradient)} />

          {/* Profile details overlaps header */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative">
            <div className="-mt-12 sm:-mt-16 mb-5">
              <div 
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-md border-4 border-white revert-dark select-none"
                style={gradientStyle(profile.theme_gradient)}
              >
                {initials(profile.full_name)}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="rg-serif text-3xl sm:text-4xl text-[#0a0a0a] tracking-tight">{profile.full_name}</h1>
                  {profile.level && (
                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      {profile.level}
                    </span>
                  )}
                </div>
                {profile.bio && <p className="max-w-2xl text-sm leading-relaxed text-[#4b5563] font-light">{profile.bio}</p>}
                {profile.location && (
                  <p className="flex items-center gap-1.5 text-xs text-[#8b8b8b] font-semibold">
                    <MapPin size={13} /> {profile.location}
                  </p>
                )}
              </div>
              <button 
                onClick={share} 
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-[#e4e4e4] bg-[#fafafa] hover:bg-[#f3f3f3] hover:border-[#c4c4c4] px-4.5 py-2.5 text-xs font-bold text-[#4b5563] hover:text-[#0a0a0a] transition-all shadow-sm"
              >
                <Share2 size={14} /> Share Profile
              </button>
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2.5 border-t border-[#e4e4e4] p-5 sm:px-8 bg-[#fafafa]/50">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a 
                  key={label} 
                  href={href} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e4e4e4] bg-white px-3.5 py-2 text-xs font-semibold text-[#4b5563] hover:text-[#0a0a0a] hover:border-[#cbd5e1] hover:shadow-sm transition-all"
                >
                  <Icon size={14} className="text-[#8b8b8b]" /> {label}
                </a>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {profile.skills?.length > 0 && (
            <Card title="Expertise & Skills">
              <div className="flex flex-wrap gap-2">{profile.skills.map(skill => <Chip key={skill}>{skill}</Chip>)}</div>
            </Card>
          )}

          {profile.target_roles?.length > 0 && (
            <Card title="Target Roles">
              <div className="flex flex-wrap gap-2">{profile.target_roles.map(role => <Chip key={role} tone="dark">{role}</Chip>)}</div>
            </Card>
          )}

          {radarData.length > 0 && (
            <Card title="AI Interview Performance" className="md:col-span-2">
              <div className="h-80 max-w-md mx-auto">
                <RadarScoreChart data={radarData} />
              </div>
            </Card>
          )}

          {profile.skill_match && (
            <Card title="AI Job Match Analysis" className="md:col-span-2">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="shrink-0 bg-[#fafafa] border border-[#e4e4e4] rounded-2xl p-5 text-center min-w-[140px] shadow-sm">
                  <p className="text-[11px] font-bold text-[#8b8b8b] uppercase tracking-wider">Compatibility</p>
                  <p className="mt-2 text-4xl font-serif text-[#0a0a0a] tracking-tight">{Math.round(profile.skill_match.match_pct || 0)}%</p>
                  <p className="mt-1.5 text-xs text-[#6b6b6b] leading-tight font-medium max-w-[120px] mx-auto">{profile.skill_match.role}</p>
                </div>
                <div className="grid flex-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-100 rounded px-2.5 py-0.5 w-fit">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(profile.skill_match.matched || []).map(skill => <Chip key={skill} tone="green">{skill}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded px-2.5 py-0.5 w-fit">Skill Gaps</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(profile.skill_match.missing || []).map(skill => <Chip key={skill} tone="red">{skill}</Chip>)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {profile.show_resume_download && profile.resume_url && (
            <Card className="md:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0a0a0a] tracking-tight">Verified Resume Download</h2>
                    <p className="mt-1 text-xs text-[#6b6b6b] font-light">Download the latest technical resume PDF verified by Nirvexa for this candidate.</p>
                  </div>
                </div>
                <a 
                  href={profile.resume_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <Download size={14} /> Download Resume PDF
                </a>
              </div>
            </Card>
          )}
        </div>

        <footer className="mt-12 flex items-center justify-center gap-2 pb-8 text-[11px] font-semibold text-[#8b8b8b]">
          <span>Built on Nyrvexa</span>
          <span className="text-gray-300">•</span>
          <a href="https://nyrvexa.in" className="hover:text-indigo-600 transition-colors">nyrvexa.in</a>
        </footer>
      </div>
    </main>
  )
}
