import api from './api'

const INTERVIEW_START_TIMEOUT = 90000
const INTERVIEW_REACT_TIMEOUT = 90000
const INTERVIEW_EVALUATE_TIMEOUT = 180000
const INTERVIEW_TTS_TIMEOUT = 90000

function readPremiumFromStorage() {
  try {
    for (const key of ['nirvexa_user', 'nyrvexa_user', 'user']) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (parsed?.is_premium === true || parsed?.isPremium === true) return true
      if (parsed?.is_premium === false || parsed?.isPremium === false) return false
    }
  } catch (_) {}
  return null
}

export function buildPricingUrl({ source = 'interview', returnTo } = {}) {
  const url = new URL('/pricing', window.location.origin)
  url.searchParams.set('locked', source)
  if (returnTo || typeof window !== 'undefined') {
    url.searchParams.set('returnTo', returnTo || window.location.href)
  }
  return `${url.pathname}${url.search}`
}

export async function resolvePremiumAccess() {
  const cached = readPremiumFromStorage()
  if (cached === true) return true

  try {
    const res = await api.get('/auth/me')
    const user = res.data?.data?.user || res.data?.user || res.data
    const premium = Boolean(user?.is_premium ?? user?.isPremium)
    try {
      localStorage.setItem('nirvexa_user', JSON.stringify({ ...user, is_premium: premium, isPremium: premium }))
    } catch (_) {}
    return premium
  } catch (_) {
    return cached === true
  }
}

export async function startInterview({ jobRole, experienceLevel, userName }) {
  const res = await api.post('/interview/start', {
    job_role: jobRole,
    experience_level: experienceLevel,
    user_name: userName,
  }, { timeout: INTERVIEW_START_TIMEOUT })
  return res.data
}

export async function reactToAnswer({ jobRole, question, userAnswer, questionIndex, totalQuestions, allQA }) {
  const res = await api.post('/interview/react', {
    job_role: jobRole,
    question,
    user_answer: userAnswer,
    question_index: questionIndex,
    total_questions: totalQuestions,
    all_qa: allQA,
  }, { timeout: INTERVIEW_REACT_TIMEOUT })
  return res.data
}

export async function evaluateInterview({ jobRole, experienceLevel, allQA }) {
  const res = await api.post('/interview/evaluate', {
    job_role: jobRole,
    experience_level: experienceLevel,
    all_qa: allQA,
  }, { timeout: INTERVIEW_EVALUATE_TIMEOUT })
  return res.data
}

export async function fetchTTSAudio(text, voice = 'ananya') {
  const res = await api.post('/interview/speak', { text, voice }, { responseType: 'blob', timeout: INTERVIEW_TTS_TIMEOUT })
  return URL.createObjectURL(res.data)
}

export async function createMainSession(_mainBackendUrl, _token, { role, mode, difficulty, questionCount }) {
  const res = await api.post('/interview/session', {
    role,
    mode,
    difficulty,
    question_count: questionCount,
  })
  return res.data
}

export async function finalizeMainSession(_mainBackendUrl, _token, sessionId, { totalScore, avgWpm, fillerWordCount, metricScores }) {
  const res = await api.put(`/interview/session/${sessionId}`, {
    total_score: totalScore,
    avg_wpm: avgWpm,
    filler_word_count: fillerWordCount,
    metric_scores: metricScores,
  })
  return res.data
}
