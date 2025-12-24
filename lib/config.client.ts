// lib/config.client.ts
// 客户端配置（不使用 fs，从环境变量读取）

// 客户端只能使用环境变量，不能读取文件
// 使用 NEXT_PUBLIC_ 前缀的环境变量会在构建时注入到客户端

// 默认值（从 config.json 复制）
const DEFAULT_SUPABASE_URL = 'https://bdxgeqvzvcnlsldlvnum.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeGdlcXZ6dmNubHNsZGx2bnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzY0MzMsImV4cCI6MjA4MjAxMjQzM30.AetYNUKsYfye6VB3a8_zAQCaYPohvv0IyniMsORt3xM';

// 优先使用环境变量，如果不存在则使用默认值
export const SUPABASE_URL = 
  (typeof process !== 'undefined' && 
   process.env.NEXT_PUBLIC_SUPABASE_URL && 
   process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '') 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY = 
  (typeof process !== 'undefined' && 
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== '') 
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    : DEFAULT_SUPABASE_ANON_KEY;

// 验证配置（确保值不为空）
if (!SUPABASE_URL || SUPABASE_URL.trim() === '') {
  throw new Error('Supabase URL 配置缺失');
}
if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.trim() === '') {
  throw new Error('Supabase ANON KEY 配置缺失');
}
