import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import CursorEffect from '../components/CursorEffect'
import {
  MessageSquare, Briefcase, FileText, Map, Mic, Newspaper,
  ArrowRight, CheckCircle, X, Minus, ChevronRight,
  Shield, Globe, Scissors, Building2, DollarSign,
  Lock, Sparkles, Mail, GitBranch,
} from 'lucide-react'

/* ─── DATA ─────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: MessageSquare, title: 'Hybrid AI Chat', desc: 'Multiple frontier AI models intelligently routed to the best fit for every query you ask.', tag: 'Core' },
  { icon: Briefcase, title: 'Real Job Listings', desc: 'Live roles from top portals aggregated and deduplicated, with direct apply links.', tag: 'Live' },
  { icon: FileText, title: 'Resume Analyzer', desc: 'Instant ATS score, keyword gap report, and section-by-section improvement suggestions on your PDF.', tag: 'AI' },
  { icon: Scissors, title: 'Resume Tailor', desc: 'Paste a job description — get your resume rewritten to match it and beat the ATS, every time.', tag: 'New' },
  { icon: Map, title: 'Career Path AI', desc: 'Skill gap analysis and a week-by-week learning roadmap from your current role to your target.', tag: 'AI' },
  { icon: GitBranch, title: 'Interactive Roadmaps', desc: 'Explore role-based skill trees — stages, topics, and resources in one visual graph you can export.', tag: 'Pro' },
  { icon: Mic, title: 'Voice Interview AI', desc: 'Full mock rounds with live scoring — HR, technical, and stress modes. Included with Nyrvexa Pro.', tag: 'Pro' },
  { icon: Building2, title: 'Company Research', desc: 'Culture signals, funding stage, recent news, interview difficulty, and insider Q&A for any company.', tag: 'New' },
  { icon: DollarSign, title: 'Salary Insights', desc: 'Real compensation data by role, city, experience and company — negotiate with numbers, not guesses.', tag: 'New' },
  { icon: Newspaper, title: 'Tech & Career News', desc: 'Premium publications aggregated and AI-summarised — stay sharp in under 60 seconds a day.', tag: 'Curated' },
]

const COMPARISON = [
  { feature: 'AI Career Chat', us: true, a: false, b: false, c: false },
  { feature: 'Resume ATS Analyzer', us: true, a: false, b: false, c: true },
  { feature: 'Resume Tailor per JD', us: true, a: false, b: false, c: false },
  { feature: 'Voice Interview Coach', us: true, a: false, b: false, c: false },
  { feature: 'Career Roadmap AI', us: true, a: false, b: false, c: false },
  { feature: 'Interactive Roadmap Graph', us: true, a: false, b: false, c: false },
  { feature: 'Company Deep Research', us: true, a: 'partial', b: false, c: false },
  { feature: 'Salary Intelligence', us: true, a: 'partial', b: 'partial', c: false },
  { feature: 'Live Job Aggregation', us: true, a: true, b: true, c: false },
  { feature: 'Curated Career News', us: true, a: false, b: false, c: false },
  { feature: 'Free Tier Available', us: true, a: 'partial', b: true, c: 'partial' },
]

const STATS = [
  { display: 'Full suite', label: 'Career operating system', note: 'One platform, every stage' },
  { display: 'Pro-grade', label: 'AI intelligence', note: 'Built for serious job seekers' },
  { display: 'Instant', label: 'Resume & roadmap insights', note: 'Actionable in minutes' },
  { display: '24/7', label: 'Practice & prep', note: 'Interview when you are ready' },
]

const STEPS = [
  { n: '01', title: 'Create your profile', desc: 'Sign up and set your current role, skills, and target position in under two minutes.' },
  { n: '02', title: 'Get your action plan', desc: 'AI maps your skill gaps, tailors your resume, and queues your interview prep automatically.' },
  { n: '03', title: 'Execute and land it', desc: 'Apply with confidence, practice your answers, and negotiate your salary with real data.' },
]

const FREE_LIMITS = [
  { feature: 'AI Career Chat', free: 'Limited', pro: 'Unlimited' },
  { feature: 'Resume Analyzer', free: 'Limited', pro: 'Unlimited' },
  { feature: 'Resume Builder PDF', free: 'Locked', pro: 'Unlimited exports' },
  { feature: 'Voice Interview AI', free: 'Locked', pro: 'Unlimited mock rounds' },
  { feature: 'Career Roadmap', free: 'Limited', pro: 'Unlimited' },
  { feature: 'Skill Match', free: 'Limited', pro: 'Unlimited' },
  { feature: 'Salary Insights', free: 'Limited', pro: 'Unlimited' },
  { feature: 'Company Research', free: 'Limited', pro: 'Unlimited' },
  { feature: 'Job Alerts', free: 'Locked', pro: 'Included' },
  { feature: 'Priority Support', free: 'Locked', pro: '24/7 priority' },
]

const PRICE_COMPARE = [
  { feature: 'AI Career Chat', us: '✦ Included in Pro', a: 'Separate subscription', b: 'Separate subscription' },
  { feature: 'Resume ATS + Builder', us: '✦ Included in Pro', a: 'Paid add-ons', b: 'Limited free tier' },
  { feature: 'Voice Interview Coach', us: '✦ Pro exclusive', a: 'Not offered', b: 'Premium tier only' },
  { feature: 'Salary Intelligence', us: '✦ Included in Pro', a: 'Partial / paid', b: 'Partial / paid' },
  { feature: 'Roadmap Graph + Career Path', us: '✦ Included in Pro', a: 'Generic courses', b: '—' },
  { feature: 'Your monthly stack', us: 'One Pro membership', a: 'Multiple tools & logins', b: 'Multiple tools & logins' },
]

/* ─── HOOKS ─────────────────────────────────────────────────────── */

