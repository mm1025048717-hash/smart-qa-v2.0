#!/usr/bin/env node
/**
 * 更新 server.js 中的 DeepSeek API Key
 * 使用方法: node scripts/更新DeepSeekAPIKey.js <your-api-key>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const serverJsPath = path.join(projectRoot, 'server.js');

// 从命令行参数获取 API Key
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ 错误: 请提供 DeepSeek API Key');
  console.log('');
  console.log('使用方法:');
  console.log('  node scripts/更新DeepSeekAPIKey.js <your-api-key>');
  console.log('');
  console.log('示例:');
  console.log('  node scripts/更新DeepSeekAPIKey.js sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  process.exit(1);
}

// 验证 API Key 格式
if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
  console.error('❌ 错误: API Key 格式不正确');
  console.log('API Key 应该以 "sk-" 开头，长度至少 20 个字符');
  process.exit(1);
}

try {
  // 读取 server.js
  let content = fs.readFileSync(serverJsPath, 'utf-8');
  
  // 匹配并替换 API Key
  // 匹配: const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'old-key';
  const pattern = /(const DEEPSEEK_API_KEY = process\.env\.DEEPSEEK_API_KEY \|\| )'[^']*'/;
  
  if (pattern.test(content)) {
    content = content.replace(pattern, `$1'${apiKey}'`);
    fs.writeFileSync(serverJsPath, content, 'utf-8');
    console.log('✅ 成功更新 server.js 中的 DeepSeek API Key');
    console.log(`   新 Key: ${apiKey.substring(0, 20)}...`);
    console.log('');
    console.log('💡 提示: 请重启服务器使更改生效');
  } else {
    console.error('❌ 错误: 无法在 server.js 中找到 API Key 配置');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ 错误:', error.message);
  process.exit(1);
}


