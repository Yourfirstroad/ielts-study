import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile, mkdir } from 'node:fs/promises'
const KEY = 'ielts-study-78a4ab06:study:v1'
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-26T13:00:00+08:00') })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '今天，也向 6.5 靠近一点。' })).toBeVisible()
})
test('每日任务保存、刷新和撤销', async ({ page }) => {
  const c = page.getByRole('checkbox', { name: '词汇完成状态' })
  await c.check()
  await expect(page.getByText('1 / 5 项完成')).toBeVisible()
  await page.reload()
  await expect(c).toBeChecked()
  await c.uncheck()
  await expect(page.getByText('0 / 5 项完成')).toBeVisible()
  await page
    .getByRole('navigation', { name: '主要导航' })
    .getByRole('link', { name: '学习记录' })
    .click()
  await expect(
    page.getByRole('heading', { name: '你的第一条学习记录，从今天开始。' }),
  ).toBeVisible()
})
test('阅读判断题、解释和保存', async ({ page }) => {
  await page.goto('/practice/reading')
  const groups = page.getByRole('group')
  await groups.nth(0).getByLabel('FALSE', { exact: true }).check()
  await groups.nth(1).getByLabel('TRUE', { exact: true }).check()
  await groups.nth(2).getByLabel('NOT GIVEN', { exact: true }).check()
  await page.getByRole('button', { name: '核对答案' }).click()
  await expect(
    page.getByText('答对 3 / 3 题。此结果仅用于热身练习，不换算雅思分数。'),
  ).toBeVisible()
  await page.reload()
  await expect(groups.nth(0).getByLabel('FALSE', { exact: true })).toBeChecked()
  await page.getByRole('button', { name: '标记完成', exact: true }).click()
  await page.goto('/')
  await expect(page.getByRole('checkbox', { name: '阅读完成状态' })).toBeChecked()
})
test('写作草稿隔离、未来预览及考试类型切换', async ({ page }) => {
  await page.goto('/practice/writing')
  await page
    .getByLabel('我的英文草稿')
    .fill('Education gives students more opportunities to learn.')
  await page.getByRole('button', { name: 'Task 1', exact: true }).click()
  await expect(page.getByLabel('我的英文草稿')).toBeEmpty()
  await page.getByLabel('我的英文草稿').fill('Car use decreased during the period.')
  await page.getByRole('button', { name: 'Task 2', exact: true }).click()
  await expect(page.getByLabel('我的英文草稿')).toHaveValue(
    'Education gives students more opportunities to learn.',
  )
  await page.reload()
  await expect(page.getByLabel('我的英文草稿')).toHaveValue(
    'Education gives students more opportunities to learn.',
  )
  await page.getByLabel('学习日期').fill('2026-10-27')
  await expect(page.getByLabel('我的英文草稿')).toBeDisabled()
  await page.getByLabel('学习日期').fill('2026-10-26')
  await page.goto('/settings')
  await page.getByRole('combobox', { name: '考试类型', exact: true }).selectOption('general')
  await page.getByRole('button', { name: '保存学习目标' }).click()
  await page.goto('/practice/writing')
  await expect(page.getByLabel('我的英文草稿')).toBeEmpty()
  await page.getByRole('button', { name: 'Task 1', exact: true }).click()
  await expect(page.getByText(/Write a letter to the accommodation office/)).toBeVisible()
  await page.goto('/settings')
  await page.getByRole('combobox', { name: '考试类型', exact: true }).selectOption('academic')
  await page.getByRole('button', { name: '保存学习目标' }).click()
  await page.goto('/practice/writing')
  await expect(page.getByLabel('我的英文草稿')).toHaveValue(
    'Education gives students more opportunities to learn.',
  )
})
test('单词搜索、回忆模式与次日复习', async ({ page }) => {
  await page.goto('/vocabulary')
  await page.getByLabel('搜索单词').fill('acquire')
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'acquire', exact: true }) })
  await page.getByRole('checkbox', { name: '回忆模式' }).check()
  await expect(card.getByText('v. 获得；学会')).toHaveCount(0)
  await card.getByRole('button', { name: '试着回忆释义，再点击揭晓' }).click()
  await expect(card.getByText('v. 获得；学会')).toBeVisible()
  await card.getByRole('button', { name: '我记住了' }).click()
  await expect(card.getByText('下次 10-27')).toBeVisible()
  await page.getByLabel('搜索单词').fill('')
  await page.getByRole('button', { name: '到期复习', exact: true }).click()
  await expect(page.getByRole('heading', { name: '这里暂时没有待学词汇' })).toBeVisible()
  await page.clock.fastForward(24 * 60 * 60 * 1000)
  await expect(page.getByRole('heading', { name: 'acquire', exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: '到期复习', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'acquire', exact: true })).toBeVisible()
})
test('口语计时暂停、切换阶段和笔记', async ({ page }) => {
  await page.goto('/practice/speaking')
  await page.getByRole('button', { name: '开始计时' }).click()
  await page.clock.runFor(10000)
  await expect(page.getByRole('timer')).toHaveText('00:50')
  await page.getByRole('button', { name: '暂停计时' }).click()
  await page.clock.runFor(10000)
  await expect(page.getByRole('timer')).toHaveText('00:50')
  await page.getByLabel('计时阶段').selectOption('120')
  await expect(page.getByRole('timer')).toHaveText('02:00')
  await page.getByLabel('口语笔记').fill('I want to improve my ability to explain an idea.')
  await page.reload()
  await expect(page.getByLabel('口语笔记')).toHaveValue(
    'I want to improve my ability to explain an idea.',
  )
})
test('备份导出、无效导入、取消与确认恢复', async ({ page }) => {
  await page.getByRole('checkbox', { name: '词汇完成状态' }).check()
  await page.goto('/settings')
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出备份', exact: true }).click()
  const download = await downloaded
  const backup = JSON.parse(await readFile((await download.path())!, 'utf8'))
  expect(backup.days['2026-10-26|academic'].completed).toEqual(['vocabulary'])
  await page
    .getByLabel('选择备份文件')
    .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') })
  await expect(page.getByText(/备份无效/)).toBeVisible()
  backup.profile.target = 7
  const payload = {
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  }
  await page.getByLabel('选择备份文件').setInputFiles(payload)
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByLabel('目标总分')).toHaveValue('6.5')
  await page.getByLabel('选择备份文件').setInputFiles(payload)
  await page.getByRole('button', { name: '确认恢复' }).click()
  await expect(page.getByLabel('目标总分')).toHaveValue('7')
  await page.reload()
  await expect(page.getByLabel('目标总分')).toHaveValue('7')
})
test('存储损坏时保留原始内容', async ({ page }) => {
  await page.evaluate((k) => localStorage.setItem(k, 'broken-data'), KEY)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('原始数据已保留')
  await page.getByRole('checkbox', { name: '词汇完成状态' }).click()
  expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe('broken-data')
  await expect(page.getByRole('checkbox', { name: '词汇完成状态' })).not.toBeChecked()
})
test('写入失败不显示已完成', async ({ page }) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota')
    }
  })
  await page.getByRole('checkbox', { name: '词汇完成状态' }).click()
  await expect(page.getByRole('alert')).toContainText('保存失败')
  await expect(page.getByRole('checkbox', { name: '词汇完成状态' })).not.toBeChecked()
})
test('跨窗口修改阻止旧窗口覆盖', async ({ page, context }) => {
  const other = await context.newPage()
  await other.goto('/')
  await other.getByRole('checkbox', { name: '听力完成状态' }).check()
  await expect(page.getByRole('alert')).toContainText('另一个窗口修改了学习记录')
  await page.getByRole('checkbox', { name: '词汇完成状态' }).click()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: '听力完成状态' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: '词汇完成状态' })).not.toBeChecked()
  await other.close()
})
test('目标日期校验', async ({ page }) => {
  await page.goto('/settings')
  await page.getByLabel('具体考试日期（可留空）').fill('2027-03-01')
  await page.getByRole('button', { name: '保存学习目标' }).click()
  await expect(page.getByRole('alert')).toContainText('具体考试日期必须在预计考试月份内')
  await page.getByLabel('具体考试日期（可留空）').fill('2027-02-20')
  await page.getByRole('button', { name: '保存学习目标' }).click()
  await page.goto('/')
  await expect(page.getByText('2027-02-20', { exact: true })).toBeVisible()
})
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
for (const width of [320, 375, 414, 768, 1440])
  test(`布局与路由 ${width}px`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      )
      expect(overflow, `overflow at ${route}`).toBe(false)
      const clipped = await page
        .locator('main .panel,main .word-card,main .study-hero')
        .evaluateAll(
          (nodes) =>
            nodes.filter(
              (n) =>
                n.getBoundingClientRect().right > innerWidth + 1 ||
                n.getBoundingClientRect().left < 0,
            ).length,
        )
      expect(clipped, `clipped at ${route}`).toBe(0)
    }
    expect(errors).toEqual([])
  })
test('来源链接、可访问性和截图', async ({ page }) => {
  await mkdir('artifacts', { recursive: true })
  for (const route of ['/', '/practice/reading', '/practice/writing', '/settings']) {
    await page.goto(route)
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([])
  }
  await page.goto('/resources')
  for (const a of await page.getByRole('link', { name: '访问原始来源' }).all())
    await expect(a).toHaveAttribute('href', /^https:\/\/(ielts.org|takeielts.britishcouncil.org)\//)
  await page.goto('/')
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 375, height: 900 })
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true })
  await page.goto('/vocabulary')
  await page.screenshot({ path: 'artifacts/vocabulary-mobile.png', fullPage: true })
})
