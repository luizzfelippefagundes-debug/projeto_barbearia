import { auth } from '@clerk/nextjs/server'
import { PagamentoPlataformaCard } from '../../components/plano/PagamentoPlataformaCard'
import { getBarbeiroByClerkId } from '../../db/queries/barbeiros'
import { getBarbeariaPorId } from '../../db/queries/barbearias'

export default async function PagamentoPendentePage() {
  const { userId } = await auth()
  const barbeiro = userId ? await getBarbeiroByClerkId(userId) : null
  const barbearia = barbeiro ? await getBarbeariaPorId(barbeiro.barbeariaId) : null
  const ehDono = barbeiro?.papel === 'dono'

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-5 text-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pagamento pendente</h1>
          <p className="mt-3 text-text-secondary">
            A mensalidade do sistema está em atraso. O acesso ao painel fica temporariamente
            bloqueado até a confirmação do pagamento.
          </p>
        </div>

        {ehDono && barbearia ? (
          <PagamentoPlataformaCard
            cobrancaJaIniciada={Boolean(barbearia.asaasSubscriptionId)}
            cpfAtual={barbearia.cpfCnpj ?? ''}
          />
        ) : (
          <p className="text-sm text-text-secondary">
            Só o dono da barbearia consegue regularizar o pagamento. Fale com ele.
          </p>
        )}

        <p className="text-xs text-text-secondary">
          Já pagou? Pode levar alguns minutos até confirmar automaticamente.
        </p>
      </div>
    </div>
  )
}
