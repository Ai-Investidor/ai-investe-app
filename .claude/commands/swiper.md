# Swiper — carrosséis (v12+)

Usar quando o layout tiver slider/carrossel. A regra constitucional está em `.claude/RULES.md` (R9 — usar Swiper, nunca scroll manual).

## Dependências

Projeto já inclui Swiper v12+. Importar apenas os componentes `swiper/vue`, os módulos de `swiper/modules` e o CSS de cada módulo usado.

```js
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
```

## Padrão básico

```vue
<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

defineProps({ items: { type: Array, default: () => [] } })
</script>

<template>
  <Swiper
    :modules="[Navigation]"
    slides-per-view="auto"
    :space-between="12"
    navigation
  >
    <SwiperSlide v-for="item in items" :key="item.id" class="!w-[320px]">
      <!-- ...conteúdo do slide... -->
    </SwiperSlide>
  </Swiper>
</template>
```

- **`slides-per-view`:** `auto` quando a largura do slide é fixa no design (`!w-[...]` permitido só no slide quando vem do Figma/Pencil e não há token).
- **`:space-between`:** mapear do design; preferir valores alinhados ao spacing system quando existirem utilities.
- **Módulos comuns:** `Navigation`, `Pagination`, `Scrollbar`, `Keyboard`, `A11y` — habilitar o mínimo necessário, passando todos em `:modules="[...]"`.
- **Props bind:** valores não-string (números, objetos, arrays) vão com `:` (`:space-between`, `:pagination="{ clickable: true }"`, `:breakpoints="{...}"`); flags simples como `navigation` podem ficar sem bind.

## Eventos e controle

Eventos do Swiper via `@`; acesso à instância via `@swiper`.

```vue
<script setup>
import { ref } from 'vue'

const swiperInstance = ref(null)
const onSwiper = (sw) => (swiperInstance.value = sw)
const onSlideChange = () => {}
</script>

<template>
  <Swiper :modules="[]" @swiper="onSwiper" @slide-change="onSlideChange">
    <!-- slides -->
  </Swiper>
</template>
```

## Não faça

- `ref` + `scrollBy`/`scrollIntoView` ou scroll-snap custom como substituto de Swiper — quebra gestures, foco e manutenção (R9).
- Lazy-load de todas as fotos dentro do swiper sem estratégia — ver R6 em RULES para `loading` onde couber.

## A11y

- Habilitar o módulo `A11y` (`import { A11y } from 'swiper/modules'`) quando os slides têm conteúdo interativo/focável; ele cuida de `role`, `aria-*` e navegação por teclado.

## Responsive

Breakpoints do Swiper via `:breakpoints="{ ... }"` quando o design define counts diferentes por viewport (são min-width — única API da lib). Manter desktop-first alinhado a RULES (R8 responsive).

```vue
<template>
  <Swiper
    :slides-per-view="1"
    :space-between="16"
    :breakpoints="{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }"
  >
    <!-- slides -->
  </Swiper>
</template>
```
