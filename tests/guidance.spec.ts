import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import AxeBuilder from '@axe-core/playwright'
import { courseSchema, answerWordCount } from '../src/features/study/course-schema'

const plan = courseSchema.parse(JSON.parse(await readFile('src/data/plan.json', 'utf8')))
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-26T21:00:00+08:00') })
})

test('全部30天口语与Task 2逐题对应，参考可展开且链接官方材料', async ({ page }) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  for (const lesson of plan.lessons) {
    for (const kind of ['speaking', 'writing'] as const) {
      await page.goto(`/practice/${kind}?date=${lesson.date}`)
      if (kind === 'writing')
        await page.getByRole('button', { name: 'Task 2', exact: true }).click()
      const guide = kind === 'speaking' ? lesson.speakingGuide : lesson.writingGuide
      const panel = page.getByRole('region', { name: '从零开始练习' })
      await expect(panel.getByText(guide.explain, { exact: true })).toBeVisible()
      await expect(panel.getByText(guide.paragraphs[0][0], { exact: true })).toBeHidden()
      await panel.getByText('卡住了？看填空示例', { exact: true }).click()
      await expect(panel.getByText(guide.practice.answer, { exact: true })).toBeVisible()
      await panel.getByText('展开参考答案与中文拆解', { exact: true }).click()
      for (const [en, zh] of guide.paragraphs) {
        await expect(panel.getByText(en, { exact: true })).toBeVisible()
        await expect(panel.getByText(`中文理解：${zh}`, { exact: true })).toBeVisible()
      }
      for (const id of guide.sourceIds) {
        const source = plan.sources.find((s) => s.id === id)!
        await expect(panel.getByRole('link', { name: `${source.name} ↗` })).toHaveAttribute(
          'href',
          source.url,
        )
        expect(['ielts.org', 'takeielts.britishcouncil.org']).toContain(
          new URL(source.url).hostname,
        )
      }
      if (kind === 'writing') expect(answerWordCount(guide)).toBeGreaterThanOrEqual(250)
    }
  }
  expect(errors).toEqual([])
})

test('五组图表对应正确答案，草稿在展开和任务切换后保留', async ({ page }) => {
  const seen = new Set<string>()
  for (const lesson of plan.lessons) {
    if (seen.has(lesson.chart.title)) continue
    seen.add(lesson.chart.title)
    await page.goto(`/practice/writing?date=${lesson.date}`)
    await page.getByRole('button', { name: 'Task 2', exact: true }).click()
    await page.getByLabel('我的英文草稿').fill(`My own task two draft for day ${lesson.number}.`)
    await page.getByRole('button', { name: 'Task 1', exact: true }).click()
    await expect(page.getByRole('table')).toContainText(lesson.chart.title)
    const guide = plan.chartGuides[lesson.chart.title]
    expect(answerWordCount(guide)).toBeGreaterThanOrEqual(150)
    await expect(page.getByText(guide.explain, { exact: true })).toBeVisible()
    const myText = `My own chart draft for day ${lesson.number}.`
    await page.getByLabel('我的英文草稿').fill(myText)
    await page.getByText('展开参考答案与中文拆解', { exact: true }).click()
    await expect(page.getByText(guide.paragraphs[2][0], { exact: true })).toBeVisible()
    await expect(page.getByLabel('我的英文草稿')).toHaveValue(myText)
    await page.getByRole('button', { name: 'Task 2', exact: true }).click()
    await expect(page.getByLabel('我的英文草稿')).toHaveValue(
      `My own task two draft for day ${lesson.number}.`,
    )
    await page.getByRole('button', { name: 'Task 1', exact: true }).click()
    await expect(page.getByLabel('我的英文草稿')).toHaveValue(myText)
    await page.reload()
    await page.getByRole('button', { name: 'Task 1', exact: true }).click()
    await expect(page.getByLabel('我的英文草稿')).toHaveValue(myText)
  }
  expect(seen.size).toBe(5)
})

test('展开带练的手机与桌面布局、键盘、无障碍和口语笔记保留', async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const kind of ['speaking', 'writing'] as const) {
      await page.goto(`/practice/${kind}?date=2026-10-28`)
      const summary = page.getByText('展开参考答案与中文拆解', { exact: true })
      await summary.focus()
      await summary.press('Enter')
      await expect(page.locator('.guide-model')).toHaveAttribute('open', '')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
      await expect(page.getByRole('link', { name: '跳到主要内容' })).not.toBeInViewport()
      await page.getByText('展开参考答案与中文拆解', { exact: true }).scrollIntoViewIfNeeded()
      await page.screenshot({ path: `artifacts/guidance-viewport-${kind}-${width}.png` })
      await page
        .getByRole('region', { name: '从零开始练习' })
        .screenshot({ path: `artifacts/guidance-${kind}-${width}.png` })
    }
  }
  await page.goto('/practice/speaking?date=2026-10-28')
  await page.getByLabel('口语笔记').fill('My own library story, not the sample.')
  await page.getByText('展开参考答案与中文拆解', { exact: true }).click()
  await page.reload()
  await expect(page.getByLabel('口语笔记')).toHaveValue('My own library story, not the sample.')
})
