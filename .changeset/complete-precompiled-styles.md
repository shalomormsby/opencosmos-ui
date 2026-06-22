---
"@opencosmos/ui": patch
---

Fix: the precompiled `styles.css` now includes the full `tailwindcss-animate`
utility family (`animate-in/out`, `fade-*`, `zoom-*`, `slide-from/to-*` and their
`data-[state=…]` variants) plus the custom `animate-fade-in` and `scrollbar-hide`
utilities. These are used by overlay components (Dialog, Popover, Select,
Dropdown, Tooltip, …) but were never emitted, so enter/exit animations and
scrollbar hiding silently no-op'd in apps that consume `@opencosmos/ui/styles.css`.
The styles build now imports `tw-animate-css` and defines the two custom utilities.
