---
"@opencosmos/ui": patch
---

Fix ghost Buttons turning invisible on hover.

The `ghost` variant was `hover:text-accent-foreground` with no hover surface beneath it. `accent-foreground` is the colour meant to sit on an accent background, so in any theme where it approaches the page background — Volt Dark has both at `#000000` — hovering a ghost button rendered its label in the background colour and the control disappeared under the cursor.

`ghost` now hovers to a primary outline and primary text, mirroring `outline` one step quieter: `outline` is bordered at rest and fills primary on hover; `ghost` is bare at rest and outlines primary on hover. A transparent border is carried at rest so gaining one on hover never changes the box, and with border-box sizing the fixed variant heights are unaffected.
