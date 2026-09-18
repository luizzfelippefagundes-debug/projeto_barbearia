import { CheckCircle2 } from 'lucide-react'
import { Card, SectionHeading, StatusPill } from '../../../../components/ui'
import { PagamentoPlataformaCard } from '../../../../components/plano/PagamentoPlataformaCard'
import { assertAdmin } from '../../../../lib/adminAuth'
import { getBarbeariaPorId } from '../../../../db/queries/barbearias'
import { verificarPagamentoPlataforma } from '../../../../actions/cobrancaPlataforma.actions'
import { formatBRL, formatDataCurta } from '../../../../lib/format'

const VALOR_MENSALIDADE = 250

const BENEFICIOS = [
  'Agenda organizada por profissional',
  'Robô de agendamento no WhatsApp',
  'Cobrança automática via Pix',
  'Comissão de cada profissional calculada sozinha',
  'Controle financeiro completo',
  'Planos de assinatura e fidelidade pros seus clientes',
  'Controle de estoque de produtos',
]

const WHATSAPP_SUPORTE = '5527997506203'
const LINK_CANCELAR = `https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(
  'Quero cancelar minha assinatura do NexoBarber',
)}`

export default async function PlanoPage() {
  const dono = await assertAdmin()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (!barbearia) return null

  const cobrancaJaIniciada = Boolean(barbearia.asaasSubscriptionId)
  // Sempre confere direto com o Asaas quando já existe cobrança — o
  // status_pagamento no banco fica "em_dia" por padrão até o webhook (ou
  // essa checagem) confirmar de verdade, então não dá pra confiar só nele
  // pra saber se a mensalidade já foi paga.
  const { status: statusAtual, proximaCobranca } = cobrancaJaIniciada
    ? await verificarPagamentoPlataforma()
    : { status: barbearia.statusPagamento, proximaCobranca: null }
  const precisaPagar = !cobrancaJaIniciada || statusAtual !== 'em_dia'
  // status_pagamento nasce "em_dia" por padrão, mesmo sem nenhuma cobrança
  // real ainda — sem isso o pill mostraria "Em dia" ao lado do formulário
  // de pagamento, dando a entender (errado) que já tá tudo pago.
  const statusExibido = cobrancaJaIniciada ? statusAtual : 'aguardando'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionHeading>Plano da barbearia</SectionHeading>
        <p className="text-sm text-text-secondary">Sua mensalidade de acesso ao sistema.</p>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">NexoBarber — {formatBRL(VALOR_MENSALIDADE)}/mês</p>
            <p className="text-xs text-text-secondary">
              Plano único, sem fidelidade
              {proximaCobranca && ` · próxima cobrança ${formatDataCurta(proximaCobranca)}`}
            </p>
          </div>
          <StatusPill status={statusExibido} />
        </div>
        <ul className="flex flex-col gap-2">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio} className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle2 size={14} className="shrink-0 text-status-green" aria-hidden="true" />
              {beneficio}
            </li>
          ))}
        </ul>
      </Card>

      {precisaPagar ? (
        <PagamentoPlataformaCard cobrancaJaIniciada={cobrancaJaIniciada} cpfAtual={barbearia.cpfCnpj ?? ''} />
      ) : (
        <Card className="flex items-center gap-3 p-4">
          <CheckCircle2 size={20} className="shrink-0 text-status-green" aria-hidden="true" />
          <p className="text-sm text-text-primary">
            Sua mensalidade está em dia.
            {proximaCobranca && ` Próxima cobrança: ${formatDataCurta(proximaCobranca)}.`}
          </p>
        </Card>
      )}

      <p className="text-center text-xs text-text-secondary">
        Quer cancelar sua assinatura?{' '}
        <a href={LINK_CANCELAR} target="_blank" rel="noopener noreferrer" className="text-accent underline">
          Fale com a gente
        </a>
        .
      </p>
    </div>
  )
}
