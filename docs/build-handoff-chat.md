# Build Handoff — Chat

> Gerado por /build-page em 2026-07-02
> Manifesto: `docs/build-manifest-chat.md`
> Rota: `/` → `src/pages/Chat.vue`

## Tabela por view

| View | Arquivo | Status | Desvios do manifesto | Dúvidas | Componentes pedidos | Bloqueios | Lint OK | Notas |
|---|---|---|---|---|---|---|---|---|
| Sidebar | `src/layout/Sidebar.vue` | ok | nenhum | nenhuma | nenhum | — | true | Auto-wireou import em `DefaultLayout.vue` (fora do próprio escopo) |
| Chat | `src/views/Chat/Chat.vue` | ok (após 2 correções) | nenhum | nenhuma | nenhum | — | reportado false na 1ª rodada (falso positivo do linter, ver §Intervenções) | Corrigido: blend mode do bg (visual), `font-medium`/`tracking-label` redundantes (R2), responsivo `max-md:` no grid e no input |
| Header | `src/layout/Header.vue` | bloqueio → ok (retry) | nenhum | nenhuma | nenhum | 1ª tentativa abortou (ver abaixo) | true | Auto-wireou import em `DefaultLayout.vue`; corrigido `font-medium` redundante (R2) |

**Bloqueio da 1ª tentativa do Header:** o subagente abortou porque `output_path: src/layout/Header.vue` não bate com o padrão genérico `src/views/{Page}/*.vue` que ele espera por default. Isso é uma decisão arquitetural intencional (Sidebar/Header viram `src/layout/DefaultLayout.vue` desde a primeira página — ver `docs/build-manifest-chat.md` §"⚠️ Desvio do padrão do comando"), documentada no manifesto mas não lida automaticamente pelo subagente na 1ª passada. Resolvido no retry com uma nota explícita apontando pra essa seção do manifesto. **Isso é uma lacuna real do contrato `section-builder`/`build-page`**: quando o manifesto declara destino fora de `src/views/{Page}/`, o subagente deveria confiar no `output_path` do input em vez de assumir o padrão — vale ajustar o AGENT.md do `section-builder` numa próxima iteração (candidato a `/learn`).

## Code review

**Veredicto do agente `review`:** APROVADO COM RESSALVAS — 0 BLOCKERS, 6 MAJOR, 4 MINOR, 4 INFO.

### Triagem do orquestrador (verificação independente contra `.claude/RULES.md`)

- **M1** (`gap-[25px]`, `p-[15px]` em Chat.vue), **M2** (`w-[183px]`, `gap-[17px]`, `px-[15px]`, `py-[10px]` em Header.vue), **M3** (`h-[60px]` em Header.vue) — **falsos positivos**, NÃO corrigidos. `RULES.md` R1 (linha 35) exceciona explicitamente dimensionamentos de layout (`gap`/`padding`/`width`/`height`) vindos do Figma quando não há utility Tailwind exatamente equivalente — "a proibição rígida é para cores e tipografia". Arredondar esses valores pra classe de escala mais próxima (ex. `gap-6` no lugar de 25px) teria introduzido desvio de fidelidade pixel-perfect contra a referência do Figma sem necessidade.
- **M4, M5, M6** (`font-medium`/`tracking-label` sobrepostos a `text-paragraph-2`/`text-paragraph-4`) — **confirmados reais**, **corrigidos**. R2 proíbe overrides sobre classes `text-*`; os tokens já encapsulavam os mesmos valores (redundância pura, sem necessidade de token novo).
- **m1** (alt vazio em imagem decorativa) — correto como está, sem ação.
- **m2** (`<main>` na página em vez de no `DefaultLayout`) — sugestão de arquitetura válida pra quando a 2ª página existir; não corrigido agora (baixo risco, só 1 rota hoje).
- **m3, m4** (grid de sugestões e input sem `max-md:`) — **confirmados reais**, **corrigidos**.

## Intervenções do orquestrador (fora do escopo estrito dos `.vue` das views)

- `src/pages/Chat.vue` — descomentado o import/uso de `<Chat />` (Passo 4 do `/build-page`, papel do orquestrador).
- `bunx biome lint <arquivos>` rodado diretamente (bypass do script `bun run lint`, que sempre varre o projeto inteiro via `biome lint .` hardcoded em `package.json`) — só pra isolar sinais reais dos meus arquivos vs. ruído pré-existente do projeto. Nenhum arquivo de config alterado.
- `npx playwright install chromium` — instalado localmente (cache do usuário, `~/.cache/ms-playwright`) pra permitir screenshot real do dev server rodando; não é dependência do projeto, não tocou `package.json`.
- Nenhuma edição direta em `.vue` de view/layout — todas as correções (incluindo o bug visual do blend mode) foram devolvidas aos `section-builder` via `correcao_solicitada`, conforme o contrato.

## Verificação visual (Playwright)

Renderizei `http://localhost:5173/` via Chromium headless e comparei contra `docs/figma/chat-*.webp`. Encontrei e corrigi 1 bug real não capturado pelo build/lint:

- **Bug:** o fundo decorativo (`chat-bg.webp`) renderizava como feixes diagonais brancos sólidos e opacos, cobrindo parte do texto do hero ("Como posso te ajudar hoje?" ficava parcialmente ilegível). A imagem raw extraída tem os feixes em branco 100% opaco — no Figma original esse layer se compõe com blend mode sobre o gradiente de fundo, não alpha compositing simples.
- **Fix aplicado:** troquei a classe do `<img>` de fundo pra usar `mix-blend-soft-light` (Tailwind) em vez de só `opacity-100`. Validei localmente com `sharp` simulando os blend modes antes de propor a correção — `soft-light` reproduziu a referência quase exatamente.
- **Confirmação pós-fix:** novo screenshot mostra hero totalmente legível, feixes sutis cinza-escuro, igual à referência.

