---
description: >
  Fase 3 do build de pagina — orquestra subagentes section-builder em paralelo (3 por vez)
  para implementar todas as views consumindo components shared (de /build-components).
  Valida e dispara code review no fim. Roda APOS /build-components.
argument-hint: <page-name>
---

# /build-page — Orquestrador da implementação de views

Você está executando a **Fase 3** do workflow build (3 fases: prep → components → page). Objetivo: implementar todas as views (seções) via **subagentes `section-builder` isolados** consumindo componentes shared já implementados. Seu contexto deve permanecer leve — o `.vue` gerado pelos subagentes NÃO entra aqui.

## Princípio central

Você é um **orquestrador**, não um implementador. Cada view é construída por 1 subagente isolado que retorna apenas um resumo YAML (~200 tokens). Seu contexto cresce devagar:

```
Contexto seu = manifesto (~5k) + N resumos de subagentes (~200 cada) + lint/build output
            ≈ 10-15k tokens, constante durante toda a execução
```

Se você se pegar lendo `.vue` gerado pelo section-builder ou tentando "ajustar" código direto, **PARE** — isso é violação do contrato. Devolva pro subagente.

---

## Pré-requisitos (HARD GATE — falhar alto, não improvisar)

Antes de qualquer Task tool, validar **TODOS** os itens. Se **qualquer** falhar, **ABORTAR** e perguntar ao usuário — **proibido** prosseguir com fallback silencioso.

1. `/build-prep` rodou com sucesso
2. `docs/build-manifest-{page}.md` existe
3. `.claude/agents/section-builder/AGENT.md` existe (subagente)
4. **`/build-components {page}` rodou com sucesso:**
   - Cada componente em `## Componentes shared — specs` está com `status: implementado`
   - Cada `src/components/{Comp}/{Comp}.vue` existe e não está vazio
   - Se faltar → ABORTA, pede `/build-components {page}`.
5. **`subagent_type` aceito está disponível no ambiente atual:**
   - **PREFERIDO:** `section-builder` — agente custom registrado via `.claude/agents/section-builder/AGENT.md`.
   - **FALLBACK:** `claude` — Claude Code genérico. Contrato preservado via AGENT.md **INTEIRO** injetado inline no prompt.

### Item 5 — escolha do subagent_type

1. Se `section-builder` está disponível → usar.
2. Senão → usar `claude` **com o AGENT.md INTEIRO injetado inline no prompt**. O AGENT.md é auto-contido e é a única voz de instrução do subagente. Registrar a escolha em métricas finais (`subagent_type_usado: claude`).
3. Se **nenhum dos dois** estiver disponível, reportar ao usuário e **esperar resposta**. Sem resposta = sem build.

O que **NUNCA** é aceito: usar qualquer subagent sem o AGENT.md INTEIRO inline quando não é o `section-builder` custom — isso é fallback silencioso, proibido.

## Argumento

`<page-name>` (kebab-case, ex: `dashboard`, `portfolio`, `relatorios`) — usado pra localizar `docs/build-manifest-{page}.md`. A pasta de views correspondente é `src/views/{Page}/` (PascalCase).

---

## Workflow

### Passo 1 — Validar pré-condições

1. `Read docs/build-manifest-{page}.md` — manifesto completo. Memoriza:
   - Inventário (tabela de seções com node-id, arquivo, paralelizável)
   - Plano de execução (batches definidos no manifesto)
   - Critério de aceite
   - Seção `## Componentes shared — specs` — confirmar que cada está marcado `status: implementado`
2. `Glob src/views/{Page}/*.vue` — verifica se alguma view JÁ foi implementada em rodada anterior (idempotência).
3. `Glob src/components/{Comp}/{Comp}.vue` pra cada componente em `## Componentes shared — specs` — confirmar que existe e não está vazio. Se algum falta → ABORTA, manda rodar `/build-components {page}`.
4. Verifica que stub de página existe: `src/pages/{Page}.vue` (criado pelo `/build-prep`).
5. Verifica que ícones existem: `Glob src/components/icons/*.vue` — se manifesto lista ícones e pasta está vazia, avisar usuário (pode ser necessário re-rodar `/build-prep`).

Qualquer divergência: reportar ao usuário e pedir confirmação antes de prosseguir.

### Passo 2 — Plano de paralelismo

Do manifesto, ler "Plano de execução". Estrutura típica:

