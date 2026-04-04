import { notFound, redirect } from 'next/navigation';
import { SectionRenderer } from '../../SectionRenderer';
import {
  VALID_SECTIONS,
  SECTION_ITEMS,
  sectionLabel,
  itemLabel,
  type Section,
} from '../../route-config';

/** Reverse-lookup: find the real category section that contains a given item slug. */
function findCategoryForItem(item: string): string | undefined {
  for (const [section, items] of Object.entries(SECTION_ITEMS)) {
    if (items.includes(item)) return section;
  }
  return undefined;
}

export async function generateStaticParams() {
  const params: { section: string; item: string }[] = [];
  for (const [section, items] of Object.entries(SECTION_ITEMS)) {
    for (const item of items) {
      params.push({ section, item });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; item: string }>;
}) {
  const { section, item } = await params;

  // Resolve correct section for metadata when accessed via /docs/components/[item]
  if (section === 'components') {
    const realSection = findCategoryForItem(item);
    if (realSection) {
      const label = itemLabel(realSection, item);
      const secLabel = sectionLabel(realSection);
      return {
        title: `${label} — ${secLabel}`,
        description: `Documentation for the ${label} component in OpenCosmos UI.`,
      };
    }
  }

  const label = itemLabel(section, item);
  const secLabel = sectionLabel(section);
  return {
    title: `${label} — ${secLabel}`,
    description: `Documentation for the ${label} component in OpenCosmos UI.`,
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ section: string; item: string }>;
}) {
  const { section, item } = await params;

  if (!VALID_SECTIONS.includes(section as Section)) {
    notFound();
  }

  // Redirect /docs/components/[item] → /docs/[realCategory]/[item]
  if (section === 'components') {
    const realSection = findCategoryForItem(item);
    if (realSection) {
      redirect(`/docs/${realSection}/${item}`);
    }
    notFound();
  }

  // Only 404 if the section itself has no items defined (truly unknown section type).
  // Do NOT 404 on unknown items — SectionRenderer / ComponentsSection handle that
  // gracefully by showing the category overview. This avoids false 404s when the
  // deployed bundle's SECTION_ITEMS lags behind the source (e.g. stale remote cache).
  const validItems = SECTION_ITEMS[section];
  if (!validItems) {
    notFound();
  }

  return <SectionRenderer section={section} item={item} />;
}
