// 跳过控制器存根 - 精简版不启用
'use client';

interface SkipControllerProps {
  source: string;
  id: string;
  title: string;
  doubanId?: number;
  year?: string;
  episodeIndex?: number;
  artPlayerRef?: any;
  currentTime: number;
  duration: number;
  isSettingMode?: boolean;
  onSettingModeChange?: (value: boolean) => void;
  onNextEpisode?: () => void;
  onSeek?: (time: number) => void;
}

export default function SkipController(props: SkipControllerProps) {
  return null;
}

export function SkipSettingsButton({ onClick }: { onClick?: () => void }) {
  return null;
}
