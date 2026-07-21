'use client';

import { usePathname } from 'next/navigation';

import ModernNav from './ModernNav';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

// 不需要导航栏的独立路由
const STANDALONE_ROUTES = [
  '/login',
  '/register',
];

function isStandaloneRoute(pathname: string) {
  return STANDALONE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default function NavigationShell() {
  const pathname = usePathname();
  const { siteName } = useSite();
  const isStandalone = isStandaloneRoute(pathname);

  // 独立路由不显示导航栏
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Modern Navigation - Top (Desktop) & Bottom (Mobile) */}
      <ModernNav />

      {/* 移动端头部 - Logo和用户菜单 */}
      <div className='md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'>
        <div className='flex items-center justify-between h-11 px-4'>
          {/* Logo */}
          <div className='text-base font-bold bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent'>
            {siteName}
          </div>

          {/* Theme Toggle & User Menu */}
          <div className='flex items-center gap-1.5'>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </>
  );
}
