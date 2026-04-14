import { Link } from 'react-router-dom'
import {
  MessageSquare, Briefcase, FileText, Map,
  Mic, Newspaper, ArrowRight, CheckCircle,
  Zap, Shield, Globe
} from 'lucide-react'

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Hybrid AI Chat',
    desc: 'Career advice powered by multiple leading AI models — intelligently routed to the best model for your specific question.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Briefcase,
    title: 'Real Job Listings',
    desc: 'Live jobs aggregated from top portals including LinkedIn, Naukri, and Wellfound, featuring direct application links.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: FileText,
    title: 'Resume Analyzer',
    desc: 'Upload your PDF resume and instantly receive an ATS score, keyword gap analysis, strengths, and targeted improvement suggestions.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Map,
    title: 'Career Path AI',
    desc: 'Enter your current skills and target role to generate a comprehensive, step-by-step roadmap with skill gap analysis.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Mic,
    title: 'Voice Interview AI',
    desc: 'Practice HR and technical rounds with a conversational AI that speaks questions, listens, and scores your performance live.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Newspaper,
    title: 'Tech & Career News',
    desc: 'Aggregated industry updates from premium publications, complete with AI-generated summaries for quick reading.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
]

const STEPS = [
  { step: '01', title: 'Create your account', desc: 'Sign up in seconds and establish your professional baseline.' },
  { step: '02', title: 'Define your objectives', desc: 'Tell the AI your target role or current career situation to get customized guidance.' },
  { step: '03', title: 'Execute with confidence', desc: 'Leverage your optimized resume, clear roadmap, and interview prep to land the role.' },
]

const STATS = [
  { value: '10,000+', label: 'Jobs Aggregated' },
  { value: '5+', label: 'AI Models Used' },
  { value: 'Real-time', label: 'Resume Analysis' },
  { value: '24/7', label: 'Career Support' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">NirVexa</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20 text-center relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6 md:mb-8 shadow-sm">
            <Zap size={12} className="text-blue-400" />
            Built for modern professionals
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.2] lg:leading-[1.1] mb-6 tracking-tight">
            Land your dream job <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              faster with AI
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-light px-2">
            NirVexa combines multiple premium AI models, aggregated job listings,
            intelligent resume analysis, and a voice interview coach —
            everything you need to accelerate your career trajectory.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-base w-full sm:w-auto shadow-lg shadow-blue-500/25"
            >
              Start Your Journey
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 font-medium px-7 py-3.5 rounded-xl transition-all text-base border border-white/10 w-full sm:w-auto"
            >
              View Platform
            </Link>
          </div>

       <div className="mt-12 max-w-3xl mx-auto bg-[#111116] border border-white/10 rounded-2xl shadow-xl overflow-hidden">

  {/* Header */}
  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0f0f12]">
    <p className="text-gray-400 text-xs">NirVexa AI Chat</p>
    <span className="text-green-400 text-xs">● Online</span>
  </div>

  {/* Chat Body */}
  <div className="p-4 space-y-4 text-sm">

    {/* User Message */}
    <div className="flex justify-end">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-xl rounded-tr-sm max-w-[75%]">
        How do I become a Data Analyst in India?
      </div>
    </div>

    {/* AI Message */}
    <div className="flex justify-start">
      <div className="bg-[#1a1a1f] border border-white/10 text-gray-200 px-4 py-3 rounded-xl rounded-tl-sm max-w-[80%]">
        <p className="mb-2 font-medium text-white">Step-by-step roadmap:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>Learn Excel & SQL</li>
          <li>Master Python (Pandas, NumPy)</li>
          <li>Build real-world projects</li>
          <li>Apply via LinkedIn & Naukri</li>
        </ul>

        <div className="mt-2 text-xs text-blue-400">
          Powered by AI
        </div>
      </div>
    </div>

  </div>

  {/* Input */}
  <div className="border-t border-white/5 px-4 py-2 bg-[#0f0f12] text-gray-500 text-xs">
    Ask anything about your career...
  </div>

</div>

          <p className="text-gray-500 text-xs md:text-sm mt-8 flex items-center justify-center gap-2 font-medium">
            <Shield size={14} className="text-gray-400" />
            Enterprise-grade infrastructure · Secure and private
          </p>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-1 md:mb-1.5">{value}</p>
                <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight px-4">
            A comprehensive suite for career growth
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light px-4">
            Powerful tools integrated into a single, cohesive ecosystem designed to help you prepare, apply, and succeed.
          </p>
        </div>

        {/* Adjusted grid for better tablet scaling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
  key={title}
  className="bg-[#111116] border border-white/5 p-6 rounded-2xl 
  hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
>
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2.5">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Voice Interview highlight ───────────────────────────── */}
      <section className="relative overflow-hidden border-y border-white/5 bg-[#111116]">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none hidden md:block" />
        
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 md:w-16 h-14 md:h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg shadow-indigo-500/10">
              <Mic size={26} className="text-indigo-400 md:w-[30px] md:h-[30px]" />
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6 tracking-tight">
              Next-generation mock interviews
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8 md:mb-10 font-light px-2">
              Don't leave your performance to chance. Practice with an advanced AI that conducts dynamic conversational interviews, providing immediate, actionable metrics on your content accuracy, communication style, and technical depth.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-left max-w-lg mx-auto sm:max-w-none">
              {[
                'HR & Technical Scenarios', 'Adaptive Questioning',
                'Live Transcripts', 'Comprehensive Scoring',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-gray-300 bg-white/5 px-4 py-2.5 md:py-2 rounded-full border border-white/5 w-full sm:w-auto justify-center sm:justify-start">
                  <CheckCircle size={16} className="text-indigo-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 tracking-tight">Streamlined workflow</h2>
          <p className="text-gray-400 text-base md:text-lg font-light">From initial setup to signed offer letter.</p>
        </div>
        
        {/* Changed sm:grid-cols-3 to md:grid-cols-3 to prevent crushing on tablets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
          {/* Connector line for desktop only */}
          <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="text-center relative z-10 px-4 md:px-0">
              <div className="w-14 md:w-16 h-14 md:h-16 bg-[#0a0a0c] border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 md:mb-6 shadow-lg shadow-blue-500/10">
                <span className="bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-base md:text-lg">{step}</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 md:mb-3">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <div className="relative overflow-hidden bg-[#111116] border border-white/10 rounded-[2rem] p-8 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
              Ready to elevate your career?
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-8 md:mb-10 max-w-xl mx-auto font-light px-2">
              Join the growing network of professionals using NirVexa to navigate their careers with data-driven confidence.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-950 hover:bg-gray-100 font-semibold px-6 md:px-8 py-3.5 md:py-4 rounded-xl transition-all text-base shadow-xl shadow-white/10 w-full sm:w-auto"
            >
              Get Started Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#0a0a0c]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="hidden md:flex w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-gray-400 text-sm font-medium">
              NirVexa · Engineered by{' '}
              <a
                href="https://github.com/Kunalx30"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors border-b border-gray-600 hover:border-white pb-0.5"
              >
                Kunal Chandelkar
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-500 font-medium flex-wrap justify-center">
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Privacy</span>
            <div className="w-1 h-1 rounded-full bg-gray-700 hidden sm:block" />
            <span className="flex items-center gap-1.5 text-gray-400">
              <Globe size={14} />
              India · 2026
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}