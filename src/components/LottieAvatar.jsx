import { useEffect, useState, useRef } from "react"
import LottieModule from "lottie-react"

const Lottie = LottieModule?.default ?? LottieModule

const LOTTIE_PATH = "/avatar/Avatar%20asian%20woman.json"

export default function LottieAvatar({ isSpeaking, isThinking, isListening, size = 220 }) {
  const [animationData, setAnimationData] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const lottieRef = useRef(null)

  useEffect(() => {
    fetch(LOTTIE_PATH)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setAnimationData)
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    const inst = lottieRef.current
    if (!inst) return
    if (isSpeaking) {
      inst.setSpeed(1.35)
      inst.play()
    } else if (isListening || isThinking) {
      inst.setSpeed(0.85)
      inst.play()
    } else {
      inst.setSpeed(1)
      inst.play()
    }
  }, [isSpeaking, isListening, isThinking, animationData])

  const ringColor = isSpeaking ? "#7c3aed" : isListening ? "#059669" : isThinking ? "#d97706" : "#e2e8f0"
  const glow = isSpeaking
    ? "0 0 0 4px rgba(124,58,237,0.18), 0 16px 40px rgba(99,102,241,0.2)"
    : isListening
      ? "0 0 0 4px rgba(5,150,105,0.12), 0 12px 32px rgba(16,185,129,0.15)"
      : "0 10px 28px rgba(15,23,42,0.08)"

  const statusLabel = isSpeaking ? "Speaking…" : isListening ? "Listening…" : isThinking ? "Thinking…" : "Anya — HR"
  const statusColor = isSpeaking ? "#7c3aed" : isListening ? "#059669" : isThinking ? "#d97706" : "#64748b"
  const box = Math.round(size * 1.05)

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: box,
          height: box,
          borderRadius: 20,
          border: `2px solid ${ringColor}`,
          boxShadow: glow,
          background: "linear-gradient(160deg, #faf8ff 0%, #f0ecfa 100%)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.35s ease, box-shadow 0.35s ease",
        }}
      >
        {loadError ? (
          <span style={{ fontSize: 11, color: "#94a3b8", padding: 12, textAlign: "center" }}>
            Avatar file missing
          </span>
        ) : animationData ? (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop
            autoplay
            style={{ width: box - 8, height: box - 8 }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid #e9d5ff",
              borderTopColor: "#8b5cf6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: statusColor,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: ringColor,
            animation: isSpeaking || isListening ? "micPulse 1.2s infinite" : "none",
          }}
        />
        {statusLabel}
      </div>
    </div>
  )
}
