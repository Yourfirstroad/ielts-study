import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import AxeBuilder from '@axe-core/playwright'

const plan = JSON.parse(await readFile('src/data/plan.json', 'utf8'))
const KEY = 'ielts-study-78a4ab06:study:v1'
test.use({ timezoneId: 'America/Los_Angeles' })

test('统一北京时间选课、跨午夜切换，并不受首次打开日期影响', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T23:59:45+08:00') })
  await page.goto('/')
  await expect(
    page.getByText(`${plan.lessons.length} 天课程 · 第 1 天`, { exact: true }),
  ).toBeVisible()
  await page.getByRole('checkbox', { name: '词汇完成状态' }).check()
  await page.clock.fastForward(31000)
  await expect(
    page.getByText(`${plan.lessons.length} 天课程 · 第 2 天`, { exact: true }),
  ).toBeVisible()
  await expect(page.getByLabel('学习日期')).toHaveValue('2026-10-29')
  await expect(page.getByRole('checkbox', { name: '词汇完成状态' })).not.toBeChecked()
  await page.reload()
  await expect(
    page.getByText(`${plan.lessons.length} 天课程 · 第 2 天`, { exact: true }),
  ).toBeVisible()
  await page.goto('/?date=2026-10-28')
  await expect(page.getByRole('checkbox', { name: '词汇完成状态' })).toBeChecked()
})

test('30天的页面、词汇、阅读、写作和提醒使用相同课程', async ({ page }) => {
  test.setTimeout(90000)
  await page.clock.install({ time: new Date('2026-11-26T21:00:00+08:00') })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  for (const lesson of plan.lessons) {
    const reminder = JSON.parse(
      execFileSync(process.execPath, ['scripts/daily-lesson.mjs', lesson.date, '--json'], {
        encoding: 'utf8',
      }),
    )
    expect(reminder.lesson).toEqual(lesson)
    expect(
      reminder.tasks.reduce((sum: number, task: { minutes: number }) => sum + task.minutes, 0),
    ).toBe(60)
    await page.goto(`/?date=${lesson.date}`)
    await expect(page.locator('.study-hero h2')).toContainText(lesson.name)
    for (const task of reminder.tasks)
      await expect(page.getByText(task.text, { exact: true }).first()).toBeVisible()
    await page.goto(`/vocabulary?date=${lesson.date}`)
    await expect(page.locator('.word-card')).toHaveCount(10)
    for (const id of lesson.wordIds)
      await expect(page.getByRole('heading', { name: id, exact: true })).toBeVisible()
    await page.goto(`/practice/reading?date=${lesson.date}`)
    await expect(
      page.getByRole('heading', { name: lesson.readingTitle, exact: true }),
    ).toBeVisible()
    await expect(page.locator('.reading-text')).toHaveText(lesson.text)
    await page.goto(`/practice/writing?date=${lesson.date}`)
    if (lesson.writingPart === 'task1')
      await expect(page.getByRole('table')).toContainText(lesson.chart.title)
    else await expect(page.getByText(lesson.writing, { exact: true })).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('旧草稿与日期课程隔离，备份同时保留两版记录', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T13:00:00+08:00') })
  await page.goto('/')
  await page.getByRole('checkbox', { name: '词汇完成状态' }).check()
  await page.evaluate((key) => {
    const saved = JSON.parse(localStorage.getItem(key)!)
    saved.profile.startDate = '2026-10-26'
    saved.days['2026-10-28|academic'] = {
      completed: [],
      drafts: { 'writing-task2': 'My original draft must remain.' },
      reading: ['TRUE', 'FALSE', 'NOT GIVEN'],
      readingChecked: true,
      notes: '',
    }
    localStorage.setItem(key, JSON.stringify(saved))
  }, KEY)
  await page.goto('/practice/writing')
  await expect(page.getByLabel('我的英文草稿')).toBeEmpty()
  await page.getByLabel('我的英文草稿').fill('My new dated lesson draft.')
  await page.reload()
  await expect(page.getByLabel('我的英文草稿')).toHaveValue('My new dated lesson draft.')
  await page.goto('/progress')
  await page
    .locator('.history-row')
    .filter({ hasText: '起步版' })
    .getByRole('link', { name: '继续学习' })
    .click()
  await page.getByRole('link', { name: '进入写作练习' }).click()
  await expect(page.getByLabel('我的英文草稿')).toHaveValue('My original draft must remain.')
  await page.goto('/settings')
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出备份', exact: true }).click()
  const backup = JSON.parse(await readFile((await (await downloadEvent).path())!, 'utf8'))
  expect(backup.days['2026-10-28|academic'].drafts['writing-task2']).toBe(
    'My original draft must remain.',
  )
  expect(backup.courseDays['2026-10-28|academic'].drafts['writing-task2']).toBe(
    'My new dated lesson draft.',
  )
  await page.getByLabel('选择备份文件').setInputFiles({
    name: 'daily.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  })
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: '确认恢复' }).click()
  await page.goto('/practice/writing')
  await expect(page.getByLabel('我的英文草稿')).toHaveValue('My new dated lesson draft.')
})

test('未来只预览、结束后明确提示、非法日期安全回退', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T13:00:00+08:00') })
  await page.goto('/?date=2026-11-26')
  await expect(page.getByRole('checkbox', { name: '词汇完成状态' })).toBeDisabled()
  await page.goto('/practice/writing?date=2026-11-26')
  await expect(page.getByLabel('我的英文草稿')).toBeDisabled()
  const afterEnd = new Date(Date.parse(plan.lessons.at(-1).date) + 86400000)
    .toISOString()
    .slice(0, 10)
  await page.goto(`/?date=${afterEnd}`)
  await expect(page.getByRole('heading', { name: '当前日期没有已发布的新课程' })).toBeVisible()
  await page.goto('/?date=2026-02-30')
  await expect(page.getByLabel('学习日期')).toHaveValue('2026-10-28')
  expect(() =>
    execFileSync(process.execPath, ['scripts/daily-lesson.mjs', afterEnd], { stdio: 'pipe' }),
  ).toThrow()
})

test('新课程手机布局、来源与无障碍', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T13:00:00+08:00') })
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: '2026-11-26 展示进步与复盘' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([])
  await page.screenshot({ path: 'artifacts/curriculum-mobile.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: 'artifacts/curriculum-desktop.png', fullPage: true })
  const response = await page.request.get('/courses/plan.json')
  expect(response.status()).toBe(200)
  expect(await response.json()).toEqual(plan)
})
