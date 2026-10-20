import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// MARS LMS — CEO Dashboard
// Dedicated dev port so it can run alongside the other mars-* panels.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors so navigation stays fast and caching is stable.
        manualChunks: {
          react: [
            'react',
            'react-dom',
            'react-router-dom',
            'react-redux',
            '@reduxjs/toolkit',
            'redux-persist',
          ],
          charts: ['recharts'],
          motion: ['motion'],
        },
      },
    },
  },
})
