# SDE Improvement Plan: Speedboat-Ready Component Engine

> **Goal:** Make the OpenCosmos UI a performant, production-ready UI engine for building Moloco Speedboat sandbox apps via AI-assisted workflows (Claude Code, Cursor, etc.).
>
> **Last updated:** 2026-02-17 12:00 AM PST
> **Status:** Phases 0 + 2 complete. Phases 1, 3-7 pending.
> **Author:** Shalom Ormsby + Claude Opus 4.6

---

# Phased Improvement Plan

This plan is derived from a comprehensive evaluation of SDE (v1.1.1, 99 components) against the requirements of `speedboat-sandbox/design-code-play` — a Vite + React 19 + TypeScript app that currently uses Radix UI Themes with hand-rolled inline styles and a custom `theme.ts` token file extracted from Figma (Speedboat V2).

The evaluation scored SDE at **103/130** vs shadcn/ui's **114/130**. Excluding the unclosable Community gap (-12), SDE leads by +1 on closable dimensions. The shortfalls below are ordered by impact on Speedboat's app-building mission.

---

## Phase 0: Foundation Fixes (DONE)

> Fixes already completed in prior work. Verified against source and live endpoints.

- [x] Component page 404s — added 308 redirect from `/docs/components/[item]` to `/docs/[category]/[item]`
- [x] Dynamic sitemap — replaced static `public/sitemap.xml` with `app/sitemap.ts` (~140 URLs)
- [x] Data consistency — aligned component count to 99 across all surfaces (llms.txt, api.json, ai-plugin.json, mcp-server.json, package.json, layout.tsx)
- [x] llms-full.txt — added 7 missing components (EmptyState, FileUpload, NotificationCenter, StatCard, Stepper, Timeline, TreeView), updated MCP tools section to 8 tools, bumped version to 1.1.0
- [x] npm keywords + MIT LICENSE — added to `packages/ui/package.json` and repo root
- [x] Test coverage — 156 tests across 30 files
- [x] CI/CD pipeline — lint + typecheck + test + size:check
- [x] MCP server v0.8.1 — 8 tools (list, search, get, install, app_shell, examples, audit, eject)
- [x] `.claude/CLAUDE.md` shipped in npm package
- [x] AI discovery endpoints — `.well-known/ai-plugin.json`, `.well-known/mcp-server.json`, `robots.txt`

---

## Phase 1: Speedboat Theme (Priority: CRITICAL)

> **Why:** SDE ships Studio/Terra/Volt themes. None match Speedboat's visual language. Without a Speedboat theme, every app built with SDE looks like a generic design system demo, not a Moloco product. This is the #1 prerequisite for adoption.

### What "Speedboat Theme" Means

A 4th theme called `speedboat` that maps all SDE CSS variables to Speedboat V2 design tokens. When active, every SDE component — Button, Card, DataTable, Dialog — renders with Speedboat's exact colors, fonts, spacing, and radii. No per-component overrides needed.

### Source Tokens (from `design-code-play/frontend/src/theme.ts`)

These are the Figma-extracted values that define the Speedboat visual identity:

```
COLORS:
  accent:        #346BEA     (Core/Blue500-Accent)
  white:         #FFFFFF
  blue600:       #1E49AA     (chip text, emphasis)
  blue300:       #A6C1FF     (chip borders)
  blue200:       #D3E1FF     (chip label bg)
  blue100:       #EBF0FD     (chip bg)
  grey900:       #212121     (ContentPrimary)
  grey700:       #5D5D5D     (ContentSecondary)
  grey500:       #8891A7     (muted icons, checkbox borders)
  grey200:       #DFDFDF     (input borders)
  grey100:       #ECECEC     (BorderPrimary)
  grey50:        #F8F8F8     (BGSecondary)
  success:       #2E7D32     successLight: #E8F5E9   successBorder: #81C784
  warning:       #E65100     warningLight: #FFF8E1   warningBorder: #FFB74D
  error:         #C62828     errorLight: #FFEBEE     errorBorder: #EF9A9A
  info:          #346BEA     infoLight: #EBF0FD      infoBorder: #A6C1FF

FONTS:
  primary:       'Roboto', -apple-system, BlinkMacSystemFont, sans-serif
  brand:         'Montserrat', sans-serif

FONT SIZES:     xs:10px  sm:12px  base:14px  lg:16px  xl:18px  2xl:20px  3xl:24px
SPACING:        xs:4px   sm:6px   md:8px     lg:12px  xl:16px  2xl:20px  3xl:24px  4xl:32px
RADII:          sm:4px   md:6px   lg:8px     xl:12px  pill:100px
SHADOWS:        sm: 0 1px 2px rgba(0,0,0,0.05)   md: 0 2px 8px rgba(0,0,0,0.08)
```

### Token Mapping (Speedboat → SDE CSS Variables)

