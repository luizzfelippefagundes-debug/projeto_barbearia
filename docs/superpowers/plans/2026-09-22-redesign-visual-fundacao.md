# Fundação Visual do Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a fundação visual definida em `docs/superpowers/specs/2026-09-22-redesign-visual-design.md` (paleta indigo refinado, classes utilitárias de animação sutil) e usar a tela de dashboard admin como primeira aplicação concreta do padrão de hero-stat com números em monoespaçada.

**Architecture:** Mudança puramente visual/CSS + JSX, sem novas rotas ou lógica de negócio. Os tokens de cor em `src/app/globals.css` são atualizados nos três lugares onde já existem (`@theme`, `:root[data-theme="dark"]`, `.theme-forcar-claro`). Duas novas classes utilitárias (`.anim-in`, `.card-hover-border`) são adicionadas ao `@layer components` do mesmo arquivo — opt-in, não alteram o `.card`/`.card-raised` base, então não afetam nenhuma tela além das que explicitamente as usarem. A tela de dashboard (`src/app/admin/(dashboard)/page.tsx`) é a única tela desta leva a consumir essas classes, reorganizando a grade de 3 estatísticas em um layout assimétrico (1 card de destaque + 2 neutros) e aplicando a animação de entrada/hover nela e na lista de horários do dia.

**Tech Stack:** Next.js App Router (Server Component), Tailwind CSS v4 (`@theme`, `@layer components`), CSS puro (keyframes/transitions) — sem bibliotecas de animação novas.

---

## Como testar cada tarefa

Não há suíte de testes de componente neste projeto (o `vitest` existente só cobre funções puras em `src/lib/`) — esta é uma mudança visual, então a verificação é: tipos batendo (`tsc`), lint limpo, e conferência visual no navegador local. Cada tarefa termina com esses três passos.

Antes de começar a Tarefa 1, suba o servidor local numa aba separada (ele fica rodando durante todo o plano):

```bash
npm run dev
```

Acesse `http://localhost:3000/admin` logado como dono de uma barbearia (ex.: use a conta que você já usa pra testar) e deixe essa aba aberta para conferir cada tarefa visualmente, nos dois temas (claro e escuro — o toggle de tema já existe no admin).

---

### Tarefa 1: Atualizar tokens de cor para o indigo refinado

**Files:**
- Modify: `src/app/globals.css:11-13` (bloco `@theme`, tema claro)
- Modify: `src/app/globals.css:46-48` (bloco `:root[data-theme="dark"]`)
- Modify: `src/app/globals.css:72-74` (bloco `.theme-forcar-claro`)

- [ ] **Passo 1: Atualizar o accent do tema claro (`@theme`)**

Em `src/app/globals.css`, dentro do bloco `@theme` (linhas 11-13), troque:

```css
  --color-accent: #4756e6;
  --color-accent-hover: #3a46c4;
  --color-accent-muted: #eef0fd;
```

por:

```css
  --color-accent: #4650d6;
  --color-accent-hover: #3a43b8;
  --color-accent-muted: #eef0fd;
```

(`--color-accent-muted` fica igual — não faz parte da revisão de paleta.)

- [ ] **Passo 2: Atualizar o accent do tema escuro**

No bloco `:root[data-theme="dark"]` (linhas 46-48), troque:

```css
  --color-accent: #6472f5;
  --color-accent-hover: #7c87f7;
  --color-accent-muted: #232c52;
```

por:

```css
  --color-accent: #5865f2;
  --color-accent-hover: #818cf8;
  --color-accent-muted: #232c52;
```

- [ ] **Passo 3: Atualizar o accent do `.theme-forcar-claro`**

Esse bloco (linhas 72-74) repete os mesmos valores do tema claro (usado nas telas de login/cadastro, que ficam sempre no claro). Troque:

```css
  --color-accent: #4756e6;
  --color-accent-hover: #3a46c4;
  --color-accent-muted: #eef0fd;
```

por:

```css
  --color-accent: #4650d6;
  --color-accent-hover: #3a43b8;
  --color-accent-muted: #eef0fd;
```

- [ ] **Passo 4: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros (é só CSS, não deveria quebrar nada de TS/lint).

