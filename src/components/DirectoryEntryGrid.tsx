import type { DirectoryEntryType, DirectoryListingEntry } from '../types/contentful';
import { DirectoryEntryCard } from './DirectoryEntryCard';
import type { useDirectoryFilters } from '../hooks/useDirectoryFilters';
import { useMasonry, type MasonryItem } from '../hooks/useMasonry';
import styles from './DirectoryEntryGrid.module.css';

const MOBILE_STACK_BREAKPOINT = 600;

interface DirectoryEntryGridProps {
  entries: DirectoryListingEntry[];
  directory: DirectoryEntryType;
  filters: ReturnType<typeof useDirectoryFilters>;
}

export function DirectoryEntryGrid({ entries, directory, filters }: DirectoryEntryGridProps) {
  const masonryItems: MasonryItem[] = entries.map((entry) => ({
    id: entry.sys.id,
    span: entry.fields.fullWidth ? 'full' : entry.fields.featured ? 2 : 1,
  }));

  const { containerRef, registerItem, positions, containerHeight } = useMasonry(masonryItems);

  if (entries.length === 0) {
    return <p className={styles.empty}>No services match your current selection.</p>;
  }

  // Below the mobile breakpoint, skip masonry positioning entirely — cards
  // stack full-width in normal document flow instead. containerHeight is
  // only meaningful for the absolutely-positioned masonry layout, so it's
  // left unset here rather than forcing a height that no longer applies.
  const isMobileStack = containerRef.current
    ? containerRef.current.clientWidth < MOBILE_STACK_BREAKPOINT
    : false;

  return (
    <div
      ref={containerRef}
      className={styles.grid}
      style={isMobileStack ? undefined : { height: containerHeight }}
    >
      {entries.map((entry) => {
        const pos = positions[entry.sys.id];

        if (isMobileStack) {
          return (
            <div key={entry.sys.id} ref={registerItem(entry.sys.id)} className={styles.stackedItem}>
              <DirectoryEntryCard entry={entry} directory={directory} filters={filters} />
            </div>
          );
        }

        return (
          <div
            key={entry.sys.id}
            ref={registerItem(entry.sys.id)}
            className={styles.item}
            style={
              pos
                ? { transform: `translate(${pos.left}px, ${pos.top}px)`, width: pos.width }
                : { visibility: 'hidden', position: 'absolute' }
            }
          >
            <DirectoryEntryCard entry={entry} directory={directory} filters={filters} />
          </div>
        );
      })}
    </div>
  );
}