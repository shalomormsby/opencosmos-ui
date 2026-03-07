# AGENTS.md

> **For AI coding agents working on Sage Design Engine. Read [DESIGN-PHILOSOPHY.md](DESIGN-PHILOSOPHY.md) first — it's the North Star. This file tells you how to build in alignment with it.**

Last updated: 2026-03-07

---

## Quick Orientation

**Sage Design Engine (SDE)** is the source of truth for the Sage design system — the component library, design tokens, MCP server, and interactive documentation site. Everything published under the `@thesage/*` npm scope originates here.

This repo is **not** the product ecosystem. Consumer applications (portfolio, creative-powerup, sage-stocks) live in a separate [ecosystem repo](https://github.com/shalomormsby/ecosystem). Those apps install `@thesage/ui` from npm. This repo is where those packages are built, tested, documented, and published.

```
sage-design-engine/
├── packages/
│   ├── ui/                  # @thesage/ui — Component library (THE HEART)
│   │   └── src/
│   │       ├── components/  # Functionally organized (actions, forms, navigation, etc.)
│   │       ├── lib/         # Utilities (cn, validation, animations)
│   │       ├── hooks/       # useTheme, useMotionPreference, etc.
│   │       └── providers/   # ThemeProvider, etc.
│   ├── tokens/              # @thesage/tokens — Design tokens (colors, typography, spacing, motion, syntax)
│   └── mcp/                 # @thesage/mcp — MCP server for AI assistants (8 tools)
├── apps/
│   └── web/                 # Sage Studio — Interactive docs at thesage.dev
├── .agent/                  # Agent workflows (archived)
├── .github/workflows/       # CI: build, lint, typecheck, test, size-check
├── docs/                    # Planning docs, audits, guides
├── DESIGN-PHILOSOPHY.md     # The North Star
├── CHANGELOG.md             # Work history
└── CONTRIBUTING.md          # Contribution guidelines
```

---

## If This Is Your First Time

**Do these 4 things before writing any code:**

1. **Read [DESIGN-PHILOSOPHY.md](DESIGN-PHILOSOPHY.md)** — The four principles (Emotionally Resonant, User Control & Freedom, Transparent by Design, Generous by Design) govern every decision.

2. **Verify your setup works:**
   ```bash
   pnpm install
   pnpm build
   pnpm dev --filter web
   ```
   Sage Studio should run on **http://localhost:3001** (or next available port).

3. **Check current work context:**
   ```bash
   git status
   git log -5 --oneline
   ```

4. **Read the workflow for your task type:**
   - Adding a component → See the full workflow in [.claude/CLAUDE.md](.claude/CLAUDE.md#adding-a-component-complete-workflow)
   - Modifying existing behavior → Read the component source first, then check for tests

---

## Repository Architecture

### Three Published Packages

| Package | Version | Purpose |
|---------|---------|---------|
| **@thesage/ui** | 1.3.1 | 100 accessible React components, 3 themes, motion system, eject CLI |
| **@thesage/tokens** | 1.0.1 | Design tokens (colors, typography, spacing, motion, syntax highlighting) |
| **@thesage/mcp** | 0.8.3 | MCP server with 8 tools for AI assistants to discover and use components |

### One Application

| App | Purpose | URL |
|-----|---------|-----|
| **Sage Studio** (`apps/web`) | Interactive docs, component playground, eject UI | [thesage.dev](https://thesage.dev) |

### Relationship to Ecosystem

```
sage-design-engine (this repo)          ecosystem (separate repo)
┌─────────────────────┐                 ┌────────────────────────┐
│ packages/ui         │──npm publish──▶ │ apps/portfolio         │
│ packages/tokens     │                 │ apps/creative-powerup  │
│ packages/mcp        │                 │ apps/sage-stocks       │
│ apps/web (Studio)   │                 │ packages/sage-ai (WIP) │
└─────────────────────┘                 └────────────────────────┘
```

- SDE packages are published to npm. Consumer apps install from npm (`@thesage/ui: ^1.3.1`), not workspace references.
- Sage Studio (`apps/web`) uses `workspace:*` references to the local packages for live development.
- The ecosystem repo has its own AGENTS.md, CLAUDE.md, and workflows.

---

## File Organization Rules

These are strict. Follow them to prevent entropy.

| If you're creating... | Put it in... |
|----------------------|--------------|
| Shared component | `packages/ui/src/components/[category]/` |
| Shared hook | `packages/ui/src/hooks/` |
| Shared utility | `packages/ui/src/lib/` |
| Shared provider | `packages/ui/src/providers/` |
| Design tokens | `packages/tokens/src/` |
| MCP tool or registry entry | `packages/mcp/src/` |
| Studio-specific component | `apps/web/app/components/` |
| Studio-specific page logic | `apps/web/app/` (App Router) |
| Studio-specific utility | `apps/web/app/lib/` |
| Documentation (internal/planning) | `docs/` |

### Functional Categories for Components

Components are organized by **primary purpose**, not abstract hierarchy:

| Category | Purpose | Examples |
|----------|---------|----------|
| `actions/` | Triggers behavior | Button, Toggle, ToggleGroup |
| `forms/` | Collects data | Input, Select, Switch, Slider, SearchBar, Textarea |
| `navigation/` | Moves through content | Tabs, Breadcrumb, Pagination, Command |
| `overlays/` | Contextual content above UI | Dialog, Sheet, Popover, Tooltip, Drawer |
| `feedback/` | Communicates system state | Alert, Toast, Progress, Skeleton |
| `data-display/` | Presents information | Card, Table, Avatar, Badge, Calendar |
| `layout/` | Spatial organization | Accordion, Separator, ScrollArea, Carousel |
| `backgrounds/` | Visual surface effects | GlassSurface |
| `cursor/` | Pointer customization | CustomCursor |
| `blocks/` | Preset UI patterns | (Composite component blocks) |
| `features/` | Philosophy-embodying features | Customizer, ThemeSwitcher |

**When uncertain:** Choose based on the component's **primary purpose**. Ask if still unclear.

---

## Import Patterns

### Main exports (most common)
```typescript
import { Button, Card, Dialog, useTheme } from '@thesage/ui'
```

### Subpath exports (10 available)
```typescript
import { useMotionPreference, useTheme } from '@thesage/ui/hooks'
import { ThemeProvider } from '@thesage/ui/providers'
import { cn } from '@thesage/ui/utils'
import { spacing, typography } from '@thesage/ui/tokens'
import { Form, FormField } from '@thesage/ui/forms'
import { DatePicker } from '@thesage/ui/dates'
import { DataTable } from '@thesage/ui/tables'
import { SortableList } from '@thesage/ui/dnd'
import '@thesage/ui/globals.css'
```

### Never use
```typescript
// ❌ Legacy — don't use
import { Button } from '@thesage/ui/atoms'
import { Card } from '@ecosystem/design-system'
```

---

## Key Patterns & Conventions

### Motion Must Respect Preferences

```typescript
import { useMotionPreference } from '@thesage/ui/hooks'

function AnimatedComponent() {
  const { shouldAnimate, scale } = useMotionPreference()

  return (
    <motion.div
      animate={{ opacity: 1, y: shouldAnimate ? 20 : 0 }}
      transition={{ duration: shouldAnimate ? 0.3 : 0 }}
    />
  )
}
```

**Never animate without checking preferences.** Intensity 0 must work perfectly — no degraded experience.

### CSS Variables Over Hardcoded Colors

```typescript
// ✅ Theme-aware
className="bg-background text-foreground border-border"

// ❌ Hardcoded
className="bg-white text-black border-gray-200"
```

All styling must respect the active theme (Studio, Terra, or Volt) in both light and dark modes.

### Use Design System Components First

Always search for existing `@thesage/ui` components before writing custom JSX. If a component doesn't exist and should, mention it and offer to create it following the workflow in [CLAUDE.md](.claude/CLAUDE.md).

### Named Exports Only

```typescript
// ✅ Named export
export function Button({ children, ...props }: ButtonProps) { ... }

// ❌ Default export
export default function Button() { ... }
```

---

## Multi-Theme System

Three themes with distinct personalities, each with light and dark modes:

| Theme | Personality | Aesthetic |
|-------|------------|-----------|
| **Studio** | Professional, balanced | Framer / Vercel / Linear |
| **Terra** | Calm, organic | Warm earth tones, natural |
| **Volt** | Bold, electric | Cyberpunk neon, high energy |

- Runtime switching via CSS variables (not Tailwind JIT recompilation)
- `ThemeProvider` injects CSS variables
- Zustand manages state with localStorage persistence

---

## Motion System

- Every animation respects `useMotionPreference()` hook
- User-controlled 0–10 intensity scale
- Intensity 0 = instant state changes (no animation, no degradation)
- Theme-specific durations and easing curves
- Syncs with system `prefers-reduced-motion`

---

## Eject System

Three ways users can eject component source for full customization:

1. **CLI:** `npx @thesage/ui eject Button [--dir path]`
2. **Web UI:** Eject button on every component page at thesage.dev
3. **MCP:** AI assistants use `eject_component` tool to get transformed source

Ejected components retain theme compatibility (CSS variables). Internal imports are transformed to package-level imports automatically.

---

## Adding a New Component

**Follow the complete workflow in [.claude/CLAUDE.md](.claude/CLAUDE.md#adding-a-component-complete-workflow).**

A component is not "done" until registered across **6 surfaces:** Library, Docs routing, Studio (playground + sidebar + search), AI surfaces (MCP registry + llms-full.txt), SEO (auto-generated from route config), and Package metadata (13 files reference total count — all must stay consistent).

**Do not skip steps.** Incomplete registration = component not discoverable.

---

## Breaking Changes Protocol

**Stop and discuss with Shalom first.** Then:

1. Search for all usages across this repo and the ecosystem repo
2. Get explicit approval
3. Version bump (major for breaking)
4. Update CHANGELOG.md with `BREAKING CHANGES` section and migration guide
5. Update all consuming code in the same commit where possible
6. Verify all builds pass

**Prefer deprecation over immediate removal** — give users time to migrate.

---

## Build & Development

### Commands

```bash
# Development
pnpm dev --filter web              # Start Sage Studio (localhost:3001)

# Build
pnpm build                         # Build everything (packages first, then apps)
pnpm build --filter @thesage/ui    # Build component library only
pnpm build --filter web            # Build Studio app only

# Quality
pnpm --filter @thesage/ui lint       # Lint component library
pnpm --filter @thesage/ui typecheck  # TypeScript check
pnpm --filter @thesage/ui test       # Run tests (Vitest, 156 tests)
pnpm --filter @thesage/ui size:check # Bundle size limits

# Publishing (via Changesets)
pnpm changeset                       # Create changeset entry
pnpm version-packages                # Version bump from changesets
pnpm release                         # Build + publish to npm
```

### Build Order

Turborepo handles dependency-aware ordering automatically:

1. `@thesage/tokens` (no deps)
2. `@thesage/ui` (depends on tokens)
3. `@thesage/mcp` (depends on ui)
4. `apps/web` (depends on all packages via `workspace:*`)

### Bundle Size Limits

Enforced in CI. Every export has a size ceiling:

| Entry | Limit |
|-------|-------|
| Core (index) | 450 KB |
| Hooks | 40 KB |
| Providers | 60 KB |
| Tokens | 70 KB |
| Utils | 25 KB |
| Forms | 11 KB |
| Dates | 33 KB |
| Tables | 10 KB |
| DnD | 10 KB |
| WebGL | 10 KB |

### CI Pipeline

Runs on every PR and push to main (`.github/workflows/ci.yml`):

1. `pnpm build` — all packages and apps
2. `pnpm --filter @thesage/ui lint`
3. `pnpm --filter @thesage/ui typecheck`
4. `pnpm --filter @thesage/ui test` (Vitest)
5. `pnpm --filter @thesage/ui size:check`

Node 24, pnpm 10.26.1+.

### Clear Stale Caches

```bash
rm -rf .turbo packages/ui/dist apps/web/.next && pnpm build
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | React Server Components, streaming |
| React | React 19.2.1 | peerDep supports 18+ |
| Language | TypeScript 5 | Strict mode |
| Styling | Tailwind CSS 4 | Via CSS variables |
| Animation | Framer Motion 12 | Respects motion preferences |
| State | Zustand 5 | localStorage persistence |
| UI Primitives | Radix UI | 25+ headless components |
| Icons | Lucide React | Consistent iconography |
| Build | tsup 8 | ESM + CJS, tree-shakeable |
| Testing | Vitest 4 + Testing Library 16 | 156 tests, 30 files |
| Monorepo | Turborepo | Dependency-aware caching |
| Package Manager | pnpm 10.26.1+ | Workspace support |
| Deployment | Vercel | Auto-deploys main |
| Versioning | Changesets | Semantic versioning + changelogs |

---

## Accessibility Requirements

Non-negotiable. Every component must:

- Work with `prefers-reduced-motion: reduce` (motion intensity 0 = perfect experience)
- Be keyboard navigable (tab order, focus indicators)
- Be screen reader compatible (semantic HTML, ARIA)
- Meet WCAG AA color contrast (4.5:1 for text)
- Have visible focus states on interactive elements
- Not convey information by color alone

---

## Git Conventions

### Commit Messages

```
type(scope): description

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scopes:** `ui`, `tokens`, `mcp`, `web`, `ci`

**Example:**
```
feat(ui): add GlassSurface component with frosted glass effect

Implements CSS backdrop-filter with fallback for unsupported browsers.
Respects motion preferences for shimmer animation.
```

### Branch Naming

`type/brief-description` — e.g., `feat/glass-surface`, `fix/dialog-focus-trap`

---

## Changelog

Every significant change must be logged in [CHANGELOG.md](CHANGELOG.md) with an ISO timestamp.

**Log:** New components, features, breaking changes, dependency updates, bug fixes.
**Skip:** Typo fixes, formatting, internal refactors with no behavior change.

---

## Common Gotchas

### Syntax Errors in Large Config Files
Route config, navigation tree, and registry files are large and easy to break with mismatched brackets. Double-check bracket matching before committing.

### Prop Hallucination
Don't assume components accept props like `className` without reading the source. Check the component file or its types.

### Tailwind Not Processing
If styles don't apply, verify `content` paths in the Tailwind config match actual file locations.

### TypeScript Errors After Pulling
Rebuild the library to regenerate type definitions:
```bash
pnpm build --filter @thesage/ui
```

### Black Shader Previews
For WebGL/shader components: don't branch in GLSL. Always run the animation path, controlling from JavaScript (e.g., set `uProgress` to `1.0` to skip effects).

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `DESIGN-PHILOSOPHY.md` | North Star — four principles |
| `CHANGELOG.md` | Work history |
| `.claude/CLAUDE.md` | Primary AI context + component registration workflow |
| `packages/ui/package.json` | Package config, exports map, size limits, bin |
| `packages/ui/tsup.config.ts` | Build config (library + CLI) |
| `packages/mcp/src/registry.ts` | Component metadata for AI discovery |
| `apps/web/app/docs/route-config.ts` | Source of truth for all doc routes |
| `apps/web/app/components/lib/component-registry.tsx` | Studio component configs |
| `apps/web/app/lib/navigation-tree.tsx` | Sidebar navigation |
| `apps/web/app/lib/search-index.ts` | Cmd+K search entries |
| `apps/web/public/llms-full.txt` | Full AI-readable component reference |
| `.github/workflows/ci.yml` | CI pipeline definition |

---

## What NOT to Do

- Make major architectural decisions without discussing with Shalom
- Skip accessibility requirements
- Hardcode colors instead of CSS variables
- Animate without checking motion preferences
- Use atomic design terminology (atoms/molecules/organisms)
- Create one-off utilities — consolidate into existing modules
- Skip steps in the component registration workflow
- Over-engineer — only make changes directly requested or clearly necessary
- Push breaking changes without the protocol above
- Add emojis to UI unless explicitly requested
- Create markdown files unless explicitly requested

---

## Decision Framework

**Priority order:**
1. **Functional** — It must work
2. **Honest** — It must be true to what it claims
3. **Lovable** — It should delight
4. **Perfect** — Polish comes last

**When uncertain, ask:**
1. Does this embody one of the four principles?
2. Does this serve the human, or the system?
3. Would this make someone feel more capable, or more confused?

**Ship working over perfect. One excellent thing over three mediocre things.**

---

## Remember

You're not just writing code. You're embodying a philosophy. Every component should make users feel **seen**, **capable**, and **empowered**.

When in doubt, ask Shalom. You're a partner in creative work, not a code generator.
