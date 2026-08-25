import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

export type MasonrySpan = 1 | 2 | 'full';

export interface MasonryItem {
  id: string;
  span: MasonrySpan;
}

interface MasonryPosition {
  top: number;
  left: number;
  width: number;
}

const GAP = 24;
// Used only until an item's real height has been measured via
// ResizeObserver, so layout has something to work with on first paint.
const PLACEHOLDER_HEIGHT = 400;

// Column count is derived from the grid's own measured width, not the
// viewport — more accurate here since the sidebar eats into available
// space, so viewport-based breakpoints wouldn't line up with reality.
function getColumnCount(containerWidth: number): number {
  if (containerWidth >= 1200) return 4;
  if (containerWidth >= 900) return 3;
  if (containerWidth >= 600) return 2;
  return 1;
}

export function useMasonry(items: MasonryItem[]) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemHeights, setItemHeights] = useState<Record<string, number>>({});
  const itemElements = useRef<Map<string, HTMLElement>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setItemHeights((prev) => {
        const next = { ...prev };
        let changed = false;
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.masonryId;
          if (!id) return;
          const height = entry.contentRect.height;
          if (next[id] !== height) {
            next[id] = height;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    });
    resizeObserverRef.current = observer;
    itemElements.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const registerItem = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      const prevEl = itemElements.current.get(id);
      if (prevEl && resizeObserverRef.current) {
        resizeObserverRef.current.unobserve(prevEl);
      }
      if (node) {
        node.dataset.masonryId = id;
        itemElements.current.set(id, node);
        resizeObserverRef.current?.observe(node);
      } else {
        itemElements.current.delete(id);
      }
    },
    []
  );

  const columnCount = useMemo(() => getColumnCount(containerWidth), [containerWidth]);

  const { positions, containerHeight } = useMemo(() => {
    if (containerWidth === 0 || columnCount === 0) {
      return { positions: {} as Record<string, MasonryPosition>, containerHeight: 0 };
    }

    const columnWidth = (containerWidth - GAP * (columnCount - 1)) / columnCount;
    const columnHeights = new Array(columnCount).fill(0);
    const positions: Record<string, MasonryPosition> = {};

    items.forEach((item) => {
      const height = itemHeights[item.id] ?? PLACEHOLDER_HEIGHT;

      // fullWidth starts a fresh row: every column continues from
      // whichever is currently tallest, then all reset to the same height.
      if (item.span === 'full') {
        const top = Math.max(...columnHeights);
        positions[item.id] = { top, left: 0, width: containerWidth };
        const newHeight = top + height + GAP;
        columnHeights.fill(newHeight);
        return;
      }

      // Cap span at the actual column count, so "featured" (span 2) never
      // overflows on a 2-column mobile layout.
      const span = item.span === 2 ? Math.min(2, columnCount) : 1;

      let bestStart = 0;
      let bestHeight = Infinity;
      for (let start = 0; start <= columnCount - span; start++) {
        const segmentMax = Math.max(...columnHeights.slice(start, start + span));
        if (segmentMax < bestHeight) {
          bestHeight = segmentMax;
          bestStart = start;
        }
      }

      const left = bestStart * (columnWidth + GAP);
      const width = columnWidth * span + GAP * (span - 1);
      const top = bestHeight;

      positions[item.id] = { top, left, width };

      const newHeight = top + height + GAP;
      for (let i = bestStart; i < bestStart + span; i++) {
        columnHeights[i] = newHeight;
      }
    });

    return { positions, containerHeight: Math.max(...columnHeights, 0) };
  }, [items, itemHeights, columnCount, containerWidth]);

  return { containerRef, registerItem, positions, containerHeight };
}