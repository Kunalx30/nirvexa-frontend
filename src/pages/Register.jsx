import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { checkPasswordStrength } from '../utils/helpers'
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const strength = checkPasswordStrength(form.password)

  // Explicit tailwind classes for safe compiling and glowing effects
  const strengthStyles = {
    red:   { bg: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]', text: 'text-red-400' },
    amber: { bg: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]', text: 'text-amber-400' },
    blue:  { bg: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]', text: 'text-blue-400' },
    green: { bg: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]', text: 'text-emerald-400' },
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password)     e.password = 'Password is required'
    else if (strength.score < 5) e.password = 'Password does not meet all requirements'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password)
      toast.success('Account created! Welcome to NirVexa 🎉')
      navigate('/chat')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const checks = [
    { key: 'length',    label: 'At least 8 characters' },
    { key: 'uppercase', label: 'One uppercase letter'  },
    { key: 'lowercase', label: 'One lowercase letter'  },
    { key: 'number',    label: 'One number'            },
    { key: 'special',   label: 'One special character' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-purple-600/10 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 py-6">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-purple-500/20 border border-white/10">
            <span className="text-white font-bold text-lg sm:text-xl tracking-tight">N</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Create your account</h1>
          <p className="text-gray-400 font-light text-sm sm:text-base px-2">Start your AI-powered career journey.</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* Name Input */}
            <div className="space-y-1 sm:space-y-1.5">
              <Input
                label="Full Name"
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Kunal chandelkar"
                error={errors.name}
                icon={<User size={18} className="text-gray-500" />}
                required
                className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder-gray-600 rounded-xl"
              />
            </div>

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

            {/* Password with strength meter */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Password <span className="text-blue-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
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

              {/* Enhanced Strength bar */}
              {form.password && (
                <div className="space-y-3 mt-2 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score
                            ? strengthStyles[strength.color]?.bg || 'bg-white/20'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${strengthStyles[strength.color]?.text || 'text-gray-400'}`}>
                      {strength.label}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-1">
                    {checks.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        {strength.checks[key]
                          ? <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                          : <XCircle    size={14} className="text-white/20 shrink-0" />
                        }
                        <span className={`text-[11px] sm:text-xs font-medium ${strength.checks[key] ? 'text-gray-300' : 'text-gray-600'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="pt-2 sm:pt-3">
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
                    Creating account...
                  </span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 sm:gap-4 my-6 sm:my-8">
            <div className="flex-1 border-t border-white/5" />
            <span className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Already registered?</span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-400 text-xs sm:text-sm">
            Have an account?{' '}
            <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 font-semibold transition-all">
              Sign in
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