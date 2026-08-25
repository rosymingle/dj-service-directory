import type { DirectoryEntryFields, BookingProviderEntry } from '../types/contentful';

export interface ResolvedCta {
  url: string;
  text: string;
  openInNewTab: boolean;
}

// Builds the primary "Book Now" CTA for a Directory Entry.
// overrideUrl always wins if present — it bypasses the provider/template
// path entirely, as confirmed by the "The Fragrance Moment" test entry.
export function resolvePrimaryCta(
  entry: DirectoryEntryFields
): ResolvedCta | undefined {
  const text = entry.ctaText ?? 'Book Now';

  if (entry.overrideUrl) {
    return {
      url: entry.overrideUrl,
      text,
      openInNewTab: entry.ctaOpenInNewTab ?? false,
    };
  }

  if (entry.bookingProvider) {
    const url = interpolateProviderUrl(entry.bookingProvider, entry);
    if (!url) return undefined;

    return {
      url,
      text,
      openInNewTab: entry.bookingProvider.fields.openInNewTab ?? entry.ctaOpenInNewTab ?? false,
    };
  }

  // Neither overrideUrl nor bookingProvider set — no primary CTA to show.
  return undefined;
}

// Builds the secondary CTA — always a plain link, never provider-driven
// (confirmed: no second bookingProvider field exists for it).
export function resolveSecondaryCta(
  entry: DirectoryEntryFields
): ResolvedCta | undefined {
  if (!entry.secondaryCtaUrl) return undefined;

  return {
    url: entry.secondaryCtaUrl,
    text: entry.secondaryCtaText ?? 'Book Now',
    openInNewTab: entry.secondaryCtaOpenInNewTab ?? false,
  };
}

// Substitutes {id1}/{id2}/{id3} placeholders in a provider's urlTemplate
// with the entry's providerId1/2/3 values.
function interpolateProviderUrl(
  provider: BookingProviderEntry,
  entry: DirectoryEntryFields
): string | undefined {
  const template = provider.fields.urlTemplate;
  if (!template) return undefined;

  return template
    .replace('{id1}', entry.providerId1 ?? '')
    .replace('{id2}', entry.providerId2 ?? '')
    .replace('{id3}', entry.providerId3 ?? '');
}