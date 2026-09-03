import { useEffect, useMemo, useState } from 'react';
import type { DirectoryEntryType, DirectoryListingEntry } from '../types/contentful';
import { sortEntries, type SortOrder } from '../lib/sorting';

const LOAD_MORE_THRESHOLD = 4;

export function useResultsDisplay(
  directory: DirectoryEntryType,
  displayedEntries: DirectoryListingEntry[],
  preserveIncomingOrder = false
) {
  const resultsPerPage = directory.fields.resultsPerPage;
  // Blank Results Per Page means pagination is off entirely — every
  // result shows at once, Load More never appears.
  const paginationEnabled = typeof resultsPerPage === 'number';

  const [sortOrder, setSortOrder] = useState<SortOrder>('recommended');
  const [visibleCount, setVisibleCount] = useState(paginationEnabled ? resultsPerPage : Infinity);

  const sortedEntries = useMemo(
    () => (preserveIncomingOrder ? displayedEntries : sortEntries(displayedEntries, sortOrder)),
    [displayedEntries, sortOrder, preserveIncomingOrder]
  );

  useEffect(() => {
    setVisibleCount(paginationEnabled ? resultsPerPage : Infinity);
  }, [displayedEntries, resultsPerPage, paginationEnabled]);

  const remainder = sortedEntries.length - visibleCount;
  const effectiveVisibleCount =
    paginationEnabled && remainder > 0 && remainder <= LOAD_MORE_THRESHOLD
      ? sortedEntries.length
      : visibleCount;

  const visibleEntries = sortedEntries.slice(0, effectiveVisibleCount);
  const hasMore = paginationEnabled && effectiveVisibleCount < sortedEntries.length;

  function loadMore() {
    if (!paginationEnabled) return;
    setVisibleCount((prev) => (typeof prev === 'number' ? prev + resultsPerPage : prev));
  }

  function showAll() {
    setVisibleCount(sortedEntries.length);
  }

  return {
    sortOrder,
    setSortOrder,
    visibleEntries,
    totalCount: sortedEntries.length,
    hasMore,
    loadMore,
    showAll,
  };
}