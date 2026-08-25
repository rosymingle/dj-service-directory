import type { DirectoryEntryType, DirectoryListingEntry } from '../types/contentful';
import { useDirectoryFilters } from '../hooks/useDirectoryFilters';
import { useResultsDisplay } from '../hooks/useResultsDisplay';
import { DirectoryEntryGrid } from './DirectoryEntryGrid';
import type { SortOrder } from '../lib/sorting';
import styles from './ResultsSection.module.css';

interface ResultsSectionProps {
  directory: DirectoryEntryType;
  entries: DirectoryListingEntry[];
  filters: ReturnType<typeof useDirectoryFilters>;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'duration-low-high', label: 'Duration: Low to High' },
];

export function ResultsSection({ directory, entries, filters }: ResultsSectionProps) {
  const { sortOrder, setSortOrder, visibleEntries, totalCount, hasMore, loadMore, showAll } =
    useResultsDisplay(directory, entries);

  const showResultsCount = directory.fields.showResultsCount !== false;
  const showSort = directory.fields.showSort !== false;
  const showLoadMore = directory.fields.showLoadMore !== false;

  const resultsCountText =
    visibleEntries.length < totalCount
      ? `${visibleEntries.length} of ${totalCount} results`
      : `${totalCount} ${totalCount === 1 ? 'result' : 'results'}`;

  return (
    <div>
      {filters.showPopular ? (
        <div className={styles.header}>
          <h2 className={styles.popularTitle}>Popular Services</h2>
          <button type="button" className={`${styles.allServicesLink} resetButton`} onClick={filters.clearAllFilters}>
            All Services
          </button>
        </div>
      ) : (
        (showResultsCount || showSort) && (
          <div className={styles.header}>
            {showResultsCount && <p className={styles.count}>{resultsCountText}</p>}
            {showSort && (
              <label className={styles.sortLabel}>
                Sort by
                <select
                  className={styles.sortSelect}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )
      )}

      <DirectoryEntryGrid entries={visibleEntries} directory={directory} filters={filters} />

      {showLoadMore && hasMore && (
        <div className={styles.loadMoreRow}>
          <button type="button" className={`${styles.loadMoreButton} resetButton`} onClick={loadMore}>
            Load More
          </button>
          <button type="button" className={`${styles.showAllLink} resetButton`} onClick={showAll}>
            Show All
          </button>
        </div>
      )}
    </div>
  );
}