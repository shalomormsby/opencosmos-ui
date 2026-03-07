# Sage Design Engine

> **Lovable by Design** — 92 accessible React components, 3 runtime-switchable themes, user-controlled motion system, and a philosophy-driven design system built for modern product teams.

[![npm version](https://img.shields.io/npm/v/@thesage/ui.svg?style=flat-square)](https://www.npmjs.com/package/@thesage/ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

## Overview

The Sage Design Engine is a production-ready design system that proves human-centered design through architecture, not just claims. With 100 carefully crafted components organized by functional purpose, three distinct themes with runtime switching, and a motion system that respects user accessibility needs, it's built for teams that prioritize developer experience, user agency, and code quality.

**What's included:**

- **92 Components** across 11 functional categories (actions, forms, navigation, overlays, feedback, data-display, layout, features, backgrounds, cursor, motion)
- **3 Runtime Themes** — Studio (professional), Terra (organic), Volt (electric) — each with light and dark modes
- **User-Controlled Motion** — Intensity slider (0-10 scale) with automatic system preference sync
- **Customizer Feature** — User control made tangible, with theme switching, motion tuning, and localStorage persistence
- **Design Tokens** — Colors, typography, spacing, and motion curves defined as code
- **TypeScript-First** — Strict mode, complete type definitions, exports for all subpaths
- **Accessibility First** — WCAG AA contrast, keyboard navigation, screen reader support, motion preferences respected
- **MIT Licensed** — Open source, tree-shakeable, subpath exports for optimal bundle sizes

---

## Quick Start

### Installation

```bash
npm install @thesage/ui
# or
pnpm add @thesage/ui
```

### Basic Setup

Wrap your app root with the required providers:

```tsx
import { ThemeProvider, TooltipProvider } from '@thesage/ui/providers'
import { Toaster } from '@thesage/ui'
import '@thesage/ui/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="studio" defaultMode="system">
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

### Your First Component

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@thesage/ui'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => console.log('Clicked!')}>Get Started</Button>
      </CardContent>
    </Card>
  )
}
```

---

## Packages

| Package | Description |
|---------|-------------|
| [`@thesage/ui`](https://www.npmjs.com/package/@thesage/ui) | 100 components, providers, hooks, theme system |
| [`@thesage/tokens`](https://www.npmjs.com/package/@thesage/tokens) | Design tokens (colors, typography, spacing, motion) |
| [`@thesage/mcp`](https://www.npmjs.com/package/@thesage/mcp) | MCP server for AI-assisted component discovery |

### Subpath Exports

Include only what you need:

```tsx
import { Form, FormField, FormItem } from '@thesage/ui/forms'
import { DatePicker, Calendar } from '@thesage/ui/dates'
import { DataTable } from '@thesage/ui/tables'
import { DragDrop } from '@thesage/ui/dnd'
import { WarpBackground, OrbBackground } from '@thesage/ui/webgl'
import { useMotionPreference, useTheme } from '@thesage/ui/hooks'
import { ThemeProvider } from '@thesage/ui/providers'
import { cn } from '@thesage/ui/utils'
import { spacing } from '@thesage/ui/tokens'
```

---

## Themes

Three distinct themes, switchable at runtime via CSS variables (no recompilation):

| Theme | Personality | Use Case |
|-------|------------|----------|
| **Studio** | Professional, balanced, modern | SaaS, developer tools, enterprise |
| **Terra** | Calm, organic, warm earth tones | Wellbeing, design, lifestyle |
| **Volt** | Bold, electric, high contrast | Gaming, dev tools, high-energy brands |

All themes support light and dark modes with WCAG AA contrast ratios.

```tsx
import { useTheme } from '@thesage/ui/hooks'

function ThemeSwitcher() {
  const { theme, setTheme, mode, setMode } = useTheme()
  return (
    <>
      <button onClick={() => setTheme('studio')}>Studio</button>
      <button onClick={() => setTheme('terra')}>Terra</button>
      <button onClick={() => setTheme('volt')}>Volt</button>
    </>
  )
}
```

---

## Motion System

Every animation respects user preferences automatically:

```tsx
import { useMotionPreference } from '@thesage/ui/hooks'
import { motion } from 'framer-motion'

function AnimatedCard() {
  const { shouldAnimate, scale } = useMotionPreference()
  return (
    <motion.div
      animate={{ opacity: 1, y: shouldAnimate ? 20 : 0 }}
      transition={{ duration: shouldAnimate ? 0.3 : 0 }}
    >
      Content
    </motion.div>
  )
}
```

- **Intensity Slider (0-10)** — Users control animation intensity
- **System Sync** — Respects `prefers-reduced-motion` automatically
- **Theme-Aware** — Duration and easing curves vary by theme
- **Zero Animation Mode** — Intensity 0 = instant state changes

---

## Eject — Own Your Components

Need to deeply customize a component? Eject it into your project:

```bash
npx @thesage/ui eject Button
npx @thesage/ui eject Dialog --dir components/sage
npx @thesage/ui eject --list
```

The CLI copies component source with imports automatically rewritten. Ejected components still work with Sage themes and CSS variables.

Also available via:
- **Web UI** — Eject button on every component page at [thesage.dev](https://thesage.dev)
- **MCP** — `eject_component` tool returns transformed source for AI assistants
- **API** — `GET /api/eject/{component}` returns JSON with source and dependencies

---

## Sage Studio

Interactive documentation at [thesage.dev](https://thesage.dev):

- Component explorer with live prop controls
- Token gallery across all themes
- Copy-paste ready code examples
- **Eject button** on every component page — copy or download source for full customization
- Accessibility guidelines per component
- AI discovery endpoints (`/.well-known/ai-plugin.json`, `/docs/api.json`)

---

## Development

### Prerequisites

- Node.js 24+ (see `.nvmrc`)
- pnpm 8.15.0+

### Setup

```bash
git clone <repo-url>
cd sage-design-engine
pnpm install
```

### Commands

```bash
pnpm dev                          # Start dev server (Studio)
pnpm build                        # Build all packages and apps
pnpm build --filter @thesage/ui   # Build specific package
pnpm --filter @thesage/ui test    # Run tests (156 tests, 30 files)
pnpm lint                         # Lint all
pnpm typecheck                    # TypeScript checks
```

### Releasing

```bash
pnpm changeset                    # Create a changeset
pnpm version-packages             # Version packages
pnpm release                      # Build and publish to NPM
```

### File Structure

```
sage-design-engine/
├── packages/
│   ├── ui/                    # @thesage/ui — Component library
│   │   ├── src/components/    # 100 components by functional category
│   │   ├── src/hooks/         # useTheme, useMotionPreference
│   │   ├── src/providers/     # ThemeProvider, TooltipProvider
│   │   └── src/lib/           # Utilities, stores
│   ├── tokens/                # @thesage/tokens — Design tokens
│   └── mcp/                   # @thesage/mcp — MCP server
├── apps/
│   └── web/                   # Sage Studio (thesage.dev)
├── docs/                      # Documentation
├── DESIGN-PHILOSOPHY.md       # The North Star
└── turbo.json                 # Turborepo task orchestration
```

---

## Architecture

### Functional Organization

Components organized by **purpose** (not atomic hierarchy):

`actions/` `forms/` `navigation/` `overlays/` `feedback/` `data-display/` `layout/` `features/` `backgrounds/` `cursor/` `motion/`

### Styling

CSS variables enable runtime theme switching. All components use semantic tokens:

```tsx
// Theme-aware (correct)
<div className="bg-background text-foreground border-border">

// Hardcoded (incorrect)
<div className="bg-white text-black border-gray-200">
```

### State Management

- **Zustand** — Theme, motion, customizer state with localStorage persistence
- **React Context** — Provider hierarchy for theme injection
- **react-hook-form** — Form state management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion 12 |
| UI Primitives | Radix UI |
| State | Zustand 5 |
| Build | tsup 8 (ESM + CJS) |
| Testing | Vitest + Testing Library |
| Monorepo | Turborepo + pnpm workspaces |

---

## Contributing

1. Read [DESIGN-PHILOSOPHY.md](./DESIGN-PHILOSOPHY.md) first
2. Follow functional organization patterns
3. Ensure accessibility (WCAG AA, keyboard nav, motion preferences)
4. Include tests for new components
5. Use `pnpm changeset` for versioning

---

## License

MIT
