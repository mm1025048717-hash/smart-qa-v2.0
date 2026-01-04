# 优化 TTS 音质 - 解决电流音问题

## 问题描述
用户反馈回复有电流音，且声音不够好听。

## 问题分析

电流音和音质问题可能的原因：
1. **TTS 服务选择**：当前使用 Cartesia TTS，可能不是最佳选择
2. **音频采样率不匹配**：前后端采样率不一致
3. **音频格式问题**：编码格式导致音质下降
4. **语音 ID 选择**：当前语音 ID 可能不适合中文

## 推荐方案：切换到 Deepgram TTS

**Deepgram TTS 的优势**：
- ✅ **与 STT 共用 API Key** - 您已经有 Deepgram API Key！
- ✅ **免费额度更高**：每月 $200（Cartesia 只有 $10）
- ✅ **质量更好**：自然语音，低延迟
- ✅ **支持中文**：对中文支持更好
- ✅ **无需额外配置**：直接使用现有 API Key

## 解决方案

### 方案 1：切换到 Deepgram TTS（推荐）

1. **修改 .env 文件**：
   ```ini
   TTS_SERVICE=deepgram
   # 使用已有的 DEEPGRAM_API_KEY（与 STT 共用）
   ```

2. **重启后端服务**：
   ```bash
   cd voice-backend
   python voice_bot.py
   ```

3. **验证配置**：
   - 查看日志，应该看到：`✅ 使用 Deepgram TTS（与 STT 共用 API Key）`

### 方案 2：优化 Cartesia TTS 配置

如果继续使用 Cartesia TTS，可以尝试：

1. **更换语音 ID**：
   - 访问 Cartesia Dashboard：https://play.cartesia.ai/
   - 试听不同的语音，选择适合中文的
   - 在 .env 文件中设置新的 VOICE_ID

2. **检查音频采样率**：
   - 确保前后端采样率一致（通常是 24000 Hz）

## 快速切换脚本

您可以手动编辑 `.env` 文件，或使用以下步骤：

1. 打开 `voice-backend\.env` 文件
2. 找到 `TTS_SERVICE=cartesia`
3. 改为 `TTS_SERVICE=deepgram`
4. 保存文件
5. 重启后端服务

## 测试步骤

1. **重启后端服务**
2. **刷新浏览器页面（F5）**
3. **测试语音对话**：
   - 发送语音消息
   - 听回复的音频质量
   - 检查是否还有电流音
4. **对比效果**：
   - 如果使用 Deepgram，应该音质更好
   - 电流音应该明显减少或消失

## 其他建议

如果切换到 Deepgram 后仍有问题：

1. **检查音频设备**：
   - 确保使用高质量的扬声器或耳机
   - 检查音频驱动是否最新

2. **检查网络**：
   - 确保网络连接稳定
   - 避免网络延迟导致的音频问题

3. **检查浏览器**：
   - 尝试不同的浏览器（Chrome、Edge 等）
   - 清除浏览器缓存

