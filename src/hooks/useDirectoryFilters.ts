import { useEffect, useMemo, useState } from 'react';
import type { DirectoryEntryType, DirectoryListingEntry, StoreEntry, TagEntry } from '../types/contentful';
import { buildTagTree } from '../lib/tags';
import { getAvailableCheckboxIds, getAvailableStoreIds, entryMatchesEverything } from '../lib/availability';
import { buildPopularList } from '../lib/sorting';
import { slugifyParam, buildFilterSearch, readParamSlugs, slugsToIds, idsToSlugs } from '../lib/urlParams';

type ViewMode = 'popular' | 'results';

export function useDirectoryFilters(
  directory: DirectoryEntryType,
  allTags: TagEntry[],
  allStores: StoreEntry[],
  entries: DirectoryListingEntry[]
) {
  const tagTree = useMemo(() => buildTagTree(allTags), [allTags]);

  const popularEnabled = directory.fields.showPopularView !== false;

  const resultsEligibleEntries = useMemo(
    () => entries.filter((entry) => entry.fields.showInResults !== false),
    [entries]
  );

  const filterParamKeys = useMemo(
    () => [
      directory.fields.filter1Title ? slugifyParam(directory.fields.filter1Title) : 'filter-1',
      directory.fields.filter2Title ? slugifyParam(directory.fields.filter2Title) : 'filter-2',
      directory.fields.filter3Title ? slugifyParam(directory.fields.filter3Title) : 'filter-3',
    ],
    [directory]
  );

  function getInitialSelection() {
    if (typeof window === 'undefined') {
      return {
        ids1: [] as string[],
        ids2: [] as string[],
        ids3: [] as string[],
        storeIds: [] as string[],
        viewMode: (popularEnabled ? 'popular' : 'results') as ViewMode,
      };
    }

    const search = window.location.search;
    const checkboxPools = [
      directory.fields.filter1Checkboxes ?? [],
      directory.fields.filter2Checkboxes ?? [],
      directory.fields.filter3Checkboxes ?? [],
    ];

    const ids1 = slugsToIds(readParamSlugs(search, filterParamKeys[0]), checkboxPools[0]);
    const ids2 = slugsToIds(readParamSlugs(search, filterParamKeys[1]), checkboxPools[1]);
    const ids3 = slugsToIds(readParamSlugs(search, filterParamKeys[2]), checkboxPools[2]);
    const storeIds = slugsToIds(readParamSlugs(search, 'store'), allStores);

    const hasAnyFromUrl = ids1.length > 0 || ids2.length > 0 || ids3.length > 0 || storeIds.length > 0;
    const viewMode: ViewMode = hasAnyFromUrl ? 'results' : popularEnabled ? 'popular' : 'results';

    return { ids1, ids2, ids3, storeIds, viewMode };
  }

  const [selectedIds1, setSelectedIds1] = useState<string[]>(() => getInitialSelection().ids1);
  const [selectedIds2, setSelectedIds2] = useState<string[]>(() => getInitialSelection().ids2);
  const [selectedIds3, setSelectedIds3] = useState<string[]>(() => getInitialSelection().ids3);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(() => getInitialSelection().storeIds);
  const [viewMode, setViewMode] = useState<ViewMode>(() => getInitialSelection().viewMode);

  const filterSlots = useMemo(
    () => [
      { checkboxes: directory.fields.filter1Checkboxes ?? [], selectedIds: selectedIds1 },
      { checkboxes: directory.fields.filter2Checkboxes ?? [], selectedIds: selectedIds2 },
      { checkboxes: directory.fields.filter3Checkboxes ?? [], selectedIds: selectedIds3 },
    ],
    [directory, selectedIds1, selectedIds2, selectedIds3]
  );

  const availableIdsBySlot = useMemo(
    () =>
      filterSlots.map((_, i) =>
        getAvailableCheckboxIds(resultsEligibleEntries, filterSlots, i, selectedStoreIds, tagTree)
      ),
    [resultsEligibleEntries, filterSlots, selectedStoreIds, tagTree]
  );

  const availableStoreIds = useMemo(
    () => getAvailableStoreIds(resultsEligibleEntries, filterSlots, allStores, tagTree),
    [resultsEligibleEntries, filterSlots, allStores, tagTree]
  );

  const filteredEntries = useMemo(
    () =>
      resultsEligibleEntries.filter((entry) =>
        entryMatchesEverything(entry, filterSlots, selectedStoreIds, tagTree)
      ),
    [resultsEligibleEntries, filterSlots, selectedStoreIds, tagTree]
  );

  const hasActiveFilters =
    selectedIds1.length > 0 ||
    selectedIds2.length > 0 ||
    selectedIds3.length > 0 ||
    selectedStoreIds.length > 0;

  const popularList = useMemo(() => buildPopularList(entries), [entries]);

  const showPopular = viewMode === 'popular';
  const displayedEntries = showPopular ? popularList : filteredEntries;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const search = buildFilterSearch([
      { key: filterParamKeys[0], slugs: idsToSlugs(selectedIds1, directory.fields.filter1Checkboxes ?? []) },
      { key: filterParamKeys[1], slugs: idsToSlugs(selectedIds2, directory.fields.filter2Checkboxes ?? []) },
      { key: filterParamKeys[2], slugs: idsToSlugs(selectedIds3, directory.fields.filter3Checkboxes ?? []) },
      { key: 'store', slugs: idsToSlugs(selectedStoreIds, allStores) },
    ]);

    window.history.replaceState(null, '', `${window.location.pathname}${search}`);
  }, [selectedIds1, selectedIds2, selectedIds3, selectedStoreIds, filterParamKeys, allStores, directory]);

  function toggleSlotOption(slotIndex: 0 | 1 | 2, id: string) {
    const [selected, setSelected] = [
      [selectedIds1, setSelectedIds1],
      [selectedIds2, setSelectedIds2],
      [selectedIds3, setSelectedIds3],
    ][slotIndex] as [string[], (ids: string[]) => void];

    setSelected(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
    setViewMode('results');
  }

  function toggleStore(id: string) {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setViewMode('results');
  }

  function clearAllFilters() {
    setSelectedIds1([]);
    setSelectedIds2([]);
    setSelectedIds3([]);
    setSelectedStoreIds([]);
    setViewMode('results');
  }

  function showPopularServices() {
    setSelectedIds1([]);
    setSelectedIds2([]);
    setSelectedIds3([]);
    setSelectedStoreIds([]);
    setViewMode('popular');
  }

  function selectShortcutTag(tagId: string) {
    const slotIndex = filterSlots.findIndex((slot) =>
      slot.checkboxes.some((cb) => cb.sys.id === tagId)
    );

    if (slotIndex === -1) {
      console.warn('Shortcut target tag is not part of any filter slot:', tagId);
      return;
    }

    const slot = [selectedIds1, selectedIds2, selectedIds3][slotIndex];
    if (!slot.includes(tagId)) {
      toggleSlotOption(slotIndex as 0 | 1 | 2, tagId);
    } else {
      setViewMode('results');
    }
  }

  return {
    tagTree,
    filterSlots,
    availableIdsBySlot,
    allStores,
    availableStoreIds,
    selectedStoreIds,
    filteredEntries,
    hasActiveFilters,
    showPopular,
    popularEnabled,
    displayedEntries,
    toggleSlotOption,
    toggleStore,
    clearAllFilters,
    showPopularServices,
    selectShortcutTag,
  };
}