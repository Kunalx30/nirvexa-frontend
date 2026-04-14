import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from '../services/auth'
import { setAccessToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — restore session if refresh token exists
  useEffect(() => {
    const restore = async () => {
      try {
        if (authService.isLoggedIn()) {
          // Try to get fresh user data
          const savedUser = authService.getSavedUser()
          if (savedUser) setUser(savedUser)

          // Silently refresh token in background
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                refresh_token: authService.getRefreshToken()
              })
            }
          )
          if (res.ok) {
            const data = await res.json()
            setAccessToken(data.data.access_token)
          } else {
            throw new Error('Refresh failed')
          }
        }
      } catch {
        authService.logout()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (email, password) => {
    const u = await authService.login(email, password)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (name, email, password) => {
    const u = await authService.register(name, email, password)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = { user, setUser, loading, login, register, logout, isAuthenticated: !!user }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}