import { useState } from 'react'
import { SectionHeading } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { HOJE_ISO } from '../../lib/dateUtils'
import { DateNav } from './DateNav'
import { ScheduleList } from './ScheduleList'
import { NovoHorarioModal } from './NovoHorarioModal'
import { WaitlistSection } from './WaitlistSection'

export function AgendaScreen() {
  const { agendamentosDoDia } = useAppData()
  const [dataSelecionada, setDataSelecionada] = useState(HOJE_ISO)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading
          action={<NovoHorarioModal dataISO={dataSelecionada} />}
        >
          Agenda
        </SectionHeading>
        <div className="mb-4">
          <DateNav dataISO={dataSelecionada} onChange={setDataSelecionada} />
        </div>
        <ScheduleList agendamentos={agendamentosDoDia(dataSelecionada)} />
      </div>

      <WaitlistSection />
    </div>
  )
}
