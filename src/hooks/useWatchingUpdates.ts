'use client';

/**
 * 追番更新检查的 TanStack Query Hook
 *
 * 功能：
 * - 自动检查用户观看过的剧集是否有新集数更新
 * - 使用 TanStack Query 管理数据获取和缓存
 * - 替代 watching-updates.ts 的手动缓存实现
 *
 * 工作原理：
 * 1. 获取所有播放记录
 * 2. 获取数据源映射表
 * 3. 并发检查每个剧集的最新集数
 * 4. 对比原始集数，判断是否有更新
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlayRecordsArrayQuery } from './usePlayRecordsQuery';
import { useSourceMapQuery } from './useSourcesQuery';
import type { PlayRecord } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface WatchingUpdate {
  hasUpdates: boolean;
  timestamp: number;
  updatedCount: number;
  continueWatchingCount: number;
  newReleasesCount: number;
  updatedSeries: {
    title: string;
    source_name: string;
    year: string;
    cover: string;
    sourceKey: string;
    videoId: string;
    currentEpisode: number;
    totalEpisodes: number;
    hasNewEpisode: boolean;
    hasContinueWatching: boolean;
    hasNewRelease: boolean;
    newEpisodes?: number;
    remainingEpisodes?: number;
    latestEpisodes?: number;
    remarks?: string;
    releaseDate?: string;
  }[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 获取观看时的原始总集数，如果没有记录则使用当前播放记录中的集数
 * 关键修复：对于旧数据，同步修复original_episodes，避免被后续更新覆盖
 */
async function getOriginalEpisodes(record: PlayRecord & { key: string }, videoId: string, recordKey: string): Promise<number> {
  // 添加详细调试信息
  console.log(`🔍 getOriginalEpisodes 调试信息 - ${record.title}:`, {
    'record.original_episodes': record.original_episodes,
    'record.total_episodes': record.total_episodes,
    '类型检查': typeof record.original_episodes,
    '完整记录': record
  });

  // 🔑 关键修复：不信任内存中的 original_episodes（可能来自缓存）
  // 始终从数据库重新读取最新的 original_episodes
  try {
    console.log(`🔍 从数据库读取最新的原始集数: ${record.title}`);
    const freshRecordsResponse = await fetch('/api/playrecords');
    if (freshRecordsResponse.ok) {
      const freshRecords = await freshRecordsResponse.json();
      const freshRecord = freshRecords[recordKey];

      if (freshRecord?.original_episodes && freshRecord.original_episodes > 0) {
        console.log(`📚 从数据库读取到最新原始集数: ${record.title} = ${freshRecord.original_episodes}集 (当前播放记录: ${record.total_episodes}集)`);
        return freshRecord.original_episodes;
      }
    }
  } catch (error) {
    console.warn(`⚠️ 从数据库读取原始集数失败: ${record.title}，使用内存值`, error);
  }

  // 备用方案：如果数据库读取失败，使用内存中的值
  if (record.original_episodes && record.original_episodes > 0) {
    console.log(`📚 使用内存中的原始集数: ${record.title} = ${record.original_episodes}集 (当前播放记录: ${record.total_episodes}集)`);
    return record.original_episodes;
  }

  // 🔑 如果数据库中也没有 original_episodes，使用当前 total_episodes
  // 但不要写回数据库！只返回值，让首次保存时自然设置
  if ((record.original_episodes === undefined || record.original_episodes === null) && record.total_episodes > 0) {
    console.log(`⚠️ ${record.title} 缺少原始集数，使用当前值 ${record.total_episodes}集（不写入数据库）`);
    return record.total_episodes;
  }

  // 都没有的话，使用当前播放记录集数（最后的fallback）
  console.log(`⚠️ 该剧集未找到原始集数记录，使用当前播放记录集数: ${record.title} = ${record.total_episodes}集`);
  return record.total_episodes;
}

/**
 * 检查单个剧集的更新状态
 */
