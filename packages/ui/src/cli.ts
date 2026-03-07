import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Resolve package root (works from dist/cli.js → package root)
// ---------------------------------------------------------------------------
const __filename_ = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const PKG_ROOT = resolve(dirname(__filename_), '..');

// ---------------------------------------------------------------------------
// Import transform
// ---------------------------------------------------------------------------
export function transformImports(source: string): string {
  return source
    // ../../lib/utils → ./utils  (cn utility — we scaffold it alongside)
    .replace(/from\s+['"]\.\.\/\.\.\/lib\/utils['"]/g, `from './utils'`)
    // ../../lib/* → @thesage/ui/utils
    .replace(/from\s+['"]\.\.\/\.\.\/lib\/[^'"]+['"]/g, `from '@thesage/ui/utils'`)
    // ../../hooks/* → @thesage/ui/hooks
    .replace(/from\s+['"]\.\.\/\.\.\/hooks\/[^'"]+['"]/g, `from '@thesage/ui/hooks'`)
    // ../category/Component → @thesage/ui  (cross-component imports)
    .replace(/from\s+['"]\.\.\/[^.][^'"]*['"]/g, `from '@thesage/ui'`);
}

// ---------------------------------------------------------------------------
// cn() utility source (scaffolded alongside ejected components)
// ---------------------------------------------------------------------------
const CN_UTILS_SOURCE = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

// ---------------------------------------------------------------------------
// Scan src/components to find a component file by name (case-insensitive)
// ---------------------------------------------------------------------------
function findComponent(name: string): { filePath: string; category: string } | null {
  const srcDir = join(PKG_ROOT, 'src', 'components');
  if (!existsSync(srcDir)) {
    return null;
  }

  const lowerName = name.toLowerCase();

  for (const category of readdirSync(srcDir)) {
    const categoryPath = join(srcDir, category);
    if (!statSync(categoryPath).isDirectory()) continue;

    for (const file of readdirSync(categoryPath)) {
      if (file.toLowerCase() === `${lowerName}.tsx` || file.toLowerCase() === `${lowerName}.ts`) {
        return { filePath: join(categoryPath, file), category };
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// List all available components grouped by category
// ---------------------------------------------------------------------------
function listComponents(): void {
  const srcDir = join(PKG_ROOT, 'src', 'components');
  if (!existsSync(srcDir)) {
    console.error('Error: Could not find component source directory.');
    process.exit(1);
  }

  console.log('\n  @thesage/ui — Available Components\n');

  for (const category of readdirSync(srcDir).sort()) {
    const categoryPath = join(srcDir, category);
    if (!statSync(categoryPath).isDirectory()) continue;

    const components = readdirSync(categoryPath)
      .filter((f) => f.endsWith('.tsx') && !f.startsWith('index') && !f.includes('.test.'))
      .map((f) => f.replace(/\.tsx$/, ''));

    if (components.length === 0) continue;

    console.log(`  ${category}/`);
    for (const comp of components.sort()) {
      console.log(`    ${comp}`);
    }
    console.log();
  }
}

// ---------------------------------------------------------------------------
// Eject a component
// ---------------------------------------------------------------------------
function ejectComponent(name: string, targetDir: string): void {
  const found = findComponent(name);

  if (!found) {
    console.error(`\n  Error: Component "${name}" not found.\n`);
    console.error('  Run `npx @thesage/ui eject --list` to see available components.\n');
    process.exit(1);
  }

  const source = readFileSync(found.filePath, 'utf-8');
  const transformed = transformImports(source);

  // Ensure target directory exists
  const resolvedDir = resolve(process.cwd(), targetDir);
  mkdirSync(resolvedDir, { recursive: true });

  // Write transformed component
  const fileName = found.filePath.split('/').pop()!;
  const destPath = join(resolvedDir, fileName);
  writeFileSync(destPath, transformed, 'utf-8');

  // Scaffold utils.ts if not present
  const utilsPath = join(resolvedDir, 'utils.ts');
  if (!existsSync(utilsPath)) {
    writeFileSync(utilsPath, CN_UTILS_SOURCE, 'utf-8');
  }

  // Extract external dependencies from the source for user guidance
  const deps = new Set<string>();
  const importRegex = /from\s+['"](@[^/'"]+\/[^'"]+|[^.@/'"][^'"]*)['"]/g;
  let match;
  while ((match = importRegex.exec(source)) !== null) {
    const pkg = match[1];
    // Skip internal @thesage imports and react (always present)
    if (pkg.startsWith('@thesage/') || pkg === 'react') continue;
    // Normalize scoped packages to package name
    const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
    deps.add(pkgName);
  }

  console.log(`\n  Ejected ${name} successfully!\n`);
  console.log(`  ${destPath}`);
  if (!existsSync(join(resolvedDir, 'utils.ts'))) {
    // utils was just created
  }
  console.log(`  ${utilsPath} (cn utility)\n`);

  if (deps.size > 0) {
    console.log('  Required dependencies:');
    console.log(`  pnpm add ${[...deps].sort().join(' ')}\n`);
  }

  console.log('  Update your imports:');
  console.log(`  import { ${name} } from './${targetDir}/${name}'\n`);
  console.log('  The ejected component still works with @thesage/ui themes and CSS variables.');
  console.log('  You now own it — modify freely.\n');
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
  @thesage/ui eject — Copy component source into your project

  Usage:
    npx @thesage/ui eject <ComponentName>  [--dir <path>]
    npx @thesage/ui eject --list

  Options:
    --dir <path>   Target directory (default: src/components/ui)
    --list         List all available components
    --help         Show this help message

  Examples:
    npx @thesage/ui eject Button
    npx @thesage/ui eject Dialog --dir components/sage
`);
    return;
  }

  if (args.includes('--list')) {
    listComponents();
    return;
  }

  // Parse: eject <name> [--dir <path>]
  const command = args[0];
  if (command !== 'eject') {
    console.error(`\n  Unknown command: ${command}\n  Run with --help for usage.\n`);
    process.exit(1);
  }

  const componentName = args[1];
  if (!componentName || componentName.startsWith('--')) {
    console.error('\n  Error: Component name is required.\n  Usage: npx @thesage/ui eject <ComponentName>\n');
    process.exit(1);
  }

  let targetDir = 'src/components/ui';
  const dirIdx = args.indexOf('--dir');
  if (dirIdx !== -1 && args[dirIdx + 1]) {
    targetDir = args[dirIdx + 1];
  }

  ejectComponent(componentName, targetDir);
}

main();
