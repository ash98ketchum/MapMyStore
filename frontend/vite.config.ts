import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Fix for lucide-react optimization warning
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  /**
   * ─────────────────────────────────────────────
   * Dev Server Configuration
   * ─────────────────────────────────────────────
   * This proxy allows frontend to call `/api/*`
   * without CORS issues during local development.
   *
   * Example:
   *   fetch('/api/beacons')
   * → forwarded to http://localhost:4000/api/beacons
   */
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },

  /**
   * ─────────────────────────────────────────────
   * Production Build
   * ─────────────────────────────────────────────
   */
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
});
