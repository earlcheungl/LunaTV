/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  Check,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface SettingsPanelProps {
  onClose: () => void;
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  try { return JSON.parse(v) as T; } catch { return v as unknown as T; }
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [theme, setTheme] = useState(() => readLS('theme', 'system'));
  const [doubanProxyType, setDoubanProxyType] = useState(() => {
    if (typeof window !== 'undefined') {
      return (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY_TYPE || 'direct';
    }
    return 'direct';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold'>设置</h2>
          <button onClick={onClose} className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-6'>
          {/* Theme */}
          <div>
            <label className='block text-sm font-medium mb-2'>主题</label>
            <div className='flex gap-2'>
              {[
                { value: 'light', label: '浅色' },
                { value: 'dark', label: '深色' },
                { value: 'system', label: '跟随系统' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Douban Proxy */}
          <div>
            <label className='block text-sm font-medium mb-2'>豆瓣代理</label>
            <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm'>
              {doubanProxyType === 'direct' ? '直连' : doubanProxyType}
            </div>
          </div>

          {/* Info */}
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            <p>更多设置请访问管理面板</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
