// 豆瓣反爬存根 - 精简版不启用
export async function fetchDoubanWithVerification(_url: string, _options?: any): Promise<any> {
  throw new Error('豆瓣反爬功能已禁用');
}
