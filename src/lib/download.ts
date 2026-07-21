// 下载库存根 - 精简版不启用
export function normalizeDownloadSource(source: string): { sourceUrl: string; referer: string; origin: string } {
  return { sourceUrl: source, referer: '', origin: '' };
}

export function getDownloadUrl(source: string, id: string, episode: number): string {
  return '';
}