| SDE CSS Variable | Speedboat Light Value | Source |
|---|---|---|
| `--color-background` | `#FFFFFF` | white |
| `--color-background-secondary` | `#F8F8F8` | grey50 |
| `--color-background-tertiary` | `#ECECEC` | grey100 |
| `--color-foreground` | `#212121` | grey900 |
| `--color-text-primary` | `#212121` | grey900 |
| `--color-text-secondary` | `#5D5D5D` | grey700 |
| `--color-text-muted` | `#8891A7` | grey500 |
| `--color-primary` | `#346BEA` | accent |
| `--color-primary-foreground` | `#FFFFFF` | white |
| `--color-secondary` | `#EBF0FD` | blue100 |
| `--color-secondary-foreground` | `#1E49AA` | blue600 |
| `--color-accent` | `#346BEA` | accent |
| `--color-accent-foreground` | `#FFFFFF` | white |
| `--color-border` | `#ECECEC` | grey100 |
| `--color-input` | `#DFDFDF` | grey200 |
| `--color-ring` | `#346BEA` | accent |
| `--color-success` | `#2E7D32` | success |
| `--color-warning` | `#E65100` | warning |
| `--color-error` | `#C62828` | error |
| `--color-info` | `#346BEA` | info |
| `--color-hover` | `#F8F8F8` | grey50 |
| `--color-active` | `#ECECEC` | grey100 |
| `--color-card` | `#FFFFFF` | white |
| `--color-card-foreground` | `#212121` | grey900 |
| `--color-muted` | `#F8F8F8` | grey50 |
| `--color-muted-foreground` | `#8891A7` | grey500 |
| `--color-destructive` | `#C62828` | error |
| `--color-destructive-foreground` | `#FFFFFF` | white |
| `--color-surface` | `#F8F8F8` | grey50 |
| `--color-glass` | `rgba(255, 255, 255, 0.85)` | derived |
| `--color-glass-border` | `rgba(0, 0, 0, 0.08)` | derived |
| `--color-link` | `#346BEA` | accent |
| `--color-link-hover` | `#1E49AA` | blue600 |
| `--font-heading` | `'Montserrat', sans-serif` | brand font |
| `--font-body` | `'Roboto', -apple-system, sans-serif` | primary font |
| `--effect-shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | shadows.sm |
| `--effect-shadow-md` | `0 2px 8px rgba(0,0,0,0.08)` | shadows.md |

### Dark Mode

Speedboat V2 does not currently have a dark mode specification. Two options:

**Option A (recommended):** Derive a dark mode automatically by inverting the light palette — dark backgrounds (#1a1a2e or similar), light text, same accent blue. This enables SDE's dark mode toggle to work out of the box.

**Option B:** Set dark mode to be identical to light mode (effectively disabling it). Not recommended because it breaks the mode toggle UX.

### Token Structure (must match `studio.ts` exactly)

The new `speedboatTokens` object must have `light` and `dark` keys, each containing `colors` and `effects`. Every property in `studio.ts` must be present. Reference `packages/tokens/src/studio.ts` for the exact shape.

**Properties in `colors` (all required):**
```
background, backgroundSecondary, backgroundTertiary,
foreground, foregroundSecondary, foregroundTertiary,
primary, primaryForeground,
secondary, secondaryForeground,
accent, accentForeground,
border, borderSubtle,
hover, active,
linkHover, linkHoverForeground,
success, successForeground,
warning, warningForeground,
error, errorForeground,
info, infoForeground,
card, cardForeground,
popover, popoverForeground,
muted, mutedForeground,
destructive, destructiveForeground,
input, ring, surface,
glass, glassBorder
```

**Properties in `effects` (all required):**
```
blur: { sm, md, lg, xl }
shadow: { sm, md, lg, xl, '2xl' }
```

### Important: Which CSS Variables Are Theme-Switched

ThemeProvider's `getThemeVars()` (line 42) maps token properties to CSS variables at runtime. **Not all variables** in `globals.css` are overridden by ThemeProvider. Specifically:

**Theme-switched by `getThemeVars` (lines 48-131):** `--color-background`, `--color-background-secondary`, `--color-background-tertiary`, `--color-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-success/warning/error/info` + foregrounds, `--color-glass`, `--color-glass-border`, `--color-text-primary/secondary/muted`, `--color-surface`, `--color-border`, `--color-focus`, `--color-link`, `--color-ring`, `--color-hover`, `--color-active`, `--color-link-hover`, `--effect-blur-*`, `--effect-shadow-*`, `--font-heading/body/mono`, `--ease-default/spring`, `--syntax-*`, `--code-*`

**NOT theme-switched (set only in `globals.css` defaults):** `--color-card`, `--color-card-foreground`, `--color-popover`, `--color-popover-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-input`, `--radius`

**Recommendation:** Add these missing mappings to `getThemeVars` as part of Phase 1. This benefits all themes, not just Speedboat. The token properties (`card`, `popover`, `muted`, `destructive`, `input`) already exist in `studio.ts`/`terra.ts`/`volt.ts` — they're just not wired up.

### Font Wiring (Key Detail)

Speedboat's fonts (Roboto and Montserrat) are **already loaded** in `apps/web/lib/fonts.ts`:
- `roboto` at line 132 → CSS variable `--font-roboto`
- `montserrat` at line 160 → CSS variable `--font-montserrat`
- Both are included in `allFontVariables` (line 279) applied to `<html>` in `layout.tsx:59`

**No new font imports needed.** The `fontFamilies` map in ThemeProvider (line 22) just needs a `speedboat` entry pointing to the existing CSS variables:

```ts
speedboat: {
  heading: 'var(--font-montserrat)',
  body: 'var(--font-roboto)',
  mono: 'var(--font-mono)',
},
```

### ThemeSwitcher vs CustomizerPanel

**`ThemeSwitcher`** (`packages/ui/src/components/forms/ThemeSwitcher.tsx`) is a **light/dark mode toggle only**. It does NOT show theme options (Studio/Terra/Volt). No changes needed for Phase 1.

**`CustomizerPanel`** (`packages/ui/src/components/layout/CustomizerPanel.tsx`) is where themes are selected. It has a **hardcoded** theme list at lines 192-196:
```tsx
{ id: 'studio', label: 'Studio', icon: <Building2 /> },
{ id: 'terra', label: 'Terra', icon: <Leaf /> },
{ id: 'volt', label: 'Volt', icon: <Zap /> },
```
Grid is `grid-cols-3` (line 192). Changes needed:
1. Add `{ id: 'speedboat', label: 'Speedboat', icon: <Rocket /> }` (import `Rocket` from lucide-react)
2. Change `grid-cols-3` to `grid-cols-4`
3. Add `speedboat` case to font preview section (lines 223-234)

### Files to Modify

| File | Change | Line References |
|---|---|---|
| `packages/tokens/src/speedboat.ts` | **CREATE** — export `speedboatTokens` with `light`/`dark` keys containing `colors` (37 properties) + `effects` (blur + shadow). Copy structure from `studio.ts`, replace values with Speedboat tokens. | Template: `studio.ts` (131 lines) |
| `packages/tokens/src/index.ts` | Add `export * from './speedboat'` after line 8. Add `'speedboat'` to `THEME_NAMES` array at line 19. | Lines 8, 19 |
| `packages/ui/src/providers/ThemeProvider.tsx` | (1) Import `speedboatTokens` at line 11. (2) Add `speedboat: speedboatTokens` to `themeTokens` at line 18. (3) Add `speedboat` entry to `fontFamilies` at line 37. (4) Add missing CSS variable mappings to `getThemeVars` for card/popover/muted/destructive/input. | Lines 11, 15-19, 22-37, 42-131 |
| `packages/ui/src/components/layout/CustomizerPanel.tsx` | (1) Import `speedboatTokens` at line 4, add `Rocket` to lucide-react import at line 3. (2) Add Speedboat to theme array at line 196. (3) Change `grid-cols-3` to `grid-cols-4` at line 192. (4) Add `speedboat` cases to font preview ternaries at lines 223-234. | Lines 3-4, 192-196, 223-234 |
| `packages/tokens/src/fontThemes.ts` | **Optional:** Add a `speedboat` entry to the `fontThemes` array for the font selector UI. Not required for theme to function. | After line 142 (professional section) |
| `packages/ui/src/lib/store/theme.ts` | **No change needed** — `ThemeName` type auto-updates from `@opencosmos/tokens`. | — |
| `apps/web/lib/fonts.ts` | **No change needed** — Roboto and Montserrat already loaded with `--font-roboto` and `--font-montserrat` CSS variables. | Lines 132, 160 |
| `apps/web/app/layout.tsx` | **No change needed** — `allFontVariables` already includes Roboto + Montserrat. | Line 59 |
| `apps/web/app/components/studio/TokensSection/TypographyTab.tsx` | Add `speedboat` case to hardcoded font display names (heading: 'Montserrat', body: 'Roboto'). | Lines 11-22 |

### Acceptance Criteria

- [ ] `<ThemeProvider>` with `useThemeStore.setState({ theme: 'speedboat', mode: 'light' })` renders all components with Speedboat colors/fonts
- [ ] `useTheme().setTheme('speedboat')` switches to Speedboat theme at runtime — all components update
- [ ] `<CustomizerPanel />` shows Speedboat as a 4th theme option with Rocket icon
- [ ] Dark mode renders a reasonable dark variant (not identical to light)
- [ ] Accent blue (#346BEA) is used for primary buttons, links, focus rings, badges
- [ ] Body text uses Roboto; headings use Montserrat
- [ ] Input borders use grey200 (#DFDFDF), not the default SDE border color
- [ ] Success/warning/error semantic colors match Speedboat's palette exactly
- [ ] `--color-card`, `--color-muted`, `--color-destructive`, `--color-popover`, `--color-input` are correctly theme-switched (new `getThemeVars` mappings)
- [ ] All 99 components render correctly with the Speedboat theme (no missing CSS variable fallbacks)
- [ ] `pnpm build` passes for `@opencosmos/tokens`, `@opencosmos/ui`, and `apps/web`
- [ ] Existing themes (Studio/Terra/Volt) are unchanged

### Estimated Effort

~200 lines of new token definitions + ~30 lines of provider/config changes. One focused session.

---

## Phase 2: Tailwind v4 Upgrade (DONE)

> Completed 2026-02-16. Upgraded to Tailwind CSS v4.0.0, tailwind-merge v3, @tailwindcss/postcss. Used Option A (JS preset via `@config`). Bumped to `@opencosmos/ui` v1.2.0.
>
> **Original rationale:** SDE was pinned to Tailwind CSS v3.4. Tailwind v4 has been stable since early 2025 and is the default for new projects. Every new Speedboat app would naturally use v4. Staying on v3 creates compounding tech debt — the config format, directives, and plugin system are all different.

### Prerequisite: Delete `apps/mobile`

The `apps/mobile` experiment (NativeWind + Expo) is abandoned. It's a single-screen PoC with no routes and no original logic. NativeWind v4 (stable) does **not** support Tailwind v4, and NativeWind v5 targeting v4 is pre-release with no stable timeline. Deleting the app removes the only Tailwind v3 hard blocker in the monorepo.

**Action:** `rm -rf apps/mobile` and remove any references to it in the root `pnpm-workspace.yaml` or Turborepo config.

### Current State (Verified Feb 2026)

**Tailwind versions across the monorepo:**
| Package | Version | Type |
|---|---|---|
| `packages/ui` | `"tailwindcss": "^3.4.0"` | devDependency |
| `apps/web` | `"tailwindcss": "^3.4.17"` | devDependency |
| `apps/portfolio` | `"tailwindcss": "3"` | devDependency |
| `apps/creative-powerup` | `"tailwindcss": "^3.4.15"` | devDependency |

**tailwind-merge versions (critical — must upgrade simultaneously):**
| Package | Version | Notes |
|---|---|---|
| `packages/ui` | `"tailwind-merge": "^2.2.0"` | Used by `cn()` in `packages/ui/src/lib/utils.ts` |
| `packages/charts` | `"tailwind-merge": "^3.4.0"` | Already on v3 — no change needed |

**Shared Tailwind preset:** `packages/config/tailwind/index.js` — v3 `module.exports` format. All apps import via `presets: [require('@thesage/config/tailwind')]`.

**CSS entry points using `@tailwind` directives:**
- `packages/ui/src/globals.css`
- `apps/portfolio/app/globals.css`
- `apps/creative-powerup/app/globals.css`
- `templates/nextjs-app/app/globals.css`

**`@apply` usage (must remain functional):**
- `packages/ui/src/globals.css`: `@apply bg-background text-foreground` and `@apply border-border` in `@layer base`
- `apps/creative-powerup/app/globals.css`: Same plus `@apply rounded-lg overflow-x-auto` and `@apply font-mono text-sm` in custom layers

**Custom `@layer utilities` blocks (must convert to `@utility` in v4):**
- `apps/portfolio/app/globals.css`: `.text-balance`, `.font-heading`, `.font-body`, `.font-mono`
- `apps/creative-powerup/app/globals.css`: Similar font utilities

**Content paths (each app explicitly includes UI package source):**
- Portfolio: `path.join(__dirname, "../../packages/ui/src/**/*.{js,ts,jsx,tsx}")`
- Creative Powerup: Same pattern
- Template: `"./node_modules/@opencosmos/ui/dist/**/*.{js,mjs}"` (consumer path)

**PostCSS configs (all identical pattern):**
- `apps/portfolio/postcss.config.mjs` — `{ tailwindcss: {}, autoprefixer: {} }`
- `apps/creative-powerup/postcss.config.js` — same
- `templates/nextjs-app/postcss.config.js` — same

**Dark mode:** All apps use `darkMode: 'class'` in their tailwind config. ThemeProvider adds/removes `.dark` class on document root.

**No Tailwind plugins** are used in any config. No `tailwindcss-animate`.

**CVA (class-variance-authority):** Used across components. CVA is Tailwind-version-agnostic — it concatenates class strings and has no Tailwind dependency. No CVA changes needed.

### What Changes in Tailwind v4 (Detailed)

| v3 | v4 | Impact |
|---|---|---|
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` | Mechanical replacement in all CSS files |
| `tailwind.config.js` with `module.exports` | CSS-first with `@theme` directive, or load legacy config via `@config "..."` | Shared preset needs decision (see below) |
| `colors: { primary: 'var(--color-primary)' }` in JS config | `@theme inline { --color-primary: var(--color-primary); }` in CSS | **`inline` keyword is critical** — without it, Tailwind generates intermediate variables that break runtime theme switching |
| `darkMode: 'class'` in JS config | `@custom-variant dark (&:where(.dark, .dark *));` in CSS | Must add to every CSS entry point |
| `content: ['./src/**/*.{ts,tsx}']` in JS config | Auto-detection + `@source` directive for monorepo paths | `@source "../../packages/ui/src";` in each app's CSS |
| `@layer utilities { .custom { ... } }` | `@utility custom { ... }` | Only needed for portfolio/creative-powerup custom utilities |
| `@layer base { @apply ... }` | Still works — `@layer base` becomes a real CSS cascade layer | `@apply` is supported in v4; no changes to existing `@layer base` blocks |
| PostCSS: `{ tailwindcss: {}, autoprefixer: {} }` | `{ "@tailwindcss/postcss": {} }` (autoprefixer bundled) | Update all PostCSS configs |
| `tailwind-merge` v2.x | `tailwind-merge` v3.x required | Breaking: config restructured, validators renamed, theme scale keys changed |

