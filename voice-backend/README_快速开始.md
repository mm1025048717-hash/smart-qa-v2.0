# 🚀 快速开始 - 3 步搞定

## 方法 1: 全自动配置（推荐）⭐

**只需双击一个文件，全部自动完成！**

1. **双击运行 `全自动配置.bat`**
   - 自动提取 DeepSeek API Key
   - 自动安装依赖
   - 自动打开 API Key 获取页面（如果需要）

2. **配置 API Keys（如果需要）**
   - 如果浏览器自动打开了注册页面，按提示注册并获取 API Keys
   - 编辑 `.env` 文件，替换占位符为实际的 API Keys

3. **启动服务**
   ```bash
   start.bat
   ```

**完成！** 🎉

---

## 方法 2: 分步操作

### 步骤 1: 自动配置
```bash
自动配置.bat
```

### 步骤 2: 安装依赖
```bash
install.bat
```

### 步骤 3: 配置 API Keys（如果需要）
编辑 `.env` 文件，填写：
- `DEEPGRAM_API_KEY`（语音转文字）
- `OPENAI_API_KEY`（文字转语音）

### 步骤 4: 启动服务
```bash
start.bat
```

---

## 已自动配置的内容 ✅

- ✅ **DeepSeek API Key**: 已从项目中自动提取并配置
- ✅ **WebSocket 配置**: 已自动设置（localhost:8765）
- ✅ **依赖安装**: 自动检测并安装

---

## 需要手动配置的内容 ⚠️

### Deepgram API Key（语音转文字）

**免费获取**:
1. 访问：https://console.deepgram.com/signup
2. 注册账号（免费）
3. 创建 API Key
4. 复制到 `.env` 文件的 `DEEPGRAM_API_KEY`

**免费额度**: 每月 $200，足够使用

---

### OpenAI API Key（文字转语音）

**免费获取**:
1. 访问：https://platform.openai.com/api-keys
2. 注册账号
3. 创建 API Key
4. 复制到 `.env` 文件的 `OPENAI_API_KEY`

**免费额度**: 新用户 $5

**替代方案**: 可以使用其他 TTS 服务（详见 `获取API密钥指南.md`）

---

## 一键启动

配置完成后，直接运行：

```bash
一键配置并启动.bat
```

这会自动完成所有配置并启动服务！

---

## 常见问题

### Q: 可以不配置 Deepgram/OpenAI 吗？
A: 可以！DeepSeek 功能（文字对话）不需要这两个 API Keys。只有语音功能需要。

### Q: 如何测试是否配置成功？
A: 运行 `start.bat`，如果看到 "WebSocket server ready" 就说明配置成功。

### Q: API Keys 在哪里填写？
A: 编辑 `voice-backend/.env` 文件，找到对应的行替换即可。

---

## 下一步

配置完成后，查看 `README.md` 了解如何使用语音功能！

