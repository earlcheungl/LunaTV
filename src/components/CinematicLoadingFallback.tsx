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
 * - No boring empty skeleton cards
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
  { icon: Film, text: '胶片正在装载中...', emoji: '🎞️' },
];

export function CinematicLoadingFallback() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate messages every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress (purely visual, not tied to actual loading)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90%, complete when actually loaded
        return prev + Math.random() * 15;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = loadingMessages[messageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-md">
        {/* Animated icon */}
        <div className="mb-8 relative">
          {/* Glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Icon with rotation */}
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center animate-spin-slow">
              <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Message with emoji */}
        <div className="mb-6 space-y-2">
          <div className="text-4xl animate-bounce-subtle">
            {currentMessage.emoji}
          </div>
          <h2 className="text-xl font-semibold text-white animate-fade-in">
            {currentMessage.text}
          </h2>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Fun fact or tip */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300">
            💡 <span className="font-medium">小贴士：</span>
            使用快捷键 <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Space</kbd> 可以快速播放/暂停视频
          </p>
        </div>

        {/* Film strip decoration */}
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-gray-700 rounded-sm animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-twinkle,
          .animate-spin-slow,
          .animate-bounce-subtle,
          .animate-fade-in,
          .animate-pulse {
            animation: none !important;
          }
        }

        kbd {
          box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
