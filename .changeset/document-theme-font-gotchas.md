---
"@opencosmos/ui": patch
---

Document two silent theming gotchas found while integrating the library into a consumer app.

**Docs:** the setup instructions (root README, `packages/ui/README.md`, and the `create` skill) never mentioned that `--font-heading`/`--font-body`/`--font-mono` are CSS variables `ThemeProvider` sets but nothing in the package ever applies — no component sets `font-family` from them, and neither `theme.css` nor `globals.css` set a base font-family. Without wiring `font-family: var(--font-body)` onto `body` and `var(--font-heading)` onto headings yourself (plus loading each theme's Google Fonts), every theme renders its correct colors but the exact same typeface, with no error.

**Docs:** added an explicit warning against hardcoding a literal `dark`/`light` class on a layout wrapper. `globals.css` defines dark-mode tokens under a bare `.dark { ... }` selector, not `:root.dark`, so any element carrying that class re-pins tokens for its whole subtree regardless of what `ThemeProvider`/`CustomizerPanel` set on `<html>`. Copying a "force this hero dark" pattern (intentional on this repo's own marketing page) onto a consumer's top-level wrapper makes the Customizer look broken — its own UI updates, the page underneath doesn't — with nothing in the console to point at why.
