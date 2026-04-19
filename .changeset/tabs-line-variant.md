---
"@opencosmos/ui": minor
"@opencosmos/mcp": patch
---

Add Line variant to Tabs with an animated, spring-driven underline that glides between the active tab. The variant is opt-in via `<TabsList variant="line">` and flows to the width of its container (drop it into a sidebar, card, or main column without resizing).

Internal: tidy `packages/ui/tsconfig.json` to `noEmit: true` and drop dead `outDir`/`declaration`/`sourceMap` options — `tsup` handles all emission, so tsc is typecheck-only.