async function checkSingleRecordUpdate(
  record: PlayRecord & { key: string },
  videoId: string,
  sourceKey: string,
): Promise<{
  hasUpdate: boolean;
  hasNewEpisode: boolean;
  hasContinueWatching: boolean;
  hasNewRelease: boolean;
  newEpisodes: number;
  remainingEpisodes: number;
  latestEpisodes: number;
}> {
  try {
    // 调用 API 获取最新详情（绕过缓存，确保获取最新集数）
    // 添加时间戳参数绕过 CDN 缓存
    const apiUrl = `/api/detail?source=${sourceKey}&id=${videoId}&_t=${Date.now()}`;
    console.log(`${record.title} 调用API获取最新详情:`, apiUrl);
    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`获取${record.title}详情失败:`, response.status);
      return {
        hasUpdate: false,
        hasNewEpisode: false,
        hasContinueWatching: false,
        hasNewRelease: false,
        newEpisodes: 0,
        remainingEpisodes: 0,
        latestEpisodes: record.total_episodes,
      };
    }

    const detailData = await response.json();
    // 从 episodes 数组长度获取最新集数（API 返回的是 episodes 数组，不是 total 字段）
    const latestEpisodes = detailData.episodes ? detailData.episodes.length : 0;

    // 添加详细调试信息
    console.log(`${record.title} API检查详情:`, {
      'API返回集数': latestEpisodes,
      '当前观看到': record.index,
      '播放记录集数': record.total_episodes
    });

    // 获取观看时的原始总集数（不会被自动更新影响）
    const recordKey = record.key;
    const originalTotalEpisodes = await getOriginalEpisodes(record, videoId, recordKey);

    console.log(`${record.title} 集数对比:`, {
      '原始集数': originalTotalEpisodes,
      '当前播放记录集数': record.total_episodes,
      'API返回集数': latestEpisodes
    });

    // 检查两种情况：
    // 1. 新集数更新：API返回的集数比观看时的原始集数多
    // 只需要比较原始集数，因为播放记录会被自动更新，不能作为判断依据
    const hasUpdate = latestEpisodes > originalTotalEpisodes;
    const newEpisodes = hasUpdate ? latestEpisodes - originalTotalEpisodes : 0;

    // 计算保护后的集数（防止API缓存问题导致集数回退）
    const protectedTotalEpisodes = Math.max(latestEpisodes, originalTotalEpisodes, record.total_episodes);

    // 2. 继续观看提醒：用户还没看完现有集数（使用保护后的集数）
    const hasContinueWatching = record.index < protectedTotalEpisodes;
    const remainingEpisodes = hasContinueWatching ? protectedTotalEpisodes - record.index : 0;

    // 检查是否为新上映（原始集数为0或很少，现在有集数了）
    const hasNewRelease = originalTotalEpisodes <= 1 && latestEpisodes > 1;

    // 如果API返回的集数少于原始记录的集数，说明可能是API缓存问题
    if (latestEpisodes < originalTotalEpisodes) {
      console.warn(`${record.title} API返回集数(${latestEpisodes})少于原始记录(${originalTotalEpisodes})，可能是API缓存问题`);
    }

    if (hasUpdate) {
      console.log(`${record.title} 发现新集数: ${originalTotalEpisodes} -> ${latestEpisodes} 集，新增${newEpisodes}集`);

      if (latestEpisodes > record.total_episodes) {
        console.log(`📊 检测到集数差异: ${record.title} 播放记录${record.total_episodes}集 < API最新${latestEpisodes}集`);
        console.log(`✅ 已记录新集数信息，等待用户实际观看时自动同步`);
      }
    }

    if (hasContinueWatching) {
      console.log(`${record.title} 继续观看提醒: 当前第${record.index}集，共${protectedTotalEpisodes}集，还有${remainingEpisodes}集未看`);
    }

    // 输出详细的检测结果
    console.log(`${record.title} 最终检测结果:`, {
      hasUpdate,
      hasContinueWatching,
      newEpisodes,
      remainingEpisodes,
      '原始集数': originalTotalEpisodes,
      '当前播放记录集数': record.total_episodes,
      'API返回集数': latestEpisodes,
      '保护后集数': protectedTotalEpisodes,
      '当前观看到': record.index
    });

    return {
      hasUpdate,
      hasNewEpisode: hasUpdate,
      hasContinueWatching,
      hasNewRelease,
      newEpisodes,
      remainingEpisodes,
      latestEpisodes: protectedTotalEpisodes,
    };
  } catch (error) {
    console.error(`检查${record.title}更新失败:`, error);
    return {
      hasUpdate: false,
      hasNewEpisode: false,
      hasContinueWatching: false,
      hasNewRelease: false,
      newEpisodes: 0,
      remainingEpisodes: 0,
      latestEpisodes: record.total_episodes,
    };
  }
}

