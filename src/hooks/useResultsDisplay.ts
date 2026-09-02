import { useEffect, useMemo, useState } from 'react';
import type { DirectoryEntryType, DirectoryListingEntry } from '../types/contentful';
import { sortEntries, type SortOrder } from '../lib/sorting';

const LOAD_MORE_THRESHOLD = 4;

export function useResultsDisplay(
  directory: DirectoryEntryType,
  displayedEntries: DirectoryListingEntry[],
  preserveIncomingOrder = false
) {
  const resultsPerPage = directory.fields.resultsPerPage || 12;

  const [sortOrder, setSortOrder] = useState<SortOrder>('recommended');
  const [visibleCount, setVisibleCount] = useState(resultsPerPage);

  // In Popular view, displayedEntries already arrives sorted by
  // popularRank (see buildPopularList) — re-sorting here by whatever
  // sortOrder defaults to (Recommended → priority) would silently
  // discard that ordering. preserveIncomingOrder skips the sort step
  // entirely in that case.
  const sortedEntries = useMemo(
    () => (preserveIncomingOrder ? displayedEntries : sortEntries(displayedEntries, sortOrder)),
    [displayedEntries, sortOrder, preserveIncomingOrder]
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