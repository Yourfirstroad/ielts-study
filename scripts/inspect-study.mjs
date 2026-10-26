import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
await mkdir('artifacts', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('http://127.0.0.1:5186/')
  await page.getByRole('heading', { name: '今天，也向 6.5 靠近一点。' }).waitFor()
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true })
  await page.screenshot({ path: 'artifacts/preview.png', fullPage: false })
  console.log(
    JSON.stringify({
      headings: await page.locator('h1,h2,h3').allTextContents(),
      links: await page
        .getByRole('navigation', { name: '主要导航' })
        .getByRole('link')
        .allTextContents(),
      errors,
    }),
  )
  await page.setViewportSize({ width: 375, height: 900 })
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true })
} finally {
  await browser.close()
}
