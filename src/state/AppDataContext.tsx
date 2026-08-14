import { createContext, useReducer, type ReactNode } from 'react'
import type {
  Agendamento,
  Assinatura,
  Barbeiro,
  Cliente,
  FilaEsperaEntry,
  PayoutBarbeiro,
  PlanoAssinatura,
  Produto,
  Servico,
  ThumbUpDown,
  Venda,
} from '../types'
import {
  agendamentosHoje,
  assinaturas as assinaturasIniciais,
  barbeiros as barbeirosIniciais,
  clientes as clientesIniciais,
  filaEspera as filaEsperaIniciais,
  gerarAgendamentosParaData,
  payoutsBarbeiros as payoutsIniciais,
  planosAssinatura as planosIniciais,
  produtos as produtosIniciais,
  servicos as servicosIniciais,
  vendas as vendasIniciais,
} from '../mocks'
import { HOJE_ISO } from '../lib/dateUtils'

export interface AppState {
  clientes: Cliente[]
  barbeiros: Barbeiro[]
  payoutsBarbeiros: PayoutBarbeiro[]
  agendamentos: Agendamento[]
  filaEspera: FilaEsperaEntry[]
  assinaturas: Assinatura[]
  planosAssinatura: PlanoAssinatura[]
  produtos: Produto[]
  vendas: Venda[]
  servicos: Servico[]
}

const initialState: AppState = {
  clientes: clientesIniciais,
  barbeiros: barbeirosIniciais,
  payoutsBarbeiros: payoutsIniciais,
  agendamentos: agendamentosHoje,
  filaEspera: filaEsperaIniciais,
  assinaturas: assinaturasIniciais,
  planosAssinatura: planosIniciais,
  produtos: produtosIniciais,
  vendas: vendasIniciais,
  servicos: servicosIniciais,
}

export type AppAction =
  | {
      type: 'REGISTRAR_VENDA'
      produtoId: string
      barbeiroId: string
      quantidade: number
      clienteId?: string
    }
  | { type: 'SET_COMISSAO'; barbeiroId: string; percent: number }
  | { type: 'NOTIFICAR_FILA'; filaId: string }
  | { type: 'CANCELAR_ASSINATURA'; assinaturaId: string }
  | { type: 'REENVIAR_COBRANCA'; assinaturaId: string }
  | {
      type: 'NOVO_HORARIO'
      data: string
      hora: string
      barbeiroId: string
      clienteId?: string
      servicoId?: string
    }
  | {
      type: 'ADD_NOTA_CLIENTE'
      clienteId: string
      barbeiroId: string
      servicoId: string
      nota?: string
      fotoUrl?: string
    }
  | { type: 'RATE_VISITA'; clienteId: string; historicoId: string; rating: ThumbUpDown }

function agendamentosDoState(state: AppState, dataISO: string): Agendamento[] {
  const doDia = state.agendamentos.filter((a) => a.data === dataISO)
  if (doDia.length > 0 || dataISO === HOJE_ISO) return doDia
  return gerarAgendamentosParaData(dataISO)
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'REGISTRAR_VENDA': {
      const produto = state.produtos.find((p) => p.id === action.produtoId)
      if (!produto) return state
      const quantidade = Math.min(action.quantidade, produto.estoque)
      if (quantidade <= 0) return state
      const novaVenda: Venda = {
        id: `venda_${Date.now()}`,
        produtoId: action.produtoId,
        barbeiroId: action.barbeiroId,
        clienteId: action.clienteId,
        quantidade,
        data: HOJE_ISO,
        valorTotal: produto.precoVenda * quantidade,
      }
      return {
        ...state,
        produtos: state.produtos.map((p) =>
          p.id === action.produtoId ? { ...p, estoque: p.estoque - quantidade } : p,
        ),
        vendas: [novaVenda, ...state.vendas],
      }
    }

    case 'SET_COMISSAO': {
      const percent = Math.min(70, Math.max(20, action.percent))
      return {
        ...state,
        barbeiros: state.barbeiros.map((b) =>
          b.id === action.barbeiroId ? { ...b, comissaoPercent: percent } : b,
        ),
      }
    }

    case 'NOTIFICAR_FILA': {
      return {
        ...state,
        filaEspera: state.filaEspera.map((f) =>
          f.id === action.filaId ? { ...f, notificado: true } : f,
        ),
      }
    }

    case 'CANCELAR_ASSINATURA': {
      return {
        ...state,
        assinaturas: state.assinaturas.map((a) =>
          a.id === action.assinaturaId ? { ...a, status: 'cancelado' as const } : a,
        ),
      }
    }

    case 'REENVIAR_COBRANCA': {
      const agora = new Date().toISOString()
      return {
        ...state,
        assinaturas: state.assinaturas.map((a) =>
          a.id === action.assinaturaId ? { ...a, ultimoReenvioEm: agora } : a,
        ),
      }
    }

    case 'NOVO_HORARIO': {
      const diaJaMaterializado = state.agendamentos.some((a) => a.data === action.data)
      const baseDoDia = diaJaMaterializado
        ? state.agendamentos.filter((a) => a.data === action.data)
        : agendamentosDoState(state, action.data)
      const outrosDias = state.agendamentos.filter((a) => a.data !== action.data)

      const slotExistenteIdx = baseDoDia.findIndex(
        (a) => a.hora === action.hora && a.barbeiroId === action.barbeiroId,
      )

      let novoDia: Agendamento[]
      if (slotExistenteIdx >= 0) {
        novoDia = baseDoDia.map((a, idx) =>
          idx === slotExistenteIdx
            ? {
                ...a,
                status: 'confirmado' as const,
                clienteId: action.clienteId,
                servicoId: action.servicoId,
              }
            : a,
        )
      } else {
        novoDia = [
          ...baseDoDia,
          {
            id: `ag_novo_${Date.now()}`,
            data: action.data,
            hora: action.hora,
            barbeiroId: action.barbeiroId,
            clienteId: action.clienteId,
            servicoId: action.servicoId,
            status: 'confirmado' as const,
          },
        ]
      }

      return { ...state, agendamentos: [...outrosDias, ...novoDia] }
    }

    case 'ADD_NOTA_CLIENTE': {
      return {
        ...state,
        clientes: state.clientes.map((c) => {
          if (c.id !== action.clienteId) return c
          return {
            ...c,
            historico: [
              {
                id: `hc_${Date.now()}`,
                data: HOJE_ISO,
                barbeiroId: action.barbeiroId,
                servicoId: action.servicoId,
                notas: action.nota,
                fotoUrl: action.fotoUrl,
              },
              ...c.historico,
            ],
            loyaltyCortesAtual: Math.min(c.loyaltyCortesAtual + 1, c.loyaltyCortesMeta),
          }
        }),
      }
    }

    case 'RATE_VISITA': {
      return {
        ...state,
        clientes: state.clientes.map((c) => {
          if (c.id !== action.clienteId) return c
          return {
            ...c,
            historico: c.historico.map((h) =>
              h.id === action.historicoId ? { ...h, avaliacao: action.rating } : h,
            ),
          }
        }),
      }
    }

    default:
      return state
  }
}

export interface AppDataContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  agendamentosDoDia: (dataISO: string) => Agendamento[]
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value: AppDataContextValue = {
    state,
    dispatch,
    agendamentosDoDia: (dataISO: string) => agendamentosDoState(state, dataISO),
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
