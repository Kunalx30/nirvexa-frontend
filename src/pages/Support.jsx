import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import api from '../services/api'
import {
  HelpCircle, Search, MessageSquare, ShieldCheck,
  AlertCircle, ChevronDown, Mail, ExternalLink,
  MessageCircle, LifeBuoy, Clock, FileText, CheckCircle2
} from 'lucide-react'

const FAQ_ITEMS = [
  {
    category: 'general',
    q: 'What is Nirvexa?',
    a: 'Nirvexa is an AI-powered career co-pilot designed to streamline your entire job search loop. It helps you prepare interview-ready assets (such as tailored resumes and skill roadmaps), offers real-time voice-based mock interviews, provides curated job listings, and conducts company research — all in a single workspace.'
  },
  {
    category: 'resume',
    q: 'How does the AI ATS Resume Analyzer work?',
    a: 'Our analyzer parses your uploaded resume alongside a target Job Description. It highlights matching keyword gaps, assigns a compatibility score, and generates professional, tailored bullet points that optimize your resume to pass applicant tracking systems (ATS) effectively.'
  },
  {
    category: 'interview',
    q: 'How does the Voice Mock Interview simulator work?',
    a: 'Our voice simulator uses professional audio synthesizers to conduct fully voice-enabled mock HR and technical interviews. It asks realistic, context-specific questions, records your spoken answers, and evaluates your responses based on speed, grammar, content accuracy, and structural relevance.'
  },
  {
    category: 'billing',
    q: 'How do I upgrade to Nirvexa Pro?',
    a: 'You can upgrade directly via our Pricing page. We offer simple Pro Monthly and Pro Yearly options. Payments are processed securely via Razorpay, supporting UPI (GPay, PhonePe), netbanking, and credit/debit cards.'
  },
  {
    category: 'billing',
    q: 'Are subscriptions auto-renewed?',
    a: 'No. Nirvexa Pro plans are simple, one-time payments for the chosen period. We never auto-charge your credit card or UPI accounts. When your plan is close to expiry, you will see a renewal prompt, giving you full control over your billing.'
  },
  {
    category: 'general',
    q: 'How do I set up AI Job Alerts?',
    a: 'Go to your Account Workspace (Profile). Under the "AI Job Alerts" card, click "New Alert," input your core target keywords (e.g. React, Python), choose a preferred location (optional), and pick your desired email frequency (daily or weekly). You will get curated match logs delivered right to your inbox!'
  }
]

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'general', label: 'General Info', icon: LifeBuoy },
  { id: 'resume', label: 'Resume & ATS', icon: FileText },
  { id: 'interview', label: 'AI Interviews', icon: MessageCircle },
  { id: 'billing', label: 'Billing & Pricing', icon: ShieldCheck }
]

