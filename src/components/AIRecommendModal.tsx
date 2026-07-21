// AI 推荐弹窗存根 - 精简版不启用
'use client';

interface AIRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: any;
  welcomeMessage?: string;
}

export default function AIRecommendModal({ isOpen, onClose }: AIRecommendModalProps) {
  if (!isOpen) return null;
  return null;
}
