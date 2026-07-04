# Build Handoff — Login

> Página: `login`
> Data: 2026-07-04
> Manifesto: `docs/build-manifest-login.md`
> Fases anteriores: `/build-prep login` → `/build-components login` (no-op, 0 componentes shared) → `/build-page login` (este handoff)

## Tabela por view

| View | Status final | Desvios do manifesto | Dúvidas | Componentes pedidos | Bloqueios | lint_ok |
|---|---|---|---|---|---|---|
| `ViewLoginBranding.vue` | ok | Nenhum (após 2 rodadas de correção) | Nenhuma | — | Nenhum | true |
| `ViewLoginForm.vue` | ok (após correções; 1ª rodada retornou `parcial` por falso positivo de lint) | Rotas `/reset-password` e `/cadastro` referenciadas por `RouterLink` ainda não existem no router (aceito propositalmente — ver backlog) | Confirmado: cores do botão Google usam token `--color-input-bg`; labels visuais viram `sr-only` (Figma não mostra label visível) | — | Nenhum | true (ver nota sobre falso positivo abaixo) |

**Histórico de rodadas:**
1. Construção inicial (2 subagentes em paralelo) — ambos retornaram `status: ok`, mas a composição entre as duas views tinha 2 incompatibilidades reais (ver Code Review).
2. Code review formal (`/code-review` via agente `review`) — veredicto **BLOQUEADO**: 1 BLOCKER, 5 MAJOR, 5 MINOR, 4 INFO.
3. Correção via re-dispatch dos 2 `section-builder` com `correcao_solicitada` — todos os 11 findings acionáveis corrigidos.
4. Verificação visual manual (`bun dev` + screenshot 1920×935 via Chrome DevTools) revelou mais 1 bug real não capturado pelo code review (texto do subtítulo sem `max-width`, escondido atrás do painel amarelo) — corrigido numa 3ª rodada de re-dispatch.
5. Build (`bun run build`) limpo em todas as rodadas.

## Code review — resumo

| Severidade | Qtd | Status |
|---|---|---|
| BLOCKER | 1 | ✅ Corrigido (B1 — proporção do split `w-1/2` → `w-[690px]`) |
| MAJOR | 5 | ✅ Corrigidos (M1 tokens de spacing, M2 `style` inline → classes Tailwind, M3 tokens de cor genéricos → tokens de projeto, M4 `font-semibold` sobre `text-*`, M5 bug funcional do botão de cadastro) |
| MINOR | 5 | ✅ Corrigidos (m1 `space-y-6`→`space-y-section-gap`, m2 labels visíveis→`sr-only`, m3 `cn` vestigial/não usado, m4 `rem` hardcoded→variável CSS, m5 `<section>` sem `aria-labelledby`) |
| INFO | 4 | i1 corrigido (import redundante de `RouterLink` removido); i2/i3 eram confirmações positivas (nenhuma ação); i4 (token opcional pro `gap-[148px]`) não criado — aceitável, coberto pela exceção de layout da R1 |

Achado extra pós-review (verificação visual manual, fora do escopo do code review original): subtítulo sem `max-w-[369px]` ficava escondido atrás do painel amarelo; headline perdeu a quebra em 2 linhas por falta de `max-w-[477px]`. Ambos corrigidos.

## Intervenções do orquestrador (honestidade)

Além de orquestrar os subagentes, eu (orquestrador) editei diretamente estes arquivos — fora do escopo estrito dos `.vue` de view:

- `docs/build-manifest-login.md` — adicionei uma nota de composição (quem desenha o split de fundo vs. quem posiciona o card) ANTES de despachar os subagentes, pra evitar que os 2 `section-builder` isolados tomassem decisões conflitantes.
- `src/assets/tailwind.css` — adicionei 4 variáveis CSS (`--text-auth-button`, `--text-auth-link`, `--text-auth-input`, `--text-auth-cta`) e atualizei as 4 `@utility` correspondentes pra referenciá-las em vez de `rem` hardcoded (finding m4 do review). Essa edição é proibida para os `section-builder` (arquivo compartilhado) — só o orquestrador pode tocar.
- `src/router/index.js` — a rota `/login` já tinha sido registrada na fase anterior (`/build-prep`); nenhuma mudança adicional nesta fase.

`git diff --stat` confirma que, fora dessas 2 edições pontuais (manifesto + tailwind.css) e o `src/pages/PageLogin.vue` (integração esperada no Passo 4), nenhum outro arquivo compartilhado foi tocado.

## Análise e sugestões de correção

### Causas raiz agrupadas

