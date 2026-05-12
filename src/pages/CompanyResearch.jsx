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
    <Layout>\n      <style>{`\n        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');\n        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }\n        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }\n      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-blue-50/80 blur-[100px] rounded-full pointer-events-none" />

        <div className="pt-4 pb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-[#0a0a0a] text-xs font-medium mb-3">
            <Building2 size={13} /> Company Research
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight">Company Research</h1>
          <p className="text-[#4a4a4a] text-base font-medium mt-1 max-w-xl">
            AI-powered company deep-dives — tech stack, culture, interview tips and more.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-6 sm:p-8 mb-8 z-10 relative">
          <div className="mb-5">
            <label className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-2 block ml-1">Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={15} />
              <input
                type="text"
                placeholder="e.g. Google, Razorpay, Infosys"
                value={company}
                onChange={e => { setCompany(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleResearch()}
                className="w-full bg-white/5 border border-white/10 text-[#0a0a0a] placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[#8b8b8b] text-xs mb-2">Popular companies:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_COMPANIES.map(c => (
                <button key={c} onClick={() => { setCompany(c); setResult(null) }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${company === c ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm font-medium' : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm font-medium'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleResearch} disabled={!company.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Researching...</> : <><Sparkles size={16} /> Research Company</>}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 z-10 relative">

            {/* Summary */}
            {result.summary && (
              <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-3 flex items-center gap-2 text-sm">
                  <Building2 size={15} className="text-blue-600" /> About {company}
                </h3>
                <p className="text-[#4a4a4a] text-sm leading-relaxed">{result.summary}</p>
                {result.glassdoor_rating && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <Star size={12} className="text-amber-600" />
                    <span className="text-amber-700 text-xs font-medium">Glassdoor: {result.glassdoor_rating}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Tech stack */}
              {result.tech_stack?.length > 0 && (
                <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
                  <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                    <Code2 size={15} className="text-purple-600" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tech_stack.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-700 text-xs rounded-lg font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Culture */}
              {result.culture_notes && (
                <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
                  <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-3 flex items-center gap-2 text-sm">
                    <Users size={15} className="text-teal-600" /> Culture
                  </h3>
                  <p className="text-[#4a4a4a] text-sm leading-relaxed">{result.culture_notes}</p>
                </div>
              )}
            </div>

            {/* Interview tips */}
            {result.interview_tips?.length > 0 && (
              <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                  <MessageSquare size={15} className="text-amber-600" /> Interview Tips
                </h3>
                <ul className="space-y-3">
                  {result.interview_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#4a4a4a] text-sm">
                      <span className="text-amber-600 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hiring process */}
            {result.hiring_process && (
              <div className="bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-3 flex items-center gap-2 text-sm">
                  <Lightbulb size={15} className="text-emerald-600" /> Hiring Process
                </h3>
                <p className="text-[#4a4a4a] text-sm leading-relaxed">{result.hiring_process}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}