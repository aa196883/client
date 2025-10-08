import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Use the function form so Vite passes { mode }
export default defineConfig(({ mode }) => {
  // Load .env(.production) from the project root (cwd where you run the build)
  const root = process.cwd()
  const env = loadEnv(mode, root, '') // '' -> load all (not just VITE_)

  // Prefer .env value, then shell ENV, then fallback
  let base = env.VITE_PUBLIC_BASE || process.env.VITE_PUBLIC_BASE || '/'

  // Ensure trailing slash for Vite
  if (!base.endsWith('/')) base += '/'

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: 'build/',
    },
    base,
  }
})