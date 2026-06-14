import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/survey/check':       'http://localhost:8000',
      '/survey/start':       'http://localhost:8000',
      '/survey/progress':    'http://localhost:8000',
      '/survey/verify-code': 'http://localhost:8000',
      '/survey/submit':      'http://localhost:8000',
      '/healthz':            'http://localhost:8000',
    }
  }
})