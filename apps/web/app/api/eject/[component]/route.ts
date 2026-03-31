import { NextResponse } from 'next/server';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const UI_SRC = join(process.cwd(), '..', '..', 'packages', 'ui', 'src');

function transformImports(source: string): string {
  return source
    .replace(/from\s+['"]\.\.\/\.\.\/lib\/utils['"]/g, `from './utils'`)
    .replace(/from\s+['"]\.\.\/\.\.\/lib\/[^'"]+['"]/g, `from '@opencosmos/ui/utils'`)
    .replace(/from\s+['"]\.\.\/\.\.\/hooks\/[^'"]+['"]/g, `from '@opencosmos/ui/hooks'`)
    .replace(/from\s+['"]\.\.\/[^.][^'"]*['"]/g, `from '@opencosmos/ui'`);
}

function findComponent(name: string): { filePath: string; category: string } | null {
  const componentsDir = join(UI_SRC, 'components');
  if (!existsSync(componentsDir)) return null;

  const lowerName = name.toLowerCase();

  for (const category of readdirSync(componentsDir)) {
    const categoryPath = join(componentsDir, category);
    if (!statSync(categoryPath).isDirectory()) continue;

    for (const file of readdirSync(categoryPath)) {
      if (file.toLowerCase() === `${lowerName}.tsx` || file.toLowerCase() === `${lowerName}.ts`) {
        return { filePath: join(categoryPath, file), category };
      }
    }
  }

  return null;
}

const SAFE_COMPONENT_NAME = /^[a-zA-Z0-9-]+$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ component: string }> }
) {
  const { component: componentName } = await params;

  if (!SAFE_COMPONENT_NAME.test(componentName)) {
    return NextResponse.json({ error: 'Invalid component name' }, { status: 400 });
  }

  const found = findComponent(componentName);
  if (!found) {
    return NextResponse.json({ error: `Component "${componentName}" not found` }, { status: 404 });
  }

  const rawSource = readFileSync(found.filePath, 'utf-8');
  const transformed = transformImports(rawSource);

  // Extract external dependencies
  const deps: string[] = [];
  const importRegex = /from\s+['"](@[^/'"]+\/[^'"]+|[^.@/'"][^'"]*)['"]/g;
  let match;
  while ((match = importRegex.exec(rawSource)) !== null) {
    const pkg = match[1];
    if (pkg.startsWith('@opencosmos/') || pkg === 'react') continue;
    const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
    if (!deps.includes(pkgName)) deps.push(pkgName);
  }

  const usesCn = rawSource.includes("from '../../lib/utils'") || rawSource.includes('from "../../lib/utils"');
  const fileName = found.filePath.split('/').pop()!;

  return NextResponse.json({
    name: componentName,
    fileName,
    category: found.category,
    source: transformed,
    dependencies: deps.sort(),
    needsCnUtility: usesCn,
  });
}
