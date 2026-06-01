import { useMemo } from "react"

/**
 * Smooth word-by-word captions synced to TTS (minimal lag).
 * Keeps future/pending text visible in a low-opacity style to prevent layout shift and text disappearing.
 */
export default function SyncedCaption({
  text,
  progress = 0,
  isActive = false,
  charStart = 0,
  charEnd = null,
}) {
  const { prefix, built, pending } = useMemo(() => {
    if (!text) return { prefix: "", built: "", pending: "" }

    const end = charEnd ?? text.length
    const pre = charStart > 0 ? text.slice(0, charStart) : ""
    const sl = text.slice(charStart, end)
    const suffix = text.slice(end)

    if (!isActive) {
      return { prefix: pre + sl + suffix, built: "", pending: "" }
    }

    const p = Math.min(1, Math.max(0, progress))
    // Slight lead + linear — keeps pace with voice without feeling behind
    const target = Math.min(1, p * 1.06 + 0.02)
    const words = sl.split(/(\s+)/)
    let charBudget = Math.floor(target * sl.length)

    let activeBuilt = ""
    for (const part of words) {
      if (activeBuilt.length + part.length <= charBudget) activeBuilt += part
      else if (activeBuilt.length === 0 && part.trim()) {
        activeBuilt = part.slice(0, charBudget)
        break
      } else break
    }

    const activePending = sl.slice(activeBuilt.length)

    return {
      prefix: pre,
      built: activeBuilt,
      pending: activePending + suffix,
    }
  }, [text, progress, isActive, charStart, charEnd])

  if (!text) return null
  if (!isActive) return <span>{prefix}</span>

  const done = (prefix + built).length >= text.length

  return (
    <span style={{ transition: "opacity 0.08s ease" }}>
      <span>{prefix}{built}</span>
      {!done && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            marginLeft: 2,
            marginRight: 2,
            background: "#8b5cf6",
            opacity: 0.55,
            animation: "blink 0.9s step-end infinite",
            verticalAlign: "text-bottom",
          }}
          aria-hidden
        />
      )}
      <span className="opacity-35 select-none">{pending}</span>
    </span>
  )
}

