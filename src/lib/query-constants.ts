/**
 * Shared TanStack Query configuration constants.
 * Used across all query hooks for consistent caching behavior.
 */

/** Default stale time: 5 minutes */
export const STALE_TIME = 5 * 60 * 1000;

/** GC time (cache retention): 30 minutes */
export const GC_TIME = 30 * 60 * 1000;

/** Home page hot content stale time: 10 minutes */
export const HOME_STALE_TIME = 10 * 60 * 1000;

/** Default retry count */
export const RETRY_COUNT = 2;

/** Retry delay: exponential backoff base */
export const RETRY_DELAY = (attempt: number) => Math.min(1000 * 2 ** attempt, 30000);
