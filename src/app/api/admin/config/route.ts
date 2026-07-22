/* eslint-disable no-console */

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { AdminConfig, AdminConfigResult } from '@/lib/admin.types';
import { getAuthInfoFromCookie } from '@/lib/auth';
import { clearConfigCache, getConfig } from '@/lib/config';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';
  if (storageType === 'localstorage') {
    return NextResponse.json(
      {
        error: '不支持本地存储进行管理员配置',
      },
      { status: 400 }
    );
  }

  const authInfo = getAuthInfoFromCookie(request);
  if (!authInfo || !authInfo.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const username = authInfo.username;

  try {
    const config = await getConfig();
    const result: AdminConfigResult = {
      Role: 'owner',
      Config: config,
    };
    if (username === process.env.USERNAME) {
      result.Role = 'owner';
    } else {
      const user = config.UserConfig.Users.find((u) => u.username === username);
      if (user && user.role === 'admin' && !user.banned) {
        result.Role = 'admin';
      } else {
        return NextResponse.json(
          { error: '你是管理员吗你就访问？' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store', // 管理员配置不缓存
      },
    });
  } catch (error) {
    console.error('获取管理员配置失败:', error);
    return NextResponse.json(
      {
        error: '获取管理员配置失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';
  if (storageType === 'localstorage') {
    return NextResponse.json(
      {
        error: '不支持本地存储进行管理员配置',
      },
      { status: 400 }
    );
  }

  const authInfo = getAuthInfoFromCookie(request);
  if (!authInfo || !authInfo.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const username = authInfo.username;

  // 检查权限：站长或管理员都可以修改配置
  let hasPermission = false;
  if (username === process.env.USERNAME) {
    // 站长
    hasPermission = true;
  } else {
    // 检查是否是管理员
    const config = await getConfig();
    const user = config.UserConfig.Users.find((u) => u.username === username);
    if (user && user.role === 'admin' && !user.banned) {
      hasPermission = true;
    }
  }

  if (!hasPermission) {
    return NextResponse.json(
      { error: '没有权限修改配置' },
      { status: 403 }
    );
  }

  try {
    const newConfig: AdminConfig = await request.json();

    // 检查是否有新用户需要注册到数据库
    try {
      const oldConfig = await getConfig();
      const oldUsernames = new Set(oldConfig.UserConfig.Users.map(u => u.username));
      const newUsernames = newConfig.UserConfig.Users.filter(u => !oldUsernames.has(u.username));

      for (const user of newUsernames) {
        if (user.password) {
          // 注册新用户到数据库
          await db.registerUser(user.username, user.password);
          console.log(`[Admin] 注册新用户: ${user.username}`);
        }
      }
    } catch (e) {
      console.error('注册新用户失败:', e);
    }

    // 保存新配置
    await db.saveAdminConfig(newConfig);

    // 清除缓存，强制下次重新从数据库读取
    clearConfigCache();

    // 🔥 刷新所有页面的缓存，使新配置立即生效（无需重启Docker）
    revalidatePath('/', 'layout');

    // 🔥 添加 no-cache headers，防止 Docker 环境下 Next.js Router Cache 问题
    // 参考：https://github.com/vercel/next.js/issues/61184
    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('保存管理员配置失败:', error);
    return NextResponse.json(
      {
        error: '保存配置失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
