# Storybook Best Practices — Lessons from Speedboat Design

> Practical guidance for setting up a world-class Storybook, distilled from the Speedboat Design project (Storybook 10, React 19, Vite, Tailwind CSS v4).

---

## 1. Choose the Right Stack Integration

### Vite as the Build Engine

Speedboat uses `@storybook/react-vite` — Storybook 10's first-class Vite integration. This gives you:

- **Instant HMR** — component changes reflect in < 200ms
- **Shared Vite config** — Storybook inherits your app's `vite.config.ts` aliases, plugins, and optimizations
- **No Webpack** — eliminates the Webpack/Vite mismatch that plagued earlier Storybook versions

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: '@storybook/react-vite',
}
export default config
```

**Tip:** If your `vite.config.ts` uses path aliases (e.g. `@/`), Storybook picks them up automatically — no duplicate config needed.

### Tailwind CSS v4 Integration

Tailwind v4 uses a Vite plugin (`@tailwindcss/vite`) and defines tokens in CSS via `@theme {}` blocks. The integration is beautifully simple:

1. Add `@tailwindcss/vite` to your `vite.config.ts` plugins array
2. Import your CSS entry point in `.storybook/preview.ts`
3. That's it — no PostCSS config, no `tailwind.config.js`

```ts
// .storybook/preview.ts
import '../src/index.css'  // This is all you need
```

**Lesson learned:** Tailwind v4 eliminated the `postcss.config.js` + `tailwind.config.js` ceremony entirely. If you're still maintaining those files, you're likely on v3 patterns.

---

## 2. Organize Stories by Function, Not Atoms

### The Speedboat Hierarchy

Instead of the classic Atomic Design taxonomy (Atoms → Molecules → Organisms → Templates → Pages), Speedboat organizes by **what the component does**:

```
Welcome
Changelog
Foundations      → Tokens: Colors, Typography, Spacing, Radii, Layout, Icons, Animations
Layout           → Structural containers: Card, Stack, Grid, GlassSurface, StickyHeader
Data Display     → Content: Text, Badge, Table, Chart, DataChip
Actions          → User triggers: Button, DarkModeToggle
Forms            → Inputs: Input, Select, SearchBar, TextArea
Feedback         → System responses: Toast, Spinner, ProgressBar, Alert
Overlays         → Layered UI: Dialog, Drawer, Tooltip, DropdownMenu
Pages            → Full compositions: AppCard, BenchmarkPage
Speedboat        → Domain-specific: BrandLogo, AgentChat
```

**Why this works better:**

- Mirrors how a page is built (structure → content → interaction → feedback)
- Developers find components by asking "what do I need?" not "how big is it?"
- New components have an obvious home — no debates about "is this a molecule or organism?"

### Implementing Sort Order

```ts
// .storybook/preview.ts
parameters: {
  options: {
    storySort: {
      order: [
        'Welcome',
        'Changelog',
        'Foundations',
        'Layout',
        'Data Display',
        'Actions',
        'Forms',
        'Feedback',
        'Overlays',
        'Pages',
      ],
    },
  },
},
```

### Story File Placement

Speedboat uses two patterns depending on component origin:

| Component type | Story location | Naming pattern |
|---------------|---------------|----------------|
| App components | Co-located: `src/components/Foo.stories.tsx` | `title: 'Category/Foo'` |
| Library (SDE) components | Separate: `src/stories/sde/Foo.stories.tsx` | `title: 'Category/Foo'` |
| Foundation tokens | `src/stories/foundations/Foo.stories.tsx` | `title: 'Foundations/Foo'` |

**Key insight:** Co-locate stories with their components whenever possible. It enforces documentation as a build habit, not an afterthought.

---

## 3. Dark Mode — Get It Right from Day One

### The `withThemeByClassName` Pattern

Speedboat uses Storybook's `@storybook/addon-themes` with a CSS class strategy:

```ts
// .storybook/preview.ts
import { withThemeByClassName } from '@storybook/addon-themes'

