import Layout from '../components/layout/Layout'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Search, Loader2, Download, ChevronRight, ChevronDown, ExternalLink,
  GitBranch, BookOpen, Layers, X, Filter, ListTree,
  Sparkles, Clock3, CheckCircle2, PanelRightOpen, MousePointerClick
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const STAGE_STYLES = [
  { ring: 'border-blue-200', dot: 'bg-blue-500', wash: 'bg-blue-50', text: 'text-blue-700', pdf: [37, 99, 235], soft: [239, 246, 255] },
  { ring: 'border-emerald-200', dot: 'bg-emerald-500', wash: 'bg-emerald-50', text: 'text-emerald-700', pdf: [16, 185, 129], soft: [236, 253, 245] },
  { ring: 'border-amber-200', dot: 'bg-amber-500', wash: 'bg-amber-50', text: 'text-amber-700', pdf: [245, 158, 11], soft: [255, 251, 235] },
  { ring: 'border-purple-200', dot: 'bg-purple-500', wash: 'bg-purple-50', text: 'text-purple-700', pdf: [147, 51, 234], soft: [250, 245, 255] },
  { ring: 'border-rose-200', dot: 'bg-rose-500', wash: 'bg-rose-50', text: 'text-rose-700', pdf: [244, 63, 94], soft: [255, 241, 242] },
]

const cleanTitle = (raw = '') => raw.replace(/^@[^@]+@/, '').trim()

const resourceMeta = (type = '') => {
  const t = type.toLowerCase()
  if (t.includes('official')) return { label: 'Official', cls: 'bg-blue-50 border-blue-200 text-blue-700' }
  if (t.includes('video')) return { label: 'Video', cls: 'bg-rose-50 border-rose-200 text-rose-700' }
  if (t.includes('article')) return { label: 'Article', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
  if (t.includes('paid')) return { label: 'Paid', cls: 'bg-purple-50 border-purple-200 text-purple-700' }
  if (t.includes('opensource')) return { label: 'Open Source', cls: 'bg-amber-50 border-amber-200 text-amber-700' }
  if (t.includes('roadmap')) return { label: 'Roadmap', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' }
  return { label: 'Resource', cls: 'bg-[#f8fafc] border-[#e4e4e4] text-[#525252]' }
}

function countNodes(nodes = []) {
  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children || []), 0)
}

function countResources(nodes = []) {
  return nodes.reduce((sum, node) => sum + (node.resources?.length || 0) + countResources(node.children || []), 0)
}

function filterTree(nodes = [], term = '') {
  if (!term.trim()) return nodes
  const q = term.toLowerCase()
  return nodes.reduce((acc, node) => {
    const filteredKids = filterTree(node.children || [], term)
    const ownMatch = node.label?.toLowerCase().includes(q)
    const resourceMatch = node.resources?.some(r => cleanTitle(r.title).toLowerCase().includes(q))
    if (ownMatch || resourceMatch || filteredKids.length) {
      acc.push({ ...node, children: filteredKids })
    }
    return acc
  }, [])
}

function flattenNodes(nodes = [], depth = 0, parent = '') {
  return nodes.flatMap(node => [
    { ...node, depth, parent },
    ...flattenNodes(node.children || [], depth + 1, node.label),
  ])
}

function summarizeNode(node) {
  if (!node) return { childCount: 0, resourceCount: 0, totalItems: 0 }
  const childCount = node.children?.length || 0
  const resourceCount = countResources([node])
  const totalItems = Math.max(0, countNodes([node]) - 1)
  return { childCount, resourceCount, totalItems }
}

