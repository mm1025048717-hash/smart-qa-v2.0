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
  const DEEPSEEK_API_URL = 'https://api.deepseek.com';

  try {
    // 获取请求路径
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname.replace(/^\/api\/deepseek/, '') || '/v1/chat/completions';
    
    // 构建目标 URL
    const targetUrl = `${DEEPSEEK_API_URL}${path}`;

    // 获取请求体
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = JSON.stringify(req.body || {});
    }

    // 转发请求到 DeepSeek API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: body
    });

    // 获取响应数据
    const data = await response.text();
    
    // 设置响应头
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json');
    
    // 返回响应
    return res.status(response.status).send(data);
  } catch (error) {
    console.error('DeepSeek API Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

