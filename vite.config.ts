import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

const isSkipElectron = process.env.SKIP_ELECTRON === 'true'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: resolve(__dirname, 'src-electron/main.ts'),
        onstart(options) {
          if (isSkipElectron) {
            console.log('[vite] Skipping Electron startup (SKIP_ELECTRON=true)')
            return
          }
          if (options.startup) {
            options.startup()
          }
        },
        vite: {
          root: __dirname,
          build: {
            sourcemap: true,
            minify: process.env.NODE_ENV === 'production',
            outDir: resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: resolve(__dirname, 'src-electron/preload.ts'),
        onstart(options) {
          if (isSkipElectron) return
          if (options.reload) {
            options.reload()
          }
        },
        vite: {
          root: __dirname,
          build: {
            sourcemap: true,
            minify: process.env.NODE_ENV === 'production',
            outDir: resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src-renderer'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },
  root: resolve(__dirname, 'src-renderer'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    allowedHosts: ['.monkeycode-ai.online']
  }
})
