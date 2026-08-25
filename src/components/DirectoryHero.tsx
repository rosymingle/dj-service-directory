import type { DirectoryEntryType } from '../types/contentful';
import type { Asset } from 'contentful';
import styles from './DirectoryHero.module.css';

interface DirectoryHeroProps {
  directory: DirectoryEntryType;
}

const MOBILE_BREAKPOINT = '(max-width: 600px)';

function assetUrl(asset: Asset): string {
  const rawUrl = asset.fields.file?.url ?? '';
  return rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;
}

function isVideoAsset(asset: Asset): boolean {
  return Boolean(asset.fields.file?.contentType?.startsWith('video/'));
}

// Renders the hero image(s) as a single <picture> so the browser only
// ever downloads the asset it actually needs for the current viewport,
// rather than loading both and hiding one with CSS.
function HeroPicture({
  desktop,
  mobile,
  className,
}: {
  desktop?: Asset;
  mobile?: Asset;
  className: string;
}) {
  // Fall back to whichever single image exists if only one was set, so a
  // directory with just one hero image still shows it at every breakpoint.
  const fallback = desktop ?? mobile;
  if (!fallback) return null;

  return (
    <picture>
      {mobile && <source media={MOBILE_BREAKPOINT} srcSet={assetUrl(mobile)} />}
      <img className={className} src={assetUrl(desktop ?? mobile!)} alt="" />
    </picture>
  );
}

// Video has no <picture> equivalent, so desktop/mobile video variants are
// still handled as two elements toggled via CSS media queries.
function HeroVideo({ asset, className }: { asset: Asset; className: string }) {
  return <video className={className} src={assetUrl(asset)} autoPlay muted loop playsInline />;
}

export function DirectoryHero({ directory }: DirectoryHeroProps) {
  const { heroImageDe, heroImageMo, intro, title } = directory.fields;

  if (!heroImageDe && !heroImageMo && !intro) return null;

  const hasMedia = Boolean(heroImageDe || heroImageMo);

  const desktopIsVideo = heroImageDe && isVideoAsset(heroImageDe);
  const mobileIsVideo = heroImageMo && isVideoAsset(heroImageMo);
  const anyVideo = desktopIsVideo || mobileIsVideo;

  return (
    <div className={hasMedia ? styles.heroWithMedia : styles.heroPlain}>
      {anyVideo ? (
        <>
          {heroImageDe && (
            <HeroVideo
              asset={heroImageDe}
              className={mobileIsVideo || !heroImageMo ? styles.mediaBoth : styles.desktopOnly}
            />
          )}
          {heroImageMo && heroImageMo !== heroImageDe && (
            <HeroVideo asset={heroImageMo} className={styles.mobileOnly} />
          )}
        </>
      ) : (
        <HeroPicture desktop={heroImageDe} mobile={heroImageMo} className={styles.mediaBoth} />
      )}

      {hasMedia && <div className={styles.scrim} />}

      {intro && (
        <div className={styles.introWrap}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.intro}>{intro}</p>
        </div>
      )}
    </div>
  );
}