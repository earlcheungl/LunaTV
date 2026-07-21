// 移动端 ActionSheet 存根 - 精简版不启用
'use client';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  poster?: string;
  actions?: any[];
  sources?: string[];
  isAggregate?: boolean;
  sourceName?: string;
  currentEpisode?: number;
  totalEpisodes?: number;
  origin?: string;
  doubanId?: number;
  videoTitle?: string;
  videoYear?: string;
  isBangumi?: boolean;
}

export default function MobileActionSheet(props: MobileActionSheetProps) {
  if (!props.isOpen) return null;
  return null;
}
