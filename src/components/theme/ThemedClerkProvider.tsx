'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { useTheme } from './ThemeProvider'

const VARS_CLARO = {
  colorPrimary: '#4756e6',
  colorBackground: '#ffffff',
  colorForeground: '#12131a',
  colorMutedForeground: '#6b7280',
  colorInput: '#ffffff',
  colorInputForeground: '#12131a',
  colorBorder: '#e5e7f0',
  colorDanger: '#dc2626',
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
}

const VARS_ESCURO = {
  colorPrimary: '#6472f5',
  colorBackground: '#131a2e',
  colorForeground: '#f5f6fa',
  colorMutedForeground: '#9aa1b8',
  colorInput: '#1a2340',
  colorInputForeground: '#f5f6fa',
  colorBorder: '#2a3555',
  colorDanger: '#ef4444',
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
}

export function ThemedClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const escuro = theme === 'dark'

  return (
    <ClerkProvider
      localization={ptBR}
      appearance={{
        variables: {
          ...(escuro ? VARS_ESCURO : VARS_CLARO),
          borderRadius: '14px',
          fontFamily: 'var(--font-inter), sans-serif',
        },
        elements: {
          card: escuro ? 'border border-[#2a3555] shadow-md' : 'border border-[#e5e7f0] shadow-md',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
