// 搜索缓存存根 - 精简版不启用
export async function getCachedSearchPage(key: string, query?: string, page?: number): Promise<any> {
  return null;
}

export async function setCachedSearchPage(key: string, queryOrData: any, pageOrTtl?: number | string, status?: string, data?: any[], pageCount?: number): Promise<void> {
  // 存根实现
}

export async function clearSearchCache(): Promise<void> {
  // 存根实现
}