- [ ] **Passo 5: Conferir visualmente**

Na aba do navegador com `npm run dev` já rodando, dê um refresh em `/admin`. Confira:
- Botões primários (ex.: "Agendar horário") — indigo mais escuro/contrastado que antes.
- Alterne pro tema escuro (se houver um toggle no perfil/config) e confira o mesmo botão — indigo mais claro/saturado que antes.
- Nenhum texto ficou ilegível (contraste ok em cima do fundo).

- [ ] **Passo 6: Commit**

```bash
git add src/app/globals.css
git commit -m "style: atualiza paleta accent para indigo refinado"
```

---

### Tarefa 2: Adicionar classes utilitárias de animação (entrada + hover)

**Files:**
- Modify: `src/app/globals.css` (dentro do bloco `@layer components`, após a regra `.mono-value` existente em torno da linha 125)
- Modify: `src/components/ui/Button.tsx:34`

- [ ] **Passo 1: Adicionar o keyframe e as duas classes utilitárias**

Em `src/app/globals.css`, dentro de `@layer components { ... }`, logo depois do bloco `.mono-value` (linhas 123-125), adicione:

```css
  /* Entrada suave de cards/elementos ao montar — 4px de subida, rápida.
   * Opt-in: precisa da classe .anim-in explicitamente, não afeta .card
   * sozinho, pra não animar todo card já existente no app de uma vez. */
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .anim-in {
    animation: fade-in-up 320ms ease-out backwards;
  }

  @media (prefers-reduced-motion: reduce) {
    .anim-in {
      animation: none;
    }
  }

  /* Hover sutil de card: só a borda clareia, sem deslocar nem sombrear. */
  .card-hover-border {
    transition: border-color 150ms ease;
  }

  .card-hover-border:hover {
    border-color: var(--color-text-secondary);
  }
```

- [ ] **Passo 2: Adicionar feedback de clique no Button**

Em `src/components/ui/Button.tsx:34`, o className base do `<button>` é:

```tsx
        'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
```

Troque por (adiciona `active:opacity-80`):

```tsx
        'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50',
```

- [ ] **Passo 3: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros.

- [ ] **Passo 4: Conferir visualmente**

Essas classes ainda não são usadas em nenhuma tela (isso acontece na Tarefa 3), então não há nada novo pra ver ainda — só confirme que a tela de dashboard continua idêntica a antes (nenhuma regressão), e que clicar em qualquer botão do app (ex.: "Agendar horário") dá aquele leve "pisca" de opacidade ao segurar o clique.

- [ ] **Passo 5: Commit**

```bash
git add src/app/globals.css src/components/ui/Button.tsx
git commit -m "style: adiciona classes utilitarias de animacao (anim-in, card-hover-border)"
```

---

### Tarefa 3: Aplicar hero-stat + animação na tela de dashboard

**Files:**
- Modify: `src/app/admin/(dashboard)/page.tsx:91-119` (grade de estatísticas)
- Modify: `src/app/admin/(dashboard)/page.tsx:126-146` (lista de horários de hoje)

- [ ] **Passo 1: Substituir a grade de 3 estatísticas pelo layout hero + neutros**

Em `src/app/admin/(dashboard)/page.tsx`, troque o bloco (linhas 91-104):

```tsx
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Faturado hoje</p>
          <p className="mono-value mt-1 text-2xl text-accent">{formatBRL(fechamentoDoDia.total)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Agendamentos hoje</p>
          <p className="mono-value mt-1 text-2xl text-text-primary">{confirmadosHoje.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Assinantes em dia</p>
          <p className="mono-value mt-1 text-2xl text-text-primary">{assinantesEmDia}</p>
        </Card>
      </div>
```

por:

```tsx
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <Card
          className="anim-in card-hover-border flex flex-col justify-between border-accent bg-accent p-6"
          style={{ animationDelay: '0ms' }}
        >
          <p className="text-xs text-white/70">Faturado hoje</p>
          <p className="mono-value mt-2 text-4xl text-white">{formatBRL(fechamentoDoDia.total)}</p>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="anim-in card-hover-border p-4" style={{ animationDelay: '60ms' }}>
            <p className="text-xs text-text-secondary">Agendamentos hoje</p>
            <p className="mono-value mt-1 text-2xl text-text-primary">{confirmadosHoje.length}</p>
          </Card>
          <Card className="anim-in card-hover-border p-4" style={{ animationDelay: '100ms' }}>
            <p className="text-xs text-text-secondary">Assinantes em dia</p>
            <p className="mono-value mt-1 text-2xl text-text-primary">{assinantesEmDia}</p>
          </Card>
        </div>
      </div>
```

- [ ] **Passo 2: Aplicar animação escalonada na lista "Horários de hoje"**

No mesmo arquivo, troque o bloco do `.map` (linhas 126-146):

```tsx
          <div className="flex flex-col gap-2">
            {confirmadosHoje.map((a) => {
              const cliente = clientes.find((c) => c.id === a.clienteId)
              const barbeiro = barbeiros.find((b) => b.id === a.barbeiroId)
              const nomesServicos = a.servicoIds
                .map((id) => servicos.find((s) => s.id === id)?.nome)
                .filter(Boolean)
                .join(' + ')
              return (
                <Card key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-text-primary">{cliente?.nome ?? 'Cliente avulso'}</p>
                    <p className="text-xs text-text-secondary">
                      {nomesServicos} · {barbeiro?.nome}
                    </p>
                  </div>
                  <span className="mono-value text-sm text-brass">{a.hora}</span>
                </Card>
              )
            })}
          </div>
```

por:

```tsx
          <div className="flex flex-col gap-2">
            {confirmadosHoje.map((a, index) => {
              const cliente = clientes.find((c) => c.id === a.clienteId)
              const barbeiro = barbeiros.find((b) => b.id === a.barbeiroId)
              const nomesServicos = a.servicoIds
                .map((id) => servicos.find((s) => s.id === id)?.nome)
                .filter(Boolean)
                .join(' + ')
              return (
                <Card
                  key={a.id}
                  className="anim-in card-hover-border flex items-center justify-between px-4 py-3"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div>
                    <p className="text-sm text-text-primary">{cliente?.nome ?? 'Cliente avulso'}</p>
                    <p className="text-xs text-text-secondary">
                      {nomesServicos} · {barbeiro?.nome}
                    </p>
                  </div>
                  <span className="mono-value text-sm text-brass">{a.hora}</span>
                </Card>
              )
            })}
          </div>
```

- [ ] **Passo 3: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros.

- [ ] **Passo 4: Conferir visualmente**

Na aba com `/admin` aberto, dê refresh e confira:
- O card "Faturado hoje" aparece maior, à esquerda, com fundo indigo sólido e número grande em monoespaçada branco.
- "Agendamentos hoje" e "Assinantes em dia" aparecem empilhados à direita, menores, fundo neutro.
- Ao carregar a página, os cards entram com um fade + leve subida, em sequência (não todos ao mesmo tempo).
- Passar o mouse sobre qualquer um dos três cards clareia a borda (sem sombra, sem deslocar o card).
- Se houver horários confirmados hoje, a lista "Horários de hoje" também entra com a mesma animação escalonada e reage no hover.
- Repita no tema escuro — o card de destaque deve continuar legível (texto branco sobre indigo).
- Redimensione a janela pra largura de celular — a grade deve empilhar tudo em uma coluna (o `sm:grid-cols-[2fr_1fr]` só entra a partir do breakpoint `sm`).

- [ ] **Passo 5: Commit**

```bash
git add "src/app/admin/(dashboard)/page.tsx"
git commit -m "feat: aplica hero-stat e animacao sutil no dashboard admin"
```

---

## Depois deste plano

Isso fecha a fundação (tokens + classes utilitárias) e a primeira aplicação (dashboard). Não faz parte deste plano: deploy para produção (fica pra depois de validar em localhost, por pedido explícito do usuário) nem aplicação nas demais telas (agenda, clientes, assinaturas etc.) — cada uma dessas é uma rodada futura, reaproveitando as mesmas classes `.anim-in` / `.card-hover-border` e os tokens já atualizados.