export default function Support() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  // Ticket Form State
  const [subject, setSubject] = useState('general')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedTicket, setSubmittedTicket] = useState(null)

  const handleTicketSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Please enter a message for your support ticket')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/admin/tickets', {
        user_id:    user?.id    || null,
        user_name:  user?.name  || 'Guest',
        user_email: user?.email || 'unknown@guest.com',
        subject,
        message: message.trim(),
      })
      const ticket = res.data?.ticket
      setSubmittedTicket(ticket)
      setMessage('')
      toast.success(`Ticket ${ticket.ticket_ref} created successfully!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter FAQs
  const filteredFaqs = FAQ_ITEMS.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
        .faq-transition { transition: max-height 0.3s ease-out, padding 0.3s ease; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-16 font-sans selection:bg-indigo-500/30">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-50/60 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="pt-8 pb-10 z-10 relative flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e4]">
          <div>
            <h1 className="text-3xl font-serif text-[#0a0a0a] tracking-tight">Help & Support</h1>
            <p className="text-[#6b6b6b] font-light mt-1">Get instant answers or get in touch with our engineering team.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational
          </div>
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 z-10 relative">
          
          {/* LEFT 2 COLUMNS: FAQS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-xl font-bold text-[#0a0a0a] tracking-tight mb-5 flex items-center gap-2">
                <HelpCircle className="text-indigo-600" size={20} /> Frequently Asked Questions
              </h2>

              {/* FAQ Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]" size={16} />
                <input
                  type="text"
                  placeholder="Search questions, keywords, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#3a3a3a] placeholder-[#8b8b8b] rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveCategory(id); setOpenFaqIndex(null); }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      activeCategory === id
                        ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm'
                        : 'bg-[#fafafa] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3]'
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              {filteredFaqs.length > 0 ? (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index
                    return (
                      <div
                        key={index}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                          isOpen
                            ? 'border-indigo-500/40 bg-indigo-50/10 shadow-sm'
                            : 'border-[#e4e4e4] bg-white hover:border-[#a3a3a3]'
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between text-left p-5 text-sm sm:text-base font-bold text-[#0a0a0a] tracking-tight focus:outline-none"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            size={16}
                            className={`text-[#8b8b8b] transition-transform duration-300 ${
                              isOpen ? 'transform rotate-180 text-indigo-600' : ''
                            }`}
                          />
                        </button>
                        <div
                          className={`faq-transition overflow-hidden ${
                            isOpen ? 'max-h-[300px] border-t border-[#ededed]' : 'max-h-0'
                          }`}
                        >
                          <p className="p-5 text-sm leading-relaxed text-[#6b6b6b] font-light bg-white">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-[#fafafa] border border-dashed border-[#c4c4c4] rounded-2xl">
                  <AlertCircle size={32} className="text-[#a3a3a3] mx-auto mb-3" />
                  <p className="text-[#6b6b6b] text-sm font-semibold">No questions matches your search.</p>
                  <p className="text-[#a3a3a3] text-xs mt-1">Try other keywords or create a support ticket on the right.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT ENGINEER */}
          <div className="space-y-6">
            
            {/* TICKET / CONTACT FORM */}
            <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#c4c4c4] transition-all">
              <h2 className="text-xl font-bold text-[#0a0a0a] tracking-tight mb-2 flex items-center gap-2">
                <MessageSquare className="text-indigo-600" size={20} /> Engineering Support
              </h2>
              <p className="text-[#6b6b6b] text-xs font-light mb-6">
                Direct route to our developer desk. Average response time: <span className="font-semibold text-indigo-600">under 4 hours</span>.
              </p>

              {submittedTicket ? (
                <div className="text-center py-6 px-4 bg-emerald-50/40 border border-emerald-200/50 rounded-2xl animate-fade-in">
                  <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-emerald-900 font-bold text-sm tracking-tight">Ticket Created Successfully</h3>
                  <span className="inline-block bg-emerald-100/50 text-emerald-800 text-xs px-3 py-1 rounded-full font-mono font-bold mt-2 shadow-sm">
                    {submittedTicket.ticket_ref}
                  </span>
                  <p className="text-[#5a6b5d] text-xs font-light mt-4 leading-relaxed">
                    Our technical support engineers have queued your ticket under subject <span className="font-semibold font-mono">"{submittedTicket.subject}"</span>. An email notification has been dispatched to <span className="font-semibold">{user?.email || 'your registered email'}</span>.
                  </p>
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="mt-6 w-full py-2.5 rounded-xl border border-[#e4e4e4] hover:bg-white text-xs font-semibold text-[#6b6b6b] hover:text-[#0a0a0a] transition-all"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-[#8b8b8b] mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || 'Guest User'}
                      className="w-full bg-[#f3f3f3] border border-[#e4e4e4] text-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8b8b8b] mb-1.5 block">Registered Email</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || 'Sign in required'}
                      className="w-full bg-[#f3f3f3] border border-[#e4e4e4] text-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8b8b8b] mb-1.5 block">Inquiry Category</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#3a3a3a] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="general">General Platform Inquiry</option>
                      <option value="payment">Billing & Payments Issue</option>
                      <option value="technical">Technical Bug / Crash</option>
                      <option value="resume">Resume / ATS builder issue</option>
                      <option value="interview">AI voice interview simulator help</option>
                      <option value="feature">New Feature Suggestion</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#8b8b8b] mb-1.5 block">Detailed Message</label>
                    <textarea
                      rows="4"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please details what issues you are facing, steps to reproduce, or queries you have..."
                      className="w-full bg-[#fafafa] border border-[#e4e4e4] text-[#3a3a3a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-md font-semibold text-sm py-3 rounded-xl hover:-translate-y-0.5 transition-all"
                  >
                    File Support Ticket
                  </Button>
                </form>
              )}
            </div>

            {/* DIRECT CHANNELS CARD */}
            <div className="bg-white border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[#0a0a0a] font-bold text-base tracking-tight mb-4 flex items-center gap-2">
                <Clock className="text-[#6b6b6b]" size={16} /> Direct Channels
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-[#8b8b8b] mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-semibold text-[#0a0a0a]">Email Support</p>
                    <a href="mailto:team@nyrvexa.in" className="text-sm text-indigo-600 hover:underline font-medium flex items-center gap-1">
                      team@nyrvexa.in <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-[#8b8b8b] mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-semibold text-[#0a0a0a]">Desk Operations</p>
                    <p className="text-xs text-[#6b6b6b] mt-0.5 font-light">
                      Mon – Sat: 9:00 AM – 7:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  )
}
