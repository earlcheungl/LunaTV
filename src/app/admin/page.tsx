/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

'use client';

import {
  Settings,
  Users,
  Video,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  Loader2,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Link,
  FileJson,
  Tag,
  UserCog,
  Filter,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminConfig, AdminConfigResult } from '@/lib/admin.types';

import PageLayout from '@/components/PageLayout';

export default function AdminPage() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [role, setRole] = useState<'owner' | 'admin' | null>(null);
  const [expandedTabs, setExpandedTabs] = useState<{ [key: string]: boolean }>({
    siteConfig: true,
    userConfig: false,
    sourceConfig: false,
    tagConfig: false,
    categoryConfig: false,
    importExport: false,
  });

  // 新用户表单
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' as 'user' | 'admin' });
  const [showNewUserForm, setShowNewUserForm] = useState(false);

  // 新源表单
  const [newSource, setNewSource] = useState({ key: '', name: '', api: '' });
  const [showNewSourceForm, setShowNewSourceForm] = useState(false);

  // 新分类表单
  const [newCategory, setNewCategory] = useState({ name: '', type: 'movie' as 'movie' | 'tv', query: '' });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  // 新用户组表单
  const [newTag, setNewTag] = useState({ name: '', enabledApis: [] as string[], showAdultContent: false });
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [selectedSourcesForTag, setSelectedSourcesForTag] = useState<string[]>([]);

  // 导入相关
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 视频源分组视图
  const [sourceViewMode, setSourceViewMode] = useState<'list' | 'grouped'>('list');

  const canEdit = role === 'owner' || role === 'admin';
  const hasChanges = config && originalConfig && JSON.stringify(config) !== JSON.stringify(originalConfig);

  // 获取管理员配置
  const fetchConfig = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/config');
      if (!response.ok) {
        const data = (await response.json()) as any;
        throw new Error(data.error || `获取配置失败: ${response.status}`);
      }

      const data = (await response.json()) as AdminConfigResult;
      setConfig(data.Config);
      setOriginalConfig(JSON.parse(JSON.stringify(data.Config)));
      setRole(data.Role);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取配置失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig(true);
  }, [fetchConfig]);

  // 保存配置
  const saveConfig = async () => {
    if (!config || !canEdit) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const data = (await response.json()) as any;
        throw new Error(data.error || '保存失败');
      }

      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setSuccess('配置保存成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存配置失败';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // 放弃修改
  const discardChanges = () => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)));
      setSuccess(null);
      setError(null);
    }
  };

  // 导出配置
  const exportConfig = () => {
    if (!config) return;
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunatv-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess('配置已导出');
    setTimeout(() => setSuccess(null), 3000);
  };

  // 从文件导入配置
  const importFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.SourceConfig && imported.SiteConfig) {
          setConfig(imported);
          setSuccess('配置已导入，请检查后保存');
        } else {
          setError('无效的配置文件格式');
        }
      } catch {
        setError('配置文件解析失败');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 从 URL 导入配置
  const importFromUrl = async () => {
    if (!importUrl) {
      setError('请输入配置 URL');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      const response = await fetch(importUrl);
      if (!response.ok) {
        throw new Error(`获取配置失败: ${response.status}`);
      }

      const imported = await response.json();
      if (imported.SourceConfig && imported.SiteConfig) {
        setConfig(imported);
        setImportUrl('');
        setSuccess('配置已导入，请检查后保存');
      } else {
        setError('无效的配置格式');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '导入失败';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  // 从订阅源导入
  const importFromSubscription = async () => {
    if (!config?.ConfigSubscribtion?.URL) {
      setError('请先配置订阅 URL');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      const response = await fetch(config.ConfigSubscribtion.URL);
      if (!response.ok) {
        throw new Error(`获取订阅失败: ${response.status}`);
      }

      const text = await response.text();
      let imported: any;
      try {
        imported = JSON.parse(text);
      } catch {
        setError('订阅源格式不支持，请使用 JSON 格式');
        return;
      }

      if (imported.SourceConfig && imported.SiteConfig) {
        setConfig(imported);
        setSuccess('从订阅源导入成功，请检查后保存');
      } else if (imported.api_site) {
        const newConfig: AdminConfig = {
          ...config!,
          ConfigFile: text,
          SourceConfig: Object.entries(imported.api_site).map(([key, value]: [string, any]) => ({
            key,
            name: value.name || key,
            api: value.api,
            detail: value.detail || '',
            from: 'config' as const,
            disabled: false,
          })),
        };
        setConfig(newConfig);
        setSuccess('从订阅源导入成功（旧格式已转换），请检查后保存');
      } else {
        setError('订阅源格式无法识别');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '导入失败';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  // 切换标签展开状态
  const toggleTab = (tabKey: string) => {
    setExpandedTabs((prev) => ({ ...prev, [tabKey]: !prev[tabKey] }));
  };

  // 更新站点配置
  const updateSiteConfig = (key: keyof AdminConfig['SiteConfig'], value: any) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      SiteConfig: { ...config.SiteConfig, [key]: value },
    });
  };

  // ========== 用户管理 ==========
  const addUser = () => {
    if (!config || !newUser.username || !canEdit) return;
    if (config.UserConfig.Users.find(u => u.username === newUser.username)) {
      setError('用户名已存在');
      return;
    }
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Users: [...config.UserConfig.Users, { ...newUser, createdAt: Date.now() }],
      },
    });
    setNewUser({ username: '', password: '', role: 'user' });
    setShowNewUserForm(false);
  };

  const deleteUser = (username: string) => {
    if (!config || !canEdit) return;
    if (username === process.env.USERNAME) {
      setError('不能删除站长账号');
      return;
    }
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Users: config.UserConfig.Users.filter(u => u.username !== username),
      },
    });
  };

  const toggleUserBan = (username: string) => {
    if (!config || !canEdit) return;
    if (username === process.env.USERNAME) {
      setError('不能封禁站长账号');
      return;
    }
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Users: config.UserConfig.Users.map(u =>
          u.username === username ? { ...u, banned: !u.banned } : u
        ),
      },
    });
  };

  const toggleUserRole = (username: string) => {
    if (!config || role !== 'owner') return;
    if (username === process.env.USERNAME) {
      setError('不能修改站长角色');
      return;
    }
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Users: config.UserConfig.Users.map(u => {
          if (u.username === username) {
            const newRole = u.role === 'admin' ? 'user' : 'admin';
            return { ...u, role: newRole as 'user' | 'admin' };
          }
          return u;
        }),
      },
    });
  };

  // 更新用户标签
  const updateUserTags = (username: string, tagName: string, add: boolean) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Users: config.UserConfig.Users.map(u => {
          if (u.username === username) {
            const currentTags = u.tags || [];
            const newTags = add
              ? [...currentTags, tagName]
              : currentTags.filter(t => t !== tagName);
            return { ...u, tags: newTags };
          }
          return u;
        }),
      },
    });
  };

  // ========== 用户组管理 ==========
  const addTag = () => {
    if (!config || !newTag.name || !canEdit) return;
    if (config.UserConfig.Tags?.find(t => t.name === newTag.name)) {
      setError('用户组名已存在');
      return;
    }
    const tag = { ...newTag, enabledApis: selectedSourcesForTag };
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Tags: [...(config.UserConfig.Tags || []), tag],
      },
    });
    setNewTag({ name: '', enabledApis: [], showAdultContent: false });
    setSelectedSourcesForTag([]);
    setShowNewTagForm(false);
  };

  const deleteTag = (tagName: string) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Tags: (config.UserConfig.Tags || []).filter(t => t.name !== tagName),
        Users: config.UserConfig.Users.map(u => ({
          ...u,
          tags: (u.tags || []).filter(t => t !== tagName),
        })),
      },
    });
  };

  const updateTagSources = (tagName: string, sourceKeys: string[]) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Tags: (config.UserConfig.Tags || []).map(t =>
          t.name === tagName ? { ...t, enabledApis: sourceKeys } : t
        ),
      },
    });
  };

  const toggleTagAdultContent = (tagName: string) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      UserConfig: {
        ...config.UserConfig,
        Tags: (config.UserConfig.Tags || []).map(t =>
          t.name === tagName ? { ...t, showAdultContent: !t.showAdultContent } : t
        ),
      },
    });
  };

  // 更新默认用户组
  const toggleDefaultTag = (tagName: string) => {
    if (!config || !canEdit) return;
    const currentTags = config.SiteConfig.DefaultUserTags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    setConfig({
      ...config,
      SiteConfig: { ...config.SiteConfig, DefaultUserTags: newTags },
    });
  };

  // ========== 视频源管理 ==========
  const addSource = () => {
    if (!config || !newSource.key || !newSource.name || !newSource.api || !canEdit) return;
    if (config.SourceConfig.find(s => s.key === newSource.key)) {
      setError('源 Key 已存在');
      return;
    }
    setConfig({
      ...config,
      SourceConfig: [...config.SourceConfig, { ...newSource, from: 'custom' }],
    });
    setNewSource({ key: '', name: '', api: '' });
    setShowNewSourceForm(false);
  };

  const deleteSource = (key: string) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      SourceConfig: config.SourceConfig.filter(s => s.key !== key),
    });
  };

  const toggleSourceDisabled = (key: string) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      SourceConfig: config.SourceConfig.map(s =>
        s.key === key ? { ...s, disabled: !s.disabled } : s
      ),
    });
  };

  const toggleSourceAdult = (key: string) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      SourceConfig: config.SourceConfig.map(s =>
        s.key === key ? { ...s, is_adult: !s.is_adult } : s
      ),
    });
  };

  // ========== 分类管理 ==========
  const addCategory = () => {
    if (!config || !newCategory.name || !newCategory.query || !canEdit) return;
    setConfig({
      ...config,
      CustomCategories: [...config.CustomCategories, { ...newCategory, from: 'custom' }],
    });
    setNewCategory({ name: '', type: 'movie', query: '' });
    setShowNewCategoryForm(false);
  };

  const deleteCategory = (index: number) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      CustomCategories: config.CustomCategories.filter((_, i) => i !== index),
    });
  };

  const toggleCategoryDisabled = (index: number) => {
    if (!config || !canEdit) return;
    setConfig({
      ...config,
      CustomCategories: config.CustomCategories.map((c, i) =>
        i === index ? { ...c, disabled: !c.disabled } : c
      ),
    });
  };

  // 按用户组分组视频源
  const getSourcesByTag = (tagName: string) => {
    if (!config) return [];
    const tag = config.UserConfig.Tags?.find(t => t.name === tagName);
    if (!tag) return [];
    return config.SourceConfig.filter(s => tag.enabledApis.includes(s.key));
  };

  // 获取未分组的视频源
  const getUngroupedSources = () => {
    if (!config) return [];
    const allTaggedKeys = new Set(
      (config.UserConfig.Tags || []).flatMap(t => t.enabledApis)
    );
    return config.SourceConfig.filter(s => !allTaggedKeys.has(s.key));
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </PageLayout>
    );
  }

  if (error && !config) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-500">{error}</p>
          <button onClick={() => fetchConfig(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            重试
          </button>
        </div>
      </PageLayout>
    );
  }

  if (!config) return null;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">管理面板</h1>
            <p className="text-sm text-gray-500 mt-1">
              {role === 'owner' ? '站长模式 - 完全权限' : role === 'admin' ? '管理员模式 - 可编辑配置' : '只读模式'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm ${
              role === 'owner' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
              role === 'admin' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {role === 'owner' ? '站长' : role === 'admin' ? '管理员' : '未知'}
            </span>
            {canEdit && hasChanges && (
              <>
                <button onClick={discardChanges} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  放弃修改
                </button>
                <button onClick={saveConfig} disabled={saving} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存配置
                </button>
              </>
            )}
          </div>
        </div>

        {/* 消息提示 */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* 配置导入导出 */}
        <ConfigSection
          title="配置导入/导出"
          icon={<FileJson className="w-5 h-5 text-indigo-500" />}
          expanded={expandedTabs.importExport}
          onToggle={() => toggleTab('importExport')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button onClick={exportConfig} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
                <Download className="w-4 h-4" />
                导出配置到文件
              </button>
              <span className="text-sm text-gray-500">下载当前配置为 JSON 文件</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex items-center gap-4">
              <input type="file" ref={fileInputRef} accept=".json" onChange={importFromFile} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                从文件导入
              </button>
              <span className="text-sm text-gray-500">选择 JSON 配置文件导入</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="输入配置 JSON 的 URL"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <button onClick={importFromUrl} disabled={importing || !importUrl} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                从 URL 导入
              </button>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex items-center gap-4">
              <button
                onClick={importFromSubscription}
                disabled={importing || !config.ConfigSubscribtion?.URL}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                从订阅源导入
              </button>
              <span className="text-sm text-gray-500">
                {config.ConfigSubscribtion?.URL ? `订阅: ${config.ConfigSubscribtion.URL.slice(0, 50)}...` : '未配置订阅 URL'}
              </span>
            </div>
            {canEdit && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">订阅 URL</label>
                <input
                  type="text"
                  value={config.ConfigSubscribtion?.URL || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    ConfigSubscribtion: { ...config.ConfigSubscribtion!, URL: e.target.value },
                  })}
                  placeholder="https://example.com/config.json"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            )}
          </div>
        </ConfigSection>

        {/* 站点配置 */}
        <ConfigSection
          title="站点配置"
          icon={<Settings className="w-5 h-5 text-purple-500" />}
          expanded={expandedTabs.siteConfig}
          onToggle={() => toggleTab('siteConfig')}
        >
          <div className="space-y-4">
            <FormField label="站点名称">
              <input
                type="text"
                value={config.SiteConfig.SiteName}
                onChange={(e) => updateSiteConfig('SiteName', e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50"
              />
            </FormField>
            <FormField label="公告">
              <textarea
                value={config.SiteConfig.Announcement}
                onChange={(e) => updateSiteConfig('Announcement', e.target.value)}
                disabled={!canEdit}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="豆瓣代理类型">
                <select
                  value={config.SiteConfig.DoubanProxyType}
                  onChange={(e) => updateSiteConfig('DoubanProxyType', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50"
                >
                  <option value="direct">直连</option>
                  <option value="cors">CORS 代理</option>
                </select>
              </FormField>
              <FormField label="豆瓣图片代理类型">
                <select
                  value={config.SiteConfig.DoubanImageProxyType}
                  onChange={(e) => updateSiteConfig('DoubanImageProxyType', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50"
                >
                  <option value="server">服务端代理</option>
                  <option value="direct">直连</option>
                </select>
              </FormField>
            </div>
            <div className="flex items-center gap-6">
              <ToggleField
                label="允许注册"
                checked={config.UserConfig.AllowRegister !== false}
                onChange={(v) => setConfig({ ...config, UserConfig: { ...config.UserConfig, AllowRegister: v } })}
                disabled={!canEdit}
              />
              <ToggleField
                label="禁用黄色内容过滤"
                checked={config.SiteConfig.DisableYellowFilter}
                onChange={(v) => updateSiteConfig('DisableYellowFilter', v)}
                disabled={!canEdit}
              />
              <ToggleField
                label="流动搜索"
                checked={config.SiteConfig.FluidSearch}
                onChange={(v) => updateSiteConfig('FluidSearch', v)}
                disabled={!canEdit}
              />
            </div>

            {/* 默认用户组 */}
            {config.UserConfig.Tags && config.UserConfig.Tags.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium mb-3">默认用户组（新注册用户自动加入）</h4>
                <div className="flex flex-wrap gap-2">
                  {config.UserConfig.Tags.map(tag => (
                    <label key={tag.name} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                      <input
                        type="checkbox"
                        checked={config.SiteConfig.DefaultUserTags?.includes(tag.name) || false}
                        onChange={() => canEdit && toggleDefaultTag(tag.name)}
                        disabled={!canEdit}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm">{tag.name}</span>
                      <span className="text-xs text-gray-500">({tag.enabledApis.length} 源)</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ConfigSection>

        {/* 用户管理 */}
        <ConfigSection
          title="用户管理"
          icon={<Users className="w-5 h-5 text-blue-500" />}
          expanded={expandedTabs.userConfig}
          onToggle={() => toggleTab('userConfig')}
          badge={`${config.UserConfig.Users.length} 个用户`}
        >
          <div className="space-y-3">
            {config.UserConfig.Users.map((user) => (
              <div key={user.username} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">
                        {user.role === 'owner' ? '站长' : user.role === 'admin' ? '管理员' : '用户'}
                        {user.banned && <span className="ml-2 text-red-500">(已封禁)</span>}
                      </div>
                    </div>
                  </div>
                  {canEdit && user.username !== process.env.USERNAME && (
                    <div className="flex items-center gap-2">
                      {role === 'owner' && (
                        <button
                          onClick={() => toggleUserRole(user.username)}
                          className="p-2 text-gray-500 hover:text-blue-500"
                          title={user.role === 'admin' ? '降为用户' : '升为管理员'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleUserBan(user.username)}
                        className={`p-2 ${user.banned ? 'text-green-500' : 'text-yellow-500'}`}
                        title={user.banned ? '解封' : '封禁'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="p-2 text-gray-500 hover:text-red-500"
                        title="删除用户"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 用户所属分组 */}
                {config.UserConfig.Tags && config.UserConfig.Tags.length > 0 && user.role === 'user' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500 mb-2">所属分组：</div>
                    <div className="flex flex-wrap gap-1">
                      {config.UserConfig.Tags.map(tag => {
                        const isSelected = (user.tags || []).includes(tag.name);
                        return (
                          <button
                            key={tag.name}
                            onClick={() => canEdit && updateUserTags(user.username, tag.name, !isSelected)}
                            disabled={!canEdit}
                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                              isSelected
                                ? 'bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                                : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400'
                            } ${canEdit ? 'cursor-pointer hover:border-blue-400' : 'cursor-not-allowed opacity-50'}`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {canEdit && (
              <>
                {showNewUserForm ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="用户名"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                      <input
                        type="password"
                        placeholder="密码"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <option value="user">普通用户</option>
                        {role === 'owner' && <option value="admin">管理员</option>}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addUser} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">添加</button>
                      <button onClick={() => setShowNewUserForm(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">取消</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewUserForm(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    添加用户
                  </button>
                )}
              </>
            )}
          </div>
        </ConfigSection>

        {/* 用户组管理 */}
        <ConfigSection
          title="用户组管理"
          icon={<UserCog className="w-5 h-5 text-teal-500" />}
          expanded={expandedTabs.tagConfig}
          onToggle={() => toggleTab('tagConfig')}
          badge={`${config.UserConfig.Tags?.length || 0} 个分组`}
        >
          <div className="space-y-3">
            {(config.UserConfig.Tags || []).map((tag) => (
              <div key={tag.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-teal-500" />
                    <span className="font-medium">{tag.name}</span>
                    <span className="text-sm text-gray-500">({tag.enabledApis.length} 个源)</span>
                    {tag.showAdultContent && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full">
                        包含成人内容
                      </span>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTagAdultContent(tag.name)}
                        className={`px-2 py-1 text-xs rounded ${tag.showAdultContent ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}
                        title="切换成人内容"
                      >
                        {tag.showAdultContent ? '成人' : '普通'}
                      </button>
                      <button
                        onClick={() => deleteTag(tag.name)}
                        className="p-1 text-gray-500 hover:text-red-500"
                        title="删除分组"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {config.SourceConfig.map(source => {
                    const isSelected = tag.enabledApis.includes(source.key);
                    return (
                      <button
                        key={source.key}
                        onClick={() => {
                          if (!canEdit) return;
                          const newKeys = isSelected
                            ? tag.enabledApis.filter(k => k !== source.key)
                            : [...tag.enabledApis, source.key];
                          updateTagSources(tag.name, newKeys);
                        }}
                        disabled={!canEdit}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          isSelected
                            ? 'bg-teal-100 dark:bg-teal-800 border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300'
                            : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400'
                        } ${canEdit ? 'cursor-pointer hover:border-teal-400' : 'cursor-not-allowed opacity-50'}`}
                      >
                        {source.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {canEdit && (
              <>
                {showNewTagForm ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="分组名称"
                        value={newTag.name}
                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                      <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                        <input
                          type="checkbox"
                          checked={newTag.showAdultContent}
                          onChange={(e) => setNewTag({ ...newTag, showAdultContent: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">包含成人内容</span>
                      </label>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">选择可访问的视频源：</div>
                      <div className="flex flex-wrap gap-1">
                        {config.SourceConfig.map(source => (
                          <button
                            key={source.key}
                            onClick={() => {
                              const newKeys = selectedSourcesForTag.includes(source.key)
                                ? selectedSourcesForTag.filter(k => k !== source.key)
                                : [...selectedSourcesForTag, source.key];
                              setSelectedSourcesForTag(newKeys);
                            }}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              selectedSourcesForTag.includes(source.key)
                                ? 'bg-teal-100 dark:bg-teal-800 border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300'
                                : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400'
                            } cursor-pointer hover:border-teal-400`}
                          >
                            {source.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addTag} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">创建分组</button>
                      <button onClick={() => { setShowNewTagForm(false); setSelectedSourcesForTag([]); }} className="px-4 py-2 text-gray-600 dark:text-gray-400">取消</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewTagForm(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-500 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    创建用户组
                  </button>
                )}
              </>
            )}
          </div>
        </ConfigSection>

        {/* 视频源管理 */}
        <ConfigSection
          title="视频源管理"
          icon={<Video className="w-5 h-5 text-green-500" />}
          expanded={expandedTabs.sourceConfig}
          onToggle={() => toggleTab('sourceConfig')}
          badge={`${config.SourceConfig.length} 个源`}
        >
          <div className="space-y-4">
            {/* 视图切换 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSourceViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-lg ${sourceViewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              >
                列表视图
              </button>
              <button
                onClick={() => setSourceViewMode('grouped')}
                className={`px-3 py-1.5 text-sm rounded-lg ${sourceViewMode === 'grouped' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              >
                分组视图
              </button>
            </div>

            {sourceViewMode === 'list' ? (
              // 列表视图
              <div className="space-y-2">
                {config.SourceConfig.map((source) => (
                  <div key={source.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-gray-500 truncate">{source.api}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {source.is_adult && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">成人</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${source.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {source.disabled ? '已禁用' : '已启用'}
                      </span>
                      {canEdit && (
                        <>
                          <button onClick={() => toggleSourceDisabled(source.key)} className="p-1 text-gray-500 hover:text-yellow-500" title={source.disabled ? '启用' : '禁用'}>
                            {source.disabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button onClick={() => toggleSourceAdult(source.key)} className={`p-1 ${source.is_adult ? 'text-red-500' : 'text-gray-500'}`} title="切换成人内容标记">
                            <Filter className="w-4 h-4" />
                          </button>
                          {source.from === 'custom' && (
                            <button onClick={() => deleteSource(source.key)} className="p-1 text-gray-500 hover:text-red-500" title="删除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 分组视图
              <div className="space-y-4">
                {(config.UserConfig.Tags || []).map(tag => (
                  <div key={tag.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-teal-500" />
                      <span className="font-medium">{tag.name}</span>
                      <span className="text-sm text-gray-500">({tag.enabledApis.length} 个源)</span>
                      {tag.showAdultContent && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full">成人</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {getSourcesByTag(tag.name).map(source => (
                        <div key={source.key} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded">
                          <span className="text-sm">{source.name}</span>
                          <div className="flex items-center gap-1">
                            {source.is_adult && <span className="text-xs text-red-500">成人</span>}
                            {source.disabled && <span className="text-xs text-red-500">禁用</span>}
                          </div>
                        </div>
                      ))}
                      {getSourcesByTag(tag.name).length === 0 && (
                        <div className="text-sm text-gray-500 italic">暂无视频源</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* 未分组的源 */}
                {getUngroupedSources().length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-gray-500">未分组</span>
                      <span className="text-sm text-gray-500">({getUngroupedSources().length} 个源)</span>
                    </div>
                    <div className="space-y-1">
                      {getUngroupedSources().map(source => (
                        <div key={source.key} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded">
                          <span className="text-sm">{source.name}</span>
                          <div className="flex items-center gap-1">
                            {source.is_adult && <span className="text-xs text-red-500">成人</span>}
                            {source.disabled && <span className="text-xs text-red-500">禁用</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {canEdit && (
              <>
                {showNewSourceForm ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" placeholder="源 Key (唯一标识)" value={newSource.key} onChange={(e) => setNewSource({ ...newSource, key: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                      <input type="text" placeholder="显示名称" value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                      <input type="text" placeholder="API 地址" value={newSource.api} onChange={(e) => setNewSource({ ...newSource, api: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addSource} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">添加</button>
                      <button onClick={() => setShowNewSourceForm(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">取消</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNewSourceForm(true)} className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    添加视频源
                  </button>
                )}
              </>
            )}
          </div>
        </ConfigSection>

        {/* 自定义分类管理 */}
        <ConfigSection
          title="自定义分类"
          icon={<Video className="w-5 h-5 text-orange-500" />}
          expanded={expandedTabs.categoryConfig}
          onToggle={() => toggleTab('categoryConfig')}
          badge={`${config.CustomCategories.length} 个分类`}
        >
          <div className="space-y-3">
            {config.CustomCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{category.name || '(未命名)'}</div>
                  <div className="text-sm text-gray-500">
                    <span className="mr-2">{category.type === 'movie' ? '电影' : '电视剧'}</span>
                    <span className="truncate">{category.query}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${category.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {category.disabled ? '已禁用' : '已启用'}
                  </span>
                  {canEdit && (
                    <>
                      <button onClick={() => toggleCategoryDisabled(index)} className="p-1 text-gray-500 hover:text-yellow-500" title={category.disabled ? '启用' : '禁用'}>
                        {category.disabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      {category.from === 'custom' && (
                        <button onClick={() => deleteCategory(index)} className="p-1 text-gray-500 hover:text-red-500" title="删除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {canEdit && (
              <>
                {showNewCategoryForm ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" placeholder="分类名称" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                      <select value={newCategory.type} onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'movie' | 'tv' })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                        <option value="movie">电影</option>
                        <option value="tv">电视剧</option>
                      </select>
                      <input type="text" placeholder="搜索关键词" value={newCategory.query} onChange={(e) => setNewCategory({ ...newCategory, query: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addCategory} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">添加</button>
                      <button onClick={() => setShowNewCategoryForm(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">取消</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNewCategoryForm(true)} className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    添加分类
                  </button>
                )}
              </>
            )}
          </div>
        </ConfigSection>
      </div>
    </PageLayout>
  );
}

// 配置区块组件
function ConfigSection({ title, icon, expanded, onToggle, badge, children }: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
          {badge && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400">{badge}</span>}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {expanded && <div className="p-4 border-t border-gray-200 dark:border-gray-700">{children}</div>}
    </div>
  );
}

// 表单字段组件
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  );
}

// 开关组件
function ToggleField({ label, checked, onChange, disabled }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
