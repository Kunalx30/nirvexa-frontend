import api from './api'

let activeAudio = null

export function stopInterviewTTS() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ''
    activeAudio = null
  }
  window.speechSynthesis?.cancel()
}

function browserFallback(text, options = {}) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) {
      resolve()
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-IN'
    utterance.rate = options.rate ?? 1
    utterance.pitch = options.pitch ?? 1.02

    // Try to find a female Indian English voice or a generic female voice
    const voices = window.speechSynthesis.getVoices()
    let selectedVoice = voices.find(v => v.lang === 'en-IN' && (v.name.includes('Heera') || v.name.toLowerCase().includes('female')))
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onend = resolve
    utterance.onerror = resolve
    window.speechSynthesis.speak(utterance)
  })
}

export async function playInterviewTTS(text, options = {}) {
  if (!text) return

  try {
    stopInterviewTTS()
    const response = await api.post(
      '/interview/speak',
      { text, voice: options.voice || 'ananya' },
      { responseType: 'blob', timeout: 60000 }
    )

    const audioBlob = response.data
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    activeAudio = audio
    audio.playbackRate = options.playbackRate ?? 1

    return await new Promise((resolve) => {
      audio.onended = () => {
        activeAudio = null
        URL.revokeObjectURL(audioUrl)
        resolve()
      }
      audio.onerror = () => {
        activeAudio = null
        URL.revokeObjectURL(audioUrl)
        resolve(browserFallback(text, options))
      }
      audio.play().catch(() => {
        activeAudio = null
        URL.revokeObjectURL(audioUrl)
        resolve(browserFallback(text, options))
      })
    })
  } catch (error) {
    console.error('Interview TTS failed, using browser fallback:', error)
    return browserFallback(text, options)
  }
}
