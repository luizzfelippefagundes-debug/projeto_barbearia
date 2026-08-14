import { useContext } from 'react'
import { AppDataContext } from './AppDataContext'

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData deve ser usado dentro de <AppDataProvider>')
  return ctx
}
