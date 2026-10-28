import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

const courseFile = new URL('./src/data/plan.json', import.meta.url)

export default defineConfig(({ mode }) => {
  const isPages = mode === 'github-pages'
  const pagesBase = process.env.PAGES_BASE_PATH ?? '/ielts-study/'
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'publish-course-data',
        configureServer(server) {
          server.middlewares.use('/courses/plan.json', (_request, response) => {
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.setHeader('Cache-Control', 'no-store')
            response.end(readFileSync(courseFile))
          })
        },
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'courses/plan.json',
            source: readFileSync(courseFile, 'utf8'),
          })
        },
      },
    ],
    base: isPages ? `/${pagesBase.replace(/^\/+|\/+$/g, '')}/`.replace(/\/+/g, '/') : '/',
    build: { outDir: isPages ? 'dist-pages' : 'dist' },
    server: {
      watch: { ignored: ['**/playwright-report/**', '**/test-results/**', '**/artifacts/**'] },
    },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  }
})
