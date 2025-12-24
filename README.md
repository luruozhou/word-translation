# Next.js 全栈应用

整合前后端功能的 Next.js 项目。

## 功能

- ✅ Google 登录（使用 Supabase Auth）
- ✅ 文本翻译（调用智谱 AI）
- ✅ Token 配额管理
- ✅ 用量统计

## 快速开始

### 1. 安装依赖

```bash
cd nextjs
npm install
# 或
pnpm install
# 或
yarn install
```

### 2. 配置

**方式一：使用 config.json（推荐用于开发）**

确保项目根目录（`nextjs` 的上一级）的 `config.json` 包含以下配置：

```json
{
  "SUPABASE_URL": "你的 Supabase URL",
  "SUPABASE_KEY": "你的 Supabase Service Key",
  "SUPABASE_ANON_KEY": "你的 Supabase Anon Key",
  "ZHIPU_API_KEY": "你的智谱 API Key"
}
```

**方式二：使用环境变量（推荐用于生产）**

在 `nextjs` 目录下创建 `.env.local` 文件：

```bash
# 客户端配置（需要 NEXT_PUBLIC_ 前缀）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 服务端配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
ZHIPU_API_KEY=your-zhipu-api-key
```

**注意：** 如果使用 `config.json`，客户端配置会使用默认值（已硬编码在 `lib/config.client.ts` 中）。生产环境建议使用环境变量。

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
nextjs/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes（后端）
│   │   ├── translate/      # POST /api/translate
│   │   ├── me/usage/       # GET /api/me/usage
│   │   └── packages/       # GET /api/packages
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页（前端）
│   └── globals.css         # 全局样式
├── lib/                    # 工具函数
│   ├── config.ts           # 配置加载
│   ├── supabase.ts         # Supabase 客户端（后端）
│   ├── supabaseClient.ts   # Supabase 客户端（前端）
│   ├── translate.ts        # 翻译相关
│   └── auth.ts             # 鉴权相关
├── next.config.js          # Next.js 配置
├── tsconfig.json           # TypeScript 配置
└── package.json           # 依赖配置
```

## API 接口

- `POST /api/translate` - 翻译文本
- `GET /api/me/usage` - 获取用户用量信息
- `GET /api/packages` - 获取套餐列表

## 注意事项

- 使用 TypeScript
- 前后端代码都在同一个 Next.js 项目中
- API 路由使用相对路径（`/api/translate`），无需配置完整 URL

