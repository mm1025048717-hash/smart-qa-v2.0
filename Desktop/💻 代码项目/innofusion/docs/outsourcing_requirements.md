# Bubble Fusion Lab｜外包需求清单（可直接对外）

## 1. 目标与里程碑
- 目标：交付一版对外可访问的 MVP，支持气泡融合 + DeepSeek V3 建议、附件、导出、监控与文档。
- 里程碑：
  - T+2 天：上线环境（前后端、域名/CORS、健康检查）
  - T+5 天：交互/性能/稳定性优化，监控与文档
  - T+7 天：跨端测试与验收

## 2. 现状（甲方已完成）
- 前端（Vite + React + Tailwind）
  - 气泡创建/编辑/拖拽；拖拽松手融合；框选多选；类型颜色（pdf/image/video/doc/audio）
  - 动效：融合线条+涟漪；等待层；底部图标化对话框；案例面板；附件面板（左侧，不遮挡）；JSON 导出
- 后端（Node 20 + Express）
  - `/api/health`、`/api/fuse/suggest`（DeepSeek V3 优先，JSON 容错）、`/api/score`（占位）
  - Helmet/CORS/速率限制/Dockerfile；Render 蓝图 `render.yaml`
- AI：DeepSeek V3（`deepseek-chat`），仅后端持密钥

## 3. 工作范围（SOW）
- 部署运维
  - 用 Render/Railway 等部署：后端 Web Service、前端 Static Site；自定义域名与 SSL
  - 前端永久注入 `window.__BFL_API__` 指向后端；移除前端密钥；CORS 白名单前端域名
- 后端完善
  - `POST /api/fuse/suggest`：DeepSeek V3，严格 JSON 输出，超时/重试/退避，错误兜底
  - `POST /api/score`：返回 `{ radar:{ novelty,brandFit,feasibility,cost,risk } }`（0–5）
  - 统一日志/错误码；可观测性（Sentry/Logtail）；健康检查/状态页
- 前端优化
  - 仅“拖拽松手”触发融合；去除靠近自动融合；重复触发保护
  - 动效升级（无阻塞），按钮/图标激活态与 Tooltip，发送禁用态提示（需≥2 气泡/框选）
  - 详情面板小屏自适应；附件容量与类型校验（默认 20MB）
- 导出与数据
  - 现有 JSON 导出；新增 Markdown 导出（路线/建议/日志），PDF 可选
- 监控与打点
  - 埋点：`bubble_create/drag_start/drag_end/fusion_hit/fusion_accept/export_json`
  - 接入 Sentry/Logtail 并提供查看入口
- 文档与交付
  - 部署/回滚/运维手册；前后端联调说明；API 文档；常见问题

## 4. 非范围（MVP 之后）
- 多人协作、权限矩阵、品牌守则校验、外链评审、Pitch 5–8 页导出、版本溯源树

## 5. 技术与接口约定
- 技术栈：Node 20、Express、Vite+React、Tailwind、Framer Motion、Docker、Render
- API 契约：
  - `POST /api/fuse/suggest`
    - Req: `{ a:string, b:string, context?:{ prompt?:string, model?:string, temperature?:number } }`
    - Res: `{ title:string, notes:string }`
  - `GET /api/health` → `{ ok:true }`
  - `POST /api/score` → `{ radar:{ novelty,brandFit,feasibility,cost,risk } }`
- 环境变量（后端）：`DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL=https://api.deepseek.com`、`PORT=7070`
- 安全：仅后端持密钥；CORS 白名单；速率限制默认 60 req/min；敏感日志脱敏

## 6. 性能与体验指标（验收）
- 首次融合 TTI < 3s（含模型返回）；移动端帧率 ≥ 45fps；交互无卡顿、无重复气泡
- 融合仅在“松手”触发；断网/超时有本地兜底与可视反馈；动画不阻塞输入

## 7. 测试与验收
- 浏览器：Chrome/Edge/Safari/iOS/Android 最新两版
- 用例：二元融合、框选融合、附件上传/下载、JSON/Markdown 导出、DeepSeek 失败回退
- 交付：前端 URL、后端 URL、健康检查、告警示例、完整文档与源码 PR

## 8. 权限与交付物
- 需要：GitHub 写权限、云平台项目访问（仅甲方配置 `DEEPSEEK_API_KEY`）
- 交付：线上环境、脚本与配置（`render.yaml`/Dockerfile）、运维与联调文档、变更记录

## 9. 工期与沟通
- 工期：7 天（2 天上线、3 天优化、2 天测试验收）
- 沟通：日报/站会，问题响应 ≤ 24h；紧急通道（P1 ≤ 4h 响应）

## 10. 付款与保修（建议）
- 30% 启动 + 40% 上线 + 30% 验收；30 天线上保修（P1 ≤ 4h 响应）

---
**附：DeepSeek 文档**
- 模型与价格：https://api-docs.deepseek.com/zh-cn/quick_start/pricing
- API 基本信息：https://api-docs.deepseek.com/zh-cn/api/deepseek-api
