import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const token                   = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0c] flex items-center justify-center px-4 font-sans">
        <div className="text-center">
          <AlertCircle size={48} className="text-rose-400 mx-auto mb-4" />
          <h1 className="text-white text-xl font-semibold mb-2">Invalid reset link</h1>
          <p className="text-gray-400 text-sm mb-6">This link is missing a token. Please request a new one.</p>
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            Request new link
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!password || !confirm) { toast.error('Fill in both fields'); return }
    if (password !== confirm)  { toast.error('Passwords do not match'); return }
    if (password.length < 8)   { toast.error('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 py-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20 border border-white/10">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Set new password</h1>
          <p className="text-gray-400 font-light text-sm">Choose a strong password for your account.</p>
        </div>

        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-600 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Repeat new password"
                className="w-full bg-white/5 border border-white/10 text-gray-100 placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !password || !confirm}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Resetting...</>
              : <>Reset Password <ArrowRight size={16} /></>}
          </button>

          <p className="text-center text-gray-500 text-sm">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}