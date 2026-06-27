---
description: >
  Fase 2 do build de pagina — implementa components shared do manifesto em ordem
  topologica (serial). Roda APOS /build-prep e ANTES de /build-page. Garante que
  section-builders consomem componentes prontos, eliminando race condition.
argument-hint: <page-name>
---

# /build-components — Orquestrador serial de componentes shared

Você está executando a **Fase 2** do workflow build (3 fases: prep → components → page). Objetivo: pegar as **specs** de components shared geradas pelo `/build-prep` (seção `## Componentes shared — specs` do manifesto) e implementar cada uma como arquivo real em `src/components/{Comp}/{Comp}.vue`, **em ordem topológica**.

## Princípio central

Você é um **orquestrador serial**. Cada componente é construído por 1 subagente `component-builder`. **Sempre serial** — nunca paralelo — porque components podem ter dependência (`Card` usa `Heading`). Output do A pode ser consumido pelo B.

Custo: ~30s/componente × N. Pra 5 components = 2-3 min. Aceitável.

A separação dessa fase do `/build-page` resolve a **race condition** do antigo workflow (section-builders paralelos tentando criar o mesmo componente shared).

---

## Pré-requisitos (HARD GATE — falhar alto)

1. `/build-prep` rodou com sucesso
2. `docs/build-manifest-{page}.md` existe e tem seção `## Componentes shared — specs`
3. `.claude/agents/component-builder/AGENT.md` existe (subagente Vue SFC builder)
4. Tokens já injetados em `src/assets/tailwind.css` (auditoria do `/build-prep` deveria ter validado)
5. **Stack de classes (bloqueante):** `src/lib/utils.js` existe; dependências `clsx`, `tailwind-merge`, `class-variance-authority` instaladas (`package.json`). Sem isso, o `component-builder` gera imports que quebram o build — **abortar** e pedir fundação (RULES **R4b**) antes de despachar subagentes.
6. **Ícones já criados:** `src/components/icons/` deve ter os `.vue` gerados pelo `/build-prep` (Passo 5). Componentes que usam ícones importam de `@/components/icons/{Name}.vue` — verificar que os arquivos existem antes de despachar dependentes.
7. **Contrato do subagente:** `component-builder` **não** cria utilitário `cn` duplicado em `src/components/{Comp}/`; só importa `@lib/utils`. Orquestrador não reescreve `src/lib/utils.js` ou instala packages nesta fase.

## Argumento

`<page-name>` (kebab-case).

---

## Workflow

### Passo 1 — Validar pré-condições e ler manifesto

1. `Read docs/build-manifest-{page}.md` — extrair só:
   - Seção `## Componentes shared — specs` (lista de components com specs)
   - Seção `## Componentes shadcn-vue reusados` e `## Componentes custom existentes reusados` (matches que NÃO precisam ser construídos — pode ter `evolucao_pedida`)
   - Seção `## Componentes — checkpoint humano` (validação de specs `confidence: baixa`)
   - Seção `## Estruturas inline-only (não viraram shared)` (NÃO viram arquivo em `src/components/`; section-builder consome essa seção diretamente)
   - Seção `## Status > Components` (idempotência — quais já estão `[x]`)
2. Filtrar componentes **propostos** (status: `proposto`) — esses são alvo desta rodada. Componentes `implementado` são pulados (idempotência).
3. Se manifesto tem componentes em `evolucao_pedida` (de `## Componentes shadcn-vue reusados` ou `## Componentes custom existentes reusados`), avisar usuário e perguntar se quer despachar `component-builder` em modo `update` pra cada.

### Passo 1b — Validação de extração (gate humano)

Antes do topological sort, validar usos reais. **Salvaguarda** contra manifestos que ainda escreveram slots de 1 uso.

1. Pra cada componente filtrado no Passo 1.2 (`status: proposto`):
   - Ler `usos_contados: N` da spec (campo obrigatório no template do `/build-prep`)
   - Se o campo está **ausente** (manifesto velho), contar fallback do campo `aparicoes` ou marcar `usos_contados: ?` como suspeito.
   - Se `N < 2` E não casa com `src/components/ui/` (shadcn-vue) ou `src/components/` existente → **listar como SUSPEITO**.

