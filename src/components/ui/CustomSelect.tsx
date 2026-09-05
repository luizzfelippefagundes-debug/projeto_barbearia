'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

interface CustomSelectOption {
  value: string
  label: string
}

/** Dropdown com visual nosso (não abre o seletor nativo do celular, que
 * fica feio com listas longas de nomes) — mesmo comportamento de um
 * select comum: clica, abre a lista, escolhe, fecha. */
export function CustomSelect({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: string
  options: CustomSelectOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selecionado = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [open])

  return (
    <div ref={ref} className="relative w-full">
      {label && <p className="mb-1.5 text-xs text-text-secondary">{label}</p>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left text-sm text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-muted"
      >
        <span className="truncate">{selecionado?.label ?? '—'}</span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-text-secondary transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface-raised shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={cn(
                'block w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-accent-muted',
                o.value === value ? 'text-accent' : 'text-text-primary',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
