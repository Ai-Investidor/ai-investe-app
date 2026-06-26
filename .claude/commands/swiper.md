# Swiper — carrosséis (v12+)

Usar quando o layout tiver slider/carrosséis. A regra constitucional está em `.claude/RULES.md` (usar Swiper, nunca scroll manual).

## Dependências

Projeto já inclui Swiper v12+. Importar apenas o que precisa de módulos e CSS.

```jsx
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
```

## Padrão básico

```jsx
<Swiper modules={[Navigation]} slidesPerView="auto" spaceBetween={12}>
  <SwiperSlide className="!w-[320px]">...</SwiperSlide>
</Swiper>
```

- **`slidesPerView`:** `auto` quando largura do slide é fixa no design (`!w-[...]` permitido só no slide quando vem do Figma/Pencil e não há token).
- **`spaceBetween`:** mapear do design; preferir valores alinhados ao spacing system quando existirem utilities.
- **Módulos comuns:** `Navigation`, `Pagination`, `Scrollbar`, `Keyboard`, `A11y` — habilitar o mínimo necessário.

## Não faça

- `useRef` + `scrollBy` / scroll-snap custom como substituto de Swiper — quebra gestures, foco e manutenção.
- Lazy-load de todas as fotos dentro do swiper sem estratégia — ver R6 em RULES para `loading` onde couber.

## A11y

- Se slides são focáveis, garantir navegação por teclado (Swiper pode precisar de `a11y` module ou elementos com `role`/`tabIndex` segundo o caso).

## Responsive

Breakpoints do Swiper via `breakpoints={{ ... }}` quando o design define counts diferentes por viewport. Mantenha desktop-first alinhado a RULES (R8 responsive).
