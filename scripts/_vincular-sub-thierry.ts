// TEMPORÁRIO — vincula a nova assinatura do Asaas (criada no painel) à
// assinatura do Thierry no nosso banco. Dry-run por padrão; aplica com --apply.
//   npx tsx --env-file=.env.production.local scripts/_vincular-sub-thierry.ts sub_XXXX [--apply]
import { neon } from '@neondatabase/serverless'

const ASSINATURA_ID = '1b06ef03-d319-4431-baba-3c040a5b0c4f' // Thierry Moro
const PROXIMA_COBRANCA = '2026-11-07'
const APPLY = process.argv.includes('--apply')
const NEW_SUB_ID = process.argv.find((a) => a.startsWith('sub_'))

async function main() {
  if (!NEW_SUB_ID) throw new Error('Passe o novo ID da assinatura do Asaas (sub_...) como argumento.')
  console.log(`MODO: ${APPLY ? '*** APLICAR ***' : 'DRY-RUN'} | novo sub: ${NEW_SUB_ID}`)
  const sql = neon(process.env.DATABASE_URL!)

  const [ass] = await sql`SELECT status, asaas_subscription_id, proxima_cobranca::text AS proxima_cobranca FROM assinaturas WHERE id = ${ASSINATURA_ID}`
  if (!ass) throw new Error('Assinatura não encontrada.')
  console.log('Antes:', ass)

  console.log(`\nAÇÃO: status='em_dia', asaas_subscription_id='${NEW_SUB_ID}', proxima_cobranca='${PROXIMA_COBRANCA}'`)
  if (!APPLY) { console.log('\n(DRY-RUN) Nada alterado. Rode com --apply pra executar.'); return }

  await sql`
    UPDATE assinaturas
    SET status = 'em_dia', asaas_subscription_id = ${NEW_SUB_ID}, proxima_cobranca = ${PROXIMA_COBRANCA}, cartao_recusado = false
    WHERE id = ${ASSINATURA_ID}`

  const [depois] = await sql`SELECT status, asaas_subscription_id, proxima_cobranca::text AS proxima_cobranca FROM assinaturas WHERE id = ${ASSINATURA_ID}`
  console.log('\n✅ Depois:', depois)
}

main().then(() => process.exit(0)).catch((e) => { console.error('\n❌', e.message); process.exit(1) })