## Análise e sugestões de correção

### Causas raiz agrupadas

1. **Assets de "efeito decorativo" exportados do Figma sem contexto de blend mode.** O `get_design_context`/export de imagem retorna só o pixel raw (RGBA), não o `mix-blend-mode` CSS que o Figma aplica visualmente na composição da camada. Isso pode se repetir em qualquer imagem "glow"/"light leak"/textura decorativa futura — vale documentar como padrão reconhecível (rays/glow brancos sólidos em PNG = candidato a `mix-blend-soft-light` ou `overlay`).
2. **`section-builder` não confia no `output_path` do input quando ele diverge do padrão `src/views/{Page}/`.** Causou o bloqueio inicial do Header. Fix é ajustar o AGENT.md pra instruir: "se `output_path` não é `src/views/{Page}/*.vue`, confira a seção `## ⚠️ Desvio...` ou notas equivalentes no topo do manifesto antes de abortar."
3. **Tokens redundantemente re-especificados.** `font-medium`/`tracking-label` foram re-adicionados em 3 lugares mesmo já estando embutidos nos tokens `text-paragraph-2`/`text-paragraph-4`. Sugere que os `section-builder`s não checam o conteúdo real do token antes de estilizar — só reconhecem o nome da categoria.
4. **`bun run lint` não é utilizável para validação incremental** (hardcoded `biome lint .`, sempre varre os 367 arquivos do projeto, incluindo SVGs raw e `tailwind.css` que o Biome não entende — Tailwind v4 CSS-first não é suportado pelo parser CSS do Biome). Isso gera falsos "lint_ok: false" nos subagentes que rodam `bun run lint -- <arquivo>` esperando escopo (os argumentos são ignorados pelo script).

### Backlog priorizado

**P0 (nenhum)** — sem bloqueios abertos.

**P1 — técnico, pode ser resolvido sem input do usuário:**
- Ajustar `.claude/agents/section-builder/AGENT.md` pra instruir leitura da seção de desvios do manifesto antes de abortar por `output_path` fora do padrão → evita o bloqueio-e-retry que aconteceu com o Header nesta rodada.
- Ajustar `package.json` script `lint` pra aceitar paths (`biome lint ${1:-.}` em vez de `biome lint .` fixo) → permite validação incremental real em builds futuros. Fora do escopo desta sessão (arquivo compartilhado, risco médio, pedir aprovação separada).
- Registrar padrão de blend mode em `.claude/learn/` (categoria `tokens` ou `components`) — "assets de textura/glow do Figma podem precisar de `mix-blend-*` em vez de `opacity`" — rodar `/learn` com este diff real.

**P2 — decisão de produto/copy, precisa do usuário:**
- `src/views/Chat/Chat.vue` — as 4 sugestões "Análise Fundamentalista" têm texto **idêntico** nos 4 cards no próprio Figma (`faça análise fundamentalista da apple baseada em noticias` repetido 4x) — copiado literalmente por R13, mas provavelmente é placeholder do design que precisa de conteúdo real/distinto por sugestão antes de ir pra produção.
- Avaliar se `<main>` deveria mover pra dentro de `DefaultLayout.vue` (achado m2) quando a 2ª página for criada — não é urgente com 1 rota só.

**Separação humano vs. técnico:** tudo do backlog P1 é técnico (arquivos de configuração/agente, sem impacto visual). O único item P2 é decisão de conteúdo (copy dos 4 cards de sugestão) — precisa de alguém validar se o Figma realmente pretendia texto repetido ou é placeholder.

## PROMPT COPIÁVEL

```text
Contexto: acabei de rodar /build-page chat. O handoff está em
docs/build-handoff-chat.md. Preciso resolver os itens P1 do backlog:

1. Editar .claude/agents/section-builder/AGENT.md (seção "Passo 1 — Carregar
   contexto mínimo"): adicionar instrução explícita pra, antes de abortar por
   output_path fora de src/views/{Page}/*.vue, verificar se o manifesto
   (manifesto_path) tem uma seção de aviso/desvio no topo (ex: "## ⚠️ Desvio
   do padrão do comando") explicando um destino alternativo válido — só
   abortar se não houver essa justificativa.

2. Editar package.json: trocar o script "lint" de "biome lint ." pra aceitar
   paths opcionais (ex: "biome lint ${@:-.}" ou equivalente que funcione com
   bun run lint -- <arquivos>), sem quebrar o uso atual sem argumentos.

3. Rodar /learn com o seguinte contexto real: ao extrair
   src/assets/images/chat/chat-bg.webp do Figma (frame "DesktopAppLayout",
   node 42:12903) via get_design_context, a imagem raw tinha pixels brancos
   100% opacos nas áreas de "feixe de luz" decorativo — mas a referência
   visual do Figma (docs/figma/chat-chat.webp) mostra esses feixes sutis e
   escuros. A causa era que o layer usa mix-blend-mode no Figma (não
   simples opacity) pra se compor com o gradiente de fundo. Fix: usar
   classe Tailwind mix-blend-soft-light no <img> em vez de só opacity-100.
   Criar nota na categoria apropriada (tokens ou components) documentando
   esse padrão pra próximas extrações de assets decorativos tipo
   glow/textura/light-leak.

Depois de resolver os P1, revisar comigo o item P2 (texto repetido nos 4
cards de sugestão em src/views/Chat/Chat.vue — confirmar se é placeholder
do Figma ou conteúdo real antes de considerar a página pronta pra produção).
```
