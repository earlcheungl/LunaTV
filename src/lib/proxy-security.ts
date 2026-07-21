// 代理安全存根 - 精简版不启用
export function validateProxyTargetUrl(url: string): boolean {
  return true;
}

export function isAllowedProxyHost(host: string): boolean {
  return true;
}
