import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://bolster-sufari.onrender.com',
        changeOrigin: true,
      },
      '/media': {
        target: 'https://bolster-sufari.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
