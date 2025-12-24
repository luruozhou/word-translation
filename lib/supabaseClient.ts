// lib/supabaseClient.ts
// Supabase 客户端（前端使用）

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.client';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

