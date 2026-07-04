# Build Manifest — Login

> Gerado por /build-prep em 2026-07-04 12:53
> Figma: https://www.figma.com/design/5kVpGrF2eju1F0CpYQOVJT/AI-investe---jefferson?node-id=42-13035&m=dev
> Para implementar: `/build-components login` → `/build-page login`

## ⚠️ Desvio do padrão do comando — leia antes de rodar as próximas fases

1. **Nome do arquivo de página:** o padrão real do projeto (confirmado em `PageChat.vue`, `PageAlertas.vue`, `PageCarteiras.vue`) é `src/pages/Page{Nome}.vue`, não `src/pages/{Page}.vue` como o template do skill assume. Este manifesto já usa o nome real: `src/pages/PageLogin.vue`.
2. **Rota fora do `DefaultLayout`:** a rota raiz `/` usa `src/layout/DefaultLayout.vue` (shell autenticado com Sidebar + Header) e todas as páginas existentes são `children` dela. A tela de Login é pública e full-bleed (sem sidebar/chat shell) — foi registrada como rota-irmã, direto no array `routes` de `src/router/index.js` (fora do escopo literal do `/build-prep`, mas necessário pra não deixar a página inacessível):
   ```js
   {
     path: "/login",
     name: "login",
     component: () => import("@pages/PageLogin.vue"),
   }
   ```
3. **`PageLogin.vue` não importa `DefaultLayout`** — é uma tela standalone, diferente do stub padrão do skill (que assume toda página dentro do shell).

## Identificação
- Page: login
- Pasta de views: src/views/Login/
- Página (rota): src/pages/PageLogin.vue
- Rota: `/login`

## Frame raiz Figma
- URL: https://www.figma.com/design/5kVpGrF2eju1F0CpYQOVJT/AI-investe---jefferson?node-id=42-13035&m=dev
- Node ID: 42:13035 ("DesktopAppLayout")
- Screenshot: docs/figma/login-overview.webp

## Tokens

### Adicionados (`src/assets/tailwind.css`)
- `--color-input-outline`: #d6d6d6 (borda dos campos de e-mail/senha + cor do texto placeholder, 42:13155/42:13156)
- `--text-auth-hero`: 3rem / 48px (headline "Inteligência artificial...", 42:13175 — não confundir com `--text-hero` de 35px, já usado pelo Chat)
- `--text-auth-subheading`: 1.5rem / 24px (subtexto do painel de branding, 42:13178)
- `text-auth-hero` — 48px SF Pro Light(300), `tracking-ui`, leading normal (peso base da headline)
- `text-auth-hero-strong` — 48px SF Pro Semibold(600), mesma leading/tracking (palavra "artificial")
- `text-auth-subheading` — 24px SF Pro Light(300), `tracking-ui`, leading normal (subtexto)
- `text-auth-heading` — usa `--text-auth-heading` (26px) já existente, Lato Regular(400), leading normal ("Bem vindo de volta") — variável já existia, faltava a classe utility
- `text-auth-button` — 14px Lato Bold(700), leading normal ("Continuar com Google", "Clique aqui!")
- `text-auth-link` — 14px Lato Regular(400), leading normal ("Esqueceu a senha?")
- `text-auth-input` — 12px Lato Regular(400), leading normal (placeholder dos campos)
- `text-auth-cta` — 14px Poppins Medium(500), leading normal ("Faça seu cadastro")

