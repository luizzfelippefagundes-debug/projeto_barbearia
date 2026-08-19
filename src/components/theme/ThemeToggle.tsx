'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      className={
        className ??
        'flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary'
      }
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}
