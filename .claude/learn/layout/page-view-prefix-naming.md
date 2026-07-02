---
title: Arquivos de página e view precisam do prefixo Page/View no nome
date: 2026-07-02
category: layout
tags: [layout, naming-convention]
recurrence: alta
scope: project
project: ai-investe-app
related: []
sources: []
supersedes: []
superseded_by: []
rules_ref: ["RULES.md#R5"]
origin: src/pages/PageChat.vue, src/views/Chat/ViewChat.vue
---

# Arquivos de página e view precisam do prefixo Page/View no nome

**Erro:** `R5` já documenta a hierarquia `pages/ → views/ → layout/ → components/`, mas não exige prefixo no nome do arquivo. Sem essa regra, página e view acabaram com o mesmo nome (`Chat.vue` em `src/pages/` e `Chat.vue` em `src/views/Chat/`), o que obriga a ler o caminho completo pra saber se um import é a página (rota) ou a seção, e cria ambiguidade em qualquer busca por nome de arquivo.

```
src/pages/Chat.vue
src/views/Chat/Chat.vue
```

```vue
<!-- src/pages/Chat.vue -->
<script setup>
import Chat from "@views/Chat/Chat.vue";
</script>
<template>
  <Chat />
</template>
```

**Correção:** todo arquivo em `src/pages/` recebe o prefixo `Page{Nome}`; todo arquivo em `src/views/` recebe o prefixo `View{Nome}` (a subpasta de agrupamento, ex. `views/Chat/`, mantém o nome sem prefixo — só o arquivo dentro dela muda).

```
src/pages/PageChat.vue
src/views/Chat/ViewChat.vue
```

```vue
<!-- src/pages/PageChat.vue -->
<script setup>
import ViewChat from "@views/Chat/ViewChat.vue";
</script>
<template>
  <ViewChat />
</template>
```

```js
// src/router/index.js
component: () => import("@pages/PageChat.vue"),
```

**Por quê:** o prefixo torna o papel do arquivo legível só pelo nome (sem abrir o arquivo ou olhar o caminho completo), evita colisão de nome entre página e sua seção principal, e complementa `RULES.md#R5` — que descreve a hierarquia mas ainda usa exemplos sem prefixo (`Home.vue`, `HomeHero.vue`). Candidato a atualização do R5 via `/dream`.
