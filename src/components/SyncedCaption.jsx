import { useMemo } from "react"

/**
 * Smooth word-by-word captions synced to TTS (minimal lag).
 */
export default function SyncedCaption({
  text,
  progress = 0,
  isActive = false,
  charStart = 0,
  charEnd = null,
}) {
  const { prefix, slice, visible } = useMemo(() => {
    if (!text) return { prefix: "", slice: "", visible: "" }

    const end = charEnd ?? text.length
    const pre = charStart > 0 ? text.slice(0, charStart) : ""
    const sl = text.slice(charStart, end)

    if (!isActive) return { prefix: pre, slice: sl, visible: pre + sl }

    const p = Math.min(1, Math.max(0, progress))
    // Slight lead + linear — keeps pace with voice without feeling behind
    const target = Math.min(1, p * 1.06 + 0.02)
    const words = sl.split(/(\s+)/)
    let charBudget = Math.floor(target * sl.length)

    let built = ""
    for (const part of words) {
      if (built.length + part.length <= charBudget) built += part
      else if (built.length === 0 && part.trim()) {
        built = part.slice(0, charBudget)
        break
      } else break
    }

    return { prefix: pre, slice: sl, visible: pre + built }
  }, [text, progress, isActive, charStart, charEnd])

  if (!text) return null
  if (!isActive) return <span>{visible}</span>

  const done = visible.length >= (charEnd ?? text.length)

  return (
    <span style={{ transition: "opacity 0.08s ease" }}>
      {visible}
      {!done && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            marginLeft: 2,
            background: "#8b5cf6",
            opacity: 0.55,
            animation: "blink 0.9s step-end infinite",
            verticalAlign: "text-bottom",
          }}
          aria-hidden
        />
      )}
    </span>
  )
}
