import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton, Button } from '../../components/ui'
import { addDays, formatDateDisplay, HOJE_ISO } from '../../lib/dateUtils'

interface DateNavProps {
  dataISO: string
  onChange: (dataISO: string) => void
}

export function DateNav({ dataISO, onChange }: DateNavProps) {
  return (
    <div className="flex items-center gap-3">
      <IconButton
        icon={<ChevronLeft size={16} />}
        label="Dia anterior"
        onClick={() => onChange(addDays(dataISO, -1))}
      />
      <div className="min-w-[10rem] text-center">
        <p className="font-heading text-sm tracking-wide text-text-primary uppercase">
          {formatDateDisplay(dataISO)}
        </p>
      </div>
      <IconButton
        icon={<ChevronRight size={16} />}
        label="Próximo dia"
        onClick={() => onChange(addDays(dataISO, 1))}
      />
      {dataISO !== HOJE_ISO && (
        <Button size="sm" variant="ghost" onClick={() => onChange(HOJE_ISO)}>
          Hoje
        </Button>
      )}
    </div>
  )
}
