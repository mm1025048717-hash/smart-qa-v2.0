# Bubble Fusion Lab - 创意气泡爆炸器

把"碎片灵感"变成"可复用创意资产"的可视化工具。通过拖拽气泡进行融合，生成新的创意并获得 AI 建议。

## 功能特性

### 已实现 (MVP)
- ✅ **拖拽创建和融合**：直观的拖拽操作，气泡靠近时自动触发融合
- ✅ **💥 爆炸动画**：炫酷的粒子爆炸效果
- ✅ **AI 建议生成**：四象限建议（卖点/反共识/验证/话术）
- ✅ **融合历史日志**：完整记录所有融合事件
- ✅ **JSON 导出**：导出所有气泡和融合历史
- ✅ **移动端优化**：支持触控操作，长按拖拽
- ✅ **性能优化**：低配模式开关，动画降级
- ✅ **搜索功能**：快速查找气泡
- ✅ **可编辑气泡**：点击编辑按钮修改文本
- ✅ **响应式设计**：适配各种屏幕尺寸

## 快速开始

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **访问应用**
打开浏览器访问 http://localhost:3000

## 使用指南

### 基础操作
- **添加气泡**：点击顶部工具栏的 + 按钮
- **编辑气泡**：鼠标悬停在气泡上，点击编辑图标
- **融合气泡**：拖动一个气泡靠近另一个，当出现光环时松手
- **查看历史**：点击历史图标查看所有融合记录
- **导出数据**：点击下载图标导出 JSON 文件

### 移动端操作
- **长按拖拽**：长按气泡 300ms 后开始拖拽
- **震动反馈**：融合成功时会有震动反馈（支持的设备）

### 性能优化
- **低配模式**：点击眼睛图标切换，关闭阴影和动画效果

## DeepSeek 后端代理（推荐）

提供一个最简 Node 代理，带重试与内存缓存，避免前端直连模型：

1. 安装并启动
```bash
npm run server # 需要环境变量 DEEPSEEK_API_KEY
# 或：DEEPSEEK_API_KEY=sk-xxx npm run server
```

2. 前端指向代理
在 `index.html` 设置：
```html
<script>
  window.__BFL_API__ = 'http://localhost:7070';
  // 建议移除 window.__DEEPSEEK_KEY__，仅走代理
</script>
```

3. API 接口（同时支持 DeepSeek 与阿里百炼兼容模式）
```
POST /api/fuse/suggest
Body: {
  "a": "文本A",
  "b": "文本B",
  "context": {
    "prompt": "...",
    "detail": true,
    // 选其一：
    // 1) DeepSeek: provider 不填或 "deepseek"，model: "deepseek-chat"
    // 2) 阿里百炼兼容模式：provider: "ali" 或 model: "ali:qwen-turbo"（示例）
    "provider": "ali",
    "model": "qwen-turbo"
  }
}
Response: { "title": "融合标题", "notes": "建议内容", "structured": { ... }, "provider": "deepseek-proxy" | "proxy-cache" }
```

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

## 项目结构

```
innofusion/
├── src/
│   ├── components/      # React 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── utils/          # 工具函数
│   └── styles/         # 样式文件
├── public/             # 静态资源
└── package.json        # 项目配置
```

## 核心指标

- **激活**：新用户 60 秒内完成首次融合
- **参与**：单次会话 ≥3 次融合
- **导出**：导出占比 ≥20%
- **性能**：移动端 ≥45fps，融合响应 <120ms

## 部署

### 快速部署

查看 [QUICK_START.md](./QUICK_START.md) 了解 5 分钟快速部署指南。

### 详细部署文档

查看 [DEPLOY.md](./DEPLOY.md) 了解完整的部署说明，包括：
- GitHub 仓库设置
- Vercel 前端部署
- Railway/Render 后端部署
- MongoDB Atlas 配置
- 环境变量设置

### 部署架构

- **前端**: Vercel (React + Vite)
- **后端**: Railway/Render/Fly.io (Express + Socket.IO)
- **数据库**: MongoDB Atlas

## 后续计划

- [ ] 多人协作
- [ ] 云端存储
- [ ] 路线卡功能
- [ ] PPT 导出
- [ ] 品牌守则校验
- [ ] Figma 集成

## License

MIT
