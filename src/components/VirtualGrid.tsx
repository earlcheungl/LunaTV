// VirtualGrid 存根 - 精简版不启用虚拟化
'use client';

import React from 'react';

interface VirtualGridProps<T> {
  items: T[];
  className?: string;
  rowGapClass?: string;
  estimateRowHeight?: number;
  endReached?: () => void;
  endReachedThreshold?: number;
  restoreKey?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export default function VirtualGrid<T>({
  items,
  className = '',
  renderItem,
}: VirtualGridProps<T>) {
  return (
    <div className={`grid ${className}`}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}