**Utility renames in v4 (update in component source + CVA definitions):**
- `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm` (shifted scale)
- `ring` → `ring-3` (ring now requires explicit width)
- `!bg-red-500` → `bg-red-500!` (important modifier moved to suffix)
- `blur-sm` → `blur-xs`, `blur` → `blur-sm` (shifted scale)
- `rounded-sm` → `rounded-xs`, `rounded` → `rounded-sm` (shifted scale)

**Browser support floor raised:** Safari 16.4+, Chrome 111+, Firefox 128+. Not a concern for Speedboat's internal tools.

### Shared Preset Strategy Decision

The shared preset at `packages/config/tailwind/index.js` defines all semantic color tokens, font families, border radii, and Radix keyframe animations. Two migration paths:

**Option A: Keep JS preset, load via `@config` (recommended for initial migration)**
- Each app's CSS adds `@config "../../packages/config/tailwind/index.js";`
- Preset file stays as-is (v3 format works with `@config`)
- Fastest path, lowest risk, easy to verify
- Downside: not "v4 native" — feels like a compatibility shim

**Option B: Convert preset to shared CSS file**
- Create `packages/config/tailwind/base.css` with `@theme inline { ... }` definitions
- Each app imports it: `@import "../../packages/config/tailwind/base.css";`
- Full v4 native approach
- More work, but cleaner long-term

**Recommendation:** Start with Option A to get everything building, then convert to Option B as a follow-up if desired.

### Files to Modify

**Step 0: Cleanup**
| File/Dir | Change |
|---|---|
| `apps/mobile/` | **DELETE** — abandoned NativeWind experiment |
| `pnpm-workspace.yaml` / `turbo.json` | Remove `apps/mobile` references if present |

**Step 1: Package upgrades**
| File | Change |
|---|---|
| `packages/ui/package.json` | `tailwindcss` ^3.4.0 → ^4.0.0, `tailwind-merge` ^2.2.0 → ^3.0.0, add `@tailwindcss/postcss` as devDep |
| `apps/web/package.json` | `tailwindcss` ^3.4.17 → ^4.0.0, replace `autoprefixer` with `@tailwindcss/postcss` |
| `apps/portfolio/package.json` | `tailwindcss` 3 → ^4.0.0, replace `autoprefixer` with `@tailwindcss/postcss` |
| `apps/creative-powerup/package.json` | `tailwindcss` ^3.4.15 → ^4.0.0, replace `autoprefixer` with `@tailwindcss/postcss` |
| `templates/nextjs-app/package.json` | Update tailwindcss + postcss deps |

**Step 2: PostCSS configs**
| File | Change |
|---|---|
| `apps/portfolio/postcss.config.mjs` | `{ tailwindcss: {}, autoprefixer: {} }` → `{ "@tailwindcss/postcss": {} }` |
| `apps/creative-powerup/postcss.config.js` | Same |
| `apps/web/postcss.config.js` | Same |
| `templates/nextjs-app/postcss.config.js` | Same |

