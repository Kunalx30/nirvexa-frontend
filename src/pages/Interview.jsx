// Nyrvexa AI Interviewer — App.jsx
// Avatar: Premium CSS-based illustrated girl face with lip-sync
// Audio: Web Audio API decodeAudioData (immune to Chrome autoplay policy)
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  startInterview, reactToAnswer, evaluateInterview, fetchTTSAudio,
  createMainSession, finalizeMainSession, resolvePremiumAccess, buildPricingUrl,
} from "../services/interviewerApi"
import useSpeechRecognition from "../hooks/useSpeechRecognition"
import useAudioEngine from "../hooks/useAudioEngine"
import LottieAvatar from "../components/LottieAvatar"
import SyncedCaption from "../components/SyncedCaption"
import {
  Search, Loader2, Sparkles, Clock3, CheckCircle2, ChevronRight, ChevronDown, ExternalLink,
  GitBranch, BookOpen, Layers, X, Filter, ListTree, PanelRightOpen,
  Mic, Volume2, HelpCircle, FileText, ArrowRight, Award, Flame, BrainCircuit, RefreshCw, Check,
  AlertCircle, User, Zap, MessageSquare, ChevronUp, ChevronLeft, BarChart2, Lock, Crown
} from 'lucide-react'

/* ─── CONSTANTS ──────────────────────────────────────────────────────────────*/
const JOB_ROLES = [
  "Data Scientist","Machine Learning Engineer","AI Engineer",
  "Software Engineer","Frontend Developer","Backend Developer",
  "Full Stack Developer","Data Analyst","Business Analyst",
  "Product Manager","DevOps Engineer","Cloud Engineer",
  "Python Developer","Java Developer","React Developer",
  "Power BI Developer","SQL Developer","Cybersecurity Analyst",
]
const EXP_LEVELS = [
  { value:"fresher", label:"Fresher  (0–1 yr)"  },
  { value:"junior",  label:"Junior   (1–3 yrs)" },
  { value:"mid",     label:"Mid-level (3–6 yrs)"},
  { value:"senior",  label:"Senior   (6+ yrs)"  },
]
const PHASE = { SETUP:"setup", LOADING:"loading", INTERVIEWING:"interviewing", EVALUATING:"evaluating", RESULTS:"results" }

const VALID_EXP_LEVELS = new Set(EXP_LEVELS.map((e) => e.value))

/* ─── URL / STORAGE HELPERS ────────────────────────────────────────────────────*/
function getUserName() {
  try {
    const params = new URLSearchParams(window.location.search)
    const qName = params.get("userName") || params.get("name")
    if (qName) return decodeURIComponent(qName)
    const raw = localStorage.getItem("nirvexa_user") || localStorage.getItem("nyrvexa_user") || localStorage.getItem("user") || localStorage.getItem("nyrvexa_auth")
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.name || parsed?.full_name || parsed?.username || parsed?.email?.split("@")[0] || null
  } catch (_) { return null }
}
function getAuthToken() {
  try {
    const params = new URLSearchParams(window.location.search)
    const qToken = params.get("token") || params.get("accessToken") || params.get("jwt")
    if (qToken) return qToken
    const raw = localStorage.getItem("nyrvexa_auth")
    if (raw) { const p = JSON.parse(raw); return p?.access_token || p?.token || null }
  } catch (_) {}
  return null
}
function getMainBackendUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    const qUrl = params.get("mainBackendUrl") || params.get("backendUrl")
    if (qUrl) return decodeURIComponent(qUrl)
  } catch (_) {}
  return import.meta.env.VITE_MAIN_BACKEND_URL || "https://api.nyrvexa.in/api"
}

function normalizeExpLevel(raw) {
  if (!raw) return null
  const v = decodeURIComponent(String(raw)).trim().toLowerCase()
  const aliases = {
    fresher: "fresher", fresh: "fresher", entry: "fresher", "0-1": "fresher", "0–1": "fresher",
    junior: "junior", "1-3": "junior", "1–3": "junior",
    mid: "mid", "mid-level": "mid", midlevel: "mid", "3-6": "mid", "3–6": "mid",
    senior: "senior", lead: "senior", "6+": "senior",
  }
  const mapped = aliases[v] || v
  return VALID_EXP_LEVELS.has(mapped) ? mapped : null
}

/** Pre-fill setup from URL when embedded from main Nyrvexa app. */
function getSetupFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    const rawRole = params.get("role") || params.get("jobRole") || params.get("job_role")
    const rawExp = params.get("exp") || params.get("experience") || params.get("experienceLevel") || params.get("experience_level")

    let jobRole = ""
    let customRole = ""
    if (rawRole) {
      const role = decodeURIComponent(rawRole).trim()
      if (JOB_ROLES.includes(role)) jobRole = role
      else { jobRole = "__custom__"; customRole = role }
    }

    return {
      jobRole,
      customRole,
      expLevel: normalizeExpLevel(rawExp) || "fresher",
    }
  } catch (_) {
    return { jobRole: "", customRole: "", expLevel: "fresher" }
  }
}

const INITIAL_SETUP = typeof window !== "undefined" ? getSetupFromUrl() : { jobRole: "", customRole: "", expLevel: "fresher" }

