import { useEffect, useRef } from 'react'

/**
 * Google Antigravity style magnetic repulsion grid.
 * Uses a concentric polar layout matching the reference.
 * Particles float continuously and stretch into dashes when repelled.
 * Phone / touch responsive.
 */

const DOT_COLORS = [
  '#4285F4', // Google Blue
  '#8AB4F8', // Light Blue
  '#9B72CB', // Purple
  '#D96570', // Red/Magenta
  '#FABB05', // Google Yellow
  '#a8a8a8', // Subtle grey
]

export default function CursorEffect() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  const raf = useRef(null)
  const dots = useRef([])
  const ready = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Tuned for better performance and organic look
    const RING_SPACING = 40
    const ARC_SPACING = 45
    const REPEL_RADIUS = 220
    const REPEL_STRENGTH = 65
    const SPRING = 0.04
    const DAMPING = 0.8

    const buildGrid = () => {
      dots.current = []
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const maxR = Math.max(canvas.width, canvas.height) * 0.75 + 100

      // Create concentric rings of particles
      for (let r = 20; r < maxR; r += RING_SPACING) {
        const circ = 2 * Math.PI * r
        const dotsInRing = Math.floor(circ / ARC_SPACING)
        
        for (let i = 0; i < dotsInRing; i++) {
          const angle = (i / dotsInRing) * Math.PI * 2
          // Organic jitter so it doesn't look too perfectly rigid
          const a = angle + (Math.random() - 0.5) * 0.15
          const radiusJitter = r + (Math.random() - 0.5) * 10
          
          const ox = cx + Math.cos(a) * radiusJitter
          const oy = cy + Math.sin(a) * radiusJitter
          
          dots.current.push({
            ox, oy,
            x: ox, y: oy,
            vx: 0, vy: 0,
            color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
            baseSize: 1 + Math.random() * 0.6,
            // Random offset for the continuous wave
            waveOffset: Math.random() * Math.PI * 2
          })
        }
      }
      ready.current = true
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      buildGrid()
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        mouse.current.x = e.touches[0].clientX
        mouse.current.y = e.touches[0].clientY
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchstart', onTouchMove, { passive: true })

    const onLeave = () => {
      mouse.current.x = -1000
      mouse.current.y = -1000
    }
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('touchend', onLeave)
    document.addEventListener('touchcancel', onLeave)

    const draw = () => {
      if (!ready.current) {
        raf.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineCap = 'round'
      
      const mx = mouse.current.x
      const my = mouse.current.y
      const time = performance.now() * 0.001

      for (const d of dots.current) {
        // Continuous organic floating motion
        const floatX = Math.sin(time * 0.5 + d.ox * 0.005 + d.waveOffset) * 12
        const floatY = Math.cos(time * 0.4 + d.oy * 0.005 + d.waveOffset) * 12
        const targetX = d.ox + floatX
        const targetY = d.oy + floatY

        // Calculate repulsion from mouse/touch
        const dx = d.x - mx
        const dy = d.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPEL_RADIUS && dist > 0) {
          const t = 1 - dist / REPEL_RADIUS
          const force = t * t * REPEL_STRENGTH
          const angle = Math.atan2(dy, dx)
          d.vx += Math.cos(angle) * force * 0.2
          d.vy += Math.sin(angle) * force * 0.2
        }

        // Spring back to target (origin + float)
        const sox = targetX - d.x
        const soy = targetY - d.y
        d.vx += sox * SPRING
        d.vy += soy * SPRING

        // Damping
        d.vx *= DAMPING
        d.vy *= DAMPING

        // Update position
        d.x += d.vx
        d.y += d.vy

        // Visual stretching based on velocity / displacement
        const displacement = Math.sqrt(sox * sox + soy * soy)
        const stretch = Math.min(displacement * 0.35, 20)
        const length = d.baseSize * 2 + stretch
        
        // Point the dash based on displacement
        const angle = displacement > 0.1 ? Math.atan2(-soy, -sox) : 0

        // Draw
        ctx.beginPath()
        const halfL = length / 2
        
        ctx.moveTo(
          d.x - Math.cos(angle) * halfL,
          d.y - Math.sin(angle) * halfL
        )
        ctx.lineTo(
          d.x + Math.cos(angle) * halfL,
          d.y + Math.sin(angle) * halfL
        )
        
        ctx.strokeStyle = d.color
        ctx.lineWidth = Math.max(d.baseSize, d.baseSize * 1.5 - stretch * 0.04)
        ctx.stroke()
      }

      raf.current = requestAnimationFrame(draw)
    }

    raf.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchstart', onTouchMove)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('touchend', onLeave)
      document.removeEventListener('touchcancel', onLeave)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
