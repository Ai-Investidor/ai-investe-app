---
description: >
  Fase 1 do build de view/página — extrai assets, tokens, gera manifesto rico e stubs a partir
  de uma URL do Figma. Roda ANTES de /build-components e /build-page. Não gera .vue de seção
  (mecânico apenas).
argument-hint: <figma-url-do-frame-raiz>
---

# /build-prep — Fase mecânica do build de view/página

Você está executando a **Fase 1** do workflow build (3 fases: prep → components → page). Objetivo: produzir tudo que é mecânico (assets, tokens, manifesto rico, stubs de página e views) **ANTES** da implementação de componentes e seções. Sem isso, as fases seguintes colidem em arquivos compartilhados ou faltam contrato.

**Fonte de design:** somente Figma. Passe a URL do frame raiz como argumento.

## Convenção de nomes (uma view/página por chamada)

- **`{page}`** (kebab-case) — identificador da página, ex: `dashboard`, `portfolio`, `relatorios`. Vira: nome do manifesto, pasta de assets, prefixo de screenshots.
- **`{Page}`** (PascalCase) — mesma página, pra pasta de views. Ex: `Dashboard`, `Portfolio`, `Relatorios`.
- **`{rota}`** — caminho da rota no Vue Router: `/dashboard`, `/portfolio`. Vira `src/pages/{Page}.vue`.

## O que esta fase entrega

- `docs/build-manifest-{page}.md` — manifesto rico (fonte de verdade pras fases seguintes)
- `src/assets/icons/{page}/*.svg` — arquivos SVG individuais via `/icon-extract`
- `src/components/icons/{IconName}.vue` — um `.vue` por ícone com SVG inline (`fill="currentColor"`)
- `src/assets/images/{page}/*.webp` — imagens baixadas, organizadas por seção
- Tokens novos adicionados em `src/assets/tailwind.css`
- Stubs: `src/pages/{Page}.vue` + `src/views/{Page}/` (pasta vazia) com placeholders comentados
- Screenshots de referência em `docs/figma/{page}-*.webp`

## O que esta fase **NÃO** faz

- Não gera nenhum `.vue` de seção/view (papel de `/build-page`)
- Não cria componentes shared em `src/components/` além dos ícones (papel de `/build-components`)
- Não marca checklist como done
- Não roda lint/build
- Não dispara `review`

## Pré-requisitos

- URL do Figma do frame raiz da página (passada como argumento)
- `FIGMA_TOKEN` env var (pra `/icon-extract`)
- Skill `/figma` (referência técnica)
- Skill `/icon-extract`

Se faltar argumento, ABORTAR e pedir ao usuário.

---

## Workflow

### Passo 1 — Identificação da página

1. Validar argumento: deve conter `figma.com`. Parsear URL → extrair `fileKey` e `nodeId`.
2. Pedir ao usuário (ou inferir do nome do frame):
   - **`{page}`** (kebab-case) → vira pasta em `src/views/{Page}/` e `src/assets/images/{page}/`
   - **`{rota}`** (ex: `/dashboard`) → vira `src/pages/{Page}.vue`
3. Definir caminhos finais:
   ```
   manifesto:   docs/build-manifest-{page}.md
   views:       src/views/{Page}/
   pagina:      src/pages/{Page}.vue
   imagens:     src/assets/images/{page}/
   icones-svg:  src/assets/icons/{page}/
   icones-vue:  src/components/icons/
   screenshots: docs/figma/{page}-*.webp
   ```

### Passo 2 — Reconhecimento

1. `mcp__claude_ai_Figma__get_metadata` no frame raiz → estrutura geral, lista de children.
2. `mcp__claude_ai_Figma__get_variable_defs` → tokens (cores, tipografia, spacing).
3. **Screenshot do overview via REST API** (scale=1.5, WebP — NÃO usar `get_screenshot` que retorna 1x borrado):

   ```bash
   node .claude/skills/figma/extract-screenshots.mjs \
     --url "<figma-url>" \
     --output docs/figma \
     --prefix {page}- \
     --name overview \
     --scale 1.5
   ```

   → produz `docs/figma/{page}-overview.webp`.

### Passo 3 — Tokens

