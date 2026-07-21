/* eslint-disable no-console,@typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

'use client';

import {
  Heart,
  KeyRound,
  LogOut,
  PlayCircle,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';

import { getAuthInfoFromBrowserCookie } from '@/lib/auth';
import { CURRENT_VERSION } from '@/lib/version';
import { checkForUpdates, UpdateStatus } from '@/lib/version_check';
import type { PlayRecord, Favorite } from '@/lib/types';

import { VersionPanel } from './VersionPanel';
import VideoCard from './VideoCard';
import { SettingsPanel } from './SettingsPanel';
import {
  useServerConfigQuery,
  useVersionCheckQuery,
  usePlayRecordsQuery,
  useFavoritesQuery,
  useChangePasswordMutation,
  useInvalidateUserMenuData,
} from '@/hooks/useUserMenuQueries';

interface AuthInfo {
  username?: string;
  role?: 'owner' | 'admin' | 'user';
}

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
  const [isContinueWatchingOpen, setIsContinueWatchingOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [storageType, setStorageType] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (window as any).RUNTIME_CONFIG?.STORAGE_TYPE || 'localstorage';
    }
    return 'localstorage';
  });
  const [mounted, setMounted] = useState(false);

  const { data: serverConfig } = useServerConfigQuery();
  const { data: versionData } = useVersionCheckQuery();
  const { data: playRecordsData } = usePlayRecordsQuery({ 
    enabled: !!authInfo?.username && storageType !== 'localstorage',
    enableFilter: false,
    minProgress: 0,
    maxProgress: 100
  });
  const { data: favoritesData } = useFavoritesQuery({ enabled: !!authInfo?.username && storageType !== 'localstorage' });
  const changePasswordMutation = useChangePasswordMutation();
  const { invalidateAll } = useInvalidateUserMenuData();

  const isAdmin = authInfo?.role === 'owner' || authInfo?.role === 'admin';

  useEffect(() => {
    setMounted(true);
    const auth = getAuthInfoFromBrowserCookie();
    if (auth) {
      setAuthInfo(auth);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      queryClient.clear();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await changePasswordMutation.mutateAsync(newPassword);
      setIsChangePasswordOpen(false);
      alert('密码修改成功');
    } catch (error) {
      alert('密码修改失败');
    }
  };

  const playRecords = Array.isArray(playRecordsData) 
    ? playRecordsData.sort((a: any, b: any) => b.save_time - a.save_time).slice(0, 10)
    : playRecordsData 
    ? Object.entries(playRecordsData as Record<string, PlayRecord>).sort(([, a], [, b]) => b.save_time - a.save_time).slice(0, 10).map(([, record]) => record)
    : [];
  const favorites = Array.isArray(favoritesData)
    ? favoritesData.sort((a: any, b: any) => b.save_time - a.save_time).slice(0, 10)
    : favoritesData
    ? Object.entries(favoritesData as Record<string, Favorite>).sort(([, a], [, b]) => b.save_time - a.save_time).slice(0, 10).map(([, fav]) => fav)
    : [];

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">用户菜单</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {authInfo?.username && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {authInfo.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{authInfo.username}</div>
                    <div className="text-sm text-gray-500">{authInfo.role || 'user'}</div>
                  </div>
                </div>
              )}

              {storageType !== 'localstorage' && (
                <>
                  <button
                    onClick={() => { setIsContinueWatchingOpen(true); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <PlayCircle className="w-5 h-5 text-blue-500" />
                    <span>继续观看</span>
                  </button>

                  <button
                    onClick={() => { setIsFavoritesOpen(true); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>我的收藏</span>
                  </button>
                </>
              )}

              <button
                onClick={() => { setIsSettingsOpen(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>设置</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => { router.push('/admin'); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span>管理面板</span>
                </button>
              )}

              <button
                onClick={() => { setIsChangePasswordOpen(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <KeyRound className="w-5 h-5 text-yellow-500" />
                <span>修改密码</span>
              </button>

              <button
                onClick={() => { setIsVersionPanelOpen(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="text-sm font-mono">v{CURRENT_VERSION}</div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isSettingsOpen && <SettingsPanel onClose={() => setIsSettingsOpen(false)} />}

      {isVersionPanelOpen && (
        <VersionPanel
          isOpen={isVersionPanelOpen}
          onClose={() => setIsVersionPanelOpen(false)}
          currentVersion={CURRENT_VERSION}
          updateStatus={versionData || UpdateStatus.NO_UPDATE}
          latestVersion={undefined}
        />
      )}

      {isContinueWatchingOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsContinueWatchingOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">继续观看</h2>
              <button onClick={() => setIsContinueWatchingOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {playRecords.map((record: any, index: number) => (
                <VideoCard key={record.key || index} {...record} />
              ))}
            </div>
            {playRecords.length === 0 && (
              <div className="text-center text-gray-500 py-8">暂无播放记录</div>
            )}
          </div>
        </div>,
        document.body
      )}

      {isFavoritesOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsFavoritesOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">我的收藏</h2>
              <button onClick={() => setIsFavoritesOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {favorites.map((fav: any, index: number) => (
                <VideoCard key={fav.key || index} {...fav} />
              ))}
            </div>
            {favorites.length === 0 && (
              <div className="text-center text-gray-500 py-8">暂无收藏</div>
            )}
          </div>
        </div>,
        document.body
      )}

      {isChangePasswordOpen && createPortal(
        <ChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
          onSubmit={handleChangePassword}
          isLoading={changePasswordMutation.isPending}
        />,
        document.body
      )}
    </>
  );
};

const ChangePasswordModal: React.FC<{
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => void;
  isLoading: boolean;
}> = ({ onClose, onSubmit, isLoading }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    onSubmit(oldPassword, newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">修改密码</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              取消
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
              {isLoading ? '修改中...' : '确认'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserMenu;
