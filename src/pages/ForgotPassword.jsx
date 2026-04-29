import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

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
    <div className="min-h-[100dvh] bg-[#0a0a0c] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 py-10">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20 border border-white/10">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Forgot password?</h1>
          <p className="text-gray-400 font-light text-sm">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-white font-semibold text-lg mb-2">Check your inbox</h2>
              <p className="text-gray-400 text-sm mb-6">
                If <span className="text-white">{email}</span> is registered, you'll receive a reset link shortly.
              </p>
              <Link to="/login"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Back to login
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm">
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  : <>Send Reset Link <ArrowRight size={16} /></>}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Remembered it?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
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