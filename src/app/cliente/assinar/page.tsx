import { EmptyState } from '../../../components/ui'
import { PlanoCard } from '../../../components/assinar/PlanoCard'
import { requireClienteAtual } from '../../../lib/clienteAuth'
import { getAssinaturaAtivaDoCliente, getPlanosDisponiveisParaAssinar } from '../../../db/queries/assinaturas'

export default async function AssinarPage() {
  const cliente = await requireClienteAtual()

  const [ativa, planos] = await Promise.all([
    getAssinaturaAtivaDoCliente(cliente.id),
    getPlanosDisponiveisParaAssinar(cliente.barbeariaId),
  ])

  const titulo = ativa ? 'Seus planos' : 'Assinar um plano'
  const subtitulo = ativa
    ? 'Veja os planos disponíveis ou troque o seu atual.'
    : 'Pague menos por corte e economize todo mês.'

  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:max-w-3xl">
      <div>
        <h1 className="text-lg text-text-primary">{titulo}</h1>
        <p className="text-sm text-text-secondary">{subtitulo}</p>
      </div>

      {planos.length === 0 ? (
        <EmptyState title="Nenhum plano disponível" description="A barbearia ainda não cadastrou planos." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {planos.map((plano) => (
            <PlanoCard
              key={plano.id}
              plano={plano}
              cpfAtual={cliente.cpfCnpj}
              isAtual={ativa?.planoId === plano.id}
              temAssinaturaAtiva={!!ativa}
            />
          ))}
        </div>
      )}
    </div>
  )
}
