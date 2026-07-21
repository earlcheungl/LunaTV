import { AdminConfig } from './admin.types';

// 播放记录数据结构
export interface PlayRecord {
  title: string;
  source_name: string;
  cover: string;
  year: string;
  index: number;
  total_episodes: number;
  original_episodes?: number;
  play_time: number;
  total_time: number;
  save_time: number;
  search_title: string;
  remarks?: string;
  douban_id?: number;
  type?: string;
}

// 收藏数据结构
export interface Favorite {
  source_name: string;
  total_episodes: number;
  title: string;
  year: string;
  cover: string;
  save_time: number;
  search_title: string;
  origin?: 'vod' | 'live';
  type?: string;
}

// 提醒数据结构
export interface Reminder {
  source_name: string;
  total_episodes: number;
  title: string;
  year: string;
  cover: string;
  save_time: number;
  search_title: string;
  origin?: 'vod' | 'live';
  type?: string;
  releaseDate?: string;
  remarks?: string;
}

// 崩溃日志数据结构
export interface CrashLog {
  timestamp: string;
  message: string;
  stack?: string;
  digest?: string;
  url: string;
  userAgent: string;
  memory: any;
  localStorage: string;
  type?: 'PAGE_ERROR' | 'GLOBAL_ERROR';
  serverReceivedAt?: string;
}

// 存储接口
export interface IStorage {
  // 播放记录相关
  getPlayRecord(userName: string, key: string): Promise<PlayRecord | null>;
  setPlayRecord(
    userName: string,
    key: string,
    record: PlayRecord
  ): Promise<void>;
  getAllPlayRecords(userName: string): Promise<{ [key: string]: PlayRecord }>;
  deletePlayRecord(userName: string, key: string): Promise<void>;
  setPlayRecordsBatch?(
    userName: string,
    records: { [key: string]: PlayRecord }
  ): Promise<void>;

  // 收藏相关
  getFavorite(userName: string, key: string): Promise<Favorite | null>;
  setFavorite(userName: string, key: string, favorite: Favorite): Promise<void>;
  getAllFavorites(userName: string): Promise<{ [key: string]: Favorite }>;
  deleteFavorite(userName: string, key: string): Promise<void>;
  setFavoritesBatch?(
    userName: string,
    favorites: { [key: string]: Favorite }
  ): Promise<void>;

  // 提醒相关
  getReminder(userName: string, key: string): Promise<Reminder | null>;
  setReminder(userName: string, key: string, reminder: Reminder): Promise<void>;
  getAllReminders(userName: string): Promise<{ [key: string]: Reminder }>;
  deleteReminder(userName: string, key: string): Promise<void>;

  // 用户相关
  registerUser(userName: string, password: string): Promise<void>;
  verifyUser(userName: string, password: string): Promise<boolean>;
  checkUserExist(userName: string): Promise<boolean>;
  changePassword(userName: string, newPassword: string): Promise<void>;
  deleteUser(userName: string): Promise<void>;

  // 搜索历史相关
  getSearchHistory(userName: string): Promise<string[]>;
  addSearchHistory(userName: string, keyword: string): Promise<void>;
  deleteSearchHistory(userName: string, keyword?: string): Promise<void>;

  // 用户列表
  getAllUsers(): Promise<string[]>;

  // 管理员配置相关
  getAdminConfig(): Promise<AdminConfig | null>;
  setAdminConfig(config: AdminConfig): Promise<void>;

  // 跳过片头片尾配置相关
  getSkipConfig(
    userName: string,
    source: string,
    id: string
  ): Promise<EpisodeSkipConfig | null>;
  setSkipConfig(
    userName: string,
    source: string,
    id: string,
    config: EpisodeSkipConfig
  ): Promise<void>;
  deleteSkipConfig(userName: string, source: string, id: string): Promise<void>;
  getAllSkipConfigs(userName: string): Promise<{ [key: string]: EpisodeSkipConfig }>;

