import Layout from '../components/layout/Layout'
import SEO from '../components/SEO'
import { useState } from 'react'
import { usePagePersistedState } from '../context/PageStateContext'
import {
  TrendingUp, MapPin, Loader2, Sparkles,
  Building2, BarChart3, AlertCircle
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const POPULAR_ROLES = [
  'Data Analyst', 'Software Engineer', 'ML Engineer', 'Product Manager',
  'Data Scientist', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
]

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Noida']

export default function SalaryInsights() {
  const [role, setRole]         = usePagePersistedState('salary_insights_role', '')
  const [location, setLocation] = usePagePersistedState('salary_insights_location', '')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = usePagePersistedState('salary_insights_result', null)

  const handleSearch = async () => {
    if (!role.trim()) { toast.error('Enter a job role'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.get('/jobs/salary-insights', {
        params: { role: role.trim(), location: location.trim() }
      })
      setResult(res.data)
      toast.success('Salary data loaded!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch salary data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <SEO title="Salary Insights" description="Explore salary insights, trends, and compensation data across various tech roles and companies." />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-emerald-50/80 blur-[100px] rounded-full pointer-events-none" />

        <div className="pt-4 pb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-[#0a0a0a] text-xs font-medium mb-3">
            <TrendingUp size={13} /> Salary Insights
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight">Salary Insights</h1>
          <p className="text-[#4a4a4a] text-base font-medium mt-1 max-w-xl">
            Real salary data for Indian job market — powered by live job listings and AI.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-6 sm:p-8 mb-8 z-10 relative">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-2 block ml-1">Job Role *</label>
              <div className="relative">
                <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={15} />
                <input
                  type="text"
                  placeholder="e.g. Data Analyst"
                  value={role}
                  onChange={e => { setRole(e.target.value); setResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white/5 border border-white/10 text-[#0a0a0a] placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-2 block ml-1">Location (optional)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={15} />
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  value={location}
                  onChange={e => { setLocation(e.target.value); setResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white/5 border border-white/10 text-[#0a0a0a] placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick picks */}
          <div className="mb-4">
            <p className="text-[#8b8b8b] text-xs mb-2">Popular roles:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map(r => (
                <button key={r} onClick={() => { setRole(r); setResult(null) }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${role === r ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm font-medium' : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm font-medium'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-[#8b8b8b] text-xs mb-2">Cities:</p>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(c => (
                <button key={c} onClick={() => { setLocation(c); setResult(null) }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${location === c ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm font-medium' : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm font-medium'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSearch} disabled={!role.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Fetching...</> : <><Sparkles size={16} /> Get Salary Data</>}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 z-10 relative">

            {/* Source badge */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${result.source === 'db' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'}`}>
                {result.source === 'db' ? `📊 Based on ${result.sample_count} real job listings` : '🤖 AI-powered market estimate'}
              </span>
            </div>

            {/* Salary range cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Min', value: result.min_salary_lpa, color: 'text-rose-600' },
                { label: 'Median', value: result.median_lpa, color: 'text-amber-600' },
                { label: 'Average', value: result.avg_salary_lpa, color: 'text-blue-600' },
                { label: 'Max', value: result.max_salary_lpa, color: 'text-emerald-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-5 text-center">
                  <p className="text-[#8b8b8b] text-xs mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
                  <p className="text-[#a3a3a3] text-xs">LPA</p>
                </div>
              ))}
            </div>

            {/* AI-only fields */}
            {result.source === 'ai' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {result.fresher_lpa && (
                  <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-5">
                    <p className="text-[#6b6b6b] text-xs mb-1">Fresher (0–1 yr)</p>
                    <p className="text-[#0a0a0a] text-xl font-bold">{result.fresher_lpa} LPA</p>
                  </div>
                )}
                {result.experienced_lpa && (
                  <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-5">
                    <p className="text-[#6b6b6b] text-xs mb-1">Experienced (5+ yrs)</p>
                    <p className="text-[#0a0a0a] text-xl font-bold">{result.experienced_lpa} LPA</p>
                  </div>
                )}
              </div>
            )}

            {/* Market demand + note */}
            {(result.market_demand || result.note) && (
              <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  {result.market_demand && (
                    <p className="text-[#4a4a4a] text-sm font-medium mb-1">
                      Market demand: <span className={result.market_demand === 'high' ? 'text-emerald-600' : result.market_demand === 'medium' ? 'text-amber-600' : 'text-rose-600'}>{result.market_demand}</span>
                    </p>
                  )}
                  {result.note && <p className="text-[#6b6b6b] text-sm">{result.note}</p>}
                </div>
              </div>
            )}

            {/* Top companies */}
            {result.top_paying_companies?.length > 0 && (
              <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                  <Building2 size={15} className="text-emerald-600" /> Top Paying Companies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.top_paying_companies.map((c, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-emerald-700 text-xs rounded-lg font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Salary factors */}
            {result.salary_factors?.length > 0 && (
              <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                  <TrendingUp size={15} className="text-blue-600" /> What Increases Your Salary
                </h3>
                <ul className="space-y-2">
                  {result.salary_factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[#4a4a4a] text-sm">
                      <span className="text-blue-600 mt-0.5">↑</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
