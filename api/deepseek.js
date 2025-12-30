// Vercel Serverless Function for DeepSeek API Proxy
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || 'sk-b1551c8a25d042a7ae8b0166820249a8';
  const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

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
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 流式传输响应
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
        res.end();
      } catch (streamError) {
        console.error('Stream error:', streamError);
        res.end();
      }
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
