# 多阶段构建：先构建前端，再用Nginx服务
# 阶段1：构建前端
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建前端（生成dist目录）
RUN npm run build

# 阶段2：使用Nginx服务静态文件
FROM nginx:alpine

# 复制构建好的文件到Nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口（HTTP默认端口，访问时不需要加:80）
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]












