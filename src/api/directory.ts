import { contentfulClient } from '../lib/contentful';
import type {
  DirectoryFields,
  DirectoryEntryType,
  DirectoryEntryFields,
  DirectoryListingEntry,
  TagFields,
  TagEntry,
  StoreFields,
  StoreEntry,
} from '../types/contentful';

export async function fetchDirectoryBySlug(
  slug: string
): Promise<DirectoryEntryType | undefined> {
  const res = await contentfulClient.getEntries<DirectoryFields>({
    content_type: 'directory',
    'fields.slug': slug,
    include: 1,
    limit: 1,
  });
  return res.items[0];
}

export async function fetchDirectoryEntries(
  directoryId: string
): Promise<DirectoryListingEntry[]> {
  const res = await contentfulClient.getEntries<DirectoryEntryFields>({
    content_type: 'directoryEntry',
    'fields.directory.sys.id': directoryId,
    include: 2,
    limit: 1000,
  });
  return res.items;
}

export async function fetchAllTags(): Promise<TagEntry[]> {
  const res = await contentfulClient.getEntries<TagFields>({
    content_type: 'tag',
    include: 1,
    limit: 1000,
    'fields.active': true,
  });
  return res.items;
}

// The full, shared list of David Jones stores — the same across every
// Directory instance (Beauty, Fashion, etc.), independent of which
// entries happen to reference them. Same pattern as fetchAllTags.
export async function fetchAllStores(): Promise<StoreEntry[]> {
  const res = await contentfulClient.getEntries<StoreFields>({
    content_type: 'store',
    limit: 1000,
    'fields.active': true,
  });
  return res.items;
}