import Layout from '../components/layout/Layout'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mic, MicOff, Brain, Flame, MessageSquare, Play, Sparkles,
  ChevronRight, RotateCcw, Trophy, TrendingUp, AlertCircle,
  CheckCircle, Clock, Volume2, BarChart2, ArrowRight, Loader2,
  Target, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { playInterviewTTS, stopInterviewTTS } from '../services/ttsService'

// ── Constants ─────────────────────────────────────────────────────────────────
const FILLER_TERMS = ['um', 'uh', 'umm', 'uhh', 'like', 'you know', 'basically', 'literally', 'actually', 'right', 'so']
const FILLER_REGEX = /\b(you know|basically|literally|actually|right|umm|uhh|um|uh|like|so)\b/gi
const INTRO_QUESTION = 'Tell me about yourself.'

const MODES = [
  { id: 'hr',        label: 'HR / Behavioral',     icon: MessageSquare, color: 'blue',    desc: '12+ behavioral questions' },
  { id: 'technical', label: 'Technical',            icon: Brain,         color: 'purple',  desc: '12+ technical questions'  },
  { id: 'mock',      label: 'Full Mock',            icon: Mic,           color: 'emerald', desc: '6 HR + 6 Technical'      },
  { id: 'stress',    label: 'Stress Test',          icon: Flame,         color: 'rose',    desc: '18 rapid-fire questions' },
]

const LEVELS = [
  { id: 'easy',   label: 'Easy',   color: 'emerald' },
  { id: 'medium', label: 'Medium', color: 'amber'   },
  { id: 'hard',   label: 'Hard',   color: 'rose'    },
]

const ROLE_SUGGESTIONS = [
  'Data Analyst', 'Software Engineer', 'Product Manager', 'Frontend Developer',
  'Backend Developer', 'ML Engineer', 'DevOps Engineer', 'Business Analyst',
]

// ── Color helpers ─────────────────────────────────────────────────────────────
const modeActive = {
  hr:        'bg-blue-50 border-blue-200 text-blue-700 shadow-sm',
  technical: 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm',
  mock:      'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm',
  stress:    'bg-rose-50 border-rose-200 text-rose-700 shadow-sm',
}
const levelActive = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm',
  amber:   'bg-amber-50 border-amber-200 text-amber-700 shadow-sm',
  rose:    'bg-rose-50 border-rose-200 text-rose-700 shadow-sm',
}
const scoreColor = (s) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-rose-600'
const scoreBar   = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-rose-500'
const clampScore = (value) => Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0))
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ── ScoreBar component ────────────────────────────────────────────────────────
function ScoreBar({ label, value }) {
  const safeValue = clampScore(value)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#6b6b6b]">{label}</span>
        <span className={scoreColor(safeValue)}>{safeValue}</span>
      </div>
      <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreBar(safeValue)}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}

