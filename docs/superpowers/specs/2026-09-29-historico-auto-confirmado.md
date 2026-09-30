# Histórico considera agendamentos vencidos sem confirmação

## Contexto

Hoje, "atendido" só acontece quando o barbeiro/dono clica manualmente pra
registrar o atendimento (`registrarAtendimento`, em
`src/actions/agenda.actions.ts`). Essa ação faz três coisas juntas: muda o
`status` do agendamento pra `atendido`, cria um ou mais `haircut_records`
(a fonte do "Histórico" e da contagem "Cortes no total" no perfil do
cliente), e exige `formaPagamento`/`caixaDestinoBarbeiroId` (usado no
fechamento de caixa/comissão).

Quando o barbeiro esquece de fazer isso, o agendamento fica preso em
`confirmado` pra sempre — o cliente nunca vê aquele corte no histórico,
mesmo tendo acontecido de verdade. Isso já foi relatado como "bug" (não é
— é o comportamento atual, só que incômodo).

Já existe uma regra parecida em `src/lib/derive.ts`
(`contaComoAtendimento`), mas só pros **cálculos financeiros**
(faturamento/comissão): um agendamento `confirmado` cujo horário já passou
é tratado como se tivesse acontecido, sem precisar de confirmação manual.
Essa mesma regra nunca foi estendida pro histórico/contagem visível pro
cliente — é essa lacuna que este trabalho fecha.

## Decisões (via brainstorm)

- **Quando considerar "provavelmente atendido"**: mesma regra que já existe
  pro faturamento — assim que a data/hora marcada passa (sem período de
  tolerância adicional).
- **Sem mudar o banco**: `agendamentos.status` continua `confirmado` até o
  barbeiro confirmar de verdade. Nada de tarefa agendada (cron) rodando
  em background. O ajuste acontece só na hora de montar a lista de
  histórico pra exibir/contar (mesmo padrão do cálculo financeiro).
- **Fidelidade não é afetada**: `loyaltyCortesAtual`/`loyaltyCortesMeta`
  continuam exigindo confirmação manual do barbeiro, porque geram uma
  recompensa real (corte grátis). Só "Cortes no total" e a lista de
  "Histórico" passam a incluir esses agendamentos vencidos.

## O que muda

`getClienteComHistorico` (`src/db/queries/clientes.ts`) — usada tanto pelo
perfil do próprio cliente (via `requireClienteAtual`) quanto pela tela do
dono em `/admin/clientes` — passa a:

1. Buscar, além dos `haircut_records` reais, os agendamentos desse cliente
   com `status = 'confirmado'`, `continuacaoDeId` nulo, e horário já
   vencido (mesma regra de `contaComoAtendimento`).
2. Pra cada um desses agendamentos, buscar os serviços associados
   (`agendamentoServicos`) e sintetizar uma entrada de histórico por
   serviço — mesma granularidade que `registrarAtendimento` cria pra um
   atendimento real.
3. Misturar essas entradas sintéticas com os `haircut_records` reais,
   ordenadas por data (mais recente primeiro, como já é hoje).

Essas entradas sintéticas **não têm um `haircut_records.id` real** — usam
o `id` do próprio agendamento como identificador (único o bastante pra
servir de `key` de lista, mas não aponta pra nenhuma linha de
`haircut_records`). Por isso, o tipo que representa uma entrada de
histórico passa a ter um campo opcional indicando que é sintética (ex:
`pendente?: boolean`), e o componente `ClienteVisitHistory`
(`src/components/clientes/ClienteVisitHistory.tsx`) deixa de mostrar o
link "Avaliar" nesses itens — hoje esse link aponta pra
`/cliente/avaliar/[historicoId]`, que espera um `haircut_records.id` de
verdade; num item sintético isso quebraria.

Sem duplicação: assim que o barbeiro confirma o atendimento de verdade
(`registrarAtendimento`), o `status` do agendamento deixa de ser
`confirmado`, então ele para de aparecer como sintético — e passa a
aparecer como `haircut_record` real no lugar.

## Fora de escopo

- Mudar o cálculo/saldo de fidelidade (`loyaltyCortesAtual`).
- Qualquer tarefa agendada (cron) ou mudança de infraestrutura.
- Distinguir "provavelmente atendido" de "provável no-show" — o sistema
  sempre assume atendido quando o horário passa sem ação, igual já faz
  hoje pro faturamento. Corrigir isso manualmente pra `nao_compareceu`
  continua sendo uma ação do barbeiro, sem mudança aqui.
- Telas fora de `/cliente/perfil` e `/admin/clientes` — nenhuma outra tela
  usa `getClienteComHistorico` hoje.
