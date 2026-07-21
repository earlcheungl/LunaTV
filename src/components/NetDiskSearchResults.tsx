// 网盘搜索结果存根 - 精简版不启用
'use client';

interface NetDiskSearchResultsProps {
  query?: string;
  onClose?: () => void;
  results?: { [key: string]: any[] };
  loading?: boolean;
  error?: string;
  total?: number;
}

export default function NetDiskSearchResults(props: NetDiskSearchResultsProps) {
  return null;
}
