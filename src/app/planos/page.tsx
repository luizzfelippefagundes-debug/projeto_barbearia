import Image from 'next/image'
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
import { PlanosHeader } from '../../components/planos/PlanosHeader'
import { NOME_PLATAFORMA } from '../../lib/constants'

export const metadata: Metadata = {
  title: `Planos — ${NOME_PLATAFORMA}`,
  description:
    'Agendamento, cobrança automática via PIX, comissão e um assistente de WhatsApp com IA — tudo num só sistema pra sua barbearia.',
}

const WHATSAPP_NUMERO = '5527997506203'
const WHATSAPP_MENSAGEM = encodeURIComponent(`Olá! Quero conhecer o ${NOME_PLATAFORMA}.`)
const LINK_WHATSAPP = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAGEM}`

function TelaDoSistema({
  src,
  alt,
  priority,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-center gap-1.5 border-b border-border bg-surface-raised px-3 py-2 sm:px-3.5 sm:py-2.5">
          <span className="h-2 w-2 rounded-full bg-status-red/60 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-status-amber/60 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-status-green/60 sm:h-2.5 sm:w-2.5" />
        </div>
        <Image src={src} alt={alt} width={1366} height={768} priority={priority} className="w-full" />
      </div>
      <p className="mt-2 text-center text-[11px] text-text-secondary">Tela ilustrativa — dados de exemplo</p>
    </div>
  )
}

const RECURSOS_SIMPLES = [
  {
    icon: MessageCircle,
    titulo: 'Bot de WhatsApp com IA',
    descricao: 'Agenda, cancela e manda lembrete sozinho — entende até áudio, e checa disponibilidade real antes de responder.',
  },
  {
    icon: Repeat,
    titulo: 'Comissão automática',
    descricao: 'Cada barbeiro acompanha em tempo real quanto vai receber — sem planilha, sem discussão no fim do mês.',
  },
  {
    icon: Gift,
    titulo: 'Fidelidade e indicação',
    descricao: 'Programa de pontos e link de indicação pra transformar cliente satisfeito em cliente novo.',
  },
]

const RECURSOS_COM_TELA = [
  {
    icon: CalendarClock,
    titulo: 'Agenda organizada, sem furo',
    descricao:
      'Cada barbeiro vê o próprio dia, o dono vê a loja inteira. Bloqueia horário, registra atendimento e sai mais cedo com um clique.',
    src: '/screenshots/agenda.png',
    alt: 'Tela de agenda do sistema, com horários do dia e status de cada atendimento',
  },
  {
    icon: Wallet,
    titulo: 'Cobrança automática via PIX',
    descricao:
      'Assinatura do cliente é cobrada sozinha todo mês, com confirmação automática — e você acompanha quem está em dia em tempo real.',
    src: '/screenshots/assinaturas.png',
    alt: 'Tela de assinaturas do sistema, mostrando receita recorrente e lista de assinantes',
  },
  {
    icon: LineChart,
    titulo: 'Financeiro que fecha sozinho',
    descricao:
      'Fechamento de caixa, ticket médio, frequência de retorno e alerta de cliente sumindo — sem abrir planilha nenhuma.',
    src: '/screenshots/financeiro.png',
    alt: 'Tela financeira do sistema, com fechamento de caixa e métricas do negócio',
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
    <div className="min-h-screen bg-bg">
      <PlanosHeader />

      <main>
        {/* Hero */}
        <section id="inicio" className="relative scroll-mt-16 overflow-hidden">
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-accent/15 blur-[110px] sm:h-[560px] sm:w-[920px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-40 right-0 h-64 w-64 rounded-full bg-brass/15 blur-[90px] sm:h-80 sm:w-80"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-14 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
              <div className="text-center lg:text-left">
                <span className="mono-value inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-muted px-3 py-1 text-[11px] font-semibold tracking-wide text-accent sm:text-xs">
                  <Sparkles size={13} aria-hidden="true" />
                  Já em uso numa barbearia de verdade, todos os dias
                </span>
                <h1 className="mt-5 text-[2rem] leading-[1.12] text-text-primary text-balance sm:text-4xl lg:text-5xl">
                  Sua barbearia rodando sozinha — agenda, cobrança e comissão no automático
                </h1>
                <p className="mt-4 text-balance text-[15px] text-text-secondary sm:text-lg">
                  Cliente marca e paga sem falar com ninguém, o barbeiro sabe quanto vai receber em tempo real, e você
                  fecha o caixa sem abrir planilha.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row lg:justify-start">
                  <a
                    href={LINK_WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover sm:w-auto"
                  >
                    <MessageCircle size={18} aria-hidden="true" />
                    Quero conhecer
                  </a>
                  <a
                    href="#planos"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brass/40 bg-surface px-6 py-3 text-base font-semibold text-brass transition-colors hover:bg-brass-muted sm:w-auto"
                  >
                    Ver planos e preços
                  </a>
                </div>
              </div>

              <TelaDoSistema
                src="/screenshots/dashboard-resumo.png"
                alt="Dashboard do sistema, com resumo do dia e horários agendados"
                priority
              />
            </div>
          </div>
        </section>

        {/* Recursos com tela real, alternando lado */}
        <section id="recursos" className="scroll-mt-16 border-y border-border bg-surface-raised py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl text-text-primary sm:text-3xl">Por dentro do sistema</h2>
            <div className="mt-10 flex flex-col gap-14 sm:mt-14 sm:gap-20">
              {RECURSOS_COM_TELA.map(({ icon: Icon, titulo, descricao, src, alt }, i) => (
                <div
                  key={titulo}
                  className={`grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-14 ${
                    i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div className="text-center lg:text-left">
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-muted text-accent lg:mx-0">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-xl text-text-primary">{titulo}</h3>
                    <p className="mt-2 text-sm text-text-secondary sm:text-base">{descricao}</p>
                  </div>
                  <TelaDoSistema src={src} alt={alt} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recursos simples, sem tela */}
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {RECURSOS_SIMPLES.map(({ icon: Icon, titulo, descricao }) => (
              <div key={titulo} className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
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
        </section>

        {/* Planos */}
        <section id="planos" className="scroll-mt-16 border-t border-border bg-surface-raised px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl text-text-primary sm:text-3xl">Planos</h2>
              <p className="mt-2 text-sm text-text-secondary sm:text-base">
                Sem fidelidade — cancela quando quiser. Escolha pelo que sua barbearia precisa, não pelo tamanho dela.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 lg:grid-cols-3">
              {PLANOS.map((plano) => (
                <div
                  key={plano.nome}
                  className={
                    plano.destaque
                      ? 'card-raised relative flex flex-col gap-5 border-2 border-accent bg-surface p-6 lg:-translate-y-2'
                      : 'card flex flex-col gap-5 bg-surface p-6'
                  }
                >
                  {plano.destaque && (
                    <span className="mono-value absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm">
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
          </div>
        </section>

        {/* CTA final */}
        <section id="contato" className="scroll-mt-16 px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
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
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="font-heading text-sm font-bold text-text-primary">{NOME_PLATAFORMA}</span>
          </div>
          <p className="text-xs text-text-secondary">Sistema de gestão para barbearias.</p>
        </div>
      </footer>

      <a
        href={LINK_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        title="Falar no WhatsApp"
        className="fixed right-5 bottom-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle size={26} aria-hidden="true" />
      </a>
    </div>
  )
}
