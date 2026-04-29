import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const { login, googleLogin } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]           = useState({ email: '', password: '' })
  const [errors, setErrors]       = useState({})
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email.trim().toLowerCase(), form.password)
      toast.success('Welcome back!')
      navigate('/chat')
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    try {
      await googleLogin(credentialResponse.credential)
      toast.success('Welcome back!')
      navigate('/chat')
    } catch (err) {
      toast.error('Google login failed. Try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 py-10">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-purple-500/20 border border-white/10">
            <span className="text-white font-bold text-lg sm:text-xl tracking-tight">N</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h1>
          <p className="text-gray-400 font-light text-sm sm:text-base px-2">Enter your credentials to access your workspace.</p>
        </div>

        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl">

          {/* Google Login */}
          <div className="mb-5">
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin" /> Signing in with Google...
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google login failed')}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  width="370"
                  text="signin_with"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-white/5" />
            <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* Email Input */}
            <div className="space-y-1 sm:space-y-1.5">
              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="name@nirvexa.ai"
                error={errors.email}
                icon={<Mail size={18} className="text-gray-500" />}
                required
                className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder-gray-600 rounded-xl"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border text-gray-100 placeholder-gray-600 rounded-xl pl-10 pr-10 py-3 sm:py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all ${
                    errors.password ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Error State */}
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-red-400 text-xs sm:text-sm font-medium">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-1 sm:pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 sm:gap-4 my-6 sm:my-8">
            <div className="flex-1 border-t border-white/5" />
            <span className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">New to NirVexa?</span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-400 text-xs sm:text-sm">
            Ready to accelerate your career?{' '}
            <Link to="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 font-semibold transition-all">
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer Link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-gray-300 text-xs sm:text-sm font-medium transition-colors">
            <ArrowRight size={14} className="rotate-180" />
            Back to homepage
          </Link>
        </div>

      </div>
    </div>
  )
}