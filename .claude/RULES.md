# RULES.md — Fonte única de regras universais

Este arquivo é a **fonte única** de regras que valem pra qualquer página/componente deste projeto base. Skills e agents devem REFERENCIAR este arquivo, não repetir seu conteúdo.

Regras de nicho (GSAP, Swiper) ficam nos `.claude/commands/*.md` e só carregam quando o contexto pedir.

Lições que surgem de bugs concretos (testes intermediários de container, deltas de projeto) ficam no vault `.claude/learn/` (entrada: `.claude/learn/_index.json`).

---

## R1 — Valores Tailwind

**Regra:** ZERO valores arbitrários. Toda cor/tamanho/font vem de token CSS variable mapeado em `src/assets/tailwind.css`.

Isso inclui `flex-*`, `gap-*` e outros utilitários: **nunca** `[...]` arbitrário quando existe utilitário nomeado equivalente (ex.: `flex-[0_0_auto]` → `flex-none`).

❌ Errado:

```html
<div class="bg-[#46454d] text-[14px] p-[22px]">
  <div class="flex-[0_0_auto] self-stretch items-start"></div>
</div>
```

✅ Certo:

```html
<div class="bg-neutral-80 text-paragraph-4 p-6">
  <div class="flex-none items-start"></div>
</div>
```

**Por quê:** valores inline quebram consistência visual, travam o dark mode e contaminam o design system. Se o token não existe, CRIAR em `src/assets/tailwind.css` — nunca inline.

**Exceção:** dimensionamentos de layout específicos do design (`max-w-[900px]`, `w-[835px]`, `h-[460px]`) são aceitáveis quando vêm diretamente do Figma/Pencil e não existe utility Tailwind equivalente próximo. A proibição rígida é para **cores e tipografia** — esses NUNCA usam valores arbitrários.

---

## R2 — Tipografia

**Regra:** Todo elemento de texto usa UMA classe `text-{categoria}-{numero}` derivada do text-style do Figma/Pencil (`text-paragraph-4`, `text-headline-5`, etc.). Essas classes encapsulam font-family, font-weight, font-size, line-height, letter-spacing.

❌ Errado:

```html
<span
  class="[font-family:'Brandon_Text-Bold'] font-bold text-base tracking-[-0.01rem] leading-[6.25rem]"
  >10</span
>
<h1 class="font-sans text-4xl font-bold leading-tight">Título</h1>
```

✅ Certo:

```html
<span class="text-paragraph-4 text-neutral-80">10</span>
<h1 class="text-headline-5 text-white">TÍTULO</h1>
```

Se um `<span>` filho não tem text-style próprio no design, herda do nó-pai mais próximo que tenha.

**Proibição:** NUNCA adicionar `font-*`, `tracking-*`, `leading-*` sobre uma classe `text-*`. Se o design pede variação de peso ou tracking, criar text style dedicado no plugin Tailwind (`text-paragraph-4-bold`).

❌ Errado:

```html
<p class="text-paragraph-4 font-semibold tracking-wide">Conflito</p>
```

✅ Certo:

```html
<p class="text-paragraph-4-bold">Variação dedicada</p>
```

**Por quê:** overrides sobre `text-*` geram conflitos silenciosos.

---

## R3 — Containers

**Regra:** Qualquer layer chamado `container`/`conteiner` no design vira classe Tailwind `.container` — nunca valores inline de `max-w`/padding.

❌ Errado:

```html
<div
  class="flex-col max-w-[var(--standards-geral-container-width)] pr-[var(--standards-padding-container-x)] pl-[var(--standards-padding-container-x)]"
></div>
```

✅ Certo:

```html
<div class="container flex flex-col items-start gap-12 w-full"></div>
```

**Por quê:** `container` já está configurado no `src/assets/tailwind.css` com max-width e padding corretos. Repetir inline quebra quando o token muda.

> Testes intermediários entre breakpoints (overflow em ~1180–1792px) estão registrados em `.claude/learn/responsive/container-intermediate-viewports.md`.