### Reusados (já existiam)
- `--color-app-bg` (#090a0a — fundo do painel esquerdo)
- `--primary` (#e1ff06 — painel direito e palavra "artificial" na headline)
- `--color-card-border` (rgba(64,64,64,0.25) — borda do card de login)
- `--color-surface-2` (#151515 — fim do gradiente do card)
- `--color-input-bg` (#f6f6f6 — texto/borda do botão "Continuar com Google")
- `--color-on-light` (#353232 — texto do botão "Faça seu cadastro")
- `--spacing-nav-offset` (5.5rem/88px — padding-left do painel esquerdo, 42:13173)
- `--spacing-layout-gap` (3.1875rem/51px — gap entre headline/subtexto/lista, 42:13173)
- `--spacing-section-gap` (1.625rem/26px — gap entre os campos do form, 42:13146)
- `--font-sans`, `--font-lato`, `--font-poppins`
- `--tracking-ui` (0.04px)
- `text-paragraph-2` (12px SF Pro Medium, `tracking-ui`) — reuso EXATO pro label "Análise Fundamentalista" (43:13201/43:13207), nenhuma classe nova necessária

## Ícones
- Método: ícone de UI real (recolorável) → **SVG inline em `.vue`** em `src/components/icons/` (R7). Gráfico decorativo (marca/logo multicolor ou flatten de botão) → **asset estático** importado por URL e usado em `<img>` (exceção explícita da R7).
- SVGs raw: `src/assets/icons/login/`
- Total: 1 ícone de UI reusado + 3 assets decorativos novos
- Nota técnica: o scan automático do `/icon-extract` (só detecta nós `INSTANCE` 16–32px) encontrou apenas `design-mask-on`. O ícone do Google, o botão-seta circular de "Faça seu cadastro" e a marca "INVEST" são nós `VECTOR`/`FRAME` soltos (não `INSTANCE`) — exportados manualmente via `mcp__figma__download_assets` / URLs do `get_design_context`.
- Lista:
  - `design-mask-on` → **reusar** `src/components/icons/MaskOn.vue` (já existe, não duplicado)
    `import MaskOn from '@/components/icons/MaskOn.vue'`
    usado em: Branding (2 dos 3 itens da lista "Análise Fundamentalista")
  - `google-g.svg` → `src/assets/icons/login/google-g.svg` (decorativo, cores reais da marca Google — não usar `currentColor`)
    usado em: LoginForm (botão "Continuar com Google")
  - `cadastro-arrow.svg` → `src/assets/icons/login/cadastro-arrow.svg` (decorativo, círculo preto + seta branca, já flatten no Figma)
    usado em: LoginForm (botão "Faça seu cadastro")
  - `logo-invest-lockup.svg` → `src/assets/icons/login/logo-invest-lockup.svg` (decorativo, marca "INVEST" monocromática branca)
    usado em: LoginForm (topo do card)
- Padrão de uso (decorativo, via `<img>` — ver R7, exceção de logo/asset sem controle de cor):
  ```vue
  <script setup>
  import googleG from "@assets/icons/login/google-g.svg";
  </script>
  <template>
    <img :src="googleG" alt="" class="h-6 w-[27px]" aria-hidden="true" />
  </template>
  ```
- **Checar antes de usar em `/build-page`:** a marca "INVEST" da Sidebar (`src/assets/icons/layout/logo-investe_clean.svg`) é uma variante compacta (ícone sem texto, usada em w-10). `logo-invest-lockup.svg` é o lockup completo (barras + texto "INVEST"), asset distinto — não são intercambiáveis.

## Imagens

Nenhuma imagem raster (`.webp`) necessária nesta página — não há fotos/fills de imagem no frame.

**Nota — padrão de fundo do painel esquerdo:** o screenshot mostra um padrão de linhas conectadas (efeito "plexus"/partículas) sobre o fundo escuro. Esse padrão **não existe como layer/fill exportável** dentro do escopo do frame `DesktopAppLayout` (confirmado via `get_design_context` no nó raiz e no nó do painel, 42:13035 e 42:13173 — nenhum dos dois retorna imagem de fundo, só `bg-[#090a0a]` sólido). Prováveis hipóteses: efeito nativo do Figma não exportável via API, ou henerado por asset fora do escopo do frame. **Decisão para `/build-page`:** implementar como efeito visual (CSS/canvas/partículas) ou aproximar com gradiente, não tentar extrair como asset.

**Nota — item vazio na lista:** o 2º item da lista "Análise Fundamentalista" (node 43:13204) tem texto literal igual a um único espaço em branco no Figma (não um label real). Replicar como está — não inventar conteúdo (anti-alucinação).

## Componentes shadcn-vue reusados
- `@components/button` → botão "Continuar com Google" (variant custom com ícone), botão pill "Faça seu cadastro" (uso único cada, inline na view)
- `@components/input` + `@components/label` → campos "Digite seu e-mail" / "Digite sua senha" (2 usos na mesma seção — resolver com `v-for` local, não é candidato a shared por R4b-extract)

## Componentes custom existentes reusados
- Nenhum (`UserProfile` e `SuggestionCard`, únicos custom do projeto, não se aplicam a uma tela de login)

## Componentes shared — specs
> Nenhum componente cruza 2+ seções ou páginas desta feature com estrutura idêntica. Kit shadcn-vue (`button`, `input`, `label`) já cobre os elementos interativos da tela.

## Componentes — checkpoint humano
> Nenhum componente com `spec_confidence: baixa` — não há specs shared nesta página.

## Estruturas inline-only (não viraram shared)

### Campo de formulário (LoginForm)
- usos_contados: 2 (dentro de 1 seção só — LoginForm)
- aparicoes: LoginForm (2 — e-mail e senha)
- motivo: "Repetição via v-for dentro da mesma seção, não cruza 2+ seções (RULES R4b-extract)."
- recomendacao: inline-na-secao (`@components/input` + `@components/label` como base)
- figma_node_id: "42:13154" (Group 14 — e-mail; 43:13504 é o par da senha)
- screenshot: docs/figma/login-login-form.webp
- tokens_usados: text-auth-input, color-input-outline, radius-lg

### Item de lista com ícone (Branding)
- usos_contados: 3 (dentro de 1 seção só — Branding)
- aparicoes: Branding (3 — 2 com label, 1 vazio)
- motivo: "Repetição via v-for dentro da mesma seção, não cruza 2+ seções (RULES R4b-extract)."
- recomendacao: inline-na-secao (`v-for` sobre array local, ver nota do item vazio acima)
- figma_node_id: "43:13199" (Chart 1 — referência de estrutura; 43:13202/43:13205 são os demais)
- screenshot: docs/figma/login-branding.webp
- tokens_usados: text-paragraph-2, MaskOn.vue

## Inventário de seções

| # | Nome | node-id | Arquivo | Reusa | Paralelizável | Notas |
|---|------|---------|---------|-------|----------------|-------|
| 1 | Branding | 42:13173 | `src/views/Login/ViewLoginBranding.vue` | ícone MaskOn.vue | SIM | headline + subtexto + lista de 3 itens (1 vazio); fundo com padrão plexus não extraível (ver nota em Imagens) |
| 2 | LoginForm | 42:13143 | `src/views/Login/ViewLoginForm.vue` | `@components/button`, `@components/input`, `@components/label`, assets google-g/cadastro-arrow/logo-invest-lockup | SIM | card flutuante posicionado sobre a divisa dos 2 painéis (offset preciso do Figma — usar valores de posição arbitrários do design, exceção da R1 pra layout) |

O retângulo amarelo decorativo (`42:13172`) não é uma seção própria — vira split de background (CSS, `bg-primary`) no nível da página/view, composto junto com `ViewLoginBranding` ou na própria `PageLogin.vue`.

**Decisão de composição (fixada em `/build-page`, 2026-07-04):** `ViewLoginBranding.vue` possui o split de fundo full-bleed inteiro (painel escuro à esquerda com o conteúdo + retângulo `bg-primary` à direita como div irmã absoluta) — é o "chão" visual da tela. `ViewLoginForm.vue` contém SÓ o card flutuante, posicionado com `absolute` usando os offsets exatos do Figma (`left: calc(50% + 264.5px)`, `top: calc(50% + 0.5px)`, `-translate-x-1/2 -translate-y-1/2` — exceção de layout da R1), pra cair sobre a divisa quando empilhado como irmão de `ViewLoginBranding` dentro do `<main class="relative">` de `PageLogin.vue`.

## Plano de execução (Fase 3 — `/build-page`)

1. **Batch paralelo (2)**: Branding, LoginForm (independentes entre si, mas atenção ao posicionamento relativo do card sobre a divisa dos painéis — resolver via CSS na composição final)

## Critério de aceite por seção

- Pixel-perfect contra screenshot da seção (`docs/figma/login-{secao}.webp`)
- ZERO arbitrários em cor/tipografia (R1, R2) — exceção documentada pro posicionamento absoluto do card (R1, dimensionamento de layout)
- Ícone de UI (`MaskOn`) via `@/components/icons/MaskOn.vue` — NUNCA biblioteca (R7)
- Assets decorativos (`google-g`, `cadastro-arrow`, `logo-invest-lockup`) via `<img>` + `alt` PT-BR (vazio/`aria-hidden` se puramente decorativo, R6/R7)
- Formulário: `<form @submit.prevent>`, `<label for>` associado a cada input, `type="email"`/`type="password"`, `autocomplete` (R12)
- Desktop-first com `max-md:`/`max-lg:` (R8) — tela é desktop-only no Figma, mas ainda precisa de fallback mobile razoável
- Semântica HTML5: `<main>` na página, `<section>`/`<form>` nas views, `<h1>` único (headline do Branding), sem pular nível de heading (R10)
- Link "Esqueceu a senha?" e navegação de cadastro usam `<RouterLink>`, não `<a href>` (R10)

## Stubs criados
- `src/pages/PageLogin.vue` (placeholder comentado, SEM `DefaultLayout` — tela standalone)
- `src/views/Login/` (pasta vazia)
- `src/router/index.js` — rota `/login` registrada como irmã da raiz (extra, fora do escopo literal do comando, necessário pra não deixar a página inacessível)

## Status

### Components (preenchido por /build-components)
- (nenhum — zero specs shared nesta página)

### Views (preenchido por /build-page)
- [x] Branding
- [x] LoginForm
- [x] Validação build/lint
- [x] Code review — ver `docs/build-handoff-login.md`
