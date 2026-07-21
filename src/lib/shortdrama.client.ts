// 短剧客户端存根 - 精简版不启用
'use client';

export interface ShortDramaItem {
  id: number;
  name: string;
  cover: string;
  update_time: string;
  score: number;
  episode_count: number;
}

export async function getRecommendedShortDramas(category?: string, size?: number): Promise<ShortDramaItem[]> {
  return [];
}

export async function getShortDramaCategories(): Promise<any[]> {
  return [];
}

export async function getShortDramaList(categoryId: number, page: number): Promise<any> {
  return { list: [], total: 0 };
}
