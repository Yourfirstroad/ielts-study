import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const isPages = mode === 'github-pages'
  const pagesBase = process.env.PAGES_BASE_PATH ?? '/ielts-study/'
  return {
    plugins: [react(), tailwindcss()],
    base: isPages ? `/${pagesBase.replace(/^\/+|\/+$/g, '')}/`.replace(/\/+/g, '/') : '/',
    build: { outDir: isPages ? 'dist-pages' : 'dist' },
    server: {
      watch: { ignored: ['**/playwright-report/**', '**/test-results/**', '**/artifacts/**'] },
    },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  }
})
