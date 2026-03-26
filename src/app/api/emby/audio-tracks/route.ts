/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';

import { embyManager } from '@/lib/emby-manager';
import { getAuthInfoFromCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('id');
  const embyKey = searchParams.get('embyKey') || undefined;

  if (!itemId) {
    return NextResponse.json({ error: '缺少媒体ID' }, { status: 400 });
  }

  try {
    // 从 cookie 获取用户信息
    const authCookie = getAuthInfoFromCookie(request);

    if (!authCookie?.username) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const username = authCookie.username;

    // 获取用户的Emby客户端
    const client = await embyManager.getClientForUser(username, embyKey);

    // 获取音轨信息
    const audioStreams = await client.getAudioStreams(itemId);

    return NextResponse.json({ audioStreams });
  } catch (error: any) {
    console.error('获取音轨失败:', error);
    return NextResponse.json(
      { error: error.message || '获取音轨失败' },
      { status: 500 }
    );
  }
}
