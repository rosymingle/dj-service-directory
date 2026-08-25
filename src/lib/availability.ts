import type { DirectoryListingEntry, FilterCheckboxEntry, StoreEntry } from '../types/contentful';
import type { TagTree } from './tags';
import { entryMatchesAllFilters, isTagCheckbox } from './filters';
import { mergeStoreAvailability } from './stores';

interface FilterSlot {
  checkboxes: FilterCheckboxEntry[];
  selectedIds: string[];
}

export function entryMatchesStoreSelection(
  entry: DirectoryListingEntry,
  selectedStoreIds: string[]
): boolean {
  if (selectedStoreIds.length === 0) return true;

  const merged = mergeStoreAvailability(entry.fields);
  const entryStoreIds = new Set(merged.map((m) => m.store.sys.id));

  return selectedStoreIds.some((id) => entryStoreIds.has(id));
}

export function entryMatchesEverything(
  entry: DirectoryListingEntry,
  filterSlots: FilterSlot[],
  selectedStoreIds: string[],
  tagTree: TagTree
): boolean {
  return (
    entryMatchesAllFilters(entry.fields, filterSlots, tagTree) &&
    entryMatchesStoreSelection(entry, selectedStoreIds)
  );
}

// Every top-level checkbox in a slot, PLUS every tag's children — a
// subcategory needs its own availability check too, since it's a valid,
// independently selectable filter option even though it isn't part of
// the slot's own curated checkbox list.
function getAllCandidateIds(checkboxes: FilterCheckboxEntry[], tagTree: TagTree): string[] {
  const ids = new Set<string>();
  checkboxes.forEach((checkbox) => {
    ids.add(checkbox.sys.id);
    if (isTagCheckbox(checkbox)) {
      (tagTree.childrenOf.get(checkbox.sys.id) ?? []).forEach((child) => ids.add(child.sys.id));
    }
  });
  return Array.from(ids);
}

export function getAvailableCheckboxIds(
  entries: DirectoryListingEntry[],
  filterSlots: FilterSlot[],
  targetSlotIndex: number,
  selectedStoreIds: string[],
  tagTree: TagTree
): Set<string> {
  const otherSlots = filterSlots.map((slot, i) =>
    i === targetSlotIndex ? { ...slot, selectedIds: [] } : slot
  );

  const candidateIds = getAllCandidateIds(filterSlots[targetSlotIndex].checkboxes, tagTree);
  const available = new Set<string>();

  candidateIds.forEach((id) => {
    const testSlots = otherSlots.map((slot, i) =>
      i === targetSlotIndex ? { ...slot, selectedIds: [id] } : slot
    );

    const hasMatch = entries.some((entry) =>
      entryMatchesEverything(entry, testSlots, selectedStoreIds, tagTree)
    );

    if (hasMatch) available.add(id);
  });

  return available;
}

export function getAvailableStoreIds(
  entries: DirectoryListingEntry[],
  filterSlots: FilterSlot[],
  allStores: StoreEntry[],
  tagTree: TagTree
): Set<string> {
  const available = new Set<string>();

  allStores.forEach((store) => {
    const hasMatch = entries.some((entry) =>
      entryMatchesEverything(entry, filterSlots, [store.sys.id], tagTree)
    );
    if (hasMatch) available.add(store.sys.id);
  });

  return available;
}