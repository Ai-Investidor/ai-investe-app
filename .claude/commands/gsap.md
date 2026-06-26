# GSAP — Instruções de Animação

## Stack de Animação

- **GSAP** 3.x + **ScrollTrigger** (scroll reveal)
- **@gsap/react** → `useGSAP` para lifecycle seguro
- API 100% declarativa via **data-attributes**

## Arquivo Central

`src/lib/gsap.js` — configuração, presets e 4 hooks.

## Data-Attributes (API Declarativa)

| Atributo                | Comportamento                              |
| ----------------------- | ------------------------------------------ |
| `data-animate="fadeUp"` | Scroll reveal (ScrollTrigger)              |
| `data-load="fadeIn"`    | Animação imediata (above the fold)         |
| `data-stagger="scaleUp"`| Anima children com stagger (ScrollTrigger) |
| `data-delay="0.2"`     | Delay da animação (segundos)               |
| `data-gap="0.12"`      | Gap do stagger entre children              |
| `data-duration="0.5"`  | Duração customizada                        |
| `data-start="top 90%"` | ScrollTrigger start customizado            |

## Presets Disponíveis

```js
fadeUp      // opacity: 0, y: 30
fadeDown    // opacity: 0, y: -12
fadeIn      // opacity: 0
slideRight  // opacity: 0, x: -30
slideLeft   // opacity: 0, x: 30
scaleUp     // opacity: 0, scale: 0.92
```

## Hooks

### `useAnimations()` — Hook Principal
Retorna `ref` (scope). Processa automaticamente `data-animate`, `data-stagger`, `data-load`.

```jsx
import { useAnimations } from 'lib/gsap'

export default function Section() {
  const scope = useAnimations()
  return (
    <section ref={scope}>
      <div data-animate="fadeUp">Scroll reveal</div>
      <div data-load="fadeIn" data-delay="0.2">Imediato</div>
      <div data-stagger="fadeUp" data-gap="0.1">
        <div>Child 1</div>
        <div>Child 2</div>
      </div>
    </section>
  )
}
```

### `useParallax(ref, toVars, opts)` — Scroll-linked scrub

```jsx
const imgRef = useRef(null)
useParallax(imgRef, { y: -50 })
```

### `useTransition(ref)` — Tab/content swap

```jsx
const contentRef = useRef(null)
const { play } = useTransition(contentRef)
play(() => setActiveTab(newTab))
```

### `useAccordion(isOpen)` — Expand/collapse

```jsx
const bodyRef = useAccordion(isOpen)
return <div ref={bodyRef}>Conteúdo</div>
```

## Regras

1. **NUNCA** importar `motion` ou `motion/react` — o projeto usa GSAP
2. **NUNCA** usar `<motion.div>`, `whileInView`, `animate` — são do Motion (removido)
3. Sempre usar `useAnimations()` + data-attributes para animações
4. Colocar `ref={scope}` no elemento raiz da seção/componente
5. Hover simples → usar CSS transitions (`hover:scale-[1.02]` etc.)
6. Para animações complexas (parallax, tabs), usar os hooks específicos
7. Presets cobrem 95% dos casos — evitar gsap.to/from direto

## Vite Config (obrigatório)

```js
// astro.config.mjs → vite
resolve: { dedupe: ['react', 'react-dom'] },
optimizeDeps: { include: ['react', 'react-dom', 'gsap', 'gsap/ScrollTrigger', '@gsap/react'] },
ssr: { noExternal: ['gsap', '@gsap/react'] },
```