decorators: [
  withThemeByClassName({
    themes: {
      Light: '',
      Dark: 'dark',
    },
    defaultTheme: 'Light',
    parentSelector: 'html',
  }),
],
```

This adds/removes a `dark` class on the `<html>` element, which maps directly to how Tailwind's dark mode works.

**Why `parentSelector: 'html'` matters:** Storybook stories render inside an iframe. The `parentSelector` ensures the class is applied to the correct root element so your `html.dark` / `.dark` selectors work.

**Lesson learned:** If your dark mode relies on `.dark` class on a parent element (as Tailwind recommends), this decorator handles it perfectly. No custom implementation needed.

---

## 4. Accessibility as a Build Gate

### Global a11y Configuration

Speedboat treats accessibility violations as errors by default:

```ts
// .storybook/preview.ts
parameters: {
  a11y: {
    test: 'error',
    config: {
      rules: [
        { id: 'color-contrast', enabled: false },
      ],
    },
  },
},
```

- `test: 'error'` — axe-core violations **fail** the story (red badge in the a11y panel)
- `color-contrast` is globally disabled because design tokens sometimes use intentionally low-contrast muted text

### Per-Story Exceptions

When a story legitimately can't meet a11y rules (e.g. a showcase of all muted text variants):

```ts
export const AllVariants: Story = {
  parameters: {
    a11y: { test: 'todo' },
  },
}
```

### Vitest Integration

Speedboat runs a11y checks as part of the test suite:

```ts
// .storybook/vitest.setup.ts
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import { setProjectAnnotations } from '@storybook/react-vite'
import * as projectAnnotations from './preview'

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations])
```

This means `pnpm test` catches a11y regressions in CI, not just when someone opens Storybook manually.

**Lesson learned:** Setting `test: 'error'` globally and carving out exceptions per-story is far more effective than the reverse (opt-in a11y). It creates a culture where accessibility is the default.

---

## 5. Custom Addons — The WIP Toggle

Speedboat built a custom toolbar addon for filtering stories by readiness:

```tsx
// .storybook/manager.tsx
addons.register('wip-mode-toggle', (api) => {
  api.experimental_setFilter('wip-filter', () => true)

  addons.add('wip-mode-toggle/tool', {
    type: types.TOOLEXTRA,
    title: 'WIP mode',
    render: () => {
      const [mode, setMode] = useState<'published' | 'wip'>('published')

      const toggle = useCallback(() => {
        setMode((prev) => {
          const next = prev === 'published' ? 'wip' : 'published'
          api.experimental_setFilter('wip-filter', (item) => {
            const isWip = item.tags?.includes('wip')
            if (next === 'wip') return !!isWip
            return !isWip
          })
          return next
        })
      }, [])

      return (
        <IconButton active={mode === 'wip'} onClick={toggle}>
          {mode === 'wip' ? <Wrench size={14} /> : <Rocket size={14} />}
        </IconButton>
      )
    },
  })
})
```

Stories opt in with `tags: ['wip']`. The toggle lets the team see only production-ready stories (default) or only work-in-progress ones.

**Why this matters for Sage:** As the component count grows (92+ already), filtering by status becomes essential. Consider adopting this pattern — it costs ~40 lines and saves designers from wading through incomplete work.

---

## 6. Brand the Chrome

### Custom Storybook Theme

Speedboat replaces the default Storybook chrome with a branded dark theme:

```ts
// .storybook/speedboat-theme.ts
import { create } from 'storybook/theming'

