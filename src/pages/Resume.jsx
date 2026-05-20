/**
 * src/pages/Resume.jsx
 * NirVexa - Resume Suite (Phase 6.0)
 *
 * Tab 1: ATS Analyzer  - upload PDF + optional JD - score + keywords
 * Tab 2: AI Builder    - 4-step form - Groq - LaTeX - PDF download
 */

import Layout from '../components/layout/Layout'
import TemplateMockup from '../components/TemplateMockup'
import {
  UploadCloud, FileText, CheckCircle2, XCircle, AlertTriangle,
  Sparkles, Loader2, Target, FileCheck, History, ChevronDown,
  ChevronUp, RefreshCw, Wand2, ChevronRight, ChevronLeft,
  Download, Eye, Plus, Trash2, BookOpen, Briefcase,
  Code2, Award, User, Mail, Phone, MapPin,
  Globe, Building2, Calendar, GraduationCap, Cpu, ArrowRight,
  Check, Layout as LayoutIcon, Zap, Link
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useState, useEffect, useCallback, useRef } from 'react'

// -----------------------------------------------------------------------------
// API CALLS
// -----------------------------------------------------------------------------

const analyzeResumeAPI = (file, jdText = '') => {
  const formData = new FormData()
  formData.append('file', file)
  if (jdText.trim()) formData.append('job_description', jdText.trim())
  return api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  })
}
 
const fetchTemplatesAPI   = ()         => api.get('/resume/templates')
const fetchHistoryAPI     = ()         => api.get('/resume/history')
const buildResumeAPI      = (data)     => api.post('/resume/build', data, { timeout: 120000 })
const enhanceBulletsAPI   = (bullets)  => api.post('/resume/enhance', { bullets }, { timeout: 45000 })

const regenerateResumeAPI = (resumeId, data) =>
  api.post(`/resume/regenerate/${resumeId}`, data, { timeout: 120000 })

const compileLatexAPI = (latex_code) =>
  api.post('/resume/compile', { latex_code }, { timeout: 60000 })

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

const getAtsStyles = (status) => {
  const s = status?.toLowerCase()
  if (s === 'excellent' || s === 'optimized')
    return { dot: 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]', text: 'text-emerald-600', badge: 'bg-emerald-50 border-emerald-200 text-emerald-600', label: 'Ready to Apply' }
  if (s === 'good')
    return { dot: 'bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]', text: 'text-blue-600', badge: 'bg-blue-50 border-blue-200 text-blue-600', label: 'Good Standing' }
  if (s === 'fair' || s === 'needs improvement' || s === 'needs work')
    return { dot: 'bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]', text: 'text-amber-600', badge: 'bg-amber-50 border-amber-200 text-amber-600', label: 'Needs Work' }
  return { dot: 'bg-rose-400', text: 'text-rose-600', badge: 'bg-rose-50 border-rose-200 text-rose-600', label: 'Poor Match' }
}

const getScoreGradient = (score) => {
  if (score >= 80) return 'from-emerald-400 to-blue-400'
  if (score >= 60) return 'from-blue-400 to-purple-400'
  if (score >= 40) return 'from-amber-400 to-orange-400'
  return 'from-rose-400 to-pink-400'
}

const getResumeScoreTone = (score = 0) => {
  if (score >= 80) return {
    label: 'Competitive',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    note: 'Strong enough to apply, but still tune it to each JD.'
  }
  if (score >= 60) return {
    label: 'Close',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    bar: 'bg-blue-500',
    note: 'Good base. Improve keywords, impact, and role alignment before serious applications.'
  }
  if (score >= 40) return {
    label: 'Needs Work',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    note: 'Readable, but not yet strong for competitive roles. Fix gaps before applying widely.'
  }
  return {
    label: 'High Risk',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    bar: 'bg-rose-500',
    note: 'Likely to struggle in ATS and recruiter screening. Rework the structure and evidence.'
  }
}

