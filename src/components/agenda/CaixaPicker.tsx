import type { Barbeiro } from '../../types'
import { CustomSelect } from '../../components/ui'

export function CaixaPicker({
  barbeiros,
  value,
  onChange,
}: {
  barbeiros: Barbeiro[]
  value: string
  onChange: (barbeiroId: string) => void
}) {
  return (
    <CustomSelect
      label="Caixa"
      value={value}
      onChange={onChange}
      options={barbeiros.map((b) => ({ value: b.id, label: b.nome }))}
    />
  )
}
