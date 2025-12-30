// Vercel Serverless Function for DeepSeek API Proxy
// 注意：Vercel 使用 Node.js 格式的 handler，但流式响应需要使用特殊处理
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 优先使用环境变量，确保 API Key 正确
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || 'sk-b1551c8a25d042a7ae8b0166820249a8';
  const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

  // 调试：检查 API Key（不输出完整 key，只输出前4位和后4位）
  const keyPrefix = DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 7) : 'missing';
  const keySuffix = DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(DEEPSEEK_API_KEY.length - 6) : '';
  console.log('API Key check:', {
    hasEnvVar: !!process.env.DEEPSEEK_API_KEY,
    hasViteVar: !!process.env.VITE_DEEPSEEK_API_KEY,
    keyPrefix,
    keySuffix,
    keyLength: DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.length : 0
  });

  // 验证 API Key 格式
  if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_KEY.startsWith('sk-') || DEEPSEEK_API_KEY.length < 20) {
    console.error('Invalid API Key format!');
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    return res.json({ 
      error: 'API Key not configured correctly',
      message: 'Please set DEEPSEEK_API_KEY environment variable in Vercel'
    });
  }

  try {
    // 获取请求体（Vercel 会自动解析 JSON）
    const requestBody = req.body || {};

    // 转发请求到 DeepSeek API（流式响应）
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', response.status, errorText);
      res.status(response.status);
      res.setHeader('Content-Type', 'application/json');
      return res.json({ error: 'DeepSeek API Error', details: errorText });
    }

    // 设置响应头（保持流式传输）
    const contentType = response.headers.get('Content-Type') || 'text/event-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.status(response.status);

    // 流式传输响应 - 使用 Node.js 流式 API
    if (response.body) {
      // 将 ReadableStream 转换为 Node.js 流
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
          }
        } catch (error) {
          console.error('Stream error:', error);
          res.end();
        }
      };

      // 开始流式传输
      pump();
    } else {
      // 如果没有 body，直接返回
      const data = await response.text();
      res.send(data);
    }
  } catch (error) {
    console.error('DeepSeek API Proxy Error:', error);
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    return res.json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
