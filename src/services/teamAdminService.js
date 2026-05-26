import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'nirvexa_team_admin_token'
const EMAIL_KEY = 'nirvexa_team_admin_email'

const AUTH_PATHS = ['/admin/team/login', '/admin/team/verify-otp', '/admin/team/setup-status', '/admin/team/resend-otp']

// #region agent log
const dbg = (hypothesisId, location, message, data = {}) => {
  fetch('http://127.0.0.1:7720/ingest/52c63316-278c-4201-8661-ac6483482833', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd6f639' },
    body: JSON.stringify({ sessionId: 'd6f639', hypothesisId, location, message, data, timestamp: Date.now() }),
  }).catch(() => {})
}
// #endregion

// #region agent log
dbg('F', 'teamAdminService.js:init', 'api_base', { baseURL: BASE_URL })
// #endregion

const teamAdminApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

function isAuthRoute(url = '') {
  return AUTH_PATHS.some((path) => url.includes(path))
}

teamAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

teamAdminApi.interceptors.response.use(
  (res) => {
    // #region agent log
    dbg('F', 'teamAdminService.js:response', 'api_ok', {
      url: res.config?.url,
      status: res.status,
      hasSuccess: res.data?.success,
    })
    // #endregion
    return res
  },
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const isAuth = isAuthRoute(url)

    // #region agent log
    dbg('F', 'teamAdminService.js:response', 'api_error', {
      url,
      status,
      isAuthRoute: isAuth,
      message: error.response?.data?.message || error.message,
      willClearToken: status === 401 && !isAuth,
    })
    // #endregion

    if (status === 401 && !isAuth) {
      clearTeamAdminToken()
      if (window.location.pathname.includes('teamadmin') || window.location.pathname.includes('useradmin')) {
        window.dispatchEvent(new CustomEvent('team-admin-session-expired'))
      }
    }

    return Promise.reject(error)
  }
)

export const getTeamAdminToken = () => localStorage.getItem(TOKEN_KEY)
export const getTeamAdminEmail = () => localStorage.getItem(EMAIL_KEY)

export const setTeamAdminToken = (token, email) => {
  localStorage.setItem(TOKEN_KEY, token)
  if (email) localStorage.setItem(EMAIL_KEY, email)
}

export const clearTeamAdminToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export const isTeamAdminAuthError = (err) => err?.response?.status === 401

export async function validateTeamSession() {
  return teamAdminApi.get('/admin/team/session')
}

export async function teamAdminLogin(email, password) {
  return teamAdminApi.post('/admin/team/login', { email, password })
}

export async function teamAdminVerifyOtp(email, otp) {
  return teamAdminApi.post('/admin/team/verify-otp', { email, otp })
}

export async function teamAdminResendOtp(email) {
  return teamAdminApi.post('/admin/team/resend-otp', { email })
}

export async function fetchAdminJobs() {
  return teamAdminApi.get('/admin/jobs')
}

export async function createAdminJob(payload) {
  return teamAdminApi.post('/admin/jobs', payload)
}

export async function updateAdminJob(id, payload) {
  return teamAdminApi.patch(`/admin/jobs/${id}`, payload)
}

export async function deleteAdminJob(id) {
  return teamAdminApi.delete(`/admin/jobs/${id}`)
}

export async function fetchAdminStats() {
  return teamAdminApi.get('/admin/stats')
}

export async function fetchAdminUsers(params = {}) {
  return teamAdminApi.get('/admin/users', { params })
}

export async function deleteAdminUser(userId) {
  return teamAdminApi.delete(`/admin/users/${userId}`)
}

export async function toggleUserPremium(userId, isPremium) {
  return teamAdminApi.patch(`/admin/users/${userId}/premium`, { is_premium: isPremium })
}

export async function fetchAdminTickets(params = {}) {
  return teamAdminApi.get('/admin/tickets', { params })
}

export async function updateAdminTicket(ticketId, data) {
  return teamAdminApi.patch(`/admin/tickets/${ticketId}`, data)
}

export async function deleteAdminTicket(ticketId) {
  return teamAdminApi.delete(`/admin/tickets/${ticketId}`)
}

export default teamAdminApi
