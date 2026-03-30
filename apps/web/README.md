# OpenCosmos Studio

> **Interactive documentation for the Sage UI.** Makes design tokens, components, and design decisions publicly explorable at [opencosmos.ai/studio](https://opencosmos.ai/studio).

## Purpose & Scope

**This README documents the OpenCosmos Studio app** — the Next.js 15 documentation platform itself, including its architecture, development workflow, and how to add components to the playground.

**For the design system itself** (components, tokens, usage patterns), see:
- **[SAGE_DESIGN_SYSTEM_STRATEGY.md](./docs/SAGE_DESIGN_SYSTEM_STRATEGY.md)** — Complete design system strategy, architecture, and usage guide
- **[Root README](../../README.md)** — Ecosystem overview, philosophy, and quick start
- **[DESIGN-PHILOSOPHY.md](../../DESIGN-PHILOSOPHY.md)** — North Star principles guiding all design decisions

## Overview

OpenCosmos Studio is the living documentation platform for the **Sage UI** (`@opencosmos/ui` + `@opencosmos/tokens`)—a high-performance component library built on **Radix UI** and **Tailwind CSS**. It provides interactive component playgrounds, token visualization, and LLM-optimized documentation.

## Features

- **Interactive Component Playground**: Explore `@opencosmos/ui` components with live prop controls.
- **Token Visualization**: See global design tokens (colors, typography) defined in `@opencosmos/tokens`.
- **Theme Switching**: Preview components in Studio, Sage, and Volt themes.
- **Copy-Paste Workflow**: Integration guides for consuming the library in other Next.js apps.
- **Accessibility-First**: All components built on accessible Radix primitives.

## Development

### Running Locally

```bash
# From ecosystem root
pnpm dev

# Or specifically for this app
cd apps/web
pnpm dev
```

The Studio runs on **port 3001** by default.

## Architecture

### The "Sage Stack" (Web Edition)

The Studio is a standard **Next.js 15** application that consumes:
1.  **`@opencosmos/ui`**: The React component library (exports `Button`, `Input`, etc.).
2.  **`@opencosmos/tokens`**: The design token definitions.
3.  **`@opencosmos/mcp`**: MCP server for AI-assisted component discovery.

### Design System Integration

The Studio imports components directly from the local workspace packages, ensuring that documentation always matches the code:

```typescript
import { Button, Input } from '@opencosmos/ui';
// Styles are automatically applied via Tailwind content scanning
```

**Key Benefit**: Changes to `packages/ui` are instantly reflected in the Studio via HMR (Hot Module Replacement).

## Structure

```
app/
├── components/
│   ├── studio/
│   │   ├── StudioHero.tsx              # Landing section
│   │   ├── SectionNav.tsx              # Navigation tabs
│   │   ├── OverviewSection.tsx         # Philosophy & features
│   │   ├── ArchitectureSection.tsx     # Functional organization guide
│   │   ├── TokensSection/              # Token visualization
│   │   │   ├── ColorsTab.tsx
│   │   │   └── TypographyTab.tsx
│   │   ├── ComponentsSection/          # Component playground
│   │   │   ├── ComponentPlayground.tsx
│   │   │   └── CodeSnippet.tsx
│   │   └── PatternsSection.tsx         # Complex composition patterns
│   └── JsonLdMetadata.tsx              # JSON-LD injection component
├── lib/
│   └── metadata-generator.ts           # LLM metadata utilities
├── globals.css
├── layout.tsx
└── page.tsx
```

## Adding New Components

To add a new component to the playground:

1. **Create the component** in `packages/ui/src/components/[category]/` following the functional organization system (actions, forms, navigation, overlays, feedback, data-display, layout)

2. **Register it** in the Studio's component registry (organization TBD based on current implementation)

3. **Include metadata** for the playground:

```typescript
{
  component: YourComponent,
  description: 'Description of what this component does',
  props: {
    propName: {
      type: 'select', // or 'boolean' | 'text' | 'array' | 'object' | 'interface' | 'custom'
      options: ['option1', 'option2'],
      default: 'option1',
      description: 'What this prop controls',
      required: false,
      typeDefinition: 'string', // TypeScript type
    },
  },
  examples: [
    { label: 'Default', props: { propName: 'option1' } },
  ],
  codeExamples: [
    {
      title: 'Basic Usage',
      code: '<YourComponent propName="option1" />',
      description: 'Simple example showing default usage',
    },
  ],
  sourceUrl: 'https://github.com/shalomormsby/opencosmos-ui/blob/main/packages/ui/src/components/[category]/YourComponent/YourComponent.tsx',
  accessibilityNotes: [
    'Uses semantic HTML elements',
    'Keyboard navigable with Tab/Enter',
    'Screen reader accessible with proper ARIA attributes',
  ],
}
```

4. **It will automatically appear** in the Components section with full documentation, JSON-LD metadata, and accessibility notes!

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: `@opencosmos/ui` + `@opencosmos/tokens`
- **State**: React hooks + design system's Zustand stores
- **Code Highlighting**: Custom syntax parser in CollapsibleCodeBlock component

## Roadmap

### Phase 1-7 (Documentation Overhaul) ✅ COMPLETE
- ✅ Enhanced registry type system for complex prop types
- ✅ Code examples integration with CollapsibleCodeBlock
- ✅ PageLayout component for composition patterns
- ✅ Breadcrumb generation utilities and global integration
- ✅ Complete documentation audit (all components)
- ✅ LLM optimization with JSON-LD structured data
- ✅ Accessibility notes for all components
- ✅ GitHub source links for all components
- ✅ Migration from atomic design to functional organization

See [PHASE-7-COMPLETION.md](./docs/archive/PHASE-7-COMPLETION.md) for full details.

### Phase 8 (Enhancement)
- Search/filter functionality
- Responsive preview modes
- Component usage analytics
- Version comparison tools

### Phase 9 (Expansion)
- Brand guidelines section
- Product design resources
- Template downloads
- Figma integration

### Phase 10 (Productization)
- Premium templates
- Design kits
- Community contributions
- Licensing options

## Related Documentation

### Information Architecture

This README fits into the ecosystem's documentation as follows:

```
Ecosystem Documentation Structure:
├── /README.md                              # Ecosystem overview, quick start, philosophy summary
├── /DESIGN-PHILOSOPHY.md                   # North Star principles (read first)
├── /AGENTS.md                              # Technical guide for AI agents and developers
├── /CHANGELOG.md                           # Ecosystem-wide version history
└── /apps/web/
    ├── README.md (this file)               # Studio app architecture & development
    ├── CHANGELOG.md                        # Studio-specific changes
    └── docs/
        ├── SAGE_DESIGN_SYSTEM_STRATEGY.md  # Complete design system guide
        └── archive/                        # Historical documentation
```

### Key Documentation Links

**Using the Design System:**
- **[SAGE_DESIGN_SYSTEM_STRATEGY.md](./docs/SAGE_DESIGN_SYSTEM_STRATEGY.md)** — Complete guide: architecture, components, tokens, usage patterns

**Understanding the Ecosystem:**
- **[Root README](../../README.md)** — Ecosystem overview, tech stack, quick start
- **[DESIGN-PHILOSOPHY.md](../../DESIGN-PHILOSOPHY.md)** — The "why" behind every decision
- **[AGENTS.md](../../AGENTS.md)** — Technical setup, conventions, file organization

**Studio Development:**
- **[CHANGELOG.md](./CHANGELOG.md)** — Studio version history
- **[PHASE-7-COMPLETION.md](./docs/archive/PHASE-7-COMPLETION.md)** — Documentation overhaul details

---

**Built with ❤️ as part of the ecosystem**