function getDevResultsFixture() {
  if (!import.meta.env.DEV || typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  if (params.get("demoResults") !== "1") return null

  const allQA = [
    {
      question: "Tell me about yourself.",
      answer: "I am a frontend developer focused on React, API integration, and building clean user experiences. In my recent project I built a dashboard with reusable components, reduced repeated code, and improved page responsiveness for mobile users.",
    },
    {
      question: "How would you debug a slow React page?",
      answer: "I would profile the page first, check unnecessary renders, inspect network waterfalls, and split heavy components. I would use memoization only where measurements show it helps, then verify the result with Lighthouse and browser performance tools.",
    },
    {
      question: "Tell me about a time you handled unclear requirements.",
      answer: "I clarified the goal, wrote down assumptions, shared a quick prototype, and asked stakeholders to confirm the expected workflow before implementation. That reduced rework and helped the team agree on the final behavior.",
    },
  ]

  return {
    phase: PHASE.RESULTS,
    plan: { job_role: "Frontend Developer", experience_level: "junior", total: allQA.length },
    allQA,
    evaluation: {
      success: true,
      job_role: "Frontend Developer",
      experience_level: "junior",
      overall_score: 78,
      hire_recommendation: "Yes",
      summary: "The candidate gave relevant, practical answers with a good grasp of React debugging, API-driven UI work, and requirement clarification. Communication was mostly clear and structured, with examples that showed real workflow awareness. To move from good to excellent, the answers need sharper metrics, deeper technical tradeoffs, and more specific project outcomes.",
      scores: {
        technical_knowledge: 80,
        communication_clarity: 76,
        confidence: 74,
        answer_relevance: 84,
        problem_solving: 78,
        cultural_fit: 77,
      },
      strengths: [
        "Connected answers to real frontend workflows instead of giving generic theory.",
        "Explained debugging with a measurement-first approach.",
        "Showed a collaborative method for handling unclear requirements.",
      ],
      improvements: [
        {
          area: "Evidence",
          issue: "Good examples were present, but measurable impact was limited.",
          how_to_fix: "Add numbers such as load time reduction, bug count reduction, conversion lift, or time saved.",
          resource: "Practice STAR answers with one metric in every project story.",
        },
        {
          area: "Technical depth",
          issue: "React performance answer mentioned tools but not tradeoffs.",
          how_to_fix: "Explain when memoization, code splitting, virtualization, or caching is appropriate.",
          resource: "Review React Profiler and browser Performance panel workflows.",
        },
      ],
      per_question: [
        {
          question_number: 1,
          question: allQA[0].question,
          score: 8,
          feedback: "Strong introduction with relevant role framing and recent project context.",
          what_was_good: "Clear role identity and frontend-specific work.",
          what_was_missing: "Add one concrete result or metric.",
        },
        {
          question_number: 2,
          question: allQA[1].question,
          score: 8,
          feedback: "Good debugging sequence: measure first, inspect renders/network, then optimize.",
          what_was_good: "Avoided premature optimization and mentioned validation tools.",
          what_was_missing: "Include one example of a specific bottleneck found and fixed.",
        },
        {
          question_number: 3,
          question: allQA[2].question,
          score: 7,
          feedback: "Solid collaboration answer with a practical clarification process.",
          what_was_good: "Used assumptions, prototype, and stakeholder confirmation.",
          what_was_missing: "Could include the final business/user outcome.",
        },
      ],
      next_steps: [
        "Rewrite each answer with one measurable outcome.",
        "Prepare two deep React tradeoff stories.",
        "Practice concise 60-90 second spoken answers.",
      ],
      motivational_note: "You are already answering like someone who has built real interfaces. Add sharper evidence and the result will feel much more interview-ready.",
    },
  }
}

const DEV_RESULTS_FIXTURE = getDevResultsFixture()

/* ─── MIC WAVE ANIMATION ─────────────────────────────────────────────────────
   Shown below Anya when she is listening — gives a "voice is going" feeling
───────────────────────────────────────────────────────────────────────────── */
function MicWave({ isListening }) {
  if (!isListening) return null
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Glowing mic icon */}
      <div className="w-[38px] h-[38px] rounded-full bg-emerald-50 border-[1.5px] border-emerald-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.25)] anim-mic-glow">
        <Mic size={16} className="text-emerald-500" />
      </div>
      {/* Bouncing sound bars */}
      <div className="flex items-center gap-[3px] h-[26px]">
        {[5,9,16,22,26,22,16,9,5].map((h, i) => (
          <div key={i} className="w-[3px] rounded-[2px] bg-emerald-500 opacity-85" style={{
            animation:`micBar ${0.55 + (i % 4) * 0.13}s ease-in-out ${i * 60}ms infinite alternate`,
            height:h
          }}/>
        ))}
      </div>
    </div>
  )
}

