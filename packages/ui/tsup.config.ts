import { defineConfig } from 'tsup';

export default defineConfig([
  // Library build (components, hooks, utils, etc.)
  {
    entry: [
      'src/index.ts',
      'src/tokens.ts',
      'src/hooks.ts',
      'src/utils.ts',
      'src/providers.ts',
      'src/webgl.ts',
      'src/forms.ts',
      'src/dates.ts',
      'src/tables.ts',
      'src/dnd.ts',
    ],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    banner: {
      js: '"use client";',
    },
  },
  // CLI build (Node.js executable)
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    platform: 'node',
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: false,
  },
]);