**Step 3: CSS entry points**
| File | Changes |
|---|---|
| `packages/ui/src/globals.css` | Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`. Add `@config "../../config/tailwind/index.js";`. Add `@custom-variant dark (&:where(.dark, .dark *));` |
| `apps/portfolio/app/globals.css` | Same pattern. Add `@source "../../packages/ui/src";`. Convert `@layer utilities` custom classes to `@utility` directives |
| `apps/creative-powerup/app/globals.css` | Same pattern |
| `apps/web/app/globals.css` (or equivalent) | Same pattern |
| `templates/nextjs-app/app/globals.css` | Replace directives. Add `@source "../node_modules/@opencosmos/ui/dist";` |

**Step 4: Remove Tailwind config files (if using `@config` in CSS)**
| File | Change |
|---|---|
| `packages/ui/tailwind.config.js` | Can be removed — `@config` in CSS replaces it |
| `apps/portfolio/tailwind.config.ts` | Can be removed — config loaded via CSS `@config` + `@source` directives |
| `apps/creative-powerup/tailwind.config.ts` | Same |
| `apps/web/tailwind.config.ts` | Same |
| `templates/nextjs-app/tailwind.config.ts` | Convert to inline `@theme` for template simplicity, or keep with `@config` |

**Step 5: Utility renames across component source**
| Scope | Change |
|---|---|
| All files in `packages/ui/src/components/` | Run `npx @tailwindcss/upgrade` first. Then manually verify: `shadow-sm`→`shadow-xs`, `ring`→`ring-3`, important prefix→suffix, blur/rounded scale shifts |
| CVA variant definitions (7 exports) | Same renames in string literals: `buttonVariants`, `toggleVariants`, `badgeVariants`, `cardVariants`, `sheetVariants`, `labelVariants`, `alertVariants` |

**Step 6: tailwind-merge v3 migration**
| File | Change |
|---|---|
| `packages/ui/src/lib/utils.ts` | `cn()` uses `twMerge(clsx(...))` — verify behavior unchanged after tailwind-merge v3 upgrade. No code change expected unless custom twMerge config exists (it doesn't). |

### Migration Tool

Tailwind provides an official upgrade tool: `npx @tailwindcss/upgrade` (requires Node.js 20+).

**What it does automatically:**
- Updates `tailwindcss` dependency to v4
- Installs `@tailwindcss/postcss` or `@tailwindcss/vite`
- Removes `postcss-import` and `autoprefixer`
- Converts `@tailwind` directives to `@import "tailwindcss"`
- Migrates `tailwind.config.js` theme values to `@theme` CSS directives
- Updates renamed utility classes in templates
- Converts `@layer utilities { }` to `@utility` directives
- Updates PostCSS config

**What it does NOT handle well:**
- CSS variable references in theme config (the `inline` keyword)
- Monorepo `@source` directives
- `@custom-variant dark` for class-based dark mode
- tailwind-merge version bump
- Visual verification of 99 components

**Recommendation:** Run the tool first on an isolated branch, then manually fix what it misses.

### Critical Gotcha: `@theme inline` for Runtime Theming

SDE's entire theme system works by ThemeProvider injecting CSS variables onto `:root` at runtime. In v4, the `@theme inline` keyword is **mandatory** for this pattern.

```css
/* CORRECT — utilities embed var() directly */
@theme inline {
  --color-primary: var(--color-primary);
  --color-background: var(--color-background);
}
/* Generated: .bg-primary { background-color: var(--color-primary) } */

