# Bubble Fusion Lab API

## 本地运行
1. 进入目录
```
cd server
```
2. 安装依赖并启动
```
npm i
npm run dev
```

环境变量：
- DEEPSEEK_API_KEY — DeepSeek 密钥
- DEEPSEEK_BASE_URL — 默认为 https://api.deepseek.com
- PORT — 默认为 7070

## 接口
- GET /api/health
- POST /api/fuse/suggest → { title, notes }
- POST /api/score → { radar }

## Docker
```
cd server
docker build -t bfl-api .
docker run -it --rm -p 7070:7070 -e DEEPSEEK_API_KEY=xxxx bfl-api
```

## 部署建议
- Render：新建 Web Service，Root 指向 server/，Start Command: node src/app.js
- Railway/Fly/Heroku：同上；配置环境变量 DEEPSEEK_API_KEY