const downloadPDF = (base64, filename = 'resume.pdf') => {
  const bytes = atob(base64)
  const arr   = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  const blob = new Blob([arr], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const openPDFPreview = (base64) => {
  const bytes = atob(base64)
  const arr   = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  const blob = new Blob([arr], { type: 'application/pdf' })
  window.open(URL.createObjectURL(blob), '_blank')
}

// -----------------------------------------------------------------------------
// FORM INITIAL STATE
// -----------------------------------------------------------------------------

const emptyEdu = () => ({ degree: '', institution: '', year: '', cgpa: '' })
const emptyExp = () => ({ company: '', role: '', duration: '', location: '', bullets_raw: '' })
const emptyProj = () => ({ name: '', tech: '', description: '' })

const initialForm = {
  // Personal
  full_name: '', email: '', phone: '', location: '',
  linkedin_url: '', github_url: '', portfolio_url: '',
  // Target
  target_role: '', job_description: '',
  // Arrays
  education:   [emptyEdu()],
  experience:  [emptyExp()],
  projects:    [emptyProj()],
  // Text blobs
  skills_raw:          '',
  certifications_raw:  '',
  // Template
  template_id: '',
}

// -----------------------------------------------------------------------------
// STEP CONFIG
// -----------------------------------------------------------------------------

const STEPS = [
  { id: 0, label: 'Personal',   icon: User },
  { id: 1, label: 'Experience', icon: Briefcase },
  { id: 2, label: 'Education',  icon: GraduationCap },
  { id: 3, label: 'Skills',     icon: Cpu },
  { id: 4, label: 'Template',   icon: LayoutIcon },
]

// -----------------------------------------------------------------------------
// SUB-COMPONENT: Input field
// -----------------------------------------------------------------------------

const Field = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, required, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={12} className="text-[#8b8b8b]" />} {label} {required && <span className="text-rose-600">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl px-4 py-2.5 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all duration-200 transition-all"
    />
  </div>
)

const TextArea = ({ label, icon: Icon, value, onChange, placeholder, rows = 4, hint, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={12} className="text-[#8b8b8b]" />} {label}
    </label>
    {hint && <p className="text-[11px] text-[#a3a3a3] -mt-0.5">{hint}</p>}
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all duration-200 transition-all resize-none font-mono leading-relaxed"
    />
  </div>
)

// -----------------------------------------------------------------------------
// STEP 0 - Personal Info
// -----------------------------------------------------------------------------

const StepPersonal = ({ form, update }) => (
  <div className="space-y-6">
    <SectionTitle icon={User} title="Personal Information" subtitle="Basic contact details for the resume header" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Full Name"   icon={User}     value={form.full_name}     onChange={v => update('full_name', v)}     placeholder="John Doe"  required />
      <Field label="Email"       icon={Mail}     value={form.email}         onChange={v => update('email', v)}         placeholder="john.doe@example.com" required type="email" />
      <Field label="Phone"       icon={Phone}    value={form.phone}         onChange={v => update('phone', v)}         placeholder="+91 98765 43210" />
      <Field label="Location"    icon={MapPin}   value={form.location}      onChange={v => update('location', v)}      placeholder="Hyderabad, TS" />
      <Field label="LinkedIn URL" icon={Link} value={form.linkedin_url} onChange={v => update('linkedin_url', v)} placeholder="https://linkedin.com/in/johndoe" />
      <Field label="GitHub URL"  icon={Link}   value={form.github_url}    onChange={v => update('github_url', v)}    placeholder="https://github.com/johndoe" />
      <Field label="Portfolio URL" icon={Globe}  value={form.portfolio_url} onChange={v => update('portfolio_url', v)} placeholder="https://johndoe.dev" className="sm:col-span-2" />
    </div>

    <div className="border-t border-[#e4e4e4] pt-5">
      <SectionTitle icon={Target} title="Target Role" subtitle="Tailor the resume to a specific job" />
      <div className="space-y-4 mt-3">
        <Field label="Job Title / Target Role" icon={Briefcase} value={form.target_role} onChange={v => update('target_role', v)} placeholder="Software Engineer, Product Manager, Data Analyst..." required />
        <TextArea
          label="Job Description (optional - enables JD-match mode)"
          icon={FileText}
          value={form.job_description}
          onChange={v => update('job_description', v)}
          placeholder="Paste the full job description here. AI will tailor keywords and bullets to this specific role..."
          rows={5}
          hint="Pasting a JD boosts ATS match score by injecting exact keywords the employer's system scans for."
        />
      </div>
    </div>
  </div>
)

// -----------------------------------------------------------------------------
// STEP 1 - Experience + Projects
// -----------------------------------------------------------------------------

const StepExperience = ({ form, update, enhanceBullets, enhancing }) => {
  const addExp  = () => update('experience', [...form.experience, emptyExp()])
  const removeExp = (i) => update('experience', form.experience.filter((_, idx) => idx !== i))
  const updateExp = (i, field, val) => {
    const arr = [...form.experience]
    arr[i] = { ...arr[i], [field]: val }
    update('experience', arr)
  }

  const addProj  = () => update('projects', [...form.projects, emptyProj()])
  const removeProj = (i) => update('projects', form.projects.filter((_, idx) => idx !== i))
  const updateProj = (i, field, val) => {
    const arr = [...form.projects]
    arr[i] = { ...arr[i], [field]: val }
    update('projects', arr)
  }

  const handleEnhance = async (i) => {
    const raw = form.experience[i].bullets_raw
    if (!raw.trim()) return toast.error('Add some bullet points first')
    const bullets = raw.split('\n').map(b => b.replace(/^[--]\s*/, '').trim()).filter(Boolean)
    if (!bullets.length) return toast.error('No bullets detected')
    try {
      const res = await enhanceBullets(bullets)
      const enhanced = res?.data?.enhanced_bullets || res?.data?.data || []
      if (enhanced.length) {
        updateExp(i, 'bullets_raw', enhanced.map(b => `- ${b}`).join('\n'))
        toast.success('Bullets enhanced!')
      }
    } catch {
      toast.error('Enhancement failed')
    }
  }

  return (
    <div className="space-y-8">
      {/* Experience */}
      <div>
        <SectionTitle icon={Briefcase} title="Work Experience" subtitle="List internships, jobs, freelance work. AI expands raw bullets into full ATS sentences." />
        <div className="space-y-5 mt-4">
          {form.experience.map((exp, i) => (
            <div key={i} className="bg-white shadow-sm hover:shadow-md border border-[#e4e4e4] hover:border-[#c4c4c4] rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-0.5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8b8b8b] uppercase tracking-wider">Role {i + 1}</span>
                {form.experience.length > 1 && (
                  <button onClick={() => removeExp(i)} className="text-[#a3a3a3] hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Company"  icon={Building2} value={exp.company}  onChange={v => updateExp(i, 'company', v)}  placeholder="Tech Innovators Inc." />
                <Field label="Role"     icon={Briefcase} value={exp.role}     onChange={v => updateExp(i, 'role', v)}     placeholder="Software Engineer" />
                <Field label="Duration" icon={Calendar}  value={exp.duration} onChange={v => updateExp(i, 'duration', v)} placeholder="Jan 2022 - Present" />
                <Field label="Location" icon={MapPin}    value={exp.location} onChange={v => updateExp(i, 'location', v)} placeholder="Hyderabad, TS (Remote)" />
              </div>
              <div>
                <TextArea
                  label="What you did (raw bullets - AI rewrites them powerfully)"
                  value={exp.bullets_raw}
                  onChange={v => updateExp(i, 'bullets_raw', v)}
                  placeholder={"- Developed and maintained scalable microservices\n- Optimized database queries improving performance by 30%\n- Led a team of 3 junior developers"}
                  rows={4}
                  hint="Type rough bullet points. Even vague inputs work - AI adds action verbs, tech names, and metrics."
                />
                <button
                  onClick={() => handleEnhance(i)}
                  disabled={enhancing}
                  className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-300 transition-colors disabled:opacity-40"
                >
                  {enhancing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                  AI Enhance Bullets
                </button>
              </div>
            </div>
          ))}
          <button onClick={addExp} className="flex items-center gap-2 text-sm text-[#6b6b6b] hover:text-[#0a0a0a] border border-dashed border-[#e4e4e4] hover:border-[#c4c4c4] rounded-xl px-4 py-2.5 transition-all w-full justify-center">
            <Plus size={14} /> Add Another Role
          </button>
        </div>
      </div>

      {/* Projects */}
      <div>
        <SectionTitle icon={Code2} title="Projects" subtitle="Personal or academic projects. AI expands descriptions into 2 impact-focused bullets." />
        <div className="space-y-5 mt-4">
          {form.projects.map((proj, i) => (
            <div key={i} className="bg-white shadow-sm hover:shadow-md border border-[#e4e4e4] hover:border-[#c4c4c4] rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-0.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8b8b8b] uppercase tracking-wider">Project {i + 1}</span>
                {form.projects.length > 1 && (
                  <button onClick={() => removeProj(i)} className="text-[#a3a3a3] hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Project Name" icon={Code2}  value={proj.name} onChange={v => updateProj(i, 'name', v)} placeholder="E-Commerce Analytics Platform" />
                <Field label="Tech Stack"   icon={Cpu}    value={proj.tech} onChange={v => updateProj(i, 'tech', v)} placeholder="Node.js, React, AWS, MongoDB" />
              </div>
              <TextArea
                label="Description (1-3 lines - AI expands to 2 full bullets)"
                value={proj.description}
                onChange={v => updateProj(i, 'description', v)}
                placeholder="A real-time analytics dashboard for e-commerce platforms to track user engagement and sales metrics."
                rows={3}
              />
            </div>
          ))}
          <button onClick={addProj} className="flex items-center gap-2 text-sm text-[#6b6b6b] hover:text-[#0a0a0a] border border-dashed border-[#e4e4e4] hover:border-[#c4c4c4] rounded-xl px-4 py-2.5 transition-all w-full justify-center">
            <Plus size={14} /> Add Another Project
          </button>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// STEP 2 - Education
// -----------------------------------------------------------------------------

const StepEducation = ({ form, update }) => {
  const addEdu    = () => update('education', [...form.education, emptyEdu()])
  const removeEdu = (i) => update('education', form.education.filter((_, idx) => idx !== i))
  const updateEdu = (i, field, val) => {
    const arr = [...form.education]
    arr[i] = { ...arr[i], [field]: val }
    update('education', arr)
  }

  return (
    <div className="space-y-6">
      <SectionTitle icon={GraduationCap} title="Education" subtitle="AI automatically adds relevant coursework for each degree." />
      <div className="space-y-5">
        {form.education.map((edu, i) => (
          <div key={i} className="bg-white shadow-sm hover:shadow-md border border-[#e4e4e4] hover:border-[#c4c4c4] rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-0.5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8b8b8b] uppercase tracking-wider">Degree {i + 1}</span>
              {form.education.length > 1 && (
                <button onClick={() => removeEdu(i)} className="text-[#a3a3a3] hover:text-rose-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Degree"      icon={BookOpen}      value={edu.degree}      onChange={v => updateEdu(i, 'degree', v)}      placeholder="B.S. in Computer Science" className="sm:col-span-2" />
              <Field label="Institution" icon={GraduationCap} value={edu.institution} onChange={v => updateEdu(i, 'institution', v)} placeholder="University of Technology" className="sm:col-span-2" />
              <Field label="Year"        icon={Calendar}      value={edu.year}        onChange={v => updateEdu(i, 'year', v)}        placeholder="2018 - 2022" />
              <Field label="CGPA / %"    icon={Award}         value={edu.cgpa}        onChange={v => updateEdu(i, 'cgpa', v)}        placeholder="3.8 / 4.0" />
            </div>
          </div>
        ))}
        <button onClick={addEdu} className="flex items-center gap-2 text-sm text-[#6b6b6b] hover:text-[#0a0a0a] border border-dashed border-[#e4e4e4] hover:border-[#c4c4c4] rounded-xl px-4 py-2.5 transition-all w-full justify-center">
          <Plus size={14} /> Add Degree
        </button>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// STEP 3 - Skills + Certifications
// -----------------------------------------------------------------------------

const StepSkills = ({ form, update }) => (
  <div className="space-y-6">
    <SectionTitle icon={Cpu} title="Skills & Certifications" subtitle="Paste all your skills - AI categorizes them into domain-appropriate groups automatically." />
    <TextArea
      label="All Skills (comma-separated)"
      icon={Cpu}
      value={form.skills_raw}
      onChange={v => update('skills_raw', v)}
      placeholder="JavaScript, TypeScript, React, Node.js, Python, SQL, Docker, AWS, Git, Agile Methodologies, REST APIs..."
      rows={5}
      hint="Don't worry about organizing - paste everything. AI groups them into 5 categories like Languages, Frameworks, Tools, etc."
    />
    <TextArea
      label="Certifications (one per line: Name -+ Issuer -+ Year)"
      icon={Award}
      value={form.certifications_raw}
      onChange={v => update('certifications_raw', v)}
      placeholder={"AWS Certified Solutions Architect -+ Amazon Web Services -+ 2023\nProfessional Scrum Master I -+ Scrum.org -+ 2022"}
      rows={4}
      hint="Separate each certification with a bullet (-+) or dash. AI formats them professionally."
    />
  </div>
)

// -----------------------------------------------------------------------------
// STEP 4 - Template Picker
// -----------------------------------------------------------------------------

const TEMPLATE_INFO = {
  template_01_modern_blue:   { label: 'Modern Blue', category: 'Modern' },
  template_02_teal_clean:    { label: 'Teal Clean', category: 'Clean' },
  template_03_classic_black: { label: 'Classic Black', category: 'Traditional' },
  template_04_executive:     { label: 'Executive', category: 'Professional' },
  template_05_two_column:    { label: 'Two Column', category: 'Modern' },
  template_06_minimal_mono:  { label: 'Minimal Mono', category: 'Minimalist' },
  template_07_blue_accent:   { label: 'Blue Accent', category: 'Modern' },
  template_08_teal_garamond: { label: 'Teal Garamond', category: 'Traditional' },
  template_09_classic_jake:  { label: 'Classic Jake', category: 'Traditional' },
  template_10_charter_clean: { label: 'Charter Clean', category: 'Clean' },
  template_11_warm_sidebar:  { label: 'Warm Sidebar', category: 'Modern' },
  template_12_navy_uppercase:{ label: 'Navy Uppercase', category: 'Minimalist' },
  template_13_crimson_double:{ label: 'Crimson Double', category: 'Traditional' },
  template_14_purple_tri:    { label: 'Purple Tri', category: 'Modern' },
  template_15_slate_ruled:   { label: 'Slate Ruled', category: 'Clean' },
   template_16_kunal_ml:      { label: 'Machine Learning Pro', category: 'Data Science' },
}

const TemplateCard = ({ template, selected, onSelect }) => {
  const slug   = template.slug || template.id
  const info   = TEMPLATE_INFO[slug] || { label: template.name || 'Resume Template', category: template.category || 'Professional' }
  const isSelected = selected === template.id

  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden text-left group flex flex-col bg-[#fcfcfc] ${
        isSelected
          ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)] scale-[1.02]'
          : 'border-[#e4e4e4] hover:border-[#c4c4c4]'
      }`}
    >
      {/* Preview area - realistic SVG mockup with actual PNG overlay */}
      <div className="h-56 w-full relative overflow-hidden bg-[#f3f4f6] flex items-center justify-center p-4">
        <TemplateMockup templateId={slug} isSelected={isSelected} />
        
        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
          <img 
            src={`/templates/${slug}.png`} 
            alt={info.label} 
            className={`max-h-full max-w-full object-contain shadow-md border border-black/5 rounded transition-all duration-300 bg-white ${isSelected ? 'scale-100' : 'group-hover:scale-[1.02]'}`}
            onError={(e) => { e.target.style.opacity = '0' }}
          />
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg backdrop-blur-md bg-opacity-90">
              <Check size={20} className="drop-shadow-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-[#ffffff] border-t border-[#e4e4e4] flex-1">
        <p className="text-[#0a0a0a] text-sm font-semibold">{template.name || info.label}</p>
        <p className="text-[#8b8b8b] text-[11px] mt-0.5">{template.category || info.category}</p>
      </div>
    </button>
  )
}

const StepTemplate = ({ form, update, templates, loadingTemplates }) => (
  <div className="space-y-6">
    <SectionTitle icon={LayoutIcon} title="Choose Your Template" subtitle="Pick a design. AI generates the same content for any template - only the layout changes." />
    {loadingTemplates ? (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#a3a3a3]" />
      </div>
    ) : templates.length === 0 ? (
      <div className="text-center py-16 text-[#8b8b8b] text-sm">No templates available. Check server connection.</div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {templates.map(t => (
          <TemplateCard key={t.id} template={t} selected={form.template_id} onSelect={id => update('template_id', id)} />
        ))}
      </div>
    )}
    {!form.template_id && (
      <p className="text-amber-600/70 text-xs flex items-center gap-1.5">
        <AlertTriangle size={12} /> Select a template to continue
      </p>
    )}
  </div>
)

// -----------------------------------------------------------------------------
// SHARED UI
// -----------------------------------------------------------------------------

const SectionTitle = ({ icon, title, subtitle }) => {
  const IconComponent = icon
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm text-blue-600">
        <IconComponent size={15} className="text-blue-600" />
      </div>
      <div>
        <h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight">{title}</h3>
        {subtitle && <p className="text-[#8b8b8b] text-xs mt-0.5 font-light">{subtitle}</p>}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// BUILDER RESULT SCREEN
// -----------------------------------------------------------------------------

const BuildResult = ({ result, onReset, onEdit, onOpenLatex  }) => (
  <div className="space-y-6">
    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>
      <h2 className="text-2xl font-serif text-[#0a0a0a] tracking-tight text-[#0a0a0a] mb-2">Your Resume is Ready!</h2>
      <p className="text-[#6b6b6b] text-sm font-light">
        AI generated a full ATS-optimized resume -+ LaTeX compiled via Tectonic
      </p>
      {result.word_count > 0 && (
        <span className="inline-block mt-3 text-xs font-mono text-emerald-600/70 bg-emerald-50 px-3 py-1 rounded-full">
          ~{result.word_count} words -+ Full A4 page
        </span>
      )}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => downloadPDF(result.pdf_base64, `NirVexa_Resume_${Date.now()}.pdf`)}
        className="flex items-center justify-center gap-2 bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] hover:shadow-lg hover:-translate-y-0.5 text-[#0a0a0a] font-semibold px-6 py-4 rounded-2xl transition-all shadow-lg shadow-md shadow-black/10 text-sm"
      >
        <Download size={18} /> Download PDF
      </button>
      <button
        onClick={() => openPDFPreview(result.pdf_base64)}
        className="flex items-center justify-center gap-2 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-[#0a0a0a] font-semibold px-6 py-4 rounded-2xl transition-all text-sm"
      >
        <Eye size={18} /> Preview PDF
      </button>
    </div>

    {/* Edit & Regenerate */}
    <button
      onClick={onEdit}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-amber-600 hover:text-amber-300 text-sm font-semibold rounded-xl transition-all"
    >
      <Wand2 size={14} /> Edit & Regenerate
    </button>

    {/* Open in LaTeX Editor - NEW */}
    <button
      onClick={onOpenLatex}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-blue-600 hover:text-blue-300 text-sm font-semibold rounded-xl transition-all"
    >
      <Code2 size={14} /> Open in LaTeX Editor
    </button>

    {result.ai_content?.summary && (
      <div className="bg-white shadow-sm hover:shadow-md border border-[#e4e4e4] hover:border-[#c4c4c4] rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-0.5">
        <h4 className="text-xs font-bold text-[#8b8b8b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles size={12} className="text-purple-600" /> AI-Generated Summary
        </h4>
        <p className="text-[#3a3a3a] text-sm leading-relaxed font-light">{result.ai_content.summary}</p>
      </div>
    )}

    {result.ai_content?.skills && (
      <div className="bg-white shadow-sm hover:shadow-md border border-[#e4e4e4] hover:border-[#c4c4c4] rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-0.5">
        <h4 className="text-xs font-bold text-[#8b8b8b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Cpu size={12} className="text-blue-600" /> Skills Organized by AI
        </h4>
        <div className="space-y-2">
          {Object.entries(result.ai_content.skills).map(([cat, items]) => (
            <div key={cat} className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-[#8b8b8b] font-semibold min-width-[120px]">{cat}:</span>
              {(Array.isArray(items) ? items : []).map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-medium">{s}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    )}

    <button
      onClick={onReset}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] text-sm rounded-xl transition-all"
    >
      <RefreshCw size={14} /> Build New Resume
    </button>
  </div>
)

// -----------------------------------------------------------------------------
// BUILDER - MAIN
// -----------------------------------------------------------------------------

const ResumeBuilder = ({ openInLatexEditor }) => {
  const [step, setStep]             = useState(0)
  const [form, setForm]             = useState(initialForm)
  const [building, setBuilding]     = useState(false)
  const [enhancing, setEnhancing]   = useState(false)
  const [result, setResult]         = useState(null)
  const [resumeId, setResumeId]     = useState(null) 
  const [templates, setTemplates]   = useState([])
  const [loadingTpl, setLoadingTpl] = useState(false)

  // Load templates when reaching step 4
  useEffect(() => {
    if (step === 4 && templates.length === 0) {
      setLoadingTpl(true)
      fetchTemplatesAPI()
        .then(res => {
          const fetched = res.data?.templates || res.data?.data || []
          // Filter out any "fake" or extra templates not in our official 15
          setTemplates(fetched.filter(t => TEMPLATE_INFO[t.slug || t.id]))
        })
        .catch(() => toast.error('Could not load templates'))
        .finally(() => setLoadingTpl(false))
    }
  }, [step])

  const update = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), [])

  const enhanceBullets = async (bullets) => {
    setEnhancing(true)
    try { return await enhanceBulletsAPI(bullets) }
    finally { setEnhancing(false) }
  }

  const canNext = () => {
    if (step === 0) return form.full_name.trim() && form.email.trim() && form.target_role.trim()
    if (step === 4) return !!form.template_id
    return true
  }

  const handleBuild = async () => {
  if (!form.template_id) { toast.error('Select a template first'); return }
  setBuilding(true)
  try {
    const res = await buildResumeAPI(form)
    const data = res.data?.data || res.data
    setResult(data)
    setResumeId(data.resume_id)  // - was missing
    localStorage.setItem('nirvexa_last_latex', data.latex_code || '') 
    toast.success('Resume generated successfully!')
  } catch (err) {
    const msg = err.response?.data?.error || 'Resume generation failed. Please try again.'
    toast.error(msg)
  } finally {
    setBuilding(false)
  }
}

const handleEdit = () => {
  setResult(null)
  setStep(0)
}

const handleRegenerate = async () => {
  if (!form.template_id) { toast.error('Select a template first'); return }
  setBuilding(true)
  try {
    const res = await regenerateResumeAPI(resumeId, form)
    const data = res.data?.data || res.data
    setResult(data)
    localStorage.setItem('nirvexa_last_latex', data.latex_code || '')
    toast.success('Resume regenerated!')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Regeneration failed.')
  } finally {
    setBuilding(false)
  }
}

const handleReset = () => {
  setResult(null)
  setResumeId(null)
  setStep(0)
  setForm(initialForm)
}

if (result) return (
  <BuildResult
      result={result}
      onReset={handleReset}
      onEdit={handleEdit}
      onOpenLatex={() => openInLatexEditor(result.latex_code || localStorage.getItem('nirvexa_last_latex') || '')}
    />
)

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <div className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = i < step
          const active = i === step
          return (
            <div key={s.id} className="flex items-center gap-1 sm:gap-2 flex-1">
              <button
                onClick={() => done && setStep(i)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  active  ? 'bg-[#0a0a0a] text-[#fafafa] text-[#0a0a0a]'
                  : done  ? 'bg-[#f3f3f3] text-[#3a3a3a] hover:bg-[#e4e4e4] cursor-pointer'
                  :         'bg-white border border-[#e4e4e4] text-[#a3a3a3] shadow-sm cursor-default'
                }`}
              >
                {done ? <Check size={12} /> : <Icon size={12} />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 transition-all ${done ? 'bg-blue-500/40' : 'bg-[#f9f9f9]'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 min-h-[420px] transition-all duration-300">
        {step === 0 && <StepPersonal form={form} update={update} />}
        {step === 1 && <StepExperience form={form} update={update} enhanceBullets={enhanceBullets} enhancing={enhancing} />}
        {step === 2 && <StepEducation form={form} update={update} />}
        {step === 3 && <StepSkills form={form} update={update} />}
        {step === 4 && <StepTemplate form={form} update={update} templates={templates} loadingTemplates={loadingTpl} />}
      </div>

      {/* Nav */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-6">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-sm text-[#3a3a3a] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <span className="text-xs text-[#a3a3a3] hidden sm:block">{step + 1} / {STEPS.length}</span>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => canNext() && setStep(s => s + 1)}
            disabled={!canNext()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] hover:shadow-lg hover:-translate-y-0.5 disabled:bg-[#e4e4e4] disabled:text-[#8b8b8b] disabled:cursor-not-allowed text-[#0a0a0a] text-sm font-semibold rounded-xl transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={resumeId ? handleRegenerate : handleBuild}
            disabled={building || !form.template_id}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-2.5 bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] hover:shadow-lg hover:-translate-y-0.5 disabled:bg-[#e4e4e4] disabled:text-[#8b8b8b] disabled:cursor-not-allowed text-[#0a0a0a] text-sm font-semibold rounded-xl transition-all shadow-lg shadow-md shadow-black/10 disabled:shadow-none"
>
  {building ? (
    <><Loader2 size={16} className="animate-spin" /> {resumeId ? 'Regenerating...' : 'Generating Resume...'}</>
  ) : (
    <><Sparkles size={16} /> {resumeId ? 'Regenerate Resume' : 'Generate Resume'}</>
  )}
</button>
        )}
      </div>

      {building && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-blue-700 font-medium text-sm animate-pulse">
            - AI is crafting your professional resume and formatting the PDF... This usually takes 15-20 seconds.
          </p>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// ANALYZER - MAIN (JD-aware)
// -----------------------------------------------------------------------------

const ResumeAnalyzer = () => {
  const [file, setFile]         = useState(null)
  const [jdText, setJdText]     = useState('')
  const [jdMode, setJdMode]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [dragging, setDragging] = useState(false)
  const [history, setHistory]           = useState([])
  const [historyLoading, setHistLoading] = useState(true)
  const [showHistory, setShowHistory]   = useState(false)

  useEffect(() => {
    fetchHistoryAPI()
      .then(res => {
        const d = res.data?.analyses || res.data?.data || res.data || []
        setHistory(Array.isArray(d) ? d : [])
      })
      .catch(() => {})
      .finally(() => setHistLoading(false))
  }, [])

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { toast.error('Only PDF files supported'); return }
    if (f.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setFile(f); setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true); setResult(null)
    try {
      const res  = await analyzeResumeAPI(file, jdMode ? jdText : '')
      const data = res.data?.data || res.data
      setResult(data)
      toast.success('Analysis complete!')
      fetchHistoryAPI().then(r => {
        const list = r.data?.analyses || r.data?.data || r.data || []
        setHistory(Array.isArray(list) ? list : [])
      }).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const atsStyles = result ? getAtsStyles(result.ats_status) : null
  const scoreTone = result ? getResumeScoreTone(result.overall_score) : null
  const matchedCount = result?.matched_keywords?.length || result?.skills_found?.length || 0
  const missingCount = result?.missing_keywords?.length || 0
  const issueCount = (result?.ats_issues?.length || 0) + (result?.improvements?.length || 0)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[#e4e4e4] bg-white p-5 shadow-sm">
        <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              <Target size={13} />
              Resume Analyzer
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-serif text-[#0a0a0a]">Get an honest ATS readout.</h2>
            <p className="mt-2 text-sm text-[#6b6b6b] max-w-2xl">
              Upload a PDF resume. Add a JD when you want market-realistic fit scoring, missing keywords, ATS issues, and exact additions.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Mode', jdMode ? 'JD' : 'ATS'],
              ['File', file ? 'Ready' : 'None'],
              ['History', history.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#e4e4e4] bg-[#fcfcfc] p-3">
                <p className="text-lg font-black text-[#111] leading-none">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase text-[#8b8b8b]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-3 p-1 bg-[#ffffff] shadow-sm rounded-lg border border-[#e4e4e4] w-fit">
        <button
          onClick={() => setJdMode(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!jdMode ? 'bg-[#0a0a0a] text-[#fafafa]' : 'text-[#6b6b6b] hover:text-[#0a0a0a]'}`}
        >
          Generic Analysis
        </button>
        <button
          onClick={() => setJdMode(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${jdMode ? 'bg-[#0a0a0a] text-white' : 'text-[#6b6b6b] hover:text-[#0a0a0a]'}`}
        >
          <Zap size={13} /> JD-Match Mode
        </button>
      </div>

      {/* JD textarea */}
      {jdMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <TextArea
            label="Paste Job Description"
            icon={FileText}
            value={jdText}
            onChange={setJdText}
            placeholder="Paste the full job description here. AI will score your resume specifically against this JD, show matched/missing keywords, and recommend exact lines to add..."
            rows={6}
            hint="JD-Match mode returns: jd_match_score, matched_keywords, missing_keywords, ats_issues, and recommended_additions."
          />
        </div>
      )}

      {/* Upload */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 backdrop-blur-xl flex flex-col items-center justify-center min-h-[200px]
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-[#e4e4e4] bg-[#ffffff] hover:border-[#c4c4c4]'}`}
      >
        <div className="w-16 h-16 mx-auto bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center mb-4">
          {file ? <FileCheck size={28} className="text-emerald-600" /> : <UploadCloud size={28} className="text-blue-600" />}
        </div>
        {!file ? (
          <>
            <p className="text-[#0a0a0a] font-semibold mb-1">Drag & drop your PDF resume</p>
            <p className="text-[#8b8b8b] text-sm mb-5">Max 5MB</p>
            <label className="cursor-pointer bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-[#0a0a0a] text-sm font-medium px-5 py-2.5 rounded-lg transition-all">
              Browse Files
              <input type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])} className="hidden" />
            </label>
          </>
        ) : (
          <>
            <p className="text-emerald-600 font-semibold mb-2">File Ready</p>
            <div className="flex items-center gap-2 text-[#3a3a3a] text-sm bg-[#f9f9f9] px-4 py-2 rounded-lg border border-[#e4e4e4] mb-5">
              <FileText size={13} className="text-[#6b6b6b]" />
              <span className="truncate max-w-[220px]">{file.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={analyze}
                disabled={loading}
                className="flex items-center gap-2 bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] hover:-translate-y-0.5 disabled:bg-[#e4e4e4] disabled:text-[#8b8b8b] disabled:cursor-not-allowed font-semibold px-7 py-3 rounded-lg transition-all shadow-sm shadow-black/10"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Analyze Resume</>}
              </button>
              {!loading && (
                <button onClick={() => { setFile(null); setResult(null) }} className="text-[#8b8b8b] hover:text-[#0a0a0a] text-sm transition-colors px-3 py-2">Cancel</button>
              )}
            </div>
            {loading && <p className="text-[#a3a3a3] text-xs mt-4 animate-pulse">AI analysis usually takes ~15 seconds...</p>}
          </>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Score row */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className={`md:col-span-2 border rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm ${scoreTone.bg} ${scoreTone.border}`}>
              <div className="flex-1 pr-4">
                <h3 className="text-[#6b6b6b] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target size={14} className="text-blue-600" /> Overall Score
                </h3>
                <p className={`text-sm font-black uppercase tracking-wider ${scoreTone.text}`}>{scoreTone.label}</p>
                <p className="mt-1 text-[#525252] text-sm leading-relaxed">{scoreTone.note}</p>
                {result.jd_mode && result.jd_match_score != null && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider">JD Match</span>
                    <span className={`text-2xl font-black bg-gradient-to-br ${getScoreGradient(result.jd_match_score)} bg-clip-text text-transparent`}>
                      {result.jd_match_score}%
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[4.5rem] font-black leading-none ${scoreTone.text}`}>
                  {result.overall_score}
                </span>
                <span className="text-[#8b8b8b] text-xl font-bold">/100</span>
                <div className="mt-3 h-2 rounded-full bg-white/80 overflow-hidden border border-white">
                  <div className={`h-full rounded-full ${scoreTone.bar}`} style={{ width: `${result.overall_score}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-[#ffffff] backdrop-blur-xl border border-[#e4e4e4] rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-[#6b6b6b] text-xs font-semibold uppercase tracking-wider mb-3">ATS Status</h3>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse shrink-0 ${atsStyles.dot}`} />
                <p className={`text-xl font-bold tracking-tight ${atsStyles.text}`}>{result.ats_status}</p>
              </div>
              <span className={`mt-3 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border w-fit ${atsStyles.badge}`}>
                {atsStyles.label}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: CheckCircle2, label: result.jd_mode ? 'Matched Keywords' : 'Detected Skills', value: matchedCount, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { icon: XCircle, label: 'Missing Keywords', value: missingCount, cls: 'text-rose-600 bg-rose-50 border-rose-200' },
              { icon: AlertTriangle, label: 'Fixes Needed', value: issueCount, cls: 'text-amber-600 bg-amber-50 border-amber-200' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className={`rounded-lg border p-4 ${item.cls}`}>
                  <Icon size={16} />
                  <p className="mt-2 text-2xl font-black leading-none">{item.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase">{item.label}</p>
                </div>
              )
            })}
          </div>

          {/* Section scores breakdown (JD mode) */}
{result.jd_mode && result.section_scores && (
  <div className="bg-[#ffffff] border border-[#e4e4e4] rounded-lg p-6 shadow-sm">
    <h3 className="text-[#0a0a0a] font-semibold mb-4 flex items-center gap-2 text-sm">
      <Target size={16} className="text-blue-600" /> Score Breakdown
    </h3>
    <div className="space-y-3">
      {[
        { key: 'keyword_match',        label: 'Keyword Match',        max: 40, color: 'bg-blue-500' },
        { key: 'role_alignment',       label: 'Role Alignment',       max: 25, color: 'bg-purple-500' },
        { key: 'experience_relevance', label: 'Experience Relevance', max: 20, color: 'bg-emerald-500' },
        { key: 'ats_format',           label: 'ATS Format',           max: 15, color: 'bg-amber-500' },
      ].map(({ key, label, max, color }) => {
        const val = result.section_scores[key] ?? 0
        const pct = Math.round((val / max) * 100)
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6b6b6b]">{label}</span>
              <span className="text-[#3a3a3a] font-mono">{val}/{max}</span>
            </div>
            <div className="h-1.5 bg-[#f9f9f9] rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  </div>
)}

          {/* JD-mode: keyword chips */}
          {result.jd_mode && (
            <div className="grid md:grid-cols-2 gap-5">
              {result.matched_keywords?.length > 0 && (
                <div className="bg-[#ffffff] border border-[#e4e4e4] rounded-lg p-6 shadow-sm">
                  <h3 className="text-[#0a0a0a] font-semibold mb-4 flex items-center gap-2 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600" /> Matched Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matched_keywords.map((k, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 font-semibold">{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.missing_keywords?.length > 0 && (
                <div className="bg-[#ffffff] border border-[#e4e4e4] rounded-lg p-6 shadow-sm">
                  <h3 className="text-[#0a0a0a] font-semibold mb-4 flex items-center gap-2 text-sm">
                    <XCircle size={18} className="text-rose-600" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.map((k, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-md text-rose-700 font-semibold">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strengths + Improvements */}
          <div className="grid md:grid-cols-2 gap-5">
            {result.strengths?.length > 0 && (
              <div className="bg-[#ffffff] border border-[#e4e4e4] rounded-lg p-6 shadow-sm">
                <h3 className="text-[#0a0a0a] font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#3a3a3a] text-sm bg-[#fcfcfc] p-3 rounded-lg border border-[#e4e4e4]">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.improvements?.length > 0 && (
              <div className="bg-[#ffffff] border border-[#e4e4e4] rounded-lg p-6 shadow-sm">
                <h3 className="text-[#0a0a0a] font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-600" /> Improvements
                </h3>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#3a3a3a] text-sm bg-[#fcfcfc] p-3 rounded-lg border border-[#e4e4e4]">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Skills found */}
          {result.skills_found?.length > 0 && (
            <div className="bg-[#ffffff] border border-[#e4e4e4] rounded-lg p-6 shadow-sm">
              <h3 className="text-[#0a0a0a] font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-600" /> Skills Detected
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skills_found.map((s, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-blue-700 font-semibold">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended additions (JD mode) */}
          {result.jd_mode && result.recommended_additions?.length > 0 && (
            <div className="bg-[#ffffff] border border-[#e4e4e4] rounded-lg p-6 shadow-sm">
              <h3 className="text-[#0a0a0a] font-semibold mb-4 flex items-center gap-2">
                <ArrowRight size={18} className="text-purple-600" /> Recommended Additions
              </h3>
              <ul className="space-y-2">
                {result.recommended_additions.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#3a3a3a] text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <Plus size={14} className="text-purple-600 mt-0.5 shrink-0" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ATS issues (JD mode) */}
          {result.jd_mode && result.ats_issues?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-[#0a0a0a] font-semibold mb-3 flex items-center gap-2 text-sm">
                <AlertTriangle size={16} className="text-amber-600" /> ATS Formatting Issues
              </h3>
              <ul className="space-y-1.5">
                {result.ats_issues.map((issue, i) => (
                  <li key={i} className="text-amber-700 text-xs">- {issue}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => { setFile(null); setResult(null) }}
            className="flex items-center gap-2 text-sm text-[#8b8b8b] hover:text-[#0a0a0a] transition-colors mx-auto"
          >
            <RefreshCw size={13} /> Analyze Another Resume
          </button>
        </div>
      )}

      {/* History */}
      {!historyLoading && history.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors mb-4 group"
          >
            <History size={16} className="text-purple-600" />
            <span className="text-sm font-semibold">Past Analyses ({history.length})</span>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showHistory && (
            <div className="space-y-2">
              {history.map((item, i) => {
                const s = getAtsStyles(item.ats_status)
                return (
                  <div key={item.id || i} className="bg-[#ffffff]/60 border border-[#e4e4e4] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-black bg-gradient-to-br ${getScoreGradient(item.score)} bg-clip-text text-transparent`}>
                        {item.score}<span className="text-[#a3a3a3] text-xs font-normal">/100</span>
                      </span>
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${s.badge}`}>{item.ats_status}</span>
                        {item.created_at && (
                          <p className="text-[#a3a3a3] text-xs mt-1">{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// ROOT PAGE
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// LaTeX Function
// -----------------------------------------------------------------------------
const STARTER_TEX = `\\documentclass[10pt, letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\begin{document}

\\begin{center}
  {\\Large \\textbf{Your Name}} \\\\
  email@example.com $|$ +91 00000 00000 $|$ City, India
\\end{center}

\\section*{Summary}
Write your professional summary here.

\\section*{Experience}
\\textbf{Role} at \\textit{Company} \\hfill 2024 -- Present \\\\
\\begin{itemize}
  \\item Bullet point one with action verb and metric.
  \\item Bullet point two with specific technical detail.
\\end{itemize}

\\end{document}`

const LaTeXEditor = ({ initialLatex, onBack }) => {
  const [latex, setLatex]         = useState(initialLatex || STARTER_TEX)
  const [pdfUrl, setPdfUrl]       = useState(null)
  const [compiling, setCompiling] = useState(false)
  const [error, setError]         = useState(null)
  const editorRef                 = useRef(null)
  const viewRef                   = useRef(null)
  const containerRef                = useRef(null)
const [splitPct, setSplitPct]     = useState(50)

const startDrag = (e) => {
  e.preventDefault()
  const container = containerRef.current
  if (!container) return
  const onMove = (e) => {
    const rect = container.getBoundingClientRect()
    const pct  = Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100))
    setSplitPct(pct)
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}


  // Boot CodeMirror
  useEffect(() => {
    let view
    const doc = initialLatex || STARTER_TEX
    import('codemirror').then(({ EditorView, basicSetup }) => {
      import('@codemirror/state').then(({ EditorState }) => {
        const state = EditorState.create({
          doc,
          extensions: [
            basicSetup,
            EditorView.updateListener.of(update => {
              if (update.docChanged) setLatex(update.state.doc.toString())
            }),
            EditorView.theme({
              '&': { height: '100%', fontSize: '13px', backgroundColor: '#0d0d0f' },
              '.cm-scroller': { overflow: 'auto', fontFamily: 'monospace' },
              '.cm-content': { color: '#e2e8f0' },
              '.cm-gutters': { backgroundColor: '#111116', borderRight: '1px solid #ffffff10', color: '#4b5563' },
              '.cm-activeLine': { backgroundColor: '#ffffff05' },
              '.cm-cursor': { borderLeftColor: '#60a5fa' },
            }),
          ],
        })
        view = new EditorView({ state, parent: editorRef.current })
        viewRef.current = view
      })
    })
    return () => view?.destroy()
  }, [])

  const handleCompile = async () => {
    if (!latex.trim()) return
    setCompiling(true)
    setError(null)
    try {
      const res  = await compileLatexAPI(latex)
      const data = res.data?.data || res.data
      const b64  = data.pdf_base64
      const bytes = atob(b64)
      const arr   = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
      const blob = new Blob([arr], { type: 'application/pdf' })
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      setPdfUrl(URL.createObjectURL(blob))
      toast.success('Compiled!')
    } catch (err) {
      const msg = err.response?.data?.error || 'Compilation failed'
      setError(msg)
      toast.error('Compilation failed')
    } finally {
      setCompiling(false)
    }
  }

  const handleLoadLast = () => {
    const saved = localStorage.getItem('nirvexa_last_latex')
    if (!saved) { toast.error('No saved resume found. Build one first.'); return }
    viewRef.current?.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: saved }
    })
    setLatex(saved)
    toast.success('Last resume loaded!')
  }

  const handleClear = () => {
    viewRef.current?.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: STARTER_TEX }
    })
    setLatex(STARTER_TEX)
    setPdfUrl(null)
    setError(null)
  }

  const handleDownload = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl; a.download = `NirVexa_LaTeX_${Date.now()}.pdf`; a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-[#3a3a3a] hover:text-[#0a0a0a] text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}
        <button
          onClick={handleCompile}
          disabled={compiling}
          className="flex items-center gap-2 bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] hover:shadow-lg hover:-translate-y-0.5 disabled:from-gray-800 disabled:text-[#8b8b8b] text-[#0a0a0a] text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-sm shadow-black/10"
        >
          {compiling ? <><Loader2 size={14} className="animate-spin" /> Compiling...</> : <><Zap size={14} /> Compile PDF</>}
        </button>
        <button
          onClick={handleLoadLast}
          className="flex items-center gap-2 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-[#3a3a3a] hover:text-[#0a0a0a] text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <History size={14} /> Load Last Resume
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 bg-[#f9f9f9] hover:bg-[#e4e4e4] border border-[#e4e4e4] text-[#6b6b6b] hover:text-rose-600 text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <RefreshCw size={14} /> Reset
        </button>
        {pdfUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-sm px-4 py-2.5 rounded-xl transition-all ml-auto"
          >
            <Download size={14} /> Download PDF
          </button>
        )}
      </div>

      {/* Resizable split panel */}
      <div
        ref={containerRef}
        className="flex gap-0 rounded-2xl overflow-hidden border border-[#e4e4e4]"
        style={{ height: '80vh' }}
      >
        {/* Left - Editor */}
        <div
          style={{ width: `${splitPct}%`, minWidth: '20%', maxWidth: '80%' }}
          className="bg-[#0d0d0f] flex flex-col overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-[#e4e4e4] flex items-center gap-2 shrink-0">
            <Code2 size={13} className="text-blue-600" />
            <span className="text-xs font-semibold text-[#6b6b6b]">LaTeX Source</span>
          </div>
          <div ref={editorRef} className="flex-1 overflow-hidden" />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={startDrag}
          className="w-1.5 bg-[#f9f9f9] hover:bg-[#3a3a3a]/50 cursor-col-resize transition-colors shrink-0 flex items-center justify-center group"
          title="Drag to resize"
        >
          <div className="w-0.5 h-8 bg-white/20 rounded-full group-hover:bg-blue-400 transition-colors" />
        </div>

        {/* Right - Preview */}
        <div className="bg-[#0d0d0f] flex flex-col overflow-hidden flex-1">
          <div className="px-4 py-2 border-b border-[#e4e4e4] flex items-center gap-2 shrink-0">
            <Eye size={13} className="text-purple-600" />
            <span className="text-xs font-semibold text-[#6b6b6b]">PDF Preview</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {error ? (
              <div className="p-5 h-full overflow-auto">
                <p className="text-xs font-bold text-rose-600 mb-2 flex items-center gap-1.5">
                  <XCircle size={13} /> Compilation Error
                </p>
                <pre className="text-rose-300/80 text-xs leading-relaxed whitespace-pre-wrap font-mono">{error}</pre>
              </div>
            ) : pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 bg-[#f9f9f9] rounded-xl flex items-center justify-center mb-3">
                  <FileText size={20} className="text-[#a3a3a3]" />
                </div>
                <p className="text-[#8b8b8b] text-sm">Click Compile PDF to see preview</p>
                <p className="text-[#a3a3a3] text-xs mt-1">Or load your last generated resume</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Resume() {
  const [activeTab, setActiveTab] = useState('analyzer')
  const [latexToLoad, setLatexToLoad] = useState(null)

  const openInLatexEditor = (latexCode) => {
    setLatexToLoad(latexCode)
    setActiveTab('latex')
  }

  const TABS = [
    { id: 'analyzer', label: 'ATS Analyzer',   icon: Target },
    { id: 'builder',  label: 'AI Resume Builder', icon: Wand2 },
    { id: 'latex',    label: 'LaTeX Editor',    icon: Code2 },
  ]

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }
      `}</style>
      <div className={`mx-auto px-4 sm:px-6 relative pb-20 font-sans transition-all duration-500 ${activeTab === 'latex' ? 'max-w-full' : 'max-w-5xl'}`}>

        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-50/60 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-indigo-50/40 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col gap-2 mb-6 pt-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e4e4e4] text-xs font-medium text-[#0a0a0a] w-fit mb-1 backdrop-blur-sm">
            <Sparkles size={13} className="text-blue-600" />
            <span>AI-Powered Resume Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight text-[#0a0a0a] tracking-tight">Resume Suite</h1>
          <p className="text-[#4a4a4a] text-base font-medium max-w-2xl">
            Analyze your existing resume for ATS compatibility - or build a new one from scratch with our AI Engine.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#ffffff] shadow-sm border border-[#e4e4e4] rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-hide mb-8 relative z-10">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center min-w-max gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0a0a0a] text-[#fafafa] text-[#0a0a0a] shadow-lg shadow-sm shadow-black/10'
                    : 'text-[#6b6b6b] hover:text-[#0a0a0a]'
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            )
          })}
        </div>

        <div className="relative z-10">
          {activeTab === 'analyzer' && <ResumeAnalyzer />}
          {activeTab === 'builder'  && <ResumeBuilder openInLatexEditor={openInLatexEditor} />}
          {activeTab === 'latex'    && (
            <LaTeXEditor
              key={latexToLoad || 'empty'}
              initialLatex={latexToLoad}
              onBack={() => setActiveTab('builder')}
            />
          )}
        </div>

      </div>
    </Layout>
  )
}
