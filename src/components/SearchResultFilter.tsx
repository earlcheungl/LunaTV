// 搜索结果筛选存根 - 精简版不启用
'use client';

export type SearchFilterCategory = string | {
  key: string;
  label: string;
  options: { label: string; value: string }[];
};

interface SearchResultFilterProps {
  activeCategory?: SearchFilterCategory;
  categories?: SearchFilterCategory[];
  values?: any;
  onChange?: (category: any) => void;
  onCategoryChange?: (category: SearchFilterCategory) => void;
}

export default function SearchResultFilter(props: SearchResultFilterProps) {
  return null;
}