function useFade(threshold = 0.1) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); o.disconnect() } },
      { threshold }
    )
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [threshold])
  return [ref, on]
}

function useCountUp(end, duration = 2000, trigger = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, trigger])
  return value
}

function AnimatedStat({ display, end, suffix = '', prefix = '', label, note, trigger }) {
  const val = useCountUp(end ?? 0, 2000, trigger && end != null)
  const formatted = end != null
    ? (end >= 1000 ? `${(val / 1000).toFixed(val >= end ? 0 : 1)}K` : val)
    : null
  const shown = display ?? `${prefix || ''}${formatted}${suffix || ''}`
  return (
    <div className="stat-cell">
      <div className="sv">{shown}</div>
      <div className="sl">{label}</div>
      <div className="sn">{note}</div>
    </div>
  )
}

/* ─── CHAT PREVIEW ──────────────────────────────────────────────── */

function ChatPreview() {
  const msg = 'How to become an AI engineer in 2026?'
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (phase === 0) {
      if (typed.length < msg.length) {
        const t = setTimeout(() => setTyped(msg.slice(0, typed.length + 1)), 30)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase(1), 700)
        return () => clearTimeout(t)
      }
    }
  }, [typed, phase, msg])

  const chips = ['Master PyTorch/JAX', 'Build 3 LLM agents', 'Understand transformers', '12-week roadmap ready']

  return (
    <div className="cp">
      <div className="cp-bar">
        <span className="dot r" /><span className="dot y" /><span className="dot g" />
        <span className="cp-title">Nyrvexa · Career Roadmap AI</span>
        <span className="cp-live">● Live</span>
      </div>
      <div className="cp-body">
        <div className="cp-user-row">
          <div className="av">K</div>
          <div className="bub-user">{typed}{phase === 0 && <span className="cursor">|</span>}</div>
        </div>
        {phase === 1 && (
          <div className="cp-ai-row fade-up">
            <div className="ai-icon">✦</div>
            <div className="bub-ai">
              <p className="ai-head">AI Engineer 2026 Roadmap generated</p>
              <div className="chip-row">
                {chips.map((c, i) => (
                  <span key={c} className="chip" style={{ animationDelay: `${i * 90}ms` }}>
                    <CheckCircle size={10} strokeWidth={2.5} />{c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="cp-foot">
        <span className="ph">Ask anything about your career…</span>
        <button className="send-btn" aria-label="Send">↑</button>
      </div>
    </div>
  )
}

/* ─── COMPARISON ICON ───────────────────────────────────────────── */

function Ci({ v }) {
  if (v === true) return <span className="c-yes"><CheckCircle size={15} strokeWidth={2.5} /></span>
  if (v === false) return <span className="c-no"><X size={14} strokeWidth={2.5} /></span>
  if (v === 'partial') return <span className="c-part"><Minus size={14} strokeWidth={2.5} /></span>
  return null
}

/* ─── LANDING ───────────────────────────────────────────────────── */

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [heroRef, heroOn] = useFade(0.05)
  const [statRef, statOn] = useFade(0.2)
  const [featRef, featOn] = useFade(0.08)
  const [cmpRef, cmpOn] = useFade(0.05)
  const [vRef, vOn] = useFade(0.1)
  const [stepRef, stepOn] = useFade(0.1)
  const [ctaRef, ctaOn] = useFade(0.15)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}

        :root{
          --ink:#0a0a0a; --paper:#fafafa; --mid:#6b6b6b;
          --line:#e4e4e4; --bg2:#f3f3f3;
          --yes:#16a34a; --no:#c4c4c4; --part:#d97706;
        }

        .land{
          min-height:100vh; background:var(--paper); color:var(--ink);
          font-family:'DM Sans',system-ui,sans-serif;
          overflow-x:hidden; -webkit-font-smoothing:antialiased;
        }

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:200;transition:background .35s,border-color .35s,box-shadow .35s;border-bottom:1px solid transparent}
        .nav.on{background:rgba(250,250,250,.72);backdrop-filter:saturate(180%) blur(24px);-webkit-backdrop-filter:saturate(180%) blur(24px);border-color:var(--line);box-shadow:0 1px 12px rgba(0,0,0,.04)}
        .nw{max-width:1160px;margin:0 auto;padding:0 2.5rem;height:60px;display:flex;align-items:center;justify-content:space-between}
        .logo{display:flex;align-items:center;gap:9px;text-decoration:none}
        .lsq{width:28px;height:28px;background:var(--ink);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--paper);letter-spacing:-.5px}
        .lname{font-size:16px;font-weight:600;color:var(--ink);letter-spacing:-.4px}
        .nr{display:flex;align-items:center;gap:6px}
        .nl{font-size:14px;font-weight:450;color:var(--mid);text-decoration:none;padding:6px 14px;border-radius:20px;transition:color .2s,background .2s}
        .nl:hover{color:var(--ink);background:var(--bg2)}
        .nc{font-size:14px;font-weight:600;background:var(--ink);color:var(--paper);padding:8px 20px;border-radius:22px;text-decoration:none;letter-spacing:-.2px;transition:opacity .2s,transform .2s}
        .nc:hover{opacity:.82;transform:translateY(-1px)}

        /* WRAP & FADE */
        .w{max-width:1160px;margin:0 auto;padding:0 2.5rem}
        .fs{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
        .fs.on{opacity:1;transform:none}

        /* HERO */
        .hero{padding:148px 2.5rem 0;max-width:1160px;margin:0 auto;text-align:center;position:relative;z-index:1}
        .hero-sub{font-size:14px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--mid);margin-bottom:28px}
        .h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(48px,8vw,96px);font-weight:400;line-height:.95;letter-spacing:-3px;color:var(--ink);margin-bottom:32px}
        .h1 em{font-style:italic;color:var(--mid)}
        .hsub{font-size:clamp(16px,2vw,19px);color:var(--mid);max-width:520px;margin:0 auto 44px;line-height:1.6;font-weight:400;letter-spacing:-.2px}
        .hbtns{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:68px}

        /* BUTTONS */
        .bb{display:inline-flex;align-items:center;gap:7px;background:var(--ink);color:var(--paper);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;letter-spacing:-.3px;padding:13px 28px;border-radius:26px;text-decoration:none;transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s}
        .bb:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.18)}
        .bo{display:inline-flex;align-items:center;gap:7px;background:transparent;color:var(--ink);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;padding:12px 22px;border-radius:26px;text-decoration:none;border:1px solid var(--line);transition:border-color .2s,background .2s,transform .25s,box-shadow .25s}
        .bo:hover{border-color:var(--ink);background:var(--paper);transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.07)}
        .bw{display:inline-flex;align-items:center;gap:7px;background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;letter-spacing:-.3px;padding:13px 28px;border-radius:26px;text-decoration:none;transition:opacity .2s,transform .22s}
        .bw:hover{opacity:.88;transform:translateY(-2px)}
        .bwo{display:inline-flex;align-items:center;gap:7px;background:transparent;color:rgba(255,255,255,.6);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;padding:12px 22px;border-radius:26px;text-decoration:none;border:1px solid rgba(255,255,255,.15);transition:border-color .2s,color .2s}
        .bwo:hover{border-color:rgba(255,255,255,.4);color:var(--paper)}

        /* CHAT PREVIEW */
        .cp{max-width:580px;margin:0 auto;background:var(--paper);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.04),0 24px 64px rgba(0,0,0,.09);transition:transform .5s cubic-bezier(.4,0,.2,1),box-shadow .5s}
        .cp:hover{transform:translateY(-6px) scale(1.008);box-shadow:0 16px 40px rgba(0,0,0,.08),0 40px 80px rgba(0,0,0,.12)}
        .cp-bar{display:flex;align-items:center;gap:6px;padding:11px 16px;border-bottom:1px solid var(--bg2);background:var(--bg2)}
        .dot{width:11px;height:11px;border-radius:50%;display:inline-block}
        .dot.r{background:#ff5f57}.dot.y{background:#febc2e}.dot.g{background:#28c840}
        .cp-title{font-size:12px;font-weight:500;color:var(--mid);margin-left:6px;flex:1;text-align:center;letter-spacing:.1px}
        .cp-live{font-size:11px;color:var(--yes);font-weight:500}
        .cp-body{padding:20px 18px;display:flex;flex-direction:column;gap:16px;min-height:130px}
        .cp-user-row{display:flex;align-items:flex-start;gap:10px;justify-content:flex-end}
        .av{width:28px;height:28px;border-radius:50%;background:var(--ink);color:var(--paper);font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;order:2}
        .bub-user{background:var(--ink);color:var(--paper);font-size:14px;line-height:1.5;padding:10px 14px;border-radius:14px 14px 4px 14px;max-width:82%}
        .cursor{animation:blink .75s step-end infinite}
        @keyframes blink{50%{opacity:0}}
        .cp-ai-row{display:flex;align-items:flex-start;gap:10px}
        .ai-icon{width:28px;height:28px;border-radius:50%;background:var(--bg2);border:1px solid var(--line);font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--ink)}
        .bub-ai{background:var(--bg2);border:1px solid var(--line);padding:12px 14px;border-radius:14px 14px 14px 4px;max-width:85%}
        .ai-head{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:10px}
        .chip-row{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
        .chip{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;color:var(--ink);background:var(--paper);border:1px solid var(--line);padding:3px 9px;border-radius:20px;opacity:0;animation:slideUp .4s ease forwards}
        @keyframes slideUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        .ai-foot{font-size:10px;color:var(--no);display:flex;gap:5px;align-items:center}
        .sep{color:var(--line)}
        .cp-foot{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-top:1px solid var(--bg2);background:var(--bg2)}
        .ph{font-size:13px;color:var(--no)}
        .send-btn{width:26px;height:26px;border-radius:50%;background:var(--ink);color:var(--paper);border:none;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center}
        .fade-up{animation:fadeUp .45s ease forwards}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        /* DIVIDER */
        hr{border:none;border-top:1px solid var(--line)}

        /* STATS */
        .stat-row{display:grid;grid-template-columns:repeat(4,1fr);padding:64px 0}
        .stat-cell{text-align:center;padding:0 20px;border-right:1px solid var(--line)}
        .stat-cell:last-child{border-right:none}
        .sv{font-family:'DM Serif Display',serif;font-size:clamp(36px,5vw,54px);letter-spacing:-2px;color:var(--ink);line-height:1;margin-bottom:6px}
        .sl{font-size:14px;font-weight:500;color:var(--ink);margin-bottom:3px}
        .sn{font-size:12px;color:var(--mid)}

        /* SECTION HEADER */
        .badge{display:inline-block;font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:var(--mid);margin-bottom:14px}
        .sh2{font-family:'DM Serif Display',serif;font-size:clamp(32px,5vw,52px);letter-spacing:-1.5px;color:var(--ink);line-height:1.05;margin-bottom:14px}
        .sh2 em{font-style:italic;color:var(--mid)}
        .ssub{font-size:17px;color:var(--mid);font-weight:400;line-height:1.6;letter-spacing:-.2px;max-width:440px}

        /* FEATURES */
        .feat-sec{padding:96px 0}
        .feat-hd{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:52px;flex-wrap:wrap;gap:24px}
        .see-link{display:flex;align-items:center;gap:5px;font-size:14px;font-weight:500;color:var(--ink);text-decoration:none;transition:gap .2s}
        .see-link:hover{gap:9px}
        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--paper)}
        .fc{padding:28px 24px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);transition:background .25s,transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s;position:relative;z-index:1}
        .fc:hover{background:var(--paper);transform:translateY(-4px) scale(1.02);box-shadow:0 16px 48px rgba(0,0,0,.1);z-index:10;border-radius:16px}
        .fc:nth-child(3n){border-right:none}
        .fc:nth-last-child(-n+3){border-bottom:none}
        .ftag{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--mid);border:1px solid var(--line);padding:3px 8px;border-radius:6px;margin-bottom:16px}
        .ftag.nt{color:var(--ink);border-color:var(--ink)}
        .ficon{margin-bottom:14px;color:var(--ink)}
        .ftitle{font-size:17px;font-weight:600;color:var(--ink);margin-bottom:8px;letter-spacing:-.4px}
        .fdesc{font-size:13px;color:var(--mid);line-height:1.65}

        /* COMPARISON */
        .cmp-sec{padding:96px 0;background:#0a0a0a;position:relative;z-index:10}
        .cmp-sec .badge{color:rgba(255,255,255,.3)}
        .cmp-sec .sh2{color:#fafafa}
        .cmp-sec .sh2 em{color:rgba(255,255,255,.3)}
        .cmp-sec .ssub{color:rgba(255,255,255,.4)}
        .disclaimer{font-size:11px;color:rgba(255,255,255,.2);margin-top:10px;line-height:1.5;max-width:600px}
        .tbl-wrap{overflow-x:auto;margin-top:48px}
        .tbl{width:100%;border-collapse:collapse;font-size:14px}
        .tbl th{padding:14px 20px;text-align:center;font-size:13px;font-weight:600;letter-spacing:-.2px;color:rgba(255,255,255,.4);border-bottom:1px solid rgba(255,255,255,.07)}
        .tbl th:first-child{text-align:left;color:rgba(255,255,255,.25);font-weight:400}
        .tbl th.us{color:#0a0a0a;background:#fafafa;border-radius:10px 10px 0 0}
        .tbl td{padding:12px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,.05);color:rgba(255,255,255,.6);transition:background .15s}
        .tbl td:first-child{text-align:left;font-weight:450;color:rgba(255,255,255,.6)}
        .tbl tr:last-child td{border-bottom:none}
        .tbl td.us{background:rgba(255,255,255,.04)}
        .tbl tr:hover td{background:rgba(255,255,255,.02)}
        .tbl tr:hover td.us{background:rgba(255,255,255,.07)}
        .c-yes{color:#4ade80;display:flex;justify-content:center}
        .c-no{color:rgba(255,255,255,.15);display:flex;justify-content:center}
        .c-part{color:#fbbf24;display:flex;justify-content:center}
        .us-wrap{display:flex;flex-direction:column;align-items:center;gap:4px}
        .us-b{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a;background:#fafafa;padding:2px 8px;border-radius:8px}
        .legend{display:flex;align-items:center;gap:20px;margin-top:22px;flex-wrap:wrap}
        .leg{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,.3)}

        /* VOICE */
        .v-sec{padding:96px 0;border-top:1px solid var(--line)}
        .v-in{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .v-vis{display:flex;flex-direction:column;align-items:center;gap:24px}
        .rings{position:relative;width:160px;height:160px;display:flex;align-items:center;justify-content:center}
        .ring{position:absolute;border-radius:50%;border:1px solid var(--line);animation:rp 3s ease-in-out infinite}
        .ring-1{width:160px;height:160px;animation-delay:0s}
        .ring-2{width:118px;height:118px;animation-delay:.3s}
        @keyframes rp{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
        .mbtn{width:70px;height:70px;border-radius:50%;background:var(--ink);color:var(--paper);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,.18)}
        .bars{display:flex;align-items:center;gap:4px;height:44px}
        .bar{width:3px;border-radius:2px;background:var(--ink);animation:bp 1s ease-in-out infinite alternate}
        @keyframes bp{from{height:8px;opacity:.15}to{height:var(--h);opacity:.85}}
        .vchips{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
        .vchip{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--ink);border:1px solid var(--line);padding:7px 14px;border-radius:20px;background:var(--paper)}

        /* STEPS */
        .st-sec{padding:96px 0;background:var(--bg2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
        .st-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--paper);margin-top:52px}
        .stc{padding:36px 30px;border-right:1px solid var(--line);transition:background .25s,transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s;position:relative;z-index:1}
        .stc:last-child{border-right:none}
        .stc:hover{background:var(--paper);transform:translateY(-4px) scale(1.02);box-shadow:0 16px 48px rgba(0,0,0,.1);z-index:10;border-radius:16px}
        .stn{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--line);margin-bottom:22px}
        .stt{font-family:'DM Serif Display',serif;font-size:22px;letter-spacing:-.5px;color:var(--ink);margin-bottom:10px}
        .std{font-size:14px;color:var(--mid);line-height:1.65}

        /* CTA */
        .cta-sec{padding:96px 0}
        .cta-c{background:var(--ink);border-radius:24px;padding:88px 40px;text-align:center;position:relative;overflow:hidden;transition:transform .4s,box-shadow .4s}
        .cta-c:hover{transform:translateY(-4px);box-shadow:0 24px 64px rgba(0,0,0,.2)}
        .cta-h{font-family:'DM Serif Display',serif;font-size:clamp(36px,6vw,68px);letter-spacing:-2px;color:var(--paper);line-height:1;margin-bottom:18px}
        .cta-h em{font-style:italic;color:rgba(255,255,255,.35)}
        .cta-s{font-size:17px;color:rgba(255,255,255,.4);max-width:420px;margin:0 auto 40px;line-height:1.6;letter-spacing:-.2px}
        .cta-btns{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
        .cta-note{margin-top:18px;font-size:12px;color:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;gap:5px}

        /* FOOTER PRO */
        .foot-pro{border-top:1px solid var(--line);padding:64px 0 32px;background:var(--paper)}
        .foot-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
        .foot-brand{max-width:260px}
        .foot-desc{font-size:13px;color:var(--mid);line-height:1.65;margin-bottom:18px}
        .foot-social{display:flex;gap:10px}
        .foot-slink{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--mid);text-decoration:none;transition:color .2s,border-color .2s,background .2s}
        .foot-slink:hover{color:var(--ink);border-color:var(--ink);background:var(--bg2)}
        .foot-col{display:flex;flex-direction:column;gap:10px}
        .foot-colh{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:4px;letter-spacing:-.2px}
        .foot-link{font-size:13px;color:var(--mid);text-decoration:none;transition:color .2s}
        .foot-link:hover{color:var(--ink)}
        .foot-bottom{border-top:1px solid var(--line);padding-top:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .foot-copy{font-size:12px;color:var(--mid)}
        .foot-loc{font-size:12px;color:var(--mid);display:flex;align-items:center;gap:5px}

        /* PRICING */
        .pricing-sec{padding:96px 0;border-top:1px solid var(--line)}
        .price-cards{display:grid;grid-template-columns:1fr 1fr;gap:28px;max-width:820px;margin:0 auto;align-items:stretch}
        .price-card{border:1px solid var(--line);border-radius:24px;padding:36px;background:#fff;position:relative;transition:transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s,border-color .3s;display:flex;flex-direction:column;height:100%;box-shadow:0 4px 6px rgba(0,0,0,.02),0 20px 48px rgba(0,0,0,.04)}
        .price-card:hover{transform:translateY(-4px);box-shadow:0 24px 60px rgba(0,0,0,.08)}
        .price-card.pro{border-color:#0d0e12;background:#0d0e12;color:#fff;box-shadow:0 30px 80px rgba(13,14,18,.18)}
        .price-card.pro:hover{border-color:#4f46e5;box-shadow:0 30px 80px rgba(79,70,229,.15)}
        .lp-pop{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#4f46e5,#9333ea);color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 16px;border-radius:20px;display:flex;align-items:center;gap:5px;box-shadow:0 8px 24px rgba(79,70,229,.25);border:1px solid rgba(255,255,255,.15);white-space:nowrap}
        .lp-tier{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;color:var(--mid);margin-bottom:0}
        .price-card.pro .lp-tier{color:#a5b4fc}
        .lp-price-row{display:flex;align-items:baseline;gap:8px;margin:16px 0 6px}
        .lp-price{font-family:'DM Serif Display',Georgia,serif;font-size:54px;letter-spacing:-2px;line-height:1;color:var(--ink)}
        .price-card.pro .lp-price{background:linear-gradient(120deg,#ffffff 40%,#c7d2fe 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp-period{font-size:14.5px;color:var(--mid)}
        .price-card.pro .lp-period{color:#94a3b8}
        .lp-subhead{color:var(--mid);font-size:13px;margin-bottom:24px}
        .price-card.pro .lp-subhead{color:#94a3b8}
        .lp-divider{height:1px;background:var(--line);margin:24px 0}
        .price-card.pro .lp-divider{background:rgba(255,255,255,.08)}
        .lp-sec-title{font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;color:var(--ink)}
        .price-card.pro .lp-sec-title{color:#a5b4fc}
        .lp-limit-row{display:flex;justify-content:space-between;font-size:13.5px;padding:10px 0;border-bottom:1px solid var(--bg2)}
        .lp-limit-row:last-child{border:none}
        .lp-limit-name{color:var(--mid)}
        .lp-badge.locked{color:#ef4444;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.5px}
        .lp-badge.limited{color:#f59e0b;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.5px}
        .lp-feat-item{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;margin-bottom:12px;color:#e2e8f0;line-height:1.5}
        .lp-feat-item svg{flex-shrink:0;margin-top:3px;color:#34d399}
        .lp-pay-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:20px}
        .lp-pay-tags span{font-size:10.5px;font-weight:500;border:1px solid rgba(255,255,255,.08);padding:4px 8px;border-radius:6px;color:#94a3b8;background:rgba(255,255,255,.03)}
        .lp-cta{width:100%;padding:14px 24px;border-radius:16px;font-size:15px;font-weight:600;border:none;cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);margin-top:auto;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-family:'DM Sans',sans-serif;letter-spacing:-.2px}
        .lp-cta.primary{background:#fff;color:#0d0e12;box-shadow:0 4px 12px rgba(255,255,255,.05)}
        .lp-cta.primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(79,70,229,.3);background:#4f46e5;color:#fff}
        .lp-cta.ghost{background:var(--bg2);color:var(--mid);border:1px solid var(--line);opacity:.6;pointer-events:none}

        /* PRICE COMPARISON */
        .pcmp-sec{padding:96px 0;background:#0a0a0a;position:relative;z-index:10;border-top:1px solid #262626}
        .pcmp-sec .badge{color:rgba(255,255,255,.3)}
        .pcmp-sec .sh2{color:#fafafa}
        .pcmp-sec .sh2 em{color:rgba(255,255,255,.3)}
        .pcmp-sec .ssub{color:rgba(255,255,255,.4)}
        .ptbl{width:100%;border-collapse:collapse;font-size:14px;background:#141414;border:1px solid #262626;border-radius:14px;overflow:hidden}
        .ptbl th{padding:14px 20px;text-align:center;font-size:13px;font-weight:600;color:#9ca3af;border-bottom:1px solid #262626;background:#141414}
        .ptbl th:first-child{text-align:left;font-weight:500}
        .ptbl th.us-col{color:#0a0a0a;background:#fafafa}
        .ptbl td{padding:12px 20px;text-align:center;border-bottom:1px solid #262626;color:#9ca3af}
        .ptbl td:first-child{text-align:left;font-weight:450;color:#fafafa}
        .ptbl td.us-col{color:#16a34a;font-weight:600;background:rgba(255,255,255,.04)}
        .ptbl tr:last-child td{border-bottom:none}
        .ptbl .total-row td{font-weight:700;border-top:2px solid #262626;font-size:15px}
        .ptbl .total-row td.us-col{color:#fafafa;font-size:18px}
        .ptbl .total-row td:nth-child(3),.ptbl .total-row td:nth-child(4){color:#dc2626;text-decoration:line-through;opacity:.6}

        /* RESPONSIVE */
        @media(max-width:900px){
          .stat-row{grid-template-columns:repeat(2,1fr);gap:40px}
          .stat-cell{border-right:none}
          .feat-grid{grid-template-columns:repeat(2,1fr)}
          .fc:nth-child(3n){border-right:1px solid var(--line)}
          .fc:nth-child(2n){border-right:none}
          .v-in{grid-template-columns:1fr;gap:48px}
          .st-grid{grid-template-columns:1fr}
          .stc{border-right:none;border-bottom:1px solid var(--line)}
          .stc:last-child{border-bottom:none}
          .price-cards{grid-template-columns:1fr;max-width:420px}
          .foot-top{grid-template-columns:1fr 1fr;gap:32px}
        }
        @media(max-width:600px){
          .hero{padding:116px 1.5rem 0}
          .w{padding:0 1.5rem}
          .nw{padding:0 1.5rem}
          .feat-grid{grid-template-columns:1fr}
          .fc:nth-child(n){border-right:none;border-bottom:1px solid var(--line)}
          .fc:last-child{border-bottom:none}
          .feat-hd{flex-direction:column;align-items:flex-start}
          .cta-c{padding:56px 24px}
          .h1{letter-spacing:-2px}
          .foot-top{grid-template-columns:1fr}
        }
      `}</style>

      <div className="land">
        <CursorEffect />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* NAV */}
        <nav className={`nav${scrolled ? ' on' : ''}`}>
          <div className="nw">
            <Link to="/" className="logo">
              <img src="/logo.png" alt="Logo" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <span className="lname">Nyrvexa</span>
            </Link>
            <div className="nr">
              <Link to="/pricing" className="nl">Pricing</Link>
              <Link to="/login" className="nl">Sign In</Link>
              <Link to="/register" className="nc">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section ref={heroRef} className={`hero fs${heroOn ? ' on' : ''}`}>
          <p className="hero-sub">Built for modern professionals.</p>

          <h1 className="h1">
            The intelligent platform<br /><em>for your</em> next career move.
          </h1>

          <p className="hsub">
            AI-powered resume optimization, interview coaching, salary intelligence,
            and company research — unified in one seamless experience.
          </p>

          <div className="hbtns">
            <Link to="/register" className="bb">
              Start for free <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link to="/login" className="bo">
              See the platform <ChevronRight size={15} strokeWidth={2} />
            </Link>
          </div>

          <ChatPreview />
          <div style={{ paddingBottom: 80 }} />
        </section>



        <hr />

        {/* STATS */}
        <div ref={statRef} className={`fs${statOn ? ' on' : ''}`}>
          <div className="w">
            <div className="stat-row">
              {STATS.map(({ display, end, suffix, prefix, label, note }) => (
                <AnimatedStat key={label} display={display} end={end} suffix={suffix} prefix={prefix || ''} label={label} note={note} trigger={statOn} />
              ))}
            </div>
          </div>
        </div>

        <hr />

        {/* FEATURES */}
        <div ref={featRef} className={`feat-sec fs${featOn ? ' on' : ''}`}>
          <div className="w">
            <div className="feat-hd">
              <div>
                <span className="badge">Platform</span>
                <h2 className="sh2">Ten tools.<br /><em>One suite.</em></h2>
                <p className="ssub">Built to take you from scattered job hunting to a clear, confident career path.</p>
              </div>
              <Link to="/register" className="see-link">
                Explore all <ChevronRight size={14} strokeWidth={2} />
              </Link>
            </div>

            <div className="feat-grid">
              {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
                <div key={title} className="fc">
                  <div className={`ftag${tag === 'New' ? ' nt' : ''}`}>{tag}</div>
                  <div className="ficon"><Icon size={22} strokeWidth={1.5} /></div>
                  <div className="ftitle">{title}</div>
                  <p className="fdesc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROADMAP GRAPH */}
        <div className="w" style={{ padding: '64px 0' }}>
          <div>
            <span className="badge">Roadmap Graph</span>
            <h2 className="sh2" style={{ marginTop: 12 }}>See the full path <em>before you start.</em></h2>
            <p className="ssub" style={{ marginBottom: 28, maxWidth: 520 }}>
              Interactive skill trees for dozens of roles — expand topics, filter resources, and export when you are ready.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/roadmap-graph" className="bb" style={{ display: 'inline-flex' }}>
                Explore roadmaps <ArrowRight size={15} />
              </Link>
              <Link to="/career" className="bo" style={{ display: 'inline-flex' }}>
                Career path AI <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        <hr />

        {/* COMPARISON */}
        <div ref={cmpRef} className={`cmp-sec fs${cmpOn ? ' on' : ''}`}>
          <div className="w">
            <span className="badge">Why Nyrvexa</span>
            <h2 className="sh2">See how we <em>compare.</em></h2>
            <p className="ssub">We're not replacing any single tool — we're replacing all of them.</p>
            <p className="disclaimer">
              ✱ Comparison based on publicly known product offerings as of 2025–26. "Partial" indicates limited or paid-only access.
              Column headers are generic categories, not specific company names. All trademarks belong to their respective owners.
              This is provided for informational purposes only.
            </p>

            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: '32%' }}>Feature</th>
                    <th className="us">
                      <div className="us-wrap">
                        <span className="us-b">✦ Nyrvexa</span>
                      </div>
                    </th>
                    <th>Job Boards</th>
                    <th>Job Portals</th>
                    <th>Resume Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map(({ feature, us, a, b, c }) => (
                    <tr key={feature}>
                      <td>{feature}</td>
                      <td className="us"><Ci v={us} /></td>
                      <td><Ci v={a} /></td>
                      <td><Ci v={b} /></td>
                      <td><Ci v={c} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="legend">
              <div className="leg"><CheckCircle size={13} color="#4ade80" strokeWidth={2.5} /> Available</div>
              <div className="leg"><X size={13} color="rgba(255,255,255,.15)" strokeWidth={2.5} /> Not available</div>
              <div className="leg"><Minus size={13} color="#fbbf24" strokeWidth={2.5} /> Partial / paid only</div>
            </div>
          </div>
        </div>

        {/* VOICE */}
        <div ref={vRef} className={`v-sec fs${vOn ? ' on' : ''}`}>
          <div className="w">
            <div className="v-in">
              <div className="v-vis">
                <div className="rings">
                  <div className="ring ring-1" />
                  <div className="ring ring-2" />
                  <div className="mbtn"><Mic size={28} strokeWidth={1.5} /></div>
                </div>
                <div className="bars">
                  {[22, 34, 18, 42, 28, 36, 16, 44, 30, 20, 40, 26, 32, 14, 44].map((h, i) => (
                    <div key={i} className="bar" style={{ '--h': `${h}px`, animationDelay: `${i * 75}ms`, animationDuration: `${0.75 + (i % 4) * 0.13}s` }} />
                  ))}
                </div>
              </div>
              <div>
                <span className="badge">Voice Interview AI</span>
                <h2 className="sh2" style={{ fontSize: 'clamp(28px,3.5vw,42px)' }}>
                  Practice until<br /><em>it's effortless.</em>
                </h2>
                <p className="ssub" style={{ marginBottom: 24 }}>
                  A conversational AI conducts full mock rounds — HR, technical, case study — listens to your spoken answers, and scores you on content, clarity, and depth. Immediately.
                </p>
                <div className="vchips">
                  {['HR & Technical Rounds', 'Adaptive Follow-ups', 'Live Transcripts', 'Instant Scoring'].map(c => (
                    <div key={c} className="vchip">
                      <CheckCircle size={13} strokeWidth={2.5} color={`var(--yes)`} />{c}
                    </div>
                  ))}
                </div>
                <Link to="/pricing?locked=interview" className="bb" style={{ marginTop: 32, display: 'inline-flex' }}>
                  Unlock mock interviews <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* STEPS */}
        <div ref={stepRef} className={`st-sec fs${stepOn ? ' on' : ''}`}>
          <div className="w">
            <div style={{ textAlign: 'center' }}>
              <span className="badge">How it works</span>
              <h2 className="sh2" style={{ margin: '0 auto 8px' }}>Simple by design.</h2>
              <p className="ssub" style={{ margin: '0 auto', textAlign: 'center' }}>
                From sign-up to signed offer — three clear steps.
              </p>
            </div>
            <div className="st-grid">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="stc">
                  <div className="stn">Step {n}</div>
                  <div className="stt">{title}</div>
                  <p className="std">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className={`pricing-sec fs${stepOn ? ' on' : ''}`}>
          <div className="w">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span className="badge">Pricing</span>
              <h2 className="sh2" style={{ margin: '0 auto 8px' }}>One plan. <em>Everything unlocked.</em></h2>
              <p className="ssub" style={{ margin: '0 auto', textAlign: 'center' }}>
                Start free with basic access. Upgrade to Pro for the full experience.
              </p>
            </div>

            <div className="price-cards">
              {/* FREE / EXPLORER */}
              <div className="price-card">
                <p className="lp-tier">Explorer</p>
                <div className="lp-price-row">
                  <span className="lp-price">₹0</span>
                  <span className="lp-period">forever</span>
                </div>
                <p className="lp-subhead">Preview the tools with daily basic limits.</p>
                <div className="lp-divider" />
                <p className="lp-sec-title">Limits &amp; Access</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {FREE_LIMITS.map(({ feature, free }) => (
                    <div key={feature} className="lp-limit-row">
                      <span className="lp-limit-name">{feature}</span>
                      <span className={`lp-badge ${free === 'Locked' ? 'locked' : 'limited'}`}>{free}</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="lp-cta ghost" disabled>
                  Current Tier
                </button>
              </div>

              {/* PRO / PROFESSIONAL */}
              <div className="price-card pro">
                <span className="lp-pop"><Sparkles size={11} strokeWidth={2.5} /> Most popular</span>
                <p className="lp-tier">Professional</p>
                <div className="lp-price-row">
                  <span className="lp-price">₹199</span>
                  <span className="lp-period">/ month</span>
                </div>
                <p className="lp-subhead">Complete, unrestricted access to the suite.</p>
                <div className="lp-divider" />
                <p className="lp-sec-title">Everything Unlocked</p>
                <div style={{ padding: 0, margin: 0 }}>
                  {[
                    'Unlimited AI career chat',
                    'Unlimited ATS resume analysis',
                    'Resume builder PDF exports',
                    'Voice mock interviews (Pro exclusive)',
                    'Unlimited career \u0026 roadmap graphs',
                    'Unlimited skill match, salary \u0026 company research',
                    'Premium job alerts (rolling out)',
                    'Priority support',
                  ].map(f => (
                    <div key={f} className="lp-feat-item">
                      <CheckCircle size={15} strokeWidth={2.5} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-pay-tags">
                  {['UPI', 'Google Pay', 'PhonePe', 'Cards', 'Netbanking'].map(m => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <Link to="/pricing" className="lp-cta primary">
                  Upgrade to Pro — ₹199 <ArrowRight size={15} />
                </Link>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#64748b', marginTop: 14 }}>
                  <Shield size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Secured by Razorpay · Tax invoice available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PRICE COMPARISON */}
        <div className={`pcmp-sec fs${stepOn ? ' on' : ''}`}>
          <div className="w">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span className="badge">Value comparison</span>
              <h2 className="sh2" style={{ margin: '0 auto 8px' }}>Replace the <em>tool stack.</em></h2>
              <p className="ssub" style={{ margin: '0 auto', textAlign: 'center' }}>
                One Pro membership vs. juggling separate subscriptions for chat, resume, interview, and research tools.
              </p>
            </div>
            <div className="tbl-wrap">
              <table className="ptbl">
                <thead>
                  <tr>
                    <th style={{ width: '36%' }}>Feature</th>
                    <th className="us-col">Nyrvexa Pro</th>
                    <th>Platform A</th>
                    <th>Platform B</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_COMPARE.map(({ feature, us, a, b }) => (
                    <tr key={feature} className={feature.includes('Total') ? 'total-row' : ''}>
                      <td>{feature}</td>
                      <td className="us-col">{us}</td>
                      <td>{a}</td>
                      <td>{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className={`cta-sec fs${ctaOn ? ' on' : ''}`}>
          <div className="w">
            <div className="cta-c">
              <h2 className="cta-h">Your next chapter<br /><em>starts here.</em></h2>
              <p className="cta-s">
                Join professionals across India using Nyrvexa to navigate their careers with clarity, data, and confidence.
              </p>
              <div className="cta-btns">
                <Link to="/register" className="bw">
                  Get started — it's free <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link to="/login" className="bwo">
                  Sign in <ChevronRight size={15} />
                </Link>
              </div>
              <p className="cta-note">
                <Shield size={11} strokeWidth={2} />
                No credit card · Secure & private · Built in India
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="foot-pro">
          <div className="w">
            <div className="foot-top">
              <div className="foot-brand">
                <Link to="/" className="logo" style={{ marginBottom: 14 }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                  <span className="lname">Nyrvexa</span>
                </Link>
                <p className="foot-desc">The intelligent career platform built for modern professionals. Designed for results.</p>
                <div className="foot-social">
                  <a href="#" className="foot-slink" aria-label="Twitter">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                  </a>
                  <a href="#" className="foot-slink" aria-label="LinkedIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                  <a href="#" className="foot-slink" aria-label="Email"><Mail size={16} /></a>
                </div>
              </div>
              <div className="foot-col">
                <h4 className="foot-colh">Product</h4>
                <Link to="/register" className="foot-link">AI Chat</Link>
                <Link to="/register" className="foot-link">Resume Analyzer</Link>
                <Link to="/register" className="foot-link">Resume Tailor</Link>
                <Link to="/register" className="foot-link">Voice Interview</Link>
              </div>
              <div className="foot-col">
                <h4 className="foot-colh">Resources</h4>
                <Link to="/roadmap-graph" className="foot-link">Interactive Roadmaps</Link>
                <Link to="/career" className="foot-link">Career Path AI</Link>
                <Link to="/register" className="foot-link">Salary Insights</Link>
                <Link to="/register" className="foot-link">Company Research</Link>
                <Link to="/register" className="foot-link">Tech News</Link>
              </div>
              <div className="foot-col">
                <h4 className="foot-colh">Company</h4>
                <a href="#" className="foot-link">About</a>
                <a href="#" className="foot-link">Privacy Policy</a>
                <a href="#" className="foot-link">Terms of Service</a>
                <a href="#" className="foot-link">Contact</a>
              </div>
            </div>
            <div className="foot-bottom">
              <span className="foot-copy">© 2026 Nyrvexa. All rights reserved.</span>
              <span className="foot-loc"><Globe size={12} strokeWidth={1.5} /> Made in India</span>
            </div>
          </div>
        </footer>

        </div>
      </div>
    </>
  )
}  
