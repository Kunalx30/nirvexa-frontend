import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ── Token management (in-memory only) ────────────────────────────────────────
let accessToken = null

export const setAccessToken = (token) => { accessToken = token }
export const getAccessToken = () => accessToken
export const clearAccessToken = () => { accessToken = null }

// ── Request interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401, auto refresh ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refreshToken = localStorage.getItem('nirvexa_refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const newToken = res.data.data.access_token
        setAccessToken(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)

      } catch (refreshError) {
        // Refresh failed — clear everything and redirect to login
        clearAccessToken()
        localStorage.removeItem('nirvexa_refresh_token')
        localStorage.removeItem('nirvexa_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api