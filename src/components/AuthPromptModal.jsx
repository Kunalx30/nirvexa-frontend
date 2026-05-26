import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function AuthPromptModal({ open, onClose, redirectTo = '/', onSuccess, title, subtitle }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Enter email and password')
      return
    }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      toast.success('Signed in')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const redirect = encodeURIComponent(redirectTo || '/')

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md bg-white border border-[#e4e4e4] rounded-2xl shadow-2xl p-7 font-['DM_Sans',system-ui,sans-serif]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6b6b6b] hover:bg-[#f3f3f3]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="font-['DM_Serif_Display',Georgia,serif] text-2xl text-[#0a0a0a] tracking-tight mb-1 pr-8">
          {title || 'Sign in to continue'}
        </h2>
        <p className="text-sm text-[#6b6b6b] mb-6">
          {subtitle || 'Create a free account or sign in to run this action. Your draft stays on this page.'}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6b6b6b] mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-[#e4e4e4] rounded-xl text-sm focus:outline-none focus:border-[#0a0a0a]"
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b6b6b] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-[#e4e4e4] rounded-xl text-sm focus:outline-none focus:border-[#0a0a0a]"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0a0a0a] text-[#fafafa] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign in <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-[#6b6b6b] mt-5">
          New here?{' '}
          <Link to={`/register?redirect=${redirect}`} className="text-[#0a0a0a] font-semibold hover:underline" onClick={onClose}>
            Create free account
          </Link>
        </p>
      </div>
    </div>
  )
}
