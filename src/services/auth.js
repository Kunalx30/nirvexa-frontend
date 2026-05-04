import api, { setAccessToken, clearAccessToken } from './api'

export const authService = {

  async register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password })
    const { access_token, refresh_token, user } = res.data.data
    setAccessToken(access_token)
    localStorage.setItem('nirvexa_refresh_token', refresh_token)
    localStorage.setItem('nirvexa_user', JSON.stringify(user))
    return user
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, refresh_token, user } = res.data.data
    setAccessToken(access_token)
    localStorage.setItem('nirvexa_refresh_token', refresh_token)
    localStorage.setItem('nirvexa_user', JSON.stringify(user))
    return user
  },

  async googleLogin(idToken) {
  const res = await api.post('/auth/google', { idToken })
  const { access_token, refresh_token, user } = res.data.data
  setAccessToken(access_token)
  localStorage.setItem('nirvexa_refresh_token', refresh_token)
  localStorage.setItem('nirvexa_user', JSON.stringify(user))
  return user
},

async changePassword(currentPassword, newPassword) {
  const res = await api.put('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return res.data
},

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // ignore errors on logout
    } finally {
      clearAccessToken()
      localStorage.removeItem('nirvexa_refresh_token')
      localStorage.removeItem('nirvexa_user')
    }
  },

  async getMe() {
    const res = await api.get('/auth/me')
    return res.data.data.user
  },

  getSavedUser() {
    try {
      const u = localStorage.getItem('nirvexa_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  },

  getRefreshToken() {
    return localStorage.getItem('nirvexa_refresh_token')
  },

  isLoggedIn() {
    return !!this.getRefreshToken()
  },
}