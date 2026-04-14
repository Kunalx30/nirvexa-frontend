import Layout from '../components/layout/Layout'
import { useState } from 'react'
import { Mic, Brain, Flame, MessageSquare, Play, Sparkles, Construction } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Interview() {
  const [mode, setMode] = useState('')
  const [level, setLevel] = useState('')

  const modes = [
    { id: 'HR', name: 'HR / Behavioral', icon: MessageSquare, color: 'blue' },
    { id: 'Technical', name: 'Technical / Coding', icon: Brain, color: 'purple' },
    { id: 'Mock', name: 'Full Mock Interview', icon: Mic, color: 'emerald' },
    { id: 'Stress', name: 'Stress Test', icon: Flame, color: 'rose' }
  ]

  const levels = [
    { id: 'Easy', color: 'emerald' }, 
    { id: 'Medium', color: 'amber' }, 
    { id: 'Hard', color: 'rose' }
  ]

  // Dynamic styling for mode selection
  const getModeStyles = (id, isActive) => {
    if (!isActive) return 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5 hover:text-gray-200'
    
    switch(id) {
      case 'HR': return 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
      case 'Technical': return 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
      case 'Mock': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      case 'Stress': return 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
      default: return 'bg-white/10 border-white/20 text-white'
    }
  }

  // Dynamic styling for level selection
  const getLevelStyles = (id, color, isActive) => {
    if (!isActive) return 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
    
    switch(color) {
      case 'emerald': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      case 'amber': return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      case 'rose': return 'bg-rose-500/10 border-rose-500/30 text-rose-400'
      default: return 'bg-white/10 border-white/30 text-white'
    }
  }

  const handleStart = () => {
    // 🔥 FIX 3: ADD TOAST ON CLICK (PRO FEEL)
    toast('AI Interview feature coming in Phase 6B 🚧', {
      icon: '🎙️',
      style: {
        borderRadius: '12px',
        background: '#111116',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    })
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 mb-10 z-10 relative pt-4 text-center sm:text-left items-center sm:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 w-fit mb-2 backdrop-blur-sm">
            <Mic size={14} />
            <span>AI Voice Simulator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Interview Practice
          </h1>
          <p className="text-gray-400 text-base font-light max-w-2xl mt-1">
            Configure your AI interviewer. Practice real-world scenarios with real-time feedback and vocal sentiment analysis.
          </p>
        </div>

        <div className="space-y-6 z-10 relative">
          
          {/* ── MODE SELECTION ────────────────────────────────────── */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-gray-400" />
              <h3 className="text-white font-semibold text-lg tracking-tight">
                Select Interview Mode
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {modes.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  // 🔥 FIX 2: RESET ON CHANGE (Already handled smoothly by state replacement)
                  onClick={() => setMode(id)}
                  // 🔥 FIX 5: ADD ANIMATION WHEN SELECTED (scale-105)
                  className={`flex flex-col items-center justify-center text-center gap-3 p-6 rounded-2xl border transition-all duration-300 transform ${
                    mode === id ? 'scale-105 z-10' : 'hover:scale-[1.02]'
                  } ${getModeStyles(id, mode === id)}`}
                >
                  <Icon size={28} className={mode === id ? '' : 'opacity-70'} />
                  <span className="font-semibold text-sm tracking-wide">{name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── LEVEL SELECTION ───────────────────────────────────── */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-white font-semibold mb-5 text-lg tracking-tight">
              Select Difficulty Level
            </h3>

            <div className="flex flex-wrap gap-3">
              {levels.map(({ id, color }) => (
                <button
                  key={id}
                  onClick={() => setLevel(id)}
                  // 🔥 FIX 5: ADD ANIMATION WHEN SELECTED (scale-105)
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-300 flex-1 sm:flex-none transform ${
                    level === id ? 'scale-105 z-10' : 'hover:scale-[1.02]'
                  } ${getLevelStyles(id, color, level === id)}`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* ── START BUTTON & UX FEEDBACK ────────────────────────── */}
          <div className="pt-6 flex flex-col items-center justify-center">
            <button
              // 🔥 FIX 4: BUTTON UX (Disabled state handles pointer-events and opacity naturally)
              disabled={!mode || !level}
              onClick={handleStart}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-[#111116] disabled:to-[#111116] disabled:border disabled:border-white/5 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none w-full sm:w-auto text-lg"
            >
              <Play size={20} className={(!mode || !level) ? 'opacity-50' : ''} />
              Start Session
            </button>

            {/* 🔥 FIX 1: SHOW SELECTED STATE TEXT */}
            {mode && level && (
              <p className="text-gray-400 text-sm mt-4 text-center animate-fade-in">
                Selected: <span className="text-white font-medium">{modes.find(m => m.id === mode)?.name}</span> · Difficulty: <span className="text-white font-medium">{level}</span>
              </p>
            )}
          </div>

          {/* ── PHASE 6B BANNER ───────────────────────────────────── */}
          <div className="mt-12 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-4 max-w-2xl mx-auto backdrop-blur-md">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0 border border-amber-500/20">
              <Construction className="text-amber-400" size={24} />
            </div>
            <div>
              <h4 className="text-amber-400 font-semibold mb-1">Coming Soon: Phase 6B</h4>
              <p className="text-amber-400/70 text-sm font-light">
                The full interactive AI voice interview simulation is currently in development. You'll be able to speak directly to the AI and receive detailed performance metrics.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}