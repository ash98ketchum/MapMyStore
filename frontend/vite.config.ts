import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  /* ── NEW: proxy FE → BE for JSON API ─────────────────────────────── */
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // ← backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