/* WRONG — utilities reference intermediate theme variable */
@theme {
  --color-primary: var(--color-primary);
}
/* Generated: .bg-primary { background-color: var(--theme-color-primary) } — breaks runtime switching */
```

If using Option A (`@config` to load the JS preset), the config's `theme.extend.colors` values are treated as inline by default because they're string references, not static values. **Verify this behavior during migration** — if theme switching breaks, the `inline` keyword is the fix.

### Acceptance Criteria

- [x] `apps/mobile` deleted, no references remain in workspace config
- [x] All packages install cleanly with `pnpm install`
- [x] `globals.css` files use `@import "tailwindcss"` (no `@tailwind` directives) — verified: zero `@tailwind` matches across repo
- [x] PostCSS configs use `@tailwindcss/postcss` (no `autoprefixer`) — verified: `apps/web/postcss.config.js`
- [x] All `tailwind.config.*` files removed — config loaded via `@config` directive in CSS
- [x] `@custom-variant dark` added for class-based dark mode — `apps/web/app/globals.css:3`
- [x] `@source` directive for monorepo paths — `apps/web/app/globals.css:4`
- [x] `tailwind-merge` upgraded to v3 — `packages/ui/package.json:231`
- [x] `tailwindcss` ^4.0.0 in `packages/ui` and `apps/web`
- [x] `@tailwindcss/postcss` ^4.0.0 added as devDep
- [x] `packages/ui/src/globals.css` kept as pure CSS variable defaults (no Tailwind directives — correct for exported library CSS)
- [x] `pnpm build` passes for `@opencosmos/ui`, `apps/web`, `apps/portfolio`, `apps/creative-powerup` — verified by author
- [x] `pnpm test` passes (156 tests) — verified by author
- [x] Runtime theme switching works: Studio/Terra/Volt × light/dark (6 combinations verified visually) — verified by author
- [x] Dark mode toggle works via `.dark` class strategy — verified by author
- [x] `cn()` utility produces correct merged classes (tailwind-merge v3) — verified by author
- [x] Bundle size does not regress beyond current size-limit budgets — verified by author
- [x] Consumer template (`templates/nextjs-app`) builds and renders correctly — verified by author
- [x] No visual regressions in high-usage components: Button, Card, Input, Dialog, DataTable, Sidebar, Tabs, Badge — verified by author

### Risk Assessment

**Overall risk: Medium-High.** Reduced from original "High" assessment because the NativeWind blocker is removed.

**Remaining risks:**
1. **tailwind-merge v3 behavior changes** could subtly affect class conflict resolution in components that rely on `cn()` — verify visually (Medium)
2. **`@theme inline` correctness** for runtime theme switching — the most critical single point of failure; test all 6 theme×mode combinations (Medium-High)
3. **Utility renames** across 99 components — the upgrade tool catches most but manual review needed for CVA string literals (Low-Medium)
4. **Next.js 16 + Tailwind v4.1.x + Turbopack** has known build failures — pin to v4.0.x initially (Low)

**Not at risk:**
- CVA — version-agnostic, no changes needed to the library
- Framer Motion — no Tailwind dependency
- Radix UI — no Tailwind dependency
- Zustand theme store — no Tailwind dependency
- ThemeProvider CSS variable injection — framework-independent

### Estimated Effort

2-3 focused sessions:
1. **Session 1:** Delete mobile app, run upgrade tool, fix PostCSS/CSS configs, upgrade tailwind-merge, get builds passing
2. **Session 2:** Verify runtime theme switching, fix `@theme inline` if needed, verify utility renames, run tests
3. **Session 3 (if needed):** Visual verification of components, fix edge cases, update template

---

## Phase 3: Bundle & Dependency Optimization (Priority: HIGH)

> **Why:** `@opencosmos/ui` brings 38 direct dependencies and has a 450KB core bundle limit. For comparison, shadcn/ui components are copy-pasted with zero install-time deps beyond what you use. The dependency weight matters for install speed, cold start, and the cognitive overhead of `node_modules` bloat.

### 3A: Make framer-motion Optional

framer-motion (~150KB min+gzip) is currently a **required** peer dependency, but most components don't use it. Only the motion/cursor/background categories and animated transitions need it.

**Files to modify:**
- `packages/ui/package.json` — move framer-motion to `peerDependenciesMeta` as optional
- Components that import from `framer-motion` — add dynamic imports or conditional checks so they gracefully degrade without it
- `packages/ui/src/globals.css` — ensure CSS-only transitions work as fallback

**Acceptance criteria:**
- [ ] `pnpm add @opencosmos/ui` does NOT fail if framer-motion is not installed
- [ ] Core components (Button, Card, Input, Dialog, etc.) render correctly without framer-motion
- [ ] Motion components (AnimatedBeam, SplashCursor, WarpBackground) show a console warning if framer-motion is missing
- [ ] README documents framer-motion as "required for animation features, optional otherwise"

### 3B: Additional Subpath Exports

Current core bundle (`@opencosmos/ui` main entry) exports all 99 components. Consider splitting:

| Proposed Subpath | Components | Rationale |
|---|---|---|
| `@opencosmos/ui/backgrounds` | WarpBackground, FaultyTerminal, OrbBackground | WebGL-heavy, rarely needed |
| `@opencosmos/ui/cursor` | SplashCursor, TargetCursor | Niche, framer-motion dependent |
| `@opencosmos/ui/motion` | AnimatedBeam | Animation-specific |
| `@opencosmos/ui/blocks` | Hero, OpenGraphCard + future blocks | Composite components |

**Acceptance criteria:**
- [ ] Each new subpath has its own entry in `package.json` exports
- [ ] Each new subpath has its own size-limit budget
- [ ] Tree-shaking verified: importing `@opencosmos/ui` without using backgrounds doesn't bundle WebGL code
- [ ] Core bundle limit reduced from 450KB to ≤350KB

### 3C: Reduce Direct Dependencies

Some dependencies are used by only 1-2 components but are always installed:

| Dependency | Used By | Strategy |
|---|---|---|
| `cmdk` | Command (1 component) | Move to optional peer dep or subpath |
| `embla-carousel-react` | Carousel (1 component) | Move to optional peer dep or subpath |
| `input-otp` | InputOTP (1 component) | Move to optional peer dep or subpath |
| `react-resizable-panels` | Resizable (1 component) | Move to optional peer dep or subpath |
| `vaul` | Drawer (1 component) | Move to optional peer dep or subpath |
| `react-dropzone` | FileUpload (1 component) | Already behind `/forms` subpath? Verify |

**Acceptance criteria:**
- [ ] Direct dependency count reduced from 38 to ≤30
- [ ] Components that need moved deps import them dynamically or document the required install
- [ ] `pnpm add @opencosmos/ui` install time measurably faster

### Estimated Effort

3A: 1 session. 3B: 1 session. 3C: 1-2 sessions.

---

## Phase 4: Eject CLI & Source Ownership (Priority: MEDIUM-HIGH)

> **Why:** SDE is an npm package — you import from `@opencosmos/ui`, you don't own the source. When a component needs customization beyond props/variants/className, you're stuck. shadcn/ui's entire value proposition is "you own the source." SDE needs a credible source-ownership story.

### Current State

- `eject_component` MCP tool exists in `packages/mcp/src/index.ts` (handler lines 874-913, instruction generator lines 561-602)
- It works when invoked via the MCP protocol
- No standalone CLI — `npx @opencosmos/ui eject Button` fails (no `bin` field in `packages/ui/package.json`)
- No web UI eject button on component doc pages

### Implementation

**4A: Standalone Eject CLI**

Create `packages/ui/src/cli.ts` with an `eject` command:

```bash
npx @opencosmos/ui eject Button
# → Copies packages/ui/src/components/actions/Button.tsx to ./components/ui/Button.tsx
# → Rewrites imports from internal paths to @opencosmos/ui public exports
# → Adds the component's direct Radix/CVA dependencies to your package.json
```

**Files to modify:**
- `packages/ui/package.json` — add `"bin": { "thesage": "./dist/cli.js" }` field
- `packages/ui/src/cli.ts` — **CREATE** — CLI entry point using the same logic as the MCP eject tool
- `packages/ui/tsup.config.ts` — add CLI entry point to build

**4B: Web UI Eject Button (nice-to-have)**

Add a "Copy source" button on each component's doc page in OpenCosmos Studio that shows the raw `.tsx` source with import paths rewritten.

### Acceptance Criteria

- [ ] `npx @opencosmos/ui eject Button` copies Button.tsx to `./components/ui/Button.tsx` with rewritten imports
- [ ] Ejected component renders identically to the package version
- [ ] `npx @opencosmos/ui eject --list` shows all ejectible components
- [ ] CLI outputs a message listing any peer deps the user needs to install
- [ ] `pnpm build --filter @opencosmos/ui` produces the CLI binary

### Estimated Effort

1-2 sessions for the CLI. Web UI button is a separate nice-to-have.

---

## Phase 5: Page-Level Blocks for App Building (Priority: MEDIUM)

> **Why:** SDE has 99 individual components but only 2 page-level blocks (Hero, OpenGraphCard). shadcn/ui has 27 blocks (dashboard, login, sidebar, signup). For Speedboat's use case — building complete sandbox apps fast — blocks are the highest-leverage components. A DashboardBlock saves 30 minutes vs assembling Sidebar + Header + StatCard + DataTable from scratch.

### Blocks to Build

Prioritized for Speedboat's internal-tool use case:

| Block | Components Used | Priority |
|---|---|---|
| **DashboardBlock** | Sidebar, Header, StatCard grid, DataTable | P0 — most common Speedboat layout |
| **DataTablePageBlock** | Header, FilterButton, DataTable, Pagination, Sheet (row detail) | P0 — core data workflow |
| **FormPageBlock** | Header, Form, Input, Select, Textarea, Button (submit/cancel) | P1 |
| **SettingsBlock** | Sidebar tabs, Form sections, Switch toggles, Button (save) | P1 |
| **SidebarShellBlock** | Sidebar (collapsible), Header, main content area | P1 — app shell pattern |
| **LoginBlock** | Card, Input (email/password), Button, Link | P2 |
| **EmptyStatePageBlock** | EmptyState, Button (CTA) | P2 |
| **CommandPaletteBlock** | Command, Dialog | P2 |
| **NotificationPanelBlock** | NotificationCenter, Sheet | P3 |
| **ProfileBlock** | Avatar, Card, Form fields | P3 |

### Structure

Blocks live in `packages/ui/src/components/blocks/` and are exported from the main barrel. Each block:
- Accepts layout props (title, breadcrumbs, actions)
- Composes existing SDE components (no new primitives)
- Is theme-aware (uses CSS variables, not hardcoded colors)
- Has a Storybook-style example in OpenCosmos Studio

### Acceptance Criteria

- [ ] At least 5 blocks (DashboardBlock, DataTablePageBlock, FormPageBlock, SettingsBlock, SidebarShellBlock) exist and render correctly
- [ ] Each block works with all 4 themes (Studio, Terra, Volt, Speedboat)
- [ ] Each block is documented in llms-full.txt with props and usage example
- [ ] Each block is registered in the MCP registry
- [ ] AI agents can discover blocks via `search_components({ query: 'dashboard' })`

### Estimated Effort

2-3 sessions for 5 blocks. Each block is ~100-200 lines composing existing components.

---

## Phase 6: Vite-First DX (Priority: MEDIUM)

> **Why:** Speedboat's `design-code-play` uses Vite + React SPA. SDE's documentation, starter template, and `get_app_shell` MCP tool all target Next.js App Router. This creates friction for every new Speedboat app.

### 6A: Vite Starter Template

**Create:** `templates/vite-react/` — a minimal Vite + React + SDE project:

```
templates/vite-react/
├── index.html
├── package.json          (react, @opencosmos/ui, framer-motion, tailwindcss ^4, @tailwindcss/vite, vite)
├── vite.config.ts        (React plugin + @tailwindcss/vite plugin)
├── postcss.config.js     (@tailwindcss/postcss — only needed if not using Vite plugin)
├── tsconfig.json
└── src/
    ├── main.tsx          (ThemeProvider + TooltipProvider + Toaster)
    ├── App.tsx           (example using Button, Card, ThemeSwitcher)
    └── index.css         (@import "tailwindcss"; @config path/to/sde-preset; @opencosmos/ui/globals.css import)