function getFillerDetails(text) {
  const counts = FILLER_TERMS.reduce((acc, term) => ({ ...acc, [term]: 0 }), {})
  const matches = text.match(FILLER_REGEX) || []
  matches.forEach(match => {
    const key = match.toLowerCase().trim()
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([word, count]) => ({ word, count }))
}

function paceLabel(wpm) {
  if (!wpm) return 'not measured'
  if (wpm < 105) return 'too slow'
  if (wpm < 125) return 'slightly slow'
  if (wpm <= 165) return 'ideal'
  if (wpm <= 185) return 'slightly fast'
  return 'too fast'
}

function getDisplayName(user) {
  const rawName = user?.name || user?.full_name || user?.username || ''
  if (rawName.trim()) return rawName.trim().split(/\s+/)[0]
  const emailName = user?.email?.split('@')?.[0]
  return emailName ? emailName.split(/[._-]/)[0] : ''
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Interview() {
  const { user } = useAuth()
  const userFirstName = getDisplayName(user)
  // ── View state: 'setup' | 'interview' | 'report'
  const [view, setView]           = useState('setup')

  // ── Setup
  const [mode, setMode]           = useState('')
  const [level, setLevel]         = useState('')
  const [role, setRole]           = useState('')

  // ── Session
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex]       = useState(0)
  const [loading, setLoading]     = useState(false)

  // ── Recording
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript]   = useState('')
  const [liveText, setLiveText]       = useState('')
  const startTimeRef  = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')
  const liveTextRef = useRef('')
  const shouldKeepListeningRef = useRef(false)

  // ── Per-question results
  const [evaluation, setEvaluation]   = useState(null)
  const [evaluating, setEvaluating]   = useState(false)
  const [answered, setAnswered]       = useState(false)

  // ── Session-level aggregates
  const [allEvals, setAllEvals]       = useState([])
  const metricAvg = useCallback((key) => allEvals.length
    ? Math.round(allEvals.reduce((s, e) => s + (e[key] || 0), 0) / allEvals.length)
    : 0, [allEvals])


  const speakText = useCallback(async (text, options = {}) => {
    if (!text) return
    return playInterviewTTS(text, {
      voice: 'ananya',
      rate: options.rate ?? 1,
      pitch: options.pitch ?? 1.02,
      playbackRate: options.playbackRate ?? 1,
    })
  }, [])


  const speakQuestion = useCallback((text) => {
    speakText(text, { rate: 1, pitch: 1.02 })
  }, [speakText])

  const speakIntroThenQuestion = useCallback((question) => {
    const greeting = userFirstName ? `Hi ${userFirstName},` : 'Hi,'
    const intro = `${greeting} I am Ananya, your HR interviewer for this ${role.trim()} interview. I will keep this simple and ask one question at a time. Let us begin. ${question}`
    speakText(intro, { rate: 1, pitch: 1.02 })
  }, [role, speakText, userFirstName])

  const speakAcknowledgement = useCallback((evaluationData) => {
    const score = evaluationData?.overall_score
    const text = score >= 80
      ? 'Got it. That was a strong answer.'
      : score >= 60
        ? 'Got it. Good answer. I have a few small suggestions.'
        : 'Got it. Let us make this answer clearer.'
    speakText(text, { rate: 1, pitch: 1.02 })
  }, [speakText])

  // ── Speech recognition setup ──────────────────────────────────────────────
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const r = new SpeechRecognition()
    r.continuous      = true
    r.interimResults  = true
    r.maxAlternatives = 1
    r.lang            = 'en-IN'

    r.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        e.results[i].isFinal ? (final += t) : (interim += t)
      }
      if (final) {
        transcriptRef.current = `${transcriptRef.current} ${final}`.trim()
        setTranscript(transcriptRef.current)
      }
      liveTextRef.current = interim
      setLiveText(interim)
    }

    r.onerror = (e) => {
      if (e.error !== 'no-speech') toast.error('Mic error: ' + e.error)
    }

    r.onend = () => {
      if (!shouldKeepListeningRef.current) return
      try {
        r.start()
      } catch {
        // Chrome can throw if recognition is already starting.
      }
    }

    return r
  }, [])

  // ── Start interview ───────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!mode || !level || !role.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      // 1. Generate questions
      const genRes = await api.post('/interview/generate', {
        role: role.trim(), mode, difficulty: level,
      })
      const generated = genRes.data.questions || []
      const hasIntro = generated[0]?.toLowerCase?.().includes('tell me about yourself')
      const qs = hasIntro ? generated : [INTRO_QUESTION, ...generated]

      // 2. Create session
      const sessRes = await api.post('/interview/session', {
        role: role.trim(), mode, difficulty: level, question_count: qs.length,
      })

      setQuestions(qs)
      setSessionId(sessRes.data.session_id)
      setQIndex(0)
      setAllEvals([])
      setView('interview')

      setTimeout(() => speakIntroThenQuestion(qs[0]), 600)
    } catch (err) {
      toast.error('Failed to start interview. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Start recording ───────────────────────────────────────────────────────
  const startListening = () => {
    const r = initRecognition()
    if (!r) { toast.error('Speech recognition not supported in this browser. Use Chrome.'); return }
    setTranscript('')
    setLiveText('')
    transcriptRef.current = ''
    liveTextRef.current = ''
    recognitionRef.current = r
    shouldKeepListeningRef.current = true
    r.start()
    startTimeRef.current = Date.now()
    setIsListening(true)
  }

  // ── Stop recording + evaluate ─────────────────────────────────────────────
  const stopAndEvaluate = async () => {
    shouldKeepListeningRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    await wait(650)

    const finalTranscript = `${transcriptRef.current} ${liveTextRef.current}`.replace(/\s+/g, ' ').trim()
    setTranscript(finalTranscript)
    setLiveText('')
    if (!finalTranscript || finalTranscript.length < 10) {
      toast.error('Answer too short — please speak more.')
      return
    }

    const duration  = Math.round((Date.now() - startTimeRef.current) / 1000) || 1
    const words     = finalTranscript.trim().split(/\s+/).length
    const fillerDetails = getFillerDetails(finalTranscript)
    const fillers   = fillerDetails.reduce((sum, item) => sum + item.count, 0)
    const wpm = Math.round((words / duration) * 60)

    setEvaluating(true)
    try {
      const res = await api.post('/interview/evaluate', {
        question:         questions[qIndex],
        transcript:       finalTranscript,
        role:             role.trim(),
        duration_seconds: duration,
        word_count:       words,
        filler_count:     fillers,
      })
      const evaluationData = {
        ...res.data.evaluation,
        duration_seconds: duration,
        word_count: words,
        filler_count: fillers,
        filler_details: fillerDetails,
        filler_rate_percent: words ? Number(((fillers / words) * 100).toFixed(1)) : 0,
        wpm,
        pace_label: paceLabel(wpm),
      }
      setEvaluation(evaluationData)
      setAllEvals(prev => [...prev, evaluationData])
      setAnswered(true)
      speakAcknowledgement(evaluationData)
    } catch (err) {
      toast.error('Evaluation failed. Try again.')
    } finally {
      setEvaluating(false)
    }
  }

  // ── Next question ─────────────────────────────────────────────────────────
  const nextQuestion = () => {
    const next = qIndex + 1
    if (next >= questions.length) {
      finalizeSession()
      return
    }
    setQIndex(next)
    shouldKeepListeningRef.current = false
    setTranscript('')
    setLiveText('')
    transcriptRef.current = ''
    liveTextRef.current = ''
    setEvaluation(null)
    setAnswered(false)
    setTimeout(() => speakQuestion(questions[next]), 300)
  }

  // ── Finalize session ──────────────────────────────────────────────────────
  const finalizeSession = async () => {
    if (!sessionId || allEvals.length === 0) { setView('report'); return }

    const avgScore = Math.round(allEvals.reduce((s, e) => s + (e.overall_score || 0), 0) / allEvals.length)
    const avgWpm   = Math.round(allEvals.reduce((s, e) => s + (e.wpm || 0), 0) / allEvals.length)
    const totalFillers = allEvals.reduce((s, e) => s + (e.filler_count || 0), 0)
    const metricScores = {
      content_score: metricAvg('content_score'),
      keyword_score: metricAvg('keyword_score'),
      grammar_score: metricAvg('grammar_score'),
      confidence_score: metricAvg('confidence_score'),
      pace_score: metricAvg('pace_score'),
      completeness_score: metricAvg('completeness_score'),
    }

    try {
      await api.put(`/interview/session/${sessionId}`, {
        total_score: avgScore,
        avg_wpm: avgWpm,
        filler_word_count: totalFillers,
        metric_scores: metricScores,
      })
    } catch (e) { /* non-blocking */ }

    setView('report')
    stopInterviewTTS()
  }

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = () => {
    stopInterviewTTS()
    shouldKeepListeningRef.current = false
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
    setView('setup')
    setMode(''); setLevel(''); setRole('')
    setQuestions([]); setQIndex(0); setSessionId(null)
    setTranscript(''); setLiveText('')
    transcriptRef.current = ''; liveTextRef.current = ''
    setEvaluation(null); setEvaluating(false); setAnswered(false)
    setAllEvals([])
  }

  // ── Cleanup on unmount ────────────────────────────────────────────────────
useEffect(() => {
    return () => {
      stopInterviewTTS()
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: SETUP
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'setup') return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-purple-50/80 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="pt-6 pb-10 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-600 mb-3">
            <Mic size={13} /> AI Voice Interviewer
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight">Interview Practice</h1>
          <p className="text-[#4a4a4a] text-base font-medium max-w-xl mt-1">Speak your answers aloud. Get scored on content, grammar, pace, and confidence.</p>
        </div>

        <div className="space-y-5 relative z-10">

          {/* Role input */}
          <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
            <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2">
              <Target size={16} className="text-[#6b6b6b]" /> Target Role
            </h3>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Data Analyst, Software Engineer..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#0a0a0a] placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {ROLE_SUGGESTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                    role === r
                      ? 'bg-[#0a0a0a] border border-[#0a0a0a] text-white shadow-sm font-medium'
                      : 'bg-white/3 border-white/8 text-[#8b8b8b] hover:text-[#3a3a3a] hover:border-white/20'
                  }`}
                >{r}</button>
              ))}
            </div>
          </div>

          {/* Mode selection */}
          <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
            <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[#6b6b6b]" /> Interview Mode
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {MODES.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex flex-col items-center text-center gap-2.5 p-5 rounded-xl border transition-all duration-200 ${
                    mode === id
                      ? `scale-[1.03] ${modeActive[id]}`
                      : 'bg-white/[0.02] border-white/5 text-[#6b6b6b] hover:border-white/15 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon size={22} />
                  <span className="font-semibold text-xs leading-tight">{label}</span>
                  <span className="text-[10px] opacity-60">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
            <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[#6b6b6b]" /> Difficulty
            </h3>
            <div className="flex gap-3">
              {LEVELS.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => setLevel(id)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 ${
                    level === id
                      ? `scale-[1.03] ${levelActive[color]}`
                      : 'bg-white/5 border-transparent text-[#6b6b6b] hover:bg-white/10 hover:text-[#0a0a0a]'
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Start */}
          <div className="pt-2">
            <button
              disabled={!mode || !level || !role.trim() || loading}
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:border disabled:border-white/10 disabled:text-[#8b8b8b] disabled:cursor-not-allowed text-[#0a0a0a] font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none text-base"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Generating questions...</>
                : <><Play size={18} /> Start Interview</>
              }
            </button>
            {mode && level && role && (
              <p className="text-[#8b8b8b] text-xs text-center mt-3">
                {MODES.find(m => m.id === mode)?.label} · {level.charAt(0).toUpperCase() + level.slice(1)} · {role}
              </p>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: INTERVIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'interview') {
    const progress = ((qIndex) / questions.length) * 100

    return (
      <Layout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
          .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
          .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
        `}</style>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-blue-50/80 blur-[100px] rounded-full pointer-events-none" />

          {/* Progress bar */}
          <div className="pt-6 pb-6 relative z-10">
            <div className="flex items-center justify-between text-xs text-[#8b8b8b] mb-2">
              <span>Question {qIndex + 1} of {questions.length}</span>
              <button onClick={restart} className="flex items-center gap-1 hover:text-[#3a3a3a] transition-colors">
                <RotateCcw size={12} /> Restart
              </button>
            </div>
            <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-6 sm:p-8 mb-5 relative z-10">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                <Brain size={14} className="text-purple-600" />
              </div>
              <p className="text-[#0a0a0a] text-base sm:text-lg font-medium leading-relaxed">{questions[qIndex]}</p>
            </div>
            <button
              onClick={() => speakQuestion(questions[qIndex])}
              className="mt-4 flex items-center gap-1.5 text-xs text-[#8b8b8b] hover:text-purple-600 transition-colors"
            >
              <Volume2 size={13} /> Hear question again
            </button>
          </div>

          {/* Recording area */}
          {!answered && (
            <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6 mb-5 relative z-10">
              <div className="flex flex-col items-center gap-5">

                {/* Mic button */}
                <button
                  onClick={isListening ? stopAndEvaluate : startListening}
                  disabled={evaluating}
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isListening
                      ? 'bg-rose-500/20 border-rose-500 text-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse'
                      : 'bg-white/5 border-white/20 text-[#3a3a3a] hover:bg-white/10 hover:border-white/40'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {evaluating
                    ? <Loader2 size={28} className="animate-spin text-purple-600" />
                    : isListening
                      ? <MicOff size={28} />
                      : <Mic size={28} />
                  }
                </button>

                <p className="text-sm text-[#6b6b6b]">
                  {evaluating
                    ? 'Evaluating your answer...'
                    : isListening
                      ? 'Listening — tap to stop and evaluate'
                      : 'Tap microphone to start speaking'
                  }
                </p>

                {/* Live transcript */}
                {(transcript || liveText) && (
                  <div className="w-full bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl p-4 text-sm shadow-inner">
                    <p className="text-[#3a3a3a]">{transcript}</p>
                    {liveText && <p className="text-[#8b8b8b] italic">{liveText}</p>}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Evaluation result */}
          {evaluation && answered && (
            <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6 mb-5 relative z-10 space-y-5">

              {/* Score header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#6b6b6b] text-xs mb-1">Overall Score</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-bold ${scoreColor(evaluation.overall_score)}`}>
                      {evaluation.overall_score}
                    </span>
                    <span className="text-[#8b8b8b] text-sm mb-1">/ 100</span>
                    <span className={`text-lg font-bold mb-0.5 ${scoreColor(evaluation.overall_score)}`}>
                      · {evaluation.grade}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  evaluation.verdict === 'Strong'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                    : evaluation.verdict === 'Acceptable'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                }`}>{evaluation.verdict}</div>
              </div>

              {/* Score bars */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <ScoreBar label="Content"      value={evaluation.content_score} />
                <ScoreBar label="Keywords"     value={evaluation.keyword_score} />
                <ScoreBar label="Grammar"      value={evaluation.grammar_score} />
                <ScoreBar label="Confidence"   value={evaluation.confidence_score} />
                <ScoreBar label="Pace"         value={evaluation.pace_score} />
                <ScoreBar label="Completeness" value={evaluation.completeness_score} />
              </div>

              {/* Feedback */}
              <div className="bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl p-4 text-sm shadow-inner text-[#3a3a3a] leading-relaxed">
                {evaluation.feedback}
              </div>

              {/* Pace + filler */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <p className="text-[#8b8b8b] mb-1 flex items-center gap-1"><Clock size={11} /> Pace</p>
                  <p className="text-[#3a3a3a]">{evaluation.wpm} WPM · {evaluation.pace_label}</p>
                  <p className="text-[#6b6b6b] mt-1">{evaluation.pace_feedback}</p>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <p className="text-[#8b8b8b] mb-1 flex items-center gap-1"><Mic size={11} /> Fillers</p>
                  <p className="text-[#3a3a3a]">
                    {evaluation.filler_count} words · {evaluation.filler_rate_percent}% of answer
                  </p>
                  <p className="text-[#6b6b6b] mt-1">
                    {evaluation.filler_details?.length
                      ? evaluation.filler_details.map(item => `${item.word} (${item.count})`).join(', ')
                      : 'No filler words detected'}
                  </p>
                </div>
              </div>

              {/* Suggested answer */}
              <div>
                <p className="text-xs text-[#8b8b8b] mb-2 flex items-center gap-1"><CheckCircle size={11} /> Model Answer</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm p-4 text-sm text-[#3a3a3a] leading-relaxed">
                  {evaluation.suggested_answer}
                </div>
              </div>

              {/* Next / Finish */}
              <button
                onClick={nextQuestion}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-[#0a0a0a] font-bold text-lg tracking-tight py-3 rounded-xl transition-all text-sm"
              >
                {qIndex + 1 >= questions.length
                  ? <><Trophy size={15} /> Finish & See Report</>
                  : <><ArrowRight size={15} /> Next Question</>
                }
              </button>

            </div>
          )}

        </div>
      </Layout>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: REPORT
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'report') {
    const avgScore  = allEvals.length
      ? Math.round(allEvals.reduce((s, e) => s + (e.overall_score || 0), 0) / allEvals.length)
      : 0
    const avgGrade  = allEvals.length ? allEvals[allEvals.length - 1]?.grade : 'N/A'
    const avgWpm = allEvals.length
      ? Math.round(allEvals.reduce((s, e) => s + (e.wpm || 0), 0) / allEvals.length)
      : 0

    const metricAvg = (key) => allEvals.length
      ? Math.round(allEvals.reduce((s, e) => s + (e[key] || 0), 0) / allEvals.length)
      : 0

    return (
      <Layout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
          .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
          .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
        `}</style>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-emerald-50/80 blur-[100px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="pt-6 pb-8 relative z-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-serif text-[#0a0a0a] mb-1">Interview Complete</h1>
            <p className="text-[#6b6b6b] text-sm">{role} · {MODES.find(m => m.id === mode)?.label} · {level}</p>
          </div>

          <div className="space-y-4 relative z-10">

            {/* Overall score card */}
            <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6 text-center">
              <p className="text-[#6b6b6b] text-xs mb-2">Final Score</p>
              <div className={`text-6xl font-bold mb-1 ${scoreColor(avgScore)}`}>{avgScore}</div>
              <div className="text-[#6b6b6b] text-sm">out of 100 · Grade <span className="text-[#0a0a0a] font-bold text-lg tracking-tight">{avgGrade}</span></div>
              <div className="mt-4 h-2 bg-[#f0f0f0] rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${scoreBar(avgScore)}`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>

            {/* Average metrics */}
            <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
              <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 flex items-center gap-2 text-sm">
                <BarChart2 size={15} className="text-[#6b6b6b]" /> Average Scores
              </h3>
              <div className="space-y-3">
                <ScoreBar label="Content Accuracy" value={metricAvg('content_score')} />
                <ScoreBar label="Keyword Coverage"  value={metricAvg('keyword_score')} />
                <ScoreBar label="Grammar Quality"   value={metricAvg('grammar_score')} />
                <ScoreBar label="Confidence"        value={metricAvg('confidence_score')} />
                <ScoreBar label="Speaking Pace"     value={metricAvg('pace_score')} />
                <ScoreBar label="Completeness"      value={metricAvg('completeness_score')} />
              </div>
            </div>

            <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-6">
              <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 text-sm flex items-center gap-2">
                <Clock size={15} className="text-[#6b6b6b]" /> Measured Speaking Stats
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl p-3">
                  <p className="text-[#8b8b8b] mb-1">Avg Pace</p>
                  <p className="text-[#0a0a0a] font-bold text-lg">{avgWpm} WPM</p>
                </div>
                <div className="bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl p-3">
                  <p className="text-[#8b8b8b] mb-1">Fillers</p>
                  <p className="text-[#0a0a0a] font-bold text-lg">
                    {allEvals.reduce((s, e) => s + (e.filler_count || 0), 0)}
                  </p>
                </div>
                <div className="bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl p-3">
                  <p className="text-[#8b8b8b] mb-1">Words</p>
                  <p className="text-[#0a0a0a] font-bold text-lg">
                    {allEvals.reduce((s, e) => s + (e.word_count || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Per-question breakdown */}
            {allEvals.length > 0 && (
              <div className="bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight mb-4 text-sm flex items-center gap-2">
                  <TrendingUp size={15} className="text-[#6b6b6b]" /> Question Breakdown
                </h3>
                <div className="space-y-3">
                  {allEvals.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[#8b8b8b] text-xs w-6 shrink-0">Q{i + 1}</span>
                      <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full ${scoreBar(ev.overall_score)}`}
                          style={{ width: `${ev.overall_score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold w-8 text-right ${scoreColor(ev.overall_score)}`}>
                        {ev.overall_score}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        ev.verdict === 'Strong' ? 'bg-emerald-500/10 text-emerald-600' :
                        ev.verdict === 'Acceptable' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-rose-500/10 text-rose-600'
                      }`}>{ev.verdict}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restart */}
            <button
              onClick={restart}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#0a0a0a] font-bold text-lg tracking-tight py-3.5 rounded-xl transition-all text-sm"
            >
              <RotateCcw size={15} /> Start New Interview
            </button>

          </div>
        </div>
      </Layout>
    )
  }

  return null
}
