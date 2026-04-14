import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chat'
import Layout from '../components/layout/Layout'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Send, Trash2, Bot, User, Sparkles, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

// Custom component to handle code blocks with copy functionality
const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!inline && match) {
    return (
      <div className="relative group my-5 rounded-xl overflow-hidden border border-white/10 bg-[#111116] shadow-xl w-full">
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{match[1]}</span>
          <button 
            onClick={handleCopy} 
            className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/5"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? <span className="text-emerald-400">Copied</span> : "Copy"}
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.85rem' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    )
  }
  
  return (
    <code className="bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono border border-blue-500/20" {...props}>
      {children}
    </code>
  )
}

export default function Chat() {
  const { user } = useAuth()
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(true)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await chatService.getHistory(1, 50)
        setMessages([...data.messages].reverse())
      } catch {
        // No history yet
      } finally {
        setFetching(false)
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    const tempUserMsg = {
      id:         Date.now(),
      role:       'user',
      content:    userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])
    setLoading(true)

    try {
      const data = await chatService.sendMessage(userMessage)

      const aiMsg = {
        id:          Date.now() + 1,
        role:        'assistant',
        content:     data.message,
        intent:      data.intent,
        created_at:  new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      toast.error('Failed to send message. Please try again.')
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
      setInput(userMessage)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history?')) return
    try {
      await chatService.clearHistory()
      setMessages([])
      toast.success('Workspace cleared')
    } catch {
      toast.error('Failed to clear history')
    }
  }

  const suggestedQuestions = [
    "What specific skills do I need to transition into Data Science?",
    "Simulate a technical interview for a React Developer role.",
    "What are the highest paying tech hubs in India right now?",
    "Generate a 6-month roadmap to become an AI Engineer.",
  ]

  return (
    <Layout>
      <div 
        className="fixed bottom-0 left-0 right-0 z-10 flex flex-col bg-[#0a0a0c] overflow-hidden"
        style={{ height: 'calc(100dvh - 64px)' }}
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HEADER (COMPACTED) ───────────────────────────────── */}
        <div className="shrink-0 w-full border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md z-30 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none mb-0.5">
                  AI Career Workspace
                </h1>
                <p className="text-gray-400 text-[11px] sm:text-xs font-light leading-none">
                  Your intelligent career strategist & mentor
                </p>
              </div>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 shrink-0"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* ── MESSAGES AREA ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto w-full px-4 sm:px-8 pt-4 pb-4 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            {fetching ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner text="Syncing workspace..." />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in w-full max-w-3xl mx-auto my-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Bot size={32} className="text-blue-400" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                    Hi {user?.name?.split(' ')[0] || 'there'}! 👋
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed max-w-lg mx-auto">
                    I'm your intelligent career co-pilot. Let's optimize your resume, prepare for interviews, or map out your next big promotion.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); inputRef.current?.focus() }}
                      className="text-left p-3.5 bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/5 rounded-xl text-sm text-gray-300 hover:text-white transition-all duration-300 shadow-sm group"
                    >
                      <span className="block group-hover:translate-x-1 transition-transform">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pb-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-4 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 shadow-lg mt-0.5 ${
                      msg.role === 'user'
                        ? 'bg-[#1a1a24] border border-white/10'
                        : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-purple-500/20'
                    }`}>
                      {msg.role === 'user'
                        ? <User size={16} className="text-gray-300" />
                        : <Sparkles size={16} className="text-white" />
                      }
                    </div>

                    <div className={`flex flex-col gap-1 w-full ${msg.role === 'user' ? 'items-end max-w-[85%] sm:max-w-[75%]' : 'items-start min-w-0'}`}>
                      <div className={`px-4 sm:px-5 py-3 w-full ${
                        msg.role === 'user'
                          ? 'bg-white/[0.06] text-white rounded-2xl rounded-tr-sm border border-white/5 w-auto'
                          : 'bg-transparent text-gray-100 overflow-x-auto' 
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-invert max-w-none w-full
                            prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[15px]
                            prose-strong:text-white prose-strong:font-semibold
                            prose-ul:text-gray-300 prose-ol:text-gray-300
                            prose-li:my-1 prose-li:marker:text-blue-500
                            prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1.5 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-gray-300 prose-blockquote:not-italic prose-blockquote:my-3
                            prose-hr:border-white/10 prose-hr:my-6
                            prose-pre:p-0 prose-pre:bg-transparent">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-[15px] leading-relaxed font-light">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 sm:gap-4 animate-fade-in mt-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="bg-transparent px-4 py-3">
                      <div className="flex gap-1.5 items-center h-5">
                        <div className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={bottomRef} className="h-1" />
          </div>
        </div>

        {/* ── INPUT AREA (HORIZONTAL & COMPACT) ─────────────────── */}
        <div className="shrink-0 w-full bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 pt-2 sm:pt-3 pb-3 sm:pb-4 px-4 sm:px-6 z-20">
          <div className="w-full max-w-5xl mx-auto">
            
            {/* Horizontal Input Row */}
            <div className="relative flex items-end gap-2 bg-[#111116] border border-white/10 rounded-2xl p-1.5 focus-within:border-blue-500/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your career, jobs, skills..."
                rows={1}
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 resize-none focus:outline-none text-[15px] sm:text-base leading-relaxed max-h-[30vh] px-3 py-2.5 scrollbar-thin scrollbar-thumb-white/10"
                style={{ minHeight: '44px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:text-gray-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
            
            {/* Tiny external helper text */}
            <p className="text-center text-gray-500 text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2 hidden sm:block">
              Press <kbd className="font-sans">Enter</kbd> to send · <kbd className="font-sans">Shift</kbd> + <kbd className="font-sans">Enter</kbd> for new line
            </p>
          </div>
        </div>

      </div>
    </Layout>
  )
}