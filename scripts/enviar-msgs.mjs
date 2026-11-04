import { neon } from '@neondatabase/serverless'

const sql = neon('postgresql://neondb_owner:npg_6quDCZv4IQrx@ep-falling-mouse-auzbvpty-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require')

const msgs = [
  { tel: '5527998568526', msg: 'Olá Hilton! Tivemos um problema técnico na cobrança automática do seu plano na JP Barbeiro. Segue o link para pagamento de R$ 74,00: https://www.asaas.com/i/f54ttnzbu0jht4ao' },
  { tel: '5527997562203', msg: 'Olá Renan! Tivemos um problema técnico na cobrança automática do seu plano na JP Barbeiro. Segue o link para pagamento de R$ 74,00: https://www.asaas.com/i/928dozuls15sd7z6' },
  { tel: '5527998152926', msg: 'Olá Thiago! Tivemos um problema técnico na cobrança automática do seu plano na JP Barbeiro. Segue o link para pagamento de R$ 129,90: https://www.asaas.com/i/pftgssh0bpej5umr' },
  { tel: '5527997750734', msg: 'Olá Wellington! Tivemos um problema técnico na cobrança automática do seu plano na JP Barbeiro. Segue o link para pagamento de R$ 129,90: https://www.asaas.com/i/ief0xpldotyhdlo4' },
  { tel: '5527997339863', msg: 'Olá Patrik! Tivemos um problema técnico na cobrança automática do seu plano na JP Barbeiro. Segue o link para pagamento de R$ 129,90: https://www.asaas.com/i/mhu1mmqkice382rh' },
  { tel: '5527999428185', msg: 'Olá Robercio! Tivemos um problema técnico na cobrança automática do seu plano na JP Barbeiro. Segue o link para pagamento de R$ 129,90: https://www.asaas.com/i/hxevz9tfbblon771' },
]

for (const m of msgs) {
  await sql`INSERT INTO avisos_barbeiro (barbeiro_telefone, mensagem) VALUES (${m.tel}, ${m.msg})`
  console.log('Inserido:', m.tel)
}

console.log('Pronto! 6 mensagens na fila.')
