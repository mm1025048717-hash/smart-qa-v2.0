// Cloudflare Worker 代理 DeepSeek API
// 部署方法：
// 1. 注册 Cloudflare 账号：https://dash.cloudflare.com/
// 2. 进入 Workers & Pages
// 3. 创建新的 Worker
// 4. 复制此代码
// 5. 在 Worker 设置中添加环境变量：DEEPSEEK_API_KEY = 你的 API Key
// 6. 部署后，将前端代码中的 DEEPSEEK_BASE_URL 改为你的 Worker URL

export default {
  async fetch(request, env) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // 检查 API Key
    if (!env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API Key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // 获取请求体
      const requestBody = await request.json();

      // 转发请求到 DeepSeek API
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      // 获取响应
      const responseData = await response.text();

      // 返回响应（保持流式或非流式）
      return new Response(responseData, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};



