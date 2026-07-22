/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-non-null-assertion */

import { unstable_noStore } from 'next/cache';

import { db } from '@/lib/db';

import { AdminConfig } from './admin.types';
import { DEFAULT_USER_AGENT } from './user-agent';

export interface ApiSite {
  key: string;
  api: string;
  name: string;
  detail?: string;
}

interface ConfigFileStruct {
  cache_time?: number;
  api_site?: {
    [key: string]: ApiSite;
  };
  custom_category?: {
    name?: string;
    type: 'movie' | 'tv';
    query: string;
  }[];
}

export const API_CONFIG = {
  search: {
    path: '?ac=videolist&wd=',
    pagePath: '?ac=videolist&wd={query}&pg={page}',
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Accept: 'application/json',
    },
  },
  detail: {
    path: '?ac=videolist&ids=',
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Accept: 'application/json',
    },
  },
};

let cachedConfig: AdminConfig;

export function refineConfig(adminConfig: AdminConfig): AdminConfig {
  let fileConfig: ConfigFileStruct;
  try {
    fileConfig = JSON.parse(adminConfig.ConfigFile) as ConfigFileStruct;
  } catch (e) {
    fileConfig = {} as ConfigFileStruct;
  }

  const apiSitesFromFile = Object.entries(fileConfig.api_site || []);
  const currentApiSites = new Map(
    (adminConfig.SourceConfig || []).map((s) => [s.key, s])
  );
  const apiKeysInFile = new Set(apiSitesFromFile.map(([key]) => key));

  currentApiSites.forEach((source, key) => {
    if (source.from === 'config' && !apiKeysInFile.has(key)) {
      currentApiSites.delete(key);
    }
  });

  apiSitesFromFile.forEach(([key, site]) => {
    const existingSource = currentApiSites.get(key);
    if (existingSource) {
      existingSource.name = site.name;
      existingSource.api = site.api;
      existingSource.detail = site.detail;
    } else {
      currentApiSites.set(key, {
        key,
        name: site.name,
        api: site.api,
        detail: site.detail,
        from: 'config',
        disabled: false,
      });
    }
  });

  adminConfig.SourceConfig = Array.from(currentApiSites.values());

  const customCategoriesFromFile = fileConfig.custom_category || [];
  const currentCustomCategories = new Map(
    (adminConfig.CustomCategories || []).map((c) => [c.query + c.type, c])
  );
  const categoryKeysInFile = new Set(customCategoriesFromFile.map((c) => c.query + c.type));

  currentCustomCategories.forEach((category, key) => {
    if (category.from === 'config' && !categoryKeysInFile.has(key)) {
      currentCustomCategories.delete(key);
    }
  });

  customCategoriesFromFile.forEach((category) => {
    const key = category.query + category.type;
    const existedCategory = currentCustomCategories.get(key);
    if (existedCategory) {
      existedCategory.name = category.name;
      existedCategory.query = category.query;
      existedCategory.type = category.type;
    } else {
      currentCustomCategories.set(key, {
        name: category.name,
        type: category.type,
        query: category.query,
        from: 'config',
        disabled: false,
      });
    }
  });

  adminConfig.CustomCategories = Array.from(currentCustomCategories.values());

  return adminConfig;
}

