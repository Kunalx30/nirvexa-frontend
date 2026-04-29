import Layout from '../components/layout/Layout'
import { useState } from 'react'
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
  const [role, setRole]         = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-green-600/6 blur-[120px] rounded-full pointer-events-none" />

        <div className="pt-4 pb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-green-400 mb-3">
            <TrendingUp size={13} /> Salary Insights
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Salary Insights</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl font-light">
            Real salary data for Indian job market — powered by live job listings and AI.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 mb-8 z-10 relative">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Job Role *</label>
              <div className="relative">
                <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                <input
                  type="text"
                  placeholder="e.g. Data Analyst"
                  value={role}
                  onChange={e => { setRole(e.target.value); setResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Location (optional)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  value={location}
                  onChange={e => { setLocation(e.target.value); setResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick picks */}
          <div className="mb-4">
            <p className="text-gray-500 text-xs mb-2">Popular roles:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map(r => (
                <button key={r} onClick={() => { setRole(r); setResult(null) }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${role === r ? 'bg-green-500/15 border-green-500/30 text-green-300' : 'bg-white/3 border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-gray-500 text-xs mb-2">Cities:</p>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(c => (
                <button key={c} onClick={() => { setLocation(c); setResult(null) }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${location === c ? 'bg-green-500/15 border-green-500/30 text-green-300' : 'bg-white/3 border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSearch} disabled={!role.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none text-sm">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Fetching...</> : <><Sparkles size={16} /> Get Salary Data</>}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 z-10 relative">

            {/* Source badge */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${result.source === 'db' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                {result.source === 'db' ? `📊 Based on ${result.sample_count} real job listings` : '🤖 AI-powered market estimate'}
              </span>
            </div>

            {/* Salary range cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Min', value: result.min_salary_lpa, color: 'text-rose-400' },
                { label: 'Median', value: result.median_lpa, color: 'text-amber-400' },
                { label: 'Average', value: result.avg_salary_lpa, color: 'text-blue-400' },
                { label: 'Max', value: result.max_salary_lpa, color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#111116]/80 border border-white/5 rounded-2xl p-5 text-center">
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
                  <p className="text-gray-600 text-xs">LPA</p>
                </div>
              ))}
            </div>

            {/* AI-only fields */}
            {result.source === 'ai' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {result.fresher_lpa && (
                  <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Fresher (0–1 yr)</p>
                    <p className="text-white text-xl font-bold">{result.fresher_lpa} LPA</p>
                  </div>
                )}
                {result.experienced_lpa && (
                  <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Experienced (5+ yrs)</p>
                    <p className="text-white text-xl font-bold">{result.experienced_lpa} LPA</p>
                  </div>
                )}
              </div>
            )}

            {/* Market demand + note */}
            {(result.market_demand || result.note) && (
              <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  {result.market_demand && (
                    <p className="text-gray-300 text-sm font-medium mb-1">
                      Market demand: <span className={result.market_demand === 'high' ? 'text-emerald-400' : result.market_demand === 'medium' ? 'text-amber-400' : 'text-rose-400'}>{result.market_demand}</span>
                    </p>
                  )}
                  {result.note && <p className="text-gray-400 text-sm">{result.note}</p>}
                </div>
              </div>
            )}

            {/* Top companies */}
            {result.top_paying_companies?.length > 0 && (
              <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                  <Building2 size={15} className="text-green-400" /> Top Paying Companies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.top_paying_companies.map((c, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-300 text-xs rounded-lg font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Salary factors */}
            {result.salary_factors?.length > 0 && (
              <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                  <TrendingUp size={15} className="text-blue-400" /> What Increases Your Salary
                </h3>
                <ul className="space-y-2">
                  {result.salary_factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm">
                      <span className="text-blue-400 mt-0.5">↑</span> {f}
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