---
"@opencosmos/ui": patch
---

Fix a broken CSS import, missing dependency, and misleading peer-dep metadata; correct several inaccurate docs.

**Fix:** `src/globals.css` had a mid-file `@import`, which is invalid CSS (`@import` must precede all rules) and failed Turbopack/PostCSS parsing. Moved it to the top of the file.

**Fix:** `@opencosmos/tokens` is imported at runtime by the root barrel (`ThemeProvider`, `tokens.ts`, `typographySystem`) but was missing from `dependencies` — added as `workspace:*`.

**Fix:** `peerDependenciesMeta` marked `react-hook-form`, `date-fns`, `react-day-picker`, `@tanstack/react-table`, and `@dnd-kit/*` as optional, but the root barrel unconditionally re-exports `Form`, `DatePicker`, `Calendar`, `DataTable`, and `DragDropList`/`DragDropTable`, which import them. They're required for any `@opencosmos/ui` import, not optional — removed the `optional: true` flag for those five.

**Docs:** fixed a wrong `TooltipProvider` import path (it's exported from the package root, not `/providers`), a nonexistent `theme` prop on `ThemeProvider` (should be `defaultTheme`), a documented `defaultMode="system"` that isn't a valid `ColorMode`, wrong `DragDrop`/`SortableList` import names (real exports are `DragDropList`/`DragDropTable`), a `useForm` example using a nonexistent `validate` callback instead of the real `validations` API, and a fake `useClipboard` hook demo that doesn't correspond to any real export.
