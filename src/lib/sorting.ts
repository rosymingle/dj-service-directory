import type { DirectoryEntryFields } from '../types/contentful';
import type { DirectoryListingEntry } from '../types/contentful';

export type SortOrder = 'recommended' | 'brand-az' | 'tag-az' | 'duration-low-high' | 'price-low-high';

export function buildPopularList(entries: DirectoryListingEntry[]): DirectoryListingEntry[] {
  return entries
    .filter((entry) => entry.fields.showInPopular)
    .sort((a, b) => {
      const rankA = a.fields.popularRank ?? Infinity;
      const rankB = b.fields.popularRank ?? Infinity;
      return rankA - rankB;
    });
}

export function sortEntries(
  entries: DirectoryListingEntry[],
  order: SortOrder
): DirectoryListingEntry[] {
  const sorted = [...entries];

  switch (order) {
    case 'recommended':
      return sorted.sort((a, b) => {
        const priorityA = a.fields.priority ?? Infinity;
        const priorityB = b.fields.priority ?? Infinity;
        return priorityA - priorityB;
      });

    case 'brand-az':
      return sorted.sort((a, b) =>
        (a.fields.brand?.fields.brandName ?? '').localeCompare(
          b.fields.brand?.fields.brandName ?? ''
        )
      );

    case 'tag-az':
      return sorted.sort((a, b) =>
        (a.fields.tags?.[0]?.fields.label ?? '').localeCompare(
          b.fields.tags?.[0]?.fields.label ?? ''
        )
      );

    case 'duration-low-high':
      return sorted.sort((a, b) => {
        const durationA = a.fields.durationMinutes ?? Infinity;
        const durationB = b.fields.durationMinutes ?? Infinity;
        return durationA - durationB;
      });

    case 'price-low-high':
      return sorted.sort((a, b) => {
        const priceA = a.fields.priceMin ?? Infinity;
        const priceB = b.fields.priceMin ?? Infinity;
        return priceA - priceB;
      });

    default:
      return sorted;
  }
}