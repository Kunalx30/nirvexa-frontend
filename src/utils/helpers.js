// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// Format relative time (e.g. "2 hours ago")
export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const now  = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateStr)
}

// Truncate text
export const truncate = (str, maxLen = 100) => {
  if (!str) return ''
  return str.length <= maxLen ? str : str.slice(0, maxLen) + '...'
}

// Get model badge color
export const getModelColor = (model) => {
  if (!model) return 'gray'
  if (model.includes('llama'))   return 'orange'
  if (model.includes('deepseek')) return 'blue'
  if (model.includes('mistral'))  return 'purple'
  if (model.includes('gemini'))   return 'green'
  return 'gray'
}

// Get model display name
export const getModelName = (model) => {
  if (!model) return 'AI'
  if (model.includes('llama-3.3-70b')) return 'LLaMA 3.3 70B'
  if (model.includes('llama3-8b'))     return 'LLaMA 3 8B'
  if (model.includes('deepseek'))      return 'DeepSeek V3'
  if (model.includes('mistral'))       return 'Mistral 7B'
  if (model.includes('gemini'))        return 'Gemini 2.5'
  return model
}

// Format salary (Indian format)
export const formatSalary = (salary) => {
  if (!salary) return 'Not disclosed'
  return salary
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Check password strength
export const checkPasswordStrength = (password) => {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /\d/.test(password),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const score = Object.values(checks).filter(Boolean).length
  return {
    checks,
    score,
    label: score <= 2 ? 'Weak' : score <= 3 ? 'Fair' : score <= 4 ? 'Good' : 'Strong',
    color: score <= 2 ? 'red'  : score <= 3 ? 'amber': score <= 4 ? 'blue' : 'green',
  }
}