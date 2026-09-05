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
  servicoIds: string[]
  barbeiroConfirmadoId?: string
  hora?: string
}

type BookingAction =
  | { type: 'SET_BARBEIRO'; barbeiroId: string | 'qualquer' }
  | { type: 'SET_SERVICOS'; servicoIds: string[] }
  | { type: 'SET_HORARIO'; hora: string; barbeiroId: string }

function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_BARBEIRO':
      return { ...state, barbeiroId: action.barbeiroId, step: 2 }
    case 'SET_SERVICOS':
      return { ...state, servicoIds: action.servicoIds, step: 3 }
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
  dataISO: string
  cliente: Cliente
  assinatura?: Assinatura
  plano?: PlanoAssinatura
}

export function BookingFlowClient({
  servicos,
  barbeiros,
  grade,
  dataISO,
  cliente,
  assinatura,
  plano,
}: BookingFlowClientProps) {
  const [state, dispatch] = useReducer(reducer, { step: 1, servicoIds: [] })
  const assinanteAtivo = assinatura?.status === 'em_dia'
  const duracaoTotal = state.servicoIds.reduce(
    (sum, id) => sum + (servicos.find((s) => s.id === id)?.duracaoMin ?? 0),
    0,
  )

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
          onSelect={(servicoIds) => dispatch({ type: 'SET_SERVICOS', servicoIds })}
        />
      )}

      {state.step === 3 && state.barbeiroId && (
        <StepHorario
          grade={grade}
          barbeiros={barbeiros}
          barbeiroSelecionado={state.barbeiroId}
          duracaoTotal={duracaoTotal}
          dataISO={dataISO}
          onSelect={(hora, barbeiroId) => dispatch({ type: 'SET_HORARIO', hora, barbeiroId })}
        />
      )}

      {state.step === 4 && state.barbeiroConfirmadoId && state.hora && (
        <StepConfirmar
          servicoIds={state.servicoIds}
          barbeiro={barbeiros.find((b) => b.id === state.barbeiroConfirmadoId)}
          hora={state.hora}
          dataISO={dataISO}
          cliente={cliente}
          assinatura={assinatura}
          plano={plano}
          servicos={servicos}
        />
      )}
    </div>
  )
}
