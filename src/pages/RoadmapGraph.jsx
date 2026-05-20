/**
 * src/pages/RoadmapGraph.jsx
 * Brand new page — does NOT modify CareerPath.jsx or SkillMatch.jsx.
 * Add to App.jsx: <Route path="/roadmap-graph" element={<RoadmapGraph />} />
 * Add to Navbar: { to: '/roadmap-graph', label: 'Roadmaps', icon: GitBranch }
 */
import Layout from '../components/layout/Layout'
import { useState, useCallback, useRef } from 'react'
import {
  Search, Loader2, Download, ChevronRight,
  ChevronDown, BookOpen, ExternalLink, GitBranch,
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Map
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

// ── Colour palette per depth level ──────────────────────────────────────────
const DEPTH_STYLES = [
  { bg: 'bg-[#0a0a0a]',    text: 'text-white',          border: 'border-[#0a0a0a]',    dot: 'bg-white'          },
  { bg: 'bg-blue-500',     text: 'text-white',          border: 'border-blue-500',     dot: 'bg-blue-200'       },
  { bg: 'bg-[#fcfcfc]',   text: 'text-[#0a0a0a]',      border: 'border-blue-200',     dot: 'bg-blue-400'       },
  { bg: 'bg-[#fcfcfc]',   text: 'text-[#4a4a4a]',      border: 'border-[#e4e4e4]',    dot: 'bg-gray-300'       },
]

function getDepthStyle(depth) {
  return DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length - 1)]
}

