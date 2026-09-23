import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:8080', '/healthz': 'http://localhost:8080' },
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
