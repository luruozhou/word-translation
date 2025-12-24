// app/api/me/usage/route.ts
// GET /api/me/usage

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// 标记为动态路由，因为使用了 request.headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const user = await getCurrentUser(authHeader);

    return NextResponse.json({
      monthly_quota_tokens: user.monthly_quota_tokens,
      used_tokens_this_period: user.used_tokens_this_period,
      billing_period_start: user.billing_period_start,
      remaining_tokens: user.monthly_quota_tokens - user.used_tokens_this_period,
    });
  } catch (error: any) {
    console.error('获取用量接口错误:', error);
    if (error.message === '缺少 Authorization Bearer token') {
      return NextResponse.json(
        { detail: error.message },
        { status: 401 }
      );
    }
    if (error.message === '无效的 Supabase 会话') {
      return NextResponse.json(
        { detail: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { detail: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}

