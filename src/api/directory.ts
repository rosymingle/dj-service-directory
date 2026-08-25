import { contentfulClient } from '../lib/contentful';
import type {
  DirectoryEntryType,
  DirectoryListingEntry,
  TagEntry,
  StoreEntry,
} from '../types/contentful';

export async function fetchDirectoryBySlug(
  slug: string
): Promise<DirectoryEntryType | undefined> {
  const res = await contentfulClient.getEntries({
    content_type: 'directory',
    'fields.slug': slug,
    include: 1,
    limit: 1,
  });
  return res.items[0] as unknown as DirectoryEntryType | undefined;
}

export async function fetchDirectoryEntries(
  directoryId: string
): Promise<DirectoryListingEntry[]> {
  const res = await contentfulClient.getEntries({
    content_type: 'directoryEntry',
    'fields.directory.sys.id': directoryId,
    include: 2,
    limit: 1000,
  });
  return res.items as unknown as DirectoryListingEntry[];
}

export async function fetchAllTags(): Promise<TagEntry[]> {
  const res = await contentfulClient.getEntries({
    content_type: 'tag',
    include: 1,
    limit: 1000,
    'fields.active': true,
  });
  return res.items as unknown as TagEntry[];
}

export async function fetchAllStores(): Promise<StoreEntry[]> {
  const res = await contentfulClient.getEntries({
    content_type: 'store',
    limit: 1000,
    'fields.active': true,
  });
  return res.items as unknown as StoreEntry[];
}