// ── Single node (recursive) ───────────────────────────────────────────────
function TopicNode({ node, depth = 0, searchTerm = '' }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children?.length > 0
  const hasResources = node.resources?.length > 0
  const style = getDepthStyle(depth)

  const isMatch = searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase())

  return (
    <div className={`${depth === 0 ? 'mb-3' : 'ml-4 mt-1.5'}`}>
      <div
        onClick={() => setOpen(o => !o)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer
          transition-all hover:shadow-sm select-none
          ${style.bg} ${style.text} ${style.border}
          ${isMatch ? 'ring-2 ring-amber-400' : ''}
          ${depth === 0 ? 'shadow-sm' : ''}
        `}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
        <span className={`flex-1 text-sm ${depth === 0 ? 'font-bold' : depth === 1 ? 'font-semibold' : 'font-medium'} leading-tight`}>
          {node.label}
        </span>
        {hasResources && (
          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-300">
            {node.resources.length} links
          </span>
        )}
        {hasChildren && (
          <span className="shrink-0 opacity-60">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        )}
      </div>

      {open && (
        <>
          {/* Resources */}
          {hasResources && (
            <div className="ml-4 mt-1 flex flex-wrap gap-1.5 mb-1">
              {node.resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-all hover:-translate-y-px hover:shadow-sm ${
                    r.type === 'paid'
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <ExternalLink size={8} />
                  {r.title?.slice(0, 40)}{r.title?.length > 40 ? '...' : ''}
                </a>
              ))}
            </div>
          )}

          {/* Children */}
          {hasChildren && node.children.map((child, i) => (
            <TopicNode key={i} node={child} depth={depth + 1} searchTerm={searchTerm} />
          ))}
        </>
      )}
    </div>
  )
}

// ── PDF generator for the graph roadmap ───────────────────────────────────
async function generateGraphPDF(roadmap, userName) {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, H = 297, ML = 14, MR = 14, CW = W - ML - MR
  let y = 0

  const addChrome = () => {
    doc.setFillColor(9, 9, 11)
    doc.rect(0, 0, W, 2, 'F')
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 2, 2, H - 15, 'F')
  }

  const newPage = () => {
    doc.addPage(); addChrome(); y = 18
  }

  const checkPage = (n = 15) => { if (y + n > H - 20) newPage() }

  addChrome()

  // Cover
  doc.setFillColor(248, 250, 252)
  doc.rect(3, 1, W - 3, 55, 'F')
  y = 16

  doc.setFillColor(239, 246, 255); doc.setDrawColor(191, 219, 254); doc.setLineWidth(0.3)
  doc.roundedRect(ML, y - 4, 46, 6, 2, 2, 'FD')
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
  doc.text('SKILL ROADMAP  -  NYRVEXA', ML + 3, y)

  y += 10
  doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10)
  doc.text(roadmap.title + ' Roadmap', ML, y)

  if (userName) {
    y += 8
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(156, 163, 175)
    doc.text('PREPARED FOR', ML, y)
    y += 5
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10)
    doc.text(userName, ML, y)
  }

  y += 9
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(156, 163, 175)
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`Generated: ${dateStr}  |  Source: roadmap.sh (MIT License)`, ML, y)

  y = 62

  // Topics
  const flattenForPDF = (nodes, depth = 0) => {
    for (const node of nodes) {
      checkPage(12)

      const indent = ML + depth * 6
      const maxW = CW - depth * 6

      if (depth === 0) {
        // Section header
        doc.setFillColor(245, 247, 255); doc.setDrawColor(219, 234, 254); doc.setLineWidth(0.3)
        doc.roundedRect(ML, y - 4, CW, 8, 2, 2, 'FD')
        doc.setFillColor(37, 99, 235)
        doc.roundedRect(ML + 2, y - 2.5, 3, 4, 1, 1, 'F')
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59)
        doc.text(node.label, indent + 8, y)
        y += 9
      } else if (depth === 1) {
        doc.setFillColor(59, 130, 246)
        doc.circle(indent + 2, y - 1, 2, 'F')
        doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10)
        doc.text(node.label, indent + 6, y)
        y += 6
      } else {
        doc.setFillColor(156, 163, 175)
        doc.circle(indent + 2, y - 1, 1.2, 'F')
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
        doc.text(node.label, indent + 5, y)
        y += 5
      }

      // Resources
      if (node.resources?.length > 0) {
        node.resources.slice(0, 3).forEach(r => {
          checkPage(5)
          doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(37, 99, 235)
          const rText = `  → ${r.title?.slice(0, 55) || 'Resource'}`
          doc.text(rText, indent + 8, y)
          doc.link(indent + 8, y - 3, maxW - 10, 4, { url: r.url })
          y += 4.5
        })
      }

      if (node.children?.length > 0) {
        flattenForPDF(node.children, depth + 1)
      }
    }
  }

  flattenForPDF(roadmap.topics || [])

  // Footer
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFillColor(248, 250, 252)
    doc.rect(0, H - 13, W, 13, 'F')
    doc.setDrawColor(229, 231, 235); doc.setLineWidth(0.3)
    doc.line(0, H - 13, W, H - 13)
    doc.setFontSize(7.2); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235)
    const brand = 'Nyrvexa - AI Career Platform'
    doc.text(brand, ML, H - 5)
    doc.link(ML, H - 9, doc.getTextWidth(brand), 5, { url: 'https://www.nyrvexa.in/' })
    doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128)
    if (userName) doc.text(`For ${userName}`, W / 2, H - 5, { align: 'center' })
    doc.text(`Page ${p} of ${total}`, W - MR, H - 5, { align: 'right' })
  }

  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Nyrvexa_${roadmap.title.replace(/\s+/g, '_')}_Roadmap.pdf`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── Main page component ────────────────────────────────────────────────────
export default function RoadmapGraph() {
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [roadmap, setRoadmap]       = useState(null)
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [allRoadmaps, setAllRoadmaps] = useState([])
  const [listLoaded, setListLoaded] = useState(false)
  const searchRef = useRef(null)

  const loadList = async () => {
    if (listLoaded) return
    try {
      const res = await api.get('/roadmap-graph/list')
      setAllRoadmaps(res.data.roadmaps || [])
      setListLoaded(true)
    } catch {
      // silent — list is optional
    }
  }

  const handleSearch = async (q = query) => {
    if (!q.trim()) return
    setLoading(true)
    setResults([])
    try {
      const res = await api.get('/roadmap-graph/search', { params: { q: q.trim() } })
      setResults(res.data.results || [])
      if ((res.data.results || []).length === 0) {
        toast('No roadmap found for that query', { icon: '🔍' })
      }
    } catch {
      toast.error('Search failed. Make sure you ran the scraper first.')
    } finally {
      setLoading(false)
    }
  }

  const loadRoadmap = async (id) => {
    setRoadmapLoading(true)
    setRoadmap(null)
    setSearchTerm('')
    try {
      const res = await api.get(`/roadmap-graph/${id}`)
      setRoadmap(res.data.roadmap)
      toast.success(`${res.data.roadmap.title} roadmap loaded!`)
    } catch {
      toast.error('Failed to load roadmap.')
    } finally {
      setRoadmapLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!roadmap) return
    setPdfLoading(true)
    try {
      let userName = ''
      try {
        const saved = localStorage.getItem('nirvexa_user')
        if (saved) userName = JSON.parse(saved)?.name || ''
      } catch {}
      await generateGraphPDF(roadmap, userName)
      toast.success('PDF downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('PDF generation failed.')
    } finally {
      setPdfLoading(false)
    }
  }

  // Count total nodes recursively
  const countNodes = (nodes) => {
    if (!nodes) return 0
    return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0)
  }

  const totalTopics = roadmap ? countNodes(roadmap.topics) : 0

  // Filter visible nodes by search
  const filterNodes = (nodes, term) => {
    if (!term) return nodes
    return nodes.reduce((acc, node) => {
      const match = node.label.toLowerCase().includes(term.toLowerCase())
      const filteredChildren = filterNodes(node.children || [], term)
      if (match || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren })
      }
      return acc
    }, [])
  }

  const visibleTopics = roadmap
    ? (searchTerm ? filterNodes(roadmap.topics, searchTerm) : roadmap.topics)
    : []

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .rg-sans  { font-family: 'DM Sans', system-ui, sans-serif; }
        .rg-serif { font-family: 'DM Serif Display', Georgia, serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.25s ease forwards; }
      `}</style>

      <div className="rg-sans max-w-5xl mx-auto px-4 sm:px-6 pb-20 relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-indigo-50/60 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 pt-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e4e4e4] shadow-sm text-xs font-medium text-[#0a0a0a] mb-3">
            <GitBranch size={13} className="text-indigo-500" /> Interactive Roadmaps
          </div>
          <h1 className="rg-serif text-3xl sm:text-4xl text-[#0a0a0a] mb-1">Roadmap Explorer</h1>
          <p className="text-[#6b6b6b] text-sm font-medium max-w-lg">
            Browse curated learning roadmaps from roadmap.sh — explore interactively or download as PDF.
          </p>
        </div>

        {/* Search */}
        <div className="relative z-10 bg-white border border-[#e4e4e4] rounded-3xl p-6 mb-6 shadow-[0_4px_24px_rgb(0,0,0,0.05)]">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search roadmap... e.g. Python, React, DevOps, System Design"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                onFocus={loadList}
                className="w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#c4c4c4] rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-5 py-3 rounded-2xl text-sm transition-all"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              Search
            </button>
          </div>

          {/* Browse all */}
          {allRoadmaps.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-2">All Roadmaps:</p>
              <div className="flex flex-wrap gap-2">
                {allRoadmaps.map(r => (
                  <button
                    key={r.id}
                    onClick={() => loadRoadmap(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      roadmap?.id === r.id
                        ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                        : 'bg-[#fcfcfc] text-[#6b6b6b] border-[#e4e4e4] hover:border-[#a3a3a3] hover:text-[#0a0a0a]'
                    }`}
                  >{r.title}</button>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold text-[#8b8b8b] uppercase tracking-widest mb-2">Results:</p>
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => loadRoadmap(r.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#fcfcfc] border border-[#e4e4e4] hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <Map size={14} className="text-blue-500 shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-[#0a0a0a]">{r.title}</span>
                  <ChevronRight size={13} className="text-[#c4c4c4] group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading state */}
        {roadmapLoading && (
          <div className="relative z-10 bg-white border border-[#e4e4e4] rounded-3xl p-12 flex items-center justify-center shadow-[0_4px_24px_rgb(0,0,0,0.05)]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-blue-500" />
              <p className="text-[#6b6b6b] text-sm font-medium">Loading roadmap...</p>
            </div>
          </div>
        )}

        {/* Roadmap viewer */}
        {roadmap && !roadmapLoading && (
          <div className="relative z-10 fade-up space-y-5">

            {/* Roadmap header bar */}
            <div className="bg-white border border-[#e4e4e4] rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.05)] flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="rg-serif text-2xl text-[#0a0a0a]">{roadmap.title} Roadmap</h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-[11px] text-[#8b8b8b] flex items-center gap-1">
                    <BookOpen size={11} /> {roadmap.topics?.length} sections
                  </span>
                  <span className="text-[11px] text-[#8b8b8b]">·</span>
                  <span className="text-[11px] text-[#8b8b8b]">{totalTopics} total topics</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-semibold">
                    roadmap.sh
                  </span>
                </div>
              </div>

              {/* In-roadmap search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#c4c4c4] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#0a0a0a] transition-all w-44"
                />
              </div>

              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:transform-none"
              >
                {pdfLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                  : <><Download size={13} /> Download PDF</>
                }
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap px-1">
              {[
                { color: 'bg-[#0a0a0a]', label: 'Section' },
                { color: 'bg-blue-500',  label: 'Topic' },
                { color: 'bg-white border border-blue-200', label: 'Subtopic' },
                { color: 'bg-white border border-[#e4e4e4]', label: 'Detail' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${item.color}`} />
                  <span className="text-[10px] text-[#8b8b8b] font-medium">{item.label}</span>
                </div>
              ))}
              <span className="text-[10px] text-[#8b8b8b] ml-auto">Click any node to expand/collapse</span>
            </div>

            {/* Graph tree */}
            <div className="bg-white border border-[#e4e4e4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgb(0,0,0,0.05)] overflow-auto max-h-[72vh]">
              {visibleTopics.length > 0 ? (
                visibleTopics.map((node, i) => (
                  <TopicNode key={i} node={node} depth={0} searchTerm={searchTerm} />
                ))
              ) : (
                <div className="text-center py-12 text-[#a3a3a3] text-sm">
                  No topics match "{searchTerm}"
                </div>
              )}
            </div>

          </div>
        )}

        {/* Empty state — no roadmap loaded yet */}
        {!roadmap && !roadmapLoading && (
          <div className="relative z-10 bg-white border border-[#e4e4e4] rounded-3xl p-12 text-center shadow-[0_4px_24px_rgb(0,0,0,0.05)]">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto mb-4">
              <GitBranch size={24} className="text-indigo-500" />
            </div>
            <h3 className="rg-serif text-xl text-[#0a0a0a] mb-2">Search for a Roadmap</h3>
            <p className="text-[#6b6b6b] text-sm max-w-sm mx-auto">
              Search above or browse all roadmaps. Make sure you've run <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-xs">scrape_roadmaps.py</code> first to populate the data.
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}