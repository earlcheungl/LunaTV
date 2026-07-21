/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { UpdateStatus } from '@/lib/version_check';

interface VersionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  updateStatus: UpdateStatus;
  latestVersion?: string;
}

export function VersionPanel({ isOpen, onClose, currentVersion, updateStatus, latestVersion }: VersionPanelProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold'>版本信息</h2>
          <button onClick={onClose} className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500'>当前版本</span>
            <span className='font-mono'>v{currentVersion}</span>
          </div>

          {updateStatus === UpdateStatus.HAS_UPDATE && latestVersion && (
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-500'>最新版本</span>
              <span className='font-mono text-green-500'>v{latestVersion}</span>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500'>状态</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              updateStatus === UpdateStatus.HAS_UPDATE
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                : updateStatus === UpdateStatus.NO_UPDATE
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}>
              {updateStatus === UpdateStatus.HAS_UPDATE ? '有更新' : updateStatus === UpdateStatus.NO_UPDATE ? '已是最新' : '检查失败'}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
