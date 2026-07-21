import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BANGUMI_API = 'https://api.bgm.tv';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || 'calendar';
  
  try {
    const response = await fetch(`${BANGUMI_API}/${path}`, {
      headers: {
        'User-Agent': 'LunaTV/1.0',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Bangumi API error' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Bangumi data' }, { status: 500 });
  }
}