```

> **Tailwind v4 Note:** No `tailwind.config.js` needed. Tailwind v4 uses CSS-first configuration via `@config` directive pointing to the SDE JS preset, or inline `@theme` blocks. For Vite, prefer `@tailwindcss/vite` plugin over PostCSS. See Phase 2 completion notes for the pattern used in the docs site.

### 6B: Update MCP `get_app_shell` Tool

The `get_app_shell` tool should accept a `framework` parameter:
- `framework: 'nextjs'` → current behavior (App Router layout)
- `framework: 'vite'` → returns Vite + React boilerplate

**File:** `packages/mcp/src/index.ts` — update the `get_app_shell` handler.

### 6C: Document Vite Usage in llms-full.txt

Add a "VITE + REACT SETUP" section to llms-full.txt alongside the existing Next.js setup section. Include:
- `pnpm create vite` → install SDE → add `@tailwindcss/vite` plugin → CSS-first Tailwind config (`@import "tailwindcss"` + `@config`) → wire providers
- Vite-specific gotchas (no server components, no `"use client"` concerns)

### Acceptance Criteria

- [ ] `templates/vite-react/` exists, builds, and runs with `pnpm dev`
- [ ] Template renders SDE components with theme switching
- [ ] `get_app_shell` MCP tool returns Vite boilerplate when `framework: 'vite'` is passed
- [ ] llms-full.txt has Vite setup instructions
- [ ] README references the Vite template

### Estimated Effort

1 session.

---

## Phase 7: Additional Improvements (Priority: VARIES)

### 7A: `tsup "use client"` Banner Fix (Priority: Medium)

**Problem:** `packages/ui/tsup.config.ts` adds `"use client"` banner to ALL output files. This means non-component exports (like `BRAND`, utility functions, token objects) are treated as client modules by Next.js. Causes `undefined` values when imported in server contexts (metadata, generateStaticParams, etc.).

**Fix:** Either:
- Split server-safe exports into a separate entry point (`@opencosmos/ui/server`) without the banner
- Use granular `"use client"` directives per-component file instead of a blanket banner
- Export constants like `BRAND` from `@opencosmos/tokens` (which has no `"use client"` banner)

**Acceptance criteria:**
- [ ] `import { BRAND } from '@opencosmos/ui'` works in Next.js server components
- [ ] All React components still have `"use client"` directive

### 7B: ThemeProvider `defaultTheme` / `defaultMode` Props (Priority: Medium)

**Problem:** ThemeProvider accepts only `{ children }`. Setting the initial theme requires calling `useThemeStore.setState()` before the provider mounts, which is non-obvious.

**Fix:** Add optional `defaultTheme` and `defaultMode` props to ThemeProvider:

```tsx
<ThemeProvider defaultTheme="speedboat" defaultMode="light">
  {children}
