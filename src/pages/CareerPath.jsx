import Layout from '../components/layout/Layout'
import { useState } from 'react'
import {
  Sparkles, Map, AlertTriangle, BookOpen, Loader2, Target,
  Compass, CheckCircle2, Clock, ExternalLink,
  Milestone, ArrowRight, Flag, Download
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const EXPERIENCE_OPTIONS = [
  { label: 'Fresher', value: 0 },
  { label: '1 yr',    value: 1 },
  { label: '2 yrs',   value: 2 },
  { label: '3â€“5 yrs', value: 4 },
  { label: '5+ yrs',  value: 6 },
]

const PLATFORM_META = {
  'youtube':      { color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',         dot: 'bg-red-400'    },
  'coursera':     { color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',     dot: 'bg-blue-400'   },
  'freecodecamp': { color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100', dot: 'bg-green-500'  },
  'udemy':        { color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100', dot: 'bg-purple-400' },
  'edx':          { color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100', dot: 'bg-indigo-400' },
  'medium':       { color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',     dot: 'bg-gray-400'   },
}

function getPlatformMeta(resource = '') {
  const lower = resource.toLowerCase()
  for (const [key, meta] of Object.entries(PLATFORM_META)) {
    if (lower.includes(key)) return meta
  }
  return { color: 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:bg-[#f4f4f4]', dot: 'bg-gray-300' }
}

function parseResource(r) {
  if (!r || typeof r !== 'string') return null
  const urlMatch = r.match(/(https?:\/\/[^\s]+)/)
  if (!urlMatch) return null
  const url   = urlMatch[0]
  const label = r.replace(url, '').replace(/:\s*$/, '').trim() || 'View Resource'
  return { label, url }
}

const safeArray = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  return [val]
}

const DIFF_COLOR = {
  'Beginner':     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Intermediate': 'bg-amber-50 text-amber-700 border-amber-200',
  'Advanced':     'bg-rose-50 text-rose-700 border-rose-200',
}

// â”€â”€ PDF Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function generatePDF({ result, currentRole, targetRole, userName }) {
  const { jsPDF } = await import('jspdf')

  const steps       = Array.isArray(result.steps) ? result.steps : []
  const missing     = Array.isArray(result.skill_gap?.missing) ? result.skill_gap.missing : []
  const alreadyHave = Array.isArray(result.skill_gap?.already_have) ? result.skill_gap.already_have : []

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W   = 210
  const H   = 297
  const ML  = 14
  const MR  = 14
  const CW  = W - ML - MR
  let   y   = 0

  const addPageChrome = () => {
    doc.setFillColor(9, 9, 11)
    doc.rect(0, 0, W, 2.2, 'F')
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 2.2, 2.2, H - 17, 'F')
    doc.setFillColor(20, 184, 166)
    doc.rect(2.2, 2.2, 1.1, H - 17, 'F')
  }

  const newPage = () => {
    doc.addPage()
    addPageChrome()
    y = 18
  }

  const checkPage = (needed = 20) => {
    if (y + needed > H - 23) newPage()
  }

  // pill â€” all RGB, no hex, no special unicode
  const pill = (text, x, py, bgR, bgG, bgB, txR, txG, txB, bdR, bdG, bdB) => {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    const tw = doc.getTextWidth(text)
    const pw = tw + 7
    doc.setFillColor(bgR, bgG, bgB)
    doc.setDrawColor(bdR, bdG, bdB)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, py - 4, pw, 5.5, 1.5, 1.5, 'FD')
    doc.setTextColor(txR, txG, txB)
    doc.text(text, x + 3.5, py)
    return pw + 2.5
  }

  const sectionHeading = (label) => {
    checkPage(16)
    y += 4
    doc.setFillColor(245, 247, 255)
    doc.setDrawColor(219, 234, 254)
    doc.roundedRect(ML, y - 5, CW, 8.5, 2, 2, 'FD')
    doc.setFillColor(37, 99, 235)
    doc.roundedRect(ML + 2, y - 3.2, 3, 4.5, 1, 1, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text(label, ML + 8, y)
    y += 8.5
  }

  // â”€â”€ COVER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addPageChrome()
  doc.setFillColor(248, 250, 252)
  doc.rect(3, 1, W - 3, 75, 'F')

  y = 16
  doc.setFillColor(239, 246, 255)
  doc.setDrawColor(191, 219, 254)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, y - 4, 48, 6, 2, 2, 'FD')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246)
  doc.text('AI CAREER ARCHITECT  -  NYRVEXA', ML + 3, y)

  y += 11
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(10, 10, 10)
  doc.text('Career Roadmap', ML, y)
  doc.setFillColor(20, 184, 166)
  doc.roundedRect(W - MR - 36, y - 13, 26, 26, 5, 5, 'F')
  doc.setFillColor(37, 99, 235)
  doc.roundedRect(W - MR - 23, y - 6, 25, 25, 5, 5, 'F')

  y += 9
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(75, 85, 99)
  doc.text(`${currentRole || 'Student'}  ->  ${targetRole}`, ML, y)

  // User name â€” premium personalisation
  if (userName) {
    y += 8
    // Personal label on its own line in gray
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    doc.text('BUILT FOR', ML, y)
    y += 5.5
    // Name on next line, larger and bold
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 10, 10)
    doc.text(userName, ML, y)
  }

  y += 10
  let cx = ML
  ;[`${result.estimated_total_weeks || '?'} weeks total`, `${steps.length} steps`, result.difficulty || 'Intermediate'].forEach(chip => {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const tw = doc.getTextWidth(chip) + 8
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.3)
    doc.roundedRect(cx, y - 4, tw, 6, 2, 2, 'FD')
    doc.setTextColor(55, 65, 81)
    doc.text(chip, cx + 4, y)
    cx += tw + 3
  })
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(156, 163, 175)
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`Generated: ${dateStr}`, W - MR, y, { align: 'right' })

  y = 68

  // â”€â”€ STEPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  sectionHeading('WHY-BASED LEARNING ROADMAP')

  steps.forEach((step, i) => {
    const skillName = step.skill_to_learn || ''
    const whyText   = step.why_important  || ''
    const weeks     = step.estimated_weeks
    const resources = Array.isArray(step.resources) ? step.resources : []
    const displayResources = resources.slice(0, 2)
    const whyLines  = doc.splitTextToSize(whyText, CW - 16).length
    const subtopics  = Array.isArray(step.subtopics) ? step.subtopics : []
    const subH       = subtopics.length > 0 ? 7 + subtopics.reduce((a, s) => a + 6 + (s.why ? Math.min(2, doc.splitTextToSize(s.why, CW - 42).length) * 3.8 : 0), 0) : 0
    const resourceH  = displayResources.length > 0 ? 7 + displayResources.length * 8.5 : 0
    const needed     = 17 + (whyLines * 4.2) + subH + resourceH + 7
    checkPage(needed)

    // Card bg
    const cardH = Math.max(22, needed - 3)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(219, 234, 254)
    doc.setLineWidth(0.3)
    doc.roundedRect(ML, y, CW, cardH, 2, 2, 'FD')
    // Blue left border
    doc.setFillColor(59, 130, 246)
    doc.roundedRect(ML, y, 3, cardH, 1, 1, 'F')

    // Step circle
    doc.setFillColor(59, 130, 246)
    doc.circle(ML + 10, y + 6, 4, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(String(step.step_number || i + 1), ML + 10, y + 7, { align: 'center' })

    // Skill title
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 10, 10)
    doc.text(skillName, ML + 17, y + 7.5)

    // Weeks badge
    if (weeks) {
      const wLabel = `${weeks} weeks`
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      const ww = doc.getTextWidth(wLabel) + 6
      doc.setFillColor(239, 246, 255)
      doc.setDrawColor(191, 219, 254)
      doc.setLineWidth(0.25)
      doc.roundedRect(W - MR - ww - 1, y + 2, ww, 5.5, 1.5, 1.5, 'FD')
      doc.setTextColor(59, 130, 246)
      doc.text(wLabel, W - MR - ww + 2, y + 6)
    }

    let cy = y + 14

    // Why this skill is worth studying
    if (whyText) {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(37, 99, 235)
      doc.text('WHY STUDY IT', ML + 7, cy)
      cy += 4.2
      doc.setFontSize(8.6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.splitTextToSize(whyText, CW - 16).forEach(line => {
        doc.text(line, ML + 7, cy)
        cy += 4.2
      })
      cy += 2
    }

    // Subtopics
    if (subtopics.length > 0) {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(107, 114, 128)
      doc.text('WHY YOU ARE STUDYING THIS:', ML + 7, cy)
      cy += 6

      subtopics.forEach((sub, si) => {
        // Check if we need a new page
        if (cy + 12 > H - 23) {
          // close current card visually â€” just continue on new page
          doc.addPage()
          addPageChrome()
          cy = 18
        }

        // Row bg â€” alternating
        if (si % 2 === 0) {
          doc.setFillColor(247, 248, 250)
          doc.roundedRect(ML + 7, cy - 4, CW - 10, 9.5, 1.2, 1.2, 'F')
        }

        // Number badge
        doc.setFillColor(239, 246, 255)
        doc.setDrawColor(191, 219, 254)
        doc.setLineWidth(0.2)
        doc.roundedRect(ML + 8, cy - 3.5, 6, 6, 1, 1, 'FD')
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(59, 130, 246)
        doc.text(String(si + 1), ML + 11, cy + 0.5, { align: 'center' })

        // Subtopic name
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(10, 10, 10)
        const nameText = sub.name || ''
        doc.text(nameText, ML + 17, cy)

        // Duration badge
        if (sub.duration_days) {
          const dLabel = `${sub.duration_days}d`
          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          const dw = doc.getTextWidth(dLabel) + 4
          doc.setFillColor(239, 246, 255)
          doc.setDrawColor(191, 219, 254)
          doc.setLineWidth(0.2)
          doc.roundedRect(W - MR - dw - 1, cy - 3.5, dw, 5.5, 1, 1, 'FD')
          doc.setTextColor(59, 130, 246)
          doc.text(dLabel, W - MR - dw + 1, cy)
        }

        // Why line
        if (sub.why) {
          cy += 5
          doc.setFontSize(7.5)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(107, 114, 128)
          const whyLines = doc.splitTextToSize(sub.why, CW - 42).slice(0, 2)
          whyLines.forEach(wl => {
            doc.text(wl, ML + 17, cy)
            cy += 2.8
          })
        } else {
          cy += 5
        }
        cy += 2
      })
      cy += 2
    }

    // Resources
    if (displayResources.length > 0) {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(107, 114, 128)
      doc.text('START HERE:', ML + 7, cy)
      cy += 6

      displayResources.forEach(r => {
        const parsed = parseResource(r)
        if (!parsed) return
        // Dot
        doc.setFillColor(59, 130, 246)
        doc.circle(ML + 9, cy - 1.5, 1.3, 'F')
        // Label
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(37, 99, 235)
        doc.text(parsed.label, ML + 12, cy)
        // Underline label
        const lw = doc.getTextWidth(parsed.label)
        doc.setDrawColor(37, 99, 235)
        doc.setLineWidth(0.2)
        doc.line(ML + 12, cy + 0.8, ML + 12 + lw, cy + 0.8)
        // URL in gray below
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(107, 114, 128)
        const urlText = parsed.url.length > 72 ? parsed.url.slice(0, 70) + '...' : parsed.url
        doc.text(urlText, ML + 12, cy + 4.5)
        // Clickable link
        doc.link(ML + 12, cy - 3, CW - 22, 8, { url: parsed.url })
        cy += 8.5
      })
    }

    y = cy + 5

    // Step divider
    if (i < steps.length - 1) {
      checkPage(4)
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.3)
      doc.line(ML + 8, y, W - MR, y)
      y += 5
    }
  })

  // â”€â”€ SKILL GAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  sectionHeading('SKILL GAP ANALYSIS')

  if (missing.length > 0) {
    checkPage(30)
    const rows  = Math.ceil(missing.length / 4)
    const boxH  = 10 + rows * 9 + 4
    doc.setFillColor(255, 251, 235)
    doc.setDrawColor(252, 211, 77)
    doc.setLineWidth(0.3)
    doc.roundedRect(ML, y, CW, boxH, 2, 2, 'FD')
    doc.setFillColor(217, 119, 6)
    doc.roundedRect(ML, y, 3, boxH, 1, 1, 'F')
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(146, 64, 14)
    doc.text('Skills to Acquire', ML + 7, y + 7)
    let px = ML + 7; let py = y + 15
    missing.forEach(s => {
      const pw = pill(s, px, py, 255,251,235, 146,64,14, 252,211,77)
      px += pw
      if (px > W - MR - 25) { px = ML + 7; py += 9 }
    })
    y += boxH + 6
  }

  if (alreadyHave.length > 0) {
    checkPage(30)
    const rows  = Math.ceil(alreadyHave.length / 4)
    const boxH  = 10 + rows * 9 + 4
    doc.setFillColor(240, 253, 244)
    doc.setDrawColor(134, 239, 172)
    doc.setLineWidth(0.3)
    doc.roundedRect(ML, y, CW, boxH, 2, 2, 'FD')
    doc.setFillColor(22, 163, 74)
    doc.roundedRect(ML, y, 3, boxH, 1, 1, 'F')
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 101, 52)
    doc.text('Skills You Already Have', ML + 7, y + 7)
    let px = ML + 7; let py = y + 15
    alreadyHave.forEach(s => {
      const pw = pill(s, px, py, 240,253,244, 22,101,52, 134,239,172)
      px += pw
      if (px > W - MR - 25) { px = ML + 7; py += 9 }
    })
    y += boxH + 6
  }

  // â”€â”€ SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (result.summary) {
    sectionHeading('TRANSITION SUMMARY')
    checkPage(20)
    const sumLines = doc.splitTextToSize(result.summary, CW - 10)
    const sumBoxH  = sumLines.length * 5.5 + 10
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(219, 234, 254)
    doc.setLineWidth(0.3)
    doc.roundedRect(ML, y, CW, sumBoxH, 2, 2, 'FD')
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    let sy = y + 8
    sumLines.forEach(line => { doc.text(line, ML + 6, sy); sy += 5.5 })
    y += sumBoxH + 6
  }

  // â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(248, 250, 252)
    doc.rect(0, H - 15, W, 15, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(0, H - 15, W, H - 15)
    doc.setFontSize(7.2)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(37, 99, 235)
    const brandText = 'Nyrvexa - AI Career Platform'
    doc.text(brandText, ML, H - 6)
    doc.link(ML, H - 10, doc.getTextWidth(brandText), 5, { url: 'https://www.nyrvexa.in/' })
    if (userName) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(`For ${userName}`, W / 2, H - 6, { align: 'center' })
    }
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(`Page ${p} of ${totalPages}`, W - MR, H - 6, { align: 'right' })
  }

  const filename = `Nyrvexa_Career_Roadmap_${targetRole.replace(/\s+/g, '_')}.pdf`
  // Blob URL approach â€” avoids CSP iframe block that doc.save() triggers
  const blob = doc.output('blob')
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function CareerPath() {
  const [currentRole, setCurrentRole] = useState('')
  const [targetRole, setTargetRole]   = useState('')
  const [skills, setSkills]           = useState('')
  const [experience, setExperience]   = useState(0)
  const [loading, setLoading]         = useState(false)
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [result, setResult]           = useState(null)
  const [activeStep, setActiveStep]   = useState(0)
  const { user } = useAuth()

  const handleGenerate = async () => {
    if (!targetRole.trim() || !skills.trim()) {
      toast.error('Please fill in target role and current skills')
      return
    }
    setLoading(true)
    setResult(null)
    setActiveStep(0)
    try {
      const skillList = skills.split(',').map(s => s.trim()).filter(Boolean)
      const res = await api.post('/career/path', {
        current_role:     currentRole.trim() || 'Student',
        target_role:      targetRole.trim(),
        current_skills:   skillList,
        experience_years: experience,
      })
      setResult(res.data.career_path)
      toast.success('Roadmap generated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate roadmap. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      // Read name from context first, fall back to localStorage directly
      let userName = user?.name || user?.full_name || ''
      if (!userName) {
        try {
          const saved = localStorage.getItem('nirvexa_user')
          if (saved) {
            const parsed = JSON.parse(saved)
            userName = parsed.name || parsed.full_name || ''
          }
        } catch {}
      }
      await generatePDF({ result, currentRole, targetRole, userName })
      toast.success('PDF downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF. Try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  const steps           = safeArray(result?.steps)
  const currentStepData = steps[activeStep]
  const allStepsSeen    = result && activeStep === steps.length - 1

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .cp-sans  { font-family: 'DM Sans', system-ui, sans-serif; }
        .cp-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .step-node { transition: all 0.2s ease; }
        .step-node.active { transform: scale(1.08); }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-slide { animation: fadeSlide 0.3s ease forwards; }
      `}</style>

      <div className="cp-sans max-w-6xl mx-auto px-4 sm:px-6 pb-20 relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-blue-50/60 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 pt-6 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e4e4e4] shadow-sm text-xs font-medium text-[#0a0a0a] mb-3">
            <Compass size={13} className="text-blue-500" /> AI Career Architect
          </div>
          <h1 className="cp-serif text-3xl sm:text-4xl text-[#0a0a0a] mb-1">Career Path Generator</h1>
          <p className="text-[#6b6b6b] text-sm font-medium max-w-lg">
            Tell us where you're headed â€” we'll map every step of the journey.
          </p>
        </div>

        {/* Input card */}
        <div className="relative z-10 bg-white border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 mb-10 shadow-[0_4px_24px_rgb(0,0,0,0.05)]">
          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-2 ml-1">Current Role</label>
              <input
                type="text" placeholder="e.g. Student, Junior Dev"
                value={currentRole}
                onChange={e => { setCurrentRole(e.target.value); setResult(null) }}
                className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#c4c4c4] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-2 ml-1">Target Role *</label>
              <div className="relative">
                <Target size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text" placeholder="e.g. ML Engineer, Data Analyst"
                  value={targetRole}
                  onChange={e => { setTargetRole(e.target.value); setResult(null) }}
                  className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#c4c4c4] rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-2 ml-1">Current Skills * <span className="normal-case font-normal">(comma separated)</span></label>
              <div className="relative">
                <Sparkles size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text" placeholder="e.g. Python, SQL, Excel"
                  value={skills}
                  onChange={e => { setSkills(e.target.value); setResult(null) }}
                  className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#c4c4c4] rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-2 ml-1">Experience</label>
              <div className="flex gap-2 flex-wrap">
                {EXPERIENCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value} onClick={() => setExperience(opt.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      experience === opt.value
                        ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                        : 'bg-[#fcfcfc] text-[#6b6b6b] border-[#e4e4e4] hover:border-[#a3a3a3]'
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!targetRole.trim() || !skills.trim() || loading}
            className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-7 py-3 rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Building your roadmap...</>
              : <><Map size={16} /> Generate Roadmap</>
            }
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="relative z-10 space-y-6">

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e4e4e4] rounded-xl shadow-sm text-xs font-medium text-[#4a4a4a]">
                <Clock size={13} className="text-blue-500" /> {result.estimated_total_weeks} weeks total
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e4e4e4] rounded-xl shadow-sm text-xs font-medium text-[#4a4a4a]">
                <Milestone size={13} className="text-blue-500" /> {steps.length} steps
              </div>
              {result.difficulty && (
                <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${DIFF_COLOR[result.difficulty] || 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b]'}`}>
                  {result.difficulty}
                </span>
              )}
              {safeArray(result.skill_gap?.missing).slice(0, 4).map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg font-medium">
                  Gap: {s}
                </span>
              ))}
            </div>

            {/* GPS Navigator */}
            <div className="bg-white border border-[#e4e4e4] rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.05)] overflow-hidden">

              {/* Step track */}
              <div className="border-b border-[#e4e4e4] px-6 py-5 overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max">
                  <div className="flex flex-col items-center gap-1.5 mr-2">
                    <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center shadow-sm">
                      <Compass size={14} className="text-white" />
                    </div>
                    <span className="text-[10px] text-[#8b8b8b] font-medium">Start</span>
                  </div>
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center">
                      <div className={`w-8 h-0.5 transition-colors duration-300 ${i <= activeStep ? 'bg-blue-500' : 'bg-[#e4e4e4]'}`} />
                      <button
                        onClick={() => setActiveStep(i)}
                        className={`step-node flex flex-col items-center gap-1.5 ${activeStep === i ? 'active' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 shadow-sm ${
                          i < activeStep    ? 'bg-blue-500 border-blue-500 text-white'
                          : i === activeStep ? 'bg-white border-blue-500 text-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                          : 'bg-[#fcfcfc] border-[#e4e4e4] text-[#a3a3a3] hover:border-[#a3a3a3]'
                        }`}>
                          {i < activeStep ? <CheckCircle2 size={14} /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-medium max-w-[64px] text-center leading-tight transition-colors ${
                          i === activeStep ? 'text-blue-600' : i < activeStep ? 'text-[#4a4a4a]' : 'text-[#a3a3a3]'
                        }`}>
                          {step.skill_to_learn?.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </button>
                    </div>
                  ))}
                  <div className={`w-8 h-0.5 ${activeStep === steps.length - 1 ? 'bg-blue-500' : 'bg-[#e4e4e4]'}`} />
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${activeStep === steps.length - 1 ? 'bg-emerald-500' : 'bg-[#f0f0f0]'}`}>
                      <Flag size={13} className={activeStep === steps.length - 1 ? 'text-white' : 'text-[#c4c4c4]'} />
                    </div>
                    <span className="text-[10px] text-[#8b8b8b] font-medium">Goal</span>
                  </div>
                </div>
              </div>

              {/* Active step detail */}
              {currentStepData && (
                <div className="p-6 sm:p-8 fade-slide" key={activeStep}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest mb-1">
                        Step {currentStepData.step_number} of {steps.length}
                      </p>
                      <h2 className="cp-serif text-2xl sm:text-3xl text-[#0a0a0a]">
                        {currentStepData.skill_to_learn}
                      </h2>
                    </div>
                    {currentStepData.estimated_weeks && (
                      <div className="shrink-0 text-center bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
                        <p className="text-2xl font-bold text-blue-600">{currentStepData.estimated_weeks}</p>
                        <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">weeks</p>
                      </div>
                    )}
                  </div>
                  {currentStepData.why_important && (
                    <p className="text-[#4a4a4a] text-sm leading-relaxed mb-5 max-w-2xl">
                      {currentStepData.why_important}
                    </p>
                  )}

                  {/* Subtopics */}
                  {safeArray(currentStepData.subtopics).length > 0 && (
                    <div className="mb-6">
                      <p className="text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-3">
                        What to Study
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {safeArray(currentStepData.subtopics).map((sub, j) => (
                          <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-[#fcfcfc] border border-[#e4e4e4] hover:border-[#c4c4c4] hover:shadow-sm transition-all">
                            <div className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-blue-600">{j + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className="text-xs font-semibold text-[#0a0a0a] leading-tight">{sub.name}</p>
                                {sub.duration_days && (
                                  <span className="shrink-0 text-[10px] font-medium text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                                    {sub.duration_days}d
                                  </span>
                                )}
                              </div>
                              {sub.why && (
                                <p className="text-[11px] text-[#6b6b6b] leading-snug">{sub.why}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {safeArray(currentStepData.resources).length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-3">Free Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {safeArray(currentStepData.resources).map((r, j) => {
                          const parsed = parseResource(r)
                          if (!parsed) return null
                          const meta = getPlatformMeta(r)
                          return (
                            <a key={j} href={parsed.url} target="_blank" rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm ${meta.color}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {parsed.label}
                              <ExternalLink size={10} className="opacity-60" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#f0f0f0]">
                    <button
                      onClick={() => setActiveStep(i => Math.max(0, i - 1))}
                      disabled={activeStep === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e4e4e4] text-xs font-medium text-[#6b6b6b] hover:border-[#a3a3a3] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >â† Previous</button>
                    <button
                      onClick={() => setActiveStep(i => Math.min(steps.length - 1, i + 1))}
                      disabled={activeStep === steps.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a0a0a] text-white text-xs font-medium hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >Next Step <ArrowRight size={12} /></button>
                    {activeStep === steps.length - 1 && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 ml-1">
                        <CheckCircle2 size={14} /> Roadmap complete!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Summary + already have */}
            <div className="grid sm:grid-cols-2 gap-5">
              {result.summary && (
                <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
                  <h3 className="text-xs font-semibold text-[#8b8b8b] uppercase tracking-widest mb-3">Transition Summary</h3>
                  <p className="text-[#3a3a3a] text-sm leading-relaxed">{result.summary}</p>
                </div>
              )}
              {safeArray(result.skill_gap?.already_have).length > 0 && (
                <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
                  <h3 className="text-xs font-semibold text-[#8b8b8b] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500" /> Skills You Already Have
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {safeArray(result.skill_gap?.already_have).map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium">âœ“ {s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* â”€â”€ PDF Download â€” appears only after last step â”€â”€ */}
            {allStepsSeen && (
              <div className="fade-slide bg-white border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.05)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div>
                    <h3 className="cp-serif text-xl text-[#0a0a0a] mb-1">Save Your Roadmap</h3>
                    <p className="text-[#6b6b6b] text-sm max-w-md">
                      Download a structured PDF with all steps, resources, and skill gap â€” ready to share or refer back to anytime.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['All steps included', 'Clickable resource links', 'Skill gap summary', 'A4 format'].map(f => (
                        <span key={f} className="inline-flex items-center gap-1 text-[11px] text-[#6b6b6b] bg-[#fcfcfc] border border-[#e4e4e4] px-2.5 py-1 rounded-lg">
                          <CheckCircle2 size={10} className="text-emerald-500" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="shrink-0 inline-flex items-center gap-2.5 bg-[#0a0a0a] text-white hover:bg-[#222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] font-semibold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {pdfLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
                      : <><Download size={16} /> Download PDF</>
                    }
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  )
}



