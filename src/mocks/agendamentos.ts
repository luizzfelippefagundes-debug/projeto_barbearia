import type { Agendamento, StatusAgendamento } from '../types'
import { BARBEIRO_IDS, CLIENTE_IDS, SERVICO_IDS } from './ids'
import { HOJE_ISO, TIME_SLOTS, hashSeed } from '../lib/dateUtils'

const TODOS_BARBEIROS = Object.values(BARBEIRO_IDS)
const TODOS_CLIENTES = Object.values(CLIENTE_IDS)
const TODOS_SERVICOS = Object.values(SERVICO_IDS)

export const agendamentosHoje: Agendamento[] = [
  { id: 'ag_h_1', data: HOJE_ISO, hora: '09:00', barbeiroId: BARBEIRO_IDS.BETO, clienteId: CLIENTE_IDS.JOAO, servicoId: SERVICO_IDS.CORTE_BARBA, status: 'confirmado' },
  { id: 'ag_h_2', data: HOJE_ISO, hora: '09:00', barbeiroId: BARBEIRO_IDS.CAUA, clienteId: CLIENTE_IDS.LUCAS, servicoId: SERVICO_IDS.CORTE_DEGRADE, status: 'confirmado' },
  { id: 'ag_h_3', data: HOJE_ISO, hora: '09:00', barbeiroId: BARBEIRO_IDS.RENAN, status: 'livre' },
  { id: 'ag_h_4', data: HOJE_ISO, hora: '09:00', barbeiroId: BARBEIRO_IDS.IGOR, clienteId: CLIENTE_IDS.VINICIUS, servicoId: SERVICO_IDS.CORTE_BARBA, status: 'confirmado' },

  { id: 'ag_h_5', data: HOJE_ISO, hora: '09:45', barbeiroId: BARBEIRO_IDS.BETO, status: 'bloqueado' },
  { id: 'ag_h_6', data: HOJE_ISO, hora: '09:45', barbeiroId: BARBEIRO_IDS.CAUA, status: 'livre' },
  { id: 'ag_h_7', data: HOJE_ISO, hora: '09:45', barbeiroId: BARBEIRO_IDS.RENAN, clienteId: CLIENTE_IDS.ANDRE, servicoId: SERVICO_IDS.CORTE_SIMPLES, status: 'confirmado' },
  { id: 'ag_h_8', data: HOJE_ISO, hora: '09:45', barbeiroId: BARBEIRO_IDS.IGOR, status: 'livre' },

  { id: 'ag_h_9', data: HOJE_ISO, hora: '10:30', barbeiroId: BARBEIRO_IDS.BETO, clienteId: CLIENTE_IDS.GABRIEL, servicoId: SERVICO_IDS.CORTE_DEGRADE, status: 'confirmado' },
  { id: 'ag_h_10', data: HOJE_ISO, hora: '10:30', barbeiroId: BARBEIRO_IDS.CAUA, status: 'aguardando' },
  { id: 'ag_h_11', data: HOJE_ISO, hora: '10:30', barbeiroId: BARBEIRO_IDS.RENAN, status: 'livre' },
  { id: 'ag_h_12', data: HOJE_ISO, hora: '10:30', barbeiroId: BARBEIRO_IDS.IGOR, clienteId: CLIENTE_IDS.BRUNO, servicoId: SERVICO_IDS.CORTE_DEGRADE, status: 'confirmado' },

  { id: 'ag_h_13', data: HOJE_ISO, hora: '11:15', barbeiroId: BARBEIRO_IDS.BETO, status: 'livre' },
  { id: 'ag_h_14', data: HOJE_ISO, hora: '11:15', barbeiroId: BARBEIRO_IDS.CAUA, clienteId: CLIENTE_IDS.THIAGO, servicoId: SERVICO_IDS.CORTE_SIMPLES, status: 'confirmado' },
  { id: 'ag_h_15', data: HOJE_ISO, hora: '11:15', barbeiroId: BARBEIRO_IDS.RENAN, status: 'livre' },
  { id: 'ag_h_16', data: HOJE_ISO, hora: '11:15', barbeiroId: BARBEIRO_IDS.IGOR, status: 'bloqueado' },

  { id: 'ag_h_17', data: HOJE_ISO, hora: '12:00', barbeiroId: BARBEIRO_IDS.BETO, clienteId: CLIENTE_IDS.RAFAEL, servicoId: SERVICO_IDS.CORTE_SIMPLES, status: 'confirmado' },
  { id: 'ag_h_18', data: HOJE_ISO, hora: '12:00', barbeiroId: BARBEIRO_IDS.CAUA, status: 'livre' },
  { id: 'ag_h_19', data: HOJE_ISO, hora: '12:00', barbeiroId: BARBEIRO_IDS.RENAN, status: 'livre' },
  { id: 'ag_h_20', data: HOJE_ISO, hora: '12:00', barbeiroId: BARBEIRO_IDS.IGOR, status: 'livre' },

  { id: 'ag_h_21', data: HOJE_ISO, hora: '13:30', barbeiroId: BARBEIRO_IDS.BETO, status: 'livre' },
  { id: 'ag_h_22', data: HOJE_ISO, hora: '13:30', barbeiroId: BARBEIRO_IDS.CAUA, clienteId: CLIENTE_IDS.PEDRO, servicoId: SERVICO_IDS.CORTE_SIMPLES, status: 'confirmado' },
  { id: 'ag_h_23', data: HOJE_ISO, hora: '13:30', barbeiroId: BARBEIRO_IDS.RENAN, clienteId: CLIENTE_IDS.DIEGO, servicoId: SERVICO_IDS.CORTE_BARBA, status: 'confirmado' },
  { id: 'ag_h_24', data: HOJE_ISO, hora: '13:30', barbeiroId: BARBEIRO_IDS.IGOR, status: 'aguardando' },

  { id: 'ag_h_25', data: HOJE_ISO, hora: '14:15', barbeiroId: BARBEIRO_IDS.BETO, clienteId: CLIENTE_IDS.FELIPE, servicoId: SERVICO_IDS.BARBA, status: 'confirmado' },
  { id: 'ag_h_26', data: HOJE_ISO, hora: '14:15', barbeiroId: BARBEIRO_IDS.CAUA, status: 'livre' },
  { id: 'ag_h_27', data: HOJE_ISO, hora: '14:15', barbeiroId: BARBEIRO_IDS.RENAN, status: 'livre' },
  { id: 'ag_h_28', data: HOJE_ISO, hora: '14:15', barbeiroId: BARBEIRO_IDS.IGOR, clienteId: CLIENTE_IDS.VINICIUS, servicoId: SERVICO_IDS.PEZINHO, status: 'confirmado' },

  { id: 'ag_h_29', data: HOJE_ISO, hora: '15:00', barbeiroId: BARBEIRO_IDS.BETO, status: 'livre' },
  { id: 'ag_h_30', data: HOJE_ISO, hora: '15:00', barbeiroId: BARBEIRO_IDS.CAUA, status: 'livre' },
  { id: 'ag_h_31', data: HOJE_ISO, hora: '15:00', barbeiroId: BARBEIRO_IDS.RENAN, status: 'bloqueado' },
  { id: 'ag_h_32', data: HOJE_ISO, hora: '15:00', barbeiroId: BARBEIRO_IDS.IGOR, status: 'livre' },

  { id: 'ag_h_33', data: HOJE_ISO, hora: '17:15', barbeiroId: BARBEIRO_IDS.BETO, clienteId: CLIENTE_IDS.GABRIEL, servicoId: SERVICO_IDS.SOBRANCELHA, status: 'confirmado' },
  { id: 'ag_h_34', data: HOJE_ISO, hora: '17:15', barbeiroId: BARBEIRO_IDS.CAUA, status: 'livre' },
  { id: 'ag_h_35', data: HOJE_ISO, hora: '17:15', barbeiroId: BARBEIRO_IDS.RENAN, status: 'livre' },
  { id: 'ag_h_36', data: HOJE_ISO, hora: '17:15', barbeiroId: BARBEIRO_IDS.IGOR, status: 'livre' },

  { id: 'ag_h_37', data: HOJE_ISO, hora: '18:00', barbeiroId: BARBEIRO_IDS.BETO, status: 'livre' },
  { id: 'ag_h_38', data: HOJE_ISO, hora: '18:00', barbeiroId: BARBEIRO_IDS.CAUA, clienteId: CLIENTE_IDS.MARCOS, servicoId: SERVICO_IDS.CORTE_BARBA, status: 'confirmado' },
  { id: 'ag_h_39', data: HOJE_ISO, hora: '18:00', barbeiroId: BARBEIRO_IDS.RENAN, status: 'livre' },
  { id: 'ag_h_40', data: HOJE_ISO, hora: '18:00', barbeiroId: BARBEIRO_IDS.IGOR, status: 'livre' },
]

