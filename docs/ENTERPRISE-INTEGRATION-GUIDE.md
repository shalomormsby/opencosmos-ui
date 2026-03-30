# OpenCosmos UI: Integration Guide

> **For teams integrating `@opencosmos/ui` into Next.js applications.**
> **Last updated:** 2026-02-06

---

## Quick Start

### 1. Install Dependencies

```bash
# Core (required)
pnpm add @opencosmos/ui framer-motion

# Optional — install only what you use
pnpm add react-hook-form @hookform/resolvers zod         # Forms
pnpm add date-fns react-day-picker                       # Date pickers
pnpm add @tanstack/react-table                           # Data tables
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities  # Drag & drop
```

### 2. Configure Tailwind

**tailwind.config.ts:**

```typescript
import type { Config } from 'tailwindcss'
import path from 'path'

const config: Config = {
  darkMode: 'class',  // Required — ThemeProvider uses class-based dark mode
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Include the design system source for Tailwind class scanning
    path.join(__dirname, './node_modules/@opencosmos/ui/src/**/*.{js,ts,jsx,tsx}'),
  ],
  // The Tailwind preset is bundled within @opencosmos/ui
  // See globals.css setup in documentation at opencosmos.ai/studio
}

export default config
```

> **Monorepo users:** If using `workspace:*`, point content to the source directory:
> `path.join(__dirname, '../../packages/ui/src/**/*.{js,ts,jsx,tsx}')`

**postcss.config.mjs:**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3. Global CSS

**app/globals.css:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

The `ThemeProvider` injects all CSS variables at runtime. No manual variable definitions needed.

### 4. Root Layout

**app/layout.tsx:**

```tsx
import { ThemeProvider } from '@opencosmos/ui'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` is required on `<html>` and `<body>` because ThemeProvider modifies the DOM (class, data attributes, CSS variables) on mount to apply the persisted theme.

### 5. Use Components

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@opencosmos/ui'

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello, Sage</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get Started</Button>
      </CardContent>
    </Card>
  )
}
```

---

## Providers

### ThemeProvider (Required)

Manages theme switching, dark mode, and CSS variable injection.

```tsx
import { ThemeProvider } from '@opencosmos/ui'

<ThemeProvider>
  {children}
</ThemeProvider>
```

**What it does:**
- Injects 40+ CSS variables on `<html>` for colors, typography, effects, motion
- Sets `data-theme`, `data-mode`, `data-custom-colors` attributes
- Adds/removes `dark` class for Tailwind dark mode
- Persists user preferences to localStorage
- Respects system `prefers-color-scheme`

**Available themes:** `studio` (professional), `terra` (organic), `volt` (electric)

### Optional Providers

```tsx
import { ThemeProvider, ToastProvider, TooltipProvider, CustomizerPanel } from '@opencosmos/ui'

<ThemeProvider>
  <ToastProvider position="bottom-right">
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </ToastProvider>
  <CustomizerPanel />  {/* User-facing theme controls */}
</ThemeProvider>
```

- **ToastProvider** — Enables `toast()` notifications (powered by Sonner)
- **TooltipProvider** — Required if using `<Tooltip>` components
- **CustomizerPanel** — Optional floating panel for runtime theme/motion customization

---

## Import Patterns

### Main Entry (Most Common)

```typescript
import { Button, Card, Input, useTheme, cn } from '@opencosmos/ui'
```

The main entry exports all 48+ components, hooks, and utilities.

### Subpath Exports (Targeted Imports)

For features that require optional peer dependencies:

```typescript
// Forms — requires react-hook-form, @hookform/resolvers, zod
import { Form, FormField, FormItem, FormLabel } from '@opencosmos/ui/forms'

// Date pickers — requires date-fns, react-day-picker
import { Calendar } from '@opencosmos/ui/dates'
import { DatePicker } from '@opencosmos/ui/dates'

// Data tables — requires @tanstack/react-table
import { DataTable } from '@opencosmos/ui/tables'

// Drag and drop — requires @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
import { DragDrop } from '@opencosmos/ui/dnd'

// Other subpaths (no extra deps needed)
import { useMotionPreference, useTheme } from '@opencosmos/ui/hooks'
import { ThemeProvider } from '@opencosmos/ui/providers'
import { cn, parseCode } from '@opencosmos/ui/utils'
import { spacing, typography } from '@opencosmos/ui/tokens'
import { Renderer, Program, Mesh } from '@opencosmos/ui/webgl'
```

---

## Styling

### CSS Variable System

All colors use CSS variables for runtime theme switching. Use Tailwind utilities:

```tsx
// Theme-aware (correct)
<div className="bg-background text-foreground border-border" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-secondary text-secondary-foreground" />