  // 数据清理相关
  clearAllData(): Promise<void>;

  // 通用缓存相关
  getCache(key: string): Promise<any | null>;
  setCache(key: string, data: any, expireSeconds?: number): Promise<void>;
  deleteCache(key: string): Promise<void>;
  clearExpiredCache(prefix?: string): Promise<void>;

  // 崩溃日志相关
  saveCrashLog(crashLog: any): Promise<void>;
  getCrashLogs(limit?: number): Promise<any[]>;
  deleteCrashLog(timestamp: string): Promise<void>;
  clearCrashLogs(): Promise<void>;
}

// 搜索结果数据结构
export interface SearchResult {
  id: string;
  title: string;
  poster: string;
  episodes: string[];
  episodes_titles: string[];
  source: string;
  source_name: string;
  class?: string;
  year: string;
  desc?: string;
  type_name?: string;
  douban_id?: number;
  remarks?: string;
  resolution?: string;
  resolution_level?: number;
  quality_tag?: string;
  drama_name?: string;
}

// 豆瓣数据结构
export interface DoubanItem {
  id: string;
  title: string;
  poster: string;
  rate: string;
  year: string;
  directors?: string[];
  screenwriters?: string[];
  cast?: string[];
  genres?: string[];
  countries?: string[];
  languages?: string[];
  episodes?: number;
  episode_length?: number;
  movie_duration?: number;
  first_aired?: string;
  plot_summary?: string;
  backdrop?: string;
  trailerUrl?: string;
}

export interface DoubanResult {
  code: number;
  message: string;
  list: DoubanItem[];
}

// 豆瓣短评数据结构
export interface DoubanComment {
  username: string;
  user_id: string;
  avatar: string;
  rating: number;
  time: string;
  location: string;
  content: string;
  useful_count: number;
}

export interface DoubanCommentsResult {
  code: number;
  message: string;
  data?: {
    comments: DoubanComment[];
    start: number;
    limit: number;
    count: number;
  };
}

// ---- 跳过配置（多片段支持）----

export interface SkipSegment {
  start: number;
  end: number;
  type: 'opening' | 'ending';
  title?: string;
  autoSkip?: boolean;
  autoNextEpisode?: boolean;
  mode?: 'absolute' | 'remaining';
  remainingTime?: number;
}

export interface EpisodeSkipConfig {
  source: string;
  id: string;
  title: string;
  segments: SkipSegment[];
  updated_time: number;
}

// 用户播放统计数据结构
export interface UserPlayStat {
  username: string;
  totalWatchTime: number;
  totalPlays: number;
  lastPlayTime: number;
  recentRecords: PlayRecord[];
  avgWatchTime: number;
  mostWatchedSource: string;
  registrationDays?: number;
  loginDays?: number;
  firstLoginTime?: number;
}

// 内容播放统计数据结构
export interface ContentStat {
  key: string;
  title: string;
  cover: string;
  source: string;
  totalPlays: number;
  totalWatchTime: number;
  lastPlayTime: number;
  uniqueUsers: number;
  avgRating?: number;
}

// 播放统计结果
export interface PlayStatsResult {
  totalUsers: number;
  activeUsers: number | { daily: number; weekly: number; monthly: number };
  totalPlays: number;
  totalWatchTime: number;
  avgWatchTimePerUser: number;
  avgPlaysPerUser: number;
  topContent: ContentStat[];
  topUsers: UserPlayStat[];
  recentActivity: PlayRecord[];
  dailyStats?: { date: string; plays: number; watchTime: number }[];
}

// 短剧列表项数据结构
export interface ShortDramaItem {
  id: number;
  name: string;
  cover: string;
  update_time: string;
  score: number;
  episode_count: number;
  description?: string;
  author?: string;
  backdrop?: string;
  vote_average?: number;
  tmdb_id?: number;
}