/* ─── RADAR CHART ────────────────────────────────────────────────────────────*/
function RadarChart({ scores }) {
  const labels = Object.keys(scores)
  const values = Object.values(scores)
  const n = labels.length
  const cx = 160, cy = 160, r = 108
  const pts = (vals) => vals.map((v, i) => {
    const a = (Math.PI*2*i)/n - Math.PI/2
    const d = (v/100)*r
    return [cx + d*Math.cos(a), cy + d*Math.sin(a)]
  })
  const path = (p) => p.map((pt,i) => `${i===0?"M":"L"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ")+"Z"
  const lPts = labels.map((_,i) => {
    const a = (Math.PI*2*i)/n - Math.PI/2
    return [cx+(r+22)*Math.cos(a), cy+(r+22)*Math.sin(a)]
  })
  const fmt = (s) => s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[280px] mx-auto">
      {[20,40,60,80,100].map(l=>(
        <polygon key={l} points={pts(Array(n).fill(l)).map(p=>p.join(",")).join(" ")} fill="none" stroke="#f0f0f0" strokeWidth="1"/>
      ))}
      {labels.map((_,i)=>{
        const a=(Math.PI*2*i)/n-Math.PI/2
        return <line key={i} x1={cx} y1={cy} x2={(cx+r*Math.cos(a)).toFixed(1)} y2={(cy+r*Math.sin(a)).toFixed(1)} stroke="#e4e4e4" strokeWidth="1"/>
      })}
      <path d={path(pts(values))} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="2"/>
      {pts(values).map(([x,y],i)=>(
        <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="#6366f1" stroke="#fff" strokeWidth="2"/>
      ))}
      {lPts.map(([x,y],i)=>(
        <text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6b7280" fontFamily="DM Sans,sans-serif">{fmt(labels[i])}</text>
      ))}
    </svg>
  )
}

/* ─── SCORE BAR ──────────────────────────────────────────────────────────────*/
function ScoreBar({ label, value }) {
  const pct   = Math.min(100, Math.max(0, value))
  const color = value >= 70 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500"
  const textColor = value >= 70 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-rose-600"
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#525252]">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>{value}</span>
      </div>
      <div className="h-2 w-full bg-[#f4f4f4] rounded-full overflow-hidden border border-slate-100">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width:`${pct}%` }}/>
      </div>
    </div>
  )
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────────*/
export default function App() {
  const [userName]      = useState(() => getUserName() || "Candidate")
  const [authToken]     = useState(() => getAuthToken())
  const [mainBackendUrl]= useState(() => getMainBackendUrl())
  const [sessionId,       setSessionId]   = useState(null)

  const [jobRole,    setJobRole]    = useState(INITIAL_SETUP.jobRole)
  const [customRole, setCustomRole] = useState(INITIAL_SETUP.customRole)
  const [expLevel,   setExpLevel]   = useState(INITIAL_SETUP.expLevel)
  const [phase,      setPhase]      = useState(() => DEV_RESULTS_FIXTURE?.phase || PHASE.SETUP)
  const [setupError, setSetupError] = useState("")
  const [premiumChecking, setPremiumChecking] = useState(false)
  const [premiumLocked, setPremiumLocked] = useState(false)

  const [plan,          setPlan]          = useState(() => DEV_RESULTS_FIXTURE?.plan || null)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [allQA,         setAllQA]         = useState(() => DEV_RESULTS_FIXTURE?.allQA || [])
  const [messages,      setMessages]      = useState([])
  const [aiThinking,    setAiThinking]    = useState(false)
  const [liveTranscript,setLiveTranscript]= useState("")
  const [typedAnswer,   setTypedAnswer]   = useState("")
  const [evaluation,    setEvaluation]    = useState(() => DEV_RESULTS_FIXTURE?.evaluation || null)

  const planRef       = useRef(null)
  const chatEndRef    = useRef(null)
  const processingRef = useRef(false)

  const { play: playAudio, stop: stopAudio, isSpeaking: audioPlaying, playbackProgress, initAudioCtx } = useAudioEngine()
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const [captionSlice, setCaptionSlice] = useState({ charStart: 0, charEnd: null })

  const handleSilence = useCallback(async (spokenText) => {
    if (processingRef.current) return
    if (phase !== PHASE.INTERVIEWING) return
    if (!spokenText.trim()) return
    if (audioPlaying) return
    processingRef.current = true
    await submitAnswer(spokenText)
    processingRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, audioPlaying])

  const {
    transcript, interimTranscript, isListening,
    isSupported: sttSupported, start: startSTT, stop: stopSTT,
    reset: resetSTT, getTranscript, error: sttError,
  } = useSpeechRecognition({ onSilence: handleSilence, silenceMs: 4200 })

  useEffect(() => {
    const text = [transcript, interimTranscript].join(" ").replace(/\s+/g, " ").trim()
    setLiveTranscript(text)
    if (text) setTypedAnswer(text)
  }, [transcript, interimTranscript])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }) }, [messages, aiThinking])

  useEffect(() => {
    let alive = true
    setPremiumChecking(true)
    resolvePremiumAccess({ mainBackendUrl, token: authToken })
      .then((isPremium) => { if (alive) setPremiumLocked(!isPremium) })
      .catch(() => { if (alive) setPremiumLocked(true) })
      .finally(() => { if (alive) setPremiumChecking(false) })
    return () => { alive = false }
  }, [mainBackendUrl, authToken])

  const addMessage = useCallback((role, text, meta = {}) => {
    const id = Date.now() + Math.random()
    setMessages((prev) => [...prev, { role, text, id, spoken: role !== "ai", ...meta }])
    return id
  }, [])

  const speakWait = useCallback(async (text, messageId = null, slice = null, markComplete = true) => {
    try {
      stopSTT()
      if (messageId) {
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, spoken: false } : m))
        setSpeakingMessageId(messageId)
        setCaptionSlice(slice || { charStart: 0, charEnd: null })
      }
      const blobUrl = await fetchTTSAudio(text)
      await playAudio(blobUrl)
    } catch (e) {
      console.warn("[TTS] speak failed:", e.message)
    } finally {
      if (messageId) {
        if (markComplete) {
          setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, spoken: true } : m))
        }
        setSpeakingMessageId(null)
        setCaptionSlice({ charStart: 0, charEnd: null })
      }
    }
  }, [playAudio, stopSTT])

  /* ── start interview (premium-gated) ─────────────────────────────────────── */
  const handleStart = async () => {
    const role = jobRole === "__custom__" ? customRole.trim() : jobRole
    if (!role) { setSetupError("Please select or enter a job role."); return }
    setSetupError("")
    setPremiumChecking(true)
    try {
      const isPremium = await resolvePremiumAccess({ mainBackendUrl, token: authToken })
      setPremiumLocked(!isPremium)
      if (!isPremium) {
        window.location.href = buildPricingUrl({ source: "interview" })
        return
      }
    } catch (e) {
      setSetupError("Could not verify subscription. Please try again.")
      return
    } finally {
      setPremiumChecking(false)
    }
    initAudioCtx()
    setPhase(PHASE.LOADING)
    try {
      const interviewPlan = await startInterview({ jobRole: role, experienceLevel: expLevel, userName })
      planRef.current = interviewPlan
      setPlan(interviewPlan)
      setPhase(PHASE.INTERVIEWING)

      createMainSession(mainBackendUrl, authToken, {
        role, mode:"mock",
        difficulty: expLevel === "fresher" ? "easy" : expLevel === "junior" ? "medium" : "hard",
        questionCount: interviewPlan.total,
      })
      .then(res => { if (res.session_id) setSessionId(res.session_id) })
      .catch(err => console.warn("Session sync:", err.message))

      const greetingId = addMessage("ai", interviewPlan.greeting, { isGreeting: true })
      await speakWait(interviewPlan.greeting, greetingId)
      await new Promise((r) => setTimeout(r, 400))

      const q0 = interviewPlan.questions[0]
      const q0Id = addMessage("ai", q0.text, { questionIndex: 0, category: q0.category, type: q0.type })
      await speakWait(q0.text, q0Id)

      resetSTT(); startSTT()
    } catch (e) {
      setSetupError(`Failed to start: ${e.message}`)
      setPhase(PHASE.SETUP)
    }
  }

  /* ── submit answer ────────────────────────────────────────────────────────── */
  const submitAnswer = async (answer) => {
    const curPlan = planRef.current
    const qIndex  = currentQIndex
    if (!curPlan || !answer.trim()) return

    const question = curPlan.questions[qIndex]
    stopSTT(); resetSTT(); setLiveTranscript(""); setTypedAnswer("")
    addMessage("user", answer)
    setAiThinking(true)

    const updatedQA = [...allQA, { question: question.text, answer }]
    setAllQA(updatedQA)

    try {
      const result = await reactToAnswer({
        jobRole: curPlan.job_role, question: question.text,
        userAnswer: answer, questionIndex: qIndex,
        totalQuestions: curPlan.total, allQA: updatedQA,
      })
      setAiThinking(false)

      if (result.reaction) {
        const reactionId = addMessage("ai", result.reaction, { isReaction: true })
        await speakWait(result.reaction, reactionId)
        await new Promise((r) => setTimeout(r, 600))
      }

      if (result.is_last) {
        setPhase(PHASE.EVALUATING)
        try {
          const evalResult = await evaluateInterview({
            jobRole: curPlan.job_role, experienceLevel: curPlan.experience_level, allQA: updatedQA,
          })
          setEvaluation(evalResult)

          if (sessionId) {
            const mappedScores = {
              content_score:    evalResult.scores?.technical_knowledge || 0,
              keyword_score:    evalResult.scores?.answer_relevance || 0,
              grammar_score:    evalResult.scores?.communication_clarity || 0,
              confidence_score: evalResult.scores?.confidence || 0,
              pace_score: 80,
            }
            finalizeMainSession(mainBackendUrl, authToken, sessionId, {
              totalScore:     evalResult.overall_score || 0,
              avgWpm:         0,
              fillerWordCount:0,
              metricScores:   mappedScores,
            }).catch(err => console.warn("Finalize sync:", err.message))
          }
          setPhase(PHASE.RESULTS)
        } catch (err) {
          setEvaluation({ error: err.message })
          setPhase(PHASE.RESULTS)
        }
      } else {
        const nextIdx = qIndex + 1
        setCurrentQIndex(nextIdx)
        const nextQ = curPlan.questions[nextIdx]
        if (nextQ) {
          const fullTxt = result.transition ? `${result.transition} ${nextQ.text}` : nextQ.text
          const nextId = addMessage("ai", fullTxt, {
            questionIndex: nextIdx,
            category: nextQ.category,
            type: nextQ.type,
          })
          if (result.transition) {
            const bridgeLen = result.transition.length
            await speakWait(result.transition, nextId, { charStart: 0, charEnd: bridgeLen }, false)
            await new Promise((r) => setTimeout(r, 350))
            await speakWait(nextQ.text, nextId, { charStart: bridgeLen + 1, charEnd: fullTxt.length })
          } else {
            await speakWait(nextQ.text, nextId)
          }
        }
        resetSTT(); startSTT()
      }
    } catch (e) {
      setAiThinking(false)
      console.error("[submitAnswer]", e)
      resetSTT(); startSTT()
    }
  }

  const handleManualSubmit = async () => {
    if (processingRef.current || phase !== PHASE.INTERVIEWING || audioPlaying || aiThinking) return
    const answer = (typedAnswer || getTranscript() || liveTranscript).replace(/\s+/g, " ").trim()
    if (!answer) return
    processingRef.current = true
    await submitAnswer(answer)
    processingRef.current = false
  }

  /* ── render ──────────────────────────────────────────────────────────────── */
  if (phase === PHASE.SETUP || phase === PHASE.LOADING) {
    return <SetupScreen
      jobRole={jobRole} setJobRole={setJobRole}
      customRole={customRole} setCustomRole={setCustomRole}
      expLevel={expLevel} setExpLevel={setExpLevel}
      onStart={handleStart}
      loading={phase === PHASE.LOADING || premiumChecking}
      checkingPremium={premiumChecking}
      error={setupError}
      userName={userName}
      isPremiumLocked={premiumLocked}
    />
  }

  if (phase === PHASE.EVALUATING) return <EvaluatingScreen />

  if (phase === PHASE.RESULTS && evaluation)
    return <ResultsScreen evaluation={evaluation} jobRole={plan?.job_role||""} allQA={allQA} />

  /* ── INTERVIEWING ─────────────────────────────────────────────────────────── */
  const progress = plan ? (currentQIndex / plan.total) * 100 : 0

  return (
    <div className="rg h-screen bg-[#fcfcfc] rg-grid-bg flex flex-col overflow-hidden">
      
      {/* Dynamic Header */}
      <header className="h-14 bg-white border-b border-[#e4e4e4] flex items-center justify-between px-4 sm:px-6 relative z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#0a0a0a] rounded-md flex items-center justify-center text-white font-bold text-xs">N</div>
          <span className="font-bold text-[#0a0a0a] text-sm">Nyrvexa AI</span>
          <span className="text-[#e4e4e4] text-md">·</span>
          <span className="text-xs font-semibold text-[#8b8b8b] hidden sm:inline">HR Mock Interview</span>
        </div>
        <div className="flex items-center gap-3">
          {plan?.job_role && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 uppercase">
              {plan.job_role}
            </span>
          )}
          <span className="text-xs font-bold text-[#525252] tracking-wide whitespace-nowrap">
            Q {Math.min(currentQIndex + 1, plan?.total || 1)} / {plan?.total || 0}
          </span>
          <div className="w-20 sm:w-28 h-1.5 bg-[#f4f4f4] rounded-full overflow-hidden border border-slate-100">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width:`${progress}%` }}/>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Sticky Panel */}
        <aside className="w-[280px] shrink-0 border-r border-[#e4e4e4] bg-white flex flex-col justify-between p-5 overflow-y-auto hidden md:flex">
          <div className="space-y-6 w-full">
            
            {/* Avatar & Status */}
            <div className="flex flex-col items-center">
              <LottieAvatar isSpeaking={audioPlaying} isThinking={aiThinking} isListening={isListening} size={150} />
              
              {/* Mic Wave Animation below Anya */}
              <div className="mt-3">
                <MicWave isListening={isListening} />
              </div>
            </div>

            {/* Stage-themed Progress Map */}
            {plan && (
              <div className="w-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-2.5">Progress Map</p>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto roadmap-scroll pr-1">
                  {plan.questions.map((q, i) => {
                    const isPassed = i < currentQIndex;
                    const isCurrent = i === currentQIndex;
                    let bgCls = "bg-slate-50 border-[#e4e4e4] text-[#8b8b8b]";
                    if (isPassed) bgCls = "bg-blue-50/70 border-blue-200 text-blue-700";
                    if (isCurrent) bgCls = "bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm font-bold scale-[1.02]";
                    return (
                      <div key={i} className={`flex items-center gap-2.5 border rounded-lg p-2 text-[11px] transition-all ${bgCls}`}>
                        <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${isCurrent ? 'bg-white text-black' : isPassed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate font-semibold max-w-[170px] uppercase text-[10px]">{q.category || `Question ${i + 1}`}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-2.5 text-left w-full mt-4">
            <p className="text-[10px] font-bold text-[#111] flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-600" />
              Interview Tip
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-[#6b6b6b]">
              Anya will automatically capture your answer after you finish speaking. You can speak naturally.
            </p>
          </div>
        </aside>

        {/* Right Main Panel (Chat and Transcription) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfc]">
          
          {/* Scrollable Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 roadmap-scroll">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                speakingMessageId={speakingMessageId}
                captionProgress={playbackProgress}
                captionSlice={captionSlice}
              />
            ))}
            {aiThinking && <ThinkingBubble/>}
            <div ref={chatEndRef}/>
          </div>

          {/* Voice Input Panel */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#e4e4e4] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] shrink-0">
            {sttError && (
              <div className="max-w-xl mx-auto mb-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{sttError}</span>
              </div>
            )}
            
            {/* Listening Status Bar */}
            <div className="max-w-xl mx-auto flex items-center justify-center">
              <div className={`flex items-center gap-2.5 py-2 px-4 rounded-full border text-xs font-semibold shadow-xs transition-all duration-300 ${
                isListening ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : audioPlaying ? "bg-purple-50 border-purple-200 text-purple-700"
                  : aiThinking ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isListening ? "bg-emerald-500 animate-pulse"
                    : audioPlaying ? "bg-purple-500"
                    : aiThinking ? "bg-amber-500"
                    : "bg-slate-400"
                }`} />
                <span>
                  {isListening ? "Listening — speak your answer"
                    : audioPlaying ? "Anya is speaking…"
                    : aiThinking ? "Processing…"
                    : "Waiting…"}
                </span>
              </div>
            </div>

            <div className="max-w-xl mx-auto mt-3 space-y-2">
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder={sttSupported ? "Speak when ready. You can correct the transcript here before it submits." : "Speech recognition is not supported here. Type your answer and submit."}
                disabled={audioPlaying || aiThinking}
                className="w-full min-h-[72px] resize-none rounded-xl border border-[#e4e4e4] bg-[#fcfcfc] p-3 text-sm text-[#374151] leading-relaxed shadow-inner outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-[10px] text-[#8b8b8b] text-center sm:text-left">
                  {sttSupported
                    ? "Auto-submit waits for a natural pause. Edit the transcript if recognition misses words."
                    : "Phone/browser fallback: type your answer manually."}
                </p>
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={!typedAnswer.trim() || audioPlaying || aiThinking || processingRef.current}
                  className="w-full sm:w-auto rounded-lg bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:bg-[#d4d4d4]"
                >
                  Submit answer
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ─── CHAT BUBBLES ───────────────────────────────────────────────────────────*/
function ChatBubble({ msg, speakingMessageId, captionProgress, captionSlice }) {
  const ai = msg.role === "ai"
  const isLiveCaption = ai && msg.id === speakingMessageId

  let body = msg.text
  if (isLiveCaption) {
    body = (
      <SyncedCaption
        text={msg.text}
        progress={captionProgress}
        isActive
        charStart={captionSlice?.charStart ?? 0}
        charEnd={captionSlice?.charEnd ?? undefined}
      />
    )
  }

  if (ai && !msg.spoken && !isLiveCaption) {
    body = <span className="text-[#8b8b8b]">Anya is preparing to speak...</span>
  }

  return (
    <div className={`flex ${ai ? "justify-start" : "justify-end"} mb-4 anim-bubble-in`}>
      {ai && (
        <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold mr-2.5 mt-1 shrink-0">
          A
        </div>
      )}
      <div className={`max-w-[75%] border rounded-2xl p-3.5 shadow-xs ${
        ai ? "border-[#e4e4e4] bg-white text-[#111] rounded-tl-sm"
          : "border-purple-200 bg-purple-50/70 text-purple-900 rounded-tr-sm"
      }`}>
        {ai && !msg.isReaction && !msg.isGreeting && msg.questionIndex !== undefined && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-[9px] font-bold tracking-wider text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 uppercase">
              {msg.type||"QUESTION"}
            </span>
            {msg.category && (
              <span className="text-[9px] font-semibold text-[#8b8b8b] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 uppercase">
                {msg.category}
              </span>
            )}
          </div>
        )}
        <p className={`text-xs sm:text-sm leading-relaxed ${msg.isReaction ? "italic text-[#525252]" : ""}`}>
          {body}
        </p>
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex mb-4 anim-bubble-in">
      <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold mr-2.5 mt-1 shrink-0">
        A
      </div>
      <div className="border border-[#e4e4e4] bg-white rounded-2xl rounded-tl-sm p-4 shadow-xs">
        <div className="flex gap-1.5 items-center h-4">
          {[0,1,2].map(i=>(
            <div key={i} className="w-2 h-2 rounded-full bg-[#8b5cf6] anim-thinking" style={{ animationDelay: `${i*0.2}s` }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── SETUP SCREEN ───────────────────────────────────────────────────────────*/
function SetupScreen({ jobRole, setJobRole, customRole, setCustomRole, expLevel, setExpLevel, onStart, loading, checkingPremium, error, userName, isPremiumLocked }) {
  return (
    <div className="rg min-h-screen bg-[#fcfcfc] rg-grid-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:p-8 shadow-md relative z-10 rg-fade">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="font-bold text-[#0a0a0a] text-lg">Nyrvexa AI</span>
          {isPremiumLocked ? (
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 ml-auto inline-flex items-center gap-1">
              <Crown size={12} />
              Premium
            </span>
          ) : (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 ml-auto">HR MOCK</span>
          )}
        </div>

        {/* Lottie Avatar Wrapper */}
        <div className="flex justify-center mb-6">
          <LottieAvatar isSpeaking={false} isThinking={false} isListening={false} size={150} />
        </div>

        {/* Greeting / Info */}
        <div className="text-center mb-6">
          <h1 className="rg-serif text-2xl sm:text-3xl text-[#0a0a0a] font-normal leading-tight">
            Hi {userName}! Meet Anya
          </h1>
          <p className="mt-2 text-[#525252] text-sm leading-relaxed max-w-md mx-auto">
            Your AI HR Interviewer. Anya conducts dynamic mock sessions with real-time audio playback, custom evaluations, and instant scoring.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Picker */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Job Role</label>
          <select
            className="w-full rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] py-2.5 px-3 text-sm text-[#111] placeholder-[#a3a3a3] outline-none transition focus:border-[#0a0a0a] focus:bg-white"
            value={jobRole}
            onChange={e => setJobRole(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a role…</option>
            {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            <option value="__custom__">Other (type below)</option>
          </select>
          {jobRole === "__custom__" && (
            <input
              className="mt-2 w-full rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] py-2.5 px-3 text-sm text-[#111] placeholder-[#a3a3a3] outline-none transition focus:border-[#0a0a0a] focus:bg-white"
              placeholder="Type your role…"
              value={customRole}
              onChange={e => setCustomRole(e.target.value)}
              disabled={loading}
            />
          )}
        </div>

        {/* Experience Picker */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Experience Level</label>
          <div className="grid grid-cols-2 gap-2">
            {EXP_LEVELS.map(({ value, label }) => {
              const isActive = expLevel === value;
              let themeClass = "";
              if (isActive) {
                if (value === "fresher") themeClass = "border-blue-500 bg-blue-50 text-blue-700 shadow-xs";
                else if (value === "junior") themeClass = "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs";
                else if (value === "mid") themeClass = "border-amber-500 bg-amber-50 text-amber-700 shadow-xs";
                else if (value === "senior") themeClass = "border-purple-500 bg-purple-50 text-purple-700 shadow-xs";
              } else {
                themeClass = "border-[#e4e4e4] bg-white text-[#525252] hover:border-slate-400";
              }
              return (
                <button
                  key={value}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${themeClass}`}
                  onClick={() => setExpLevel(value)}
                  disabled={loading}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {[
            "Voice enabled",
            "Indian accent mic-max",
            "Dynamic evaluation report",
            "Mock session parameters"
          ].map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              <Check size={10} className="shrink-0" />
              {tag}
            </span>
          ))}
        </div>

        {isPremiumLocked && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-xs text-amber-900 leading-relaxed flex gap-2">
            <Lock size={14} className="shrink-0 mt-0.5 text-amber-700" />
            <span>
              Mock interviews with Anya are included in <strong>Nyrvexa Premium</strong>. Configure your role below, then unlock to start your session.
            </span>
          </div>
        )}

        {/* Start Button */}
        <button
          className={`w-full rounded-lg py-3.5 px-4 text-sm font-semibold transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 ${
            isPremiumLocked
              ? "bg-[#0a0a0a] hover:bg-[#222] text-white"
              : "bg-[#0a0a0a] hover:bg-[#222] text-white"
          }`}
          onClick={onStart}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {checkingPremium ? "Checking your plan…" : "Preparing interview…"}
            </>
          ) : isPremiumLocked ? (
            <>
              <Lock size={16} />
              Unlock &amp; Start Interview
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              Start Mock Interview with Anya
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="mt-3 text-[10px] text-[#8b8b8b] text-center">
          {isPremiumLocked
            ? "Premium required · You’ll be taken to pricing if your plan isn’t active."
            : "Best experienced in Chrome or Edge · Please grant microphone permissions when prompted."}
        </p>
      </div>
    </div>
  )
}

