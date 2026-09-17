# Cobrança da plataforma (barbearia paga o Luiz)

## Contexto

O sistema já cobra o cliente final da barbearia por um plano de corte via Asaas (conta própria de cada barbearia). Falta a outra ponta: cada barbearia paga uma mensalidade pro dono do sistema (Luiz), pra continuar usando o NexoBarber. Hoje isso não existe — nenhum código, nenhuma cobrança automática.

**Decisão de escopo**: por enquanto, todo mundo paga o mesmo valor fixo, **R$250/mês**. Não existe diferenciação de plano (Básico/Pro/Premium) nem bloqueio de funcionalidade por tier — isso fica pra uma etapa futura, decidida separadamente.

Onboarding de barbearia nova continua 100% manual (script direto no banco, como já é hoje) — não existe tela de cadastro de barbearia.

## O que muda

### Schema (`barbearias`)

```
barbearias
  + asaas_customer_id      text, nullable, unique
  + asaas_subscription_id  text, nullable, unique
  + status_pagamento       enum('em_dia', 'atrasado'), not null, default 'em_dia'
```

Sem migrations versionadas nesse projeto — sobe direto com `npm run db:push`.

### `src/lib/asaasPlataforma.ts` (novo)

Espelha `src/lib/asaas.ts` (mesmo formato de `asaasFetch`, mesma `AsaasError`), mas autentica com `ASAAS_PLATAFORMA_API_KEY` (a conta Asaas do Luiz) em vez de `ASAAS_API_KEY` (conta de cada barbearia). É uma conta Asaas totalmente separada, então não dá pra reaproveitar o cliente existente sem misturar as duas contas.

Funções: `criarClienteAsaasPlataforma`, `criarAssinaturaAsaasPlataforma` (valor fixo R$250, `cycle: MONTHLY`, Pix ou cartão), `buscarPrimeiroPagamentoDaAssinaturaPlataforma`, `buscarPixQrCodePlataforma`, `cancelarAssinaturaAsaasPlataforma`. Reaproveita `mapStatusPagamentoAsaas` de `lib/asaas.ts` (é uma função pura, não depende de qual conta).

### Onboarding (script manual)

O script que já uso pra inserir `barbearias` + `barbeiros` na criação de uma barbearia nova passa a, na mesma execução: criar o cliente na conta Asaas da plataforma, criar a assinatura de R$250/mês, e salvar `asaas_customer_id`/`asaas_subscription_id` na linha da barbearia.

Não existe tela pro dono pagar ainda. A cobrança inicial: pego o `invoiceUrl` da primeira cobrança gerada pela assinatura e mando esse link pro dono manualmente (WhatsApp) — igual eu já faço outras partes do onboarding hoje.

### Webhook (`/api/webhooks/asaas-plataforma`, novo)

Rota separada da que já existe (`/api/webhooks/asaas`), porque é uma conta Asaas diferente com um token de webhook diferente (`ASAAS_PLATAFORMA_WEBHOOK_TOKEN`, novo). Mesmo padrão de idempotência da rota existente (reaproveita a tabela `asaas_webhook_eventos`, que já não tem `barbeariaId` — cabe evento de qualquer uma das duas contas).

Fluxo: confere o token → registra o evento (idempotência) → acha a barbearia pelo `asaas_subscription_id` → `PAYMENT_RECEIVED`/`PAYMENT_CONFIRMED` vira `status_pagamento = 'em_dia'`, `PAYMENT_OVERDUE` vira `status_pagamento = 'atrasado'` → revalida as rotas do admin dessa barbearia.

### Bloqueio

Só afeta **dono e barbeiro** (rotas `/admin` e `/barbeiro`) — o cliente final da barbearia continua agendando normalmente mesmo se a barbearia estiver inadimplente, porque a culpa não é dele.

Os layouts `src/app/admin/(dashboard)/layout.tsx` e `src/app/barbeiro/(dashboard)/layout.tsx` já buscam a barbearia por id (`getBarbeariaPorId`) pra montar nome/logo. Passam a checar `statusPagamento`: se `'atrasado'`, `redirect('/pagamento-pendente')` em vez de renderizar o dashboard.

`/pagamento-pendente` (rota nova, simples): explica que a mensalidade está atrasada e pra entrar em contato — sem lógica de pagamento nela (não tem tela de cobrança pro dono ainda, é só um bloqueio informativo).

## Fora de escopo (explicitamente adiado)

- Diferenciação de valor/funcionalidade por plano (Básico/Pro/Premium)
- Tela do dono pagar/ver histórico de cobrança dentro do sistema
- Cancelamento automático da assinatura na plataforma quando uma barbearia é removida (offboarding também é manual hoje)
- Grace period / tolerância antes de bloquear — usa o status que o próprio Asaas já manda (ele tem sua própria tolerância até marcar `OVERDUE`)