---

## R4 — Imports & aliases

**Regra:** SEMPRE usar os aliases do `jsconfig.json`. NUNCA caminhos relativos.

> ⚠️ `@components` aponta SÓ pra `src/components/ui` (kit shadcn-vue). Componentes próprios fora do kit (ícones em `src/components/icons/`, componentes reutilizáveis do projeto) são importados via `@/components/...` (`@` = `src`).

| Alias            | Caminho             |
| ---------------- | ------------------- |
| `@/*`            | `src/*`             |
| `@assets/*`      | `src/assets/*`      |
| `@boot/*`        | `src/boot/*`        |
| `@components/*`  | `src/components/ui/*` (kit shadcn-vue) |
| `@composables/*` | `src/composables/*` |
| `@constants/*`   | `src/constants/*`   |
| `@layout/*`      | `src/layout/*`      |
| `@lib/*`         | `src/lib/*`         |
| `@pages/*`       | `src/pages/*`       |
| `@plugins/*`     | `src/plugins/*`     |
| `@router/*`      | `src/router/*`      |
| `@services/*`    | `src/services/*`    |
| `@stores/*`      | `src/stores/*`      |
| `@utils/*`       | `src/utils/*`       |
| `@views/*`       | `src/views/*`       |

❌ Errado:

```js
import { Button } from "../../components/ui/button";
import { useAuth } from "../composables/useAuth";
```

✅ Certo:

```js
import { Button } from "@components/button"; // kit shadcn-vue (src/components/ui)
import { useAuth } from "@composables/useAuth";
```

**Por quê:** relativo quebra em refactor e torna imports dependentes da localização do arquivo.

---

## R4b — Composição de `class` (`cn` / `cva`)

**Regra:** Em componentes `.vue`, composição de classes Tailwind usa `import { cn } from '@lib/utils'` (`clsx` + `tailwind-merge`). Componentes shared com variants na spec (`variants_figma`, props `variant` / `size`, etc.) usam `cva` (`class-variance-authority`) e fecham com `cn(..., props.class)` no elemento raiz. **Não** recriar o utilitário `cn` dentro de `src/components/{Comp}/` — sempre `@lib/utils`.

Como o Vue **concatena** o `class` que vem do consumer no elemento raiz por fallthrough (sem resolver conflitos de utilitário), componente shared declara uma prop `class`, desativa o merge automático com `defineOptions({ inheritAttrs: false })` e aplica `cn(..., props.class)` para que `twMerge` faça o override corretamente.

❌ Errado:

```vue
<template>
  <div :class="`p-4 bg-neutral-white ${props.class}`" />
</template>
```

```vue
<script setup>
const map = { default: "border-neutral-20", alt: "border-esmeralda" };
</script>

<template>
  <div :class="`${map[variant]} ${props.class}`" />
</template>
```

✅ Certo:

```vue
<script setup>
import { cn } from "@lib/utils";

defineOptions({ inheritAttrs: false });
const props = defineProps({ class: { type: String, default: "" } });
</script>

<template>
  <div :class="cn('p-4 bg-neutral-white', props.class)">
    <slot />
  </div>
</template>
```

```vue
<script setup>
import { cva } from "class-variance-authority";
import { cn } from "@lib/utils";

defineOptions({ inheritAttrs: false });
const props = defineProps({
  variant: { type: String, default: "default" },
  class: { type: String, default: "" },
});

const cardVariants = cva("rounded-lg border", {
  variants: {
    variant: { default: "border-neutral-20", highlight: "border-esmeralda" },
  },
  defaultVariants: { variant: "default" },
});
</script>

<template>
  <div :class="cn(cardVariants({ variant: props.variant }), props.class)">
    <slot />
  </div>
</template>
```

**Por quê:** template string (e o fallthrough automático do Vue) não resolve conflitos de utilitários duplicados; `twMerge` faz o override do `class` do consumer funcionar como esperado. `cva` centraliza `defaultVariants` e `compoundVariants` sem if-chain.

