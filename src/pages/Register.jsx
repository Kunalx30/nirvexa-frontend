import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkPasswordStrength } from '../utils/helpers'
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowRight, Loader2, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import CursorEffect from '../components/CursorEffect'

/* ─── TERMS & CONDITIONS ─────────────────────────────────────── */
const TERMS_CONTENT = `TERMS OF SERVICE

Effective Date: 1 May 2026 | Version 2.0

These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Nyrvexa Technologies Private Limited ("Nyrvexa," "we," "us," or "our"), governing your access to and use of the Nyrvexa platform, including all associated websites, applications, APIs, and AI-powered services (collectively, the "Platform").

By creating an account, accessing, or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the Platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DEFINITIONS

"AI Services" means all artificial intelligence, machine learning, and natural language processing features offered through the Platform, including but not limited to resume analysis, resume tailoring, career chat, interview coaching, salary intelligence, career roadmaps, and company research.

"Content" means any text, data, documents, resumes, responses, analyses, or other materials generated, uploaded, or processed through the Platform.

"User Data" means all personal information, documents, and data you provide to or generate through the Platform.

2. ELIGIBILITY & ACCOUNT REGISTRATION

2.1. You must be at least 18 years of age and legally capable of entering into binding contracts in your jurisdiction to use the Platform.

2.2. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.

2.3. You are solely responsible for maintaining the confidentiality of your login credentials. Any activity conducted under your account is your responsibility.

2.4. You may not create multiple accounts, share account access with third parties, or transfer your account without our written consent.

3. AI-GENERATED CONTENT DISCLAIMER

3.1. The Platform utilises multiple AI models to provide career guidance, resume optimization, interview coaching, and related services. All AI-generated outputs are provided as suggestions and informational guidance only.

3.2. Nyrvexa does not guarantee the accuracy, completeness, or suitability of any AI-generated content. You acknowledge that AI outputs may contain errors, biases, or inaccuracies.

3.3. AI-generated resume modifications, career advice, salary estimates, and interview feedback should be independently verified by the User before being acted upon.

3.4. Nyrvexa expressly disclaims any guarantee of employment outcomes, interview success, salary increases, or career advancement resulting from the use of our AI Services.

4. SUBSCRIPTION & BILLING

4.1. Free Tier: Free accounts are subject to daily usage limits including restricted resume analyses, limited chat messages, and locked premium features such as Voice Interview AI.

4.2. Pro Subscription: The Pro plan is available at ₹199 per month (or yearly billing as shown on the pricing page) and provides unlimited access to all Platform features. Billing is for the selected period; see pricing for details.

4.3. You may cancel your Pro subscription at any time through your account settings. Cancellation takes effect at the end of the current billing cycle; no partial refunds are issued.

4.4. Refund requests are considered on a case-by-case basis within 7 calendar days of the original transaction. Refunds are processed to the original payment method within 5–10 business days.

4.5. Nyrvexa reserves the right to modify pricing with 30 days' prior written notice to active subscribers.

5. ACCEPTABLE USE POLICY

You agree not to:
• Use the Platform for any unlawful, fraudulent, or malicious purpose
• Upload, transmit, or store viruses, malware, or harmful code
• Attempt to reverse-engineer, decompile, disassemble, or hack any part of the Platform
• Scrape, crawl, spider, or harvest data from the Platform using automated means
• Circumvent usage limits, rate limiting, or access controls
• Impersonate any person or entity or misrepresent your affiliation
• Use AI Services to generate misleading, defamatory, or harmful content
• Share, resell, or sublicense your account access to third parties
• Interfere with or disrupt the integrity or performance of the Platform

6. INTELLECTUAL PROPERTY

6.1. All Platform code, designs, branding, AI models, algorithms, documentation, and proprietary technology are the exclusive intellectual property of Nyrvexa and its licensors, protected under applicable Indian and international intellectual property laws.

6.2. You retain ownership of your original User Data (e.g., your uploaded resume content). By using the Platform, you grant Nyrvexa a limited, non-exclusive, royalty-free licence to process your User Data solely for the purpose of delivering our services.

6.3. AI-generated outputs (e.g., tailored resumes, career advice) are provided under a personal-use licence. You may use such outputs for your own career purposes but may not commercially redistribute them.

7. LIMITATION OF LIABILITY

7.1. THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY.

7.2. TO THE MAXIMUM EXTENT PERMITTED BY LAW, NYRVEXA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.

7.3. Nyrvexa's total aggregate liability for any claim arising from these Terms shall not exceed the amount paid by you to Nyrvexa in the twelve (12) months preceding the claim.

8. INDEMNIFICATION

You agree to indemnify and hold harmless Nyrvexa, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your violation of these Terms, misuse of the Platform, or infringement of third-party rights.

9. DATA PROTECTION & PRIVACY

Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, store, and protect your personal data. By using the Platform, you consent to the data practices described therein.

10. TERMINATION

10.1. You may delete your account at any time through your account settings.

10.2. Nyrvexa reserves the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any conduct that we reasonably believe is harmful to other users, the Platform, or Nyrvexa's interests.

10.3. Upon termination, your right to access the Platform ceases immediately. Sections 6, 7, 8, and 12 shall survive termination.

11. MODIFICATIONS TO TERMS

Nyrvexa may update these Terms at any time. Material changes will be communicated via email or in-app notification at least 15 days before taking effect. Continued use of the Platform after the effective date constitutes acceptance of the updated Terms.

12. GOVERNING LAW & DISPUTE RESOLUTION

12.1. These Terms are governed by and construed in accordance with the laws of India.

12.2. Any disputes arising from these Terms shall first be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be referred to binding arbitration under the Arbitration and Conciliation Act, 1996, with the seat of arbitration in Nagpur, Maharashtra.

12.3. The courts of Nagpur, Maharashtra shall have exclusive jurisdiction over any matters not subject to arbitration.

13. CONTACT INFORMATION

For questions, concerns, or legal notices regarding these Terms:

Nyrvexa Technologies Private Limited
Email: legal@nyrvexa.com
Support: support@nyrvexa.com`.trim()

