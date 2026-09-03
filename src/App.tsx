import { useEffect, useState, type ReactNode } from 'react';
import { fetchDirectoryBySlug, fetchDirectoryEntries, fetchAllTags, fetchAllStores } from './api/directory';
import { DirectoryHero } from './components/DirectoryHero';
import { FilterPanel } from './components/FilterPanel';
import { ResultsSection } from './components/ResultsSection';
import { BookingOverlay } from './components/BookingOverlay';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useDirectoryFilters } from './hooks/useDirectoryFilters';
import type { DirectoryEntryType, DirectoryListingEntry, TagEntry, StoreEntry } from './types/contentful';
import styles from './App.module.css';

const DEV_NAV_DIRECTORIES = [
  { label: 'FASHION', slug: 'fashion-services' },
  { label: 'BEAUTY', slug: 'beauty-services' },
];

const DEFAULT_SLUG = DEV_NAV_DIRECTORIES[0].slug;

function slugFromPathname(pathname: string): string {
  const clean = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const match = DEV_NAV_DIRECTORIES.find((d) => d.slug === clean);
  return match ? match.slug : DEFAULT_SLUG;
}

function DevDirectoryNav({
  currentSlug,
  onSelect,
}: {
  currentSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <nav className={styles.devNav}>
      <button
        type="button"
        className={styles.burgerMenuToggle}
        onClick={() => burgerMenuToggle()}
      >☰</button>
      <a href="https://www.davidjones.com/services/store-services"
        className={`${styles.devNavItemActive} ${styles.servicesLink}`}
        >DJs AT YOUR SERVICE</a>
      <div className={styles.burgerMe}>
        {DEV_NAV_DIRECTORIES.map((d) => (
          <a
            key={d.slug}
            href={`/${d.slug}`}
            className={`${d.slug === currentSlug ? styles.devNavItemActive : styles.devNavItem} resetButton`}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              onSelect(d.slug);
            }}
          >
            {d.label}
          </a>
        ))}
        <a href="https://www.davidjones.com/services/book-a-bra-fitting"
          className={styles.devNavItem}
          >BOOK A BRA FITTING</a>
        <a href="https://www.davidjones.com/services/health-and-wellbeing"
          className={styles.devNavItem}
          >HEALTH &amp; WELLBEING</a>
        <a href="https://www.davidjones.com/services/store-services/gifts"
          className={styles.devNavItem}
          >GIFTING</a>
      </div>
    </nav>
  );
}

function App() {
  const [directorySlug, setDirectorySlug] = useState(() =>
    typeof window === 'undefined' ? DEFAULT_SLUG : slugFromPathname(window.location.pathname)
  );
  const [directory, setDirectory] = useState<DirectoryEntryType | null>(null);
  const [entries, setEntries] = useState<DirectoryListingEntry[]>([]);
  const [allTags, setAllTags] = useState<TagEntry[]>([]);
  const [allStores, setAllStores] = useState<StoreEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    function handlePopState() {
      setDirectorySlug(slugFromPathname(window.location.pathname));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const dir = await fetchDirectoryBySlug(directorySlug);
        if (!dir) {
          if (!cancelled) setError(`No directory found for slug "${directorySlug}".`);
          return;
        }
        const [fetchedEntries, fetchedTags, fetchedStores] = await Promise.all([
          fetchDirectoryEntries(dir.sys.id),
          fetchAllTags(),
          fetchAllStores(),
        ]);
        if (cancelled) return;
        setDirectory(dir);
        setEntries(fetchedEntries);
        setAllTags(fetchedTags);
        setAllStores(fetchedStores);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [directorySlug, retryCount]);

  function navigateToDirectory(slug: string) {
    if (slug === directorySlug) return;
    window.history.pushState(null, '', `/${slug}`);
    setDirectorySlug(slug);
  }

  const nav = <DevDirectoryNav currentSlug={directorySlug} onSelect={navigateToDirectory} />;

  if (error) {
    return (
      <>
        <div className={styles.page}>
          {nav}
          <ErrorState message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        </div>
        <BookingOverlay />
      </>
    );
  }

  if (isLoading || !directory) {
    return (
      <>
        <div className={styles.page}>
          {nav}
          <LoadingState />
        </div>
        <BookingOverlay />
      </>
    );
  }

  return (
    <>
      <ErrorBoundary>
        <DirectoryPage
          key={directory.sys.id}
          directory={directory}
          entries={entries}
          allTags={allTags}
          allStores={allStores}
          nav={nav}
        />
      </ErrorBoundary>
      <BookingOverlay />
    </>
  );
}

function DirectoryPage({
  directory,
  entries,
  allTags,
  allStores,
  nav,
}: {
  directory: DirectoryEntryType;
  entries: DirectoryListingEntry[];
  allTags: TagEntry[];
  allStores: StoreEntry[];
  nav: ReactNode;
}) {
  const filters = useDirectoryFilters(directory, allTags, allStores, entries);
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [filters.displayedEntries]);

  return (
    <>
      <DirectoryHero directory={directory} />
      {/* 🎉 Look who made it down the runway below the Hero! */}
      {nav}
      <div className={styles.page}>
        <button
          type="button"
          className={`${styles.mobileFilterToggle} resetButton`}
          onClick={() => setMobileFiltersOpen(true)}
        >
          <span>☰</span> Filter Services
        </button>

        <div className={styles.layout}>
          <aside className={isMobileFiltersOpen ? styles.sidebarOpen : styles.sidebar}>
            <button
              type="button"
              className={`${styles.mobileCloseButton} resetButton`}
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
            >
              ×
            </button>
            <FilterPanel directory={directory} filters={filters} />
          </aside>

          {isMobileFiltersOpen && (
            <div className={styles.sidebarBackdrop} onClick={() => setMobileFiltersOpen(false)} />
          )}

          <main className={styles.results}>
            <ResultsSection directory={directory} entries={filters.displayedEntries} filters={filters} />
          </main>
        </div>
      </div>
    </>
  );
}

export default App;