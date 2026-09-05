import type { ResumoPagamentosAvulso } from '../../lib/derive'
import { Card, SectionHeading } from '../../components/ui'
import { formatBRL } from '../../lib/format'

const LABEL_FORMA: Record<string, string> = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' }

export function ResumoPagamentosCard({ resumo }: { resumo: ResumoPagamentosAvulso }) {
  const temFormaPagamento = resumo.porFormaPagamento.some((r) => r.quantidade > 0)
  const temCaixa = resumo.porCaixa.some((r) => r.quantidade > 0)
  if (!temFormaPagamento && !temCaixa) return null

  return (
    <div>
      <SectionHeading>Pagamentos avulsos</SectionHeading>
      <p className="-mt-2 mb-3 text-xs text-text-secondary">
        Só organização de como os cortes avulsos foram pagos — não afeta comissão nem fechamento de caixa.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="divide-y divide-border p-0">
          {resumo.porFormaPagamento
            .filter((r) => r.quantidade > 0)
            .map((r) => (
              <div key={r.forma} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-text-primary">{LABEL_FORMA[r.forma]}</span>
                <div className="text-right">
                  <p className="mono-value text-sm text-text-primary">{formatBRL(r.valor)}</p>
                  <p className="text-xs text-text-secondary">
                    {r.quantidade} {r.quantidade === 1 ? 'corte' : 'cortes'}
                  </p>
                </div>
              </div>
            ))}
        </Card>
        <Card className="divide-y divide-border p-0">
          {resumo.porCaixa
            .filter((r) => r.quantidade > 0)
            .map((r) => (
              <div key={r.barbeiroId} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-text-primary">Caixa: {r.barbeiroNome}</span>
                <div className="text-right">
                  <p className="mono-value text-sm text-text-primary">{formatBRL(r.valor)}</p>
                  <p className="text-xs text-text-secondary">
                    {r.quantidade} {r.quantidade === 1 ? 'corte' : 'cortes'}
                  </p>
                </div>
              </div>
            ))}
        </Card>
      </div>
    </div>
  )
}