**Nota:** isso **não** relaxa R1/R2 — só organiza strings de tokens já válidos.

---

## R4b-extract — Quando extrair pra `src/components/`

**Regra:** componente vai pra `src/components/` SÓ se **≥ 2 seções (`views`) ou páginas distintas** usam a mesma estrutura visual. Senão fica inline na própria seção (`view`).

**Section-helper:** se uma sub-estrutura repete DENTRO da mesma seção, resolve com `v-for` sobre um array de dados no MESMO `.vue` — NÃO cria arquivo separado em `src/components/`.

**Layouts/shells de página:** ficam em `src/layout/` (shell de rota) ou inline na página em `src/pages/`. NÃO criar `src/components/{Page}Layout.vue` que só serve a uma página.

❌ Errado — `HistoriaBloco` com 1 consumidor (`views/Historia.vue`):

```
src/components/HistoriaBloco.vue   ← arquivo a mais, indireção sem reuso
src/views/Historia.vue             ← único importador
```

✅ Certo — markup inline na view, repetição via `v-for`:

```vue
<!-- src/views/Historia.vue -->
<script setup>
defineProps({ blocos: { type: Array, default: () => [] } });
</script>

<template>
  <article v-for="bloco in blocos" :key="bloco.id" class="...">
    <!-- ...estrutura do bloco... -->
  </article>
</template>
```

**Por quê:** extração prematura = navegação fragmentada (abrir 2 arquivos pra entender 1 view), mais tokens pra LLM ler/gerar, e a "API" do componente (props) fica subdefinida pra 1 caso. Quando aparece o 2º consumidor, aí sim vale extrair pra `src/components/` com props reais.

---

## R4b-cva — Quando usar `cva` (vs objeto-de-classes)

**Regra:** `cn` é padrão pra merge. `cva` é **escalada**, não default.

Use `cva` SÓ se TODAS forem verdade:

- 2+ props de variant ortogonais (ex: `variant` × `size`)
- Cada combinação muda 3+ classes
- Componente é shared (≥ 2 consumidores)

Senão, mapa `{ valor: 'classes' }` + `cn()`.

❌ Errado — 3 blocos `cva` pra 1 prop `layout`:

```vue
<script setup>
import { cva } from "class-variance-authority";

const rootVariants = cva("flex", {
  variants: {
    layout: {
      imagem_direita: "...",
      conteudo_esquerda: "...",
      imagem_central: "...",
    },
  },
});
const principalVariants = cva("text-h2", {
  variants: {
    layout: {
      imagem_direita: "...",
      conteudo_esquerda: "...",
      imagem_central: "...",
    },
  },
});
const mediaVariants = cva("flex", {
  variants: {
    layout: {
      imagem_direita: "...",
      conteudo_esquerda: "...",
      imagem_central: "...",
    },
  },
});
</script>
```

✅ Certo — 1 mapa, leitor vê tudo da variant em 1 lugar:

```vue
<script setup>
import { computed } from "vue";
import { cn } from "@lib/utils";

const props = defineProps({
  layout: { type: String, default: "imagem_direita" },
  class: { type: String, default: "" },
});

const LAYOUTS = {
  imagem_direita: {
    root: "flex-col gap-12 lg:flex-row",
    principal: "w-full max-w-[791px] lg:flex-1",
    media: "shrink-0 lg:max-w-[576px]",
  },
  conteudo_esquerda: { root: "...", principal: "...", media: "..." },
  imagem_central: { root: "...", principal: "...", media: "..." },
};

const styles = computed(() => LAYOUTS[props.layout] ?? LAYOUTS.imagem_direita);
</script>

<template>
  <article :class="cn('flex w-full bg-ma-white', styles.root, props.class)">
    <slot />
  </article>
</template>
```