```
Batch 1 (paralelo, max 3): Hero, Metricas, Tabela
Batch 2 (paralelo, max 1): CTA
Serial (último): Navbar
```

**Regras invioláveis**:

- Máximo **3 subagentes em paralelo por batch** (race condition em arquivos compartilhados aumenta acima disso)
- Navbar/Header e Footer **sempre serial e por último** (links dependem das outras views)
- **Race condition de componentes RESOLVIDA por temporal slicing**: components shared já foram implementados pelo `/build-components`, então 3 views paralelas só CONSOMEM, nunca CRIAM. Não há mais race condition.
- Views já implementadas (arquivo `src/views/{Page}/{Nome}.vue` existe) **pular** (idempotência)

### Passo 3 — Disparar subagentes (loop por batch)

Pra cada batch do plano:

1. Pra cada view do batch, lançar 1 Task tool em paralelo (mesma mensagem) com:
   - **subagent_type**: `section-builder` se disponível, senão `claude` (decisão tomada no pré-requisito 5). **Sem outros fallbacks silenciosos.**
   - **description**: `"build {NomeView}"`
   - **prompt**: o conteúdo **completo** de `.claude/agents/section-builder/AGENT.md` + bloco YAML com inputs. O AGENT.md inline é OBRIGATÓRIO no caso `claude` — sem ele, vira fallback silencioso (proibido).
     ```yaml
     manifesto_path: docs/build-manifest-{page}.md
     page: {page}
     secao_nome: {Nome}
     node_id: "{node-id}"
     output_path: src/views/{Page}/{Nome}.vue
     componentes_specs:  # subset das specs do manifesto que esta view reusa
       - {Comp1}
       - {Comp2}
     store_imports: []   # lista de stores Pinia que esta view precisar; null se nenhum
     ```
     > Nota: tracking de progresso é via `Glob src/views/{Page}/*.vue` + manifesto (não checklist físico).
2. **AGUARDAR** todos os subagentes do batch terminarem.
3. Coletar os YAMLs retornados. Pra cada um:
   - `status: ok` → contabilizar sucesso
   - `status: parcial` → guardar dúvidas/notas pro relatório final
   - `status: bloqueio` → **PARAR o batch atual**. Reportar bloqueio ao usuário com a `bloqueios` field. Se usuário quer continuar, re-disparar só a view bloqueada com input ajustado.
4. Se subagente retornou `componentes_evolucao_pedida`:
   - Significa que o componente shared não tem prop que a view precisa
   - Decisão: re-disparar `/build-components` em modo `update` pro componente, OU aceitar workaround inline (com nota no handoff)
   - **Proibido criar componente novo daqui** — fora do contrato. Se realmente precisa de componente novo, reportar ao usuário pra rodar `/build-prep` novamente atualizando manifesto.

Após cada batch, repetir pro próximo. Por último, rodar **serial** Navbar e Footer (1 subagente por vez).

### Passo 4 — Integração da página

1. `Read src/pages/{Page}.vue` (stub criado pelo `/build-prep`).
2. Editar pra:
   - **Descomentar imports** de todas as views implementadas, na ordem do inventário do manifesto.
   - **Adicionar imports de stores/services** se alguma view precisar de dados centralizados (anotar via `store_imports` no YAML do subagente — se retornou algum, wire aqui):

     ```vue
     <script setup>
     import DefaultLayout from '@layout/DefaultLayout.vue'
     import Hero from '@views/{Page}/Hero.vue'
     import Metricas from '@views/{Page}/Metricas.vue'
     import Tabela from '@views/{Page}/Tabela.vue'
     import CTA from '@views/{Page}/CTA.vue'
     import Navbar from '@views/{Page}/Navbar.vue'

     // stores/services (se alguma view precisar de dados centralizados):
     // import { usePortfolioStore } from '@stores/portfolio'
     // const portfolioStore = usePortfolioStore()
     </script>

     <template>
       <DefaultLayout>
         <main>
           <Navbar />
           <Hero />
           <Metricas />
           <Tabela />
           <CTA />
         </main>
       </DefaultLayout>
     </template>
     ```

   - **Garantir `<main>` wrapping as views** (R10 — semântica HTML)
   - **Usar imports de alias**: `@layout/`, `@views/`, `@stores/` — nunca paths relativos

3. Conferir que cada view do inventário tem arquivo `.vue` em `src/views/{Page}/` (`Glob`).
4. Se alguma view do inventário não tem arquivo correspondente, listar ao usuário — não auto-completar.

### Passo 5 — Validação automatizada

