# @opencosmos/tokens

Design tokens for the OpenCosmos UI — the foundation layer that defines colors, typography, spacing, motion curves, and syntax highlighting across three themes.

[![npm version](https://img.shields.io/npm/v/@opencosmos/tokens?style=flat-square)](https://www.npmjs.com/package/@opencosmos/tokens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why a separate package?

Tokens are **design decisions as code**. They serve audiences beyond React components — CSS-only projects, native apps, Figma plugins, or anyone building their own component layer on top of OpenCosmos' design language. Install `@opencosmos/tokens` for just the values, or get them bundled with components via `@opencosmos/ui/tokens`.

## Installation

```bash
npm install @opencosmos/tokens
# or
pnpm add @opencosmos/tokens
```

If you're already using `@opencosmos/ui`, tokens are re-exported via the `@opencosmos/ui/tokens` subpath — no separate install needed.

## Usage

### Theme tokens

Each theme exports a complete set of design values for light and dark modes:

```ts
import { studioTokens, terraTokens, voltTokens } from '@opencosmos/tokens'

const primary = studioTokens.light.colors.primary
const heading = terraTokens.dark.colors.foreground
```

### Typography system

```ts
import { typographySystem } from '@opencosmos/tokens'

// Access size scales (xs through 8xl), font stacks, and type presets
const bodySize = typographySystem.sizes.base
```

### Font themes

```ts
import { fontThemes } from '@opencosmos/tokens'

// 10+ curated font combinations with Google Fonts integration
const editorial = fontThemes.editorial // { heading, body, mono, bestFor }
```

### Color utilities

Generate accessible color scales from a single hex value:

```ts
import { hexToHSL, generateColorScale } from '@opencosmos/tokens'

const hsl = hexToHSL('#3b82f6')           // "217 91% 60%"
const scale = generateColorScale('#3b82f6') // Full 50-950 scale
```

### Color palettes

Pre-built palettes with light/dark mode support:

```ts
import { colorPalettes } from '@opencosmos/tokens'
```

### Syntax highlighting

14 token types for code highlighting, theme-aware:

```ts
import { syntaxTokens } from '@opencosmos/tokens'
```

### Type helpers

```ts
import type { ThemeName, ColorMode, ThemeConfig } from '@opencosmos/tokens'

const config: ThemeConfig = { name: 'studio', mode: 'dark' }
```

## Themes

| Theme | Personality | Colors |
|-------|------------|--------|
| **Studio** | Professional, balanced | Cool blues, grays |
| **Terra** | Calm, organic | Earth tones, sage greens |
| **Volt** | Bold, electric | Electric blues, cyans |

All themes include WCAG AA compliant color combinations.

## Exports

| Export | Description |
|--------|-------------|
| `studioTokens`, `terraTokens`, `voltTokens` | Complete theme token sets |
| `typographySystem` | Size scales, font stacks, presets |
| `fontThemes` | Curated font combinations |
| `colorPalettes` | Pre-built color palettes |
| `syntaxTokens` | Syntax highlighting tokens |
| `hexToHSL`, `generateColorScale` | Color conversion utilities |
| `tokenGraph` | Token dependency graph |
| `ThemeName`, `ColorMode`, `ThemeConfig` | TypeScript types |
| `THEME_NAMES`, `COLOR_MODES` | Runtime constants |

## License

MIT
