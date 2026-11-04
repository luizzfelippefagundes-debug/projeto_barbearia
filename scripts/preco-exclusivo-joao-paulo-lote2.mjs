// Aplica o mesmo padrão do Navalhado em mais 4 serviços avulsos: volta o
// preço GLOBAL pro valor de antes do reajuste (vale pra todos, exceto João
// Paulo) e cria/garante a exceção exclusiva do João Paulo no valor novo.
//
//   node --env-file=.env.local scripts/preco-exclusivo-joao-paulo-lote2.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const JOAO_PAULO_ID = 'f6093cfc-a9be-4299-802a-c23adda24097'
const BARBEARIA_ID = '57bce319-8470-4d08-9985-4a242bcb01a3'

const ITENS = [
  { id: 'a804abee-03fd-4762-b4ef-8a7cf4ab1d4c', nome: 'Cabelo', duracaoMin: 30, precoAntigo: 40.0, precoNovoJP: 45.0 },
  { id: '588d79fc-de73-4d4b-b9b1-0765ffa5e908', nome: 'Barba', duracaoMin: 30, precoAntigo: 30.0, precoNovoJP: 35.0 },
  { id: '6dd3bf58-6420-44ab-be39-3514bd630834', nome: 'Corte na tesoura', duracaoMin: 30, precoAntigo: 45.0, precoNovoJP: 50.0 },
  { id: '0ce01bcd-63ed-491c-948a-bd36367bad46', nome: 'Barboterapia', duracaoMin: 30, precoAntigo: 50.0, precoNovoJP: 60.0 },
]

for (const item of ITENS) {
  const antes = await sql`select preco_avulso from servicos where id = ${item.id}`
  console.log(`\n${item.nome} (global) antes: R$ ${antes[0].preco_avulso}`)

  await sql`update servicos set preco_avulso = ${item.precoAntigo} where id = ${item.id}`
  console.log(`✅ ${item.nome} (global) revertido pra R$ ${item.precoAntigo.toFixed(2)} — vale pra todos, exceto João Paulo.`)

  const existente = await sql`
    select id from servicos where barbearia_id = ${BARBEARIA_ID} and nome = ${item.nome} and barbeiro_id = ${JOAO_PAULO_ID}
  `
  if (existente.length > 0) {
    await sql`update servicos set preco_avulso = ${item.precoNovoJP}, ativo = true where id = ${existente[0].id}`
    console.log(`✅ ${item.nome} exclusivo do João Paulo já existia — valor confirmado em R$ ${item.precoNovoJP.toFixed(2)}.`)
  } else {
    const [novo] = await sql`
      insert into servicos (barbearia_id, nome, duracao_min, preco_avulso, barbeiro_id, ativo)
      values (${BARBEARIA_ID}, ${item.nome}, ${item.duracaoMin}, ${item.precoNovoJP}, ${JOAO_PAULO_ID}, true)
      returning id
    `
    console.log(`✅ Criado ${item.nome} exclusivo do João Paulo (R$ ${item.precoNovoJP.toFixed(2)}): ${novo.id}`)
  }
}

console.log('\n--- Conferindo tudo ---')
const final = await sql`
  select nome, preco_avulso, barbeiro_id,
    (select nome from barbeiros where id = servicos.barbeiro_id) as barbeiro_nome
  from servicos where barbearia_id = ${BARBEARIA_ID} and nome in ('Cabelo','Barba','Corte na tesoura','Barboterapia','Navalhado')
  order by nome, barbeiro_id nulls first
`
console.table(final)