```bash
bun run lint
bun run build
```

Se erros:

- **Erro localizado em 1 view** → re-disparar `section-builder` daquela view com bloco extra `correcao_solicitada` no input contendo o output do erro.
- **Erro global** (config, import path quebrado) → reportar ao usuário, NÃO tentar fix automático em arquivo compartilhado.

Repetir até build limpo OU 2 tentativas (se persistir, reportar).

### Passo 6 — Code review automático

Lançar 1 Task tool com:

- **subagent_type**: `code-reviewer` se disponível, senão `claude`
- **description**: `"review {page}"`
- **prompt**: `"Revise os arquivos novos em src/views/{Page}/ e src/pages/{Page}.vue contra .claude/RULES.md. Use git diff. Reporte BLOCKERS e MAJORs."`

Coletar resultado. Se `BLOCKERS` > 0:

- Listar findings ao usuário
- Oferecer disparar `section-builder` em modo `correcao_solicitada` para cada finding

Se só MINOR/INFO: prosseguir.

### Passo 7 — Handoff obrigatório (`docs/build-handoff-{page}.md`)

**SEMPRE** após o Passo 6 e **antes** do Passo 8, criar ou sobrescrever `docs/build-handoff-{page}.md`.

Objetivo: **nenhum** `status: parcial`, `desvios_do_manifesto`, `duvidas`, finding de review ou intervenção sua some no chat — o humano tem um artefato persistente + prompt copiável.

Conteúdo mínimo do arquivo:

1. **Cabeçalho**: página `{page}`, data ISO, caminho do manifesto `docs/build-manifest-{page}.md`.
2. **Tabela por view** (uma linha por YAML recebido dos subagentes): `status`, `desvios_do_manifesto`, `duvidas`, `componentes_pedidos`, `bloqueios` (se houver), `notas`, `lint_ok`.
3. **Code review**: BLOCKERS / MAJOR / MINOR / INFO (resumo ou lista); indicar se foram **corrigidos pelo orquestrador** ou **ainda abertos** (e por quê).
4. **Intervenções do orquestrador** (honestidade): qualquer alteração **fora** do escopo estrito dos `.vue` das views (ex.: `tailwind.css`, `src/pages/{Page}.vue`, ícone global em `src/components/icons/`) — lista bullet curta com paths.
5. **Análise e sugestões de correção (obrigatório)** — o orquestrador **não** apenas cola YAML/review; deve **sintetizar**:
   - **Causas raiz** agrupadas (ex.: asset não extraído no `/build-prep`, ícone fora do manifesto, literal RULE violada, placeholder de copy).
   - **Backlog priorizado** em **P0 / P1 / P2** (ou equivalente explícito), cada item com: _problema_ → _path ou âmbito_ → **ação sugerida** em uma linha (export Figma, `/icon-extract`, patch em arquivo X, re-disparar section-builder com `correcao_solicitada`, re-rodar prep).
   - Separar claramente o que o **humano** decide (copy real, URLs, dados de contato) do que é **puramente técnico**.