2. Se há suspeitos, MOSTRAR ao usuário e ESPERAR resposta:

   ```
   Componentes propostos com 1 uso só (candidatos a inline conforme RULES R4b-extract):

   - FiltroAvancado (só em Tabela)
   - ProjetoIntroPanel (só em Projeto/ProjectIntro)

   Pra cada componente, responder:
     - inline → não despacha; spec move pra `## Estruturas inline-only`; section-builder inline na seção
     - shared → mantém, despacha component-builder normalmente
   ```

3. Aplicar respostas no manifesto:
   - **inline:** `Edit docs/build-manifest-{page}.md` — mover entry de `## Componentes shared — specs / ### {Comp}` pra `## Estruturas inline-only (não viraram shared)`, mudar `status: proposto` → `status: inline-na-secao`, adicionar `motivo: "Confirmado inline em /build-components gate (1 uso)"`. NÃO despachar subagente.
   - **shared:** mantém na seção atual, segue pro Passo 2.

4. Após resolver todos os suspeitos, recalcular lista de componentes a despachar = `propostos restantes`.

### Passo 2 — Topological sort

Pra cada componente proposto, ler `depende_de: [...]`. Montar grafo:

- Componentes sem `depende_de` (ou `[]`) → folhas (primitivos): Heading, Badge, icon wrapper
- Componentes que listam outros → dependentes (MetricCard depende de [Badge])

Ordenar por níveis: nível 0 (sem dep) primeiro, nível N (depende de N-1) por último.

Se houver ciclo (A depende de B, B depende de A) → ABORTA, reporta ao usuário.

Antes de despachar qualquer dependente, verificar que o arquivo do qual ele depende existe:
- `Glob src/components/{Dep}/{Dep}.vue` — se não existe E não é shadcn-vue, aborta antes de despachar.
- Ícones: `Glob src/components/icons/{Name}.vue` — verificar existência antes de despachar componente que usa ícone.

### Passo 3 — Disparar component-builder em SERIAL

Pra cada componente NA ORDEM:

1. Lançar 1 Task (não paralelo):
   - **subagent_type:** `component-builder` se disponível, senão `claude` com AGENT.md inteiro inline
   - **description:** `"build component {Comp}"`
   - **prompt:** conteúdo de `.claude/agents/component-builder/AGENT.md` + bloco YAML:
     ```yaml
     manifesto_path: docs/build-manifest-{page}.md
     componente_nome: {Comp}
     spec_anchor: "## Componentes shared — specs / ### {Comp}"
     output_path: src/components/{Comp}/{Comp}.vue
     mode: create | update  # update se já existe (evolucao_pedida)
     ```
2. Aguardar terminar.
3. Coletar YAML retornado:
   - `status: ok` → marcar `implementado` no manifesto
   - `status: parcial` → guardar pra relatório, prosseguir mesmo assim (componente nasceu mas com pendência)
   - `status: bloqueio` → **PARAR**. Reportar ao usuário com `bloqueios`. Não disparar próximos componentes (cascata: dependentes vão quebrar).

### Passo 4 — Atualizar manifesto após cada componente

**Single-writer (orquestrador).** Pra cada componente que retornou `ok | parcial`:

1. `Edit docs/build-manifest-{page}.md`:
   - Trocar `status: proposto` por `status: implementado` na entry da spec
   - Adicionar campo `props_implementadas: [...]` com lista do YAML retornado
   - Atualizar checklist `## Status > Components`: `[ ] {Comp}` → `[x] {Comp}`

Edits sequenciais (nunca em paralelo). Anti-corrida by design.

### Passo 5 — Gate final

Validar:

- [ ] Cada componente shared do manifesto está marcado `[x]` em `## Status > Components`
- [ ] Cada `src/components/{Comp}/{Comp}.vue` existe e não está vazio
- [ ] Cada arquivo tem `<script setup>` com as props da spec (validado por inspeção rápida)
- [ ] Nenhum componente importa de biblioteca de ícones (`grep -r "lucide\|heroicons\|material\|phosphor\|feather\|tabler" src/components/`)
- [ ] Lint passou em todos (subagente já roda `bun run lint` no arquivo)

