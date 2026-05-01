'use client';

import { useEffect, useState } from 'react';
import { Film, Popcorn, Star, Sparkles } from 'lucide-react';

/**
 * Cinematic Loading Fallback - Movie-themed loading experience
 *
 * Features:
 * - Movie-themed animations (film reel, popcorn, stars)
 * - Rotating fun messages to keep users engaged
 * - Progress indicator with cinematic feel
 * - Dark mode optimized for movie watching experience
 * - Minimum display time to prevent jarring flashes
 *
 * Design principles from:
 * - https://www.numberanalytics.com/blog/the-art-of-loading-animations
 * - https://dribbble.com/tags/movie-streaming
 */

const loadingMessages = [
  { icon: Film, text: '正在为您准备今晚的观影清单...', emoji: '🎬' },
  { icon: Popcorn, text: '爆米花准备好了吗？', emoji: '🍿' },
  { icon: Star, text: '发现了数百部精彩影片...', emoji: '⭐' },
  { icon: Sparkles, text: '正在寻找最适合您的推荐...', emoji: '✨' },
];

export function CinematicLoadingFallback() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fade in after mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Rotate messages every 2 seconds (slower)
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = loadingMessages[messageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Subtle animated background stars - reduced quantity */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-md">
        {/* Animated icon - slower rotation */}
        <div className="mb-8 relative">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          </div>

          {/* Icon with gentle rotation */}
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/80 via-purple-500/80 to-pink-500/80 flex items-center justify-center animate-spin-gentle">
              <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Message with emoji - smoother transition */}
        <div className="mb-6 space-y-3">
          <div className="text-4xl">
            {currentMessage.emoji}
          </div>
          <h2 className="text-xl font-medium text-white transition-opacity duration-500">
            {currentMessage.text}
          </h2>
        </div>

        {/* Simple loading dots instead of progress bar */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Subtle tip */}
        <div className="mt-8 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <p className="text-sm text-gray-400">
            💡 快捷键 <kbd className="px-2 py-0.5 bg-gray-700/50 rounded text-xs mx-1">Space</kbd> 播放/暂停
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        @keyframes spin-gentle {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }

        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }

        .animate-spin-gentle {
          animation: spin-gentle 4s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-dot {
          animation: bounce-dot 1.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-twinkle,
          .animate-spin-gentle,
          .animate-pulse-slow,
          .animate-bounce-dot {
            animation: none !important;
          }
        }

        kbd {
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

