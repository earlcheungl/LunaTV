import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BANGUMI_API = 'https://api.bgm.tv';

// 备用代理列表
const FALLBACK_PROXIES = [
  'https://api.bgm.tv',
  'https://bgm.tv',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || 'calendar';
  const apiType = searchParams.get('apiType') || 'server';

  // 如果指定了 cmliussss 代理
  if (apiType === 'cmliussss') {
    try {
      const response = await fetch(`https://api.bgm.cmliussss.net/${path}`, {
        headers: {
          'User-Agent': 'LunaTV/1.0',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.warn('[Bangumi] cmliussss proxy failed, trying direct');
    }
  }

  // 尝试直接访问
  for (const proxy of FALLBACK_PROXIES) {
    try {
      const response = await fetch(`${proxy}/${path}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.warn(`[Bangumi] ${proxy} failed:`, error);
      continue;
    }
  }

  return NextResponse.json({ error: 'All Bangumi API endpoints failed' }, { status: 502 });
}
