// 图片缓存存根 - 精简版不启用
'use client';

export const loadedImageUrls = new Set<string>();

export function addLoadedImageUrl(url: string) {
  loadedImageUrls.add(url);
}

export function isImageLoaded(url: string): boolean {
  return loadedImageUrls.has(url);
}
