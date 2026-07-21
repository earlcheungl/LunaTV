/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, no-console */

'use client';

import { ChevronRight, Film, Tv } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useQuery, queryOptions } from '@tanstack/react-query';

import { DoubanItem } from '@/lib/types';
import { getDoubanDetails, getDoubanRecommends } from '@/lib/douban.client';
import { getAuthInfoFromBrowserCookie } from '@/lib/auth';

import { CinematicLoadingFallback } from '@/components/CinematicLoadingFallback';
import { useFavoritesQuery } from '@/hooks/useFavoritesQuery';
import { usePlayRecordsQuery } from '@/hooks/usePlayRecordsQuery';
import { useHomePageQueries } from '@/hooks/useHomePageQueries';

import CapsuleSwitch from '@/components/CapsuleSwitch';
import ContinueWatching from '@/components/ContinueWatching';
import PageLayout from '@/components/PageLayout';
import SectionTitle from '@/components/SectionTitle';
import SkeletonCard from '@/components/SkeletonCard';
import { useSite } from '@/components/SiteProvider';
import VideoCard from '@/components/VideoCard';

// Query Options 工厂函数
const hotMoviesOptions = () => queryOptions({
  queryKey: ['douban', 'hot-movies'],
  queryFn: async () => {
    const result = await getDoubanRecommends({
      kind: 'movie',
      pageLimit: 20,
      pageStart: 0,
      category: '',
      format: '',
      region: '',
      year: '',
      platform: '',
      sort: '',
      label: '',
    });
    return result.list || [];
  },
  staleTime: 2 * 60 * 60 * 1000,
  retry: 1,
});

const hotTvShowsOptions = () => queryOptions({
  queryKey: ['douban', 'hot-tv'],
  queryFn: async () => {
    const result = await getDoubanRecommends({
      kind: 'tv',
      pageLimit: 20,
      pageStart: 0,
      category: '',
      format: '',
      region: '',
      year: '',
      platform: '',
      sort: '',
      label: '',
    });
    return result.list || [];
  },
  staleTime: 2 * 60 * 60 * 1000,
  retry: 1,
});

export default function HomeClient() {
  const { siteName } = useSite();
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'favorites'>('home');

  const { data: hotMovies = [] } = useQuery(hotMoviesOptions());
  const { data: hotTvShows = [] } = useQuery(hotTvShowsOptions());
  const { data: favoritesData } = useFavoritesQuery({ enabled: !!authInfo?.username });
  const { data: playRecordsData } = usePlayRecordsQuery({ enabled: !!authInfo?.username });

  useEffect(() => {
    const auth = getAuthInfoFromBrowserCookie();
    if (auth) {
      setAuthInfo(auth);
    }
  }, []);

  const favorites = favoritesData ? Object.entries(favoritesData as Record<string, any>).sort(([, a], [, b]) => (b as any).save_time - (a as any).save_time) : [];
  const playRecords = playRecordsData ? Object.entries(playRecordsData as Record<string, any>).sort(([, a], [, b]) => (b as any).save_time - (a as any).save_time).slice(0, 10) : [];

  return (
    <PageLayout>

      {/* Tabs */}
      <div className='flex items-center gap-2 mb-6'>
        <CapsuleSwitch
          options={[
            { value: 'home', label: '首页' },
            { value: 'favorites', label: '收藏' },
          ]}
          active={activeTab}
          onChange={(value) => setActiveTab(value as any)}
        />
      </div>

      {activeTab === 'home' ? (
        <>
          {/* Continue Watching */}
          {playRecords.length > 0 && (
            <section className='mb-8'>
              <ContinueWatching />
            </section>
          )}

          {/* Hot Movies */}
          <section className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <SectionTitle
                icon={Film}
                title='热门电影'
              />
              <Link href='/douban?type=movie' className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'>
                更多 <ChevronRight className='w-4 h-4' />
              </Link>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
              {hotMovies.length > 0 ? (
                hotMovies.map((item: DoubanItem) => (
                  <VideoCard key={item.id} {...item} from='douban' />
                ))
              ) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              )}
            </div>
          </section>

          {/* Hot TV Shows */}
          <section className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <SectionTitle
                icon={Tv}
                title='热门剧集'
              />
              <Link href='/douban?type=tv' className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'>
                更多 <ChevronRight className='w-4 h-4' />
              </Link>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
              {hotTvShows.length > 0 ? (
                hotTvShows.map((item: DoubanItem) => (
                  <VideoCard key={item.id} {...item} from='douban' />
                ))
              ) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        /* Favorites */
        <section className='mb-8'>
          <SectionTitle
            icon={Film}
            title='我的收藏'
          />
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
            {favorites.length > 0 ? (
              favorites.map(([key, fav]) => (
                <VideoCard key={key} {...(fav as any)} />
              ))
            ) : (
              <div className='col-span-full text-center text-gray-500 py-8'>
                暂无收藏
              </div>
            )}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
