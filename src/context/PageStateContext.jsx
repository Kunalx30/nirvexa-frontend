import { createContext, useContext, useRef, useState, useEffect } from 'react'

const PageStateContext = createContext(null)

export function PageStateProvider({ children }) {
  // useRef so storing state here never triggers re-renders
  const store = useRef({})

  const save = (pageKey, state) => {
    store.current[pageKey] = state
  }

  const load = (pageKey) => {
    return store.current[pageKey] || null
  }

  const clear = (pageKey) => {
    delete store.current[pageKey]
  }

  return (
    <PageStateContext.Provider value={{ save, load, clear }}>
      {children}
    </PageStateContext.Provider>
  )
}

export function usePageState() {
  return useContext(PageStateContext)
}

export function usePagePersistedState(pageKey, initialValue) {
  const context = useContext(PageStateContext)
  if (!context) {
    throw new Error('usePagePersistedState must be used within a PageStateProvider')
  }
  const { save, load } = context
  const [state, setState] = useState(() => {
    const saved = load(pageKey)
    return saved !== null ? saved : (typeof initialValue === 'function' ? initialValue() : initialValue)
  })

  useEffect(() => {
    save(pageKey, state)
  }, [pageKey, state, save])

  return [state, setState]
}