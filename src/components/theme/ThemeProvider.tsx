'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null)

/** O script inline no layout já define data-theme no <html> antes da
 * primeira pintura — aqui só lemos o que ele já decidiu, sem causar flash. */
function lerTemaAtual(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(lerTemaAtual)

  useEffect(() => {
    setTheme(lerTemaAtual())
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((atual) => {
      const proximo: Theme = atual === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', proximo)
      localStorage.setItem('theme', proximo)
      return proximo
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider')
  return ctx
}