**Por quê:** `cva` faz sentido quando `variant × size × tone` geram matriz combinatória (`compoundVariants`, `defaultVariants` ortogonais). Pra 1 prop ele só adiciona indireção — leitor pula entre 3 blocos pra montar 1 layout mentalmente. Mapa é mais legível e tem o mesmo poder de combinação com `cn`.

---

## R4b-constants — Quando puxar constante de classes pro topo do arquivo

**Regra:** só se reusada **2+ vezes no mesmo arquivo** OU **exportada pra outro arquivo**. Com 1 consumidor, escreve inline no `class` do template.

❌ Errado — constante puxada com 1 consumidor:

```vue
<script setup>
const SOBRE_LAYOUT_SHELL = "mx-auto w-full max-w-[1920px] px-5";
const SOBRE_LAYOUT_GRID =
  "grid min-w-0 w-full grid-cols-12 gap-2 max-md:grid-cols-1";
</script>

<template>
  <div :class="SOBRE_LAYOUT_SHELL">
    <div :class="SOBRE_LAYOUT_GRID"><slot /></div>
  </div>
</template>
```

✅ Certo — inline:

```vue
<template>
  <div class="mx-auto w-full max-w-[1920px] px-5">
    <div class="grid min-w-0 w-full grid-cols-12 gap-2 max-md:grid-cols-1">
      <slot />
    </div>
  </div>
</template>
```

**Por quê:** constante nomeada com 1 uso obriga o leitor a saltar pra topo do arquivo pra ver o conteúdo — sem ganho, só latência mental. Tailwind class composition já é legível inline. Constante só vale quando elimina duplicação real.

---

## R4b-exports — Um componente por arquivo; não fragmentar shell de página

**Regra:** cada `.vue` em `src/components/` é UM componente reutilizável de verdade. Se sentir vontade de criar `SobreLayoutCol.vue`, `SobreLayoutContentSplit.vue`, `SobreLayoutItem.vue` só pra montar UMA página, é sinal de que aquilo é um **shell de página** — fica inline na view (`src/views/`) ou no layout de rota (`src/layout/`).

❌ Errado — vários `.vue` wrapper pra fragmentar o layout de 1 página:

```
src/components/SobreLayout.vue
src/components/SobreLayoutCol.vue            ← shell de página
src/components/SobreLayoutContentSplit.vue   ← shell de página
```

✅ Certo — quando é shell de página, inline na view:

```vue
<!-- src/views/Sobre.vue -->
<template>
  <div class="mx-auto w-full max-w-[1920px] px-5">
    <div class="grid w-full grid-cols-12 gap-2 max-md:grid-cols-1">
      <div class="col-start-3 col-span-10 max-2xl:col-start-2">
        <!-- faixa principal -->
      </div>
    </div>
  </div>
</template>
```

✅ Certo — quando é componente reusável de verdade (`SobreLayout` com 3 consumidores), API via props + `<slot>`:

```vue
<!-- src/components/SobreLayout.vue -->
<script setup>
defineProps({ variant: { type: String, default: "main" } });
</script>

<template>
  <div><slot /></div>
</template>
```

**Por quê:** quebrar uma página em `SobreLayoutCol`, `SobreLayoutContentSplit` força o consumer a importar e entender 2-3 componentes-wrapper acoplados. Se a estrutura é do componente, ele entrega via props/`<slot>`. Se a estrutura é da página, é da página — inline na view.

---

## R5 — Pages, Views, Layouts & Componentes

**Regra:** tudo é `.vue` SFC com `<script setup>` — não existe `.jsx`. A separação é por **papel na árvore de rotas**:

- `src/pages/` → a **página** (1 por rota), registrada em `src/router/index.js`. É o ponto de entrada da tela; compõe as seções (`views`) na ordem do design.
- `src/views/` → as **seções daquela página** (Hero, Sobre, FAQ, etc.). Não são rotas — são os blocos que a página monta.
- `src/layout/` → shells de layout compartilhados entre rotas (estrutura comum: header, footer, `<RouterView />`).
- `src/components/` → componentes reutilizáveis (ver R4b-extract: só extrai com ≥ 2 consumidores).
- Hierarquia: router → layout → **page** → **views (seções)** → componentes.

