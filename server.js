import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const HOST = '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com';
// 优先使用环境变量，如果没有则使用默认值（用于开发环境）
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-6e48c170ae03465ba5748768215bb3ba';

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API代理：处理 /api/deepseek 请求
  if (req.url.startsWith('/api/deepseek')) {
    const apiPath = req.url.replace('/api/deepseek', '');
    
    // 收集请求体数据
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // 解析请求体，检查是否是流式请求
      let isStream = false;
      try {
        const requestBody = JSON.parse(body);
        isStream = requestBody.stream === true;
      } catch (e) {
        // 如果不是JSON，按非流式处理
      }

      const options = {
        hostname: 'api.deepseek.com',
        port: 443,
        path: apiPath,
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          // 优先使用请求中的Authorization，如果没有则使用服务器配置的
          'Authorization': req.headers['authorization'] || `Bearer ${DEEPSEEK_API_KEY}`,
        }
      };

      if (body && (req.method === 'POST' || req.method === 'PUT')) {
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }

      const proxyReq = https.request(options, (proxyRes) => {
        // 记录响应状态
        console.log(`DeepSeek API Response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
        
        // 设置响应头
        const responseHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // 如果是流式响应，设置正确的Content-Type
        if (isStream || proxyRes.headers['content-type']?.includes('text/event-stream')) {
          responseHeaders['Content-Type'] = 'text/event-stream';
          responseHeaders['Cache-Control'] = 'no-cache';
          responseHeaders['Connection'] = 'keep-alive';
        } else {
          responseHeaders['Content-Type'] = proxyRes.headers['content-type'] || 'application/json';
        }

        res.writeHead(proxyRes.statusCode, responseHeaders);

        // 实时转发响应数据（支持流式）
        proxyRes.on('data', (chunk) => {
          try {
            res.write(chunk);
          } catch (err) {
            console.error('写入响应数据错误:', err);
          }
        });

        proxyRes.on('end', () => {
          try {
            res.end();
          } catch (err) {
            console.error('结束响应错误:', err);
          }
        });

        proxyRes.on('error', (err) => {
          console.error('代理响应错误:', err);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
          }
          res.end(JSON.stringify({ error: '代理响应错误', message: err.message }));
        });
      });

      proxyReq.on('error', (err) => {
        console.error('DeepSeek API Proxy Error:', err);
        console.error('Error details:', {
          code: err.code,
          message: err.message,
          hostname: options.hostname,
          path: options.path
        });
        
        let errorMessage = 'DeepSeek API 连接失败';
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          errorMessage = '无法连接到 DeepSeek API 服务器，请检查网络连接';
        } else if (err.code === 'ETIMEDOUT') {
          errorMessage = 'DeepSeek API 请求超时，请稍后重试';
        } else {
          errorMessage = `DeepSeek API 连接错误: ${err.message}`;
        }
        
        if (!res.headersSent) {
          res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ 
            error: errorMessage, 
            details: err.message,
            code: err.code,
            suggestion: '请检查：1. 网络连接是否正常 2. API Key 是否有效 3. DeepSeek 服务是否可用'
          }));
        }
      });

      // 发送请求体
      if (body && (req.method === 'POST' || req.method === 'PUT')) {
        proxyReq.write(body);
      }
      proxyReq.end();
    });

    req.on('error', (err) => {
      console.error('请求错误:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '请求错误', message: err.message }));
      }
    });

    return;
  }

  // 解析请求路径（静态文件）
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // 防止路径遍历攻击
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 文件不存在，返回index.html（SPA路由支持）
      filePath = path.join(DIST_DIR, 'index.html');
    }

    // 读取文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }

      // 获取文件扩展名
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log('========================================');
  console.log('   Smart QA Web Server');
  console.log('========================================');
  console.log(`服务器已启动: http://${HOST}:${PORT}`);
  console.log(`本地访问: http://localhost:${PORT}`);
  console.log(`局域网访问: http://192.200.238.15:${PORT}`);
  console.log('========================================');
  console.log('按 Ctrl+C 停止服务器');
  console.log('========================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用`);
  } else {
    console.error('服务器错误:', err);
  }
  process.exit(1);
});

