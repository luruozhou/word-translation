// app/api/packages/route.ts
// GET /api/packages

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 'basic',
      name: '基础套餐',
      tokens_amount: 100000,
      price_cents: 9900,
      description: '适合轻度使用',
    },
    {
      id: 'standard',
      name: '标准套餐',
      tokens_amount: 500000,
      price_cents: 39900,
      description: '适合日常使用',
    },
    {
      id: 'premium',
      name: '高级套餐',
      tokens_amount: 2000000,
      price_cents: 129900,
      description: '适合重度使用',
    },
  ]);
}