❌ Errado — página no lugar de seção, ou seção solta dentro de `pages/`:

```
src/views/Home.vue          ← página de rota no lugar errado (vai em pages/)
src/pages/HomeHero.vue      ← seção solta dentro de pages/ (vai em views/)
```

✅ Certo:

```
src/pages/Home.vue          ← a página (registrada no router)
src/views/home/Hero.vue     ← seção da página Home
src/layout/DefaultLayout.vue ← shell com <RouterView />
src/components/ui/button/Button.vue    ← componente reutilizável
```

```vue
<!-- src/pages/Home.vue -->
<script setup>
import Hero from "@views/home/Hero.vue";
import Sobre from "@views/home/Sobre.vue";
</script>

<template>
  <Hero />
  <Sobre />
</template>
```

```js
// src/router/index.js
import Home from "@pages/Home.vue";

routes: [{ path: "/", component: Home }];
```

**Por quê:** o router só conhece `pages` (e `layout`); a página é a composição das `views` (seções) na ordem do design. Misturar os dois quebra a leitura da árvore de rotas e leva a extração prematura (R4b-extract).

---

## R6 — Imagens

**Regra:**

- ZERO placeholder (`placehold.co`, `picsum`, `via.placeholder`)
- Raster estático em `src/assets/images/{page}/` (kebab, ex: `home/`, `sobre/`). **Padrão:** `import` via alias `@assets` — no Vite o import devolve a **URL string** já com hash de build. **Entregar a fonte já otimizada em `.webp`** (a outra opção é `.avif`); o projeto **não** tem `vite-imagetools`, então **não** usar query `?w=`/`?format=` (não há transform configurado).
- No `<img>`: bind com **`:src="img"`** (a variável já é a URL) — **não** colocar `width`/`height` inline; o **box vai no CSS** (pai + `class`).
- **`alt` obrigatório** em **todo** `<img>`: texto **descritivo em PT-BR** alinhado ao conteúdo ou à função da imagem na tela — **proibido** omitir `alt` ou deixar `alt=""` por preguiça. (Se o SVG for ícone redundante com texto ao lado, usar `aria-hidden` no SVG — ver R7/R10.)
- `loading="lazy"` abaixo da dobra; hero/LCP: `fetchpriority="high"` e sem `lazy`.
- Imagem que não passa pelo bundler (referenciada por path absoluto, ex.: em CSS ou `og:image`) vai em `public/` e é usada como `/img.webp`.

❌ Errado:

```vue
<template>
  <img src="https://placehold.co/600x400" />
</template>
```

```vue
<script setup>
// projeto não tem vite-imagetools — esta query não é processada
import hero from "@assets/images/home/hero.jpg?w=1920&format=webp&quality=90";
</script>

<template>
  <img :src="hero" alt="" class="object-cover" />
  <!-- alt vazio -->
  <img :src="hero" :width="1920" :height="1080" alt="…" />
  <!-- dimensão inline -->
</template>
```

✅ Certo:

```vue
<script setup>
import hero from "@assets/images/home/hero.webp";
</script>

<template>
  <img
    :src="hero"
    alt="Fotografia de capa: equipe planejando investimentos num escritório."
    class="h-full w-full object-cover"
    loading="lazy"
  />
</template>
```

**Por quê:** placeholder chega em produção; query `?w=/?format=` sem `vite-imagetools` instalado é ignorada (vira parte do nome e quebra o asset), então a otimização tem que vir da própria fonte `.webp`; o import do Vite já é a URL (não tem `.src`); `alt` vazio ou genérico falha a11y; dimensão é responsabilidade do CSS, não de atributo inline.

---

## R7 — Ícones (regra crítica — HARD FAIL)

