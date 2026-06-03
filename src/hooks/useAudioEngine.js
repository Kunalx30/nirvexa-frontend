import { useState, useRef, useCallback, useEffect } from "react"

/**
 * HTML5 audio engine with smooth playback progress (rAF) for captions.
 */
export default function useAudioEngine() {
  const audioRef = useRef(null)
  const resolveRef = useRef(null)
  const rafRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)

  const cancelRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const startProgressLoop = useCallback(() => {
    cancelRaf()
    const tick = () => {
      const audio = audioRef.current
      if (audio?.duration && Number.isFinite(audio.duration)) {
        setPlaybackProgress(Math.min(1, audio.currentTime / audio.duration))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const initAudioCtx = useCallback(() => {
    if (audioRef.current) return
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = 0
    audio.src =
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA"
    audio
      .play()
      .then(() => {
        audio.pause()
        audio.volume = 1
      })
      .catch(() => {
        audio.volume = 1
      })
  }, [])

  const stop = useCallback(() => {
    cancelRaf()
    if (resolveRef.current) {
      resolveRef.current()
      resolveRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.ontimeupdate = null
    }
    setIsSpeaking(false)
    setPlaybackProgress(0)
  }, [])

  const play = useCallback(
    async (url, { onStart } = {}) => {
      if (!audioRef.current) {
        console.error("[Audio] Not initialized — call initAudioCtx() on user click")
        return
      }
      if (resolveRef.current) {
        resolveRef.current()
        resolveRef.current = null
      }
      cancelRaf()
      audioRef.current.pause()
      setIsSpeaking(false)
      setPlaybackProgress(0)

      return new Promise((resolve) => {
        resolveRef.current = resolve
        const audio = audioRef.current

        const finish = () => {
          cancelRaf()
          audio.ontimeupdate = null
          resolveRef.current = null
          setIsSpeaking(false)
          setPlaybackProgress(1)
          resolve()
        }

        audio.onloadedmetadata = () => setPlaybackProgress(0)
        audio.onplay = () => {
          setIsSpeaking(true)
          setPlaybackProgress(0)
          onStart?.()
          startProgressLoop()
        }
        audio.onended = finish
        audio.onerror = () => {
          console.error("[Audio] Error:", audio.error?.message || "unknown")
          finish()
        }

        audio.src = url
        audio.load()
        audio.play().catch((err) => {
          console.error("[Audio] play() rejected:", err.message)
          finish()
        })
      })
    },
    [startProgressLoop]
  )

  useEffect(() => () => stop(), [stop])

  return { play, stop, isSpeaking, playbackProgress, initAudioCtx }
}
