export const ASPECT_RATIO_OPTIONS = ['4:3', '1:1', '3:4', '16:9'] as const;
export type AspectRatioOption = (typeof ASPECT_RATIO_OPTIONS)[number];

export type CardSpan = 1 | 2 | 'full';

interface CardImageDimensions {
  cssAspectRatio: string;
  fetchWidth: number;
  fetchHeight: number;
}

const BASE_WIDTH = 600;
// Featured/fullWidth cards always use a plain 4:3 box, independent of
// whatever aspect ratio the directory configures for normal cards — this
// matches how Beauty already looked and behaved before per-directory
// ratios were introduced.
const SPANNING_RATIO = { w: 4, h: 3 };

export function getCardImageDimensions(
  value: string | undefined,
  span: CardSpan
): CardImageDimensions {
  if (span === 1) {
    const [wStr, hStr] = (value ?? '4:3').split(':');
    const w = Number(wStr) || 4;
    const h = Number(hStr) || 3;
    return {
      cssAspectRatio: `${w} / ${h}`,
      fetchWidth: BASE_WIDTH,
      fetchHeight: Math.round((BASE_WIDTH * h) / w),
    };
  }

  const { w, h } = SPANNING_RATIO;
  const fetchWidth = span === 'full' ? BASE_WIDTH * 3 : BASE_WIDTH * 2;

  return {
    cssAspectRatio: `${w} / ${h}`,
    fetchWidth,
    fetchHeight: Math.round((fetchWidth * h) / w),
  };
}