/** Gera uma agenda determinística (mesma semente = mesmo resultado) para
 * qualquer data fora do dia "hoje" curado acima, para a navegação entre dias
 * na tela de Agenda não quebrar nem ficar vazia. */
export function gerarAgendamentosParaData(dataISO: string): Agendamento[] {
  if (dataISO === HOJE_ISO) return agendamentosHoje

  const agendamentos: Agendamento[] = []
  TIME_SLOTS.forEach((hora, slotIdx) => {
    TODOS_BARBEIROS.forEach((barbeiroId, barbIdx) => {
      const seed = hashSeed(dataISO, hora, barbeiroId)
      const roll = seed % 100
      let status: StatusAgendamento
      if (roll < 40) status = 'confirmado'
      else if (roll < 75) status = 'livre'
      else if (roll < 88) status = 'aguardando'
      else status = 'bloqueado'

      const agendamento: Agendamento = {
        id: `ag_${dataISO}_${slotIdx}_${barbIdx}`,
        data: dataISO,
        hora,
        barbeiroId,
        status,
      }

      if (status === 'confirmado') {
        agendamento.clienteId = TODOS_CLIENTES[seed % TODOS_CLIENTES.length]
        agendamento.servicoId = TODOS_SERVICOS[(seed >> 3) % TODOS_SERVICOS.length]
      }

      agendamentos.push(agendamento)
    })
  })
  return agendamentos
}
