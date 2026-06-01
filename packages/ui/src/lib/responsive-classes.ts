/**
 * GENERATED FILE — do not edit by hand.
 * Run `node scripts/gen-responsive-classes.mjs` to regenerate.
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
  gridCols: {
    base: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 7: 'grid-cols-7', 8: 'grid-cols-8', 9: 'grid-cols-9', 10: 'grid-cols-10', 11: 'grid-cols-11', 12: 'grid-cols-12' },
    sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6', 7: 'sm:grid-cols-7', 8: 'sm:grid-cols-8', 9: 'sm:grid-cols-9', 10: 'sm:grid-cols-10', 11: 'sm:grid-cols-11', 12: 'sm:grid-cols-12' },
    md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6', 7: 'md:grid-cols-7', 8: 'md:grid-cols-8', 9: 'md:grid-cols-9', 10: 'md:grid-cols-10', 11: 'md:grid-cols-11', 12: 'md:grid-cols-12' },
    lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 7: 'lg:grid-cols-7', 8: 'lg:grid-cols-8', 9: 'lg:grid-cols-9', 10: 'lg:grid-cols-10', 11: 'lg:grid-cols-11', 12: 'lg:grid-cols-12' },
    xl: { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6', 7: 'xl:grid-cols-7', 8: 'xl:grid-cols-8', 9: 'xl:grid-cols-9', 10: 'xl:grid-cols-10', 11: 'xl:grid-cols-11', 12: 'xl:grid-cols-12' },
  },
  gap: {
    base: { 0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 7: 'gap-7', 8: 'gap-8', 9: 'gap-9', 10: 'gap-10', 11: 'gap-11', 12: 'gap-12', 13: 'gap-13', 14: 'gap-14', 15: 'gap-15', 16: 'gap-16' },
    sm: { 0: 'sm:gap-0', 1: 'sm:gap-1', 2: 'sm:gap-2', 3: 'sm:gap-3', 4: 'sm:gap-4', 5: 'sm:gap-5', 6: 'sm:gap-6', 7: 'sm:gap-7', 8: 'sm:gap-8', 9: 'sm:gap-9', 10: 'sm:gap-10', 11: 'sm:gap-11', 12: 'sm:gap-12', 13: 'sm:gap-13', 14: 'sm:gap-14', 15: 'sm:gap-15', 16: 'sm:gap-16' },
    md: { 0: 'md:gap-0', 1: 'md:gap-1', 2: 'md:gap-2', 3: 'md:gap-3', 4: 'md:gap-4', 5: 'md:gap-5', 6: 'md:gap-6', 7: 'md:gap-7', 8: 'md:gap-8', 9: 'md:gap-9', 10: 'md:gap-10', 11: 'md:gap-11', 12: 'md:gap-12', 13: 'md:gap-13', 14: 'md:gap-14', 15: 'md:gap-15', 16: 'md:gap-16' },
    lg: { 0: 'lg:gap-0', 1: 'lg:gap-1', 2: 'lg:gap-2', 3: 'lg:gap-3', 4: 'lg:gap-4', 5: 'lg:gap-5', 6: 'lg:gap-6', 7: 'lg:gap-7', 8: 'lg:gap-8', 9: 'lg:gap-9', 10: 'lg:gap-10', 11: 'lg:gap-11', 12: 'lg:gap-12', 13: 'lg:gap-13', 14: 'lg:gap-14', 15: 'lg:gap-15', 16: 'lg:gap-16' },
    xl: { 0: 'xl:gap-0', 1: 'xl:gap-1', 2: 'xl:gap-2', 3: 'xl:gap-3', 4: 'xl:gap-4', 5: 'xl:gap-5', 6: 'xl:gap-6', 7: 'xl:gap-7', 8: 'xl:gap-8', 9: 'xl:gap-9', 10: 'xl:gap-10', 11: 'xl:gap-11', 12: 'xl:gap-12', 13: 'xl:gap-13', 14: 'xl:gap-14', 15: 'xl:gap-15', 16: 'xl:gap-16' },
  },
  colSpan: {
    base: { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8', 9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12' },
    sm: { 1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4', 5: 'sm:col-span-5', 6: 'sm:col-span-6', 7: 'sm:col-span-7', 8: 'sm:col-span-8', 9: 'sm:col-span-9', 10: 'sm:col-span-10', 11: 'sm:col-span-11', 12: 'sm:col-span-12' },
    md: { 1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4', 5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8', 9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12' },
    lg: { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4', 5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8', 9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12' },
    xl: { 1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4', 5: 'xl:col-span-5', 6: 'xl:col-span-6', 7: 'xl:col-span-7', 8: 'xl:col-span-8', 9: 'xl:col-span-9', 10: 'xl:col-span-10', 11: 'xl:col-span-11', 12: 'xl:col-span-12' },
  },
  rowSpan: {
    base: { 1: 'row-span-1', 2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4', 5: 'row-span-5', 6: 'row-span-6', 7: 'row-span-7', 8: 'row-span-8', 9: 'row-span-9', 10: 'row-span-10', 11: 'row-span-11', 12: 'row-span-12' },
    sm: { 1: 'sm:row-span-1', 2: 'sm:row-span-2', 3: 'sm:row-span-3', 4: 'sm:row-span-4', 5: 'sm:row-span-5', 6: 'sm:row-span-6', 7: 'sm:row-span-7', 8: 'sm:row-span-8', 9: 'sm:row-span-9', 10: 'sm:row-span-10', 11: 'sm:row-span-11', 12: 'sm:row-span-12' },
    md: { 1: 'md:row-span-1', 2: 'md:row-span-2', 3: 'md:row-span-3', 4: 'md:row-span-4', 5: 'md:row-span-5', 6: 'md:row-span-6', 7: 'md:row-span-7', 8: 'md:row-span-8', 9: 'md:row-span-9', 10: 'md:row-span-10', 11: 'md:row-span-11', 12: 'md:row-span-12' },
    lg: { 1: 'lg:row-span-1', 2: 'lg:row-span-2', 3: 'lg:row-span-3', 4: 'lg:row-span-4', 5: 'lg:row-span-5', 6: 'lg:row-span-6', 7: 'lg:row-span-7', 8: 'lg:row-span-8', 9: 'lg:row-span-9', 10: 'lg:row-span-10', 11: 'lg:row-span-11', 12: 'lg:row-span-12' },
    xl: { 1: 'xl:row-span-1', 2: 'xl:row-span-2', 3: 'xl:row-span-3', 4: 'xl:row-span-4', 5: 'xl:row-span-5', 6: 'xl:row-span-6', 7: 'xl:row-span-7', 8: 'xl:row-span-8', 9: 'xl:row-span-9', 10: 'xl:row-span-10', 11: 'xl:row-span-11', 12: 'xl:row-span-12' },
  },
  colStart: {
    base: { 1: 'col-start-1', 2: 'col-start-2', 3: 'col-start-3', 4: 'col-start-4', 5: 'col-start-5', 6: 'col-start-6', 7: 'col-start-7', 8: 'col-start-8', 9: 'col-start-9', 10: 'col-start-10', 11: 'col-start-11', 12: 'col-start-12', 13: 'col-start-13' },
    sm: { 1: 'sm:col-start-1', 2: 'sm:col-start-2', 3: 'sm:col-start-3', 4: 'sm:col-start-4', 5: 'sm:col-start-5', 6: 'sm:col-start-6', 7: 'sm:col-start-7', 8: 'sm:col-start-8', 9: 'sm:col-start-9', 10: 'sm:col-start-10', 11: 'sm:col-start-11', 12: 'sm:col-start-12', 13: 'sm:col-start-13' },
    md: { 1: 'md:col-start-1', 2: 'md:col-start-2', 3: 'md:col-start-3', 4: 'md:col-start-4', 5: 'md:col-start-5', 6: 'md:col-start-6', 7: 'md:col-start-7', 8: 'md:col-start-8', 9: 'md:col-start-9', 10: 'md:col-start-10', 11: 'md:col-start-11', 12: 'md:col-start-12', 13: 'md:col-start-13' },
    lg: { 1: 'lg:col-start-1', 2: 'lg:col-start-2', 3: 'lg:col-start-3', 4: 'lg:col-start-4', 5: 'lg:col-start-5', 6: 'lg:col-start-6', 7: 'lg:col-start-7', 8: 'lg:col-start-8', 9: 'lg:col-start-9', 10: 'lg:col-start-10', 11: 'lg:col-start-11', 12: 'lg:col-start-12', 13: 'lg:col-start-13' },
    xl: { 1: 'xl:col-start-1', 2: 'xl:col-start-2', 3: 'xl:col-start-3', 4: 'xl:col-start-4', 5: 'xl:col-start-5', 6: 'xl:col-start-6', 7: 'xl:col-start-7', 8: 'xl:col-start-8', 9: 'xl:col-start-9', 10: 'xl:col-start-10', 11: 'xl:col-start-11', 12: 'xl:col-start-12', 13: 'xl:col-start-13' },
  },
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

/** `grid-cols-N` (+ responsive). Returns '' for out-of-range values. */
export const gridColsClasses = (v: ResponsiveValue<number>) => resolve(MAPS.gridCols, v);
/** `gap-N` (+ responsive). */
export const gapClasses = (v: ResponsiveValue<number>) => resolve(MAPS.gap, v);
/** `col-span-N` (+ responsive). */
export const colSpanClasses = (v: ResponsiveValue<number>) => resolve(MAPS.colSpan, v);
/** `row-span-N` (+ responsive). */
export const rowSpanClasses = (v: ResponsiveValue<number>) => resolve(MAPS.rowSpan, v);
/** `col-start-N` (+ responsive). */
export const colStartClasses = (v: ResponsiveValue<number>) => resolve(MAPS.colStart, v);
