import { useState } from 'react';
import type { DirectoryEntryType, FilterCheckboxEntry } from '../types/contentful';
import { useDirectoryFilters } from '../hooks/useDirectoryFilters';
import { filterValidCheckboxes, isTopLevelCheckbox, sortCheckboxesForDisplay } from '../lib/filters';
import { groupStoresByState } from '../lib/stores';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  directory: DirectoryEntryType;
  filters: ReturnType<typeof useDirectoryFilters>;
}

function checkboxLabel(checkbox: FilterCheckboxEntry): string {
  return checkbox.sys.contentType.sys.id === 'tag'
    ? checkbox.fields.label
    : checkbox.fields.brandName;
}

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <section className={styles.section}>
      <button
        type="button"
        className={`${styles.sectionHeader} resetButton`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className={styles.sectionTitle}>{title}</span>
        <span className={isOpen ? styles.chevronOpen : styles.chevron}>›</span>
      </button>
      <div className={isOpen ? styles.sectionBodyOpen : styles.sectionBodyClosed}>
        <div className={styles.sectionBodyInner}>{children}</div>
      </div>
    </section>
  );
}

export function FilterPanel({ directory, filters }: FilterPanelProps) {
  const {
    filterSlots,
    availableIdsBySlot,
    allStores,
    availableStoreIds,
    selectedStoreIds,
    tagTree,
    hasActiveFilters,
    showPopular,
    popularEnabled,
    toggleSlotOption,
    toggleStore,
    clearAllFilters,
    showPopularServices,
  } = filters;

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['filter-0']));

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const slotTitles = [directory.fields.filter1Title, directory.fields.filter2Title, directory.fields.filter3Title];
  const groupedStores = groupStoresByState(allStores.map((store) => ({ store, bookable: true })));

  const lhColumnIconUrl = directory.fields.lhColumnIcon?.fields.file?.url;

  return (
    <nav className={styles.panel} aria-label="Filter services">
      {directory.fields.lhColumnTitle && (
        <div className={styles.columnHeader}>
          {lhColumnIconUrl && (
            <img
              src={lhColumnIconUrl.startsWith('//') ? `https:${lhColumnIconUrl}` : lhColumnIconUrl}
              alt=""
              className={styles.columnIcon}
            />
          )}
          <h2 className={styles.columnTitle}>{directory.fields.lhColumnTitle}</h2>
        </div>
      )}

      {filterSlots.map((slot, i) => {
        const valid = filterValidCheckboxes(slot.checkboxes);
        if (valid.length === 0) return null;

        const topLevel = sortCheckboxesForDisplay(valid.filter(isTopLevelCheckbox));
        const available = availableIdsBySlot[i];
        const key = `filter-${i}`;

        return (
          <AccordionSection
            key={key}
            title={slotTitles[i] ?? ''}
            isOpen={openSections.has(key)}
            onToggle={() => toggleSection(key)}
          >
            <ul className={styles.optionList}>
              {topLevel.map((checkbox) => {
                const isSelected = slot.selectedIds.includes(checkbox.sys.id);
                const isAvailable = available.has(checkbox.sys.id);
                const isTag = checkbox.sys.contentType.sys.id === 'tag';
                // Children were previously rendered in whatever order the
                // API happened to return them — now sorted the same way
                // as every other checkbox list, so Priority actually
                // takes effect for subcategories too.
                const children = isTag
                  ? sortCheckboxesForDisplay(tagTree.childrenOf.get(checkbox.sys.id) ?? [])
                  : [];

                return (
                  <li key={checkbox.sys.id}>
                    <label className={isAvailable ? styles.option : styles.optionDisabled}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isAvailable && !isSelected}
                        onChange={() => toggleSlotOption(i as 0 | 1 | 2, checkbox.sys.id)}
                      />
                      {checkboxLabel(checkbox)}
                    </label>

                    {children.length > 0 && (
                      <div className={isSelected ? styles.childListOpen : styles.childListClosed}>
                        <ul className={styles.childListInner}>
                          {children.map((child) => {
                            const childSelected = slot.selectedIds.includes(child.sys.id);
                            const childAvailable = available.has(child.sys.id);
                            return (
                              <li key={child.sys.id}>
                                <label className={childAvailable ? styles.option : styles.optionDisabled}>
                                  <input
                                    type="checkbox"
                                    checked={childSelected}
                                    disabled={!childAvailable && !childSelected}
                                    onChange={() => toggleSlotOption(i as 0 | 1 | 2, child.sys.id)}
                                  />
                                  {child.fields.label}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </AccordionSection>
        );
      })}

      <AccordionSection
        title="Store"
        isOpen={openSections.has('store')}
        onToggle={() => toggleSection('store')}
      >
        {Array.from(groupedStores.entries()).map(([state, storesInState]) => (
          <div key={state} className={styles.stateGroup}>
            <h4 className={styles.stateLabel}>{state}</h4>
            <ul className={styles.optionList}>
              {storesInState.map(({ store }) => {
                const isSelected = selectedStoreIds.includes(store.sys.id);
                const isAvailable = availableStoreIds.has(store.sys.id);
                return (
                  <li key={store.sys.id}>
                    <label className={isAvailable ? styles.option : styles.optionDisabled}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isAvailable && !isSelected}
                        onChange={() => toggleStore(store.sys.id)}
                      />
                      {store.fields.name}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </AccordionSection>

      <div className={styles.actions}>
        {showPopular && (
          <button type="button" className={`${styles.actionLink} resetButton`} onClick={clearAllFilters}>
            Show All
          </button>
        )}
        {hasActiveFilters && (
          <button type="button" className={`${styles.actionLink} resetButton`} onClick={clearAllFilters}>
            × Clear all
          </button>
        )}
        {popularEnabled && !showPopular && (
          <button type="button" className={`${styles.actionLink} resetButton`} onClick={showPopularServices}>
            View Popular Services
          </button>
        )}
      </div>
    </nav>
  );
}