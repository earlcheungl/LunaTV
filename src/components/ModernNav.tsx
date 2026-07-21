/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Cat, Clover, Film, Home, Search, Star, Tv } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FastLink } from './FastLink';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { useSite } from './SiteProvider';

interface NavItem {
  icon: any;
  label: string;
  href: string;
  color: string;
  gradient: string;
}

export default function ModernNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(pathname);
  const { siteName } = useSite();

  const [menuItems, setMenuItems] = useState<NavItem[]>([
    {
      icon: Home,
      label: '首页',
      href: '/',
      color: 'text-green-500',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Film,
      label: '电影',
      href: '/douban?type=movie',
      color: 'text-red-500',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Tv,
      label: '剧集',
      href: '/douban?type=tv',
      color: 'text-blue-600',
      gradient: 'from-blue-600 to-indigo-600',
    },
    {
      icon: Cat,
      label: '动漫',
      href: '/douban?type=anime',
      color: 'text-pink-500',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Clover,
      label: '综艺',
      href: '/douban?type=show',
      color: 'text-orange-500',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: Search,
      label: '搜索',
      href: '/search',
      color: 'text-blue-500',
      gradient: 'from-blue-500 to-cyan-500',
    },
  ]);

  useEffect(() => {
    const runtimeConfig = (window as any).RUNTIME_CONFIG;
    const newItems = [...menuItems];

    if (runtimeConfig?.CUSTOM_CATEGORIES?.length > 0 && !newItems.some(item => item.href === '/douban?type=custom')) {
      newItems.push({
        icon: Star,
        label: '自定义',
        href: '/douban?type=custom',
        color: 'text-yellow-500',
        gradient: 'from-yellow-500 to-amber-500',
      });
    }

    setMenuItems(newItems);
  }, []);

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  // 桌面端显示所有，移动端显示前4个（首页、电影、剧集、搜索）
  const desktopItems = menuItems;
  const mobileItems = [
    menuItems[0], // 首页
    menuItems[1], // 电影
    menuItems[2], // 剧集
    menuItems[5], // 搜索
  ];

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className='hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'>
        <div className='max-w-[2560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <div className='flex items-center gap-2'>
              <div className='text-xl font-bold bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent'>
                {siteName}
              </div>
            </div>

            {/* Navigation Items */}
            <div className='flex items-center gap-1'>
              {desktopItems.map((item) => (
                <FastLink
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    active === item.href
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active === item.href ? 'text-white' : item.color}`} />
                  <span className='font-medium'>{item.label}</span>
                </FastLink>
              ))}
            </div>

            {/* Right Side Actions - Theme Toggle & User Menu */}
            <div className='flex items-center gap-2'>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'>
        <div className='flex items-center justify-around h-16 px-2'>
          {mobileItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                active === item.href
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active === item.href ? 'text-white' : item.color}`} />
              <span className='text-xs font-medium'>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
