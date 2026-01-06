# 配置 DeepSeek API 密钥

## 🔑 问题说明

如果遇到 `401 Unauthorized` 错误，说明 DeepSeek API Key 未正确配置。

## 📝 配置步骤

### 方法 1：使用环境变量文件（推荐）

1. **创建 `.env` 文件**
   
   在项目根目录创建 `.env` 文件（与 `package.json` 同级）

2. **添加 API Key**
   
   ```env
   VITE_DEEPSEEK_API_KEY=sk-your-actual-api-key-here
   ```
   
   ⚠️ **重要**：
   - 将 `sk-your-actual-api-key-here` 替换为您的真实 API Key
   - API Key 应该以 `sk-` 开头
   - 不要将 `.env` 文件提交到 Git（已在 .gitignore 中）

3. **获取 API Key**
   
   - 访问 https://platform.deepseek.com/
   - 注册/登录账号
   - 在控制台创建 API Key

4. **重启开发服务器**
   
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 然后重新启动
   npm run dev
   ```

### 方法 2：直接在代码中配置（仅用于测试，不推荐）

⚠️ **警告**：此方法仅用于快速测试，不要在生产环境使用！

1. 编辑 `src/services/deepseekApi.ts`
2. 找到第 6 行：
   ```typescript
   const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
   ```
3. 修改为：
   ```typescript
   const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-your-api-key-here';
   ```

## ✅ 验证配置

配置完成后，打开浏览器开发者工具（F12），查看 Console：

- ✅ **成功**：应该看到 `[LangChain Service] 🚀 开始调用 DeepSeek API` 日志
- ❌ **失败**：如果仍然看到 `401 Unauthorized`，请检查：
  1. API Key 是否正确
  2. `.env` 文件是否在项目根目录
  3. 是否重启了开发服务器
  4. API Key 是否以 `sk-` 开头

## 🔍 调试技巧

### 检查 API Key 是否被读取

在浏览器控制台运行：
```javascript
console.log('API Key:', import.meta.env.VITE_DEEPSEEK_API_KEY ? '已配置' : '未配置');
```

### 检查环境变量

在 `src/services/langchain/aimaLangChainService.ts` 中，已经有日志输出 API Key 的前8位：
```typescript
apiKey: DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.slice(0, 8)}...` : '未设置',
```

## 📚 相关文件

- `src/services/deepseekApi.ts` - 主 API 服务
- `src/services/langchain/aimaLangChainService.ts` - LangChain 风格服务
- `vite.config.ts` - Vite 代理配置
- `.env` - 环境变量文件（需要创建）

## 🆘 常见问题

### Q: 为什么修改了 `.env` 文件后还是报错？

A: Vite 只在启动时读取环境变量。修改 `.env` 后必须重启开发服务器。

### Q: API Key 格式是什么？

A: DeepSeek API Key 格式为 `sk-` 开头，后面跟着一串字符，例如：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Q: 如何获取免费的 API Key？

A: 访问 https://platform.deepseek.com/ 注册账号，通常有免费额度。

### Q: 代理配置不工作怎么办？

A: 如果 Vite 代理有问题，可以：
1. 检查 `vite.config.ts` 中的代理配置
2. 或者直接使用 `https://api.deepseek.com/v1`（需要处理 CORS）