// Hardcoded (incorrect — breaks with theme switching)
<div className="bg-white text-black border-gray-200" />
```

### Available Color Utilities

| Utility | Variable |
|---------|----------|
| `bg-background` / `text-foreground` | Base background/text |
| `bg-primary` / `text-primary-foreground` | Brand primary |
| `bg-secondary` | Secondary surfaces |
| `bg-accent` | Accent highlights |
| `bg-destructive` | Destructive actions |
| `bg-success` / `bg-warning` / `bg-error` / `bg-info` | Status colors |
| `bg-surface` | Elevated surfaces |
| `bg-glass` / `border-glass-border` | Glass morphism |
| `text-foreground-secondary` | Secondary text |

### Typography

```tsx
<h1 className="font-heading">Heading</h1>
<p className="font-body">Body text</p>
<code className="font-mono">Code</code>
```

Font families are theme-specific — `font-heading` maps to different typefaces per theme.

### Border Radius

```tsx
<div className="rounded-lg" />   {/* var(--radius) */}
<div className="rounded-md" />   {/* calc(var(--radius) - 2px) */}
<div className="rounded-sm" />   {/* calc(var(--radius) - 4px) */}
```

### Dark Mode

Works automatically with Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-gray-900" />
```

ThemeProvider manages the `dark` class on `<html>`. Prefer using semantic tokens (`bg-background`) over manual dark mode overrides.

---

## Motion System

Every animation respects user preferences. Use the motion hook:

```tsx
import { useMotionPreference } from '@opencosmos/ui/hooks'

function AnimatedComponent() {
  const { shouldAnimate, scale } = useMotionPreference()

  return (
    <motion.div
      animate={{ opacity: 1, y: shouldAnimate ? 20 : 0 }}
      transition={{ duration: shouldAnimate ? 0.3 * scale : 0 }}
    >
      Content
    </motion.div>
  )
}
```

- **Intensity 0** = no animations (instant state changes)
- **Intensity 10** = full animations
- Syncs with system `prefers-reduced-motion`
- Controllable via CustomizerPanel

---

## Bundle Sizes

All sizes measured with brotli compression:

| Entry | Size | Limit | Optional Deps |
|-------|------|-------|---------------|
| Core (`@opencosmos/ui`) | 146 KB | 450 KB | None |
| Hooks | 6 KB | 40 KB | None |
| Providers | 8 KB | 60 KB | None |
| Tokens | 11 KB | 70 KB | None |
| Utils | 9.5 KB | 25 KB | None |
| WebGL | 1.1 KB | 10 KB | None |
| Forms | 9.4 KB | 10 KB | react-hook-form, zod |
| Dates | 29 KB | 30 KB | date-fns, react-day-picker |
| Tables | 8.3 KB | 10 KB | @tanstack/react-table |
| DnD | 8.3 KB | 10 KB | @dnd-kit/* |

Bundle sizes are enforced in CI via [size-limit](https://github.com/ai/size-limit).

---

## Peer Dependencies

### Required

| Package | Version |
|---------|---------|
| `react` | `*` (18+ or 19+) |
| `framer-motion` | `*` |

### Optional

Install only the peer deps needed for the subpath exports you use:

| Subpath | Peer Dependencies |
|---------|-------------------|
| `@opencosmos/ui/forms` | `react-hook-form` ^7.70, `@hookform/resolvers` ^3.10, `zod` ^3.24 |
| `@opencosmos/ui/dates` | `date-fns` ^4.1, `react-day-picker` ^9.13 |
| `@opencosmos/ui/tables` | `@tanstack/react-table` ^8.21 |
| `@opencosmos/ui/dnd` | `@dnd-kit/core` ^6.3, `@dnd-kit/sortable` ^10.0, `@dnd-kit/utilities` ^3.2 |

---

## Troubleshooting

### "Cannot find module @opencosmos/ui"

Rebuild the design system:
```bash
pnpm build --filter @opencosmos/ui
```

### Theme not applying / flash of unstyled content

Ensure `suppressHydrationWarning` is on `<html>` and `<body>`:
```tsx
<html suppressHydrationWarning>
  <body suppressHydrationWarning>
```

### Tailwind classes not working for design system components

Add the design system source to your `tailwind.config.ts` content paths:
```typescript
content: [
  path.join(__dirname, './node_modules/@opencosmos/ui/src/**/*.{js,ts,jsx,tsx}'),
  // ...
]
```

### Stale build cache

```bash
rm -rf .turbo packages/ui/dist apps/*/.next
pnpm build
```

### TypeScript errors after updating

```bash
pnpm build --filter @opencosmos/ui  # Regenerates .d.ts files
```