1. Ler `src/assets/tailwind.css` (fonte única de tokens — Tailwind v4 CSS-first, sem `tailwind.config.js`).
2. Pra cada token retornado em `get_variable_defs`:
   - Existe? → marcar como "reusado" no manifesto.
   - Não existe? → ADICIONAR em `src/assets/tailwind.css` como CSS variable dentro de `@theme` ou `:root`. NUNCA valor inline.
3. Registrar text-styles novos como `@utility text-{categoria}-{numero}` em `tailwind.css`.
4. Listar TODOS os tokens (reusados e adicionados) na seção `## Tokens` do manifesto.

### Passo 4 — Inventário de seções

1. **Listar children verticais do frame raiz** na ordem visual a partir do `get_metadata`:
   ```
   Inventário da página {page}:
   1. Navbar       (node-id 100:200)
   2. Hero         (node-id 100:201)
   3. Metricas     (node-id 100:202)
   4. Tabela       (node-id 100:203)
   5. CTA          (node-id 100:204)
   Total: 5 seções. Confirma? (sim/ajustar)
   ```
2. **Mostrar ao usuário e AGUARDAR confirmação.** Sem confirmação, não prosseguir.
3. Anotar o node-id de cada seção confirmada.
4. **Capturar screenshots de TODAS as seções numa chamada batch** via REST API:

   ```bash
   node .claude/skills/figma/extract-screenshots.mjs \
     --file-key <fileKey> \
     --node-id "<id1>=hero,<id2>=metricas,<id3>=tabela,..." \
     --output docs/figma \
     --prefix {page}- \
     --scale 1.5
   ```

   → produz `docs/figma/{page}-{secao}.webp` para cada seção.

### Passo 5 — Extração de ícones (padrão Vue — SVG inline em `.vue`)

**Padrão único do projeto** (verificado em RULES.md → R7): SVG inline em `.vue` em `src/components/icons/`. NUNCA biblioteca de ícones (Lucide, Heroicons, Material, etc.). NUNCA sprite. NUNCA `?raw`.

**Fluxo:**

1. Detectar se o design tem ícones (instâncias `INSTANCE` em `get_metadata`).
2. Garantir que a pasta existe: `mkdir -p src/assets/icons/{page}`.
3. Rodar `/icon-extract` no formato **`svg-files`** apontando pra pasta da página:
   ```bash
   node .claude/skills/icon-extract/extract-icons.mjs \
     --url "<figma-url>" \
     --output src/assets/icons/{page} \
     --format svg-files \
     --verbose
   ```
4. Para cada SVG extraído, criar o componente Vue correspondente em `src/components/icons/{IconName}.vue`:
   ```vue
   <!-- src/components/icons/ArrowRight.vue -->
   <template>
     <svg
       xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 24 24"
       fill="currentColor"
       v-bind="$attrs"
     >
       <!-- conteúdo SVG extraído -->
       <path d="..." />
     </svg>
   </template>
   ```
   - `fill="currentColor"` (ou `stroke="currentColor"` conforme o ícone) → herda `text-{cor}` do pai
   - `v-bind="$attrs"` → permite passar `class`, `aria-hidden`, `aria-label`, etc.
   - Verificar se o componente já existe em `src/components/icons/` — se existir, REUSAR (não duplicar)

5. Listar TODOS os ícones na seção `## Ícones` do manifesto, com import path canônico:
   ```
   - arrow-right.svg → src/components/icons/ArrowRight.vue
     import: import ArrowRight from '@/components/icons/ArrowRight.vue'
     usado em: Hero, CTA
   - check.svg → src/components/icons/Check.vue
     import: import Check from '@/components/icons/Check.vue'
     usado em: Metricas
   ```
6. Padrão de uso esperado no SFC (referência pra section-builder, não código que você escreve agora):
   ```vue
   <script setup>
   import ArrowRight from '@/components/icons/ArrowRight.vue'
   </script>

   <template>
     <ArrowRight class="w-5 h-5 text-primary" aria-hidden="true" />
   </template>
   ```

**HARD FAIL**: se design tem ícones e extração falhou (0 SVGs gerados), ABORTAR. Não prosseguir sem ícones reais. O hook `check-icons.mjs` bloqueia Write/Edit com imports de bibliotecas de ícones — não tentar contornar.

