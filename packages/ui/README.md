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

OpenCosmos UI requires **Tailwind CSS** as a styling engine:

```bash
pnpm add -D tailwindcss@^3.4 postcss autoprefixer
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

### Configure Tailwind

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@opencosmos/ui/dist/**/*.{js,ts,jsx,tsx}"
  ],
}
```

### Import styles

```tsx
import '@opencosmos/ui/globals.css';
```

## Usage

```tsx
import { Button, Card, ThemeProvider } from '@opencosmos/ui';

export default function App() {
  return (
    <ThemeProvider theme="studio" defaultMode="system">
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
import { SortableList } from '@opencosmos/ui/dnd'
```

## Component categories

| Category | Examples |
|----------|----------|
| **Actions** | Button, Toggle, ToggleGroup |
| **Forms** | Input, Select, Checkbox, Switch, Slider, SearchBar |
| **Navigation** | Tabs, Menubar, Breadcrumb, Pagination, NavigationMenu |
| **Overlays** | Dialog, Sheet, Popover, Tooltip, ContextMenu, HoverCard |
| **Data Display** | Card, Avatar, Badge, Table, ScrollArea, Carousel |
| **Feedback** | Alert, Progress, Skeleton, Toast (Sonner) |
| **Layout** | Accordion, Separator, ResizablePanels, Collapsible |
| **Features** | Customizer, ThemeSwitcher |

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
