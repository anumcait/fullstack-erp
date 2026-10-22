import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization, ngrok-skip-browser-warning',
    },
    allowedHosts: [
      'caprice-endamebic-lyndon.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app',
      'localhost',
      '127.0.0.1',
    ],
    hmr: {
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'xlsx',
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
