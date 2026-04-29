import Layout from '../components/layout/Layout'
import { useState } from 'react'
import {
  Building2, Loader2, Sparkles, Code2,
  Users, MessageSquare, Star, Lightbulb
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Infosys', 'TCS', 'Wipro',
  'Flipkart', 'Zomato', 'PhonePe', 'Razorpay', 'Swiggy', 'Meesho',
]

export default function CompanyResearch() {
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)

  const handleResearch = async () => {
    if (!company.trim()) { toast.error('Enter a company name'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/career/company-research', { company_name: company.trim() })
      setResult(res.data.research)
      toast.success('Company research complete!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Research failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-blue-600/6 blur-[120px] rounded-full pointer-events-none" />

        <div className="pt-4 pb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-3">
            <Building2 size={13} /> Company Research
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Company Research</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl font-light">
            AI-powered company deep-dives — tech stack, culture, interview tips and more.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 mb-8 z-10 relative">
          <div className="mb-5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="e.g. Google, Razorpay, Infosys"
                value={company}
                onChange={e => { setCompany(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleResearch()}
                className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-500 text-xs mb-2">Popular companies:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_COMPANIES.map(c => (
                <button key={c} onClick={() => { setCompany(c); setResult(null) }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${company === c ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' : 'bg-white/3 border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleResearch} disabled={!company.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none text-sm">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Researching...</> : <><Sparkles size={16} /> Research Company</>}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 z-10 relative">

            {/* Summary */}
            {result.summary && (
              <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Building2 size={15} className="text-blue-400" /> About {company}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
                {result.glassdoor_rating && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <Star size={12} className="text-amber-400" />
                    <span className="text-amber-300 text-xs font-medium">Glassdoor: {result.glassdoor_rating}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Tech stack */}
              {result.tech_stack?.length > 0 && (
                <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                    <Code2 size={15} className="text-purple-400" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tech_stack.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-lg font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Culture */}
              {result.culture_notes && (
                <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Users size={15} className="text-teal-400" /> Culture
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.culture_notes}</p>
                </div>
              )}
            </div>

            {/* Interview tips */}
            {result.interview_tips?.length > 0 && (
              <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                  <MessageSquare size={15} className="text-amber-400" /> Interview Tips
                </h3>
                <ul className="space-y-3">
                  {result.interview_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-amber-400 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hiring process */}
            {result.hiring_process && (
              <div className="bg-[#111116]/80 border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Lightbulb size={15} className="text-green-400" /> Hiring Process
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{result.hiring_process}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}