### Passo 6 — Imagens por seção

Para cada seção do inventário:

1. `mcp__claude_ai_Figma__get_design_context` do node-id da seção.
2. Identificar image-fills (URLs do Figma).
3. Baixar para `src/assets/images/{page}/` com nome descritivo (`hero-bg.webp`, `metricas-card-1.webp`).
4. Listar no manifesto na seção `## Imagens > {SecaoNome}`.

**Padrão de uso no SFC** (referência — não escrever agora):
```vue
<script setup>
import heroImg from '@assets/images/{page}/hero-bg.webp'
</script>

<template>
  <img :src="heroImg" alt="Descrição em PT-BR" loading="lazy" />
</template>
```

- NUNCA query transforms (`?w=`, `?format=`) — `vite-imagetools` não está no projeto
- NUNCA `src` com template literal (`:src="\`img\`"`) — usar binding direto (`:src="heroImg"`)
- `alt` OBRIGATÓRIO em PT-BR descritivo (R6)
- Hero: `fetchpriority="high"` (acima da dobra); demais: `loading="lazy"`

Se imagem é decorativa (não-essencial), incluir mesmo assim — section-builder decide se usa.

### Passo 7 — Inventário e SPEC de componentes shared

Esta fase NÃO cria arquivos em `src/components/`. Quem cria é `/build-components` consumindo as **specs** geradas aqui.

**Critérios para "vira shared" — avaliados em ordem; primeiro match vence:**

1. **Match com componente já em `src/components/ui/`** (shadcn-vue kit — `@components/` alias):
   - Listar via `Glob src/components/ui/**/*.vue`
   - Se design pede `Button` e existe `src/components/ui/button.vue` → **REUSAR**, apenas declarar em `## Componentes shadcn-vue reusados`.
   - Se o uso pede prop nova não suportada, marcar `evolucao_pedida: [prop_x]`.
2. **Match com componente custom já em `src/components/`** (componentes do projeto, alias `@/components/`):
   - `Glob src/components/**/*.vue` (excluindo `ui/` e `icons/`)
   - Match: **REUSAR**, sinalizar evolução se necessário.
3. **Match com componente em outro `docs/build-manifest-*.md`** → **REUSAR**, sinalizar cross-page reuse.
4. **Uso real ≥ 2 seções distintas DESTA página** + mesma estrutura visual → cria slot novo.
5. **Component set no Figma** (variants explícitas em `componentPropertyDefinitions`) **E uso ≥ 2** → cria slot novo.
6. **Caso contrário** → **NÃO cria slot.** Marca como `local: inline` na seção que usa.

**Nome semântico no Figma NÃO basta por si só.** Sem match com componente existente (regras 1-3) e sem 2+ usos reais (regras 4/5), a estrutura fica inline.

**Inferência da spec (Figma):**

1. **Code Connect** (`mcp__claude_ai_Figma__get_code_connect_map`) se existir → `spec_confidence: alta`
2. **Component set** + `componentPropertyDefinitions` (`get_metadata`) → `spec_confidence: alta`
3. **`get_design_context`** no node do componente (1x por componente) → `spec_confidence: media`
4. **Fallback heurístico** + perguntar humano → `spec_confidence: baixa | media`

**Contagem de usos (obrigatória antes de gerar spec):**

Para cada candidato a shared (critérios 4/5), contar mecanicamente percorrendo `## Inventário de seções` quantas seções distintas usam a mesma estrutura. Registrar:
- `usos_contados: N`
- `aparicoes: [...]` — lista de `{secao}: {N instâncias}`

Se `usos_contados < 2` E não bate nas regras 1-3 → **NÃO escreve spec em `## Componentes shared — specs`**. Em vez disso, gera entry em `## Estruturas inline-only`.

Pra cada componente que **passou** (critérios 4/5 com `usos_contados ≥ 2`), **gerar SPEC** no manifesto:

