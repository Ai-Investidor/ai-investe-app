---
title: Imagem decorativa do Figma precisa de mix-blend-mode, não opacity
date: 2026-07-02
category: tokens
tags: [images, css]
recurrence: baixa
scope: generic
related: []
sources: ["session:build-page-chat-2026-07-02"]
supersedes: []
superseded_by: []
rules_ref: []
origin: chat/Chat.vue (background decorativo do estado vazio)
---

# Imagem decorativa do Figma precisa de mix-blend-mode, não opacity

**Erro:** background decorativo (`chat-bg.webp`, feixes de luz diagonais) exportado do Figma via `get_design_context`/Images API renderizou como formas brancas 100% opacas cobrindo o texto por cima, em vez dos feixes sutis cinza-escuro que aparecem na referência visual do Figma.

```html
<img
  :src="chatBg"
  alt=""
  class="absolute inset-0 w-full h-full object-cover opacity-100 rounded-lg"
  loading="eager"
  fetchpriority="high"
/>
```

**Correção:** trocar `opacity-100` por `mix-blend-soft-light`. A imagem raw tem os feixes com pixels brancos totalmente opacos (confirmado compositando a imagem sobre fundo preto puro via `sharp` — os feixes aparecem sólidos, não translúcidos); o Figma original compõe esse layer com um blend mode contra o gradiente de fundo, não com alpha compositing simples via `opacity`.

```html
<img
  :src="chatBg"
  alt=""
  class="absolute inset-0 w-full h-full object-cover mix-blend-soft-light rounded-lg"
  loading="eager"
  fetchpriority="high"
/>
```

**Por quê:** o export de imagem do Figma (via `get_design_context`/`/v1/images`) retorna só os pixels RGBA da camada — não carrega o `mix-blend-mode` CSS que o Figma usa pra compor visualmente essa camada com o que está atrás. Isso é comum em assets de "efeito" (glow, light-leak, textura, ray) que no design ficam sutis por causa do blend mode, mas exportam como PNG/WEBP com pixels de cor sólida (geralmente branco) em áreas que parecem translúcidas no editor. Sinal de alerta: img decorativa que parece "lavada"/branca demais no browser comparado ao screenshot de referência do Figma — testar `mix-blend-soft-light` ou `mix-blend-overlay` antes de mexer em opacity.

**Como diagnosticar rápido:** compositar a imagem sozinha sobre um fundo preto puro (`sharp('img.webp').flatten({background:'#000000'})` ou equivalente) — se as formas "sutis" aparecerem sólidas e opacas nesse teste, é sinal de que o Figma original usa blend mode, não opacity.
