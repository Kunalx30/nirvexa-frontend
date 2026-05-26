import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, CheckCircle, X, Shield, Clock, Sparkles,
  Mic, FileText, Map, MessageSquare, ChevronRight, Lock,
} from 'lucide-react'
import CursorEffect from '../components/CursorEffect'
import { useAuth } from '../context/AuthContext'
import { initiatePayment, fetchPlans } from '../services/paymentService'
import { useUsage } from '../hooks/useUsage'

const VALUE_PILLARS = [
  {
    icon: Clock,
    title: 'Save 8–12 hours every week',
    desc: 'Stop switching between job boards, resume tools, interview apps, and salary sites. One workspace runs your entire prep loop.',
  },
  {
    icon: FileText,
    title: 'Ship interview-ready assets',
    desc: 'ATS analysis, tailored resumes, and structured roadmaps — so you apply with evidence, not guesswork.',
  },
  {
    icon: Mic,
    title: 'Practice like it is real',
    desc: 'Voice mock interviews with live scoring — Pro-only rounds that mirror HR and technical panels.',
  },
]

const STACK_COMPARE = [
  { item: 'AI career chat + coaching', stack: 'Separate subscriptions', us: 'Included in Pro' },
  { item: 'Resume ATS + builder exports', stack: 'Paid add-ons', us: 'Included in Pro' },
  { item: 'Voice interview simulator', stack: 'Often ₹500+/mo alone', us: 'Included in Pro' },
  { item: 'Salary + company intelligence', stack: 'Fragmented tools', us: 'Included in Pro' },
  { item: 'Career & skill roadmaps', stack: 'Generic courses', us: 'Personalized AI paths' },
  { item: 'Your monthly stack', stack: 'Multiple bills & logins', us: 'One Pro membership' },
]

const PRO_FEATURES = [
  'Unlimited AI career chat',
  'Unlimited ATS resume analysis',
  'Resume builder PDF exports',
  'Voice mock interviews (Pro exclusive)',
  'Unlimited career & roadmap graphs',
  'Unlimited skill match, salary & company research',
  'Premium job alerts (rolling out)',
  'Priority support',
]

const FALLBACK_PLANS = {
  monthly: { price_inr: 199, label: 'Pro Monthly', period: '/ month', badge: null, effective_monthly: null },
  yearly: {
    price_inr: 1999,
    label: 'Pro Yearly',
    period: '/ year',
    badge: 'Best value',
    effective_monthly: 166,
    savings_percent: 16,
  },
}

