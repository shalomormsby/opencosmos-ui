import { NextResponse } from 'next/server';
import {
  COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES,
} from '@opencosmos/mcp/registry';

const PRODUCT_NAME = 'OpenCosmos UI';

export async function GET() {
  const components = Object.values(COMPONENT_REGISTRY).map((comp) => ({
    name: comp.name,
    category: comp.category,
    description: comp.description,
    keywords: comp.keywords,
    useCases: comp.useCases,
    dependencies: comp.dependencies,
    radixPrimitive: comp.radixPrimitive ?? null,
    props: comp.props ?? null,
    subComponents: comp.subComponents ?? null,
    example: comp.example ?? null,
  }));

  const categories = Object.entries(COMPONENT_CATEGORIES).map(
    ([id, cat]) => ({
      id,
      label: cat.label,
      description: cat.description,
      count: cat.count,
    })
  );

  const payload = {
    name: PRODUCT_NAME,
    version: '1.1.0',
    totalComponents: components.length,
    package: '@opencosmos/ui',
    install: 'pnpm add @opencosmos/ui',
    docs: 'https://opencosmos.ai/studio/docs',
    llmsFullTxt: 'https://opencosmos.ai/studio/llms-full.txt',
    mcp: '@opencosmos/mcp',
    themes: ['studio', 'terra', 'volt'],
    categories,
    components,
  };

  return NextResponse.json(payload, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
