import { useReducer } from 'react'
import { useAppData } from '../../../state/useAppData'
import { HOJE_ISO } from '../../../lib/dateUtils'
import { StepServico } from './StepServico'
import { StepBarbeiro } from './StepBarbeiro'
import { StepHorario } from './StepHorario'
import { StepConfirmar } from './StepConfirmar'

type Step = 1 | 2 | 3 | 4

interface BookingState {
  step: Step
  servicoId?: string
  barbeiroId?: string | 'qualquer'
  barbeiroConfirmadoId?: string
  hora?: string
  confirmado: boolean
}

type BookingAction =
  | { type: 'SET_SERVICO'; servicoId: string }
  | { type: 'SET_BARBEIRO'; barbeiroId: string | 'qualquer' }
  | { type: 'SET_HORARIO'; hora: string; barbeiroId: string }
  | { type: 'CONFIRMAR' }
  | { type: 'VOLTAR' }

function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_SERVICO':
      return { ...state, servicoId: action.servicoId, step: 2 }
    case 'SET_BARBEIRO':
      return { ...state, barbeiroId: action.barbeiroId, step: 3 }
    case 'SET_HORARIO':
      return { ...state, hora: action.hora, barbeiroConfirmadoId: action.barbeiroId, step: 4 }
    case 'CONFIRMAR':
      return { ...state, confirmado: true }
    case 'VOLTAR':
      return { ...state, step: Math.max(1, state.step - 1) as Step }
    default:
      return state
  }
}

const STEP_LABELS = ['Serviço', 'Barbeiro', 'Horário', 'Confirmar']

export function BookingFlowScreen() {
  const { state: appState, agendamentosDoDia } = useAppData()
  const [state, dispatch] = useReducer(reducer, { step: 1, confirmado: false })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                idx + 1 <= state.step ? 'bg-accent text-text-primary' : 'bg-surface-raised text-text-secondary'
              }`}
            >
              {idx + 1}
            </span>
            {idx < STEP_LABELS.length - 1 && <span className="h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      {state.step === 1 && (
        <StepServico
          servicos={appState.servicos}
          onSelect={(servicoId) => dispatch({ type: 'SET_SERVICO', servicoId })}
        />
      )}

      {state.step === 2 && (
        <StepBarbeiro
          barbeiros={appState.barbeiros}
          onSelect={(barbeiroId) => dispatch({ type: 'SET_BARBEIRO', barbeiroId })}
        />
      )}

      {state.step === 3 && state.barbeiroId && (
        <StepHorario
          agendamentosDoDia={agendamentosDoDia(HOJE_ISO)}
          barbeiroSelecionado={state.barbeiroId}
          onSelect={(hora, barbeiroId) => dispatch({ type: 'SET_HORARIO', hora, barbeiroId })}
        />
      )}

      {state.step === 4 && state.servicoId && state.barbeiroConfirmadoId && state.hora && (
        <StepConfirmar
          servicoId={state.servicoId}
          barbeiroId={state.barbeiroConfirmadoId}
          hora={state.hora}
          confirmado={state.confirmado}
          onConfirmar={() => dispatch({ type: 'CONFIRMAR' })}
        />
      )}
    </div>
  )
}
