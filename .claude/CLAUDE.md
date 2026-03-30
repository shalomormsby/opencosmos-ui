# OpenCosmos UI — AI Development Context

> Source of truth for `@opencosmos/ui`, `@opencosmos/tokens`, `@opencosmos/mcp`, and the OpenCosmos Studio documentation site. Read [DESIGN-PHILOSOPHY.md](../DESIGN-PHILOSOPHY.md) before writing any code — it's the North Star.

Last updated: 2026-03-07

---

## What This Repo Is

OpenCosmos UI (SDE) is a monorepo that produces three npm packages and one web application. Consumer apps (portfolio, creative-powerup, sage-stocks) live in a [separate ecosystem repo](https://github.com/shalomormsby/ecosystem) and install `@opencosmos/ui` from npm.

**You are working on the design system itself — the packages and docs site, not the consumer apps.**

```
opencosmos-ui/
├── packages/
│   ├── ui/                  # @opencosmos/ui v1.3.1 — 100 React components
│   │   ├── src/components/  #   11 functional categories
│   │   ├── src/hooks/       #   useTheme, useMotionPreference, etc.
│   │   ├── src/lib/         #   cn(), validators, animations
│   │   ├── src/providers/   #   ThemeProvider, TooltipProvider
│   │   └── src/cli.ts       #   Eject CLI (npx @opencosmos/ui eject)
│   ├── tokens/              # @opencosmos/tokens v1.0.1 — Design tokens
│   │   └── src/             #   Colors, typography, spacing, motion, syntax
│   └── mcp/                 # @opencosmos/mcp v0.8.3 — MCP server (8 tools)
│       └── src/             #   Registry, tool handlers, eject engine
├── apps/
│   └── web/                 # OpenCosmos Studio — opencosmos.ai/studio
│       ├── app/docs/        #   Route config (source of truth for all routes)
│       ├── app/components/  #   Studio UI (playground, registry, navigation)
│       └── public/          #   llms.txt, llms-full.txt, ai-plugin.json
├── .agent/                  # Agent workflows (archived)
├── .github/workflows/       # CI: build → lint → typecheck → test → size-check
└── docs/                    # Planning docs, audits, archived guides
```

---

## The Philosophy (Non-Negotiable)

Four principles from [DESIGN-PHILOSOPHY.md](../DESIGN-PHILOSOPHY.md):

1. **Emotionally Resonant** — Touch hearts, not just solve problems
2. **User Control & Freedom** — Users control their experience (motion 0–10, themes, customizer)
3. **Transparent by Design** — Show the receipts (AI collaboration, decision rationale)
4. **Generous by Design** — Open source, teachable, accessible (MIT license)

**Decision tiebreaker:** What would delight the human, create joy, or expand their degrees of freedom?

---

## Essential References

| File | When to read |
|------|-------------|
| [DESIGN-PHILOSOPHY.md](../DESIGN-PHILOSOPHY.md) | Before any work |
| [AGENTS.md](../AGENTS.md) | Primary technical reference — conventions, build, CI, git |
| [packages/ui/.claude/CLAUDE.md](../packages/ui/.claude/CLAUDE.md) | Component API reference (consumer-facing, ships in npm) |
| [CHANGELOG.md](../CHANGELOG.md) | Before starting new work |

---

## Architecture at a Glance

### Package Dependency Chain

```
@opencosmos/tokens (no deps)
       ↓
@opencosmos/ui (imports tokens, Radix, Zustand, Tailwind)
       ↓
@opencosmos/mcp (reads ui source + registry)
       ↓
apps/web (workspace:* to all packages)
       ↓ npm publish
ecosystem apps (install @opencosmos/ui from npm)
```

### Three Themes

| Theme | Personality | Use |
|-------|------------|-----|
| **Studio** | Professional, balanced | Default. Framer/Vercel/Linear aesthetic |
| **Terra** | Calm, organic | Warm earth tones, natural |
| **Volt** | Bold, electric | Cyberpunk neon, high energy |

Runtime switching via CSS variables. ThemeProvider + Zustand + localStorage. Each has light/dark mode.

### Motion System

- `useMotionPreference()` hook returns `{ shouldAnimate, scale, intensity }`
- Scale: 0–10 (user-controlled), syncs with system `prefers-reduced-motion`
- **Intensity 0 = instant state changes, zero animation, perfect UX** (not degraded)
- Theme-specific easing curves and durations

### Subpath Exports (10)

```
@opencosmos/ui           # Core: 100 components
@opencosmos/ui/hooks     # useTheme, useMotionPreference, etc.
@opencosmos/ui/providers # ThemeProvider, TooltipProvider
@opencosmos/ui/utils     # cn(), validators
@opencosmos/ui/tokens    # Re-exports from @opencosmos/tokens
@opencosmos/ui/forms     # react-hook-form + zod integration
@opencosmos/ui/dates     # date-fns + react-day-picker
@opencosmos/ui/tables    # @tanstack/react-table
@opencosmos/ui/dnd       # @dnd-kit
@opencosmos/ui/webgl     # WebGL effects
```

Heavy features (`forms`, `dates`, `tables`, `dnd`) require optional peer dependencies.

---

## Component Categories (11)

Components organized by **primary purpose** (NOT atomic design):

| Category | Examples |
|----------|----------|
| **actions/** | Button, Toggle, ToggleGroup, Link, Magnetic |
| **forms/** | Input, Textarea, Select, Checkbox, Switch, Slider, Combobox, RadioGroup, SearchBar, Form, FileUpload, ColorPicker |
| **navigation/** | Tabs, Breadcrumb, Pagination, Command, NavigationMenu, Menubar |
| **overlays/** | Dialog, AlertDialog, Sheet, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu, Drawer |
| **feedback/** | Alert, Toast (Sonner), Progress, Skeleton, Spinner, Stepper, EmptyState |
| **data-display/** | Card, Table, DataTable, Avatar, Badge, Calendar, Timeline, TreeView, StatCard, Carousel |
| **layout/** | Accordion, Separator, ScrollArea, Collapsible, ResizablePanel, Sidebar, AspectRatio |
| **backgrounds/** | GlassSurface, Warp, Orb |
| **cursor/** | CustomCursor |
| **blocks/** | PageLayout, PrimaryNav, SecondaryNav, Footer, Customizer, CollapsibleCodeBlock |
| **motion/** | Text effects, scroll effects, transitions |

---

## Adding a Component (Complete Workflow)

A component is **not done** until registered on 6 surfaces. Skipping any surface was the root cause of every SB-1 through SB-6 audit issue.

**Prerequisites:** Component design finalized, props interface defined, category determined.

### Phase 1: Create in Library

**1.1** Create `packages/ui/src/components/[category]/[ComponentName].tsx`
- Named exports only (`export function ComponentName...`)
- Typed props interface (`ComponentNameProps`)
- Motion → wrap in `useMotionPreference()` check
- Colors → CSS variables only (`bg-background`), never hardcoded

**1.2** Export from category index `packages/ui/src/components/[category]/index.ts`:
```typescript
export * from './ComponentName';
```

**1.3** Export from main entry `packages/ui/src/index.ts`:
```typescript
export * from './components/[category]/ComponentName';
```

**1.4** Install dependencies if needed:
```bash
pnpm add [package] --filter @opencosmos/ui
```
Heavy/optional deps → `peerDependencies` with `peerDependenciesMeta.optional: true`.

**1.5** Build: `pnpm build --filter @opencosmos/ui`

### Phase 2: Register in Docs Routing

**2.1** Route config (SOURCE OF TRUTH) — `apps/web/app/docs/route-config.ts`:

**A)** Add slug to `SECTION_ITEMS` (controls route generation, 404 behavior, sitemap):
```typescript
forms: ['checkbox', 'combobox', /* ... */, 'your-component'],
```

**B)** Add label to `routeConfig` children (controls breadcrumbs, metadata titles):
```typescript
'your-component': { label: 'Your Component' },
```

**2.2** Component registry — `apps/web/app/components/lib/component-registry.tsx`:
Add `ComponentConfig` with component reference, description, props, examples, codeExamples, sourceUrl, accessibilityNotes.

**2.3** Category list — `apps/web/app/components/studio/ComponentsSection/index.tsx`:
Add to `COMPONENT_CATEGORIES` under the correct category.

**2.4** Sidebar navigation — `apps/web/app/lib/navigation-tree.tsx`:
```typescript
{ id: 'your-component', label: 'Your Component', section: '[category]' }
```

**2.5** Search index — `apps/web/app/lib/search-index.ts`:
```typescript
{
  id: 'your-component',
  title: 'Your Component',
  description: 'Short description...',
  type: 'component',
  category: '[Category]',
  path: '/docs/[category]/your-component',  // Path-based, NOT #hash
  keywords: ['keyword1', 'keyword2'],
}
```

### Phase 3: AI & Metadata Surfaces

**3.1** MCP registry — `packages/mcp/src/registry.ts`:
```typescript
'your-component': {
  name: 'YourComponent',
  category: 'category',
  description: 'What it does.',
  keywords: ['keyword1'],
  useCases: ['Use case 1'],
  dependencies: ['dep-if-any'],
  radixPrimitive: '@radix-ui/react-*',  // if applicable
  props: { propName: { type: 'string', description: '...', required: true } },
  subComponents: ['Sub1'],  // if applicable
  example: `<YourComponent prop="value" />`,
}
```

**3.2** LLM reference — `apps/web/public/llms-full.txt`:
Add entry in the correct category section with import, description, props, example. Update category count in section header.

**3.3** Component registry counts — `packages/ui/src/component-registry.ts`:
Increment `totalCount`, category `count`, add to category `examples` array.

**3.4** Update ALL 13 count surfaces:

| File | What to update |
|------|---------------|
| `apps/web/public/llms-full.txt` | Header, summary, category count |
| `apps/web/public/llms.txt` | Component count |
| `apps/web/public/.well-known/ai-plugin.json` | Description fields |
| `apps/web/public/.well-known/mcp-server.json` | Description |
| `apps/web/app/layout.tsx` | PRODUCT_DESCRIPTION |
| `apps/web/app/docs/layout.tsx` | description, OG, JSON-LD |
| `packages/ui/package.json` | description |
| `packages/ui/src/component-registry.ts` | totalCount, category count |
| `packages/ui/.claude/CLAUDE.md` | Summary + API ref line |
| `packages/ui/README.md` | Description |
| `packages/mcp/src/registry.ts` | Top comment |
| `README.md` (root) | Count, tree, summary |
| `templates/nextjs-app/app/page.tsx` | Card description |

**Catch missed counts:**
```bash
grep -rn "\bOLD_COUNT\b" apps/web/public/ apps/web/app/layout.tsx apps/web/app/docs/layout.tsx packages/ui/package.json packages/ui/.claude/CLAUDE.md packages/ui/README.md README.md
```

### Phase 4: Verify

```bash
pnpm build --filter @opencosmos/ui    # Library builds
pnpm build --filter web            # App builds, new page in output
```

Then test locally (`pnpm dev --filter web`):
- `/docs/[category]/your-component` renders
- `/docs/components/your-component` redirects correctly
- Cmd+K search finds component
- Sidebar shows component under correct category
- `/sitemap.xml` includes URL
- `/docs/api.json` includes component
- Stale count grep returns 0 matches
- CHANGELOG.md updated

### Phase 5: Publish

```bash
pnpm changeset                     # Create changeset (minor for new component)
pnpm version-packages              # Version bump
pnpm release                       # Build + publish
```

### Why Every Surface Matters

| Surface | What breaks if skipped |
|---------|----------------------|
| Route config (`SECTION_ITEMS`) | Page 404s, missing from sitemap, redirect handler fails |
| llms-full.txt | AI assistants can't generate correct code |
| MCP registry | `get_component` and `search_components` return nothing |
| Count surfaces | Audits flag inconsistencies, credibility reduced |
| Search index | Users can't find via Cmd+K |
| Sidebar navigation | Not visible in docs |

### Registration Troubleshooting

**Component page 404s** → Check `SECTION_ITEMS` in route-config.ts — slug listed under correct category? Check `routeConfig` children entry exists.

**Not in search** → Verify entry in search-index.ts. Path must use `/docs/[category]/[slug]` format, NOT hash links.

**Not in sitemap** → Sitemap auto-generates from `SECTION_ITEMS`. If it's in route-config, it's in the sitemap.

**Not in api.json** → Check `packages/mcp/src/registry.ts` — api.json auto-generates from this.

**TypeScript errors in Studio** → Rebuild: `pnpm build --filter @opencosmos/ui`

**npm publish fails** → `npm whoami` (logged in?), verify `@thesage` org access, check version is unique.

---

## Eject System

Three paths for users to eject component source:

1. **CLI:** `npx @opencosmos/ui eject Button [--dir path]`
2. **Web UI:** Eject button on each component page at opencosmos.ai/studio
3. **MCP:** `eject_component` tool returns transformed source

Import transform rules (in `packages/ui/src/cli.ts`):
- `../../lib/utils` → `./utils` (auto-scaffolded cn utility)
- `../../hooks/*` → `@opencosmos/ui/hooks`
- `../../lib/*` → `@opencosmos/ui/utils`
- `../[category]/*` → `@opencosmos/ui`

Ejected components retain full theme compatibility via CSS variables.

---

## OpenCosmos Studio (`apps/web`)

Interactive documentation at [opencosmos.ai/studio](https://opencosmos.ai/studio/).

### Key Files

| File | Purpose |
|------|---------|
| `app/docs/route-config.ts` | **Source of truth** for all routes, sidebar, sitemap |
| `app/components/lib/component-registry.tsx` | Component configs (props, examples, accessibility) |
| `app/lib/navigation-tree.tsx` | Sidebar navigation structure |
| `app/lib/search-index.ts` | Cmd+K search entries |
| `app/api/eject/[component]/route.ts` | Eject API endpoint |
| `public/llms-full.txt` | Complete AI-readable reference |
| `public/llms.txt` | Concise AI-readable summary |

### Route Architecture

Routes follow `/docs/[section]/[item]` pattern. `generateStaticParams` reads from `SECTION_ITEMS` in route-config.ts. Adding a route = adding to `SECTION_ITEMS` + `routeConfig`.

---

## Build & Quality

### Commands

```bash
pnpm dev --filter web              # OpenCosmos Studio at localhost:3001
pnpm build                         # Build all (Turborepo-ordered)
pnpm build --filter @opencosmos/ui    # Library only
pnpm --filter @opencosmos/ui test     # 156 tests (Vitest)
pnpm --filter @opencosmos/ui lint     # ESLint
pnpm --filter @opencosmos/ui typecheck # TypeScript strict
pnpm --filter @opencosmos/ui size:check # Bundle size limits
```

### Publishing

```bash
pnpm changeset                     # Create changeset entry
pnpm version-packages              # Version bump + changelog
pnpm release                       # Build + publish to npm
```

### CI (`.github/workflows/ci.yml`)

Runs on every PR and push to main: build → lint → typecheck → test → size:check. Node 24, pnpm 10.26.1+.

### Bundle Size Limits (Enforced)

| Entry | Limit |
|-------|-------|
| Core | 450 KB |
| Hooks | 40 KB |
| Providers | 60 KB |
| Tokens | 70 KB |
| Utils | 25 KB |
| Forms/Tables/DnD | 10–11 KB |
| Dates | 33 KB |
| WebGL | 10 KB |

### Clear Stale Caches

```bash
rm -rf .turbo packages/ui/dist apps/web/.next && pnpm build
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| React | React | 19.2.1 |
| TypeScript | strict mode | 5 |
| Styling | Tailwind CSS | 4 |
| Animation | Framer Motion | 12 |
| State | Zustand | 5 |
| UI Primitives | Radix UI | 25+ headless |
| Icons | Lucide React | 0.562+ |
| Build | tsup | 8 (ESM + CJS) |
| Testing | Vitest + Testing Library | 4 + 16 |
| Monorepo | Turborepo | latest |
| Package Manager | pnpm | 10.26.1+ |
| Node | (see .nvmrc) | 24 |
| Versioning | Changesets | latest |
| Deployment | Vercel | auto-deploy main |

---

## Coding Rules

### Always

- Check `useMotionPreference()` before animating — intensity 0 must work perfectly
- Use CSS variables for colors — `bg-background`, `text-foreground`, `var(--color-primary)`
- Use existing `@opencosmos/ui` components before writing custom JSX
- Use named exports, never default exports
- Follow the component registration workflow completely (all 6 surfaces — see "Adding a Component" above)
- Update CHANGELOG.md for significant changes
- Keep bundle sizes within limits

### Never

- Hardcode colors (`bg-white`, `text-black`, `bg-neutral-100`)
- Use atomic design terms (atoms, molecules, organisms)
- Make breaking changes without discussion and the full protocol
- Skip accessibility (WCAG AA, keyboard nav, screen reader, focus states)
- Create duplicate utilities — consolidate into existing modules
- Animate without checking motion preferences

---

## Accessibility Checklist

Every component must:

- [ ] Work at motion intensity 0 (no animation, no degradation)
- [ ] Be keyboard navigable with visible focus states
- [ ] Be screen reader compatible (semantic HTML, ARIA)
- [ ] Meet WCAG AA color contrast (4.5:1 for text)
- [ ] Not convey information by color alone

---

## Common Mistakes

**Bracket mismatches in large config files** — route-config.ts, navigation-tree.tsx, and registry.ts are large objects. Double-check bracket nesting.

**Assuming component props** — Read the component source to verify available props. Don't hallucinate `className` support or other props.

**Stale types after pulling** — Run `pnpm build --filter @opencosmos/ui` to regenerate `.d.ts` declarations.

**Tailwind not processing** — Verify `content` paths in Tailwind config match actual file structure.

**Black shader previews** — For WebGL components: don't branch in GLSL. Always run the animation path; control from JavaScript (set `uProgress = 1.0` to skip).

**Forgetting count surfaces** — Adding a component requires updating 13 files that reference the total count. Use the grep check in Phase 3.4 above.

---

## Git Conventions

```
type(scope): description
```

**Types:** feat, fix, docs, style, refactor, test, chore
**Scopes:** ui, tokens, mcp, web, ci
**Branches:** `type/brief-description`

---

## Your Role

You're a partner in creative work, not a code generator. Every component embodies a philosophy: making users feel **seen**, **capable**, and **empowered**.

- Ask clarifying questions when intent is unclear
- Propose options, don't make unilateral decisions
- Ship working over perfect
- When in doubt, ask Shalom
