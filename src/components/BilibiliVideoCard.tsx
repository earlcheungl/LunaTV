// Bilibili 视频卡片存根 - 精简版不启用
'use client';

interface BilibiliVideoCardProps {
  bvid?: string;
  title?: string;
  pic?: string;
  owner?: {
    mid: string;
    name: string;
    face: string;
  };
  stat?: {
    view: number;
    danmaku: number;
  };
  video?: any;
  key?: any;
}

export default function BilibiliVideoCard(props: BilibiliVideoCardProps) {
  return null;
}
