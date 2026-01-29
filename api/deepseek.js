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

  // 优先使用环境变量，确保 API Key 正确
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  
  // 验证 API Key
  if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_KEY.startsWith('sk-')) {
    console.error('API Key not configured or invalid');
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    return res.json({ 
      error: 'API Key not configured correctly',
      message: 'Please set DEEPSEEK_API_KEY environment variable in Vercel'
    });
  }

  // 从请求路径中提取 API 路径（支持 /api/deepseek/chat/completions）
  // Vercel Serverless Function 的 req.url 包含完整路径
  let apiPath = '/v1/chat/completions'; // 默认路径
  if (req.url) {
    // 提取 /api/deepseek 之后的部分
    const match = req.url.match(/\/api\/deepseek(\/.*)?$/);
    if (match && match[1]) {
      // 如果路径以 /v1 开头，直接使用；否则添加 /v1 前缀
      apiPath = match[1].startsWith('/v1') ? match[1] : `/v1${match[1]}`;
    }
  }
  const DEEPSEEK_API_URL = `https://api.deepseek.com${apiPath}`;
  
  console.log('[Vercel API] 请求路径:', req.url, '→ API路径:', apiPath);

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

    // 流式传输响应
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // 修复：使用 await 等待流式传输完成
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
    } else {
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
