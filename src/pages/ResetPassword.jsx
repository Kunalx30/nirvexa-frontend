import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import CursorEffect from '../components/CursorEffect'

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
      <div className="min-h-[100dvh] bg-[#fcfcfc] flex items-center justify-center px-4 font-sans">
        <CursorEffect />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
          .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
          .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
        `}</style>
        <div className="text-center">
          <AlertCircle size={48} className="text-rose-600 mx-auto mb-4" />
          <h1 className="text-[#0a0a0a] text-xl font-bold mb-2">Invalid reset link</h1>
          <p className="text-[#4a4a4a] text-sm mb-6">This link is missing a token. Please request a new one.</p>
          <Link to="/forgot-password" className="text-[#0a0a0a] hover:text-[#3a3a3a] text-sm font-semibold underline underline-offset-4">
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
    <div className="min-h-[100dvh] bg-[#fcfcfc] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      <CursorEffect />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-50/80 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 py-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#0a0a0a] rounded-xl flex items-center justify-center mx-auto mb-5 shadow-md border border-[#0a0a0a]">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#0a0a0a] tracking-tight mb-2">Set new password</h1>
          <p className="text-[#4a4a4a] font-medium text-sm">Choose a strong password for your account.</p>
        </div>

        <div className="bg-white border border-[#e4e4e4] rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5">
          <div>
            <label className="text-sm font-semibold text-[#4a4a4a] block mb-1.5 ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl shadow-sm pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b8b8b] hover:text-[#0a0a0a] transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#4a4a4a] block mb-1.5 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={18} />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Repeat new password"
                className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl shadow-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !password || !confirm}
            className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Resetting...</>
              : <>Reset Password <ArrowRight size={16} /></>}
          </button>

          <p className="text-center text-[#8b8b8b] text-sm">
            <Link to="/login" className="text-[#0a0a0a] hover:text-[#3a3a3a] transition-colors font-semibold underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}