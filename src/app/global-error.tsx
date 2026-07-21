'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { reportCrash } from '@/lib/crash-report';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ChunkLoadError：新版本部署后旧 chunk 失效，自动硬刷新一次（10s TTL 防循环）
    const isChunkError =
      typeof window !== 'undefined' &&
      (error.name === 'ChunkLoadError' ||
        error.message?.includes('Failed to load chunk') ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('Loading CSS chunk'));
    if (isChunkError) {
      try {
        const reloadKey = `chunk_reload_global_${window.location.pathname}`;
        const prev = sessionStorage.getItem(reloadKey);
        const now = Date.now();
        if (!prev || now - parseInt(prev, 10) > 10_000) {
          sessionStorage.setItem(reloadKey, String(now));
          window.location.reload();
          return;
        }
      } catch {
        // sessionStorage 可能在隐私模式不可用，忽略
      }
      console.warn('[ChunkLoadError] 全局错误页自动刷新后仍失败', error.message);
      return;
    }

    // Report crash using shared utility
    reportCrash(error, 'GLOBAL_ERROR');
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '1rem 1rem 2rem',
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem 2rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.5rem',
              }}>
                应用出错了
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1.5rem',
              }}>
                抱歉，应用遇到了严重问题
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '0.5rem',
                  textAlign: 'left',
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: '#dc2626',
                    wordBreak: 'break-all',
                  }}>
                    {error.message}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={reset}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  <RefreshCw style={{ width: '1rem', height: '1rem' }} />
                  重新加载
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/crash-logs';
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    backgroundColor: '#ea580c',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c2410c'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                >
                  查看崩溃日志
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      // 清理可能损坏的缓存
                      const keysToKeep = ['auth-token', 'user-preferences'];
                      try {
                        for (let key in localStorage) {
                          if (!keysToKeep.includes(key) && key.startsWith('moontv_')) {
                            localStorage.removeItem(key);
                          }
                        }
                      } catch (e) {
                        console.error('清理缓存失败:', e);
                      }
                      window.location.href = '/';
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    backgroundColor: '#e5e7eb',
                    color: '#111827',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                >
                  清理缓存并返回首页
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      try {
                        const logs = localStorage.getItem('crash-logs');
                        if (logs) {
                          const blob = new Blob([logs], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `crash-logs-${Date.now()}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      } catch (e) {
                        console.error('下载日志失败:', e);
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#111827'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  下载崩溃日志
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
