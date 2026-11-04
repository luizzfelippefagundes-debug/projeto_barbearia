/**
 * Seed de demonstração para reunião com dona do salão.
 * Cria uma barbearia "Salão Bella" com profissionais, serviços e planos.
 *
 * Uso: dotenv -e .env.local -- npx tsx scripts/seed-salao-demo.ts
 *
 * Para limpar: dotenv -e .env.local -- npx tsx scripts/seed-salao-demo.ts --clean
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import {
  barbearias,
  barbeiros,
  servicos,
  planosAssinatura,
  planoServicosInclusos,
  clientes,
  agendamentos,
  agendamentoServicos,
  configuracoes,
} from '../src/db/schema'

const SLUG = 'salao-bella-demo'

const db = drizzle(neon(process.env.DATABASE_URL!))

async function clean() {
  const [b] = await db.select({ id: barbearias.id }).from(barbearias).where(eq(barbearias.slug, SLUG))
  if (!b) { console.log('Demo não encontrada — nada a limpar.'); return }
  await db.delete(barbearias).where(eq(barbearias.id, b.id))
  console.log('Demo removida com sucesso.')
}

async function seed() {
  const existing = await db.select({ id: barbearias.id }).from(barbearias).where(eq(barbearias.slug, SLUG))
  if (existing.length > 0) {
    console.log('Demo já existe. Rode com --clean pra recriar.')
    return
  }

  // 1. Barbearia (= o salão)
  const [salon] = await db.insert(barbearias).values({
    nome: 'Salão Bella',
    slug: SLUG,
    statusPagamento: 'em_dia',
  }).returning()
  console.log('✓ Salão criado:', salon.id)

  // 2. Configurações
  await db.insert(configuracoes).values({
    barbeariaId: salon.id,
    metaFaturamentoMensal: 15000,
  })

  // 3. Profissionais
  const [carla] = await db.insert(barbeiros).values({
    barbeariaId: salon.id,
    nome: 'Carla Oliveira',
    telefone: '27999990001',
    papel: 'dono',
    horaInicio: '09:00',
    horaFim: '18:45',
    diasTrabalho: [1, 2, 3, 4, 5, 6],
  }).returning()

  const [ana] = await db.insert(barbeiros).values({
    barbeariaId: salon.id,
    nome: 'Ana Paula',
    telefone: '27999990002',
    papel: 'barbeiro',
    horaInicio: '09:00',
    horaFim: '18:45',
    diasTrabalho: [1, 2, 3, 4, 5, 6],
  }).returning()

  const [ju] = await db.insert(barbeiros).values({
    barbeariaId: salon.id,
    nome: 'Juliana Costa',
    telefone: '27999990003',
    papel: 'barbeiro',
    horaInicio: '09:00',
    horaFim: '18:45',
    diasTrabalho: [2, 3, 4, 5, 6],
  }).returning()
  console.log('✓ 3 profissionais criadas')

  // 4. Serviços
  const [coloracao] = await db.insert(servicos).values({
    barbeariaId: salon.id, nome: 'Coloração', duracaoMin: 120, precoAvulso: 180,
  }).returning()
  const [escova] = await db.insert(servicos).values({
    barbeariaId: salon.id, nome: 'Escova', duracaoMin: 60, precoAvulso: 90,
  }).returning()
  const [corte] = await db.insert(servicos).values({
    barbeariaId: salon.id, nome: 'Corte', duracaoMin: 60, precoAvulso: 80,
  }).returning()
  const [progressiva] = await db.insert(servicos).values({
    barbeariaId: salon.id, nome: 'Progressiva', duracaoMin: 120, precoAvulso: 220,
  }).returning()
  const [manicure] = await db.insert(servicos).values({
    barbeariaId: salon.id, nome: 'Manicure', duracaoMin: 45, precoAvulso: 50,
  }).returning()
  const [sobrancelha] = await db.insert(servicos).values({
    barbeariaId: salon.id, nome: 'Design de Sobrancelha', duracaoMin: 30, precoAvulso: 35,
  }).returning()
  const [hidratacao] = await db.insert(servicos).values({
    barbeariaId: salon.id, nome: 'Hidratação', duracaoMin: 45, precoAvulso: 70,
  }).returning()
  console.log('✓ 7 serviços criados')

  // 5. Planos de assinatura
  const [planoEscova] = await db.insert(planosAssinatura).values({
    barbeariaId: salon.id,
    nome: 'Escova Mensal',
    valorMensal: 199,
  }).returning()
  await db.insert(planoServicosInclusos).values({ planoId: planoEscova.id, servicoId: escova.id })

  const [planoVip] = await db.insert(planosAssinatura).values({
    barbeariaId: salon.id,
    nome: 'VIP Completo',
    valorMensal: 349,
  }).returning()
  await db.insert(planoServicosInclusos).values([
    { planoId: planoVip.id, servicoId: escova.id },
    { planoId: planoVip.id, servicoId: corte.id },
    { planoId: planoVip.id, servicoId: manicure.id, limiteMensal: 2 },
  ])

  const [planoManicure] = await db.insert(planosAssinatura).values({
    barbeariaId: salon.id,
    nome: 'Manicure Quinzenal',
    valorMensal: 89,
  }).returning()
  await db.insert(planoServicosInclusos).values({ planoId: planoManicure.id, servicoId: manicure.id, limiteMensal: 2 })
  console.log('✓ 3 planos de assinatura criados')

  // 6. Clientes de exemplo
  const hoje = new Date().toISOString().slice(0, 10)
  const [cliente1] = await db.insert(clientes).values({
    barbeariaId: salon.id,
    nome: 'Maria Aparecida Silva',
    telefone: '27999881001',
    canalIndicacao: 'instagram',
    tags: ['vip', 'coloracao'],
  }).returning()
  const [cliente2] = await db.insert(clientes).values({
    barbeariaId: salon.id,
    nome: 'Fernanda Lima',
    telefone: '27999881002',
    canalIndicacao: 'indicacao_amigo',
  }).returning()
  const [cliente3] = await db.insert(clientes).values({
    barbeariaId: salon.id,
    nome: 'Simone Reis',
    telefone: '27999881003',
    canalIndicacao: 'google',
    tags: ['fiel'],
  }).returning()
  console.log('✓ 3 clientes criados')

  // 7. Agendamentos para HOJE (preenche a agenda)
  const slots = [
    { hora: '09:00', barbeiroId: carla.id, clienteId: cliente2.id, servicoId: escova.id, status: 'atendido' as const },
    { hora: '10:30', barbeiroId: carla.id, clienteId: cliente3.id, servicoId: coloracao.id, status: 'atendido' as const },
    { hora: '14:00', barbeiroId: carla.id, clienteId: cliente1.id, servicoId: coloracao.id, status: 'confirmado' as const },
    { hora: '09:00', barbeiroId: ana.id, clienteId: cliente2.id, servicoId: corte.id, status: 'atendido' as const },
    { hora: '11:00', barbeiroId: ana.id, clienteId: cliente3.id, servicoId: progressiva.id, status: 'confirmado' as const },
    { hora: '09:00', barbeiroId: ju.id, clienteId: cliente1.id, servicoId: manicure.id, status: 'atendido' as const },
    { hora: '10:00', barbeiroId: ju.id, clienteId: cliente2.id, servicoId: manicure.id, status: 'atendido' as const },
    { hora: '14:30', barbeiroId: ju.id, clienteId: cliente3.id, servicoId: sobrancelha.id, status: 'confirmado' as const },
  ]

  for (const slot of slots) {
    const [ag] = await db.insert(agendamentos).values({
      barbeariaId: salon.id,
      data: hoje,
      hora: slot.hora,
      barbeiroId: slot.barbeiroId,
      clienteId: slot.clienteId,
      status: slot.status,
    }).returning()
    await db.insert(agendamentoServicos).values({ agendamentoId: ag.id, servicoId: slot.servicoId })
  }
  console.log('✓ Agenda de hoje preenchida')

  console.log('\n========================================')
  console.log('Demo pronta! Para acessar:')
  console.log(`  Slug: ${SLUG}`)
  console.log(`  ID do salão: ${salon.id}`)
  console.log('\nPróximos passos:')
  console.log('  1. Cadastre a dona como barbeiro/dono com papel "dono" no admin')
  console.log('     (ou edite o barbeiro "Carla Oliveira" adicionando o clerkUserId dela)')
  console.log('  2. Ela faz login e já vê a agenda com dados de hoje')
  console.log('========================================')
}

const isClean = process.argv.includes('--clean')
;(isClean ? clean() : seed()).catch(console.error).finally(() => process.exit(0))