1. **Isolamento dos subagentes causou incompatibilidade de layout (B1).** Como `section-builder` não pode ler outras views, as duas views construídas em paralelo assumiram proporções de split diferentes. Mitigado nesta rodada fixando a decisão no manifesto antes do dispatch — mas é um padrão de risco que vai se repetir em páginas futuras com elementos visuais compartilhados entre 2+ views.
2. **Tokens documentados no manifesto nem sempre usados pelo subagente na primeira tentativa (M1, M3).** O `section-builder` tem acesso ao manifesto mas ocasionalmente prefere token genérico do shadcn-vue (`text-foreground`) a um token de projeto mais específico. Vale considerar, em manifestos futuros, destacar mais enfaticamente quais tokens são obrigatórios vs. sugeridos.
3. **Bug funcional de UX (M5) surgiu por o Figma não ter um botão de submit explícito** — a tela mistura visualmente "login" (headline "Bem vindo de volta") com um único CTA de "cadastro". Resolvido sem inventar texto novo (R13): "Faça seu cadastro" virou navegação (`RouterLink`), e um botão de submit real foi adicionado oculto (`sr-only`) para permitir envio do formulário via Enter — mas isso é um **paliativo técnico**, não uma decisão de produto validada.
4. **Falso positivo de lint (Biome + Vue SFC)**: `bun run lint` ocasionalmente non-determinístico marca `Button`/`Input`/`Label`/`cn` como "unused imports" mesmo usados em `<template>` — confirmado que é um problema pré-existente do projeto (o mesmo padrão já ocorre em `src/App.vue`, não introduzido nesta sessão). Não afeta o build (`bun run build` limpo em todas as rodadas).

### Backlog priorizado

**P0 — nenhum.** Build limpo, visual conferido, sem bloqueios abertos.

**P1 — decisões de produto/dev pendentes:**
- **Rotas inexistentes**: `RouterLink to="/reset-password"` e `RouterLink to="/cadastro"` apontam pra rotas que não existem em `src/router/index.js`. Ação: criar essas páginas (provavelmente via novo ciclo `/build-prep` + `/build-page`) antes de considerar o fluxo de auth completo.
- **Google OAuth não implementado**: botão "Continuar com Google" (`src/views/Login/ViewLoginForm.vue`, handler `@click="() => {}"`) é um stub visual. Ação: integrar com Supabase Auth (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` já estão no `.env`).
- **Submit do login é um stub**: `handleSubmit` em `ViewLoginForm.vue` só faz `console.log`. Ação: conectar com o serviço de autenticação real (`@services/`).
- **Validar decisão do botão de submit oculto (`sr-only`)**: essa foi uma correção técnica minha pra resolver o bug funcional M5 sem inventar copy nova. Vale confirmar com quem desenhou a tela se o fluxo real deveria ter um botão "Entrar" visível (mudança de design) em vez do botão oculto atual.

**P2 — refinamentos opcionais:**
- Padrão de fundo "plexus"/partículas do painel escuro (documentado desde `/build-prep` como não extraível do Figma) não foi implementado — avaliar se vale um efeito CSS/canvas ou se o fundo sólido atual é aceitável.
- 2º item da lista "Análise Fundamentalista" está vazio no Figma (replicado literalmente) — confirmar com design se é intencional ou um placeholder esquecido.
- `gap-[148px]` na lista de itens do Branding não tem token dedicado — promover a `--spacing-*` se o valor se repetir em outra tela (nota i4 do review original).

## PROMPT COPIÁVEL

```text
Contexto: a tela de Login (docs/build-manifest-login.md, src/views/Login/, src/pages/PageLogin.vue)
foi implementada e passou por code review + correções (docs/build-handoff-login.md tem o histórico
completo). Ficaram pendências P1 documentadas no handoff que precisam de decisão/implementação:

1. Criar as rotas/páginas /reset-password e /cadastro (hoje só existem como RouterLink em
   src/views/Login/ViewLoginForm.vue apontando pra rotas inexistentes em src/router/index.js).
   Sugestão: rodar /build-prep pra cada uma, a partir do frame correspondente no Figma
   (mesmo arquivo AI-investe---jefferson), se existir; senão, criar via fluxo manual.

2. Integrar o botão "Continuar com Google" (src/views/Login/ViewLoginForm.vue, handler
   @click="() => {}") com Supabase Auth (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY já
   configurados no .env).

3. Conectar handleSubmit (mesmo arquivo) com o serviço de autenticação real via @services/,
   substituindo o console.log atual.

4. Validar com quem desenhou a tela se o botão de submit do login deveria ser visível
   (hoje é um <button type="submit" class="sr-only">Entrar</button> oculto, adicionado
   pra resolver um bug funcional sem inventar copy nova que não existia no Figma — ver
   finding M5 do code review no handoff).

Ler docs/build-handoff-login.md inteiro antes de começar pra não repetir decisões já tomadas.
```
