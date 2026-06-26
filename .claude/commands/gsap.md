# GSAP — Instruções de Animação

## Stack de Animação

- **GSAP** 3.x + **ScrollTrigger** (scroll reveal)
- Integração via **`gsap.context()`** com escopo num `ref` + cleanup no unmount
- API 100% declarativa via **data-attributes**
- Composables em `src/composables/` (`@composables`); config/presets em `src/lib/gsap.js` (`@lib/gsap`)

## Arquivo Central

`src/lib/gsap.js` — registra o plugin uma vez, exporta presets e os composables.

```js
// src/lib/gsap.js
import { onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const PRESETS = {
  fadeUp: { opacity: 0, y: 30 },
  fadeDown: { opacity: 0, y: -12 },
  fadeIn: { opacity: 0 },
  slideRight: { opacity: 0, x: -30 },
  slideLeft: { opacity: 0, x: 30 },
  scaleUp: { opacity: 0, scale: 0.92 },
}
```

> Com Lenis (`src/boot/modules/lenis.js`) junto do ScrollTrigger, ligar `lenis.on('scroll', ScrollTrigger.update)` no boot pra sincronizar o scroll suave com os triggers.

## Data-Attributes (API Declarativa)

| Atributo                 | Comportamento                              |
| ------------------------ | ------------------------------------------ |
| `data-animate="fadeUp"`  | Scroll reveal (ScrollTrigger)              |
| `data-load="fadeIn"`     | Animação imediata (above the fold)         |
| `data-stagger="scaleUp"` | Anima children com stagger (ScrollTrigger) |
| `data-delay="0.2"`       | Delay da animação (segundos)               |
| `data-gap="0.12"`        | Gap do stagger entre children              |
| `data-duration="0.5"`    | Duração customizada                        |
| `data-start="top 90%"`   | ScrollTrigger start customizado            |

## Presets Disponíveis

```js
fadeUp      // opacity: 0, y: 30
fadeDown    // opacity: 0, y: -12
fadeIn      // opacity: 0
slideRight  // opacity: 0, x: -30
slideLeft   // opacity: 0, x: 30
scaleUp     // opacity: 0, scale: 0.92
```

## Composables

### `useAnimations()` — Composable Principal

Retorna um template `ref` (escopo). No `onMounted` cria um `gsap.context()` ancorado nesse elemento, processa `data-animate`/`data-stagger`/`data-load` dentro do escopo, e dá `ctx.revert()` no `onUnmounted` (cleanup automático de tweens + ScrollTriggers).

```js
// src/lib/gsap.js (continuação)
export function useAnimations() {
  const scope = ref(null)
  let ctx

  onMounted(() => {
    ctx = gsap.context((self) => {
      self.selector('[data-animate]').forEach((el) => {
        const preset = PRESETS[el.dataset.animate] ?? PRESETS.fadeUp
        gsap.from(el, {
          ...preset,
          duration: Number(el.dataset.duration) || 0.6,
          delay: Number(el.dataset.delay) || 0,
          scrollTrigger: { trigger: el, start: el.dataset.start || 'top 85%' },
        })
      })
      // data-load → imediato; data-stagger → children com stagger
    }, scope.value)
  })

  onUnmounted(() => ctx?.revert())

  return scope
}
```

Uso na seção/view:

```vue
<script setup>
import { useAnimations } from '@lib/gsap'

const scope = useAnimations()
</script>

<template>
  <section ref="scope">
    <div data-animate="fadeUp">Scroll reveal</div>
    <div data-load="fadeIn" data-delay="0.2">Imediato</div>
    <div data-stagger="fadeUp" data-gap="0.1">
      <div>Child 1</div>
      <div>Child 2</div>
    </div>
  </section>
</template>
```

> No `<script setup>`, `const scope = useAnimations()` + `ref="scope"` no template já conecta o elemento ao ref retornado.

### `useParallax(target, toVars, opts)` — Scroll-linked scrub

`target` é um template `ref`; o scrub é amarrado ao `ScrollTrigger`.

```vue
<script setup>
import { ref } from 'vue'
import { useParallax } from '@lib/gsap'

const img = ref(null)
useParallax(img, { y: -50 })
</script>

<template>
  <img ref="img" :src="..." alt="…" />
</template>
```

### `useTransition(target)` — Troca de tab/conteúdo

Retorna `{ play }`. Anima saída → executa o callback (troca o estado) → anima entrada.

```vue
<script setup>
import { ref } from 'vue'
import { useTransition } from '@lib/gsap'

const content = ref(null)
const { play } = useTransition(content)

function trocarTab(nova) {
  play(() => (activeTab.value = nova))
}
</script>

<template>
  <div ref="content"><!-- conteúdo da tab --></div>
</template>
```

### `useAccordion(isOpen)` — Expand/collapse

Recebe um `ref` reativo `isOpen` e retorna o template `ref` do corpo; usa `watch` pra animar `height` na transição.

```vue
<script setup>
import { ref } from 'vue'
import { useAccordion } from '@lib/gsap'

const isOpen = ref(false)
const body = useAccordion(isOpen)
</script>

<template>
  <button @click="isOpen = !isOpen">Toggle</button>
  <div ref="body">Conteúdo</div>
</template>
```

## Regras

1. Animação de scroll é sempre **GSAP + ScrollTrigger** via `useAnimations()` + data-attributes.
2. Colocar `ref="scope"` no elemento raiz da seção/view/componente.
3. Hover simples → CSS/Tailwind (`hover:scale-[1.02]`, `transition`), não GSAP.
4. Animações complexas (parallax, tabs, accordion) → composables específicos.
5. Presets cobrem ~95% dos casos — evitar `gsap.to/from` direto solto na view.
6. **Cleanup obrigatório:** todo `gsap.context()` é revertido no `onUnmounted` (`ctx.revert()`); ScrollTriggers órfãos vazam ao trocar de rota.

## Vite Config

Projeto é **SPA client-side** — em geral **nenhuma config especial** é necessária. Se aparecer erro de pre-bundle do Vite com GSAP, incluir no `vite.config.js`:

```js
// vite.config.js
optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger'] },
```