Se TUDO ✅ → resumo final + sugere `/build-page {page}`.
Se ALGUM ❌ → reporta o que falhou.

### Passo 6 — Resumo final ao usuário

```markdown
## /build-components concluído — {page}

### Componentes implementados (N/N)

- ✓ MetricCard (src/components/MetricCard/MetricCard.vue, props: { label, valor, variacao, variant })
- ✓ StatusBadge (src/components/StatusBadge/StatusBadge.vue, props: { status })
- ✓ DataTable (src/components/DataTable/DataTable.vue, props: { rows, columns, loading })
- ...

### Componentes em update (evolução de existentes)

- (vazio, ou lista de existentes que ganharam props novas)

### Validação

- ✓ Lint: 0 erros (todos os componentes)
- ✓ Cada `<script setup>` casa com props da spec do manifesto
- ✓ Zero imports de biblioteca de ícones

### Pendências

- (vazio, ou lista de componentes parciais com motivo)

**Próximo passo:** /build-page {page}

Se algum componente ficou parcial, resolver antes de seguir.
```

---

## Restrições críticas

- **NÃO** disparar mais de 1 subagente por vez (sempre serial)
- **NÃO** criar componente fora de `src/components/` (papel do subagente)
- **NÃO** usar `@components/` para componentes custom — esse alias aponta para `src/components/ui/` (shadcn-vue APENAS); componentes custom usam `@/components/{Name}.vue`
- **NÃO** editar `src/assets/tailwind.css` daqui (responsabilidade do `/build-prep`)
- **NÃO** falar com Figma diretamente — subagente lê screenshot do manifesto + spec
- **NÃO** chamar `/build-page` daqui

## Idempotência

- Re-rodar `/build-components {page}` deve pular componentes já marcados como `[x]` + arquivo existente
- Pra forçar reimplementação: usuário deleta o arquivo + desmarca o checklist no manifesto
- Modo `update` (componente existe mas ganhou prop nova): subagente lê arquivo atual, gera diff aditivo, valida que props existentes continuam funcionando

## Anti-padrões

- "Vou só implementar esse MetricCard rapidinho aqui no orquestrador" → **NÃO**. Sempre subagente. Serial mantém isolamento.
- "São 5 componentes, paralelizo 3 e sobra 2" → **NÃO**. Race condition garantida se A é importado por B.
- "O MetricCard depende de StatusBadge mas StatusBadge já existe (reuso) — disparo direto" → OK, mas garantir que arquivo existe (`Glob`) antes de disparar dependente.
- "Vou importar um ícone do Lucide pra agilizar" → **NÃO**. Usar `@/components/icons/{Name}.vue` (gerado pelo `/build-prep`). Hook `check-icons.mjs` bloqueia o write se houver import de lib de ícone.

## Nota sobre o subagente `component-builder`

O agente `.claude/agents/component-builder/AGENT.md` (a ser criado separadamente) deve implementar componentes Vue 3 SFC seguindo as convenções do projeto:

- `<script setup>` com `defineProps()` tipados
- `import { cn } from '@lib/utils'` pra composição de classes (NUNCA duplicar utilitário)
- `cva` de `class-variance-authority` quando há ≥2 variants ortogonais com 3+ classes cada (RULES R4b-cva)
- Ícones via `import {Name} from '@/components/icons/{Name}.vue'`
- Componentes shadcn-vue via `import { Button } from '@components/button'`
- Desktop-first com `max-md:`/`max-lg:` (R8)
- HTML semântico (R10): `<button>`, `<a>`, `aria-*` corretos
- ZERO biblioteca de ícones (R7)

## Referências

- Specs origem: `## Componentes shared — specs` em `docs/build-manifest-{page}.md`
- Subagente: `.claude/agents/component-builder/AGENT.md`
- Regras universais: `.claude/RULES.md`
- Vault de aprendizado: `.claude/learn/components/` (lições recorrentes; subagente lê se relevante)
- Fase anterior: `.claude/commands/build-prep.md`
- Próxima fase: `.claude/commands/build-page.md`
