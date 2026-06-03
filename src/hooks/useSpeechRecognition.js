import { useState, useRef, useCallback, useEffect } from "react"

function cleanSpeechText(value) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

function mergeSpeechText(current, incoming) {
  const base = cleanSpeechText(current)
  const next = cleanSpeechText(incoming)
  if (!base) return next
  if (!next) return base

  const baseLower = base.toLowerCase()
  const nextLower = next.toLowerCase()
  if (baseLower === nextLower) return base
  if (baseLower.endsWith(nextLower)) return base
  if (nextLower.startsWith(baseLower)) return next

  const baseWords = base.split(" ")
  const nextWords = next.split(" ")
  const baseFolded = baseWords.map((w) => w.toLowerCase())
  const nextFolded = nextWords.map((w) => w.toLowerCase())
  const maxOverlap = Math.min(baseWords.length, nextWords.length)

  for (let size = maxOverlap; size > 0; size--) {
    const baseTail = baseFolded.slice(baseFolded.length - size).join(" ")
    const nextHead = nextFolded.slice(0, size).join(" ")
    if (baseTail === nextHead) {
      return cleanSpeechText([...baseWords, ...nextWords.slice(size)].join(" "))
    }
  }

  return cleanSpeechText(`${base} ${next}`)
}

/**
 * Enhanced Web Speech API hook for Nyrvexa AI Interviewer.
 * - Silence detection: auto-submits after 2.5s of no speech
 * - Auto-restart: mic stays alive across browser 60s limit
 * - maxAlternatives=3: picks highest confidence result (fixes Indian name mishearing)
 * - onSilence callback: called when user stops speaking
 */
export default function useSpeechRecognition({ onSilence, silenceMs = 2500 } = {}) {
  const [transcript,        setTranscript]        = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening,       setIsListening]       = useState(false)
  const [error,             setError]             = useState(null)

  const recognitionRef   = useRef(null)
  const finalRef         = useRef("")
  const interimRef       = useRef("")
  const silenceTimerRef  = useRef(null)
  const shouldRestartRef = useRef(false)
  const onSilenceRef     = useRef(onSilence)
  const activeRef        = useRef(false)
  const submittedRef     = useRef(false)

  useEffect(() => { onSilenceRef.current = onSilence }, [onSilence])

  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  const clearSilence = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
  }, [])

  const armSilence = useCallback(() => {
    clearSilence()
    silenceTimerRef.current = setTimeout(() => {
      const text = mergeSpeechText(finalRef.current, interimRef.current)
      if (text && onSilenceRef.current && !submittedRef.current) {
        submittedRef.current = true
        onSilenceRef.current(text)
      }
    }, silenceMs)
  }, [clearSilence, silenceMs])

  const appendFinal = useCallback((chunk) => {
    const text = cleanSpeechText(chunk)
    if (!text) return

    finalRef.current = mergeSpeechText(finalRef.current, text)
    setTranscript(finalRef.current)
  }, [])

  const buildRecognition = useCallback(() => {
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous      = true
    rec.interimResults  = true
    rec.lang            = "en-IN"
    rec.maxAlternatives = 3

    rec.onstart = () => { setIsListening(true); setError(null) }

    rec.onend = () => {
      setIsListening(false)
      setInterimTranscript("")
      if (shouldRestartRef.current && activeRef.current) {
        setTimeout(() => {
          if (activeRef.current && recognitionRef.current) {
            try { recognitionRef.current.start() } catch (_) {}
          }
        }, 200)
      }
    }

    rec.onerror = (e) => {
      if (["no-speech","aborted","network"].includes(e.error)) return
      setError(`Mic error: ${e.error}`)
      setIsListening(false)
      activeRef.current = false
    }

    rec.onresult = (e) => {
      clearSilence()
      let interim = "", newFinal = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          // pick highest confidence alternative
          let best = result[0].transcript, bestConf = result[0].confidence || 0
          for (let j = 1; j < result.length; j++) {
            if ((result[j].confidence || 0) > bestConf) { best = result[j].transcript; bestConf = result[j].confidence }
          }
          newFinal += best + " "
        } else { interim += result[0].transcript }
      }
      if (newFinal) appendFinal(newFinal)
      interimRef.current = cleanSpeechText(interim)
      setInterimTranscript(interimRef.current)
      if (newFinal || interimRef.current) armSilence()
    }
    return rec
  }, [clearSilence, armSilence, appendFinal])

  const start = useCallback(() => {
    if (!isSupported) { setError("Use Chrome or Edge for microphone support."); return }
    if (recognitionRef.current) { try { recognitionRef.current.abort() } catch (_) {} }
    setError(null)
    activeRef.current = true
    shouldRestartRef.current = true
    submittedRef.current = false
    const rec = buildRecognition()
    recognitionRef.current = rec
    try { rec.start() } catch (e) { setError("Could not start microphone. Check browser permissions.") }
  }, [isSupported, buildRecognition])

  const stop = useCallback(() => {
    activeRef.current = false
    shouldRestartRef.current = false
    clearSilence()
    if (recognitionRef.current) { try { recognitionRef.current.stop() } catch (_) {} }
    setIsListening(false)
    setInterimTranscript("")
  }, [clearSilence])

  const reset = useCallback(() => {
    stop()
    finalRef.current = ""
    interimRef.current = ""
    submittedRef.current = false
    setTranscript("")
    setInterimTranscript("")
    setError(null)
  }, [stop])

  const getTranscript = useCallback(() => {
    return mergeSpeechText(finalRef.current, interimRef.current)
  }, [])

  useEffect(() => {
    return () => {
      activeRef.current = false
      shouldRestartRef.current = false
      clearSilence()
      if (recognitionRef.current) { try { recognitionRef.current.abort() } catch (_) {} }
    }
  }, [clearSilence])

  return { transcript, interimTranscript, isListening, isSupported, start, stop, reset, getTranscript, error }
}
