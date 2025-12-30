const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 静态文件服务

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-e8312e0eae874f2f9122f6aa334f4b3f';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 存储对话历史（实际项目中应使用数据库）
const conversationHistory = new Map();

// 聊天API端点
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, model = 'deepseek-chat', stream = false, systemPrompt = null, temperature = 0.7 } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 获取或创建对话历史
    const conversationIdKey = conversationId || 'default';
    if (!conversationHistory.has(conversationIdKey)) {
      conversationHistory.set(conversationIdKey, []);
    }
    const messages = conversationHistory.get(conversationIdKey);

    // 如果有system prompt，检查是否已有system message，如果没有则添加
    if (systemPrompt) {
      const hasSystemMessage = messages.some(msg => msg.role === 'system');
      if (!hasSystemMessage) {
        // 将system message插入到最前面
        messages.unshift({
          role: 'system',
          content: systemPrompt
        });
      } else if (messages.length > 0 && messages[0].role === 'system') {
        // 如果第一条是system message，更新它（允许动态更新system prompt）
        messages[0].content = systemPrompt;
      }
    }

    // 添加用户消息
    messages.push({
      role: 'user',
      content: message
    });

    // 准备请求到DeepSeek API
    const requestData = {
      model: model,
      messages: messages,
      stream: stream,
      temperature: temperature
    };

    // 调用DeepSeek API
    const response = await axios.post(DEEPSEEK_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      timeout: 60000 // 60秒超时
    });

    const assistantMessage = response.data.choices[0].message.content;

    // 添加助手回复到历史记录
    messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    // 返回响应
    res.json({
      success: true,
      message: assistantMessage,
      conversationId: conversationIdKey,
      usage: response.data.usage || null
    });

  } catch (error) {
    console.error('DeepSeek API错误:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || '服务器错误，请稍后重试',
      details: error.message
    });
  }
});

// 流式聊天API端点
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, conversationId, model = 'deepseek-chat', systemPrompt = null, temperature = 0.7 } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 获取或创建对话历史
    const conversationIdKey = conversationId || 'default';
    if (!conversationHistory.has(conversationIdKey)) {
      conversationHistory.set(conversationIdKey, []);
    }
    const messages = conversationHistory.get(conversationIdKey);

    // 如果有system prompt且历史记录为空，添加system message
    if (systemPrompt && messages.length === 0) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // 添加用户消息
    messages.push({
      role: 'user',
      content: message
    });

    // 准备请求到DeepSeek API（流式）
    const requestData = {
      model: model,
      messages: messages,
      stream: true,
      temperature: temperature
    };

    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 调用DeepSeek API（流式）
    const response = await axios.post(DEEPSEEK_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      responseType: 'stream',
      timeout: 60000
    });

    let fullResponse = '';

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // 流结束，保存完整回复到历史
            messages.push({
              role: 'assistant',
              content: fullResponse
            });
            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // 忽略JSON解析错误
          }
        }
      }
    });

    response.data.on('end', () => {
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('流式响应错误:', error);
      res.write(`data: ${JSON.stringify({ error: '流式响应中断' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('流式聊天API错误:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || '服务器错误，请稍后重试'
    });
  }
});

// 清除对话历史
app.post('/api/chat/clear', (req, res) => {
  const { conversationId } = req.body;
  const conversationIdKey = conversationId || 'default';
  
  if (conversationHistory.has(conversationIdKey)) {
    conversationHistory.delete(conversationIdKey);
  }
  
  res.json({ success: true, message: '对话历史已清除' });
});

// 获取对话历史
app.get('/api/chat/history/:conversationId', (req, res) => {
  const conversationId = req.params.conversationId || 'default';
  const messages = conversationHistory.get(conversationId) || [];
  
  res.json({
    success: true,
    messages: messages
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!DEEPSEEK_API_KEY
  });
});

// 提供前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`DeepSeek API Key: ${DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
});

