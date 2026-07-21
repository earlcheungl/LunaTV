// 弹幕手动匹配模态框存根 - 精简版不启用
'use client';

export interface DanmuManualSelection {
  id: string;
  title: string;
  episodes: number;
  animeId: number;
  episodeId: number;
}

interface DanmuManualMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (selection: DanmuManualSelection) => void;
  onApply?: (selection: any) => Promise<void>;
  title?: string;
  defaultKeyword?: string;
  currentEpisode?: number;
  portalContainer?: HTMLElement;
}

export default function DanmuManualMatchModal(props: DanmuManualMatchModalProps) {
  if (!props.isOpen) return null;
  return null;
}
