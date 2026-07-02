# Build Manifest — Chat

> Gerado por /build-prep em 2026-07-01 23:20
> Figma: https://www.figma.com/design/fJbXPjDPSgMJVqXBB0XTEx/AI-Invest?node-id=42-12901&m=dev
> Para implementar: `/build-components chat` → `/build-page chat`

## ⚠️ Desvio do padrão do comando — leia antes de rodar as próximas fases

Esta é a primeira página do projeto (`src/pages/`, `src/views/`, `src/router` estavam vazios). O frame Figma embute **casca de app persistente** (Sidebar + Header) junto com o **conteúdo específico da rota `/`** (Chat). Decisão validada com o usuário: Sidebar e Header viram `src/layout/DefaultLayout.vue` desde já (o alias `@layout` já existia em `vite.config.js` esperando por isso), evitando duplicação quando a 2ª página for criada.

Consequência pro inventário abaixo: as linhas **Sidebar** e **Header** apontam pra `src/layout/`, não pra `src/views/Chat/`. `/build-components` e `/build-page` devem materializar os arquivos nos caminhos exatos da coluna "Arquivo", não assumir `src/views/{Page}/` para todas as linhas.

Também foi registrada a rota raiz em `src/router/index.js` (fora do escopo literal do `/build-prep`, mas necessário — sem isso a página ficaria inacessível já que o router estava com `routes: []`).

## Identificação
- Page: chat
- Pasta de views: src/views/Chat/
- Layout compartilhado (novo): src/layout/
- Página (rota): src/pages/Chat.vue
- Rota: `/`

## Frame raiz Figma
- URL: https://www.figma.com/design/fJbXPjDPSgMJVqXBB0XTEx/AI-Invest?node-id=42-12901&m=dev
- Node ID: 42:12901 ("DesktopAppLayout")
- Screenshot: docs/figma/chat-overview.webp

## Tokens

### Adicionados (`src/assets/tailwind.css`)
- `--font-inter`: "Inter", sans-serif (Inter já carregado via Google Fonts em `main.css`, faltava alias no `@theme`)
- `--tracking-label`: 0.07px (botões, breadcrumb, perfil)
- `--tracking-caption`: 0.18px (legenda do plano no perfil)
- `--color-card-border`: rgba(64,64,64,0.25) (borda dos banners/botões-ícone com gradiente)
- `--color-input-border`: rgba(226,232,240,0.15) (borda dos inputs de busca/chat)
- `--color-btn-light`: #f1f5f9 (fundo dos botões claros — Buscar, enviar)
- `text-headline-1` — hero base, 35px SF Pro Light, `leading-display`, `tracking-ui`
- `text-headline-1-strong` — hero destaque ("ajudar"), 35px SF Pro Semibold, mesma leading/tracking
- `text-paragraph-1` — 12px SF Pro Light, `tracking-ui` (subtítulo do chat, descrição do card, disclaimer)
- `text-paragraph-2` — 12px SF Pro Medium, `tracking-ui` (título do card de sugestão)
- `text-paragraph-3` — 14px Inter Regular (placeholder dos inputs)
- `text-paragraph-4` — 14px Inter Medium, `tracking-label` (texto de botão — Buscar, enviar)
- `text-paragraph-5` — 14px ABeeZee Regular, `tracking-label` (breadcrumb ativo — "Home Chat")
- `text-paragraph-6` — 14px `font-sans` Medium, `tracking-label` (separador breadcrumb "/" — substitui Geist por decisão do usuário, fonte não é prioridade nesta etapa)
- `text-paragraph-7` — 14px Lato Regular, `tracking-label` (nome do perfil — "Frederico")
- `text-paragraph-8` — 12px Lato Regular, `tracking-caption` (plano do perfil — "Plano X")