/* ─── PRIVACY POLICY ─────────────────────────────────────────── */
const PRIVACY_CONTENT = `PRIVACY POLICY

Effective Date: 1 May 2026 | Version 2.0

Nyrvexa Technologies Private Limited ("Nyrvexa," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Nyrvexa platform and associated services (the "Platform").

By using the Platform, you consent to the practices described in this Privacy Policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. INFORMATION WE COLLECT

1.1. Information You Provide:
• Account information: name, email address, password (hashed)
• Profile data: job title, skills, experience level, target roles
• Documents: resumes, cover letters uploaded for analysis
• Chat data: queries and conversations with AI career assistant
• Payment information: processed securely via third-party payment processors; we do not store full card details

1.2. Information Collected Automatically:
• Device information: browser type, operating system, device identifiers
• Usage data: pages visited, features used, session duration, click patterns
• Log data: IP address, access times, referring URLs, error logs
• Cookies and similar technologies for session management and analytics

1.3. Information from Third Parties:
• Google OAuth data (name, email, profile picture) when using Google Sign-In
• Analytics data from integrated third-party services

2. HOW WE USE YOUR INFORMATION

We use your information for the following purposes:
• To provide, maintain, and improve our AI-powered career services
• To process and analyse your resumes, generate career recommendations, and deliver personalised guidance
• To process payments and manage your subscription
• To communicate with you about your account, updates, and support requests
• To detect, prevent, and address technical issues, fraud, and security threats
• To comply with legal obligations and enforce our Terms of Service
• To conduct aggregated, anonymised analytics to improve our AI models and Platform performance

3. AI DATA PROCESSING

3.1. When you use our AI Services, your input data (resume text, chat queries, career preferences) is processed by our AI models to generate outputs. This processing is essential to deliver the service you have requested.

3.2. We may use anonymised and aggregated data derived from user interactions to improve our AI models. Individual users cannot be identified from this aggregated data.

3.3. We do not sell, rent, or share your personal resume data or chat conversations with third-party employers, recruiters, or data brokers.

3.4. AI model providers (where applicable) process data under strict data processing agreements that prohibit retention of personal data beyond the immediate processing request.

4. DATA SHARING & DISCLOSURE

We may share your information only in the following circumstances:

4.1. Service Providers: With trusted third-party vendors who assist in operating the Platform (hosting, payment processing, analytics, email delivery) under strict confidentiality agreements.

4.2. Legal Requirements: When required by law, subpoena, court order, or governmental request, or to protect the rights, property, or safety of Nyrvexa, our users, or the public.

4.3. Business Transfers: In connection with a merger, acquisition, reorganisation, or sale of assets, your data may be transferred as part of the transaction. You will be notified of any such transfer.

4.4. With Your Consent: When you explicitly authorise us to share information with specific third parties.

We do not sell your personal data to third parties.

5. DATA RETENTION

5.1. Account data is retained for as long as your account is active. Upon account deletion, personal data is permanently deleted within 30 days, except where retention is required by law.

5.2. Chat and AI interaction logs are retained for up to 12 months for service improvement and then automatically anonymised or deleted.

5.3. Payment records are retained for 7 years as required under Indian tax and financial regulations.

5.4. Anonymised, aggregated analytics data may be retained indefinitely.

6. DATA SECURITY

6.1. We implement industry-standard security measures including:
• AES-256 encryption for data at rest
• TLS 1.3 encryption for data in transit
• Secure password hashing (bcrypt with salt)
• Regular security audits and vulnerability assessments
• Access controls and role-based permissions for internal systems

6.2. Despite our best efforts, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.

7. YOUR RIGHTS

Under applicable data protection laws, you have the right to:
• Access: Request a copy of the personal data we hold about you
• Correction: Request correction of inaccurate or incomplete personal data
• Deletion: Request deletion of your personal data (subject to legal retention requirements)
• Portability: Request your data in a structured, commonly used, machine-readable format
• Objection: Object to processing of your personal data for specific purposes
• Withdrawal of Consent: Withdraw consent at any time; this does not affect the lawfulness of prior processing

To exercise these rights, contact us at privacy@nyrvexa.com. We will respond within 30 days.

8. COOKIES & TRACKING

8.1. We use essential cookies for authentication, session management, and security.

8.2. We use analytics cookies (e.g., Google Analytics) to understand usage patterns and improve the Platform. You can manage cookie preferences through your browser settings.

8.3. We do not use cookies for third-party advertising or cross-site tracking.

9. CHILDREN'S PRIVACY

The Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child's data has been collected, we will promptly delete it.

10. INTERNATIONAL DATA TRANSFERS

Your data is primarily stored and processed in India. If data is transferred to servers outside India, we ensure adequate safeguards are in place through standard contractual clauses or equivalent mechanisms.

11. CHANGES TO THIS POLICY

We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notification at least 15 days before taking effect. The "Effective Date" at the top will be updated accordingly.

12. CONTACT US

For privacy-related questions, data requests, or concerns:

Nyrvexa Technologies Private Limited
Data Protection Officer: privacy@nyrvexa.com
General Support: support@nyrvexa.com
Legal: legal@nyrvexa.com`.trim()

