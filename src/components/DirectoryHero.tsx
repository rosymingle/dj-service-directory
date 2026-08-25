import type { AssetEntry, DirectoryEntryType } from '../types/contentful';
import { getAssetUrl, isVideoAsset } from '../lib/assets';
import styles from './DirectoryHero.module.css';

interface DirectoryHeroProps {
  directory: DirectoryEntryType;
}

const MOBILE_BREAKPOINT = '(max-width: 600px)';

function HeroPicture({
  desktop,
  mobile,
  className,
}: {
  desktop?: AssetEntry;
  mobile?: AssetEntry;
  className: string;
}) {
  const fallback = desktop ?? mobile;
  if (!fallback) return null;

  return (
    <picture>
      {mobile && <source media={MOBILE_BREAKPOINT} srcSet={getAssetUrl(mobile)} />}
      <img className={className} src={getAssetUrl(desktop ?? mobile)} alt="" />
    </picture>
  );
}

function HeroVideo({ asset, className }: { asset: AssetEntry; className: string }) {
  return <video className={className} src={getAssetUrl(asset)} autoPlay muted loop playsInline />;
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