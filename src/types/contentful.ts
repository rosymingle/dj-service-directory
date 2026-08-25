import type { Asset, Entry } from 'contentful';

// ── Tag ──────────────────────────────────────────────
export interface TagFields {
  label: string;
  slug: string;
  sortOrder?: number;
  active?: boolean;
  parent?: Entry<TagFields>;
}
export type TagEntry = Entry<TagFields>;

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
export type StoreEntry = Entry<StoreFields>;

// ── Brand ────────────────────────────────────────────
export interface BrandFields {
  brandName: string;
  slug: string;
  logo?: Asset;
  priority?: number;
}
export type BrandEntry = Entry<BrandFields>;

// ── Booking Provider ─────────────────────────────────
export interface BookingProviderFields {
  label?: string;
  providerId: string;
  urlTemplate?: string;
  openInNewTab?: boolean;
}
export type BookingProviderEntry = Entry<BookingProviderFields>;

// ── Directory ────────────────────────────────────────
export type FilterCheckboxEntry = TagEntry | BrandEntry;

export interface DirectoryFields {
  title: string;
  slug: string;
  heroImageDe?: Asset;
  heroImageMo?: Asset;
  intro?: string;
  resultsPerPage: number;
  showNames?: boolean;
  showTitles?: boolean;
  showPopularView?: boolean;
  showResultsCount?: boolean;
  showLoadMore?: boolean;
  showSort?: boolean;
  lhColumnTitle?: string;
  lhColumnIcon?: Asset;
  filter1Title?: string;
  filter1Checkboxes?: FilterCheckboxEntry[];
  filter2Title?: string;
  filter2Checkboxes?: FilterCheckboxEntry[];
  filter3Title?: string;
  filter3Checkboxes?: FilterCheckboxEntry[];
  imageAspectRatio?: string; // e.g. "4:3", "1:1" — see src/lib/images.ts
}
export type DirectoryEntryType = Entry<DirectoryFields>;

// ── Directory Entry (the central content type) ───────
export interface DirectoryEntryFields {
  directory: DirectoryEntryType;
  title?: string;
  slug: string;
  image: Asset;
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
export type DirectoryListingEntry = Entry<DirectoryEntryFields>;