```markdown
### MetricCard

- arquivo_destino: src/components/MetricCard/MetricCard.vue
- figma_node_id: "100:850"
- screenshot: docs/figma/{page}-component-metric-card.webp
- usos_contados: 3
- aparicoes:
  - Metricas (4 instâncias)
  - Dashboard (1 instância)
- props:
  - label: string — required
  - valor: string | number — required
  - variacao: number — opcional, default 0
  - variant: 'positivo' | 'negativo' | 'neutro' — opcional, default 'neutro'
- emits: []
- slots: nenhum
- tokens_usados: text-headline-sm, text-body-md, color-verde-500, color-vermelho-500
- depende_de: []
- exemplo_uso: |
  <MetricCard label="Rendimento" :valor="12.5" :variacao="2.3" variant="positivo" />
- spec_confidence: alta | media | baixa
- spec_source: code_connect | component_set | design_context | heuristica_humana
- comportamento: apenas display, sem interatividade
- responsivo: Desktop = 240px largura; Mobile = 100% via grid
- a11y: aria-label no card se não tem texto além do valor
```

Para estruturas com `usos_contados < 2`, gerar entry em `## Estruturas inline-only`:

```markdown
### FiltroAvancado

- usos_contados: 1
- aparicoes:
  - Tabela (1 instância)
- motivo: "Aparece só em Tabela. Manter inline conforme RULES R4b-extract."
- recomendacao: inline-na-secao
- figma_node_id: "100:851"
- screenshot: docs/figma/{page}-component-filtro-avancado.webp
- tokens_usados: text-body-sm, color-neutral-300
```

Capturar screenshot do node-componente:

```bash
node .claude/skills/figma/extract-screenshots.mjs \
  --file-key <fileKey> \
  --node-id "<comp-node-id>=component-{kebab-comp-name}" \
  --output docs/figma \
  --prefix {page}- \
  --scale 1.5
```

### Passo 8 — Stubs de página e views

1. Criar `src/pages/{Page}.vue` com placeholders comentados:
   ```vue
   <script setup>
   import DefaultLayout from '@layout/DefaultLayout.vue'
   // TODO: importar views conforme forem implementadas
   // import Hero from '@views/{Page}/Hero.vue'
   // import Metricas from '@views/{Page}/Metricas.vue'
   </script>

   <template>
     <DefaultLayout>
       <main>
         <!-- <Hero /> -->
         <!-- <Metricas /> -->
         <!-- <Tabela /> -->
       </main>
     </DefaultLayout>
   </template>
   ```
2. Criar `src/views/{Page}/` (pasta vazia — as views são criadas pelo `/build-page`).

### Passo 9 — Escrever o manifesto

Criar `docs/build-manifest-{page}.md` com este esquema EXATO (Fase 2 e 3 dependem dele):

