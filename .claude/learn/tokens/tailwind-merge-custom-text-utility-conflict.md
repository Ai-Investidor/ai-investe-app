---
title: "cn()/tailwind-merge apaga classe de cor quando existe @utility text-* custom com mesmo prefixo"
date: 2026-07-02
category: tokens
tags: [tailwind, css, colors]
recurrence: media
scope: project
project: ai-investe-app
related: []
sources: ["session:header-button-text-black-tailwind-merge-2026-07-02"]
supersedes: []
superseded_by: []
rules_ref: []
origin: src/layout/Header.vue (Button "Buscar") / src/lib/utils.js (cn)
---

# cn()/tailwind-merge apaga classe de cor quando existe @utility text-* custom com mesmo prefixo

**Erro:** `<Button class="... text-black text-paragraph-4 ...">` renderizava com texto na cor default do `buttonVariants` (`text-primary-foreground`), não preto — `text-black` sumia do DOM sem erro visível. "Corrigido" (na verdade só mascarado) adicionando `!`:

```vue
<Button
  class="h-9 px-3 bg-btn-light text-black! text-paragraph-4 hover:bg-opacity-90 rounded-lg shrink-0"
>
```

```js
// src/lib/utils.js — antes
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**Correção:** o `!` não corrige nada — só evita que `tailwind-merge` deduplique a classe (important vira grupo de conflito separado dentro da lib). A causa raiz é `tailwind-merge` não conhecer as utilities `@utility text-paragraph-N` / `text-headline-*` definidas no Tailwind v4 CSS-first (`src/assets/tailwind.css`). Ele não lê o CSS do projeto — é lib JS estática com vocabulário fixo. Toda classe `text-*` que não bate com um tamanho de fonte conhecido nem com um padrão de cor reconhecido cai, por default, no grupo de conflito "text color" (comportamento documentado em `tailwind-merge/docs/limitations.md`). Resultado: `text-black`, `text-primary-foreground` e `text-paragraph-4` competem no mesmo grupo; como `text-paragraph-4` vem depois na string de classes, a regra "último de cada grupo vence" remove `text-black` da lista final — nunca chega a renderizar.

Fix: registrar as utilities tipográficas custom como grupo próprio via `extendTailwindMerge`, separado do grupo nativo `text-color`:

```js
// src/lib/utils.js — depois
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-text-style": [
        "text-headline-1",
        "text-headline-1-strong",
        "text-paragraph-1",
        "text-paragraph-2",
        "text-paragraph-3",
        "text-paragraph-4",
        "text-paragraph-5",
        "text-paragraph-6",
        "text-paragraph-7",
        "text-paragraph-8",
      ],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

Com isso, `text-black` sobrevive ao merge e `text-primary-foreground` (default do variant) é corretamente removido — sem precisar de `!` em lugar nenhum.

**Por quê:** `tailwind-merge` resolve conflitos por *nome de grupo*, não por CSS real. Qualquer `@utility` custom com prefixo `text-` (ou `bg-`, `border-`, etc.) que o projeto criar em `src/assets/tailwind.css` está sujeita ao mesmo bug silencioso se não for registrada em `extendTailwindMerge`. Sinal de alerta: precisar de `!` pra uma cor "colar" num componente shadcn-vue que usa `cn(buttonVariants(...), props.class)` — antes de adicionar `!`, verificar se a classe some do DOM renderizado (inspecionar elemento) e se há uma `@utility text-*`/`bg-*`/`border-*` custom na mesma string de classes. Regra prática: **toda nova `@utility` com prefixo que colide com um namespace nativo do Tailwind (`text-`, `bg-`, `border-`, `shadow-`, `gap-`, etc.) precisa ser adicionada em `extendTailwindMerge` (`src/lib/utils.js`) no mesmo PR que a cria.**

**Como diagnosticar rápido:** inspecionar o elemento no DevTools — se a classe esperada (ex: `text-black`) não aparece na lista de classes do elemento renderizado (mesmo estando na prop `class` do componente), é `tailwind-merge` removendo, não CSS. Reproduzir isolado: `node -e "const {twMerge}=require('tailwind-merge'); console.log(twMerge('text-black text-paragraph-4'))"` — se `text-black` sumir do output, confirma o bug.
