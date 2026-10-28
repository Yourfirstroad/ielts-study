import { chromium, expect } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, sep, extname } from 'node:path'

// A strict static server (no SPA fallback) reproduces the GitHub Pages path constraint.
const base =
  `/${(process.env.PAGES_BASE_PATH ?? '/ielts-study/').replace(/^\/+|\/+$/g, '')}/`.replace(
    /\/+/g,
    '/',
  )
const directory = resolve('dist-pages')
const localPlan = JSON.parse(
  await readFile(new URL('../src/data/plan.json', import.meta.url), 'utf8'),
)
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}
let server
let target = process.argv[2]
if (!target) {
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      if (!pathname.startsWith(base)) {
        response.writeHead(404).end()
        return
      }
      const filename = resolve(directory, pathname.slice(base.length) || 'index.html')
      if (!filename.startsWith(directory + sep)) {
        response.writeHead(403).end()
        return
      }
      const content = await readFile(filename)
      response
        .writeHead(200, { 'Content-Type': mime[extname(filename)] || 'application/octet-stream' })
        .end(content)
    } catch {
      response.writeHead(404).end()
    }
  })
  await new Promise((ok, fail) => {
    server.once('error', fail)
    server.listen(0, '127.0.0.1', ok)
  })
  target = `http://127.0.0.1:${server.address().port}${base}`
}
const origin = new URL(target).origin
const channel = process.env.PLAYWRIGHT_CHANNEL || (process.env.CI ? 'chromium' : 'chrome')
let browser
try {
  browser = await chromium.launch({
    headless: true,
    ...(channel === 'chromium' ? {} : { channel }),
  })
  const errors = []
  const routes = [
    '/',
    '/vocabulary',
    '/practice/listening',
    '/practice/reading',
    '/practice/speaking',
    '/practice/writing',
    '/resources',
    '/progress',
    '/settings',
  ]
  for (const width of [1440, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } })
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('response', (response) => {
      if (response.url().startsWith(origin) && response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`)
    })
    await page.clock.install({ time: new Date('2026-10-28T13:00:00+08:00') })
    for (const route of routes) {
      const response = await page.goto(`${target}#${route}`)
      if (response) expect(response.status()).toBe(200)
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByText('没有找到这个页面', { exact: true })).toHaveCount(0)
      expect((await page.reload()).status()).toBe(200)
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }
    await page
      .getByRole('navigation', { name: '主要导航' })
      .getByRole('link', { name: '今日学习', exact: true })
      .click()
    await expect(page.getByRole('heading', { name: '今天，也向 6.5 靠近一点。' })).toBeVisible()
    await expect(
      page.getByText(`${localPlan.lessons.length} 天课程 · 第 1 天`, { exact: true }),
    ).toBeVisible()
    const beforeSkip = page.url()
    const skipLink = page.getByRole('link', { name: '跳到主要内容' })
    await skipLink.focus()
    await skipLink.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    await expect(page).toHaveURL(beforeSkip)
    const done = page.getByRole('checkbox', { name: '词汇完成状态' })
    await done.check()
    await page.reload()
    await expect(done).toBeChecked()
    await page.goto(`${target}#/practice/writing`)
    const draft = page.getByLabel('我的英文草稿')
    await draft.fill('Public libraries give people access to useful learning resources.')
    await page.reload()
    await expect(draft).toHaveValue(
      'Public libraries give people access to useful learning resources.',
    )
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href')
    expect((await context.request.get(new URL(favicon, page.url()).href)).status()).toBe(200)
    const planResponse = await context.request.get(`${target}courses/plan.json`)
    expect(planResponse.status()).toBe(200)
    const plan = await planResponse.json()
    expect(plan).toEqual(localPlan)
    await page.goto(`${target}#/?date=2026-11-26`)
    await expect(
      page.getByText(`${localPlan.lessons.length} 天课程 · 第 30 天`, { exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('checkbox', { name: '词汇完成状态' })).toBeDisabled()
    await context.close()
  }
  const isolated = await browser.newContext()
  const newVisitor = await isolated.newPage()
  await newVisitor.goto(target)
  await expect(newVisitor.getByRole('checkbox', { name: '词汇完成状态' })).not.toBeChecked()
  await isolated.close()
  expect(errors).toEqual([])
  console.log(
    JSON.stringify({
      target,
      routeRefreshChecks: 18,
      viewports: [1440, 375],
      checklistPersistence: true,
      draftPersistence: true,
      visitorIsolation: true,
      skipLink: true,
      pageErrors: errors,
    }),
  )
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.close(resolve))
}
