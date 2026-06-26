# Instruções do Projeto

## Stack

- **Framework**: Vue 3 + Vite
- **Estilo**: Tailwind CSS com CSS variables para cores e shadcn-vue para componentes UI
- **Deploy**: Netlify
- **Package manager**: bun (preferir ao npm/pnpm)
- **Linguagem**: português brasileiro pra conteúdo e conversa com o dev; inglês pra código

## Regras de código

Toda regra universal (Tailwind, tipografia, containers, imports, ícones, responsive, semântica, serviços, carrosséis) vive em UM arquivo:

**→ `.claude/RULES.md`** (fonte única, sempre ler antes de implementar)

Regras de nicho ficam nos commands (ler sob demanda):

- `.claude/commands/gsap.md` — animações, ScrollTrigger, cleanup
- `.claude/commands/swiper.md` — carrosséis Swiper v12+

## Conhecimento acumulado (vault wiki compounding)

Você é **mantenedor de wiki**, não autor solto de notas. Toda ingestão (`/learn`) toca múltiplas páginas: atualiza nota existente quando o padrão já tem nota, cria cross-refs bidirecionais, anexa em `log.md`. Hook regenera índices.

- **`.claude/learn/`** — vault Obsidian-compatível. Notas atômicas em subpastas por categoria.
- **`.claude/learn/_SCHEMA.md`** — vocabulário fechado (categorias, tags, enums) + frontmatter expandido. `/learn` valida; tag/categoria nova exige aprovação humana.
- **`.claude/learn/_index.json`** — entrada machine-readable do agente (GERADO pelo hook).
- **`.claude/learn/index.base`** — índice navegável humano (Obsidian Bases; gerenciado pelo plugin).
- **`.claude/learn/log.md`** — cronológico, append-only (`## [YYYY-MM-DD] op | título`).
- **`.claude/LESSONS.md`** — stub (compat com docs/PRs antigos).

### Protocolo de leitura em 3 níveis (sublinear)

```
N1 (~50 tokens, sempre): Read .claude/learn/_index.json → escolher categoria(s)
N2 (~200 tokens): Glob/Grep nas categorias escolhidas → escolher até 3 notas
N3 (~300 tokens × 3): Read no máximo 3 notas completas
```

### Gatilhos de carga (path → categoria)

- `src/components/ui/**` (shadcn-vue), extração de componente, refactor → `components`
- `src/layout/**`, navbar / menu mobile, `position: fixed`, container, page shell → `navbar`, `layout`
- `src/assets/tailwind.css`, `src/assets/base.css`, `src/assets/main.css` (Tailwind v4 CSS-first, sem `tailwind.config.js`), classes utilitárias novas → `tokens`
- SVG inline, `<path>`, `<svg>` → `icons`, `tokens`
- `<a href=`, headings, `aria-*` → `semantica`
- `gsap`, `useAnimations`, `data-animate` → `gsap`
- breakpoints `max-md:`/`max-lg:` → `responsive`

### Operações

- **`/learn`** — ingest manual após correção real. Cria OU atualiza nota; mantém cross-refs bidirecionais; loga.
- **`/dream`** — lint estrutural periódico (órfãos, stale, missing cross-refs, concept gaps, pasta `outros` inchada) + propostas de promoção pra `RULES.md`. Sempre com aprovação humana.

## Princípios

- **Simplicidade primeiro.** Cada mudança toca o mínimo de código.
- **Sem atalhos.** Encontrar causa raiz, não patch de superfície.
- **Impacto mínimo.** Evitar introduzir bugs tangenciais.
- **Desktop-first.** Começa do desktop, adapta pra menor via `max-*`.

## Dev server

`bun dev` roda `vite` (script em `package.json`). Porta padrão do Vite: **9000** (config em `vite.config.js`).

**Regra pra IA:** antes de rodar `bun dev` / `npm run dev` / `vite` ou similar, **sempre** verificar se o server já está no ar:

```bash
# Cross-platform
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
```

- Se respondeu (porta ocupada / HTTP 200), **NÃO subir outro server** — o humano provavelmente já tem um rodando. Reusar o existente (pra validar build, abrir URL, etc).
- Se você _realmente_ precisa de instância isolada, **avisar o humano antes** e rodar com porta diferente: `bun vite --port 5199`.

## Fluxo padrão (pra conversão de design → código)

1. Ler `.claude/RULES.md` (regras universais — sempre).
2. **N1**: ler `.claude/learn/_index.json`. Mapear path/diff → categoria(s) usando a tabela acima.
3. **N2/N3**: abrir até 3 notas relevantes (priorizar `recurrence: alta`).
4. Invocar skill apropriada (`/figma` ou `/pencil`).
5. **Ícones:** rodar `/icon-extract` ANTES de gerar código (HARD FAIL se design tem ícone e extração não rodou).
6. Gerar código respeitando RULES.md.
7. (opcional) `review` agent pra auditar.

## Aprendizado

- Após corrigir um erro do modelo, rodar `/learn` manualmente — só com diff real. Pode criar nota nova OU atualizar existente; sempre mantém cross-refs bidirecionais e anexa em `log.md`.
- Periodicamente rodar `/dream` pra lint estrutural + consolidação. Promoção pra `RULES.md` só manual.
- Regra sem exemplo de código é ruído — toda adição em `RULES.md` DEVE ter errado+certo.
