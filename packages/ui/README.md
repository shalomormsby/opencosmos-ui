# OpenCosmos UI (@opencosmos/ui)

<div align="center">

[![npm version](https://img.shields.io/npm/v/@opencosmos/ui?color=indigo&style=flat-square)](https://www.npmjs.com/package/@opencosmos/ui)
[![License](https://img.shields.io/npm/l/@opencosmos/ui?color=blue&style=flat-square)](https://github.com/shalomormsby/opencosmos-ui/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dt/@opencosmos/ui?color=teal&style=flat-square)](https://www.npmjs.com/package/@opencosmos/ui)

**OpenCosmos UI — Make it Lovable.**

Components that feel alive. Themes with real personality. Motion your users control. Designed for humans. Fluent with AI.

[Documentation](https://opencosmos.ai/studio) | [Components](https://opencosmos.ai/studio/components) | [GitHub](https://github.com/shalomormsby/opencosmos-ui)

</div>

---

**OpenCosmos UI** is a component library and design system built on **Radix UI** primitives and **Tailwind CSS**. 100 accessible components across 11 functional categories, three distinct themes with runtime switching, and a user-controlled motion system — all wired through a 4-layer design token architecture.

## Features

- **Accessible by default** — Built on WAI-ARIA standards via Radix UI. Keyboard navigable, screen reader compatible, WCAG AA contrast.
- **Three themes, real personality** — Studio (professional), Terra (organic), Volt (electric). Runtime switching via CSS variables, light and dark modes each.
- **User-controlled motion** — A 0–10 intensity scale that respects `prefers-reduced-motion`. Intensity 0 works perfectly — no degraded experience.
- **Modular imports** — Core stays lean. Heavy features (forms, dates, tables, drag-and-drop, WebGL) ship as optional subpath exports — install only what you use.
- **Type safe** — Written in TypeScript with full type inference. React 19 ref-as-prop pattern throughout.
- **Design token system** — Colors, typography, spacing, motion, and syntax tokens. Change one primary color, everything updates.

## Installation

```bash
pnpm add @opencosmos/ui
```

OpenCosmos UI requires **Tailwind CSS v4** as a styling engine:

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/postcss
```

### Optional subpath exports

Install peer dependencies only for the features you need:

```bash
# Forms (react-hook-form + zod validation)
pnpm add react-hook-form @hookform/resolvers zod

# Date picker
pnpm add react-day-picker date-fns

# Data tables
pnpm add @tanstack/react-table

# Drag and drop
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Configure styles (one CSS entry — no content globs, no safelist)

Tailwind v4 is CSS-first; there is no `tailwind.config.js` `content` array. In your
app's single CSS entry (e.g. `app/globals.css`), import these in order:

```css
@import "tailwindcss";                 /* your app's own utilities */
@import "@opencosmos/ui/theme.css";    /* design tokens + custom utilities */
@import "@opencosmos/ui/globals.css";  /* default token values (:root) */
@import "@opencosmos/ui/styles.css";   /* precompiled component styles */

@layer base {
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
}
```

Then import that one file in your root layout:

```tsx
// app/layout.tsx
import './globals.css';
```

> **Why `styles.css`?** It is a precompiled stylesheet shipped with the package
> containing every Tailwind class the components use (including responsive
> variants). This means you **do not** need to add `@opencosmos/ui` to a Tailwind
> `content`/`@source` glob, and you **do not** need a safelist — both of which are
> fragile (Tailwind v4 + Turbopack silently ignores `node_modules` symlink scans).
> Import `styles.css` and component styling just works.

> **Order matters:** keep `styles.css` after `globals.css` so token values resolve.
> `styles.css` intentionally emits no `:root` token vars, so it never clobbers them.

> **The `font-family` lines are not optional.** `ThemeProvider` sets `--font-heading`/
> `--font-body`/`--font-mono` as CSS variables, but nothing in the package applies
> them anywhere — skip this and every theme renders its correct colors but the
> exact same typeface, silently. You also need to load each theme's fonts yourself
> (Studio: Outfit + Manrope, Terra: Lora + Instrument Sans, Volt: Space Grotesk) via
> `next/font/google` and expose them as `--font-studio-heading`, `--font-studio-body`,
> etc. — see `apps/web/lib/fonts.ts` in the opencosmos-ui repo for a working example.

> **Never hardcode a `dark`/`light` class on a layout wrapper.** `globals.css`
> defines dark-mode tokens under a bare `.dark { ... }` selector, not `:root.dark`,
> so any element carrying that literal class re-pins tokens for its whole subtree —
> permanently, regardless of what `ThemeProvider`/`CustomizerPanel` set on `<html>`.
> Copying a "force this section dark" pattern onto a top-level wrapper makes the
> Customizer look broken: its own UI updates, the page underneath doesn't. Only use
> it on a section that should deliberately ignore the user's theme choice.

## Usage

```tsx
import { Button, Card, ThemeProvider } from '@opencosmos/ui';

export default function App() {
  return (
    <ThemeProvider defaultTheme="studio" defaultMode="dark">
      <Card className="max-w-md p-6">
        <h3 className="mb-2 text-lg font-semibold">Welcome to OpenCosmos</h3>
        <p className="mb-4 text-muted-foreground">
          Build beautifully with components that feel premium out of the box.
        </p>
        <div className="flex gap-2">
          <Button>Get Started</Button>
          <Button variant="ghost">Documentation</Button>
        </div>
      </Card>
    </ThemeProvider>
  );
}
```

### Subpath imports

```tsx
import { useMotionPreference, useTheme } from '@opencosmos/ui/hooks'
import { ThemeProvider } from '@opencosmos/ui/providers'
import { cn } from '@opencosmos/ui/utils'

// Optional feature imports
import { Form, FormField } from '@opencosmos/ui/forms'
import { DatePicker } from '@opencosmos/ui/dates'
import { DataTable } from '@opencosmos/ui/tables'
import { DragDropList, DragDropTable } from '@opencosmos/ui/dnd'
```

## Component categories

| Category | Examples |
|----------|----------|
| **Actions** | Button, Toggle, ToggleGroup, Link, Magnetic |
| **Forms** | Input, Select, Checkbox, Switch, Slider, SearchBar, DatePicker, ColorPicker, FileUpload, InputOTP, Combobox |
| **Navigation** | Tabs, Menubar, Breadcrumb, Pagination, NavigationMenu, Command |
| **Overlays** | Dialog, Sheet, Popover, Tooltip, ContextMenu, HoverCard, AlertDialog, NotificationCenter |
| **Data Display** | Card, Avatar, Badge, Table, DataTable, ScrollArea, Carousel, TreeView, Timeline, StatCard |
| **Feedback** | Alert, Progress, Skeleton, Toast (Sonner), Spinner, Stepper, ThinkingIndicator |
| **Layout** | Accordion, Separator, ResizablePanels, Collapsible, Grid, Stack, Sidebar |
| **Features** | Customizer, ThemeSwitcher, GlassSurface, Hero |

This table isn't exhaustive — the package ships 100 components across 11 categories. For the complete, always-current list, run `npx @opencosmos/ui eject --list` or check `src/component-registry.ts`.

## Eject — full customization

Need to deeply customize a component? Eject it into your project for full ownership:

```bash
npx @opencosmos/ui eject Button
npx @opencosmos/ui eject Dialog --dir components/sage
npx @opencosmos/ui eject --list  # see all available components
```

This copies the component source into your project with imports automatically rewritten. The ejected component still works with OpenCosmos themes and CSS variables — you just own the code now.

You can also eject from [opencosmos.ai/studio](https://opencosmos.ai/studio) — every component page has an **Eject** button that lets you copy or download the source directly.

## Bundle size

Core and optional entry points are independently tracked via [size-limit](https://github.com/ai/size-limit):

| Entry point | Brotli size |
|-------------|-------------|
| Core | ~146 KB |
| Hooks | ~40 KB |
| Providers | ~60 KB |
| Tokens | ~70 KB |
| Utils | ~25 KB |
| Forms | ~9.4 KB |
| Dates | ~29 KB |
| Tables | ~8.3 KB |
| DnD | ~8.3 KB |
| WebGL | ~1.1 KB |

## License

MIT &copy; [Shalom Ormsby](https://github.com/shalomormsby)
