import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import CursorEffect from '../components/CursorEffect'

export default function Login() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        .log-page{
          min-height:100vh;display:flex;align-items:center;justify-content:center;
          background:#fafafa;font-family:'DM Sans',system-ui,sans-serif;
          padding:40px 20px;position:relative;overflow:hidden;
          -webkit-font-smoothing:antialiased;
        }
        .log-card{width:100%;max-width:460px;position:relative;z-index:2}

        .log-logo{display:flex;align-items:center;gap:9px;justify-content:center;margin-bottom:28px;text-decoration:none}
        .log-lsq{width:32px;height:32px;background:#0a0a0a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fafafa;letter-spacing:-.5px}
        .log-lname{font-size:18px;font-weight:600;color:#0a0a0a;letter-spacing:-.4px}

        .log-heading{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(28px,5vw,36px);font-weight:400;letter-spacing:-1.5px;color:#0a0a0a;text-align:center;line-height:1.1;margin-bottom:8px}
        .log-heading em{font-style:italic;color:#6b6b6b}
        .log-sub{font-size:15px;color:#6b6b6b;text-align:center;margin-bottom:36px;font-weight:400}

        .log-form-wrap{
          background:#ffffff;border:1px solid #e4e4e4;border-radius:20px;
          padding:32px 28px;box-shadow:0 2px 4px rgba(0,0,0,.03),0 16px 48px rgba(0,0,0,.06);
        }

        .log-label{display:block;font-size:13px;font-weight:500;color:#0a0a0a;margin-bottom:6px;letter-spacing:-.1px}
        .log-label-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
        .log-forgot{font-size:12px;font-weight:500;color:#6b6b6b;text-decoration:none;transition:color .2s}
        .log-forgot:hover{color:#0a0a0a}

        .log-input-wrap{position:relative;margin-bottom:16px}
        .log-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#a3a3a3;pointer-events:none;transition:color .2s}
        .log-input{
          width:100%;padding:12px 12px 12px 42px;font-family:'DM Sans',sans-serif;font-size:14px;
          background:#fafafa;border:1px solid #e4e4e4;border-radius:12px;color:#0a0a0a;
          outline:none;transition:border-color .2s,box-shadow .2s,background .2s;
        }
        .log-input::placeholder{color:#b0b0b0}
        .log-input:focus{border-color:#0a0a0a;box-shadow:0 0 0 3px rgba(10,10,10,.06);background:#fff}
        .log-input:hover:not(:focus){border-color:#c4c4c4}
        .log-input.err{border-color:#ef4444;background:#fef2f2}
        .log-input-wrap:focus-within .log-icon{color:#0a0a0a}

        .log-pass-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#a3a3a3;padding:4px;transition:color .2s}
        .log-pass-toggle:hover{color:#0a0a0a}

        .log-err{font-size:12px;color:#ef4444;margin-top:4px;margin-bottom:8px}

        .log-error-banner{
          display:flex;align-items:center;gap:10px;padding:12px 14px;
          background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:16px;
        }
        .log-error-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;flex-shrink:0}
        .log-error-msg{font-size:13px;color:#ef4444;font-weight:500}

        .log-divider{display:flex;align-items:center;gap:14px;margin:20px 0}
        .log-divider-line{flex:1;height:1px;background:#e4e4e4}
        .log-divider-text{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#a3a3a3}

        .log-google-wrap{display:flex;justify-content:center;margin-bottom:4px}
        .log-google-loading{
          width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
          padding:12px;border-radius:12px;border:1px solid #e4e4e4;color:#a3a3a3;font-size:13px;
        }

        .log-submit{
          width:100%;padding:13px 24px;background:#0a0a0a;color:#fafafa;
          font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;
          letter-spacing:-.3px;border:none;border-radius:26px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s,opacity .2s;
        }
        .log-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.18)}
        .log-submit:disabled{opacity:.6;cursor:not-allowed}

        .log-footer{text-align:center;margin-top:24px}
        .log-footer-text{font-size:13px;color:#6b6b6b}
        .log-footer-link{color:#0a0a0a;font-weight:600;text-decoration:none;letter-spacing:-.2px;transition:color .2s}
        .log-footer-link:hover{color:#3b82f6}
        .log-back{
          display:inline-flex;align-items:center;gap:6px;margin-top:18px;
          font-size:13px;color:#a3a3a3;text-decoration:none;font-weight:500;transition:color .2s;
        }
        .log-back:hover{color:#0a0a0a}
        .log-secure{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:14px;font-size:11px;color:#c4c4c4}

        @media(max-width:500px){
          .log-form-wrap{padding:24px 20px;border-radius:16px}
        }
      `}</style>

      <div className="log-page">
        <CursorEffect />

        <div className="log-card">

          {/* Logo */}
          <Link to="/" className="log-logo">
            <img src="/logo.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            <span className="log-lname">Nyrvexa</span>
          </Link>

          <h1 className="log-heading">Welcome <em>back.</em></h1>
          <p className="log-sub">Sign in to continue your career journey.</p>

          <div className="log-form-wrap">

            {/* Google */}
            <div className="log-google-wrap">
              {googleLoading ? (
                <div className="log-google-loading">
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in with Google...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google login failed')}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  width="400"
                  text="signin_with"
                />
              )}
            </div>

            <div className="log-divider">
              <div className="log-divider-line" />
              <span className="log-divider-text">or sign in with email</span>
              <div className="log-divider-line" />
            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <label className="log-label">Email address</label>
              <div className="log-input-wrap">
                <div className="log-icon"><Mail size={16} /></div>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="name@nyrvexa.com"
                  className={`log-input${errors.email ? ' err' : ''}`}
                />
              </div>
              {errors.email && <p className="log-err">{errors.email}</p>}

              {/* Password */}
              <div className="log-label-row">
                <label className="log-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="log-forgot">Forgot password?</Link>
              </div>
              <div className="log-input-wrap">
                <div className="log-icon"><Lock size={16} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={`log-input${errors.password ? ' err' : ''}`}
                  style={{ paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="log-pass-toggle">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="log-err">{errors.password}</p>}

              {/* Error */}
              {errors.general && (
                <div className="log-error-banner">
                  <div className="log-error-dot" />
                  <p className="log-error-msg">{errors.general}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="log-submit">
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>

            {/* Register link */}
            <div className="log-divider">
              <div className="log-divider-line" />
              <span className="log-divider-text">New to Nyrvexa?</span>
              <div className="log-divider-line" />
            </div>
            <p className="log-footer-text">
              Ready to accelerate your career?{' '}
              <Link to="/register" className="log-footer-link">Create an account →</Link>
            </p>

          </div>

          {/* Bottom */}
          <div className="log-footer">
            <Link to="/" className="log-back">
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Back to homepage
            </Link>
            <div className="log-secure">
              <Shield size={10} strokeWidth={2} />
              Secure · Encrypted · Built in India
            </div>
          </div>

        </div>
      </div>
    </>
  )
}