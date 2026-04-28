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

// ── Constants ─────────────────────────────────────────────────────────────────
const FILLER_REGEX = /\b(um|uh|like|you know|basically|literally|actually|right|so)\b/gi

const MODES = [
  { id: 'hr',        label: 'HR / Behavioral',     icon: MessageSquare, color: 'blue',    desc: '10 behavioral questions' },
  { id: 'technical', label: 'Technical',            icon: Brain,         color: 'purple',  desc: '10 technical questions'  },
  { id: 'mock',      label: 'Full Mock',            icon: Mic,           color: 'emerald', desc: '5 HR + 5 Technical'      },
  { id: 'stress',    label: 'Stress Test',          icon: Flame,         color: 'rose',    desc: '15 rapid-fire questions' },
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
  hr:        'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.15)]',
  technical: 'bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.15)]',
  mock:      'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.15)]',
  stress:    'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.15)]',
}
const levelActive = {
  emerald: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
  amber:   'bg-amber-500/10 border-amber-500/40 text-amber-400',
  rose:    'bg-rose-500/10 border-rose-500/40 text-rose-400',
}
const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-rose-400'
const scoreBar   = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-rose-500'

// ── ScoreBar component ────────────────────────────────────────────────────────
function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={scoreColor(value)}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreBar(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Interview() {
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

  // ── Per-question results
  const [evaluation, setEvaluation]   = useState(null)
  const [evaluating, setEvaluating]   = useState(false)
  const [answered, setAnswered]       = useState(false)

  // ── Session-level aggregates
  const [allEvals, setAllEvals]       = useState([])

  // ── TTS
  const speakQuestion = useCallback((text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.92
    utt.pitch = 1
    window.speechSynthesis.speak(utt)
  }, [])

  // ── Speech recognition setup ──────────────────────────────────────────────
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const r = new SpeechRecognition()
    r.continuous      = true
    r.interimResults  = true
    r.lang            = 'en-IN'

    r.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        e.results[i].isFinal ? (final += t) : (interim += t)
      }
      if (final) setTranscript(prev => prev + ' ' + final)
      setLiveText(interim)
    }

    r.onerror = (e) => {
      if (e.error !== 'no-speech') toast.error('Mic error: ' + e.error)
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
      const qs = genRes.data.questions

      // 2. Create session
      const sessRes = await api.post('/interview/session', {
        role: role.trim(), mode, difficulty: level, question_count: qs.length,
      })

      setQuestions(qs)
      setSessionId(sessRes.data.session_id)
      setQIndex(0)
      setAllEvals([])
      setView('interview')

      setTimeout(() => speakQuestion(qs[0]), 600)
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
    recognitionRef.current = r
    r.start()
    startTimeRef.current = Date.now()
    setIsListening(true)
  }

  // ── Stop recording + evaluate ─────────────────────────────────────────────
  const stopAndEvaluate = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setLiveText('')

    const finalTranscript = transcript.trim()
    if (!finalTranscript || finalTranscript.length < 10) {
      toast.error('Answer too short — please speak more.')
      return
    }

    const duration  = Math.round((Date.now() - startTimeRef.current) / 1000) || 1
    const words     = finalTranscript.trim().split(/\s+/).length
    const fillers   = (finalTranscript.match(FILLER_REGEX) || []).length

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
      setEvaluation(res.data.evaluation)
      setAllEvals(prev => [...prev, res.data.evaluation])
      setAnswered(true)
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
    setTranscript('')
    setLiveText('')
    setEvaluation(null)
    setAnswered(false)
    setTimeout(() => speakQuestion(questions[next]), 300)
  }

  // ── Finalize session ──────────────────────────────────────────────────────
  const finalizeSession = async () => {
    if (!sessionId || allEvals.length === 0) { setView('report'); return }

    const avgScore = Math.round(allEvals.reduce((s, e) => s + (e.overall_score || 0), 0) / allEvals.length)
    const avgWpm   = 130 // placeholder — real wpm tracked per answer
    const totalFillers = allEvals.length // minimal proxy

    try {
      await api.put(`/interview/session/${sessionId}`, {
        total_score: avgScore, avg_wpm: avgWpm, filler_word_count: totalFillers,
      })
    } catch (e) { /* non-blocking */ }

    setView('report')
    window.speechSynthesis?.cancel()
  }

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = () => {
    window.speechSynthesis?.cancel()
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
    setView('setup')
    setMode(''); setLevel(''); setRole('')
    setQuestions([]); setQIndex(0); setSessionId(null)
    setTranscript(''); setLiveText('')
    setEvaluation(null); setEvaluating(false); setAnswered(false)
    setAllEvals([])
  }

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: SETUP
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'setup') return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="pt-6 pb-10 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-3">
            <Mic size={13} /> AI Voice Interviewer
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Interview Practice</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl">Speak your answers aloud. Get scored on content, grammar, pace, and confidence.</p>
        </div>

        <div className="space-y-5 relative z-10">

          {/* Role input */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Target size={16} className="text-gray-400" /> Target Role
            </h3>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Data Analyst, Software Engineer..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {ROLE_SUGGESTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                    role === r
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/20'
                  }`}
                >{r}</button>
              ))}
            </div>
          </div>

          {/* Mode selection */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-gray-400" /> Interview Mode
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {MODES.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex flex-col items-center text-center gap-2.5 p-5 rounded-xl border transition-all duration-200 ${
                    mode === id
                      ? `scale-[1.03] ${modeActive[id]}`
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5 hover:text-gray-200'
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
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap size={16} className="text-gray-400" /> Difficulty
            </h3>
            <div className="flex gap-3">
              {LEVELS.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => setLevel(id)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 ${
                    level === id
                      ? `scale-[1.03] ${levelActive[color]}`
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
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
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:border disabled:border-white/10 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none text-base"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Generating questions...</>
                : <><Play size={18} /> Start Interview</>
              }
            </button>
            {mode && level && role && (
              <p className="text-gray-500 text-xs text-center mt-3">
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />

          {/* Progress bar */}
          <div className="pt-6 pb-6 relative z-10">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Question {qIndex + 1} of {questions.length}</span>
              <button onClick={restart} className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                <RotateCcw size={12} /> Restart
              </button>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6 sm:p-8 mb-5 relative z-10">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Brain size={14} className="text-purple-400" />
              </div>
              <p className="text-white text-base sm:text-lg font-medium leading-relaxed">{questions[qIndex]}</p>
            </div>
            <button
              onClick={() => speakQuestion(questions[qIndex])}
              className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              <Volume2 size={13} /> Hear question again
            </button>
          </div>

          {/* Recording area */}
          {!answered && (
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-5 relative z-10">
              <div className="flex flex-col items-center gap-5">

                {/* Mic button */}
                <button
                  onClick={isListening ? stopAndEvaluate : startListening}
                  disabled={evaluating}
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isListening
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/40'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {evaluating
                    ? <Loader2 size={28} className="animate-spin text-purple-400" />
                    : isListening
                      ? <MicOff size={28} />
                      : <Mic size={28} />
                  }
                </button>

                <p className="text-sm text-gray-400">
                  {evaluating
                    ? 'Evaluating your answer...'
                    : isListening
                      ? 'Listening — tap to stop and evaluate'
                      : 'Tap microphone to start speaking'
                  }
                </p>

                {/* Live transcript */}
                {(transcript || liveText) && (
                  <div className="w-full bg-white/3 border border-white/8 rounded-xl p-4 text-sm">
                    <p className="text-gray-300">{transcript}</p>
                    {liveText && <p className="text-gray-500 italic">{liveText}</p>}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Evaluation result */}
          {evaluation && answered && (
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-5 relative z-10 space-y-5">

              {/* Score header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Overall Score</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-bold ${scoreColor(evaluation.overall_score)}`}>
                      {evaluation.overall_score}
                    </span>
                    <span className="text-gray-500 text-sm mb-1">/ 100</span>
                    <span className={`text-lg font-bold mb-0.5 ${scoreColor(evaluation.overall_score)}`}>
                      · {evaluation.grade}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  evaluation.verdict === 'Strong'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : evaluation.verdict === 'Acceptable'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
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
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
                {evaluation.feedback}
              </div>

              {/* Pace + filler */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <p className="text-gray-500 mb-1 flex items-center gap-1"><Clock size={11} /> Pace</p>
                  <p className="text-gray-300">{evaluation.pace_feedback}</p>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <p className="text-gray-500 mb-1 flex items-center gap-1"><Mic size={11} /> Fillers</p>
                  <p className="text-gray-300">{evaluation.filler_feedback}</p>
                </div>
              </div>

              {/* Suggested answer */}
              <div>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><CheckCircle size={11} /> Model Answer</p>
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
                  {evaluation.suggested_answer}
                </div>
              </div>

              {/* Next / Finish */}
              <button
                onClick={nextQuestion}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all text-sm"
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

    const metricAvg = (key) => allEvals.length
      ? Math.round(allEvals.reduce((s, e) => s + (e[key] || 0), 0) / allEvals.length)
      : 0

    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 relative font-sans">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-emerald-600/8 blur-[100px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="pt-6 pb-8 relative z-10 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Interview Complete</h1>
            <p className="text-gray-400 text-sm">{role} · {MODES.find(m => m.id === mode)?.label} · {level}</p>
          </div>

          <div className="space-y-4 relative z-10">

            {/* Overall score card */}
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-xs mb-2">Final Score</p>
              <div className={`text-6xl font-bold mb-1 ${scoreColor(avgScore)}`}>{avgScore}</div>
              <div className="text-gray-400 text-sm">out of 100 · Grade <span className="text-white font-semibold">{avgGrade}</span></div>
              <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${scoreBar(avgScore)}`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>

            {/* Average metrics */}
            <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                <BarChart2 size={15} className="text-gray-400" /> Average Scores
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

            {/* Per-question breakdown */}
            {allEvals.length > 0 && (
              <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
                  <TrendingUp size={15} className="text-gray-400" /> Question Breakdown
                </h3>
                <div className="space-y-3">
                  {allEvals.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-6 shrink-0">Q{i + 1}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBar(ev.overall_score)}`}
                          style={{ width: `${ev.overall_score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold w-8 text-right ${scoreColor(ev.overall_score)}`}>
                        {ev.overall_score}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        ev.verdict === 'Strong' ? 'bg-emerald-500/10 text-emerald-400' :
                        ev.verdict === 'Acceptable' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>{ev.verdict}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restart */}
            <button
              onClick={restart}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
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