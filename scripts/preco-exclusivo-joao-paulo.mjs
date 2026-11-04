// Reverte o "Navalhado" avulso pro valor antigo (R$45) pra todo mundo, e
// cria uma exceção de preço exclusiva do João Paulo (R$50) — só ele cobra
// o valor novo, os demais barbeiros continuam no valor de antes.
//
// Rodar DEPOIS de aplicar a migração de schema (npm run db:push), que
// cria a coluna servicos.barbeiro_id:
//
//   node --env-file=.env.local scripts/preco-exclusivo-joao-paulo.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const JOAO_PAULO_ID = 'f6093cfc-a9be-4299-802a-c23adda24097'
const NAVALHADO_GLOBAL_ID = '77eacd52-f6d2-499d-afe5-02f21f2c6181'
const BARBEARIA_ID = '57bce319-8470-4d08-9985-4a242bcb01a3'

const antes = await sql`select nome, preco_avulso, barbeiro_id from servicos where id = ${NAVALHADO_GLOBAL_ID}`
console.log('Navalhado (global) antes:', antes[0])

await sql`update servicos set preco_avulso = 45.00 where id = ${NAVALHADO_GLOBAL_ID}`
console.log('✅ Navalhado (global) revertido pra R$45,00 — vale pra todos os barbeiros, exceto João Paulo.')

const existente = await sql`
  select id from servicos where barbearia_id = ${BARBEARIA_ID} and nome = 'Navalhado' and barbeiro_id = ${JOAO_PAULO_ID}
`
if (existente.length > 0) {
  await sql`update servicos set preco_avulso = 50.00, ativo = true where id = ${existente[0].id}`
  console.log('✅ Navalhado exclusivo do João Paulo já existia — valor confirmado em R$50,00.')
} else {
  const [novo] = await sql`
    insert into servicos (barbearia_id, nome, duracao_min, preco_avulso, barbeiro_id, ativo)
    values (${BARBEARIA_ID}, 'Navalhado', 20, 50.00, ${JOAO_PAULO_ID}, true)
    returning id
  `
  console.log('✅ Criado Navalhado exclusivo do João Paulo (R$50,00):', novo.id)
}

console.log('\n--- Conferindo ---')
const final = await sql`
  select nome, preco_avulso, barbeiro_id,
    (select nome from barbeiros where id = servicos.barbeiro_id) as barbeiro_nome
  from servicos where barbearia_id = ${BARBEARIA_ID} and nome = 'Navalhado'
`
console.table(final)