// ============================================================================
// Hook: 检查追番更新
// ============================================================================

/**
 * 检查追番更新
 *
 * @example
 * ```tsx
 * function UserMenu() {
 *   const { data: updates, isLoading } = useWatchingUpdatesQuery({
 *     enabled: isOpen && authInfo?.username,
 *   });
 *
 *   if (updates?.hasUpdates) {
 *     return <div>{updates.updatedCount}部有新集</div>;
 *   }
 * }
 * ```
 */
export function useWatchingUpdatesQuery(options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
}) {
  const queryClient = useQueryClient();

  // 获取播放记录
  const { data: playRecordsArray } = usePlayRecordsArrayQuery({
    enabled: options?.enabled,
  });

  // 获取数据源映射
  const { data: sourceMap } = useSourceMapQuery({
    enabled: options?.enabled,
  });

  return useQuery({
    queryKey: ['watchingUpdates', options?.forceRefresh ? Date.now() : 'cached'] as const,
    queryFn: async (): Promise<WatchingUpdate> => {
      console.log('🔄 [追番更新] 开始检查追番更新...');

      if (!playRecordsArray || playRecordsArray.length === 0) {
        console.log('⚠️ [追番更新] 无播放记录，跳过检查');
        return {
          hasUpdates: false,
          timestamp: Date.now(),
          updatedCount: 0,
          continueWatchingCount: 0,
          newReleasesCount: 0,
          updatedSeries: [],
        };
      }

      console.log(`📋 [追番更新] 找到 ${playRecordsArray.length} 条播放记录`);

      // 筛选候选记录（观看时间超过2分钟，且不是电影）
      const candidateRecords = playRecordsArray.filter((record) => {
        // 必须有观看时间
        if (record.play_time < 120) return false;

        // 排除电影（单集内容）
        if (record.total_episodes <= 1) return false;

        return true;
      });

      console.log(`🎯 [追番更新] 筛选出 ${candidateRecords.length} 个可能有更新的剧集`);

      if (candidateRecords.length === 0) {
        console.log('⚠️ [追番更新] 无符合条件的剧集，跳过检查');
        return {
          hasUpdates: false,
          timestamp: Date.now(),
          updatedCount: 0,
          continueWatchingCount: 0,
          newReleasesCount: 0,
          updatedSeries: [],
        };
      }

      let updatedCount = 0;
      let continueWatchingCount = 0;
      let newReleasesCount = 0;
      const updatedSeries: WatchingUpdate['updatedSeries'] = [];

      // 并发检查所有记录的更新状态
      const updatePromises = candidateRecords.map(async (record) => {
        try {
          // 从存储key中解析出videoId
          const [sourceName, videoId] = record.key.split('+');

          // 映射数据源名称到 key
          let sourceKey = sourceName;
          if (sourceMap) {
            const mappedSource = sourceMap.get(sourceName);
            if (mappedSource) {
              sourceKey = mappedSource;
              console.log(`映射数据源: ${sourceName} -> ${sourceKey}`);
            } else {
              console.warn(`找不到数据源 ${sourceName} 的映射，使用原始名称`);
            }
          }

          const updateInfo = await checkSingleRecordUpdate(record, videoId, sourceKey);

          // 使用从 checkSingleRecordUpdate 返回的 protectedTotalEpisodes（已经包含了保护机制）
          const protectedTotalEpisodes = updateInfo.latestEpisodes;

          const seriesInfo = {
            title: record.title,
            source_name: record.source_name,
            year: record.year,
            cover: record.cover,
            sourceKey,
            videoId,
            currentEpisode: record.index,
            totalEpisodes: protectedTotalEpisodes,
            hasNewEpisode: updateInfo.hasNewEpisode,
            hasContinueWatching: updateInfo.hasContinueWatching,
            hasNewRelease: updateInfo.hasNewRelease,
            newEpisodes: updateInfo.newEpisodes,
            remainingEpisodes: updateInfo.remainingEpisodes,
            latestEpisodes: updateInfo.latestEpisodes,
            remarks: record.remarks
          };

          updatedSeries.push(seriesInfo);

          // 统计更新
          if (updateInfo.hasNewEpisode) {
            updatedCount++;
          }
          if (updateInfo.hasContinueWatching) {
            continueWatchingCount++;
            console.log(`${record.title} 计入继续观看计数，当前总数: ${continueWatchingCount}`);
          }
          if (updateInfo.hasNewRelease) {
            newReleasesCount++;
          }

          console.log(`${record.title} 检查结果: hasUpdate=${updateInfo.hasUpdate}, hasContinueWatching=${updateInfo.hasContinueWatching}`);
          return seriesInfo;
        } catch (error) {
          console.error(`检查${record.title}更新失败:`, error);
          // 返回默认状态
          const [sourceName, videoId] = record.key.split('+');
          let sourceKey = sourceName;
          if (sourceMap) {
            const mappedSource = sourceMap.get(sourceName);
            if (mappedSource) {
              sourceKey = mappedSource;
            }
          }
          const seriesInfo = {
            title: record.title,
            source_name: record.source_name,
            year: record.year,
            cover: record.cover,
            sourceKey,
            videoId,
            currentEpisode: record.index,
            totalEpisodes: record.total_episodes,
            hasNewEpisode: false,
            hasContinueWatching: false,
            hasNewRelease: false,
            newEpisodes: 0,
            remainingEpisodes: 0,
            latestEpisodes: record.total_episodes,
            remarks: record.remarks
          };
          updatedSeries.push(seriesInfo);
          return seriesInfo;
        }
      });

      // 等待所有检查完成
      await Promise.all(updatePromises);

      const hasUpdates = updatedCount > 0 || continueWatchingCount > 0 || newReleasesCount > 0;

      console.log(`检查完成: ${hasUpdates ? `发现${newReleasesCount}部新上映，${updatedCount}部剧集有新集数更新，${continueWatchingCount}部剧集需要继续观看` : '暂无更新'}`);

      return {
        hasUpdates,
        timestamp: Date.now(),
        updatedCount,
        continueWatchingCount,
        newReleasesCount,
        updatedSeries,
      };
    },
    // 30分钟缓存，避免频繁检查
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    // 只在有播放记录和数据源映射时才执行
    enabled: options?.enabled && !!playRecordsArray && !!sourceMap,
    // 不自动重试，避免过多请求
    retry: false,
  });
}

/**
 * 手动触发追番更新检查
 */
export function useRefreshWatchingUpdates() {
  const queryClient = useQueryClient();

  return () => {
    // 强制刷新播放记录（type: 'all' 确保即使 inactive 也会刷新）
    queryClient.invalidateQueries({
      queryKey: ['playRecords'],
      refetchType: 'all'
    });
    // 强制刷新追番更新（type: 'all' 确保即使 inactive 也会刷新）
    queryClient.invalidateQueries({
      queryKey: ['watchingUpdates'],
      refetchType: 'all'
    });
  };
}