async function getInitConfig(configFile: string): Promise<AdminConfig> {
  let cfgFile: ConfigFileStruct;
  try {
    cfgFile = JSON.parse(configFile) as ConfigFileStruct;
  } catch (e) {
    cfgFile = {} as ConfigFileStruct;
  }
  const adminConfig: AdminConfig = {
    ConfigFile: configFile,
    ConfigSubscribtion: { URL: '', AutoUpdate: false, LastCheck: '' },
    SiteConfig: {
      SiteName: process.env.NEXT_PUBLIC_SITE_NAME || 'MoonTV',
      Announcement:
        process.env.ANNOUNCEMENT ||
        '本网站仅提供影视信息搜索服务，所有内容均来自第三方网站。本站不存储任何视频资源，不对任何内容的准确性、合法性、完整性负责。',
      SearchDownstreamMaxPage:
        Number(process.env.NEXT_PUBLIC_SEARCH_MAX_PAGE) || 5,
      SiteInterfaceCacheTime: cfgFile.cache_time || 7200,
      DoubanProxyType:
        process.env.NEXT_PUBLIC_DOUBAN_PROXY_TYPE || 'direct',
      DoubanProxy: process.env.NEXT_PUBLIC_DOUBAN_PROXY || '',
      DoubanImageProxyType:
        process.env.NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE || 'server',
      DoubanImageProxy: process.env.NEXT_PUBLIC_DOUBAN_IMAGE_PROXY || '',
      DisableYellowFilter:
        process.env.NEXT_PUBLIC_DISABLE_YELLOW_FILTER === 'true',
      ShowAdultContent: false,
      FluidSearch:
        process.env.NEXT_PUBLIC_FLUID_SEARCH !== 'false',
    },
    UserConfig: {
      AllowRegister: true,
      Users: [],
    },
    SourceConfig: [],
    CustomCategories: [],
  };

  let userNames: string[] = [];
  try {
    userNames = await db.getAllUsers();
  } catch (e) {
    console.error('获取用户列表失败:', e);
  }
  const allUsers = userNames.filter((u) => u !== process.env.USERNAME).map((u) => ({
    username: u,
    role: 'user',
    banned: false,
  }));
  allUsers.unshift({
    username: process.env.USERNAME!,
    role: 'owner',
    banned: false,
  });
  adminConfig.UserConfig.Users = allUsers as any;

  Object.entries(cfgFile.api_site || []).forEach(([key, site]) => {
    adminConfig.SourceConfig.push({
      key: key,
      name: site.name,
      api: site.api,
      detail: site.detail,
      from: 'config',
      disabled: false,
    });
  });

  cfgFile.custom_category?.forEach((category) => {
    adminConfig.CustomCategories.push({
      name: category.name || category.query,
      type: category.type,
      query: category.query,
      from: 'config',
      disabled: false,
    });
  });

  return adminConfig;
}

export async function getConfig(): Promise<AdminConfig> {
  unstable_noStore();

  let adminConfig: AdminConfig | null = null;
  try {
    adminConfig = await db.getAdminConfig();
  } catch (e) {
    console.error('获取管理员配置失败:', e);
  }

  if (!adminConfig) {
    adminConfig = await getInitConfig("");
  }
  adminConfig = await configSelfCheck(adminConfig);

  cachedConfig = adminConfig;

  return adminConfig;
}

export function clearConfigCache(): void {
  cachedConfig = null as any;
}

export async function configSelfCheck(adminConfig: AdminConfig): Promise<AdminConfig> {
  if (!adminConfig.UserConfig) {
    adminConfig.UserConfig = { AllowRegister: true, Users: [] };
  }
  if (!adminConfig.UserConfig.Users || !Array.isArray(adminConfig.UserConfig.Users)) {
    adminConfig.UserConfig.Users = [];
  }

  try {
    const dbUsers = await db.getAllUsers();
    const ownerUser = process.env.USERNAME;

    // 合并数据库用户和配置用户
    const mergedUsers = new Map<string, any>();

    // 先添加配置中的用户
    for (const user of adminConfig.UserConfig.Users || []) {
      mergedUsers.set(user.username, user);
    }

    // 再添加数据库中的用户（如果配置中没有，则添加）
    for (const username of dbUsers) {
      if (!mergedUsers.has(username)) {
        const createdAt = Date.now();
        const role: 'owner' | 'admin' | 'user' = username === ownerUser ? 'owner' : 'user';
        mergedUsers.set(username, {
          username,
          role,
          banned: false,
          createdAt,
        });
      }
    }

    adminConfig.UserConfig.Users = Array.from(mergedUsers.values()) as any;
  } catch (e) {
    console.error('获取最新用户列表失败:', e);
  }

  return adminConfig;
}

// 获取可用的 API 站点
export async function getAvailableApiSites(): Promise<ApiSite[]> {
  const config = await getConfig();
  return config.SourceConfig
    .filter(s => !s.disabled)
    .map(s => ({
      key: s.key,
      api: s.api,
      name: s.name,
      detail: s.detail,
    }));
}

// 获取缓存时间
export async function getCacheTime(): Promise<number> {
  const config = await getConfig();
  return config.SiteConfig.SiteInterfaceCacheTime || 7200;
}

// 设置缓存的配置
export function setCachedConfig(config: AdminConfig): void {
  cachedConfig = config;
}

// 重置配置
export async function resetConfig(): Promise<void> {
  const defaultConfig = await getInitConfig("");
  await db.saveAdminConfig(defaultConfig);
  cachedConfig = defaultConfig;
}