### Reusados (já existiam)
- `--text-hero` (2.1875rem / 35px)
- `--color-surface-2` (#151515 — gradiente dos cards/botões)
- `--color-app-bg` (#090a0a)
- `--muted-foreground` (#737373)
- `--primary` / `--accent` / `--ring` (#e1ff06 — amarelo-lima de destaque)
- `--font-sans`, `--font-lato`, `--font-abeezee`
- `--leading-display` (1.19), `--tracking-ui` (0.04px)
- `--radius-lg` (8px), `--border`

## Ícones
- Método: **SVG inline em `.vue`** em `src/components/icons/` — padrão único do projeto (R7)
- SVGs raw: `src/assets/icons/layout/` (Sidebar/Header) e `src/assets/icons/chat/` (Chat)
- Total: 8 (`chat-circle-dots` reusado 2x — botão do Sidebar e banner 1 do Chat)
- Nota técnica: `menu-fold`, `chat-circle-dots` e `alerta` são nós `FRAME` no Figma (não `INSTANCE`), fora do alcance do scan automático padrão de `/icon-extract` (que só detecta `INSTANCE` 16-32px). Exportados via chamada direta à Images API do Figma nos node-ids identificados manualmente em `get_design_context`. `home` foi exportado a partir do node-id de instância `I42:12994;763:47340` (o node canônico `8:342` "Icon / HomeOutlined" não retornou URL exportável — componente de biblioteca externa referenciado só por descrição).
- Lista:
  - `menu-fold.svg` → `src/components/icons/MenuFold.vue`
    `import MenuFold from '@/components/icons/MenuFold.vue'`
    usado em: Sidebar (toggle do menu)
  - `chat-circle-dots.svg` → `src/components/icons/ChatCircleDots.vue`
    `import ChatCircleDots from '@/components/icons/ChatCircleDots.vue'`
    usado em: Sidebar (botão de chat), Chat (banner 1 "Análise Fundamentalista")
  - `alerta.svg` → `src/components/icons/Alerta.vue`
    `import Alerta from '@/components/icons/Alerta.vue'`
    usado em: Sidebar (botão de notificação)
  - `card-stack-minus.svg` → `src/components/icons/CardStackMinus.vue`
    `import CardStackMinus from '@/components/icons/CardStackMinus.vue'`
    usado em: Sidebar (botão 3)
  - `home.svg` → `src/components/icons/Home.vue`
    `import Home from '@/components/icons/Home.vue'`
    usado em: Header (breadcrumb)
  - `mask-on.svg` → `src/components/icons/MaskOn.vue`
    `import MaskOn from '@/components/icons/MaskOn.vue'`
    usado em: Chat (banner 2 "Análise Fundamentalista")
  - `loop.svg` → `src/components/icons/Loop.vue`
    `import Loop from '@/components/icons/Loop.vue'`
    usado em: Chat (banner 3 "Análise Fundamentalista")
  - `font-style.svg` → `src/components/icons/FontStyle.vue`
    `import FontStyle from '@/components/icons/FontStyle.vue'`
    usado em: Chat (banner 4 "Análise Fundamentalista")
- Padrão de uso:
  ```vue
  <ChatCircleDots class="w-4 h-4 text-white" aria-hidden="true" />
  ```

## Imagens

### Layout (Sidebar/Header)
- `src/assets/images/layout/logo.webp` — marca do app, Sidebar (topo)

**Nota:** o "avatar" do perfil no Header (node `42:13006`) é, na verdade, um círculo SVG sólido `fill="var(--fill-0, #E1FF06)"` — sem foto real. Não baixado como imagem; implementar como `<div class="size-8 rounded-full bg-primary" />` (ou compor `@components/avatar` do shadcn-vue com esse fundo), evitando asset desnecessário.

### Chat
- `src/assets/images/chat/chat-bg.webp` — textura de fundo do estado vazio de boas-vindas. Acima da dobra → usar `fetchpriority="high"`.

## Componentes shadcn-vue reusados
- `@components/avatar` → avatar do perfil no Header (compor com fundo `bg-primary`, ver nota acima)
- `@components/input` → campo de busca do Header ("Pesquisar histórico") e campo de mensagem do Chat ("Fale com nossa IA...")
- `@components/button` → botão "Buscar" (Header), botão "?" (Chat), avaliar como base pros 3 botões-ícone do Sidebar
- `@components/card` → avaliar como base pros 4 banners "Análise Fundamentalista" do Chat (senão, `<div>` inline com `v-for`)

## Componentes custom existentes reusados
- Nenhum (primeira página do projeto)

## Componentes shared — specs
> Nenhum componente cruza 2+ seções desta página com estrutura idêntica. O candidato inicial ("Menu Item - Perfil" duplicado no Sidebar) foi descartado — confirmado com o usuário que o perfil só existe no Header (o node do Figma no Sidebar é um artefato de layer, cortado por `overflow` num container de 53px, não aparece no design renderizado).

## Componentes — checkpoint humano
> Nenhum componente com `spec_confidence: baixa` — não há specs shared nesta página.

## Estruturas inline-only (não viraram shared)

### Banner de sugestão (Chat)
- usos_contados: 4 (dentro de 1 seção só — Chat)
- aparicoes: Chat (4)
- motivo: "Repetição via v-for dentro da mesma seção, não cruza 2+ seções (RULES R4b)."
- recomendacao: inline-na-secao (avaliar `@components/card` como base)
- figma_node_id: "42:12910" (Banner 1, referência de estrutura — 42:12916/42:12922/42:12928 são as demais)
- screenshot: docs/figma/chat-chat.webp
- tokens_usados: text-paragraph-2, text-paragraph-1, color-card-border, color-surface-2, radius-md

### Botão-ícone (Sidebar)
- usos_contados: 3 (dentro de 1 seção só — Sidebar)
- aparicoes: Sidebar (3)
- motivo: "Repetição via v-for dentro da mesma seção, não cruza 2+ seções (RULES R4b)."
- recomendacao: inline-na-secao (avaliar `@components/button` variant ghost/icon como base)
- figma_node_id: "42:12948" (referência de estrutura — 42:12951/42:12954 são os demais)
- screenshot: docs/figma/chat-sidebar.webp
- tokens_usados: color-card-border, color-surface-2, radius-md

## Inventário de seções

| # | Nome | node-id | Arquivo | Reusa | Paralelizável | Notas |
|---|------|---------|---------|-------|----------------|-------|
| 1 | Sidebar | 42:12939 | `src/layout/Sidebar.vue` | ícones MenuFold/ChatCircleDots/Alerta/CardStackMinus, logo.webp | NÃO (base do layout) | SEM avatar/perfil (artefato descartado) |
| 2 | Header | 42:12990 | `src/layout/Header.vue` | ícone Home, `@components/avatar`, `@components/input`, `@components/button` | NÃO (base do layout, depende de Sidebar pro grid geral) | breadcrumb + busca + perfil |
| 3 | Chat | 42:12903 | `src/views/Chat/Chat.vue` | ícones ChatCircleDots/MaskOn/Loop/FontStyle, chat-bg.webp, `@components/input`, `@components/button`, avaliar `@components/card` | SIM (independe do layout pra ser implementada) | estado vazio: hero + 4 cards + input + disclaimer |

## Plano de execução (Fase 3 — `/build-page`)

1. **Serial**: Sidebar → Header (compõem `src/layout/DefaultLayout.vue`, base de toda a aplicação)
2. **Batch paralelo (1)**: Chat (independente do layout, pode rodar em paralelo às duas primeiras se o orquestrador suportar; senão, roda depois)

## Critério de aceite por seção

- Pixel-perfect contra screenshot da seção (`docs/figma/chat-{secao}.webp`)
- ZERO arbitrários em cor/tipografia (R1, R2)
- Imagens via import URL + `:src` binding, `alt` PT-BR descritivo (R6)
- Ícones via `@/components/icons/{Name}.vue` (SVG inline) — NUNCA biblioteca, NUNCA sprite (R7)
- Desktop-first com `max-md:`/`max-lg:` (R8)
- Semântica HTML5: `<aside>`/`<nav>` pro Sidebar, `<header>` pro Header, `<main>`/`<section>` pro Chat, headings sem pulo de nível (R10)
- Componentes complexos (banners, botões-ícone, perfil) compõem `src/components/ui/` (shadcn-vue) como blocos de base em vez de recriar do zero (instrução explícita do usuário)

## Stubs criados
- `src/pages/Chat.vue` (placeholder comentado, importa `@layout/DefaultLayout.vue`)
- `src/layout/DefaultLayout.vue` (placeholder comentado, importa `Sidebar`/`Header`)
- `src/views/Chat/` (pasta vazia)
- `src/router/index.js` — rota `/` → `chat` registrada (extra, fora do escopo literal do comando)

## Status

### Components (preenchido por /build-components)
- (nenhum — zero specs shared nesta página)

### Views (preenchido por /build-page)
- [ ] Sidebar
- [ ] Header
- [ ] Chat
- [ ] Validação build/lint
- [ ] Code review
