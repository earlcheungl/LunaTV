export interface AdminConfig {
  ConfigSubscribtion: {
    URL: string;
    AutoUpdate: boolean;
    LastCheck: string;
  };
  ConfigFile: string;
  SiteConfig: {
    SiteName: string;
    Announcement: string;
    SearchDownstreamMaxPage: number;
    SiteInterfaceCacheTime: number;
    DoubanProxyType: string;
    DoubanProxy: string;
    DoubanImageProxyType: string;
    DoubanImageProxy: string;
    DisableYellowFilter: boolean;
    ShowAdultContent: boolean;
    FluidSearch: boolean;
    EnableWebLive?: boolean;
    ServerProxyUrl?: string;
    // 默认用户组
    DefaultUserTags?: string[];
  };
  UserConfig: {
    AllowRegister?: boolean;
    Users: {
      username: string;
      role: 'user' | 'admin' | 'owner';
      banned?: boolean;
      enabledApis?: string[];
      tags?: string[];
      createdAt?: number;
      showAdultContent?: boolean;
    }[];
    Tags?: {
      name: string;
      enabledApis: string[];
      showAdultContent?: boolean;
    }[];
  };
  SourceConfig: {
    key: string;
    name: string;
    api: string;
    detail?: string;
    from: 'config' | 'custom';
    disabled?: boolean;
    is_adult?: boolean;
    weight?: number;
  }[];
  CustomCategories: {
    name?: string;
    type: 'movie' | 'tv';
    query: string;
    from: 'config' | 'custom';
    disabled?: boolean;
  }[];
}

export interface AdminConfigResult {
  Config: AdminConfig;
  Role: 'owner' | 'admin';
}

export const DEFAULT_CRON_CONFIG = {
  enableAutoRefresh: true,
  maxRecordsPerRun: 100,
  onlyRefreshRecent: true,
  recentDays: 30,
  onlyRefreshOngoing: true,
};
