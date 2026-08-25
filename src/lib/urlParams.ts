// Converts a filter slot's display title (e.g. "Treatment Type") into a
// URL-safe, lowercase, hyphenated param key (e.g. "treatment-type").
export function slugifyParam(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface FilterParamSlot {
  key: string;
  slugs: string[];
}

// Builds a query string (including leading '?', or '' if nothing is
// selected anywhere) from a set of param key/slug-list pairs.
export function buildFilterSearch(slots: FilterParamSlot[]): string {
  const params = new URLSearchParams();
  slots.forEach(({ key, slugs }) => {
    if (key && slugs.length > 0) params.set(key, slugs.join(','));
  });
  const str = params.toString();
  return str ? `?${str}` : '';
}

// Reads one param's comma-separated slug list from a query string.
export function readParamSlugs(search: string, key: string): string[] {
  if (!key) return [];
  const params = new URLSearchParams(search);
  const raw = params.get(key);
  return raw ? raw.split(',').filter(Boolean) : [];
}

interface SlugEntry {
  sys: { id: string };
  fields: { slug: string };
}

// Resolves URL slugs to matching entries' ids, against a known candidate
// pool (a filter slot's checkboxes, or the directory's store list).
// Unmatched slugs are silently dropped — a stale/invalid shared link
// shouldn't crash the page, it should just not pre-select whatever no
// longer exists.
export function slugsToIds<T extends SlugEntry>(slugs: string[], pool: T[]): string[] {
  const ids: string[] = [];
  slugs.forEach((slug) => {
    const match = pool.find((item) => item.fields.slug === slug);
    if (match) ids.push(match.sys.id);
  });
  return ids;
}

// The reverse: given selected ids and the same pool, returns their slugs
// for writing back into the URL.
export function idsToSlugs<T extends SlugEntry>(ids: string[], pool: T[]): string[] {
  const slugs: string[] = [];
  ids.forEach((id) => {
    const match = pool.find((item) => item.sys.id === id);
    if (match) slugs.push(match.fields.slug);
  });
  return slugs;
}