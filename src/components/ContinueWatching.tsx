/* eslint-disable no-console */
'use client';

import { Clock, Trash2 } from 'lucide-react';
import { useEffect, useState, memo } from 'react';

import type { PlayRecord } from '@/lib/db.client';
import { useClearPlayRecordsMutation } from '@/hooks/usePlayRecordsMutations';
import { useContinueWatchingQuery } from '@/hooks/useContinueWatchingQueries';

import ScrollableRow from '@/components/ScrollableRow';
import SectionTitle from '@/components/SectionTitle';
import VideoCard from '@/components/VideoCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ContinueWatchingProps {
  className?: string;
}

function ContinueWatching({ className }: ContinueWatchingProps) {
  const [requireClearConfirmation, setRequireClearConfirmation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: playRecords = [], isLoading: loading } = useContinueWatchingQuery();
  const clearPlayRecordsMutation = useClearPlayRecordsMutation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRequireClearConfirmation = localStorage.getItem('requireClearConfirmation');
      if (savedRequireClearConfirmation !== null) {
        setRequireClearConfirmation(JSON.parse(savedRequireClearConfirmation));
      }
    }
  }, []);

  const handleClearPlayRecords = () => {
    if (requireClearConfirmation) {
      setShowConfirmDialog(true);
    } else {
      clearPlayRecordsMutation.mutate();
    }
  };

  const handleConfirmClear = () => {
    clearPlayRecordsMutation.mutate();
    setShowConfirmDialog(false);
  };

  if (loading) {
    return (
      <div className={className}>
        <SectionTitle icon={Clock} title='继续观看' />
        <div className='flex gap-4 overflow-hidden'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0'>
              <div className='aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' />
              <div className='mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (playRecords.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className='flex items-center justify-between mb-4'>
        <SectionTitle icon={Clock} title='继续观看' />
        <button
          onClick={handleClearPlayRecords}
          disabled={clearPlayRecordsMutation.isPending}
          className='flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
        >
          <Trash2 className='w-4 h-4' />
          <span>清空</span>
        </button>
      </div>

      <ScrollableRow>
        {playRecords.map((record: PlayRecord & { key: string }) => (
          <div key={record.key} className='w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0'>
            <VideoCard
              title={record.title}
              poster={record.cover}
              year={record.year}
              source={record.source_name}
              episodes={record.total_episodes || 1}
              from='playrecord'
              progress={record.total_time > 0 ? Math.round((record.play_time / record.total_time) * 100) : 0}
            />
          </div>
        ))}
      </ScrollableRow>

      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title='清空播放记录'
          message='确定要清空所有播放记录吗？此操作不可撤销。'
          onConfirm={handleConfirmClear}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
}

export default memo(ContinueWatching);