export default function Register() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [legalTab, setLegalTab] = useState(null) // null | 'terms' | 'privacy'

  const strength = checkPasswordStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    else if (strength.score < 5) e.password = 'Password does not meet all requirements'
    if (!agreed) e.terms = 'You must agree to the Terms & Conditions'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password)
      toast.success('Account created! Welcome to Nyrvexa 🎉')
      navigate('/chat')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions first')
      setErrors({ terms: 'You must agree to the Terms & Conditions' })
      return
    }
    setGoogleLoading(true)
    try {
      await googleLogin(credentialResponse.credential)
      toast.success('Welcome to Nyrvexa!')
      navigate('/chat')
    } catch (err) {
      toast.error('Google sign up failed. Try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const checks = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'uppercase', label: 'One uppercase letter' },
    { key: 'lowercase', label: 'One lowercase letter' },
    { key: 'number', label: 'One number' },
    { key: 'special', label: 'One special character' },
  ]

  const strengthColor = {
    red: { bar: '#ef4444', text: '#f87171' },
    amber: { bar: '#f59e0b', text: '#fbbf24' },
    blue: { bar: '#3b82f6', text: '#60a5fa' },
    green: { bar: '#10b981', text: '#34d399' },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        .reg-page{
          min-height:100vh;display:flex;align-items:center;justify-content:center;
          background:#fafafa;font-family:'DM Sans',system-ui,sans-serif;
          padding:40px 20px;position:relative;overflow:hidden;
          -webkit-font-smoothing:antialiased;
        }
        .reg-card{
          width:100%;max-width:460px;position:relative;z-index:2;
        }

        /* Header */
        .reg-logo{display:flex;align-items:center;gap:9px;justify-content:center;margin-bottom:28px;text-decoration:none}
        .reg-lsq{width:32px;height:32px;background:#0a0a0a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fafafa;letter-spacing:-.5px}
        .reg-lname{font-size:18px;font-weight:600;color:#0a0a0a;letter-spacing:-.4px}

        .reg-heading{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(28px,5vw,36px);font-weight:400;letter-spacing:-1.5px;color:#0a0a0a;text-align:center;line-height:1.1;margin-bottom:8px}
        .reg-heading em{font-style:italic;color:#6b6b6b}
        .reg-sub{font-size:15px;color:#6b6b6b;text-align:center;margin-bottom:36px;font-weight:400}

        /* Form container */
        .reg-form-wrap{
          background:#ffffff;border:1px solid #e4e4e4;border-radius:20px;
          padding:32px 28px;box-shadow:0 2px 4px rgba(0,0,0,.03),0 16px 48px rgba(0,0,0,.06);
        }

        /* Labels */
        .reg-label{display:block;font-size:13px;font-weight:500;color:#0a0a0a;margin-bottom:6px;letter-spacing:-.1px}
        .reg-req{color:#ef4444;margin-left:2px}

        /* Input fields */
        .reg-input-wrap{position:relative;margin-bottom:16px}
        .reg-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#a3a3a3;pointer-events:none;transition:color .2s}
        .reg-input{
          width:100%;padding:12px 12px 12px 42px;font-family:'DM Sans',sans-serif;font-size:14px;
          background:#fafafa;border:1px solid #e4e4e4;border-radius:12px;color:#0a0a0a;
          outline:none;transition:border-color .2s,box-shadow .2s,background .2s;
        }
        .reg-input::placeholder{color:#b0b0b0}
        .reg-input:focus{border-color:#0a0a0a;box-shadow:0 0 0 3px rgba(10,10,10,.06);background:#fff}
        .reg-input:hover:not(:focus){border-color:#c4c4c4}
        .reg-input.err{border-color:#ef4444;background:#fef2f2}
        .reg-input-wrap:focus-within .reg-icon{color:#0a0a0a}

        .reg-pass-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#a3a3a3;padding:4px;transition:color .2s}
        .reg-pass-toggle:hover{color:#0a0a0a}

        .reg-err{font-size:12px;color:#ef4444;margin-top:4px;margin-bottom:8px}

        /* Strength meter */
        .str-box{background:#fafafa;border:1px solid #e4e4e4;border-radius:12px;padding:14px;margin-top:8px;margin-bottom:16px}
        .str-bars{display:flex;gap:4px;margin-bottom:8px}
        .str-bar{height:3px;flex:1;border-radius:3px;background:#e4e4e4;transition:background .3s,box-shadow .3s}
        .str-bar.on{box-shadow:0 0 6px currentColor}
        .str-label{font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-bottom:10px}
        .str-checks{display:grid;grid-template-columns:1fr 1fr;gap:6px}
        .str-check{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:450;color:#a3a3a3}
        .str-check.pass{color:#0a0a0a}

        /* Terms */
        .terms-wrap{margin-bottom:20px}
        .terms-check{display:flex;align-items:flex-start;gap:12px;cursor:pointer}
        .terms-box{
          width:20px;height:20px;border:1.5px solid #d4d4d4;border-radius:6px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
          transition:background .2s,border-color .2s;margin-top:2px;
        }
        .terms-box.checked{background:#0a0a0a;border-color:#0a0a0a}
        .terms-box svg{color:#fafafa;opacity:0;transition:opacity .15s}
        .terms-box.checked svg{opacity:1}
        .terms-text{font-size:13px;color:#6b6b6b;line-height:1.5}
        .terms-link{color:#0a0a0a;font-weight:500;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
        .terms-link:hover{color:#3b82f6}

        .legal-panel{
          margin-top:12px;background:#fafafa;border:1px solid #e4e4e4;border-radius:12px;
          overflow:hidden;animation:termsFade .3s ease;
        }
        .legal-tabs{display:flex;border-bottom:1px solid #e4e4e4}
        .legal-tab{
          flex:1;padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;
          letter-spacing:.3px;text-transform:uppercase;color:#a3a3a3;background:none;border:none;
          cursor:pointer;transition:color .2s,background .2s;text-align:center;
        }
        .legal-tab:first-child{border-right:1px solid #e4e4e4}
        .legal-tab.active{color:#0a0a0a;background:#fff}
        .legal-tab:hover:not(.active){color:#6b6b6b;background:#f3f3f3}
        .legal-body{padding:16px;max-height:280px;overflow-y:auto}
        .legal-body pre{
          font-family:'DM Sans',sans-serif;font-size:12px;color:#6b6b6b;
          line-height:1.7;white-space:pre-wrap;word-break:break-word;margin:0;
        }
        .legal-body::-webkit-scrollbar{width:4px}
        .legal-body::-webkit-scrollbar-track{background:transparent}
        .legal-body::-webkit-scrollbar-thumb{background:#d4d4d4;border-radius:4px}
        @keyframes termsFade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}

        /* Error banner */
        .reg-error-banner{
          display:flex;align-items:center;gap:10px;padding:12px 14px;
          background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:16px;
        }
        .reg-error-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;flex-shrink:0}
        .reg-error-msg{font-size:13px;color:#ef4444;font-weight:500}

        /* Divider */
        .reg-divider{display:flex;align-items:center;gap:16px;margin:24px 0}
        .reg-divider-line{flex:1;height:1px;background:#e4e4e4}
        .reg-divider-text{font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#a3a3a3}

        /* Google */
        .reg-google-wrap{display:flex;justify-content:center;margin-bottom:4px}
        .reg-google-loading{
          width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
          padding:12px;border-radius:12px;border:1px solid #e4e4e4;color:#a3a3a3;font-size:13px;
        }

        /* Submit */
        .reg-submit{
          width:100%;padding:13px 24px;background:#0a0a0a;color:#fafafa;
          font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;
          letter-spacing:-.3px;border:none;border-radius:26px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s,opacity .2s;
        }
        .reg-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.18)}
        .reg-submit:disabled{opacity:.6;cursor:not-allowed}

        /* Footer */
        .reg-footer{text-align:center;margin-top:24px}
        .reg-footer-text{font-size:13px;color:#6b6b6b}
        .reg-footer-link{color:#0a0a0a;font-weight:600;text-decoration:none;letter-spacing:-.2px;transition:color .2s}
        .reg-footer-link:hover{color:#3b82f6}
        .reg-back{
          display:inline-flex;align-items:center;gap:6px;margin-top:18px;
          font-size:13px;color:#a3a3a3;text-decoration:none;font-weight:500;transition:color .2s;
        }
        .reg-back:hover{color:#0a0a0a}
        .reg-secure{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:14px;font-size:11px;color:#c4c4c4}

        @media(max-width:500px){
          .reg-form-wrap{padding:24px 20px;border-radius:16px}
          .str-checks{grid-template-columns:1fr}
        }
      `}</style>

      <div className="reg-page">
        <CursorEffect />

        <div className="reg-card">

          {/* Logo + Header */}
          <Link to="/" className="reg-logo">
            <img src="/logos.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            <span className="reg-lname">Nyrvexa</span>
          </Link>

          <h1 className="reg-heading">Create your <em>account.</em></h1>
          <p className="reg-sub">Start your AI-powered career journey — free.</p>

          <div className="reg-form-wrap">

            {/* Google Sign Up */}
            <div className="reg-google-wrap">
              {googleLoading ? (
                <div className="reg-google-loading">
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing up with Google...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign up failed')}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  width="400"
                  text="signup_with"
                />
              )}
            </div>

            <div className="reg-divider">
              <div className="reg-divider-line" />
              <span className="reg-divider-text">or register with email</span>
              <div className="reg-divider-line" />
            </div>

            <form onSubmit={handleSubmit}>

              {/* Name */}
              <label className="reg-label">Full Name <span className="reg-req">*</span></label>
              <div className="reg-input-wrap">
                <div className="reg-icon"><User size={16} /></div>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className={`reg-input${errors.name ? ' err' : ''}`}
                />
              </div>
              {errors.name && <p className="reg-err">{errors.name}</p>}

              {/* Email */}
              <label className="reg-label">Email address <span className="reg-req">*</span></label>
              <div className="reg-input-wrap">
                <div className="reg-icon"><Mail size={16} /></div>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@example.com"
                  className={`reg-input${errors.email ? ' err' : ''}`}
                />
              </div>
              {errors.email && <p className="reg-err">{errors.email}</p>}

              {/* Password */}
              <label className="reg-label">Password <span className="reg-req">*</span></label>
              <div className="reg-input-wrap">
                <div className="reg-icon"><Lock size={16} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  className={`reg-input${errors.password ? ' err' : ''}`}
                  style={{ paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="reg-pass-toggle">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="reg-err">{errors.password}</p>}

              {/* Strength meter */}
              {form.password && (
                <div className="str-box">
                  <div className="str-bars">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`str-bar${i <= strength.score ? ' on' : ''}`}
                        style={i <= strength.score ? {
                          background: strengthColor[strength.color]?.bar || '#e4e4e4',
                          color: strengthColor[strength.color]?.bar || '#e4e4e4',
                        } : {}}
                      />
                    ))}
                  </div>
                  <div className="str-label" style={{ color: strengthColor[strength.color]?.text || '#a3a3a3' }}>
                    {strength.label}
                  </div>
                  <div className="str-checks">
                    {checks.map(({ key, label }) => (
                      <div key={key} className={`str-check${strength.checks[key] ? ' pass' : ''}`}>
                        {strength.checks[key]
                          ? <CheckCircle size={13} color="#10b981" strokeWidth={2.5} />
                          : <XCircle size={13} color="#d4d4d4" strokeWidth={2} />
                        }
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="terms-wrap">
                <div className="terms-check" onClick={() => setAgreed(!agreed)}>
                  <div className={`terms-box${agreed ? ' checked' : ''}`}>
                    <CheckCircle size={12} strokeWidth={3} />
                  </div>
                  <span className="terms-text">
                    I agree to the Nyrvexa{' '}
                    <span className="terms-link" onClick={e => { e.stopPropagation(); setLegalTab(legalTab === 'terms' ? null : 'terms') }}>
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="terms-link" onClick={e => { e.stopPropagation(); setLegalTab(legalTab === 'privacy' ? null : 'privacy') }}>
                      Privacy Policy
                    </span>
                  </span>
                </div>
                {errors.terms && <p className="reg-err" style={{ marginLeft: 28 }}>{errors.terms}</p>}

                {legalTab && (
                  <div className="legal-panel">
                    <div className="legal-tabs">
                      <button type="button" className={`legal-tab${legalTab === 'terms' ? ' active' : ''}`} onClick={() => setLegalTab('terms')}>Terms of Service</button>
                      <button type="button" className={`legal-tab${legalTab === 'privacy' ? ' active' : ''}`} onClick={() => setLegalTab('privacy')}>Privacy Policy</button>
                    </div>
                    <div className="legal-body">
                      <pre>{legalTab === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {errors.general && (
                <div className="reg-error-banner">
                  <div className="reg-error-dot" />
                  <p className="reg-error-msg">{errors.general}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="reg-submit">
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>

            {/* Sign in link */}
            <div className="reg-divider">
              <div className="reg-divider-line" />
              <span className="reg-divider-text">Already registered?</span>
              <div className="reg-divider-line" />
            </div>
            <p className="reg-footer-text">
              Have an account?{' '}
              <Link to="/login" className="reg-footer-link">Sign in →</Link>
            </p>

          </div>

          {/* Bottom */}
          <div className="reg-footer">
            <Link to="/" className="reg-back">
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Back to homepage
            </Link>
            <div className="reg-secure">
              <Shield size={10} strokeWidth={2} />
              Secure · Encrypted · Built in India
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
