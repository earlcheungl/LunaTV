/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

import { fetchDoubanData } from './douban';
import { DoubanItem, DoubanResult } from './types';

interface DoubanCategoryApiResponse {
  total: number;
  items: Array<{
    id: string;
    title: string;
    card_subtitle: string;
    pic: {
      large: string;
      normal: string;
    };
    rating: {
      value: number;
    };
  }>;
}

export async function getDoubanCategories(params: {
  kind: string;
  category: string;
  type: string;
  limit?: number;
  start?: number;
}): Promise<DoubanResult> {
  const { kind, category, type, limit = 20, start = 0 } = params;

  try {
    const url = `https://m.douban.com/rexxar/api/v2/${kind}_${category}?type=${type}&start=${start}&count=${limit}`;

    const data = await fetchDoubanData<DoubanCategoryApiResponse>(url);

    const items: DoubanItem[] = data.items.map((item) => ({
      id: item.id,
      title: item.title,
      poster: item.pic.large || item.pic.normal,
      rate: item.rating?.value?.toString() || '0',
      year: item.card_subtitle.split('/')[0]?.trim() || '',
    }));

    return {
      code: 200,
      message: 'success',
      list: items,
    };
  } catch (error) {
    console.error('获取豆瓣分类数据失败:', error);
    return {
      code: 500,
      message: 'error',
      list: [],
    };
  }
}