6. **Bloco `PROMPT COPIÁVEL`** (fenced markdown ` ```text ` ou similar): um único texto que o usuário pode colar num novo turno para:
   - fechar desvios contra manifesto + `.claude/RULES.md`;
   - rodar `/icon-extract` ou export manual onde faltar SVG do Figma;
   - trocar placeholders de copy;
   - opcional: re-disparar `section-builder` com `correcao_solicitada` citando este handoff.

O prompt copiável deve citar **paths exatos** (`src/views/{Page}/…`, assets, manifesto) e bullets **acionáveis**, alinhados às prioridades do §5.

### Passo 8 — Resumo final ao usuário

```markdown
## /build-page concluído — {page}

### Views implementadas (N/N)

- ✓ Hero (src/views/{Page}/Hero.vue, 142 linhas)
- ✓ Metricas (src/views/{Page}/Metricas.vue, ...)
- ...

### Validação

- ✓ Lint: 0 erros
- ✓ Build: ok
- Code review: 0 blockers, 1 major (...), 2 minor

### Pendências do usuário

- [Hero] Texto do CTA ficou como placeholder — definir copy real
- [Metricas] Imagem `metric-bg.webp` precisa versão maior pra desktop

### Handoff persistido

- Ver **`docs/build-handoff-{page}.md`** — tabela + análise e sugestões priorizadas + prompt copiável.

### Próximos passos

1. Resolver pendências (lista acima) ou colar o prompt do handoff num novo turno
2. (opcional) Rodar `/verify` pra fidelidade visual
3. Se design tinha animações: aplicar `/gsap` por view

### Métricas

- Tempo total: ~Nmin
- Subagentes lançados: N
- subagent_type_usado: section-builder | claude
- Tokens consumidos (aprox): Nk parent + Mk subagentes
```

---

## Restrições críticas

- **NÃO** implementar views diretamente — sempre via subagente (`section-builder` ou `claude` com AGENT.md inline)
- **APENAS** `section-builder` ou `claude` (com AGENT.md INTEIRO inline) são aceitos como `subagent_type`. Usar `claude` SEM AGENT.md inline é proibido (vira fallback silencioso).
- **NÃO** disparar `component-builder` daqui — é fase anterior. Se faltar componente, ABORTA e manda usuário rodar `/build-components {page}`.
- **NÃO** criar arquivo em `src/components/` daqui (responsabilidade do `/build-components`)
- **NÃO** usar `@components/` para componentes custom — alias aponta para `src/components/ui/` (shadcn-vue APENAS)
- **NÃO** ler arquivos `.vue` em `src/views/{Page}/` durante a execução (só pra resolver bloqueios pontuais)
- **NÃO** acumular código no contexto — subagentes retornam só YAML
- **NÃO** disparar mais de 3 subagentes em paralelo
- **NÃO** rodar Navbar/Footer fora da serial final
- **NÃO** auto-corrigir blockers do code review — perguntar ao usuário
- **NÃO** consolidar tracking no fim — atualizar **a cada batch**, sequencial, single-writer
- **SEMPRE** lê manifesto como fonte de verdade — se manifesto está desatualizado, mandar usuário re-rodar `/build-prep`

## Idempotência

- Re-rodar `/build-page {page}` deve **pular** views cujo arquivo já existe em `src/views/{Page}/`
- Se usuário quer re-implementar uma view: pedir pra apagar o `.vue` primeiro

## Anti-padrões / sintomas de atalho proibidos

Se você se pegar dizendo qualquer uma dessas frases internas, **PARE** — é violação:

- "Acho que vou só ajustar essa linha rapidinho aqui no Vue" → **NÃO**. Devolve pro subagente com `correcao_solicitada`.
- "Vou ler todos os `.vue` gerados pra garantir consistência" → **NÃO**. Code review faz isso. Seu contexto não aguenta.
- "O manifesto tá meio errado, deixa eu ajustar e seguir" → **NÃO**. Para, mostra pro usuário, pede re-prep ou edição manual.
- "Vou criar esse componente novo direto, é simples" → só se for trivial (≤30 linhas) e o subagente pediu via `componentes_pedidos`. Senão, pergunta.
- "Vou usar `claude` sem o AGENT.md inteiro inline pra economizar tokens." → **NÃO**. AGENT.md inline é o que torna o fallback viável; sem ele vira fallback silencioso (proibido).
- "Vou consolidar o tracking no fim, em vez de marcar batch a batch." → **NÃO**. Single-writer sequencial é o invariante anti-corrida.
- "Importei ícone do Lucide pra não travar o build enquanto section-builder termina." → **NÃO**. Hook `check-icons.mjs` bloqueia o write — e seria mentira na validação final.

### Auto-checagem antes do resumo final

Antes de imprimir o resumo final ao usuário, validar:

- **`docs/build-handoff-{page}.md` existe** e contém tabela + § análise/sugestões priorizadas (P0/P1/P2) + prompt copiável.
- Cada view do inventário tem **`Task` lançado com `subagent_type: section-builder` OU `claude` com AGENT.md inline** registrado em métricas. Se foi qualquer outro tipo, declarar isso no resumo (`subagent_type_usado: <X>`) — visibilidade obriga honestidade.
- `git diff --stat src/views/{Page}/` mostra **apenas** arquivos `.vue` esperados — se houver edição direta sua, declarar como desvio **e** repetir no handoff (Passo 7 §4).

## Referências

- Manifesto: `docs/build-manifest-{page}.md`
- Subagente: `.claude/agents/section-builder/AGENT.md`
- Code review: `.claude/agents/code-reviewer/AGENT.md` (se existir) ou skill `/code-review`
- Regras universais: `.claude/RULES.md`
- Fase anterior: `.claude/commands/build-components.md`
- Handoff pós-build: `docs/build-handoff-{page}.md` (Passo 7)