/* ─── EVALUATING ─────────────────────────────────────────────────────────────*/
function EvaluatingScreen() {
  return (
    <div className="rg min-h-screen bg-[#fcfcfc] rg-grid-bg flex items-center justify-center p-4">
      <div className="text-center max-w-sm p-6 bg-white border border-[#e4e4e4] rounded-2xl shadow-sm relative z-10 rg-fade">
        <LottieAvatar isSpeaking={false} isThinking={true} isListening={false} size={150} />
        <div className="mt-6 flex justify-center">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
        <h2 className="rg-serif text-xl sm:text-2xl text-[#0a0a0a] mt-4 font-normal">
          Evaluating Performance
        </h2>
        <p className="mt-2 text-[#6b6b6b] text-xs leading-relaxed">
          Anya is reviewing your responses, technical relevance, and clarity. This process will take 15–20 seconds.
        </p>
      </div>
    </div>
  )
}

/* ─── RESULTS ────────────────────────────────────────────────────────────────*/
function ResultsScreen({ evaluation, jobRole, allQA }) {
  const [tab, setTab] = useState(() => {
    if (!import.meta.env.DEV || typeof window === "undefined") return "overview"
    const requested = new URLSearchParams(window.location.search).get("demoTab")
    return ["overview", "scores", "questions", "improvements"].includes(requested) ? requested : "overview"
  })

  if (evaluation.error) return (
    <div className="rg min-h-screen bg-[#fcfcfc] rg-grid-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md p-6 bg-white border border-rose-200 rounded-2xl shadow-md relative z-10 rg-fade">
        <AlertCircle size={32} className="mx-auto text-rose-600" />
        <h2 className="rg-serif text-lg font-bold text-rose-700 mt-4">Could not generate evaluation</h2>
        <p className="mt-2 text-xs text-[#525252] leading-relaxed">{evaluation.error}</p>
        <button
          className="mt-6 w-full rounded-lg bg-[#0a0a0a] hover:bg-[#222] text-white py-2.5 text-xs font-semibold transition"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    </div>
  )

  const { overall_score=0, hire_recommendation="", summary="", scores={},
    strengths=[], improvements=[], per_question=[], next_steps=[], motivational_note="" } = evaluation

  const recColors = {
    "Strong Yes": { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
    "Yes": { border: "border-emerald-100", bg: "bg-emerald-50/50", text: "text-emerald-600" },
    "Maybe": { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700" },
    "No": { border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700" }
  }
  const theme = recColors[hire_recommendation] || { border: "border-[#e4e4e4]", bg: "bg-slate-50", text: "text-[#525252]" }

  return (
    <div className="rg min-h-screen overflow-x-hidden bg-[#fcfcfc] pb-20">
      
      {/* Results Header */}
      <header className="h-14 bg-white border-b border-[#e4e4e4] flex items-center justify-between gap-3 px-4 sm:px-6 shadow-sm overflow-hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="w-7 h-7 bg-[#0a0a0a] rounded-md flex items-center justify-center text-white font-bold text-xs">N</div>
          <span className="min-w-0 truncate font-bold text-sm text-[#0a0a0a]">Interview Results</span>
        </div>
        <span className="max-w-[42vw] truncate rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 uppercase">
          {jobRole}
        </span>
      </header>

      {/* Main Score Widget Card */}
      <div className="mx-auto mt-8 w-full max-w-4xl space-y-6 px-4 sm:px-6">
        
        <div className="w-full max-w-[calc(100vw-32px)] min-w-0 bg-white border border-[#e4e4e4] rounded-2xl p-6 sm:max-w-none sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8 rg-fade">
          
          {/* Dial Container */}
          <div className="relative inline-flex shrink-0">
            <svg viewBox="0 0 120 120" className="w-28 h-28">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f4f4f4" strokeWidth="8"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#6366f1" strokeWidth="8"
                strokeDasharray={`${(overall_score/100)*326.7} 326.7`}
                strokeLinecap="round" transform="rotate(-90 60 60)"
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[#0a0a0a]">{overall_score}</span>
              <span className="text-[9px] font-bold text-[#8b8b8b] uppercase">SCORE</span>
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="rg-serif text-2xl text-[#111]">Anya's Assessment</h2>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${theme.border} ${theme.bg} ${theme.text}`}>
                {hire_recommendation}
              </span>
            </div>
            <p className="w-full max-w-[calc(100vw-80px)] whitespace-normal break-words text-xs leading-relaxed text-[#525252] sm:max-w-xl sm:text-sm">
              {summary}
            </p>
          </div>
        </div>

        {/* Custom Tab Bar */}
        <div className="grid w-full max-w-full grid-cols-4 border-b border-[#e4e4e4] pt-2 sm:mx-auto sm:max-w-md">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "scores", label: "Skills", icon: BarChart2 },
            { id: "questions", label: "Questions", icon: FileText },
            { id: "improvements", label: "Feedback", icon: Sparkles }
          ].map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex min-w-0 items-center justify-center gap-1 px-1.5 py-3 border-b-2 text-[11px] font-semibold capitalize transition-all sm:gap-1.5 sm:px-4 sm:text-xs ${
                  isActive
                    ? "border-[#0a0a0a] text-[#0a0a0a] font-bold"
                    : "border-transparent text-[#8b8b8b] hover:text-[#0a0a0a]"
                }`}
              >
                <Icon size={12} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab Panels */}
        <div className="mx-auto max-w-3xl pt-4 rg-fade">
          
          {/* Overview Panel */}
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6 items-start">
              
              {/* Radar chart */}
              <div className="w-full max-w-[calc(100vw-32px)] bg-white border border-[#e4e4e4] rounded-2xl p-5 shadow-xs flex flex-col items-center sm:max-w-none">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] self-start mb-4">Competency Map</p>
                <RadarChart scores={scores}/>
              </div>

              {/* Strengths and Anya's comment */}
              <div className="space-y-4">
                
                {/* Strengths card */}
                <div className="w-full max-w-[calc(100vw-32px)] bg-white border border-[#e4e4e4] rounded-2xl p-5 shadow-xs sm:max-w-none">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-3">Key Strengths</p>
                  <div className="space-y-2.5">
                    {strengths.map((s,i)=>(
                    <div key={i} className="flex min-w-0 gap-2.5 items-start">
                        <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-[9px] shrink-0 font-black">✓</span>
                        <span className="min-w-0 break-words text-xs text-[#3a3a3a] leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anya note */}
                <div className="bg-purple-50/75 border border-purple-200 rounded-xl p-4 flex gap-3 shadow-xs">
                  <MessageSquare size={16} className="text-purple-600 shrink-0 mt-0.5" />
                  <p className="margin-0 text-xs text-purple-900 leading-relaxed italic">
                    "{motivational_note}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scores Panel */}
          {tab === "scores" && (
            <div className="grid md:grid-cols-2 gap-6 items-start">
              
              {/* Score card */}
              <div className="bg-white border border-[#e4e4e4] rounded-2xl p-5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-4">Score Breakdown</p>
                {Object.entries(scores).map(([k,v])=>(
                  <ScoreBar key={k} label={k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} value={v}/>
                ))}
              </div>

              {/* Next steps card */}
              <div className="bg-white border border-[#e4e4e4] rounded-2xl p-5 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8b8b] mb-3">Recommended Next Steps</p>
                <div className="space-y-3">
                  {next_steps.map((s,i)=>(
                    <div key={i} className="flex gap-3 items-start bg-slate-50/50 border border-slate-100 rounded-lg p-3 shadow-2xs">
                      <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i+1}
                      </div>
                      <p className="margin-0 text-xs text-[#333] leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Questions Panel */}
          {tab === "questions" && (
            <div className="space-y-4">
              {per_question.map((pq,i)=>{
                const qa=allQA[i]||{}
                const sc=pq.score||0
                let badgeCls = "bg-rose-50 border-rose-200 text-rose-700";
                if (sc >= 7) badgeCls = "bg-emerald-50 border-emerald-200 text-emerald-700";
                else if (sc >= 5) badgeCls = "bg-amber-50 border-amber-200 text-amber-700";

                return (
                  <div key={i} className="bg-white border border-[#e4e4e4] rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5 transition hover:shadow-sm">
                    <div className="flex justify-between items-center border-b border-[#f4f4f4] pb-2">
                      <span className="text-[10px] font-bold text-[#8b8b8b] uppercase">Question {i + 1}</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badgeCls}`}>
                        Score: {sc}/10
                      </span>
                    </div>
                    <div className="text-xs space-y-2">
                      <p className="text-[#111]"><strong className="text-[#8b8b8b] font-bold uppercase mr-1.5 text-[9px]">Q:</strong> {pq.question || qa.question}</p>
                      <p className="text-[#525252] bg-slate-50 rounded-lg p-2.5 border border-slate-100"><strong className="text-purple-600 font-bold uppercase mr-1.5 text-[9px]">Answered:</strong> {qa.answer || "—"}</p>
                      <p className="text-[#111] leading-relaxed"><strong className="text-blue-600 font-bold uppercase mr-1.5 text-[9px]">Feedback:</strong> {pq.feedback}</p>
                      {pq.what_was_missing && (
                        <p className="text-amber-800 bg-amber-50/50 border border-amber-100 rounded-lg p-2.5 text-[11px] leading-relaxed">
                          <strong className="text-amber-600 font-bold uppercase mr-1.5 text-[9px]">Missed elements:</strong> {pq.what_was_missing}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Improvements Panel */}
          {tab === "improvements" && (
            <div className="space-y-4">
              {improvements.map((imp,i)=>(
                <div key={i} className="bg-white border border-[#e4e4e4] rounded-xl p-4 sm:p-5 shadow-xs space-y-2.5">
                  <div className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase">
                    {imp.area}
                  </div>
                  <p className="text-xs text-rose-700"><strong className="text-rose-500 uppercase mr-1 text-[9px]">Issue:</strong> {imp.issue}</p>
                  <p className="text-xs text-emerald-700"><strong className="text-emerald-500 uppercase mr-1 text-[9px]">Fix:</strong> {imp.how_to_fix}</p>
                  {imp.resource && (
                    <a
                      href={imp.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline border border-blue-100 bg-blue-50/50 px-2.5 py-1 rounded-md mt-1"
                    >
                      <BookOpen size={10} />
                      Resource Guide
                      <ExternalLink size={8} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="text-center pt-8">
          <button
            className="rounded-lg bg-[#0a0a0a] hover:bg-[#222] text-white py-3.5 px-8 text-sm font-semibold transition shadow-sm inline-flex items-center gap-2"
            onClick={()=>window.location.reload()}
          >
            <RefreshCw size={15} />
            Practice Another Interview
          </button>
        </div>
      </div>
    </div>
  )
}
