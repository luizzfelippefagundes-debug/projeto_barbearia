import type { Cliente, PlanoAssinatura, Servico } from '../../types'
import { Card } from '../../components/ui'
import { formatBRL } from '../../lib/format'
import { getPrecoServicoParaCliente, getUsosServicoNoMes } from '../../lib/derive'
import { getHojeISO, mesReferenciaDeData } from '../../lib/dateUtils'

export function StepServico({
  servicos,
  cliente,
  assinanteAtivo,
  plano,
  onSelect,
}: {
  servicos: Servico[]
  cliente: Cliente
  assinanteAtivo: boolean
  plano?: PlanoAssinatura
  onSelect: (servicoId: string) => void
}) {
  const mesReferencia = mesReferenciaDeData(getHojeISO())

  return (
    <div>
      <h2 className="mb-4 text-lg text-text-primary">Escolha o serviço</h2>
      <div className="flex flex-col gap-2">
        {servicos.map((servico) => {
          const inclusao = plano?.servicosInclusos.find((i) => i.servicoId === servico.id)
          const usos = inclusao ? getUsosServicoNoMes(cliente, servico.id, mesReferencia) : 0
          const { valor, incluido, esgotado } = getPrecoServicoParaCliente(
            servico,
            assinanteAtivo,
            inclusao,
            usos,
          )
          const comDesconto = assinanteAtivo && !incluido && valor < servico.precoAvulso
          const restantes = inclusao?.limiteMensal != null ? Math.max(0, inclusao.limiteMensal - usos) : null

          return (
            <button key={servico.id} type="button" onClick={() => onSelect(servico.id)} className="text-left">
              <Card className="flex items-center justify-between px-4 py-3 hover:border-brass">
                <div>
                  <p className="text-sm text-text-primary">{servico.nome}</p>
                  <p className="text-xs text-text-secondary">{servico.duracaoMin} min</p>
                  {esgotado && (
                    <p className="text-xs text-status-amber">Limite do plano esgotado neste mês</p>
                  )}
                  {incluido && restantes !== null && (
                    <p className="text-xs text-text-secondary">{restantes} restante(s) este mês</p>
                  )}
                </div>
                <div className="text-right">
                  {incluido ? (
                    <span className="rounded-full bg-status-green-muted px-2 py-0.5 text-xs font-medium text-status-green">
                      Incluso no plano
                    </span>
                  ) : (
                    <>
                      {comDesconto && (
                        <span className="mono-value mr-1.5 text-xs text-text-secondary line-through">
                          {formatBRL(servico.precoAvulso)}
                        </span>
                      )}
                      <span className="mono-value text-sm text-brass">{formatBRL(valor)}</span>
                    </>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
