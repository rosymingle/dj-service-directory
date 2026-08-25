import type { DirectoryEntryFields, FilterCheckboxEntry, TagEntry, BrandEntry } from '../types/contentful';
import type { TagTree } from './tags';
import { entryMatchesTagSelection } from './tags';

export function isTagCheckbox(checkbox: FilterCheckboxEntry): checkbox is TagEntry {
  return checkbox.sys.contentType.sys.id === 'tag';
}

export function isBrandCheckbox(checkbox: FilterCheckboxEntry): checkbox is BrandEntry {
  return checkbox.sys.contentType.sys.id === 'brand';
}

export function filterValidCheckboxes(checkboxes: FilterCheckboxEntry[]): FilterCheckboxEntry[] {
  return checkboxes.filter((cb) => isTagCheckbox(cb) || isBrandCheckbox(cb));
}

export function isTopLevelCheckbox(checkbox: FilterCheckboxEntry): boolean {
  if (isTagCheckbox(checkbox)) return !checkbox.fields.parent;
  return true;
}

// selectedIds within one slot can mix tag ids (top-level and/or
// subcategory) and brand ids. Tag ids are matched all together via
// entryMatchesTagSelection, which applies parent/child narrowing —
// they are NOT tested independently, since that's what caused parent+
// child selections to be a no-op. Brand ids are matched separately and
// OR'd in alongside the tag result, same mixed-type behavior as before.
export function entryMatchesFilterSlot(
  entry: DirectoryEntryFields,
  allCheckboxesInSlot: FilterCheckboxEntry[],
  selectedIds: string[],
  tagTree: TagTree
): boolean {
  if (selectedIds.length === 0) return true;

  const tagIds = selectedIds.filter((id) => tagTree.byId.has(id));
  const otherIds = selectedIds.filter((id) => !tagTree.byId.has(id));

  if (tagIds.length > 0 && entryMatchesTagSelection(entry.tags ?? [], tagIds, tagTree)) {
    return true;
  }

  return otherIds.some((id) => {
    const checkbox = allCheckboxesInSlot.find((cb) => cb.sys.id === id);
    return checkbox && isBrandCheckbox(checkbox) ? entry.brand?.sys.id === checkbox.sys.id : false;
  });
}

export function entryMatchesAllFilters(
  entry: DirectoryEntryFields,
  filterSlots: { checkboxes: FilterCheckboxEntry[]; selectedIds: string[] }[],
  tagTree: TagTree
): boolean {
  return filterSlots.every((slot) =>
    entryMatchesFilterSlot(entry, slot.checkboxes, slot.selectedIds, tagTree)
  );
}

export function sortCheckboxesForDisplay<T extends FilterCheckboxEntry>(
  checkboxes: T[]
): T[] {
  return [...checkboxes].sort((a, b) => {
    const rankA = isTagCheckbox(a) ? a.fields.sortOrder : a.fields.priority;
    const rankB = isTagCheckbox(b) ? b.fields.sortOrder : b.fields.priority;

    const normalizedRankA = rankA ?? Infinity;
    const normalizedRankB = rankB ?? Infinity;

    if (normalizedRankA !== normalizedRankB) {
      return normalizedRankA - normalizedRankB;
    }

    const labelA = (isTagCheckbox(a) ? a.fields.label : a.fields.brandName) ?? '';
    const labelB = (isTagCheckbox(b) ? b.fields.label : b.fields.brandName) ?? '';
    return labelA.localeCompare(labelB);
  });
}