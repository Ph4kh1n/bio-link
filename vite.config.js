import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ig': {
        target: 'https://www.instagram.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ig/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        },
      },
    },
  },
})