export const speedboatDarkChrome = create({
  base: 'dark',
  brandTitle: 'Speedboat AI',
  brandUrl: '/',
  brandImage: '/speedboat-brand-dark.svg',
  appBg: '#0D0E14',
  appContentBg: '#16181F',
  colorPrimary: '#4A7FF7',
  colorSecondary: '#4A7FF7',
  fontBase: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
  fontCode: "'Fira Code', monospace",
  // ... sidebar, toolbar, input colors
})
```

Applied in `manager.tsx`:

```ts
import { speedboatDarkChrome } from './speedboat-theme'
addons.setConfig({ theme: speedboatDarkChrome })
```

**Lesson learned:** Branding the Storybook chrome signals to stakeholders that this isn't a developer-only tool — it's the team's living design reference. It takes 30 minutes and dramatically changes perception.

---

## 7. Foundation Stories — Document Tokens as Components

Speedboat creates full-page stories that showcase design tokens as interactive galleries:

```tsx
// src/stories/foundations/Colors.stories.tsx
const meta: Meta = {
  title: 'Foundations/Colors',
  component: ColorGallery,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
```

Each foundation story:
- Uses `layout: 'fullscreen'` for maximum visual impact
- Groups tokens by semantic purpose (Core, Brand, Semantic, Status)
- Shows computed values using `getComputedStyle` so the gallery is always in sync with the actual CSS variables
- Supports theme switching (the gallery updates live when you toggle Light/Dark)

**Why this matters:** Design tokens in a JSON file are invisible. Tokens rendered as a gallery in Storybook are a shared language. Every designer, developer, and PM can see exactly what "color-primary" means.

---

## 8. Test Stories with Vitest + Playwright

Speedboat runs story-level tests in a real browser using `@storybook/addon-vitest` and Playwright:

```ts
// vite.config.ts
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [{
      extends: true,
      plugins: [storybookTest({ configDir: '.storybook' })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{ browser: 'chromium' }],
        },
        setupFiles: ['.storybook/vitest.setup.ts'],
      },
    }],
  },
})
```

This means every story is automatically a test case. Stories with `play` functions become interaction tests. Stories with `a11y: { test: 'error' }` become accessibility tests. No separate test files needed.

**Lesson learned:** The "stories are tests" philosophy eliminates the documentation-vs-testing tradeoff. Write a good story and you get both for free.

---

## 9. Viewport Presets

Define your breakpoints once:

```ts
// .storybook/preview.ts
viewport: {
  viewports: {
    mobile:  { name: 'Mobile',  styles: { width: '375px',  height: '812px'  } },
    tablet:  { name: 'Tablet',  styles: { width: '768px',  height: '1024px' } },
    desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px'  } },
  },
},
```

**Tip:** Match these to your actual CSS breakpoints. If your Tailwind config has `sm: 640px`, `md: 768px`, `lg: 1024px`, make your Storybook viewports match so there's one source of truth for "what does mobile mean?"

---

## 10. Essential Addon Stack

The Speedboat addon stack, in priority order:

| Addon | Purpose | Worth it? |
|-------|---------|-----------|
| `@storybook/addon-a11y` | axe-core accessibility checks | **Must have** |
| `@storybook/addon-themes` | Light/Dark toggle in toolbar | **Must have** for dark mode |
| `@storybook/addon-docs` | Auto-generated documentation | **Must have** |
| `@storybook/addon-vitest` | Story-based testing | **Must have** for CI |
| `@chromatic-com/storybook` | Visual regression testing | Great for teams |
| `@storybook/addon-onboarding` | First-run experience | Nice for onboarding new devs |

---

## 11. Global Decorators — Keep Them Minimal

Speedboat uses exactly two global decorators:

```ts
decorators: [
  withSonner,                    // Toast notifications (Sonner)
  withThemeByClassName({ ... }), // Dark mode
],
```

**Lesson learned:** Every global decorator wraps every story. Keep this list short and essential. If a decorator is only needed for some stories, apply it per-story or per-meta instead.

The Sonner decorator is a good example of "essential global" — any story might trigger a toast, so the `<Toaster>` provider needs to be always present.

---

## 12. TypeScript Configuration

Speedboat uses a single `tsconfig.json` for both the app and Storybook:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

**Tip:** Don't create a separate `tsconfig.storybook.json`. Storybook 10 with Vite doesn't need one — it uses the same resolution as your main app.

---

## Summary Checklist for Sage Design Engine

- [ ] Adopt `@storybook/react-vite` (Storybook 10) for Vite-native integration
- [ ] Import `globals.css` in `.storybook/preview.ts` to get all tokens and component styles
- [ ] Organize stories by functional category (Layout, Actions, Forms, Feedback, etc.)
- [ ] Set `a11y: { test: 'error' }` globally — make accessibility the default
- [ ] Add `withThemeByClassName` for Studio/Terra/Volt × Light/Dark switching
- [ ] Brand the Storybook chrome with Sage identity and colors
- [ ] Create foundation stories for tokens (colors, typography, spacing)
- [ ] Add the WIP toggle pattern to manage in-progress components
- [ ] Configure Vitest + Playwright for story-based testing in CI
- [ ] Define viewport presets matching actual breakpoints
- [ ] Keep global decorators minimal (providers only)
- [ ] Use a single tsconfig — no Storybook-specific overrides

---

*This document was generated from the Speedboat Design Storybook (Storybook 10.2, React 19, Vite, Tailwind CSS v4). See the [live Storybook](https://moloco.github.io/speedboat-design/storybook/) for the reference implementation.*