</ThemeProvider>
```

If provided, these set the Zustand store on first render (not on every render — respect localStorage persistence).

**Files:** `packages/ui/src/providers/ThemeProvider.tsx`

**Acceptance criteria:**
- [ ] `<ThemeProvider defaultTheme="speedboat">` sets theme to speedboat on first load
- [ ] If user has a persisted theme in localStorage, `defaultTheme` does NOT override it
- [ ] Existing behavior (no props) is unchanged

### 7C: Remove Console Debug Log (Priority: Low)

`packages/ui/src/providers/ThemeProvider.tsx:272` has a `console.log('[ThemeProvider] Update: ...')` that fires on every theme change. Remove it or gate behind `NODE_ENV === 'development'`.

### 7D: Deploy Pending Fixes (Priority: Medium)

Several fixes from Phase 0 were implemented locally but may not be deployed to opencosmos.ai/studio. Verify:
- [ ] `opencosmos.ai/studio/docs/components/button` redirects to `/docs/actions/button` (not 404)
- [ ] `opencosmos.ai/studio/sitemap.xml` shows ~140 URLs (not ~25)
- [ ] `opencosmos.ai/studio/docs/api.json` shows version 1.1.0 and 99 components
- [ ] `opencosmos.ai/studio/llms-full.txt` has all 99 components and 8 MCP tools

### 7E: Invocation-Test MCP Tools (Priority: Medium)

Four MCP tools are "Listed" but not invocation-tested:
- `eject_component` — does it return valid eject instructions?
- `get_app_shell` — does it return a working app shell?
- `get_examples` — does it return useful examples for a given component?
- `get_audit_checklist` — does it return a meaningful checklist?

Test each via `npx @opencosmos/mcp` and verify the output is useful, not just structurally valid.

---

## Priority Summary

| Phase | Priority | Effort | Impact on Speedboat |
|---|---|---|---|
| **1: Speedboat Theme** | CRITICAL | 1 session | Unlocks adoption — apps look Speedboat-native |
| **2: Tailwind v4** | ~~HIGH~~ DONE | ~~2-3 sessions~~ | Prevents tech debt in every new app |
| **3: Bundle Optimization** | HIGH | 3-4 sessions | Faster installs, smaller apps |
| **4: Eject CLI** | MEDIUM-HIGH | 1-2 sessions | Source ownership for customization |
| **5: Page-Level Blocks** | MEDIUM | 2-3 sessions | 10x faster app scaffolding |
| **6: Vite-First DX** | MEDIUM | 1 session | Matches Speedboat's build tool |
| **7: Misc Improvements** | VARIES | 1-2 sessions | Polish and deployment |

### Recommended Execution Order

1. ~~**Phase 2** (Tailwind v4) — DONE~~
2. **Phase 1** (Speedboat Theme) — do first, unlocks all subsequent work
3. **Phase 6** (Vite DX) — quick win, enables testing Phase 1 in design-code-play
4. **Phase 5** (Blocks) — highest leverage for app building velocity
5. **Phase 4** (Eject CLI) — needed when blocks aren't enough
6. **Phase 3** (Bundle) — optimization pass after features stabilize
7. **Phase 7** (Misc) — ongoing cleanup

---

## How to Use This Plan

This document is self-contained. To resume work in a fresh session:

1. Read this document to understand priorities and current state
2. Pick the next unchecked phase
3. Reference the file paths, token mappings, and acceptance criteria — everything needed is here
4. After completing a phase, check off its acceptance criteria and update the status

### Key File Paths (SDE Monorepo)

| Purpose | Path (relative to `opencosmos-ui/`) |
|---|---|
| UI component source | `packages/ui/src/components/` |
| UI package.json | `packages/ui/package.json` |
| Token definitions | `packages/tokens/src/` (studio.ts, terra.ts, volt.ts, index.ts) |
| Theme provider | `packages/ui/src/providers/ThemeProvider.tsx` |
| Theme store (Zustand) | `packages/ui/src/lib/store/theme.ts` |
| Customizer store | `packages/ui/src/lib/store/customizer.ts` |
| MCP server | `packages/mcp/src/index.ts` |
| MCP registry | `packages/mcp/src/registry.ts` |
| OpenCosmos Studio (docs site) | `apps/web/` |
| Route config | `apps/web/app/docs/route-config.ts` |
| llms-full.txt | `apps/web/public/llms-full.txt` |
| Tailwind config preset | `packages/config/tailwind/index.js` |
| Starter template (Next.js) | `templates/nextjs-app/` |
| Build config | `packages/ui/tsup.config.ts` |
| Test setup | `packages/ui/src/test/setup.ts` |
| CI/CD | `.github/workflows/` |

### Key File Paths (Speedboat Consumer)

| Purpose | Path (relative to `design-code-play/`) |
|---|---|
| Frontend root | `frontend/` |
| Package.json | `frontend/package.json` |
| App entry | `frontend/src/App.tsx` |
| React entry | `frontend/src/main.tsx` |
| Design tokens (source of truth) | `frontend/src/theme.ts` |
| Global CSS | `frontend/src/index.css` |
| Vite config | `frontend/vite.config.ts` |
| Components | `frontend/src/components/` |
| Integration plan | `docs/3rd-party-component-libs/design-code-play-plan.md` |
| UI evaluation | `docs/3rd-party-component-libs/ui-engine-evaluation.md` |

### Architecture Notes

- **SDE theme system:** Zustand store persists theme/mode to localStorage (key: `ecosystem-theme`). ThemeProvider reads the store and injects CSS variables onto `:root`. Themes are defined as token objects in `@opencosmos/tokens` — adding a 4th theme means creating a new token file and registering it in the ThemeProvider's `themeTokens` map.
- **SDE's `ThemeName` type:** Defined as `typeof THEME_NAMES[number]` in `packages/tokens/src/index.ts`. Adding `'speedboat'` to the `THEME_NAMES` const array automatically extends the type.
- **SDE routing:** Uses functional categories (`/docs/actions/button`), not `/docs/components/button`. The `SECTION_ITEMS` map in `route-config.ts` is the source of truth.
- **Speedboat styling:** Currently uses Radix UI Themes (`@radix-ui/themes@3.3.0`) + inline styles via a `theme.ts` object. No Tailwind. Migration to SDE requires adding Tailwind.

---

---

# Prior Content: Competitive Analysis & Fix History

> Everything below is retained from earlier versions of this document. It provides historical context for the evaluation, root cause analyses, and implementation logs for completed fixes.

---

# The A+ Plan: Making OpenCosmos UI (SDE) the Gold Standard for AI-Native Component Libraries

> **Last updated:** 2026-02-16T12:30:00 PST (Fixes 1-6 implemented, built, verified)
> **Previous update:** 2026-02-16T20:45:00 PST (SDE root cause analysis + fix plan added)
> Scores verified via live endpoints, npm registry, and GitHub API. MCP tool functionality is manifest-listed, not invocation-tested.

**Context:** In a head-to-head comparison against shadcn/ui, Chakra UI, Mantine, MUI, and Radix Themes, SDE currently scores **103/130** vs shadcn/ui's **114/130** — an 11-point gap. Excluding the unclosable Community criterion (-12 weighted points), SDE actually leads by +1. This plan targets the closable -4 deficit (Customizability, Bundle) and identifies where SDE should extend its existing leads (Theming, Animation).

---

# Speedboat's Perspective

> Speedboat is leading this evaluation — running live endpoint tests, auditing claims, and identifying gaps. The findings below represent Speedboat's independent verification of SDE's current state.

## Progress Since Initial Plan

*Verified by Speedboat 2026-02-16T11:00:00 PST*

| Item | Status | Impact |
|---|---|---|
| Test coverage (63→156 tests, 10→30 files) | **Done** | Eliminated a major credibility gap |
| CI/CD pipeline (lint + typecheck + test + size:check) | **Done** | Quality enforcement on every PR |
| Bundle size CI checks (size-limit) | **Done** | Budget enforcement prevents regression |
| framer-motion peer dep pinned (^12.0.0) | **Done** | Enables version-accurate AI codegen |
| Single-component deps resolved (cmdk, embla, vaul, input-otp, react-resizable-panels) | **Done** | Regular deps now, not wildcard peers |
| Subpath exports (11 paths) | **Done** | `.`, `/tokens`, `/hooks`, `/utils`, `/providers`, `/webgl`, `/forms`, `/dates`, `/tables`, `/dnd`, `/globals.css` |
| `/docs/api.json` endpoint | **Done** | Structured JSON API (99 components at v1.1.0) |
| AI discovery endpoints | **Done** | `/.well-known/ai-plugin.json` and `/.well-known/mcp-server.json` |
| `.claude/CLAUDE.md` in npm package | **Done** | Auto-primes AI context on install |
| robots.txt AI permissions | **Done** | Explicitly allows ClaudeBot, GPTBot, Google-Extended |
| MCP server expanded to v0.8.1 with 8 tools | **Done** | `list_components`, `search_components`, `get_component`, `install_component`, `get_app_shell`, `get_examples`, `get_audit_checklist`, `eject_component` |
| npm description updated to "99 components" | **Done** | Consistent with llms-full.txt |
| Zustand theme store with localStorage | **Done** | Theme/mode/motion preferences persist |
| Version bump to 1.1.0 | **Done** | Active release cadence (pushed today: 2026-02-16) |
| Homepage routing fixed (/ returns 200) | **Done** | Title: "OpenCosmos UI" — proper content renders |
| Docs routing fixed (/docs returns 200) | **Done** | Title: "Documentation — OpenCosmos UI" |
| Title tag "undefined" fixed | **Done** | Component pages now show "Button — Components — OpenCosmos UI" (no more undefined) |
| llms-full.txt enhanced | **Done** | Error recovery patterns, composition compatibility, decision tables, bundle architecture sections added |
| Component page 404 redirect | **Done (local)** | 308 redirect from `/docs/components/[item]` to `/docs/[category]/[item]`. Pending deploy. |
| Dynamic sitemap | **Done (local)** | ~140 URLs generated from `SECTION_ITEMS`. Pending deploy. |
| Count/version alignment (92→99) | **Done** | All surfaces now report 99 components at v1.1.0. |
| 7 missing component docs in llms-full.txt | **Done** | EmptyState, FileUpload, NotificationCenter, StatCard, Stepper, Timeline, TreeView documented. |
| MCP tools in llms-full.txt (4→8) | **Done** | All 8 tools listed. |
| npm keywords + LICENSE | **Done** | 10 keywords added. MIT LICENSE at repo root. |
| CVA variant exports | **Done** | All 7 exported: buttonVariants, toggleVariants, badgeVariants, cardVariants, sheetVariants, labelVariants, alertVariants. |
| JSON registry schema | **Done** | `apps/web/public/schema/registry.json` |
| eject_component MCP tool | **Listed** | Tool declared in manifest. Not invocation-tested. No standalone CLI. |
| get_app_shell MCP tool | **Listed** | Declared in manifest. Not invocation-tested. |
| get_examples MCP tool | **Listed** | Declared in manifest. Not invocation-tested. |
| get_audit_checklist MCP tool | **Listed** | Declared in manifest. Not invocation-tested. |

---

## Competitive Gap Analysis

*Verified by Speedboat 2026-02-16T11:00:00 PST*

| Criterion | Wt | shadcn | SDE | Wtd Δ | Status |
|---|---|---|---|---|---|
| AI Integration | 5x | 5 | 5 | 0 | **SDE now qualitatively leads.** SDE has 8 MCP tools vs shadcn's 7. Richer llms-full.txt with error recovery patterns, composition compatibility, decision tables. Plus: ai-plugin.json, mcp-server.json, .claude/ in npm, robots.txt AI permissions. shadcn has v0 integration and JSON registry schema per component. |
| Component Coverage | 4x | 4 | 4 | 0 | Tied. SDE has 99 components vs 56, but shadcn has **27 page-level blocks** (dashboards, login flows, sidebars). SDE still has only 2 blocks (Hero, OpenGraphCard). **Blocks are the biggest remaining opportunity.** |
| Dev Velocity | 4x | 4 | 4 | 0 | Tied. shadcn has `npx shadcn init` + 10 framework guides. SDE has batteries-included install + 11 subpath exports + get_app_shell MCP tool. **Add scaffold CLI to pull ahead.** |
| Customizability | 3x | 5 | 4 | **-3** | (5−4) × 3 = -3. Structural gap narrowed but not closed. eject_component MCP tool exists but no standalone CLI (`npx @opencosmos/ui eject Button` doesn't work — no `bin` in package.json). shadcn's copy-paste model is still fundamentally more customizable. |
| Accessibility | 3x | 4 | 4 | 0 | Tied. Both built on Radix. SDE has unique motion accessibility (0-10 scale). |
| Community | 3x | 5 | 1 | **-12** | (1−5) × 3 = -12. Not closable short-term. 106,699 stars vs 1. **Accept and compensate elsewhere.** |
| Theming | 2x | 4 | 5 | **+2** | (5−4) × 2 = +2. **SDE leads.** 3 distinct visual identities (Studio/Terra/Volt) vs 21 color variations on one layout. Zustand-powered persistence. |
| Animation | 1x | 2 | 5 | **+3** | (5−2) × 1 = +3. **SDE leads.** Full motion system with useMotionPreference hook + user-controllable intensity vs CSS transitions only. |
| Bundle | 1x | 5 | 4 | **-1** | (4−5) × 1 = -1. Improved (was -2). 11 subpath exports and CI-enforced size limits. shadcn's copy-only-what-you-use is inherently leaner. |
| | | | | | |
| **Weighted Total** | | **114** | **103** | **-11** | Wtd Δ = (SDE − shadcn) × weight. Max possible: 130. |

**Key insight:** Excluding community (-12, not closable), SDE actually **leads by +1 weighted point**. The closable deficit is -4 (Customizability -3, Bundle -1), offset by leads of +5 (Theming +2, Animation +3). The path to winning (excluding community) is: close the -4, protect the +5, and convert AI Integration and Component Coverage into wider leads.

---

## What Speedboat Found Still Broken

*Re-confirmed by Speedboat 2026-02-16T11:30:00 PST — not caching issues*

### SB-1: Component Pages Still Return 404

**Severity: Critical — FIXED (local, pending deploy verification)**

- Root cause: URL pattern mismatch. SDE uses functional categories (`/docs/actions/button`), not `/docs/components/button`.
- Fix: 308 permanent redirect from `/docs/components/[item]` to `/docs/[category]/[item]` in `apps/web/app/docs/[section]/[item]/page.tsx`.
- Pending deploy verification at opencosmos.ai/studio.

### SB-2: Eject Mechanism Doesn't Work

**Severity: High — Tracked in Phase 4**

- `npx @opencosmos/ui eject Button` doesn't work — no `bin` field in package.json
- `eject_component` is listed in MCP manifest but not invocation-tested
- No web UI eject button exists on component pages

### SB-3: Data Inconsistencies Across Surfaces — FIXED

All surfaces now consistently report 99 components at version 1.1.0. Fix applied across 13 files.

### SB-4: llms-full.txt Gaps — FIXED

Version updated to 1.1.0. All 99 components documented. MCP tools section lists all 8 tools.

### SB-5: Sitemap Coverage — FIXED (local, pending deploy)

Dynamic sitemap generates ~140 URLs from `SECTION_ITEMS`.

### SB-6: Missing Package Metadata — FIXED

npm keywords added (10 keywords). MIT LICENSE file created at repo root.

---

## Speedboat's Live Verification Log

*2026-02-16T11:00:00 PST*

| Endpoint | Status | Finding |
|---|---|---|
| `opencosmos.ai/studio` | **200** | Title: "OpenCosmos UI". Full content renders. |
| `opencosmos.ai/studio/docs` | **200** | Title: "Documentation — OpenCosmos UI". Categories visible. |
| `opencosmos.ai/studio/docs/components/button` | **404 → FIXED locally** | 308 redirect to `/docs/actions/button`. Pending deploy. |
| `opencosmos.ai/studio/llms.txt` | **200** | References MCP v0.8.0 with 8 tools. |
| `opencosmos.ai/studio/llms-full.txt` | **200** | 99 components, 11 categories. Includes error recovery, composition compatibility, decision tables. |
| `opencosmos.ai/studio/docs/api.json` | **200** | 99 components at v1.1.0. |
| `opencosmos.ai/studio/.well-known/ai-plugin.json` | **200** | Valid AI plugin manifest. |
| `opencosmos.ai/studio/.well-known/mcp-server.json` | **200** | v0.8.0, 8 tools listed. |
| `opencosmos.ai/studio/robots.txt` | **200** | ClaudeBot, GPTBot, Google-Extended explicitly allowed. |
| npm `@opencosmos/ui` | **1.1.1** | 11 subpath exports. 38 deps. 11 peer deps. 10 keywords. No `bin` field. *(Now v1.2.0 after Phase 2 Tailwind v4 upgrade)* |
| npm `@opencosmos/mcp` | **0.8.1** | Single dep (@modelcontextprotocol/sdk). Has `bin: sds-mcp`. |
| GitHub `shalomormsby/opencosmos-ui` | **1 star** | 0 forks. MIT license. TypeScript. |

---

## Root Cause Analyses (SDE's Perspective)

> Root cause analysis for each issue found by Speedboat. Added 2026-02-16T20:45:00 PST.

### RE: SB-1 — Component Pages 404

SDE uses **functional categories** for routing: `/docs/actions/button`, `/docs/forms/input`, `/docs/overlays/dialog`. There is no `/docs/components/button` path — "components" is a dashboard section that shows all categories, not a category itself.

The exact failure path in `apps/web/app/docs/[section]/[item]/page.tsx`:
1. `/docs/components/button` matches the route with `section='components'`, `item='button'`
2. `VALID_SECTIONS.includes('components')` → **true** (components IS a valid section)
3. `SECTION_ITEMS['components']` → **undefined** (components has no child items in route-config.ts)
4. `!validItems` → **true** → `notFound()` is called

**The correct URL for Button is `/docs/actions/button`** — and it works. Fix: 308 permanent redirect.

### RE: SB-2 — Eject Mechanism

The MCP `eject_component` tool is fully implemented in `packages/mcp/src/index.ts` (handler at lines 874-913, instruction generator at lines 561-602). It works when invoked via the MCP protocol. However: no `bin` field → no CLI. Tracked in Phase 4.

### RE: SB-3 — Data Inconsistencies — FIXED

The registry actually has **99** real, exported components. The 7 "extra" ones (EmptyState, FileUpload, NotificationCenter, StatCard, Stepper, Timeline, TreeView) exist in source, are exported, and have MCP registry entries. The number "92" was stale. All surfaces now report 99.

### RE: SB-4 — llms-full.txt Gaps — FIXED

All three issues resolved: version header updated, MCP tools section complete, all 99 components documented.

### RE: SB-5 — Sitemap Coverage — FIXED (local)

Dynamic sitemap generates ~140 URLs. Pending deploy.

### RE: SB-6 — Missing Package Metadata — FIXED

npm keywords added. MIT LICENSE created.

---

## Implementation Log (Fixes 1-6)

*Completed 2026-02-16T12:30:00 PST*

| Fix | Files Changed |
|-----|--------------|
| 1 (404 redirect) | `apps/web/app/docs/[section]/[item]/page.tsx` — added `redirect` import, `findCategoryForItem()` helper, redirect logic |
| 2 (Dynamic sitemap) | **Deleted:** `apps/web/public/sitemap.xml`. **Created:** `apps/web/app/sitemap.ts` |
| 3 (Count alignment) | 13 files updated "92" → "99" |
| 4 (Missing docs) | `llms-full.txt` — added ~120 lines for 7 components, updated category counts |
| 5 (MCP tools) | `llms-full.txt` — 4 tools → 8 tools |
| 6 (Keywords + license) | `packages/ui/package.json` — 10 keywords. `LICENSE` (MIT) at repo root. |

### Key Design Decisions

- **308 permanent redirect** (not 307) for `/docs/components/[item]` → `/docs/[category]/[item]`
- **Dynamic sitemap** uses `MetadataRoute.Sitemap` return type — auto-updates when routes change
- **Historical docs** (CHANGELOG, DOCUMENTATION-AUDIT) retain "92" as correct-at-time references
- **Eject CLI deferred** to Phase 4

---

## Projected Scoring After Full Plan Execution (Phases 1-7)

| Criterion | Wt | shadcn | SDE Now | SDE After | Wtd Δ After | Notes |
|---|---|---|---|---|---|---|
| AI Integration | 5x | 5 | 5 | **5** | 0 | Tied on score, **ahead on depth** (10+ tools vs 7, richer llms-full.txt, .claude/ in package, ai-plugin.json, mcp-server.json) |
| Component Coverage | 4x | 4 | 4 | **5** | **+4** | 99 components + 10+ blocks vs 56 + 27 |
| Dev Velocity | 4x | 4 | 4 | **5** | **+4** | Eject CLI + Vite template + Speedboat theme = faster than `npx shadcn init` for Speedboat use case |
| Customizability | 3x | 5 | 4 | **5** | 0 | Eject CLI + MCP eject + exported variants + Speedboat theme customization |
| Accessibility | 3x | 4 | 4 | **4** | 0 | Tied (SDE's motion accessibility is a qualitative differentiator) |
| Community | 3x | 5 | 1 | **1** | **-12** | Unchanged — long-term growth required |
| Theming | 2x | 4 | 5 | **5** | **+2** | SDE leads: 4 distinct identities (Studio/Terra/Volt/Speedboat) + Zustand persistence |
| Animation | 1x | 2 | 5 | **5** | **+3** | SDE leads: useMotionPreference + 0-10 scale |
| Bundle | 1x | 5 | 4 | **5** | 0 | framer-motion optional + reduced deps + more subpath exports |
| | | | | | | |
| **Weighted Total** | | **114** | **103** | **117** | **+3** | SDE surpasses shadcn by 3 pts. Community is the only deficit. |

---

*This plan should be re-evaluated after each phase completion. Track progress via the acceptance criteria checklists above.*
