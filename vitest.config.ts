import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    electron({ entry: 'src-electron/main.ts' })
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src-electron/**/*.ts'],
      exclude: ['src-electron/main.ts', 'src-electron/preload.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src-renderer'),
      '@electron': path.resolve(__dirname, './src-electron'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  }
})
