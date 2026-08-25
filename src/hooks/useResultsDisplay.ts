import { useEffect, useMemo, useState } from 'react';
import type { DirectoryEntryType, DirectoryListingEntry } from '../types/contentful';
import { sortEntries, type SortOrder } from '../lib/sorting';

const LOAD_MORE_THRESHOLD = 4;

export function useResultsDisplay(
  directory: DirectoryEntryType,
  displayedEntries: DirectoryListingEntry[]
) {
  const resultsPerPage = directory.fields.resultsPerPage || 12;

  const [sortOrder, setSortOrder] = useState<SortOrder>('recommended');
  const [visibleCount, setVisibleCount] = useState(resultsPerPage);

  const sortedEntries = useMemo(
    () => sortEntries(displayedEntries, sortOrder),
    [displayedEntries, sortOrder]
  );

  useEffect(() => {
    setVisibleCount(resultsPerPage);
  }, [displayedEntries, resultsPerPage]);

  const remainder = sortedEntries.length - visibleCount;
  const effectiveVisibleCount =
    remainder > 0 && remainder <= LOAD_MORE_THRESHOLD ? sortedEntries.length : visibleCount;

  const visibleEntries = sortedEntries.slice(0, effectiveVisibleCount);
  const hasMore = effectiveVisibleCount < sortedEntries.length;

  function loadMore() {
    setVisibleCount((prev) => prev + resultsPerPage);
  }

  // Reveals every remaining result at once, bypassing pagination entirely
  // — distinct from loadMore, which only advances by one page.
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