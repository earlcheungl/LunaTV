// 可滚动行存根 - 精简版不启用
'use client';

interface ScrollableRowProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollableRow({ children, className }: ScrollableRowProps) {
  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className || ''}`}>
      {children}
    </div>
  );
}
