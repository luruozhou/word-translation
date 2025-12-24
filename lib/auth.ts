// lib/auth.ts
// 鉴权中间件和工具函数

import axios from 'axios';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from './config.server';
import { getSupabaseClient } from './supabase';

export async function getCurrentUser(authHeader: string | null) {
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('缺少 Authorization Bearer token');
  }

  const accessToken = authHeader.split(' ')[1];
  const sb = getSupabaseClient();

  // 调用 Supabase Auth API 获取用户信息
  const resp = await axios.get(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_SERVICE_KEY,
    },
    timeout: 10000,
  });

  const authUser = resp.data;
  const authUserId = authUser.id;

  // 映射到 public.users（如果不存在则自动创建）
  const { data, error } = await sb
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId);

  if (error) {
    console.error('查询 users 表出错:', error);
    throw new Error('查询用户信息失败');
  }

  let row;
  if (data && data.length > 0) {
    row = data[0];
  } else {
    const profile = {
      auth_user_id: authUserId,
      name: authUser.user_metadata?.full_name || authUser.email,
    };
    const insertRes = await sb.from('users').insert(profile).select().single();
    if (insertRes.error) {
      console.error('创建 users 表记录失败:', insertRes.error);
      throw new Error('创建用户记录失败');
    }
    row = insertRes.data;
  }

  return {
    auth_user_id: authUserId,
    user_row_id: row.id,
    monthly_quota_tokens: row.monthly_quota_tokens ?? 50000,
    used_tokens_this_period: row.used_tokens_this_period ?? 0,
    billing_period_start: row.billing_period_start,
  };
}

export async function refreshBillingPeriod(sb: any, user: any) {
  const today = new Date();
  const current = new Date(user.billing_period_start);
  if (
    !user.billing_period_start ||
    today.getFullYear() !== current.getFullYear() ||
    today.getMonth() !== current.getMonth()
  ) {
    const { data, error } = await sb
      .from('users')
      .update({
        used_tokens_this_period: 0,
        billing_period_start: today.toISOString().slice(0, 10),
      })
      .eq('id', user.user_row_id)
      .select()
      .single();

    if (!error && data) {
      user.used_tokens_this_period = 0;
      user.billing_period_start = data.billing_period_start;
      user.monthly_quota_tokens = data.monthly_quota_tokens ?? user.monthly_quota_tokens;
    }
  }
  return user;
}

