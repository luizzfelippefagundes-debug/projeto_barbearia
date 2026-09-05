import type { FormaPagamento } from '../../types'
import { CustomSelect } from '../../components/ui'

const OPCOES = [
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'dinheiro', label: 'Dinheiro' },
]

export function FormaPagamentoPicker({
  value,
  onChange,
}: {
  value: FormaPagamento
  onChange: (forma: FormaPagamento) => void
}) {
  return (
    <CustomSelect
      label="Forma de pagamento"
      value={value}
      onChange={(v) => onChange(v as FormaPagamento)}
      options={OPCOES}
    />
  )
}
