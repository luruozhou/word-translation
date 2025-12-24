// app/api/translate/route.ts
// POST /api/translate

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, refreshBillingPeriod } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { translateTextSync, estimateTokens } from '@/lib/translate';

export async function POST(request: NextRequest) {
  try {
    // 获取 Authorization header
    const authHeader = request.headers.get('authorization') || '';
    const user = await getCurrentUser(authHeader);

    // 解析请求体
    const body = await request.json();
    const { text, target_lang = '英文' } = body || {};

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { detail: 'text 必须是非空字符串' },
        { status: 400 }
      );
    }

    const sb = getSupabaseClient();
    let currentUser = user;
    currentUser = await refreshBillingPeriod(sb, currentUser);

    const estTokens = estimateTokens(text);
    const remaining = currentUser.monthly_quota_tokens - currentUser.used_tokens_this_period;

    if (estTokens > remaining) {
      return NextResponse.json(
        {
          detail: `本月额度不足，剩余 ${remaining} tokens，需要 ${estTokens} tokens`,
        },
        { status: 402 }
      );
    }

    const [ok, result, _elapsed] = await translateTextSync(text, target_lang);
    if (!ok) {
      return NextResponse.json(
        { detail: `翻译失败: ${result}` },
        { status: 500 }
      );
    }

    const newUsed = currentUser.used_tokens_this_period + estTokens;

    // 记录 usage_logs
    await sb.from('usage_logs').insert({
      user_id: currentUser.user_row_id,
      model: 'glm-4.5',
      input_chars: text.length,
      estimated_tokens: estTokens,
      cost_in_cents: 0,
      original_text: text,
      translated_text: result,
    });

    // 更新 user_monthly_usage
    const billingStart = new Date(currentUser.billing_period_start || new Date());
    const periodStart = new Date(billingStart.getFullYear(), billingStart.getMonth(), 1);
    const periodStartStr = periodStart.toISOString().slice(0, 10);

    const existing = await sb
      .from('user_monthly_usage')
      .select('*')
      .eq('user_id', currentUser.user_row_id)
      .eq('period_start', periodStartStr)
      .maybeSingle();

    if (existing.data) {
      const row = existing.data;
      await sb
        .from('user_monthly_usage')
        .update({
          total_tokens: (row.total_tokens || 0) + estTokens,
          total_requests: (row.total_requests || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
    } else {
      await sb.from('user_monthly_usage').insert({
        user_id: currentUser.user_row_id,
        period_start: periodStartStr,
        total_tokens: estTokens,
        total_requests: 1,
      });
    }

    // 更新 users 用量
    await sb
      .from('users')
      .update({ used_tokens_this_period: newUsed })
      .eq('id', currentUser.user_row_id);

    return NextResponse.json({
      translated_text: result,
      estimated_tokens: estTokens,
      remaining_tokens: currentUser.monthly_quota_tokens - newUsed,
    });
  } catch (error: any) {
    console.error('翻译接口错误:', error);
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

