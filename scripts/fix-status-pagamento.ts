import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { barbearias } from '../src/db/schema'

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!))

  const todas = await db.select({ id: barbearias.id, nome: barbearias.nome, slug: barbearias.slug, status: barbearias.statusPagamento }).from(barbearias)
  console.log('Barbearias encontradas:')
  todas.forEach((b) => console.log(`  [${b.status}] ${b.nome} (slug: ${b.slug}, id: ${b.id})`))

  const atrasadas = todas.filter((b) => b.status === 'atrasado')
  if (atrasadas.length === 0) {
    console.log('\nNenhuma barbearia com status "atrasado" — nada a fazer.')
    return
  }

  for (const b of atrasadas) {
    await db.update(barbearias).set({ statusPagamento: 'em_dia' }).where(require('drizzle-orm').eq(barbearias.id, b.id))
    console.log(`\nAtualizada: ${b.nome} → em_dia`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
