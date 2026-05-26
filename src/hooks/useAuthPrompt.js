import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function useAuthPrompt(options = {}) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(null)

  const requireAuth = useCallback(
    (action) => {
      if (isAuthenticated) {
        if (typeof action === 'function') action()
        return true
      }
      setPending(() => action)
      setOpen(true)
      return false
    },
    [isAuthenticated]
  )

  const handleSuccess = useCallback(() => {
    const fn = pending
    setPending(null)
    if (typeof fn === 'function') fn()
  }, [pending])

  const closePrompt = useCallback(() => {
    setOpen(false)
    setPending(null)
  }, [])

  const authPromptProps = {
    open,
    onClose: closePrompt,
    redirectTo: options.redirectTo || location.pathname,
    onSuccess: handleSuccess,
    title: options.title,
    subtitle: options.subtitle,
  }

  return { requireAuth, authPromptProps, isAuthenticated }
}
