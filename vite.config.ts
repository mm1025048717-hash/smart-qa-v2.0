import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署需要设置 base 路径
  base: process.env.NODE_ENV === 'production' ? '/smart-qa-v2.0/' : '/',
  server: {
    port: 3000,
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
  }
})


