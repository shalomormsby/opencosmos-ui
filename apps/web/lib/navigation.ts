import type { HeaderNavLink } from '@opencosmos/ui';

export const ecosystemNavigation: HeaderNavLink[] = [
  {
    label: 'Documentation',
    active: true,
    children: [
      { label: 'OpenCosmos Studio', href: 'https://opencosmos.ai/studio', active: true },
    ],
  },
  {
    label: 'Resources',
    children: [
      { label: 'NPM Package', href: 'https://www.npmjs.com/package/@opencosmos/ui' },
      { label: 'GitHub', href: 'https://github.com/shalomormsby/opencosmos-ui' },
    ],
  },
];
