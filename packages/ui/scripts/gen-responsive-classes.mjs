/**
 * Generates src/lib/responsive-classes.ts — exhaustive STATIC maps of Tailwind
 * layout utility classes (including responsive variants) used by layout
 * components (Grid, GridItem, Stack).
 *
 * WHY THIS EXISTS
 * Tailwind's compiler only emits CSS for class names it can see as complete
 * static string literals in scanned source. Components must therefore NEVER
 * build class names by interpolation (e.g. `gap-${n}` or `md:${cls}`), because
 * those strings never appear literally and the utilities silently never get
 * generated. This file enumerates every class as a literal so both Tailwind's
 * scanner (consumer-side) and the library's own compiled stylesheet pick them up.
 *
 * Regenerate with:  node scripts/gen-responsive-classes.mjs
 * Do not hand-edit the generated file.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../src/lib/responsive-classes.ts');

// Breakpoints supported by the ResponsiveValue type (matches Tailwind defaults
// minus 2xl, which the layout components do not expose).
const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl'];

// Utility → numeric range it supports. Ranges are intentionally generous so a
// consumer passing any reasonable value gets a real class.
const UTILITIES = {
  gridCols: { prefix: 'grid-cols', from: 1, to: 12 },
  gap: { prefix: 'gap', from: 0, to: 16 },
  colSpan: { prefix: 'col-span', from: 1, to: 12 },
  rowSpan: { prefix: 'row-span', from: 1, to: 12 },
  colStart: { prefix: 'col-start', from: 1, to: 13 },
};

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

function buildMap({ prefix, from, to }) {
  const lines = [];
  for (const bp of BREAKPOINTS) {
    const entries = range(from, to)
      .map((n) => {
        const cls = bp === 'base' ? `${prefix}-${n}` : `${bp}:${prefix}-${n}`;
        return `${n}: '${cls}'`;
      })
      .join(', ');
    lines.push(`    ${bp}: { ${entries} },`);
  }
  return `{\n${lines.join('\n')}\n  }`;
}

const mapBlocks = Object.entries(UTILITIES)
  .map(([name, cfg]) => `  ${name}: ${buildMap(cfg)},`)
  .join('\n');

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Run \`node scripts/gen-responsive-classes.mjs\` to regenerate.
 *
 * Exhaustive static maps of layout utility classes (incl. responsive variants).
 * Components index into these maps so every class name appears as a complete
 * string literal — the only form Tailwind's scanner can detect. See the
 * generator script header for the full rationale.
 */

export type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

type BreakpointMap = Record<number, string>;
type ResponsiveMap = { base: BreakpointMap; sm: BreakpointMap; md: BreakpointMap; lg: BreakpointMap; xl: BreakpointMap };

const MAPS: Record<string, ResponsiveMap> = {
${mapBlocks}
};

const ORDER = ['base', 'sm', 'md', 'lg', 'xl'] as const;

function resolve(map: ResponsiveMap, value: ResponsiveValue<number>): string {
  if (typeof value === 'number') {
    return map.base[value] ?? '';
  }
  const out: string[] = [];
  for (const bp of ORDER) {
    const v = value[bp];
    if (v != null) {
      const cls = map[bp][v];
      if (cls) out.push(cls);
    }
  }
  return out.join(' ');
}

/** \`grid-cols-N\` (+ responsive). Returns '' for out-of-range values. */
export const gridColsClasses = (v: ResponsiveValue<number>) => resolve(MAPS.gridCols, v);
/** \`gap-N\` (+ responsive). */
export const gapClasses = (v: ResponsiveValue<number>) => resolve(MAPS.gap, v);
/** \`col-span-N\` (+ responsive). */
export const colSpanClasses = (v: ResponsiveValue<number>) => resolve(MAPS.colSpan, v);
/** \`row-span-N\` (+ responsive). */
export const rowSpanClasses = (v: ResponsiveValue<number>) => resolve(MAPS.rowSpan, v);
/** \`col-start-N\` (+ responsive). */
export const colStartClasses = (v: ResponsiveValue<number>) => resolve(MAPS.colStart, v);
`;

writeFileSync(OUT, out);
console.log(`Wrote ${OUT}`);
