import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/__test__/**',
        'src/main.tsx',
      ],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
    },
  },
  server: {
    port: 3000,
  },
})
