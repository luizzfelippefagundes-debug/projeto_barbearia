import Link from 'next/link'
import type { Metadata } from 'next'
import {
  CalendarClock,
  CircleCheck,
  Gift,
  LineChart,
  MessageCircle,
  Repeat,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { LogoMark } from '../../components/ui/LogoMark'
import { NOME_PLATAFORMA } from '../../lib/constants'

export const metadata: Metadata = {
  title: `Planos — ${NOME_PLATAFORMA}`,
  description:
    'Agendamento, cobrança automática via PIX, comissão e um assistente de WhatsApp com IA — tudo num só sistema pra sua barbearia.',
}

const WHATSAPP_NUMERO = '5527997506203'
const WHATSAPP_MENSAGEM = encodeURIComponent(`Olá! Quero conhecer o ${NOME_PLATAFORMA}.`)
const LINK_WHATSAPP = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAGEM}`

const RECURSOS = [
  {
    icon: CalendarClock,
    titulo: 'Agendamento online',
    descricao: 'Cliente marca sozinho pelo site, escolhendo barbeiro, serviço e horário — sem depender de telefone.',
  },
  {
    icon: MessageCircle,
    titulo: 'Bot de WhatsApp com IA',
    descricao: 'Agenda, cancela e manda lembrete sozinho — entende até áudio, e checa disponibilidade real antes de responder.',
  },
  {
    icon: Wallet,
    titulo: 'Cobrança automática via PIX',
    descricao: 'Assinatura do cliente é cobrada sozinha todo mês, com confirmação automática — sem precisar cobrar por fora.',
  },
  {
    icon: Repeat,
    titulo: 'Comissão automática',
    descricao: 'Cada barbeiro acompanha em tempo real quanto vai receber — sem planilha, sem discussão no fim do mês.',
  },
  {
    icon: LineChart,
    titulo: 'Financeiro completo',
    descricao: 'Fechamento de caixa, MRR, ranking de barbeiros e alerta de cliente sumindo — tudo automático.',
  },
  {
    icon: Gift,
    titulo: 'Fidelidade e indicação',
    descricao: 'Programa de pontos e link de indicação pra transformar cliente satisfeito em cliente novo.',
  },
]

const PLANOS = [
  {
    nome: 'Básico',
    preco: 149,
    descricao: 'Pra quem quer sair do papel e do WhatsApp pessoal.',
    destaque: false,
    itens: [
      'Agendamento online',
      'Cadastro de clientes e histórico',
      'Programa de fidelidade e indicação',
      'Comissão automática do barbeiro',
      'Fechamento de caixa',
      'Cobrança de assinatura via PIX',
      'Até 2 barbeiros inclusos',
    ],
  },
  {
    nome: 'Pro',
    preco: 250,
    descricao: 'O mais escolhido — tudo que a barbearia precisa pra crescer.',
    destaque: true,
    itens: [
      'Tudo do Básico',
      'Bot de WhatsApp com IA',
      'Financeiro completo (MRR, ranking, alertas)',
      'Controle de estoque e produtos',
      'Até 5 barbeiros inclusos',
    ],
  },
  {
    nome: 'Premium',
    preco: 397,
    descricao: 'Pra barbearia grande, com equipe maior.',
    destaque: false,
    itens: [
      'Tudo do Pro',
      'Barbeiros ilimitados',
      'Suporte prioritário',
      'Acesso antecipado a novidades',
    ],
  },
]

export default function PlanosPage() {
  return (
    <div className="theme-forcar-claro min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="font-heading text-sm font-bold text-text-primary">{NOME_PLATAFORMA}</span>
          </div>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-5 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
          <span className="mono-value inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold text-accent">
            <Sparkles size={13} aria-hidden="true" />
            Feito por quem também é dono de barbearia
          </span>
          <h1 className="mt-5 text-3xl leading-tight text-text-primary sm:text-5xl">
            Sua barbearia rodando sozinha — agenda, cobrança e comissão no automático
          </h1>
          <p className="mt-4 text-base text-text-secondary sm:text-lg">
            Cliente marca e paga sem falar com ninguém, o barbeiro sabe quanto vai receber em tempo real, e você
            fecha o caixa sem abrir planilha.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={LINK_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Quero conhecer
            </a>
            <a
              href="#planos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brass/40 bg-surface px-6 py-3 text-base font-semibold text-brass transition-colors hover:bg-brass-muted"
            >
              Ver planos e preços
            </a>
          </div>
        </section>

        {/* Recursos */}
        <section className="border-y border-border bg-surface-raised py-16">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-center text-2xl text-text-primary">O que já vem pronto</h2>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {RECURSOS.map(({ icon: Icon, titulo, descricao }) => (
                <div key={titulo} className="card flex flex-col gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-accent">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{titulo}</p>
                    <p className="mt-1 text-sm text-text-secondary">{descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="mx-auto max-w-5xl px-5 py-16">
          <div className="text-center">
            <h2 className="text-2xl text-text-primary sm:text-3xl">Planos</h2>
            <p className="mt-2 text-sm text-text-secondary sm:text-base">
              Sem fidelidade — cancela quando quiser. Escolha pelo que sua barbearia precisa, não pelo tamanho dela.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {PLANOS.map((plano) => (
              <div
                key={plano.nome}
                className={
                  plano.destaque
                    ? 'card-raised relative flex flex-col gap-5 border-2 border-accent p-6'
                    : 'card flex flex-col gap-5 p-6'
                }
              >
                {plano.destaque && (
                  <span className="mono-value absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    Mais escolhido
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">{plano.nome}</p>
                  <p className="mt-1 text-xs text-text-secondary">{plano.descricao}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="mono-value text-3xl text-text-primary">
                    R$ {plano.preco.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-sm text-text-secondary">/mês</span>
                </div>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {plano.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                      <CircleCheck size={16} className="mt-0.5 shrink-0 text-brass" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`${LINK_WHATSAPP}%20Tenho%20interesse%20no%20plano%20${encodeURIComponent(plano.nome)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    plano.destaque
                      ? 'inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover'
                      : 'inline-flex items-center justify-center gap-2 rounded-full border border-brass/40 bg-surface px-4 py-2.5 text-sm font-semibold text-brass transition-colors hover:bg-brass-muted'
                  }
                >
                  Quero esse plano
                </a>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-text-secondary">
            Barbeiro extra além do incluso no plano: consulte valores. Pagamento trimestral com desconto disponível
            sob consulta.
          </p>
        </section>

        {/* CTA final */}
        <section className="border-t border-border bg-surface-raised py-14">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-5 text-center">
            <h2 className="text-xl text-text-primary sm:text-2xl">Ficou com alguma dúvida?</h2>
            <p className="text-sm text-text-secondary">
              Fala direto com a gente pelo WhatsApp — sem formulário, sem enrolação.
            </p>
            <a
              href={LINK_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Chamar no WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center">
          <div className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="font-heading text-sm font-bold text-text-primary">{NOME_PLATAFORMA}</span>
          </div>
          <p className="text-xs text-text-secondary">Sistema de gestão para barbearias.</p>
        </div>
      </footer>
    </div>
  )
}