**Regra:** NUNCA ícone de biblioteca (Lucide — inclui `@lucide/vue` —, Heroicons, Material, FA, Tabler, Phosphor, Feather). SEMPRE SVG real extraído do design via `/icon-extract` (Figma) ou MCP `export_nodes` (Pencil). Se ícones não foram extraídos antes de gerar código, ABORTAR.

O projeto **não** tem svg loader (`vite-svg-loader`/svgr) no `vite.config.js`. Padrão: o SVG extraído (salvo em `src/assets/icons/{page}/`) vai **inline num componente `.vue`** em `src/components/icons/` — assim `class`, `aria-*` e `fill="currentColor"` (respeita `text-{cor}` do pai) funcionam sem plugin.

❌ Errado:

```vue
<script setup>
import { Phone } from "@lucide/vue"; // biblioteca de ícone — bloqueado pela R7
</script>

<template>
  <Phone />
</template>
```

```vue
<script setup>
// sem svg loader, ?raw vira string crua; v-html perde class/aria/typing
import phoneRaw from "@assets/icons/contato/phone.svg?raw";
</script>

<template>
  <span v-html="phoneRaw" />
</template>
```

✅ Certo — SVG extraído inline num componente `.vue`:

```vue
<!-- src/components/icons/IconPhone.vue -->
<template>
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="..." />
  </svg>
</template>
```

```vue
<script setup>
import IconPhone from "@/components/icons/IconPhone.vue";
</script>

<template>
  <IconPhone class="w-5 h-5 text-primary" />
</template>
```

Logo/asset decorativo sem controle de cor: import por URL (`import logo from '@assets/logo.svg'`) e usar em `<img :src="logo" alt="…" />` ou `background-image` no CSS.

**Por quê:** biblioteca diverge tracing e proporção do design. Sem svg loader, `?raw` + `v-html` perde DX (sem `class`, sem `aria-*`, sem typing) e não tem tree-shaking; sprite (`<use href="/icons.svg#nome" />`) também está descartado — o projeto não tem `public/icons.svg`. SVG inline em `.vue` entrega `class`/`aria-*`/`currentColor` de graça.

> Se quiser componentizar SVG por import (`import Icon from '…?component'`), adicionar `vite-svg-loader` ao `vite.config.js` — hoje não está instalado, então inline é o padrão. O `@lucide/vue` em `package.json` é proibido por esta regra e deve ser removido.

Hook `check-icons.mjs` bloqueia Write/Edit com imports de bibliotecas de ícone.

---

## R8 — Responsive desktop-first

**Regra:** Estilo base é pro **desktop**; adapta pra telas menores com os prefixos `max-*` (`max-md:`, `max-lg:`, `max-xl:`). NÃO partir de mobile-first (`md:`, `lg:` como ponto de partida).

Breakpoints: projeto é **Tailwind v4** com `@theme` em `src/assets/tailwind.css` (hoje **vazio**) → valem os **defaults** do Tailwind v4: `sm` 40rem · `md` 48rem · `lg` 64rem · `xl` 80rem · `2xl` 96rem. Breakpoint custom só se declarado em `@theme` (CSS-first, **não** em `tailwind.config.js`), ex.:

```css
/* src/assets/tailwind.css */
@theme {
  --breakpoint-xl: 73.75rem;
}
```

❌ Errado (mobile-first):

```html
<div class="text-sm md:text-base lg:text-lg"></div>
```

✅ Certo (desktop-first):

```html
<div class="text-lg max-lg:text-base max-md:text-sm"></div>
```

**Por quê:** o design é desktop-first (ver `CLAUDE.md`). Afirmar um breakpoint custom que não existe no `@theme` leva a classes (`xl:`/`max-xl:`) com valor diferente do esperado — o XL real é o default `80rem` até alguém declarar outro.

---

## R9 — Carrosséis

**Regra:** SEMPRE Swiper v12+ via `swiper/vue` (`<Swiper>` / `<SwiperSlide>`). PROIBIDO carrossel manual (`ref` + `scrollBy`/`scrollIntoView`, scroll-snap custom).

❌ Errado:

