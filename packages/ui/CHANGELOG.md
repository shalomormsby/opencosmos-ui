# @thesage/ui

## 1.4.2 - 2026-04-12

### Patch Changes

- 12c5462: Fix KnowledgeGraph nodes not rendering (blank canvas with labels only).

  Root cause: GlowNodeProgram vertex shader used `u_correctionRatio` (~1/viewportWidth ≈ 0.001) as a `gl_PointSize` multiplier, producing near-zero point sizes. Sigma's canvas2d label layer is independent of WebGL so labels appeared normally, making the bug non-obvious.

  Fix: switch to `u_sizeRatio` + `u_pixelRatio` (matching sigma's built-in NodePointProgram), with formula `(a_size + 2.0) / u_sizeRatio * u_pixelRatio * 2.0`.

  Also scopes `tsconfig.test.json` to only test files (previously including all of `src/**/*` caused VS Code to show false positives on the main tsconfig).

## 1.4.1 - 2026-04-12

### Patch Changes

- 7ce4e98: Fix KnowledgeGraph crash when sigma container has zero height on initial mount. Adds `allowInvalidContainer: true` to sigma settings so the graph initialises gracefully and renders once the container has dimensions, instead of throwing a hard error.

## 1.4.0 - 2026-04-12

### Minor Changes

- 499e2f5: Add `@opencosmos/ui/knowledge-graph` subpath export — sigma.js v3 WebGL constellation renderer for the OpenCosmos knowledge graph.

  New exports via `@opencosmos/ui/knowledge-graph`:

  - `KnowledgeGraph` — React component with sigma.js v3 WebGL renderer (custom `GlowNodeProgram` with additive blending and per-node breathing animation), three-layer canvas fallback for Safari/iOS, `SearchOverlay` (⌘K), focus/ego-network mode, and `AccessibilityLayer`
  - `DOMAIN_COLORS` — domain → hex color mapping
  - `CONFIDENCE_OPACITY` — confidence level → opacity mapping
  - Types: `KnowledgeGraphData`, `KnowledgeNode`, `KnowledgeLink`, `KnowledgePreviewData`, `KnowledgeGraphProps`

  `sigma`, `graphology`, `@react-sigma/core`, and `graphology-layout-forceatlas2` added as optional peer dependencies.

## 1.3.1 - 2026-02-22

### Patch Changes

- f92e7a7: chore: consolidate monorepo architecture and enable npm trusted publishing

## 1.3.0 - 2026-02-18

### Minor Changes

- 077f48c: Migrate to Tailwind CSS v4.0.0. Fix documentation 404 for Design Tokens Foundations page.

  ### Features

  - **Tailwind v4 Upgrade**: fully migrated to Tailwind CSS v4.0.0 with @tailwindcss/postcss.
  - **Visual Verification**: Verified runtime theme switching (Studio, Terra, Volt) and light/dark modes.
  - **Clean Up**: Removed deprecated tailwind.config.ts/js files in favor of CSS-native @theme configuration.
  - **Utility Updates**: Renamed utilities (shadow-sm -> shadow-xs, rounded-sm -> rounded-xs) to match v4 defaults.

  ### Bug Fixes

  - **Documentation**: Fixed 404 error on "Design Tokens > Foundations" page in Sage Studio.

## 1.2.0 - 2026-02-17

### Minor Changes

- cca136a: Migrate to Tailwind CSS v4.0.0. Fix documentation 404 for Design Tokens Foundations page.

  ### Features

  - **Tailwind v4 Upgrade**: fully migrated to Tailwind CSS v4.0.0 with @tailwindcss/postcss.
  - **Visual Verification**: Verified runtime theme switching (Studio, Terra, Volt) and light/dark modes.
  - **Clean Up**: Removed deprecated tailwind.config.ts/js files in favor of CSS-native @theme configuration.
  - **Utility Updates**: Renamed utilities (shadow-sm -> shadow-xs, rounded-sm -> rounded-xs) to match v4 defaults.

  ### Bug Fixes

  - **Documentation**: Fixed 404 error on "Design Tokens > Foundations" page in Sage Studio.

## 1.1.1 - 2026-02-16

### Patch Changes

- 6b73813: Updated package descriptions and metadata to reflect the library now contains 99 components.

## 1.1.0 - 2026-02-16

### Minor Changes

- fa247e6: Phase 16 New Components & Major Refactor:
  - @thesage/ui: Added 7 new components: `StatCard`, `EmptyState`, `Timeline`, `Stepper`, `FileUpload`, `TreeView`, `NotificationCenter`.
  - @thesage/ui: Exported CVA variants for `card`, `sheet`, `label`, and `alert` to enable standalone usage.
  - @thesage/ui: Added `react-dropzone` dependency.
  - @thesage/mcp: Updated component registry to include all 96 components.

## 1.0.3 - 2026-02-16

### Patch Changes

- 13fdfec: @thesage/mcp: Props, subComponents, and example fields added to all 92 components in the registry.
  @thesage/ui: Added .claude/CLAUDE.md to published package files for AI tool discovery.
- 13fdfec: Update configuring and ensure CI/CD pipeline consistency.

## 1.0.2 - 2026-02-15

### Patch Changes

- 351cd8e: @thesage/mcp: Props, subComponents, and example fields added to all 92 components in the registry.
  @thesage/ui: Added .claude/CLAUDE.md to published package files for AI tool discovery.

## 1.0.1 - 2026-02-15

### Patch Changes

- 87975ab: @thesage/mcp: Props, subComponents, and example fields added to all 92 components in the registry.
  @thesage/ui: Added .claude/CLAUDE.md to published package files for AI tool discovery.

## 0.1.0 - 2026-02-06

### Minor Changes

- 39a3bcd: # Sage Design Engine v1.0.0-rc.1: Enterprise Readiness

  ## 🚀 React 19 Migration

  - **Unified Architecture:** All 11 packages and applications now run on React 19.2.1.
  - **Modern Patterns:** 146 instances of `forwardRef` migrated to React 19's `ref` as a prop.
  - **Dependencies:** All 26 Radix UI primitives updated to latest versions.

  ## ⚡️ Performance & Optimization

  - **WebGL Vendoring:** Replaced 80KB `ogl` dependency with a 1.1KB custom WebGL implementation (93% reduction).
  - **Subpath Exports:** Created granular entry points for `@thesage/ui/forms`, `/dates`, `/tables`, `/dnd`, and `/webgl`.
  - **Bundle Size:** Core bundle optimized to 146KB (brotli) with strict CI enforcement.

  ## 🛡️ Enterprise Grade

  - **Test Suite:** Added Vitest + Testing Library with 63 tests across critical components.
  - **Security:** 0 vulnerabilities in `@thesage/ui`.
  - **Accessibility:** Critical fixes applied to Breadcrumbs, Customizer, and Code blocks.

  ## 💅 Brand & Documentation

  - **Rebrand:** "Sage UI" is now **Sage Design Engine**.
  - **Theme:** Default theme renamed to **Terra**.
  - **Documentation:** Complete audit of `thesage.dev` with new CLI guides, troubleshooting, and integration docs.

### Patch Changes

- 90cfd09: Update branding references:
  - Rename "Sage" theme to "Terra" in component registry
  - Update MCP documentation to use "Sage Design Engine" product name

## 0.0.14 - 2026-01-31

### Patch Changes

- 9595ced: Fixing dark mode text color issue in nested components by ensuring `--color-text-primary` is explicitly defined in `globals.css`.

## 0.0.13 - 2026-01-30

### Patch Changes

- c41914a: Update branding references:
  - Rename "Sage" theme to "Terra" in component registry
  - Update MCP documentation to use "Sage Design Engine" product name

## 0.0.12 - 2026-01-28

### Patch Changes

- 90e78f4: docs: Enhanced README details and aesthetics.
- 90e78f4: fix: add primary variant alias to Button
  feat: export globals.css for easier theme setup
  docs: update README with correct installation and usage examples

## 0.0.11 - 2026-01-28

### Patch Changes

- 802b59e: docs: Added README.md to @thesage/ui for better npm presentation.

## 0.0.10 - 2026-01-28

### Patch Changes

- 76a383b: Syncing npm registry with latest changes from GitHub (auto-generated catch-up).