```markdown
# Build Manifest — {Page}

> Gerado por /build-prep em {YYYY-MM-DD HH:MM}
> Figma: {url}
> Para implementar: `/build-components {page}` → `/build-page {page}`

## Identificação
- Page: {page}
- Pasta de views: src/views/{Page}/
- Página (rota): src/pages/{Page}.vue
- Rota: {rota}

## Frame raiz Figma
- URL: {url}
- Node ID: {nodeId}
- Screenshot: docs/figma/{page}-overview.webp

## Tokens

### Adicionados
- `--brand-primary`: #...
- `text-headline-1`: 36px/44px/700

### Reusados (já existiam)
- `--neutral-80`
- `text-paragraph-4`

## Ícones
- Método: **SVG inline em `.vue`** em `src/components/icons/` — padrão único do projeto (R7)
- SVGs raw: `src/assets/icons/{page}/`
- Total: N
- Lista (com import path canônico, nome em PascalCase):
  - `arrow-right.svg` → `src/components/icons/ArrowRight.vue`
    `import ArrowRight from '@/components/icons/ArrowRight.vue'`
    usado em: Hero, CTA
  - `check.svg` → `src/components/icons/Check.vue`
    `import Check from '@/components/icons/Check.vue'`
    usado em: Metricas
- Padrão de uso:
  ```vue
  <ArrowRight class="w-5 h-5 text-primary" aria-hidden="true" />
  ```

## Imagens

### Hero
- src/assets/images/{page}/hero-bg.webp
- src/assets/images/{page}/hero-deco.svg

### Metricas
- src/assets/images/{page}/metricas-card-1.webp

## Componentes shadcn-vue reusados
- `@components/button` → botões de CTA
- `@components/card` → cards de seção
  - evolucao_pedida: [variant: 'highlight']  ← se design pede prop nova, marcar aqui

## Componentes custom existentes reusados
- `@/components/Navbar/Navbar.vue` → barra de navegação global

## Componentes shared — specs
> Specs consumidas por `/build-components`. Status muda pra `implementado` quando o subagente cria o arquivo.

### MetricCard

- arquivo_destino: src/components/MetricCard/MetricCard.vue
- figma_node_id: "100:850"
- screenshot: docs/figma/{page}-component-metric-card.webp
- aparicoes: Metricas (4), Dashboard (1)
- props:
  - label: string — required
  - valor: string | number — required
  - variacao: number — opcional
- spec_confidence: alta | media | baixa
- spec_source: code_connect | component_set | design_context | heuristica_humana
- depende_de: []
- status: proposto    ← vira "implementado" após /build-components

## Componentes — checkpoint humano
> Só preencher se algum componente ficou com `spec_confidence: baixa`.

- MetricCard (baixa) → revisado em {YYYY-MM-DD}; spec validada visualmente vs design

## Estruturas inline-only (não viraram shared)

### FiltroAvancado
- usos_contados: 1
- aparicoes: Tabela (1)
- motivo: "Aparece só em Tabela. Manter inline conforme RULES R4b-extract."
- recomendacao: inline-na-secao

## Inventário de seções

| # | Nome | node-id | Arquivo | Reusa | Paralelizável | Notas |
|---|------|---------|---------|-------|---------------|-------|
| 1 | Navbar | 100:200 | src/views/{Page}/Navbar.vue | Navbar.vue (custom) | NÃO (serial) | depende de links |
| 2 | Hero | 100:201 | src/views/{Page}/Hero.vue | Button (shadcn) | SIM | screenshot: {page}-hero.webp |
| 3 | Metricas | 100:202 | src/views/{Page}/Metricas.vue | MetricCard | SIM | 4 cards via prop |
| 4 | Tabela | 100:203 | src/views/{Page}/Tabela.vue | - | SIM | FiltroAvancado inline |
| 5 | CTA | 100:204 | src/views/{Page}/CTA.vue | Button (shadcn) | SIM | - |

## Plano de execução (Fase 3 — `/build-page`)

1. **Batch paralelo (3)**: Hero, Metricas, Tabela
2. **Batch paralelo (1)**: CTA
3. **Serial**: Navbar (depende de links das seções)

## Critério de aceite por seção

- Pixel-perfect contra screenshot da seção (`docs/figma/{page}-{secao}.webp`)
- ZERO arbitrários em cor/tipografia (R1, R2)
- Imagens via import URL + `:src` binding, `alt` PT-BR descritivo (R6)
- Ícones via `@/components/icons/{Name}.vue` (SVG inline) — NUNCA biblioteca, NUNCA sprite (R7)
- Desktop-first com `max-md:`/`max-lg:` (R8)
- Semântica HTML5: `<section>`, `<main>`, headings sem pulo de nível (R10)

## Stubs criados
- `src/pages/{Page}.vue` (placeholders comentados)
- `src/views/{Page}/` (pasta vazia)

## Status

### Components (preenchido por /build-components)
- [ ] MetricCard
- ...

### Views (preenchido por /build-page)
- [ ] Hero
- [ ] Metricas
- [ ] Tabela
- [ ] CTA
- [ ] Navbar
- [ ] Validação build/lint
- [ ] Code review
```

### Passo 10 — Gate de auditoria (HARD — aborta se falhar)

Antes de mostrar resumo final, validar **todos** os itens:

