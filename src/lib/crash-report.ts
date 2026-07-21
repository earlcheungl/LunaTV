/**
 * Shared crash reporting utility.
 * Used by both error.tsx and global-error.tsx to avoid duplication.
 */

interface CrashLog {
  id: string;
  type: 'PAGE_ERROR' | 'GLOBAL_ERROR';
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
}

export async function reportCrash(
  error: Error,
  type: CrashLog['type'],
  componentStack?: string
): Promise<void> {
  const crashLog: CrashLog = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    message: error.message || 'Unknown error',
    stack: error.stack,
    componentStack: componentStack || undefined,
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  // Save to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('crash-logs') || '[]');
    const logs = Array.isArray(existing) ? existing : [];
    logs.push(crashLog);
    // Keep only last 20 crash logs
    if (logs.length > 20) logs.splice(0, logs.length - 20);
    localStorage.setItem('crash-logs', JSON.stringify(logs));
  } catch {
    // localStorage might be full or unavailable
  }

  // Report to server
  try {
    await fetch('/api/crash-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crashLog),
    });
  } catch {
    // Server might be down
  }

  console.error(`[${type}]`, error.message, error.stack);
}
