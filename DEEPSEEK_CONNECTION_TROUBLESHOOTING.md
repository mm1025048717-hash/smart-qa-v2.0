# DeepSeek API 连接问题排查指南

## 🔍 问题诊断步骤

### 步骤 1：检查浏览器控制台错误

1. 打开网站：`http://localhost:8080`
2. 按 `F12` 打开开发者工具
3. 切换到 **Console（控制台）** 标签
4. 尝试发送一条消息
5. 查看是否有错误信息

**常见错误信息：**
- `401 Unauthorized` → API Key 无效或已过期
- `403 Forbidden` → API Key 权限不足
- `Failed to fetch` → 网络连接问题
- `CORS error` → 跨域问题

### 步骤 2：检查 Network 请求

1. 在开发者工具中切换到 **Network（网络）** 标签
2. 发送一条消息
3. 查找 `/api/deepseek` 的请求
4. 点击查看详情：
   - **Status（状态码）**：应该是 200
   - **Request Headers（请求头）**：检查 `Authorization` 是否包含 API Key
   - **Response（响应）**：查看错误信息

### 步骤 3：验证 API Key 是否有效

#### 方法 A：使用 curl 测试（如果有命令行）

```bash
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer 你的API-Key"
```

如果返回模型列表，说明 API Key 有效。

#### 方法 B：在浏览器中测试

1. 打开：`https://platform.deepseek.com/`
2. 登录账号
3. 进入 **API Keys** 页面
4. 检查 API Key 是否还有配额
5. 如果过期，创建新的 API Key

## 🔧 解决方案

### 方案 1：更新 API Key（最可能的原因）

如果 API Key 过期了，需要更新：

1. **获取新的 API Key**
   - 访问：https://platform.deepseek.com/
   - 登录后创建新的 API Key

2. **更新本地代码**
   - 编辑 `src/services/deepseekApi.ts` 第 5 行
   - 将旧的 API Key 替换为新的

3. **重新构建**
   ```bash
   npm run build
   ```

4. **重启服务器**
   - 停止当前服务器（Ctrl+C）
   - 重新运行：`node server.js`

5. **清除浏览器缓存**
   - 按 `Ctrl + Shift + Delete` 清除缓存
   - 或按 `Ctrl + F5` 强制刷新

### 方案 2：检查服务器代理配置

确认 `server.js` 中的代理配置正确：

```javascript
// 检查这行是否正确
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '你的API-Key';
```

### 方案 3：使用环境变量（推荐）

1. **创建 `.env` 文件**（项目根目录）
   ```env
   VITE_DEEPSEEK_API_KEY=你的新API-Key
   DEEPSEEK_API_KEY=你的新API-Key
   ```

2. **重新构建和重启**
   ```bash
   npm run build
   node server.js
   ```

## 🚨 常见错误及解决方法

### 错误 1：401 Unauthorized

**原因**：API Key 无效或已过期

**解决**：
1. 检查 API Key 是否正确
2. 确认 API Key 没有过期
3. 在 DeepSeek 控制台检查 API Key 状态

### 错误 2：403 Forbidden

**原因**：API Key 权限不足或被限制

**解决**：
1. 检查 API Key 是否有足够的权限
2. 确认账户是否有余额
3. 检查是否达到速率限制

### 错误 3：Failed to fetch / Network Error

**原因**：网络连接问题或代理配置错误

**解决**：
1. 检查网络连接
2. 确认 `server.js` 正在运行
3. 检查防火墙是否阻止了连接
4. 尝试直接访问 `https://api.deepseek.com` 测试网络

### 错误 4：CORS Error

**原因**：跨域请求被阻止

**解决**：
1. 确认使用 `server.js` 作为代理（已配置 CORS）
2. 不要直接从前端调用 DeepSeek API
3. 所有请求应该通过 `/api/deepseek` 代理

## 📝 快速检查清单

- [ ] 浏览器控制台是否有错误信息？
- [ ] Network 标签中 `/api/deepseek` 请求的状态码是什么？
- [ ] API Key 是否过期？
- [ ] 是否重新构建了代码？
- [ ] 是否重启了服务器？
- [ ] 是否清除了浏览器缓存？
- [ ] `server.js` 是否正在运行？
- [ ] 网络连接是否正常？

## 🔗 相关链接

- DeepSeek API 文档：https://api-docs.deepseek.com/zh-cn/
- DeepSeek 控制台：https://platform.deepseek.com/
- API Key 更新指南：`docs/API_KEY_UPDATE.md`