```markdown
## Auditoria automática

- [ ] Tokens injetados: tailwind.css tem ≥1 CSS var nova (ou zero tokens novos detectados — OK)
- [ ] Ícones extraídos: count em src/assets/icons/{page}/ ≥ count de ícones únicos do design
- [ ] Ícones Vue criados: count em src/components/icons/ ≥ ícones extraídos (NÃO contar pré-existentes duplicados)
- [ ] Nenhum ícone Vue usa biblioteca (check-icons.mjs valida no write — mas auditar manualmente)
- [ ] Imagens baixadas: src/assets/images/{page}/ tem N arquivos onde N ≥ image-fills detectados
- [ ] Screenshots de seção: docs/figma/{page}-{secao}.webp existe para cada seção do inventário
- [ ] Specs completas: cada componente em "Componentes shared — specs" tem props, spec_confidence ∈ {alta, media, baixa}
- [ ] Specs baixa + checkpoint: cada componente baixa tem entry em "Componentes — checkpoint humano"
- [ ] Stub de página criado: src/pages/{Page}.vue existe
- [ ] Pasta de views criada: src/views/{Page}/ existe
```

Se TUDO ✅ → mostra resumo final + sugere `/build-components {page}`.
Se ALGUM ❌ → ABORTA com diagnóstico (qual gate falhou + ação sugerida), NÃO sugere próximo comando.

### Passo 11 — Output final ao usuário

Mostrar resumo curto:

```markdown
## /build-prep concluído — {page}

✓ Tokens: N adicionados, M reusados (em src/assets/tailwind.css)
✓ Ícones: N extraídos → src/assets/icons/{page}/
  N componentes Vue criados em src/components/icons/ (SVG inline, fill="currentColor")
✓ Imagens: N em src/assets/images/{page}/
✓ Screenshots: N+1 capturados (overview + N seções) em docs/figma/ @ scale=1.5 WebP
✓ Inventário: N seções (M paralelizáveis, K seriais)
✓ Componentes shared — specs: N (X alta, Y media, Z baixa+checkpoint)
✓ Manifesto: docs/build-manifest-{page}.md
✓ Stub da página: src/pages/{Page}.vue
✓ Pasta de views: src/views/{Page}/
✓ Auditoria: TODOS os gates passaram

**Próximos passos (3 fases sequenciais):**

  1. Revisar `docs/build-manifest-{page}.md` (~5 min)
     - Conferir specs de componentes (props, variants)
     - Confirmar estrutura do inventário de seções
  2. /build-components {page} ← implementa componentes shared (serial topológico)
  3. /build-page {page}       ← orquestra views paralelas consumindo componentes

Se algo precisa ajustar (inventário, specs), editar o manifesto manualmente antes — fases seguintes leem como fonte de verdade.
```

---

## Restrições

- **NÃO** gerar `.vue` de seção/view (papel de `/build-page`)
- **NÃO** criar componentes em `src/components/` além de ícones em `src/components/icons/` (papel de `/build-components`)
- **NÃO** usar `@components/` para componentes custom — esse alias aponta para `src/components/ui/` (shadcn-vue APENAS)
- **NÃO** marcar nada como done no checklist
- **NÃO** rodar `bun run build` ou `bun run lint`
- **NÃO** disparar `review` agent
- **NÃO** prosseguir sem confirmação do inventário (Passo 4)
- **NÃO** prosseguir se ícones não foram extraídos com sucesso (HARD FAIL no Passo 5)
- **NÃO** prosseguir se gate de auditoria (Passo 10) falhar
- **NÃO** usar query transforms em imagens (`?w=`, `?format=`, etc.) — `vite-imagetools` não está no projeto
- **NÃO** importar SVGs com `?raw` ou qualquer query — SVG vai inline no `.vue`

## Anti-alucinação

- Ler UMA seção por vez com `get_design_context` — NÃO passar todos nodes juntos
- Screenshot ANTES de `get_design_context` detalhado — imagem é mais confiável que árvore de nodes
- Se `get_metadata` retornar > 10k tokens, usar filtros (depth, name-filter)
- Texto literal vem do `get_design_context`, NÃO do screenshot — campos de texto são fonte de verdade. Inferir texto a partir de imagem quebra R13 (texto literal)
- Verificar se componente de ícone já existe em `src/components/icons/` antes de criar — não duplicar

## Referências

- Workflow técnico Figma: `.claude/skills/figma/SKILL.md`
- Extração de ícones: `.claude/skills/icon-extract/SKILL.md`
- Regras universais: `.claude/RULES.md`
- Próxima fase (componentes): `.claude/commands/build-components.md`
- Fase final (views/seções): `.claude/commands/build-page.md`
