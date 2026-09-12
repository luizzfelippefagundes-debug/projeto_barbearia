import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { barbearias } from '../schema'

export async function getBarbeariaPorSlug(slug: string) {
  const rows = await getDb().select().from(barbearias).where(eq(barbearias.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function getBarbeariaPorId(id: string) {
  const rows = await getDb().select().from(barbearias).where(eq(barbearias.id, id)).limit(1)
  return rows[0] ?? null
}

/** Barbearia usada quando um cliente novo se cadastra sozinho pelo site
 * público (`/cadastro/cliente`) — ainda não existe um jeito de saber, só
 * pela URL, a qual barbearia esse cadastro pertence (isso exigiria
 * subdomínio ou domínio próprio por loja, o que fica pra uma etapa
 * futura). Por enquanto, todo cadastro público de cliente cai na barbearia
 * principal (Jota Pê) — as outras barbearias (ex: Aragão) são cadastradas e
 * povoadas manualmente até existir esse roteamento por loja. */
export async function getBarbeariaPadrao() {
  const barbearia = await getBarbeariaPorSlug('jota-pe')
  if (!barbearia) throw new Error('Barbearia padrão (jota-pe) não encontrada.')
  return barbearia
}
