'use client'

import { useReducer } from 'react'
import type { Agendamento, Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { StepServico } from './StepServico'
import { StepBarbeiro } from './StepBarbeiro'
import { StepHorario } from './StepHorario'
import { StepConfirmar } from './StepConfirmar'

type Step = 1 | 2 | 3 | 4

interface BookingState {
  step: Step
  barbeiroId?: string | 'qualquer'
  servicoId?: string
  barbeiroConfirmadoId?: string
  hora?: string
}

type BookingAction =
  | { type: 'SET_BARBEIRO'; barbeiroId: string | 'qualquer' }
  | { type: 'SET_SERVICO'; servicoId: string }
  | { type: 'SET_HORARIO'; hora: string; barbeiroId: string }

function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_BARBEIRO':
      return { ...state, barbeiroId: action.barbeiroId, step: 2 }
    case 'SET_SERVICO':
      return { ...state, servicoId: action.servicoId, step: 3 }
    case 'SET_HORARIO':
      return { ...state, hora: action.hora, barbeiroConfirmadoId: action.barbeiroId, step: 4 }
    default:
      return state
  }
}

const STEP_LABELS = ['Barbeiro', 'Serviço', 'Horário', 'Confirmar']

interface BookingFlowClientProps {
  servicos: Servico[]
  barbeiros: Barbeiro[]
  grade: Agendamento[]
  cliente: Cliente
  assinatura?: Assinatura
  plano?: PlanoAssinatura
}

export function BookingFlowClient({
  servicos,
  barbeiros,
  grade,
  cliente,
  assinatura,
  plano,
}: BookingFlowClientProps) {
  const [state, dispatch] = useReducer(reducer, { step: 1 })
  const assinanteAtivo = assinatura?.status === 'em_dia'

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
        <StepBarbeiro barbeiros={barbeiros} onSelect={(barbeiroId) => dispatch({ type: 'SET_BARBEIRO', barbeiroId })} />
      )}

      {state.step === 2 && (
        <StepServico
          servicos={servicos}
          cliente={cliente}
          assinanteAtivo={assinanteAtivo}
          plano={plano}
          onSelect={(servicoId) => dispatch({ type: 'SET_SERVICO', servicoId })}
        />
      )}

      {state.step === 3 && state.barbeiroId && (
        <StepHorario
          grade={grade}
          barbeiros={barbeiros}
          barbeiroSelecionado={state.barbeiroId}
          onSelect={(hora, barbeiroId) => dispatch({ type: 'SET_HORARIO', hora, barbeiroId })}
        />
      )}

      {state.step === 4 && state.barbeiroConfirmadoId && state.hora && (
        <StepConfirmar
          servico={servicos.find((s) => s.id === state.servicoId)}
          barbeiro={barbeiros.find((b) => b.id === state.barbeiroConfirmadoId)}
          hora={state.hora}
          cliente={cliente}
          assinatura={assinatura}
          plano={plano}
          servicos={servicos}
        />
      )}
    </div>
  )
}
