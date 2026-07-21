/* eslint-disable no-console */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Lightweight logger that only outputs in development.
 * In production, all log calls are no-ops.
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
};
