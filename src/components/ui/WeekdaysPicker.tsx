import { cn } from '../../lib/cn'

const LETRAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const NOMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function WeekdaysPicker({ value, onChange }: { value: number[]; onChange: (dias: number[]) => void }) {
  function toggle(dia: number) {
    onChange(value.includes(dia) ? value.filter((d) => d !== dia) : [...value, dia].sort())
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs text-text-secondary">Dias que trabalha</label>
      <div className="flex gap-1.5">
        {LETRAS.map((letra, dia) => (
          <button
            key={dia}
            type="button"
            title={NOMES[dia]}
            aria-pressed={value.includes(dia)}
            onClick={() => toggle(dia)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors',
              value.includes(dia) ? 'bg-accent text-text-primary' : 'bg-surface-raised text-text-secondary',
            )}
          >
            {letra}
          </button>
        ))}
      </div>
    </div>
  )
}
