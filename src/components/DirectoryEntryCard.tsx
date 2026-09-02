import { useState } from 'react';
import { sanitizeHtml } from '../lib/html';
import type { DirectoryEntryType, DirectoryListingEntry } from '../types/contentful';
import { resolvePrimaryCta, resolveSecondaryCta } from '../lib/booking';
import { useBookingOverlay } from '../context/BookingOverlayContext';
import { mergeStoreAvailability } from '../lib/stores';
import { useDirectoryFilters } from '../hooks/useDirectoryFilters';
import { getCardImageDimensions, type CardSpan } from '../lib/images';
import { getAssetUrl } from '../lib/assets';
import styles from './DirectoryEntryCard.module.css';

interface DirectoryEntryCardProps {
  entry: DirectoryListingEntry;
  directory: DirectoryEntryType;
  filters: ReturnType<typeof useDirectoryFilters>;
}

function buildImageUrl(rawFileUrl: string, fetchWidth: number, fetchHeight: number): string {
  const url = rawFileUrl.startsWith('//') ? `https:${rawFileUrl}` : rawFileUrl;
  return `${url}?fit=fill&w=${fetchWidth}&h=${fetchHeight}&q=75&fm=webp`;
}

function categoryLabel(entry: DirectoryListingEntry): string {
  return (entry.fields.tags ?? [])
    .filter((tag) => !tag.fields.parent)
    .map((tag) => tag.fields.label)
    .join(', ');
}

function titleLine(entry: DirectoryListingEntry) {
  const brand = entry.fields.brand?.fields.brandName;
  return (
    <>
      {brand && <span className={styles.brandName}>{brand} </span>}
      {entry.fields.title ?? ''}
    </>
  );
}

export function DirectoryEntryCard({ entry, directory, filters }: DirectoryEntryCardProps) {
  const { fields } = entry;
  const primaryCta = resolvePrimaryCta(fields);
  const secondaryCta = resolveSecondaryCta(fields);
  const { openBooking } = useBookingOverlay();
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const showTitles = directory.fields.showTitles !== false;
  const isShortcut = Boolean(fields.shortcutTarget);

  const span: CardSpan = fields.fullWidth ? 'full' : fields.featured ? 2 : 1;
  const { cssAspectRatio, fetchWidth, fetchHeight } = getCardImageDimensions(
    directory.fields.imageAspectRatio,
    span
  );
  const normalizedAssetUrl = getAssetUrl(fields.image);
  const imageUrl = buildImageUrl(normalizedAssetUrl, fetchWidth, fetchHeight);
  const imageWrapStyle = { aspectRatio: cssAspectRatio };

  const mergedStores = mergeStoreAvailability(fields);
  const hasOverride = Boolean(fields.storeListOverride);
  const storesLabel = fields.storeListOverride || 'Available Stores';
  const hasInstoreOnlyStore = mergedStores.some((s) => !s.bookable);

  const showStoresBlock = isShortcut ? hasOverride : hasOverride || mergedStores.length > 0;

  const cardClassName = [
    styles.card,
    fields.featured && styles.featured,
    fields.fullWidth && styles.fullWidth,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClassName}
      onMouseMove={(e) => {
        if (e.movementX !== 0 || e.movementY !== 0) {
          setOverlayVisible(true);
        }
      }}
      onMouseLeave={() => setOverlayVisible(false)}
    >
      <div className={styles.tileWrap}
          onClick={() => setOverlayVisible((v) => !v)}
          role="button"
          tabIndex={0}
        >

        <div className={styles.imageWrap} style={imageWrapStyle}>
          <img
            src={imageUrl}
            alt={fields.image.fields.description ?? fields.title ?? ''}
            className={styles.image}
            loading="lazy"
          />
          {fields.dinkus && <span className={styles.dinkus}>{fields.dinkus}</span>}

        </div>

        <p className={styles.category}>{categoryLabel(entry)}</p>
        {showTitles && <h3 className={styles.title}>{titleLine(entry)}</h3>}

        <div className={isOverlayVisible ? styles.overlayOpen : styles.overlay}>

          <div className={styles.overlayFrame}>

            {fields.description && <p className={styles.overlayDescription}>{fields.description}</p>}


            <div className={styles.overlayMeta}>
              {fields.durationDisplay && <span className={styles.durationDisplay}>{fields.durationDisplay}</span>}
              {fields.durationDisplay && fields.priceDisplay && <span className={styles.metaDivider}>|</span>}
              {fields.priceDisplay && (
                <span
                  className={styles.priceDisplay}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(fields.priceDisplay) }}
                />
              )}
            </div>

            {showStoresBlock && (
              <div className={styles.storesBlock}>
                <p className={styles.storesLabel}>{storesLabel}</p>
                {!hasOverride && !isShortcut && (
                  <>
                    <p className={styles.storesList}>
                      {mergedStores
                        .map((s) => `${s.store.fields.name}${s.bookable ? '' : '*'}`)
                        .join(', ')}
                    </p>
                    {hasInstoreOnlyStore && (
                      <p className={styles.storesFootnote}>
                        *Visit brand counter instore to book
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

          </div>

          {isShortcut ? (
            <button
              type="button"
              className={`${styles.shortcutCta} resetButton`}
              onClick={() => filters.selectShortcutTag(fields.shortcutTarget!.sys.id)}
            >
              {fields.ctaText || 'View Services'}
            </button>
          ) : (
            <>
              {primaryCta && (
                primaryCta.openInNewTab ? (
                  <a href={primaryCta.url} className={styles.primaryCta} target="_blank" rel="noopener noreferrer">
                    {primaryCta.text}
                  </a>
                ) : (
                  <button type="button" className={`${styles.primaryCta} resetButton`} onClick={() => openBooking(primaryCta.url)}>
                    {primaryCta.text}
                  </button>
                )
              )}
              {secondaryCta && (
                <a href={secondaryCta.url} className={styles.secondaryCta}
                  target={secondaryCta.openInNewTab ? '_blank' : undefined}
                  rel={secondaryCta.openInNewTab ? 'noopener noreferrer' : undefined}
                >
                  {secondaryCta.text}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}