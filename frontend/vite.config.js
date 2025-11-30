import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  // Add base path for Vercel deployment
  base: '/',
  // Configure build output for Vercel
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
});