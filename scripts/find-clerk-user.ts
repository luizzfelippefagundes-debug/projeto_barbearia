import { eq } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { barbeiros, barbearias } from '../src/db/schema'

async function main() {
  const email = process.argv[2]
  if (!email) { console.log('Uso: npx tsx scripts/find-clerk-user.ts <email>'); return }

  // Busca na API do Clerk
  const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  const users = await res.json() as Array<{ id: string; email_addresses: Array<{ email_address: string }> }>

  if (!users.length) {
    console.log('Nenhum usuário Clerk encontrado com esse e-mail.')
    return
  }

  const u = users[0]
  console.log('Clerk user ID:', u.id)
  console.log('E-mails:', u.email_addresses.map(e => e.email_address).join(', '))

  // Vincula ao barbeiro do salão demo
  const db = drizzle(neon(process.env.DATABASE_URL!))
  const [salon] = await db.select({ id: barbearias.id }).from(barbearias).where(eq(barbearias.slug, 'salao-bella-demo'))
  if (!salon) { console.log('Salão demo não encontrado'); return }

  const todos = await db.select().from(barbeiros).where(eq(barbeiros.barbeariaId, salon.id))
  const dono = todos.find(b => b.papel === 'dono')
  if (!dono) { console.log('Barbeiro dono não encontrado'); return }

  await db.update(barbeiros).set({ clerkUserId: u.id }).where(eq(barbeiros.id, dono.id))
  console.log(`✓ clerkUserId vinculado ao barbeiro "${dono.nome}" do Salão da Karina`)
}

main().catch(console.error).finally(() => process.exit(0))
