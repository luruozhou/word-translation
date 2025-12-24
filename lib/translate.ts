// lib/translate.ts
// 翻译相关工具函数

import axios from 'axios';
import { ZHIPU_API_KEY } from './config.server';

export async function translateTextSync(text: string, targetLang: string) {
  const start = Date.now();
  try {
    const resp = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        model: 'GLM-4-Flash-250414',
        messages: [
          {
            role: 'user',
            content:
              '你是一个专业的翻译助手。' +
              `请将我给你的文本翻译成目标语言：${targetLang}。` +
              "目标语言的描述可能是自然语言（例如'简体中文''英语'），" +
              '也可能是语言代码（例如 zh、en、ja、fr 等），' +
              '请根据这个描述自行理解目标语言并进行翻译。' +
              '只输出翻译后的文本本身，不要任何解释或前后缀。',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        thinking: { type: 'disabled' },
        stream: false,
        max_tokens: 2048,
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ZHIPU_API_KEY}`,
        },
        timeout: 20000,
      }
    );

    const result = resp.data.choices?.[0]?.message?.content || '';
    const elapsed = (Date.now() - start) / 1000;
    return [true, result, elapsed] as const;
  } catch (e: any) {
    const elapsed = (Date.now() - start) / 1000;
    return [false, e.message || String(e), elapsed] as const;
  }
}

export function estimateTokens(text: string) {
  const chars = text.length;
  return Math.max(1, Math.ceil(chars / 1.5));
}

