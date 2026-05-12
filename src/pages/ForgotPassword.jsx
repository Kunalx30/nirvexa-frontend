import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import CursorEffect from '../components/CursorEffect'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) { toast.error('Enter your email'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#fcfcfc] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      <CursorEffect />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/80 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 py-10">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#0a0a0a] rounded-xl flex items-center justify-center mx-auto mb-5 shadow-md border border-[#0a0a0a]">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#0a0a0a] tracking-tight mb-2">Forgot password?</h1>
          <p className="text-[#4a4a4a] font-medium text-sm">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="bg-white border border-[#e4e4e4] rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-4" />
              <h2 className="text-[#0a0a0a] font-bold text-lg mb-2">Check your inbox</h2>
              <p className="text-[#4a4a4a] text-sm mb-6">
                If <span className="text-[#0a0a0a] font-semibold">{email}</span> is registered, you'll receive a reset link shortly.
              </p>
              <Link to="/login"
                className="text-[#0a0a0a] hover:text-[#3a3a3a] text-sm font-semibold transition-colors underline underline-offset-4">
                Back to login
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-[#4a4a4a] block mb-1.5 ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="name@example.com"
                    className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl shadow-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm">
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  : <>Send Reset Link <ArrowRight size={16} /></>}
              </button>

              <p className="text-center text-[#8b8b8b] text-sm">
                Remembered it?{' '}
                <Link to="/login" className="text-[#0a0a0a] hover:text-[#3a3a3a] transition-colors font-semibold underline underline-offset-4">
                  Back to login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}