'use client';

/**
 * Page Loading Fallback Component
 *
 * A beautiful loading screen that shows while the page is being prepared.
 * Features:
 * - Skeleton screens that mimic the actual layout
 * - Pulsing animation to indicate activity
 * - Dark mode support
 * - Brand logo and messaging
 * - Respects user's motion preferences
 *
 * Best practices from:
 * - https://www.getfishtank.com/insights/best-practices-for-loading-states-in-nextjs
 * - https://www.alvar.dev/blog/skeleton-loading-with-suspense-in-next-js-13
 */

export function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo skeleton */}
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />

            {/* Nav items skeleton */}
            <div className="hidden md:flex space-x-4">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            {/* Spinner */}
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              正在加载精彩内容...
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            正在为您准备最新的影视推荐
          </p>
        </div>

        {/* Hero Banner Skeleton */}
        <div className="mb-8">
          <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>

        {/* Content Rows Skeleton */}
        <div className="space-y-8">
          {[1, 2, 3].map((section) => (
            <div key={section}>
              {/* Section Title */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((card) => (
                  <div key={card} className="space-y-2">
                    {/* Poster */}
                    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    {/* Title */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    {/* Subtitle */}
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress"
          style={{
            animation: 'progress 2s ease-in-out infinite'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            opacity: 0.5;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.5;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-spin,
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
