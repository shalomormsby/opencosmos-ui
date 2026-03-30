import type { Metadata } from 'next';
import { DocsShell } from './DocsShell';

const PRODUCT_NAME = 'OpenCosmos UI';

export const metadata: Metadata = {
  title: {
    template: `%s — ${PRODUCT_NAME}`,
    default: `Documentation — ${PRODUCT_NAME}`,
  },
  description:
    '100 accessible React components built on Radix UI + Tailwind CSS. Three themes, design tokens, motion control, TypeScript strict mode.',
  alternates: {
    canonical: 'https://opencosmos.ai/studio/docs',
  },
  openGraph: {
    title: `Documentation — ${PRODUCT_NAME}`,
    description:
      '100 accessible React components built on Radix UI + Tailwind CSS. Three themes, design tokens, motion control.',
    url: 'https://opencosmos.ai/studio/docs',
    type: 'website',
  },
  other: {
    'sage:type': 'documentation',
    'sage:components': '100',
    'sage:categories':
      'actions,forms,navigation,overlays,feedback,data-display,layout,backgrounds,cursor,motion,blocks',
    'sage:themes': 'studio,terra,volt',
    'sage:llms-full': 'https://opencosmos.ai/studio/llms-full.txt',
  },
};

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `Documentation — ${PRODUCT_NAME}`,
  description:
    '100 accessible React components built on Radix UI + Tailwind CSS. Three themes, design tokens, motion control.',
  url: 'https://opencosmos.ai/studio/docs',
  mainEntity: {
    '@type': 'SoftwareSourceCode',
    name: PRODUCT_NAME,
    codeRepository: 'https://github.com/shalomormsby/opencosmos-ui',
    programmingLanguage: ['TypeScript', 'React'],
    runtimePlatform: 'Node.js',
  },
  numberOfItems: 100,
  about: [
    { '@type': 'Thing', name: 'Actions', description: 'Interactive elements that trigger behaviors' },
    { '@type': 'Thing', name: 'Forms', description: 'Input controls for data collection' },
    { '@type': 'Thing', name: 'Navigation', description: 'Moving through content and hierarchy' },
    { '@type': 'Thing', name: 'Overlays', description: 'Contextual content above main UI' },
    { '@type': 'Thing', name: 'Feedback', description: 'Communicating system state' },
    { '@type': 'Thing', name: 'Data Display', description: 'Presenting information in structured formats' },
    { '@type': 'Thing', name: 'Layout', description: 'Spatial organization and structural elements' },
  ],
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <DocsShell>{children}</DocsShell>
    </>
  );
}
