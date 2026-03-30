import type { Metadata } from 'next';
import { ThemeProvider, ToastProvider, CustomizerPanel, TooltipProvider } from '@opencosmos/ui';
import { allFontVariables } from '../lib/fonts';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// Note: BRAND from @opencosmos/ui cannot be used in server metadata because tsup adds
// "use client" banner to all output files, making it resolve to undefined at SSR time.
const PRODUCT_NAME = 'OpenCosmos UI';
const PRODUCT_DESCRIPTION = '100 accessible React components, three themes, user-controlled motion. Built on Radix UI + Tailwind CSS with TypeScript strict mode.';

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: PRODUCT_DESCRIPTION,
  metadataBase: new URL('https://opencosmos.ai/studio'),
  keywords: [
    'design system', 'react components', 'radix ui', 'tailwind css', 'typescript',
    'accessible components', 'theme system', 'motion system', 'ui library',
    'sage design engine', 'next.js', 'shadcn alternative',
  ],
  alternates: {
    canonical: 'https://opencosmos.ai/studio',
  },
  openGraph: {
    title: PRODUCT_NAME,
    description: PRODUCT_DESCRIPTION,
    url: 'https://opencosmos.ai/studio',
    siteName: PRODUCT_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PRODUCT_NAME,
    description: PRODUCT_DESCRIPTION,
    creator: '@shalomormsby',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: PRODUCT_NAME,
  url: 'https://opencosmos.ai/studio',
  logo: 'https://opencosmos.ai/studio/favicon.ico',
  description: PRODUCT_DESCRIPTION,
  sameAs: [
    'https://github.com/shalomormsby/opencosmos-ui',
    'https://www.npmjs.com/package/@opencosmos/ui',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={allFontVariables} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider position="bottom-right">
            <TooltipProvider>
              {children}
              <CustomizerPanel />
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
