// 视频质量存根 - 精简版不启用
export function buildResolutionFilterFromSearchParams(params: URLSearchParams): any {
  return {};
}

export function filterSearchResultsByResolution(results: any[], filter: any): any[] {
  return results;
}

export function decorateSearchResultQuality(result: any, remarks?: string, className?: string): any {
  return result;
}

export function getResolutionLevel(resolution: string): number {
  return 0;
}
