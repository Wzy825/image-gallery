import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 路径别名：@ 指向 src，避免深层相对路径
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      // 开发环境将 /api 请求代理到本地后端，避免跨域
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // 代码分割：第三方依赖分包，配合路由懒加载减小首屏包体积
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios']
        }
      }
    }
  }
});
