// These types intentionally do NOT use Entry<Skeleton> from the
// `contentful` package. That approach requires every field to be wrapped
// in the SDK's own EntryFieldTypes.* generics — getting that wrong
// silently collapses every field into an unusable `{ [x: string]: undefined }`
// type instead of a clear compile error. These are plain interfaces
// matching the real shape Contentful returns at runtime instead — stable
// regardless of which contentful package version is installed. Fetch
// functions in src/api/directory.ts cast the SDK's response into these
// shapes once, at the boundary.

export interface EntrySys {
  id: string;
  contentType: {
    sys: {
      id: string;
    };
  };
}

export interface AssetFile {
  url: string;
  contentType?: string;
}

export interface AssetEntry {
  sys: { id: string };
  fields: {
    title?: string;
    description?: string;
    file?: AssetFile;
  };
}

// ── Tag ──────────────────────────────────────────────
export interface TagFields {
  label: string;
  slug: string;
  sortOrder?: number;
  active?: boolean;
  parents?: TagEntry[];
}
export interface TagEntry {
  sys: EntrySys;
  fields: TagFields;
}

// ── Store ────────────────────────────────────────────
export type StoreState = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'ACT' | 'NT' | 'TAS' | 'NZ';
export type StoreCountry = 'AU' | 'NZ';

export interface StoreFields {
  name: string;
  slug: string;
  state: StoreState;
  country: StoreCountry;
  sortOrder?: number;
  active: boolean;
}
export interface StoreEntry {
  sys: EntrySys;
  fields: StoreFields;
}

// ── Brand ────────────────────────────────────────────
export interface BrandFields {
  brandName: string;
  slug: string;
  logo?: AssetEntry;
  priority?: number;
}
export interface BrandEntry {
  sys: EntrySys;
  fields: BrandFields;
}

// ── Booking Provider ─────────────────────────────────
export interface BookingProviderFields {
  label?: string;
  providerId: string;
  urlTemplate?: string;
  openInNewTab?: boolean;
}
export interface BookingProviderEntry {
  sys: EntrySys;
  fields: BookingProviderFields;
}

// ── Directory ────────────────────────────────────────
export type FilterCheckboxEntry = TagEntry | BrandEntry;

export interface DirectoryFields {
  title: string;
  slug: string;
  heroImageDe?: AssetEntry;
  heroImageMo?: AssetEntry;
  intro?: string;
  resultsPerPage: number;
  showNames?: boolean;
  showTitles?: boolean;
  showPopularView?: boolean;
  showResultsCount?: boolean;
  showLoadMore?: boolean;
  showSort?: boolean;
  lhColumnTitle?: string;
  lhColumnIcon?: AssetEntry;
  filter1Title?: string;
  filter1Checkboxes?: FilterCheckboxEntry[];
  filter2Title?: string;
  filter2Checkboxes?: FilterCheckboxEntry[];
  filter3Title?: string;
  filter3Checkboxes?: FilterCheckboxEntry[];
  imageAspectRatio?: string; // e.g. "4:3", "1:1" — see src/lib/images.ts
}
export interface DirectoryEntryType {
  sys: EntrySys;
  fields: DirectoryFields;
}

// ── Directory Entry (the central content type) ───────
export interface DirectoryEntryFields {
  directory: DirectoryEntryType;
  title?: string;
  slug: string;
  image: AssetEntry;
  imageTransform?: string;
  description?: string;
  brand?: BrandEntry;
  tags?: TagEntry[];
  durationDisplay?: string;
  durationMinutes?: number;
  priceDisplay?: string;
  priceMin?: number;
  priceMax?: number;
  isComplimentary?: boolean;
  isRedeemable?: boolean;
  featured?: boolean;
  fullWidth?: boolean;
  priority?: number;
  dinkus?: string;
  showInPopular?: boolean;
  popularRank?: number;
  showInResults?: boolean;
  shortcutTarget?: TagEntry;
  stores?: StoreEntry[];
  bookInstoreOnly?: StoreEntry[];
  storeListOverride?: string;
  bookingProvider?: BookingProviderEntry;
  providerId1?: string;
  providerId2?: string;
  providerId3?: string;
  overrideUrl?: string;
  ctaText?: string;
  ctaOpenInNewTab?: boolean;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  secondaryCtaOpenInNewTab?: boolean;
}
export interface DirectoryListingEntry {
  sys: EntrySys;
  fields: DirectoryEntryFields;
}