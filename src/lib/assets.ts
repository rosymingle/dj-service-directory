import type { AssetEntry } from '../types/contentful';

export function getAssetUrl(asset: AssetEntry | undefined): string {
  const rawUrl = asset?.fields.file?.url ?? '';
  return rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;
}

export function isVideoAsset(asset: AssetEntry | undefined): boolean {
  return Boolean(asset?.fields.file?.contentType?.startsWith('video/'));
}