```vue
<script setup>
import { ref } from "vue";
const track = ref(null);
</script>

<template>
  <div ref="track" class="flex overflow-x-auto snap-x">...</div>
</template>
```

✅ Certo — componentes `swiper/vue` + módulos de `swiper/modules` + CSS do módulo usado:

```vue
<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

defineProps({ items: { type: Array, default: () => [] } });
</script>

<template>
  <Swiper
    :modules="[Navigation, Pagination]"
    :slides-per-view="1"
    :space-between="16"
    navigation
    :pagination="{ clickable: true }"
    :breakpoints="{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }"
  >
    <SwiperSlide v-for="item in items" :key="item.id">
      <!-- ...conteúdo do slide... -->
    </SwiperSlide>
  </Swiper>
</template>
```

**Por quê:** manual perde gestures, foco e padrões de acessibilidade que Swiper já resolve. Os `breakpoints` do Swiper são **min-width** (única API da lib) — exceção pontual ao desktop-first da R8, restrita à config do carrossel.

---

## R10 — Semântica HTML5 & a11y

**Regra:** Landmarks (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`), **todo `<img>` com `alt` descritivo (PT-BR) — requisitos completos em R6**, `aria-label` em botões só-ícone, **um único `<h1>` por página**, headings sem pular nível. Navegação interna usa `<RouterLink>` (vue-router), não `<a href>` manual.

Na estrutura do projeto (R5): `<header>`/`<footer>`/`<nav>` ficam no shell de `src/layout/`; o `<main>` envolve o `<RouterView />`; o `<h1>` único vive na página (`src/pages/`) ou na seção hero (`src/views/`).

❌ Errado:

```vue
<template>
  <div class="header">...</div>
  <!-- landmark como div -->
  <button><IconClose /></button>
  <!-- botão só-ícone sem rótulo -->
  <a href="/sobre">Sobre</a>
  <!-- navegação interna sem RouterLink -->
</template>
```

✅ Certo:

```vue
<template>
  <header>
    <nav>
      <RouterLink to="/sobre">Sobre</RouterLink>
    </nav>
  </header>

  <button aria-label="Fechar menu">
    <IconClose class="h-5 w-5" aria-hidden="true" />
  </button>
</template>
```

**Por quê:** SEO e leitores de tela dependem da estrutura; `<a href>` interno perde o roteamento SPA (full reload) — `<RouterLink>` mantém a navegação client-side. O SVG do botão é decorativo (`aria-hidden`), o rótulo acessível vem do `aria-label`.

---

## R11 — Lazy loading & code-splitting

**Regra:** É SPA Vue — não existe `client:*`. Para não inflar o bundle inicial nem atrasar o LCP:

- **Rotas** carregam lazy no router: `component: () => import('@pages/X.vue')` (1 chunk por rota).
- **Componente pesado abaixo da dobra** (gráfico, mapa, editor, carrossel pesado) usa `defineAsyncComponent`.
- **Above-fold crítico** (hero, header) importa **eager** (`import X from ...`) — não atrasar a primeira pintura com async.

❌ Errado — tudo eager, infla o bundle inicial:

```js
// src/router/index.js
import Home from "@pages/Home.vue";
import Relatorios from "@pages/Relatorios.vue"; // página pesada carregada já no boot

const routes = [
  { path: "/", component: Home },
  { path: "/relatorios", component: Relatorios },
];
```

✅ Certo — rota lazy + componente pesado assíncrono:

```js
// src/router/index.js
const routes = [
  { path: "/", component: () => import("@pages/Home.vue") },
  { path: "/relatorios", component: () => import("@pages/Relatorios.vue") },
];
```

```vue
<script setup>
import { defineAsyncComponent } from "vue";

const GraficoPesado = defineAsyncComponent(
  () => import("@/components/GraficoPesado.vue"),
);
</script>

<template>
  <GraficoPesado />
</template>
```

**Por quê:** importar tudo eager joga todo o código no chunk de boot e atrasa LCP/TTI. Lazy por rota + `defineAsyncComponent` só baixam o código quando a rota/componente é realmente necessária. O above-fold crítico permanece eager para não introduzir um estado de loading na primeira pintura.

---

## R12 — Estrutura semântica de conteúdo

**Regra:** cada pedaço de conteúdo é renderizado pela **tag HTML que descreve sua função** (diretamente, ou por um componente que emita essa tag) — nunca `<div>`/`<span>` genérico pra conteúdo estrutural. A classe visual (R2) vai **por cima** da tag certa, nunca a substitui.

- **Títulos:** `<h1>`–`<h6>` em hierarquia, sem pular nível (um único `<h1>` por página — ver R10). Subtítulo de seção é `<h2>`; dentro dele, `<h3>`; e assim por diante.
- **Texto corrido:** `<p>`. Listas: `<ul>`/`<ol>` + `<li>`. Citação: `<blockquote>`. NUNCA `<br>` para espaçar (espaçamento é `margin`/`gap`).
- **Formulário:** envolver em `<form @submit.prevent>`; **todo controle tem `<label>` associado** (via `for`/`id` ou input aninhado no label); `type` correto (`email`, `tel`, `password`, `number`…) + `autocomplete`; agrupar campos relacionados em `<fieldset>` + `<legend>` quando fizer sentido; envio é `<button type="submit">`.

❌ Errado — tags genéricas pro conteúdo, input sem label, botão como div:

```vue
<template>
  <div class="text-headline-2">Fale com a gente</div>
  <!-- título como div -->
  <div>Linha 1<br />Linha 2</div>
  <!-- parágrafo via br -->

  <form>
    <span>E-mail</span>
    <input v-model="email" />
    <!-- label solto, sem associação nem type -->
    <div @click="enviar">Enviar</div>
    <!-- botão como div -->
  </form>
</template>
```

✅ Certo — tag semântica + label associado + classe visual por cima:

```vue
<template>
  <h2 class="text-headline-2">Fale com a gente</h2>
  <p class="text-paragraph-3">Linha 1</p>
  <p class="text-paragraph-3">Linha 2</p>

  <form @submit.prevent="enviar">
    <label for="email" class="text-paragraph-4">E-mail</label>
    <input
      id="email"
      v-model="email"
      type="email"
      name="email"
      autocomplete="email"
    />
    <button type="submit">Enviar</button>
  </form>
</template>
```

**Por quê:** a tag carrega a semântica — SEO, leitor de tela, navegação por teclado, autofill do navegador. `<label for>` conecta rótulo ↔ campo (clicar no label foca o input; o leitor de tela anuncia o rótulo). Estilo é responsabilidade da classe (R2), não da escolha de tag — um `<div>` estilizado de título perde tudo isso. Complementa a R10 (landmarks/a11y de elementos interativos).

**Nota — componente NÃO é o oposto de semântica:** esta regra é sobre o **HTML renderizado no DOM final**, não sobre escrever tudo em HTML cru. Componentizar é incentivado (R4b-extract) — próprios (`<BaseInput>`, `<AppButton>`) ou de terceiros (`<RouterLink>`, `<Swiper>`). O que importa é que o componente **emita a tag certa na raiz**: `<BaseInput>` renderiza um `<input>` real com `<label>` associado, `<AppButton>` renderiza `<button>`, `<RouterLink>` já renderiza `<a>`. NÃO troque um componente adequado por HTML cru só pra "parecer semântico" — quem encapsula é o dono de colocar a tag correta dentro. A proibição é contra `<div>`/`<span>` substituindo a tag semântica, seja em markup direto ou dentro de um componente.

---

## Regras de nicho (ler sob demanda)

- **GSAP** → `.claude/commands/gsap.md`
- **Swiper detalhes** → `.claude/commands/swiper.md`

---

## Meta

**Nova regra aqui só com errado+certo ancorados em exemplo real.** Detalhes de projeto novo que não são universais ficam em `.claude/learn/`.
