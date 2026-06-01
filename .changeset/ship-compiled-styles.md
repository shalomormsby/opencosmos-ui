---
"@opencosmos/ui": minor
---

Ship a precompiled stylesheet and fix dynamically-built layout classes.

**New: `@opencosmos/ui/styles.css`** — a precompiled stylesheet containing every Tailwind class the components use (responsive variants and custom animation utilities included). Consuming apps import it once and get correct styling without adding `@opencosmos/ui` to a Tailwind `content`/`@source` glob and without a per-app safelist — both of which silently fail under Tailwind v4 + Turbopack (which does not scan symlinked `node_modules`). The stylesheet references theme tokens but emits no `:root` token vars, so it never clobbers theme values.

```css
@import "tailwindcss";
@import "@opencosmos/ui/theme.css";
@import "@opencosmos/ui/globals.css";
@import "@opencosmos/ui/styles.css"; /* new */
```

**Fix: `Grid`, `GridItem`, and `Stack` rendered unstyled** in consuming apps because they built class names by interpolation (`gap-${n}`, and responsive prefixes like `md:${cls}`), which Tailwind's scanner cannot see, so those utilities were never generated. They now resolve classes from exhaustive static-literal maps (`src/lib/responsive-classes.ts`). A `no-dynamic-classes` test enforces the rule going forward.

`theme.css` is unchanged in behavior but is now composed from `theme.tokens.css` (the `@theme` block) and `animations.css` (keyframes + custom `@utility`).