async function generatePDF(roadmap, userName) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, H = 297, ML = 14, MR = 14, CW = W - ML - MR
  const totalTopics = countNodes(roadmap.topics || [])
  const totalResources = countResources(roadmap.topics || [])
  let y = 0

  const addChrome = () => {
    doc.setFillColor(250, 250, 250); doc.rect(0, 0, W, H, 'F')
    doc.setFillColor(10, 10, 10); doc.rect(0, 0, W, 4, 'F')
    doc.setFillColor(37, 99, 235); doc.rect(0, 4, 3, H - 17, 'F')
    doc.setFillColor(16, 185, 129); doc.rect(3, 4, 1.2, H - 17, 'F')
  }
  const newPage = () => { doc.addPage(); addChrome(); y = 18 }
  const checkPage = (n = 12) => { if (y + n > H - 18) newPage() }
  const writeWrapped = (text, x, width, lineHeight = 4.4, options = {}) => {
    const lines = doc.splitTextToSize(String(text || ''), width)
    lines.forEach((line) => {
      checkPage(lineHeight + 1)
      doc.text(line, x, y, options)
      y += lineHeight
    })
    return lines.length
  }
  const metricCard = (x, label, value, accent) => {
    doc.setFillColor(255, 255, 255); doc.setDrawColor(228, 228, 228)
    doc.roundedRect(x, y, 42, 20, 3, 3, 'FD')
    doc.setFillColor(...accent); doc.roundedRect(x + 3, y + 3, 4, 14, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(10, 10, 10)
    doc.text(String(value), x + 10, y + 9)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 114, 128)
    doc.text(label.toUpperCase(), x + 10, y + 15)
  }

  addChrome()
  doc.setFillColor(255, 255, 255); doc.rect(4.2, 4, W - 4.2, 62, 'F')
  doc.setDrawColor(229, 231, 235); doc.line(ML, 66, W - MR, 66)
  y = 16
  doc.setFillColor(10, 10, 10); doc.roundedRect(ML, y - 5, 28, 9, 2, 2, 'F')
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text('Nyrvexa', ML + 5, y + 0.5)
  doc.setFontSize(7); doc.setTextColor(37, 99, 235)
  doc.text('CLASSIFIED SKILL ROADMAP', ML + 34, y + 0.5)
  y += 12
  doc.setFont('helvetica', 'bold'); doc.setFontSize(23); doc.setTextColor(10, 10, 10)
  writeWrapped(`${roadmap.title} Roadmap`, ML, CW - 30, 8.5)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(82, 82, 82)
  writeWrapped('Readable learning stages with grouped subtopics and curated resource links.', ML, CW - 20, 4.6)
  if (userName) {
    y += 2
    doc.setFontSize(8); doc.setTextColor(156, 163, 175); doc.text('PREPARED FOR', ML, y)
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10); doc.text(userName, ML + 28, y)
  }
  y = 74
  metricCard(ML, 'Stages', roadmap.topics?.length || 0, [37, 99, 235])
  metricCard(ML + 48, 'Topics', totalTopics, [16, 185, 129])
  metricCard(ML + 96, 'Resources', totalResources, [245, 158, 11])
  y += 30

  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(10, 10, 10)
  doc.text('Stage Overview', ML, y)
  y += 7
  ;(roadmap.topics || []).slice(0, 12).forEach((stage, i) => {
    const style = STAGE_STYLES[i % STAGE_STYLES.length]
    const x = ML + (i % 2) * 92
    if (i && i % 2 === 0) y += 18
    checkPage(22)
    doc.setFillColor(...style.soft); doc.setDrawColor(228, 228, 228)
    doc.roundedRect(x, y - 4, 86, 16, 2.5, 2.5, 'FD')
    doc.setFillColor(...style.pdf); doc.circle(x + 6, y + 3.5, 3, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255)
    doc.text(String(i + 1), x + 6, y + 4.5, { align: 'center' })
    doc.setFontSize(8); doc.setTextColor(10, 10, 10)
    doc.text(doc.splitTextToSize(stage.label, 68).slice(0, 2), x + 12, y + 1.5)
  })
  y += roadmap.topics?.length > 1 ? 26 : 16

  const renderNodes = (nodes, depth = 0) => {
    nodes.forEach((node, idx) => {
      const style = STAGE_STYLES[idx % STAGE_STYLES.length]
      const indent = ML + depth * 5
      checkPage(depth === 0 ? 20 : 10)
      if (depth === 0) {
        y += 4
        doc.setFillColor(...style.pdf); doc.roundedRect(ML, y - 6, 9, 9, 2, 2, 'F')
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
        doc.text(String(idx + 1), ML + 4.5, y, { align: 'center' })
        doc.setFillColor(255, 255, 255); doc.setDrawColor(228, 228, 228)
        doc.roundedRect(ML + 12, y - 7.5, CW - 12, 12, 2, 2, 'FD')
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 10, 10)
        doc.text(doc.splitTextToSize(node.label, CW - 28).slice(0, 2), ML + 17, y)
        y += 10
      } else {
        doc.setDrawColor(depth === 1 ? 191 : 229, depth === 1 ? 219 : 231, depth === 1 ? 254 : 235)
        doc.line(indent + 1.5, y - 5, indent + 1.5, y + 2)
        doc.setFillColor(depth === 1 ? 37 : 148, depth === 1 ? 99 : 163, depth === 1 ? 235 : 184)
        doc.circle(indent + 1.5, y - 1.5, depth === 1 ? 1.7 : 1.1, 'F')
        doc.setFontSize(depth === 1 ? 8.8 : 7.8); doc.setFont('helvetica', depth === 1 ? 'bold' : 'normal')
        doc.setTextColor(depth === 1 ? 10 : 75, depth === 1 ? 10 : 85, depth === 1 ? 10 : 99)
        writeWrapped(node.label, indent + 5.5, CW - (indent - ML) - 8, depth === 1 ? 4.8 : 4.2)
      }
      node.resources?.slice(0, 3).forEach(r => {
        checkPage(8)
        const label = cleanTitle(r.title) || 'Open resource'
        doc.setFillColor(248, 250, 252); doc.setDrawColor(229, 231, 235)
        doc.roundedRect(indent + 5, y - 3.7, CW - (indent - ML) - 10, 6.5, 1.6, 1.6, 'FD')
        doc.setFontSize(7.2); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235)
        doc.text(doc.splitTextToSize(label, CW - (indent - ML) - 18).slice(0, 1), indent + 8, y + 0.5)
        if (r.url) doc.link(indent + 5, y - 3.7, CW - (indent - ML) - 10, 6.5, { url: r.url })
        y += 8
      })
      if (node.children?.length) renderNodes(node.children, depth + 1)
    })
  }

  renderNodes(roadmap.topics || [])
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFillColor(248, 250, 252); doc.rect(0, H - 13, W, 13, 'F')
    doc.setDrawColor(229, 231, 235); doc.line(0, H - 13, W, H - 13)
    doc.setFontSize(7.2); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235)
    doc.text('Nyrvexa - AI Career Platform', ML, H - 5)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128)
    doc.text(`${p} / ${total}`, W - MR, H - 5, { align: 'right' })
  }

  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Nyrvexa_${roadmap.title.replace(/\s+/g, '_')}_Roadmap.pdf`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function TopicNode({ node, depth = 0, activeLabel, onSelect, filterTerm }) {
  const [open, setOpen] = useState(depth < 1 || !!filterTerm)
  const hasChildren = node.children?.length > 0
  const hasResources = node.resources?.length > 0
  const isActive = activeLabel === node.label
  const isOpen = open || !!filterTerm

  return (
    <div className={depth ? 'ml-3 border-l border-[#e4e4e4] pl-3 sm:ml-4' : ''}>
      <button
        onClick={() => {
          onSelect(node)
          if (hasChildren || hasResources) setOpen(v => !v)
        }}
        className={`w-full text-left group flex items-start gap-3 rounded-lg border p-3 transition-all ${
          isActive
            ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-md'
            : 'border-[#e4e4e4] bg-white hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm'
        } ${depth > 1 ? 'py-2' : ''}`}
      >
        <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${depth === 0 ? 'bg-blue-500' : depth === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span className="min-w-0 flex-1">
          <span className={`block font-semibold leading-snug ${depth > 1 ? 'text-xs' : 'text-sm'} ${isActive ? 'text-white' : 'text-[#111]'}`}>
            {node.label}
          </span>
          {(hasChildren || hasResources) && (
            <span className={`mt-1 flex flex-wrap gap-1.5 text-[10px] ${isActive ? 'text-white/70' : 'text-[#8b8b8b]'}`}>
              {hasChildren && <span>{node.children.length} subtopics</span>}
              {hasResources && <span>{node.resources.length} resources</span>}
            </span>
          )}
        </span>
        {(hasChildren || hasResources) && (
          <ChevronDown size={15} className={`mt-0.5 shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'} ${isActive ? 'text-white/70' : 'text-[#8b8b8b]'}`} />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {hasResources && (
            <div className="flex flex-wrap gap-1.5 pl-1">
              {node.resources.map((r, i) => {
                const meta = resourceMeta(r.type)
                return (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold transition hover:-translate-y-px hover:shadow-sm ${meta.cls}`}
                  >
                    {meta.label}
                    <span className="max-w-[220px] truncate">{cleanTitle(r.title) || 'Open resource'}</span>
                    <ExternalLink size={10} />
                  </a>
                )
              })}
            </div>
          )}
          {hasChildren && node.children.map((child, i) => (
            <TopicNode key={`${child.label}-${i}`} node={child} depth={depth + 1} activeLabel={activeLabel} onSelect={onSelect} filterTerm={filterTerm} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoadmapGraph() {
  const [query, setQuery] = useState('')
  const [allRoadmaps, setAllRoadmaps] = useState([])
  const [listLoaded, setListLoaded] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterTerm, setFilterTerm] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [activeNode, setActiveNode] = useState(null)
  const inputRef = useRef(null)

  const loadList = useCallback(async () => {
    if (listLoaded) return
    try {
      const res = await api.get('/roadmap-graph/list')
      setAllRoadmaps(res.data.roadmaps || [])
      setListLoaded(true)
    } catch {
      toast.error('Could not load roadmap list. Check backend is running.')
    }
  }, [listLoaded])

  useEffect(() => { loadList() }, [loadList])

  const loadRoadmap = async (id) => {
    setLoading(true)
    setRoadmap(null)
    setActiveNode(null)
    setFilterTerm('')
    setSearchResults([])
    try {
      const res = await api.get(`/roadmap-graph/${id}`)
      const next = res.data.roadmap
      setRoadmap(next)
      setActiveNode(next?.topics?.[0] || null)
    } catch {
      toast.error('Failed to load roadmap.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearchResults([])
    try {
      const res = await api.get('/roadmap-graph/search', { params: { q: query.trim() } })
      const results = res.data.results || []
      setSearchResults(results)
      if (results.length === 1) loadRoadmap(results[0].id)
      if (results.length === 0) toast('No matching role found', { icon: 'Search' })
    } catch {
      toast.error('Search failed. Make sure the backend roadmap route is running.')
    } finally {
      setSearching(false)
    }
  }

  const handlePDF = async () => {
    if (!roadmap) return
    setPdfLoading(true)
    try {
      let userName = ''
      try { userName = JSON.parse(localStorage.getItem('nirvexa_user') || '{}')?.name || '' } catch { userName = '' }
      await generatePDF(roadmap, userName)
      toast.success('Roadmap PDF downloaded')
    } catch (e) {
      console.error(e)
      toast.error('PDF generation failed.')
    } finally {
      setPdfLoading(false)
    }
  }

  const visibleTopics = useMemo(() => filterTree(roadmap?.topics || [], filterTerm), [roadmap, filterTerm])
  const allNodes = useMemo(() => flattenNodes(roadmap?.topics || []), [roadmap])
  const activeSummary = useMemo(() => summarizeNode(activeNode), [activeNode])
  const totalTopics = roadmap ? countNodes(roadmap.topics) : 0
  const totalResources = roadmap ? countResources(roadmap.topics) : 0
  const popularRoadmaps = allRoadmaps.slice(0, 20)

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .rg { font-family: 'DM Sans', system-ui, sans-serif; }
        .rg-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .roadmap-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .roadmap-scroll::-webkit-scrollbar-track { background: #f4f4f4; border-radius: 8px; }
        .roadmap-scroll::-webkit-scrollbar-thumb { background: #c9c9c9; border-radius: 8px; }
        @keyframes rgFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .rg-fade { animation: rgFade .25s ease both; }
        .rg-grid-bg {
          background-image:
            linear-gradient(rgba(228,228,228,.42) 1px, transparent 1px),
            linear-gradient(90deg, rgba(228,228,228,.42) 1px, transparent 1px);
          background-size: 28px 28px;
          background-position: -1px -1px;
        }
      `}</style>

      <div className="rg max-w-7xl mx-auto px-4 sm:px-6 pb-20 relative rg-grid-bg">
        <section className="relative z-10 pt-6 pb-5">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#e4e4e4] px-3 py-1.5 text-xs font-semibold text-[#111] shadow-sm">
            <GitBranch size={13} className="text-blue-600" />
            Interactive Roadmaps
          </div>
          <div className="mt-3 grid lg:grid-cols-[1fr_380px] gap-5 items-end">
            <div>
              <h1 className="rg-serif text-3xl sm:text-5xl text-[#0a0a0a] leading-tight">Choose a role. See the path clearly.</h1>
              <p className="mt-2 text-[#525252] text-sm sm:text-base max-w-2xl">
                Select from the role library or search directly. Each roadmap opens as readable stages, focused topics, and export-ready notes.
              </p>
            </div>
            <div className="bg-white border border-[#e4e4e4] rounded-lg p-3 shadow-sm">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search role: Python, DevOps, Game Developer"
                  className="w-full rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] py-3 pl-11 pr-10 text-sm text-[#111] placeholder-[#a3a3a3] outline-none transition focus:border-[#0a0a0a] focus:bg-white"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-12 top-1/2 -translate-y-1/2 text-[#8b8b8b] hover:text-[#111]">
                    <X size={15} />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || searching}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0a0a0a] text-white transition hover:bg-[#222] disabled:bg-[#d4d4d4]"
                  title="Search"
                >
                  {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                </button>
              </div>
              {searchResults.length > 1 && (
                <div className="mt-3 space-y-1">
                  {searchResults.map(r => (
                    <button key={r.id} onClick={() => loadRoadmap(r.id)} className="flex w-full items-center gap-2 rounded-lg border border-[#e4e4e4] bg-white px-3 py-2 text-left text-sm font-semibold text-[#111] transition hover:border-blue-300 hover:bg-blue-50">
                      <ChevronRight size={14} className="text-blue-600" />
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="relative z-10 mb-5">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#6b6b6b]">
            <Layers size={13} />
            Role library
          </div>
          <div className="roadmap-scroll flex gap-2 overflow-x-auto pb-2">
            {popularRoadmaps.map(r => (
              <button
                key={r.id}
                onClick={() => loadRoadmap(r.id)}
                className={`shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-px ${
                  roadmap?.id === r.id
                    ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-md'
                    : 'border-[#e4e4e4] bg-white text-[#3a3a3a] hover:border-[#a3a3a3] hover:text-[#0a0a0a]'
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className="relative z-10 rounded-lg border border-[#e4e4e4] bg-white p-14 text-center shadow-sm">
            <Loader2 size={26} className="mx-auto animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-[#525252]">Loading the roadmap...</p>
          </div>
        )}

        {!loading && !roadmap && (
          <div className="relative z-10 grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="rounded-lg border border-[#e4e4e4] bg-white p-8 shadow-sm">
              <div className="h-14 w-14 rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-center mb-5">
                <MousePointerClick size={25} className="text-blue-600" />
              </div>
              <h2 className="rg-serif text-2xl text-[#111]">Start with a role</h2>
              <p className="mt-2 text-sm text-[#6b6b6b] max-w-xl">
                The selected roadmap will appear here with stages, subtopics, resources, and a matching PDF export.
              </p>
            </div>
            <div className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b]">Roadmap format</p>
              {['Stage overview', 'Topic tree', 'Focus panel', 'Styled PDF'].map((item) => (
                <div key={item} className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#3a3a3a]">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {roadmap && !loading && (
          <div className="relative z-10 rg-fade space-y-5">
            <div className="rounded-lg border border-[#e4e4e4] bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Selected role</p>
                  <h2 className="rg-serif text-2xl sm:text-3xl text-[#111]">{roadmap.title} Roadmap</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: ListTree, label: 'Topics', value: totalTopics },
                    { icon: BookOpen, label: 'Resources', value: totalResources },
                    { icon: Clock3, label: 'Stages', value: roadmap.topics?.length || 0 },
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] px-3 py-2 min-w-[92px]">
                        <Icon size={14} className="text-[#6b6b6b]" />
                        <p className="mt-1 text-lg font-black text-[#111] leading-none">{item.value}</p>
                        <p className="mt-1 text-[10px] font-semibold text-[#8b8b8b] uppercase">{item.label}</p>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={handlePDF}
                  disabled={pdfLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a0a0a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222] disabled:bg-[#d4d4d4]"
                >
                  {pdfLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  PDF
                </button>
              </div>
            </div>

            <div className="grid xl:grid-cols-[280px_1fr_330px] gap-5 items-start">
              <aside className="rounded-lg border border-[#e4e4e4] bg-white p-4 shadow-sm xl:sticky xl:top-20">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-3">Learning stages</p>
                <div className="space-y-2">
                  {(roadmap.topics || []).map((topic, i) => {
                    const style = STAGE_STYLES[i % STAGE_STYLES.length]
                    const summary = summarizeNode(topic)
                    return (
                      <button
                        key={`${topic.label}-${i}`}
                        onClick={() => setActiveNode(topic)}
                        className={`w-full rounded-lg border p-3 text-left transition hover:-translate-y-px hover:shadow-sm ${
                          activeNode?.label === topic.label ? 'border-[#0a0a0a] bg-[#0a0a0a]' : `${style.ring} ${style.wash}`
                        }`}
                      >
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-black ${activeNode?.label === topic.label ? 'bg-white text-[#111]' : `${style.dot} text-white`}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={`mt-2 block text-sm font-bold leading-snug ${activeNode?.label === topic.label ? 'text-white' : 'text-[#111]'}`}>{topic.label}</span>
                        <span className={`mt-1 block text-[11px] ${activeNode?.label === topic.label ? 'text-white/70' : 'text-[#6b6b6b]'}`}>
                          {summary.totalItems} items - {summary.resourceCount} resources
                        </span>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <main className="rounded-lg border border-[#e4e4e4] bg-white p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b]">Classified roadmap</p>
                    <h3 className="text-lg font-black text-[#111]">Expand any topic to inspect the path</h3>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8b8b]" />
                    <input
                      value={filterTerm}
                      onChange={e => setFilterTerm(e.target.value)}
                      placeholder="Filter topics or resources"
                      className="w-full rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] py-2.5 pl-9 pr-3 text-sm text-[#111] outline-none transition focus:border-[#0a0a0a] focus:bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {visibleTopics.length ? visibleTopics.map((node, i) => (
                    <TopicNode key={`${node.label}-${i}`} node={node} activeLabel={activeNode?.label} onSelect={setActiveNode} filterTerm={filterTerm} />
                  )) : (
                    <div className="rounded-lg border border-dashed border-[#d4d4d4] bg-[#fcfcfc] p-10 text-center text-sm font-semibold text-[#8b8b8b]">
                      No topics match "{filterTerm}"
                    </div>
                  )}
                </div>
              </main>

              <aside className="rounded-lg border border-[#e4e4e4] bg-white p-5 shadow-sm xl:sticky xl:top-20">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <PanelRightOpen size={14} />
                  Focus panel
                </div>
                {activeNode ? (
                  <div className="mt-4">
                    <h3 className="text-xl font-black text-[#111] leading-tight">{activeNode.label}</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        ['Subtopics', activeSummary.childCount],
                        ['Items', activeSummary.totalItems],
                        ['Links', activeSummary.resourceCount],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-2">
                          <p className="text-base font-black text-[#111] leading-none">{value}</p>
                          <p className="mt-1 text-[9px] font-bold uppercase text-[#8b8b8b]">{label}</p>
                        </div>
                      ))}
                    </div>

                    {activeNode.children?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Quick scan</p>
                        <div className="space-y-2">
                          {activeNode.children.slice(0, 6).map((child, i) => (
                            <button key={`${child.label}-${i}`} onClick={() => setActiveNode(child)} className="w-full rounded-md border border-[#e4e4e4] bg-[#fcfcfc] px-3 py-2 text-left text-xs font-semibold text-[#3a3a3a] transition hover:border-[#a3a3a3] hover:text-[#111]">
                              {child.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeNode.resources?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8b8b8b] mb-2">Resources</p>
                        <div className="space-y-2">
                          {activeNode.resources.map((r, i) => {
                            const meta = resourceMeta(r.type)
                            return (
                              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-[#e4e4e4] bg-white p-3 transition hover:border-blue-300 hover:shadow-sm">
                                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}>{meta.label}</span>
                                <span className="mt-2 flex items-start gap-2 text-sm font-semibold text-[#111]">
                                  <BookOpen size={14} className="mt-0.5 shrink-0 text-blue-600" />
                                  {cleanTitle(r.title) || 'Open resource'}
                                </span>
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-3">
                      <p className="text-xs font-bold text-[#111] flex items-center gap-2">
                        <Sparkles size={13} className="text-amber-600" />
                        Reader tip
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#6b6b6b]">
                        Read one stage at a time. Open resources only when a topic is unclear or ready for practice.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#6b6b6b]">Select a topic to see its children and resources here.</p>
                )}
              </aside>
            </div>

            <div className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8b8b8b]">Find inside this roadmap</p>
              <div className="roadmap-scroll flex gap-2 overflow-x-auto pb-1">
                {allNodes.slice(0, 28).map((node, i) => (
                  <button
                    key={`${node.label}-${i}`}
                    onClick={() => setActiveNode(node)}
                    className="shrink-0 rounded-md border border-[#e4e4e4] bg-white px-3 py-1.5 text-xs font-semibold text-[#525252] transition hover:border-[#0a0a0a] hover:text-[#111]"
                  >
                    {node.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