export default function Pricing() {
  const { user } = useAuth()
  const { isPremium, data, refresh } = useUsage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const locked = searchParams.get('locked')
  const reason = searchParams.get('reason')

  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [plans, setPlans] = useState(FALLBACK_PLANS)
  const [freeLimits, setFreeLimits] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchPlans()
      .then((res) => {
        if (res.plans) setPlans({ ...FALLBACK_PLANS, ...res.plans })
        if (res.free_limits) setFreeLimits(res.free_limits)
      })
      .catch(() => {})
  }, [])

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const activePlan = plans[selectedPlan] || FALLBACK_PLANS[selectedPlan]

  const handleCheckout = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent('/pricing')}`)
      return
    }
    setLoading(true)
    initiatePayment({
      plan: selectedPlan,
      user: { name: user.name, email: user.email, contact: user.phone || '' },
      onSuccess: async (res) => {
        setLoading(false)
        await refresh()
        showToast('success', `Welcome to Nyrvexa Pro — active until ${new Date(res.expiry).toLocaleDateString('en-IN')}`)
        setTimeout(() => navigate('/chat'), 2200)
      },
      onFailure: (msg) => {
        setLoading(false)
        if (msg !== 'Payment cancelled.') showToast('error', msg)
      },
    })
  }

  const lockMessage = locked === 'interview'
    ? 'Voice mock interviews are included with Nyrvexa Pro.'
    : locked
      ? 'Upgrade to unlock this feature.'
      : reason
        ? 'You have reached today\'s free limit. Go Pro for unlimited access.'
        : null

  const getCleanLimit = (limitVal) => {
    if (!limitVal) return 'Locked';
    const str = String(limitVal).toLowerCase();
    if (str.includes('locked') || str.includes('pro') || str.includes('only') || str.includes('—')) {
      return 'Locked';
    }
    return 'Limited';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        
        :root {
          --ink: #0a0a0a;
          --paper: #fafafa;
          --mid: #64748b;
          --line: #e2e8f0;
          --bg2: #f1f5f9;
          --yes: #10b981;
          --primary: #4f46e5;
          --primary-hover: #4338ca;
        }

        .pr {
          min-height: 100vh;
          background: var(--paper);
          color: var(--ink);
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          position: relative;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .pw {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 2.5rem;
        }

        /* NAV */
        .pr-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(250, 250, 250, 0.72);
          backdrop-filter: saturate(180%) blur(24px);
          -webkit-backdrop-filter: saturate(180%) blur(24px);
          border-bottom: 1px solid transparent;
          transition: background 0.3s, border-color 0.3s;
        }
        .pr-nav.on {
          border-color: var(--line);
          box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);
        }
        .pr-nw {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 2.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pr-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
        }
        .pr-lsq {
          width: 30px;
          height: 30px;
          background: var(--ink);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: var(--paper);
        }
        .pr-lname {
          font-size: 17px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -.4px;
        }

        /* HERO */
        .pr-hero {
          padding: 120px 2.5rem 56px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        .pr-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--ink);
          border: 1px solid var(--line);
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 24px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .pr-h1 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(40px, 6.5vw, 64px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -2.5px;
          margin-bottom: 20px;
        }
        .pr-h1 em {
          font-style: italic;
          color: #64748b;
        }
        .pr-sub {
          font-size: clamp(16px, 2vw, 19px);
          color: var(--mid);
          line-height: 1.6;
          max-width: 580px;
          margin: 0 auto 32px;
          letter-spacing: -.2px;
        }
        .pr-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 16px;
          padding: 14px 18px;
          font-size: 14px;
          color: #dc2626;
          margin: 0 auto 24px;
          text-align: left;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.03);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: none; }
        }

        /* PILLARS */
        .pr-pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 48px 0 64px;
        }
        @media(max-width:820px){.pr-pillars{grid-template-columns:1fr; gap:16px}}
        .pr-pillar {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.02);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
        }
        .pr-pillar:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.07);
        }
        .pr-picon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--bg2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          color: var(--ink);
        }
        .pr-pillar h3 {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 10px;
          letter-spacing: -.3px;
        }
        .pr-pillar p {
          font-size: 13.5px;
          color: var(--mid);
          line-height: 1.55;
        }

        /* TOGGLE */
        .pr-toggle-wrap {
          text-align: center;
          margin-bottom: 44px;
        }
        .pr-toggle {
          display: inline-flex;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 5px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
          position: relative;
        }
        .pr-toggle button {
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          background: transparent;
          color: var(--mid);
          transition: color 0.2s, background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pr-toggle button.on {
          background: var(--ink);
          color: var(--paper);
        }

        /* CARDS */
        .pr-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-bottom: 72px;
          align-items: stretch;
        }
        @media(max-width:820px){.pr-cards{grid-template-columns:1fr; gap:24px}}
        .pr-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02), 0 20px 48px rgba(0,0,0,0.04);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s, border-color 0.3s;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .pr-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.08);
        }
        .pr-card.pro {
          border-color: var(--ink);
          background: #0d0e12;
          color: #fff;
          box-shadow: 0 30px 80px rgba(13,14,18,0.18);
        }
        .pr-card.pro:hover {
          border-color: #4f46e5;
          box-shadow: 0 30px 80px rgba(79,70,229,0.15);
        }
        .pr-pop {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #4f46e5, #9333ea);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 5px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 8px 24px rgba(79,70,229,0.25);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .pr-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 16px 0 6px;
        }
        .pr-price {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 54px;
          letter-spacing: -2px;
          line-height: 1;
        }
        .pr-card.pro .pr-price {
          background: linear-gradient(120deg, #ffffff 40%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pr-period {
          font-size: 14.5px;
          color: var(--mid);
        }
        .pr-card.pro .pr-period {
          color: #94a3b8;
        }
        .pr-card.pro .pr-subhead {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 24px;
        }
        .pr-card.free .pr-subhead {
          color: var(--mid);
          font-size: 13px;
          margin-bottom: 24px;
        }
        .pr-divider {
          height: 1px;
          background: var(--line);
          margin: 24px 0;
        }
        .pr-card.pro .pr-divider {
          background: rgba(255,255,255,0.08);
        }
        .pr-features-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .pr-feat {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          margin-bottom: 12px;
          color: var(--ink);
          line-height: 1.5;
        }
        .pr-card.pro .pr-feat {
          color: #e2e8f0;
        }
        .pr-feat svg {
          flex-shrink: 0;
          margin-top: 3px;
        }
        .pr-card.free .pr-feat svg {
          color: var(--mid);
        }
        .pr-card.pro .pr-feat svg {
          color: #34d399;
        }

        .pr-cta {
          width: 100%;
          padding: 14px 24px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .pr-cta.primary {
          background: #fff;
          color: #0d0e12;
          box-shadow: 0 4px 12px rgba(255,255,255,0.05);
        }
        .pr-cta.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(79,70,229,0.3);
          background: #4f46e5;
          color: #fff;
        }
        .pr-cta:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        .pr-cta.ghost {
          background: var(--bg2);
          color: var(--mid);
          border: 1px solid var(--line);
        }
        .pr-cta.ghost:hover {
          background: var(--line);
          color: var(--ink);
        }

        /* PAY TAGS */
        .pr-pay-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 20px;
        }
        .pr-pay-tags span {
          font-size: 10.5px;
          font-weight: 500;
          border: 1px solid var(--line);
          padding: 4px 8px;
          border-radius: 6px;
          color: var(--mid);
          background: #fff;
        }
        .pr-card.pro .pr-pay-tags span {
          border-color: rgba(255,255,255,0.08);
          color: #94a3b8;
          background: rgba(255,255,255,0.03);
        }

        /* LIMIT ROWS */
        .pr-limit-row {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          padding: 10px 0;
          border-bottom: 1px solid var(--bg2);
        }
        .pr-limit-row:last-child {
          border: none;
        }

        .pr-active {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 8px 18px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 16px;
          box-shadow: 0 4px 12px rgba(4,120,87,0.05);
        }

        /* CONSOLIDATION SECTION */
        .pr-cmp {
          background: #0d0e12;
          color: #fff;
          border-radius: 28px;
          padding: 48px;
          margin-bottom: 72px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          position: relative;
          overflow: hidden;
        }
        .pr-cmp::before {
          content: '';
          position: absolute;
          top: -150px;
          right: -150px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .pr-cmp h2 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(28px, 4.5vw, 44px);
          font-weight: 400;
          margin-bottom: 12px;
          letter-spacing: -1.5px;
          line-height: 1.1;
        }
        .pr-cmp h2 em {
          font-style: italic;
          color: #a5b4fc;
        }
        .pr-cmp p {
          color: #94a3b8;
          font-size: 15px;
          max-width: 580px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        /* TABLE */
        .pr-tbl-wrap {
          overflow-x: auto;
        }
        .pr-tbl {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .pr-tbl th, .pr-tbl td {
          padding: 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          text-align: left;
        }
        .pr-tbl th {
          color: #64748b;
          font-weight: 600;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .pr-tbl td {
          color: #cbd5e1;
        }
        .pr-tbl tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .pr-tbl .us-col {
          color: #60a5fa;
          font-weight: 600;
          background: rgba(96, 165, 250, 0.03);
          border-left: 1px solid rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.03);
        }
        .pr-tbl tr:hover .us-col {
          background: rgba(96, 165, 250, 0.05);
        }

        /* Dynamic Savings pill */
        .pr-savings-alert {
          margin-top: 28px;
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.15);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #a5b4fc;
          font-size: 14.5px;
          font-weight: 500;
        }

        /* FAQS */
        .pr-faq-head {
          text-align: center;
          margin-bottom: 48px;
        }
        .pr-faq-head h2 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(28px, 4.5vw, 40px);
          font-weight: 400;
          letter-spacing: -1.5px;
        }
        .pr-faq {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          padding-bottom: 88px;
        }
        @media(max-width:820px){.pr-faq{grid-template-columns:1fr; gap:20px}}
        .pr-faq-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
          transition: transform 0.25s, border-color 0.25s;
        }
        .pr-faq-card:hover {
          transform: translateY(-2px);
          border-color: var(--ink);
        }
        .pr-faq h4 {
          font-size: 15.5px;
          font-weight: 600;
          margin-bottom: 10px;
          color: var(--ink);
          letter-spacing: -.3px;
        }
        .pr-faq p {
          font-size: 13.5px;
          color: var(--mid);
          line-height: 1.6;
        }

        /* BOTTOM CTA */
        .pr-foot-cta {
          text-align: center;
          padding-bottom: 80px;
          border-top: 1px solid var(--line);
          padding-top: 48px;
        }
      `}</style>

      <div className="pr">
        <CursorEffect />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {toast && (
            <div
              className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl text-sm font-medium text-white shadow-xl
              ${toast.type === 'success' ? 'bg-emerald-700' : 'bg-red-600'}`}
            >
              {toast.msg}
            </div>
          )}

          <header className="pr-nav on">
            <div className="pr-nw">
              <Link to="/" className="pr-logo">
                <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span className="pr-lname">Nyrvexa</span>
              </Link>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: 14, color: 'var(--mid)', textDecoration: 'none', padding: '6px 14px' }}>Home</Link>
                {user ? (
                  <Link to="/chat" style={{ fontSize: 14, fontWeight: 600, background: 'var(--ink)', color: 'var(--paper)', padding: '8px 18px', borderRadius: 22, textDecoration: 'none' }}>
                    Open app
                  </Link>
                ) : (
                  <Link to="/login" style={{ fontSize: 14, fontWeight: 600, background: 'var(--ink)', color: 'var(--paper)', padding: '8px 18px', borderRadius: 22, textDecoration: 'none' }}>
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </header>

          <section className="pr-hero">
            <span className="pr-badge">Consolidated Prep</span>
            <h1 className="pr-h1">Invest in clarity,<br /><em>not tool chaos.</em></h1>
            <p className="pr-sub">
              One simple membership replaces a scattered stack of complex career apps, saving you precious hours and bills.
            </p>

            {lockMessage && (
              <div className="pr-alert" style={{ maxWidth: 520, margin: '0 auto' }}>
                <Lock size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{lockMessage}</span>
              </div>
            )}

            {isPremium && (
              <div className="pr-active">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                Pro active — until {data?.premium_expiry ? new Date(data.premium_expiry).toLocaleDateString('en-IN') : 'renewal'}
              </div>
            )}
          </section>

          <div className="pw">
            <div className="pr-pillars">
              {VALUE_PILLARS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="pr-pillar">
                  <div className="pr-picon">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>

            <div className="pr-toggle-wrap">
              <div className="pr-toggle">
                {['monthly', 'yearly'].map((p) => (
                  <button key={p} type="button" className={selectedPlan === p ? 'on' : ''} onClick={() => setSelectedPlan(p)}>
                    {p === 'monthly' ? 'Monthly' : 'Yearly'}
                    {p === 'yearly' && activePlan?.savings_percent ? (
                      <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.8 }}>−{activePlan.savings_percent}%</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="pr-cards">
              <div className="pr-card free">
                <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--mid)', fontWeight: 600 }}>Explorer</p>
                <div className="pr-price-row">
                  <span className="pr-price">₹0</span>
                  <span className="pr-period">forever</span>
                </div>
                <p className="pr-subhead">Preview the tools with daily basic limits.</p>
                
                <div className="pr-divider" />
                
                <p className="pr-features-title">Limits & Access</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {(freeLimits.length ? freeLimits : [
                    { feature: 'AI Chat Assist', limit: '7 requests / day' },
                    { feature: 'ATS Analysis', limit: '1 resume / day' },
                    { feature: 'Voice Mock Interviews', limit: 'Pro Locked' },
                    { feature: 'PDF Tailor Exports', limit: 'Pro Locked' },
                  ]).map(({ feature, limit }) => {
                    const cleanVal = getCleanLimit(limit);
                    return (
                      <div key={feature} className="pr-limit-row">
                        <span style={{ color: 'var(--mid)' }}>{feature}</span>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: cleanVal === 'Locked' ? '#ef4444' : '#f59e0b'
                        }}>
                          {cleanVal}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button type="button" className="pr-cta ghost" disabled>
                  Current Tier
                </button>
              </div>

              <div className="pr-card pro">
                {activePlan?.badge && (
                  <span className="pr-pop"><Sparkles size={11} strokeWidth={2.5} /> {activePlan.badge}</span>
                )}
                <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: '#a5b4fc', fontWeight: 600 }}>Professional</p>
                <div className="pr-price-row">
                  <span className="pr-price">₹{activePlan?.price_inr?.toLocaleString('en-IN')}</span>
                  <span className="pr-period" style={{ color: '#94a3b8' }}>{activePlan?.period || '/ month'}</span>
                </div>
                {selectedPlan === 'yearly' && activePlan?.effective_monthly && (
                  <p className="pr-subhead" style={{ color: '#34d399', fontWeight: 650 }}>
                    Effective ₹{activePlan.effective_monthly}/mo · Billed annually
                  </p>
                )}
                {!activePlan?.effective_monthly && (
                  <p className="pr-subhead">Complete, unrestricted access to the suite.</p>
                )}

                <div className="pr-divider" />

                <p className="pr-features-title" style={{ color: '#a5b4fc' }}>Everything Unlocked</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="pr-feat">
                      <CheckCircle size={15} strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="pr-pay-tags">
                  {['UPI', 'Google Pay', 'PhonePe', 'Cards', 'Netbanking'].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>

                <button
                  type="button"
                  className="pr-cta primary"
                  onClick={handleCheckout}
                  disabled={loading || isPremium}
                >
                  {loading ? 'Opening Razorpay checkout…' : isPremium ? 'You have active Pro access' : `Upgrade to Pro — ₹${activePlan?.price_inr}`}
                </button>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#64748b', marginTop: 14 }}>
                  <Shield size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Secured by Razorpay · Tax invoice available
                </p>
              </div>
            </div>

            <section className="pr-cmp">
              <h2>Why professionals <em>consolidate here.</em></h2>
              <p>
                Consolidate separate subscriptions into a single professional account. Focus on your career growth, not multi-tab chaos.
              </p>
              <div className="pr-tbl-wrap">
                <table className="pr-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Capability</th>
                      <th>Generic Stack Cost</th>
                      <th className="us-col">Nyrvexa Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STACK_COMPARE.map((row) => (
                      <tr key={row.item}>
                        <td>{row.item}</td>
                        <td style={{ color: '#64748b' }}>{row.stack}</td>
                        <td className="us-col">{row.us}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pr-savings-alert">
                <Sparkles size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Consolidate and save:</strong> Juggling separate tools would easily cost you over <strong>₹1,500+ / month</strong>. Nyrvexa Pro consolidates your stack into one elegant workspace, saving you over <strong>85%</strong> of the cost.
                </span>
              </div>
            </section>

            <div className="pr-faq-head">
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="pr-faq">
              {[
                { q: 'Is my payment secure?', a: 'Yes. All payments are processed securely via Razorpay, which is fully PCI-DSS certified. We do not store or capture any card or UPI credentials.' },
                { q: 'Can I cancel my subscription?', a: 'All plans are one-time payments for the active duration selected. There are no sneaky automated recurring charges — you control when you want to buy.' },
                { q: 'What happens if a payment fails?', a: 'No charges will be captured. If a transaction fails, simply retry with another UPI app or card. Your account will safely remain on the Free tier.' },
              ].map(({ q, a }) => (
                <div key={q} className="pr-faq-card">
                  <h4>{q}</h4>
                  <p>{a}</p>
                </div>
              ))}
            </div>

            <div className="pr-foot-cta">
              <Link
                to="/register"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600,
                  color: 'var(--ink)', textDecoration: 'none',
                }}
              >
                Start free, upgrade when ready <ArrowRight size={16} />
              </Link>
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--mid)' }}>
                Need enterprise access? Contact <a href="mailto:team@nyrvexa.in" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>team@nyrvexa.in</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
