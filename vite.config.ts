import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 部署到自定义服务器使用根路径
  // Vercel 部署时确保使用根路径
  base: process.env.VERCEL ? '/' : '/',
  server: {
    port: 5173, // 使用 Vite 默认端口，与启动脚本一致
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepseek/, ''),
        secure: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})


