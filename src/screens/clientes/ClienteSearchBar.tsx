import { SearchInput } from '../../components/ui'

interface ClienteSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ClienteSearchBar({ value, onChange }: ClienteSearchBarProps) {
  return (
    <SearchInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar por nome ou telefone..."
      aria-label="Buscar cliente"
    />
  )
}
