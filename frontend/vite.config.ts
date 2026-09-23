import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 9000,
    strictPort: true,
    proxy: { '/api': 'http://localhost:8080', '/healthz': 'http://localhost:8080' },
  },
  preview: {
    host: '127.0.0.1',
    port: 9000,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/components/calculator/**', 'src/lib/**'],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
      reporter: ['text', 'html'],
    },
  },
})
