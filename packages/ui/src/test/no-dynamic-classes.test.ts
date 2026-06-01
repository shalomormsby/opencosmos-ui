import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * GUARDRAIL: Tailwind classes must never be built by string interpolation.
 *
 * Tailwind's compiler only emits CSS for class names it can see as complete
 * static string literals in source. A class like `gap-${n}` or `md:grid-cols-${n}`
 * appears literally NOWHERE, so the utility is silently never generated and the
 * component renders unstyled in consuming apps (the exact bug this guards against).
 *
 * Build responsive/dynamic layout classes by indexing into the static maps in
 * src/lib/responsive-classes.ts instead. See that file's header for the pattern.
 */

const SRC = resolve(__dirname, '..');

// Tailwind utility prefixes that take a value and were (or could be) interpolated.
// Deliberately limited to multi-character, unambiguous utilities so the guardrail
// does not false-positive on non-class interpolations like a React `key={`h-${i}`}`.
const PREFIXES = [
  'grid-cols', 'grid-rows', 'col-span', 'col-start', 'col-end',
  'row-span', 'row-start', 'row-end', 'gap-x', 'gap-y', 'gap',
  'space-x', 'space-y', 'divide-x', 'divide-y',
  'px', 'py', 'pt', 'pb', 'pl', 'pr', 'mx', 'my', 'mt', 'mb', 'ml', 'mr',
  'inset-x', 'inset-y', 'translate-x', 'translate-y',
  'leading', 'tracking', 'basis', 'order',
];

// Matches `<prefix>-${`  — a Tailwind utility whose value is interpolated.
const DYNAMIC_CLASS = new RegExp(`\\b(?:${PREFIXES.join('|')})-\\$\\{`);

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectSourceFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('no dynamic Tailwind class construction in src', () => {
  it('contains no `<utility>-${...}` interpolated class names', () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(SRC)) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (DYNAMIC_CLASS.test(line)) {
          offenders.push(`${file.replace(SRC, 'src')}:${i + 1}  ${line.trim()}`);
        }
      });
    }
    expect(
      offenders,
      `Dynamically-built Tailwind classes found. Use static maps in ` +
        `src/lib/responsive-classes.ts instead:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
