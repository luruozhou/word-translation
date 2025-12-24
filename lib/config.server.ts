// lib/config.server.ts
// 服务端配置（仅在服务端使用，可以使用 fs）

import path from 'path';
import fs from 'fs';

// 获取项目根目录（nextjs 目录）
// process.cwd() 在 Next.js 中返回 nextjs 目录
const NEXTJS_DIR = process.cwd();
const ROOT_DIR = path.resolve(NEXTJS_DIR, '..');

function loadConfig() {
  // 优先在 nextjs 目录下查找（用于 Vercel 部署）
  let configPath = path.join(NEXTJS_DIR, 'config.json');
  
  // 如果不存在，尝试在项目根目录查找（开发环境兼容）
  if (!fs.existsSync(configPath)) {
    configPath = path.join(ROOT_DIR, 'config.json');
  }
  
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `缺少 config.json，用于读取 SUPABASE_URL / SUPABASE_KEY / ZHIPU_API_KEY\n` +
      `已尝试查找路径：\n` +
      `1. ${path.join(NEXTJS_DIR, 'config.json')} (优先，用于 Vercel 部署)\n` +
      `2. ${path.join(ROOT_DIR, 'config.json')} (开发环境兼容)\n` +
      `请确保 config.json 文件存在于上述路径之一，或使用环境变量`
    );
  }
  
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw);
}

// 尝试加载配置，如果失败则使用环境变量
let cfg: any = {};
try {
  cfg = loadConfig();
} catch (error) {
  console.warn('无法加载 config.json，将使用环境变量:', error);
}

export const SUPABASE_URL = process.env.SUPABASE_URL || cfg.SUPABASE_URL;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || cfg.SUPABASE_KEY;
export const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || cfg.ZHIPU_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('缺少 SUPABASE_URL / SUPABASE_SERVICE_KEY（请设置环境变量或创建 config.json）');
}
if (!ZHIPU_API_KEY) {
  throw new Error('缺少 ZHIPU_API_KEY（请设置环境变量或创建 config.json）');
}
