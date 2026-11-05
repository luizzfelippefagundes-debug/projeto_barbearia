// Quando um serviço ganha uma versão exclusiva de um barbeiro (preço
// diferente, ID novo), os planos que incluíam a versão padrão desse nome
// precisam também reconhecer a versão exclusiva como inclusa — senão o
// assinante vê "Cabelo R$ 45,00" em vez de "Incluso no plano" ao escolher
// esse barbeiro específico. Espelha automaticamente por NOME de serviço,
// então funciona pra qualquer exclusividade futura, não só as de hoje.
//
//   node --env-file=.env.local scripts/espelha-inclusao-planos.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const BARBEARIA_ID = '57bce319-8470-4d08-9985-4a242bcb01a3'

// Pra cada (plano, serviço padrão incluso), acha a versão exclusiva do
// MESMO nome (se existir) que ainda não está inclusa nesse plano.
const faltando = await sql`
  select psi.plano_id, psi.limite_mensal, s_padrao.nome as servico_nome, s_excl.id as servico_exclusivo_id
  from plano_servicos_inclusos psi
  join servicos s_padrao on s_padrao.id = psi.servico_id and s_padrao.barbeiro_id is null
  join servicos s_excl on s_excl.nome = s_padrao.nome and s_excl.barbeiro_id is not null and s_excl.barbearia_id = ${BARBEARIA_ID}
  join planos_assinatura p on p.id = psi.plano_id
  where p.barbearia_id = ${BARBEARIA_ID}
    and not exists (
      select 1 from plano_servicos_inclusos psi2
      where psi2.plano_id = psi.plano_id and psi2.servico_id = s_excl.id
    )
`

if (faltando.length === 0) {
  console.log('Nada pra espelhar — todos os planos já reconhecem as versões exclusivas existentes.')
} else {
  for (const f of faltando) {
    await sql`
      insert into plano_servicos_inclusos (plano_id, servico_id, limite_mensal)
      values (${f.plano_id}, ${f.servico_exclusivo_id}, ${f.limite_mensal})
    `
    console.log(`✅ Plano ${f.plano_id} agora também inclui "${f.servico_nome}" (versão exclusiva)`)
  }
}

console.log('\n--- Conferindo ---')
const final = await sql`
  select p.nome as plano_nome, s.nome as servico_nome, s.barbeiro_id, psi.limite_mensal
  from plano_servicos_inclusos psi
  join planos_assinatura p on p.id = psi.plano_id
  join servicos s on s.id = psi.servico_id
  where p.barbearia_id = ${BARBEARIA_ID}
  order by p.nome, s.nome, s.barbeiro_id nulls first
`
console.table(final)
