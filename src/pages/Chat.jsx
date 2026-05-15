import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chat'
import Layout from '../components/layout/Layout'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Send, Trash2, Bot, User, Sparkles, Copy, Check, Plus, MessageSquare, Pencil, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

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
      <div className="cb-wrap">
        <div className="cb-bar">
          <span className="cb-lang">{match[1]}</span>
          <button onClick={handleCopy} className="cb-copy" title="Copy code">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          style={oneLight}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', background: '#fafafa', fontSize: '0.85rem', borderRadius: '0 0 10px 10px' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    )
  }

  return <code className="cb-inline" {...props}>{children}</code>
}

export default function Chat() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const activeSession = sessions.find(s => s.id === activeSessionId)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await chatService.listSessions()
        const loaded = data.sessions || []
        setSessions(loaded)
        if (loaded.length > 0) {
          setActiveSessionId(loaded[0].id)
        } else {
          setFetching(false)
        }
      } catch {
        toast.error('Could not load chats')
        setFetching(false)
      }
    }
    loadSessions()
  }, [])

  useEffect(() => {
    const loadHistory = async () => {
      if (!activeSessionId) {
        setMessages([])
        return
      }
      setFetching(true)
      try {
        const data = await chatService.getHistory(1, 50, activeSessionId)
        setMessages([...(data.messages || [])].reverse())
      } catch {
        toast.error('Could not load chat history')
      } finally {
        setFetching(false)
      }
    }
    loadHistory()
  }, [activeSessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const syncSession = (session) => {
    if (!session) return
    setSessions(prev => {
      const exists = prev.some(item => item.id === session.id)
      const next = exists
        ? prev.map(item => item.id === session.id ? session : item)
        : [session, ...prev]
      return [...next].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    })
    setActiveSessionId(session.id)
  }

  const handleNewChat = async () => {
    try {
      const data = await chatService.createSession('New chat')
      syncSession(data.session)
      setMessages([])
      setSidebarOpen(false)
      inputRef.current?.focus()
    } catch {
      toast.error('Could not create chat')
    }
  }

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId)
    setSidebarOpen(false)
  }

  const handleRenameSession = async (session) => {
    const title = window.prompt('Rename chat', session.title)
    if (!title || title.trim() === session.title) return
    try {
      const data = await chatService.updateSession(session.id, title.trim())
      syncSession(data.session)
    } catch {
      toast.error('Could not rename chat')
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this chat?')) return
    try {
      await chatService.deleteSession(sessionId)
      setSessions(prev => {
        const remaining = prev.filter(session => session.id !== sessionId)
        if (activeSessionId === sessionId) {
          setActiveSessionId(remaining[0]?.id || null)
          if (remaining.length === 0) setMessages([])
        }
        return remaining
      })
      toast.success('Chat deleted')
    } catch {
      toast.error('Could not delete chat')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])
    setLoading(true)

    try {
      const data = await chatService.sendMessage(userMessage, { sessionId: activeSessionId })
      syncSession(data.session)
      const aiMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        intent: data.intent,
        session_id: data.session_id,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
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
    if (!activeSessionId || !window.confirm('Clear this chat history?')) return
    try {
      await chatService.clearHistory(activeSessionId)
      setMessages([])
      toast.success('Chat cleared')
    } catch {
      toast.error('Failed to clear history')
    }
  }

  const suggestedQuestions = [
    'What specific skills do I need to transition into Data Science?',
    'Simulate a technical interview for a React Developer role.',
    'What are the highest paying tech hubs in India right now?',
    'Generate a 6-month roadmap to become an AI Engineer.',
  ]

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .chat-shell{position:fixed;bottom:0;left:0;right:0;z-index:10;display:flex;overflow:hidden;background:#fafafa;font-family:'DM Sans',system-ui,sans-serif;height:calc(100dvh - 64px);-webkit-font-smoothing:antialiased}
        .chat-side{width:286px;flex-shrink:0;border-right:1px solid #e4e4e4;background:#fff;display:flex;flex-direction:column;z-index:35}
        .chat-side-top{padding:14px;border-bottom:1px solid #ededed;display:flex;align-items:center;gap:10px}
        .chat-new{height:40px;flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:8px;background:#0a0a0a;color:#fff;font-size:13px;font-weight:600;cursor:pointer}
        .chat-mobile-close{display:none;width:40px;height:40px;align-items:center;justify-content:center;border:1px solid #e4e4e4;border-radius:8px;background:#fff;color:#555}
        .chat-list{flex:1;overflow-y:auto;padding:10px}
        .chat-list::-webkit-scrollbar{width:4px}.chat-list::-webkit-scrollbar-thumb{background:#d4d4d4;border-radius:4px}
        .chat-item{width:100%;display:flex;align-items:center;gap:9px;border:1px solid transparent;background:transparent;border-radius:8px;padding:9px 8px;color:#4b5563;cursor:pointer;text-align:left}
        .chat-item:hover{background:#f7f7f7}.chat-item.active{background:#f0f4ff;border-color:#dbe6ff;color:#0a0a0a}
        .chat-item-title{flex:1;min-width:0;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .chat-item-actions{display:flex;gap:2px;opacity:0}.chat-item:hover .chat-item-actions,.chat-item.active .chat-item-actions{opacity:1}
        .chat-icon-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:none;border-radius:7px;background:transparent;color:#8a8a8a;cursor:pointer}.chat-icon-btn:hover{background:#fff;color:#111}.chat-icon-btn.danger:hover{color:#ef4444}
        .chat-empty-list{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;color:#a3a3a3;font-size:13px;padding:20px}
        .chat-main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden}
        .chat-hdr{flex-shrink:0;width:100%;border-bottom:1px solid #e4e4e4;background:rgba(255,255,255,.82);backdrop-filter:saturate(180%) blur(20px);z-index:30;padding:10px 24px}
        .chat-hdr-in{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px}
        .chat-hdr-left{display:flex;align-items:center;gap:12px;min-width:0}.chat-menu{display:none;width:34px;height:34px;align-items:center;justify-content:center;border:1px solid #e4e4e4;border-radius:9px;background:#fff;color:#333}
        .chat-hdr-icon{width:34px;height:34px;border-radius:10px;background:#0a0a0a;display:flex;align-items:center;justify-content:center;flex-shrink:0}.chat-hdr-icon svg{color:#fafafa}
        .chat-hdr h1{font-size:16px;font-weight:600;color:#0a0a0a;letter-spacing:0;line-height:1.2;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(520px,55vw)}
        .chat-hdr p{font-size:12px;color:#a3a3a3;margin:0;font-weight:400}
        .chat-clear{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:#a3a3a3;background:#fafafa;border:1px solid #e4e4e4;border-radius:8px;padding:7px 10px;cursor:pointer;transition:all .2s;flex-shrink:0}.chat-clear:hover{color:#ef4444;border-color:#fecaca;background:#fef2f2}
        .chat-msgs{flex:1;overflow-y:auto;width:100%;padding:20px 24px;z-index:10}.chat-msgs::-webkit-scrollbar{width:4px}.chat-msgs::-webkit-scrollbar-track{background:transparent}.chat-msgs::-webkit-scrollbar-thumb{background:#d4d4d4;border-radius:4px}
        .chat-msgs-in{max-width:900px;margin:0 auto;height:100%;display:flex;flex-direction:column}
        .chat-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:24px;max-width:640px;margin:0 auto}
        .chat-empty-icon{width:56px;height:56px;border-radius:16px;background:#f3f3f3;border:1px solid #e4e4e4;display:flex;align-items:center;justify-content:center}.chat-empty-icon svg{color:#0a0a0a}
        .chat-empty h2{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(24px,4vw,32px);letter-spacing:0;color:#0a0a0a;text-align:center;margin:0}.chat-empty h2 em{font-style:italic;color:#3b82f6}
        .chat-empty-sub{font-size:15px;color:#6b6b6b;text-align:center;max-width:420px;line-height:1.6;margin:0}
        .chat-suggestions{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:8px}.chat-sug{text-align:left;padding:14px 16px;background:#fff;border:1px solid #e4e4e4;border-radius:8px;font-size:13px;color:#6b6b6b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .25s;line-height:1.5}.chat-sug:hover{border-color:#0a0a0a;color:#0a0a0a;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06)}
        .msg-list{display:flex;flex-direction:column;gap:20px;padding-bottom:8px}.msg-row{display:flex;gap:12px;animation:msgIn .35s ease}.msg-row.user{flex-direction:row-reverse}@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .msg-av{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}.msg-av.ai{background:#0a0a0a}.msg-av.ai svg{color:#fafafa}.msg-av.hu{background:#f3f3f3;border:1px solid #e4e4e4}.msg-av.hu svg{color:#6b6b6b}
        .msg-content{display:flex;flex-direction:column;gap:4px;min-width:0}.msg-row.user .msg-content{align-items:flex-end;max-width:80%}.msg-row:not(.user) .msg-content{align-items:flex-start;width:100%}
        .msg-bubble{padding:14px 18px;border-radius:12px;font-size:14px;line-height:1.7}.msg-row.user .msg-bubble{background:#0a0a0a;color:#fafafa;border-radius:12px 12px 4px 12px}.msg-row:not(.user) .msg-bubble{background:#fff;border:1px solid #e4e4e4;color:#0a0a0a;border-radius:12px 12px 12px 4px}
        .msg-prose{max-width:none;width:100%}.msg-prose h1,.msg-prose h2,.msg-prose h3{font-weight:600;color:#0a0a0a;letter-spacing:0;margin:20px 0 10px;display:flex;align-items:center;gap:8px}.msg-prose h1::before,.msg-prose h2::before,.msg-prose h3::before{content:"";display:block;width:6px;height:6px;border-radius:50%;background:#3b82f6;flex-shrink:0}.msg-prose h1{font-size:20px}.msg-prose h2{font-size:17px}.msg-prose h3{font-size:15px}.msg-prose p{color:#3a3a3a;font-size:14px;line-height:1.75;margin:6px 0}.msg-prose strong{color:#0a0a0a;font-weight:600}.msg-prose ul,.msg-prose ol{color:#3a3a3a;padding-left:20px;margin:8px 0}.msg-prose li{margin:4px 0;font-size:14px;line-height:1.65}.msg-prose blockquote{border-left:3px solid #e4e4e4;background:#f9f9f9;padding:10px 16px;border-radius:0 8px 8px 0;color:#6b6b6b;margin:12px 0}.msg-prose hr{border:none;border-top:1px solid #e4e4e4;margin:16px 0}.msg-prose pre{padding:0;background:transparent;margin:0}.msg-prose a{color:#3b82f6;text-decoration:underline;text-underline-offset:2px}.msg-prose table{width:100%;border-collapse:collapse;font-size:13px;margin:12px 0}.msg-prose th{text-align:left;padding:8px 12px;border-bottom:2px solid #e4e4e4;font-weight:600;color:#0a0a0a}.msg-prose td{padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#3a3a3a}
        .cb-wrap{border:1px solid #e4e4e4;border-radius:8px;overflow:hidden;margin:12px 0;background:#fafafa}.cb-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#f3f3f3;border-bottom:1px solid #e4e4e4}.cb-lang{font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#a3a3a3}.cb-copy{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:500;color:#6b6b6b;background:#fff;border:1px solid #e4e4e4;padding:4px 10px;border-radius:8px;cursor:pointer}.cb-inline{background:#f0f0f0;color:#0a0a0a;padding:2px 6px;border-radius:6px;font-size:.85em;font-family:monospace;border:1px solid #e4e4e4}
        .typing{display:flex;gap:12px;animation:msgIn .35s ease}.typing-dots{display:flex;align-items:center;gap:5px;padding:14px 18px;background:#fff;border:1px solid #e4e4e4;border-radius:12px 12px 12px 4px}.typing-dot{width:7px;height:7px;border-radius:50%;background:#d4d4d4;animation:bounce .6s infinite alternate}.typing-dot:nth-child(2){animation-delay:.15s;background:#a3a3a3}.typing-dot:nth-child(3){animation-delay:.3s;background:#6b6b6b}@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-6px)}}
        .chat-input-area{flex-shrink:0;width:100%;background:rgba(255,255,255,.9);backdrop-filter:blur(16px);border-top:1px solid #e4e4e4;padding:12px 24px 16px;z-index:20}.chat-input-in{max-width:900px;margin:0 auto}.chat-input-row{display:flex;align-items:flex-end;gap:8px;background:#fff;border:1px solid #e4e4e4;border-radius:12px;padding:6px;transition:border-color .2s,box-shadow .2s}.chat-input-row:focus-within{border-color:#0a0a0a;box-shadow:0 0 0 3px rgba(10,10,10,.04)}
        .chat-ta{flex:1;background:transparent;color:#0a0a0a;resize:none;font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.6;border:none;outline:none;padding:8px 12px;max-height:30vh;min-height:44px}.chat-ta::placeholder{color:#b0b0b0}.chat-send{width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fafafa;border:none;border-radius:10px;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s}.chat-send:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.15)}.chat-send:disabled{opacity:.3;cursor:not-allowed}.chat-hint{text-align:center;font-size:11px;color:#c4c4c4;margin-top:8px}.chat-loading{display:flex;align-items:center;justify-content:center;height:100%}
        @media(max-width:820px){.chat-side{position:absolute;inset:0 auto 0 0;transform:translateX(-100%);transition:transform .2s;width:min(84vw,320px);box-shadow:16px 0 40px rgba(0,0,0,.12)}.chat-side.open{transform:translateX(0)}.chat-mobile-close,.chat-menu{display:flex}.chat-hdr{padding:10px 16px}.chat-msgs{padding:16px}.chat-input-area{padding:10px 16px 14px}.chat-suggestions{grid-template-columns:1fr}.msg-row.user .msg-content{max-width:90%}.chat-hdr h1{max-width:48vw}}
      `}</style>

      <div className="chat-shell">
        <aside className={`chat-side${sidebarOpen ? ' open' : ''}`}>
          <div className="chat-side-top">
            <button className="chat-new" onClick={handleNewChat}>
              <Plus size={16} /> New chat
            </button>
            <button className="chat-mobile-close" onClick={() => setSidebarOpen(false)} title="Close chats">
              <X size={18} />
            </button>
          </div>
          <div className="chat-list">
            {sessions.length === 0 ? (
              <div className="chat-empty-list">Start a new chat to build your workspace.</div>
            ) : sessions.map(session => (
              <button
                key={session.id}
                className={`chat-item${session.id === activeSessionId ? ' active' : ''}`}
                onClick={() => handleSelectSession(session.id)}
              >
                <MessageSquare size={15} />
                <span className="chat-item-title">{session.title}</span>
                <span className="chat-item-actions" onClick={e => e.stopPropagation()}>
                  <span className="chat-icon-btn" role="button" tabIndex={0} onClick={() => handleRenameSession(session)} title="Rename chat">
                    <Pencil size={13} />
                  </span>
                  <span className="chat-icon-btn danger" role="button" tabIndex={0} onClick={() => handleDeleteSession(session.id)} title="Delete chat">
                    <Trash2 size={13} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-hdr">
            <div className="chat-hdr-in">
              <div className="chat-hdr-left">
                <button className="chat-menu" onClick={() => setSidebarOpen(true)} title="Open chats">
                  <Menu size={18} />
                </button>
                <div className="chat-hdr-icon"><Sparkles size={16} /></div>
                <div style={{ minWidth: 0 }}>
                  <h1>{activeSession?.title || 'AI Career Workspace'}</h1>
                  <p>Your intelligent career strategist</p>
                </div>
              </div>
              {messages.length > 0 && (
                <button onClick={handleClearHistory} className="chat-clear">
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="chat-msgs">
            <div className="chat-msgs-in">
              {fetching ? (
                <div className="chat-loading"><LoadingSpinner text="Syncing workspace..." /></div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  <div className="chat-empty-icon"><Bot size={28} /></div>
                  <div style={{ textAlign: 'center' }}>
                    <h2>Hi {user?.name?.split(' ')[0] || 'there'}! <em>Let's begin.</em></h2>
                    <p className="chat-empty-sub">
                      Ask about resume optimization, interview prep, salary insights, or career roadmaps.
                    </p>
                  </div>
                  <div className="chat-suggestions">
                    {suggestedQuestions.map((q, i) => (
                      <button key={i} onClick={() => { setInput(q); inputRef.current?.focus() }} className="chat-sug">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="msg-list">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`msg-row${msg.role === 'user' ? ' user' : ''}`}>
                      <div className={`msg-av${msg.role === 'user' ? ' hu' : ' ai'}`}>
                        {msg.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
                      </div>
                      <div className="msg-content">
                        <div className="msg-bubble">
                          {msg.role === 'assistant' ? (
                            <div className="msg-prose">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : <span>{msg.content}</span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="typing">
                      <div className="msg-av ai"><Sparkles size={15} /></div>
                      <div className="typing-dots">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={bottomRef} style={{ height: 1 }} />
            </div>
          </div>

          <div className="chat-input-area">
            <div className="chat-input-in">
              <div className="chat-input-row">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your career, jobs, skills..."
                  rows={1}
                  className="chat-ta"
                />
                <button onClick={sendMessage} disabled={!input.trim() || loading} className="chat-send" title="Send">
                  <Send size={17} />
                </button>
              </div>
              <p className="chat-hint">Press Enter to send. Shift + Enter for a new line.</p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
