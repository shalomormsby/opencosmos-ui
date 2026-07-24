---
"@opencosmos/ui": minor
---

Add `TerminalWindow`, a mac-style terminal block that reveals lines one at a time with a working copy-to-clipboard button. Respects `useMotionPreference` — renders all lines instantly with no reveal/loop when animation is disabled. Exported from the root barrel; demoed in Studio under Blocks → Terminal Window.

Also used it to build a real "get started" picker on studio.opencosmos.ai's homepage (Claude Code / Cursor / VS Code / Claude Desktop, each showing the real `npm install` + MCP setup commands), replacing the previous single generic CTA button and fixing a dead `npx create-sage-app@latest` command that appeared lower on the page (leftover from before the Sage → OpenCosmos rename — no such package exists).
