import type { DirectoryEntryFields, StoreEntry, StoreState } from '../types/contentful';

export interface StoreAvailability {
  store: StoreEntry;
  bookable: boolean; // true = book online (`stores`), false = enquire in-store only (`bookInstoreOnly`)
}

const STATE_ORDER: StoreState[] = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'ACT', 'NT', 'TAS', 'NZ'];

// Unions `stores` + `bookInstoreOnly` into a single list, tagging each
// store with whether it's online-bookable or enquire-in-store-only.
export function mergeStoreAvailability(
  entry: DirectoryEntryFields
): StoreAvailability[] {
  const bookable = entry.stores ?? [];
  const instoreOnly = entry.bookInstoreOnly ?? [];

  const merged = new Map<string, StoreAvailability>();

  // Online-bookable stores go in first...
  bookable.forEach((store) => {
    merged.set(store.sys.id, { store, bookable: true });
  });

  // ...then in-store-only stores, which OVERRIDE a bookable entry if the
  // same store appears in both lists. Instore Only is the newer field and
  // sits lower on the form, so it's treated as the editor's more deliberate
  // choice if both are set.
  instoreOnly.forEach((store) => {
    if (merged.has(store.sys.id)) {
      console.warn(
        `Store "${store.fields.name}" is listed in both Bookable Stores and Book Instore Only — Book Instore Only takes priority.`
      );
    }
    merged.set(store.sys.id, { store, bookable: false });
  });

  return Array.from(merged.values());
}

export function sortStoresByState(
  availabilities: StoreAvailability[]
): StoreAvailability[] {
  return [...availabilities].sort((a, b) => {
    const stateDiff =
      STATE_ORDER.indexOf(a.store.fields.state) - STATE_ORDER.indexOf(b.store.fields.state);
    if (stateDiff !== 0) return stateDiff;

    return (a.store.fields.sortOrder ?? 200) - (b.store.fields.sortOrder ?? 200);
  });
}

export function groupStoresByState(
  availabilities: StoreAvailability[]
): Map<StoreState, StoreAvailability[]> {
  const sorted = sortStoresByState(availabilities);
  const grouped = new Map<StoreState, StoreAvailability[]>();

  sorted.forEach((item) => {
    const state = item.store.fields.state;
    const existing = grouped.get(state) ?? [];
    existing.push(item);
    grouped.set(state, existing);
  });

  return grouped;
}