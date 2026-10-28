import { readFile } from 'node:fs/promises'
import { courseSchema, lessonTasks } from '../src/features/study/course-schema.ts'

const site = 'https://yourfirstroad.github.io/ielts-study/'
const args = process.argv.slice(2)
const local = courseSchema.parse(
  JSON.parse(await readFile(new URL('../src/data/plan.json', import.meta.url), 'utf8')),
)
let plan = local
if (args.includes('--published')) {
  const response = await fetch(`${site}courses/plan.json?verify=${Date.now()}`, {
    signal: AbortSignal.timeout(30000),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`已发布课程读取失败：HTTP ${response.status}`)
  plan = courseSchema.parse(await response.json())
  if (JSON.stringify(plan) !== JSON.stringify(local))
    throw new Error('线上课程与本地课程不一致；不能将未发布内容当作今日推送')
}
if (args.includes('--check')) {
  console.log(
    JSON.stringify({
      lessons: plan.lessons.length,
      words: plan.wordBank.length,
      first: plan.lessons[0].date,
      last: plan.lessons.at(-1).date,
      source: args.includes('--published') ? 'published-and-matched' : 'local',
    }),
  )
} else {
  const date =
    args.find((arg) => !arg.startsWith('--')) ??
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  const lesson = plan.lessons.find((lesson) => lesson.date === date)
  if (!lesson) throw new Error(`${date} 没有已发布的日期课程；不要用旧课冒充新课`)
  const tasks = lessonTasks(lesson)
  const selectedWords = lesson.wordIds.map((id) => plan.wordBank.find((word) => word.id === id))
  const link = `${site}#/?date=${lesson.date}`
  if (args.includes('--json')) {
    console.log(
      JSON.stringify(
        {
          lesson,
          tasks,
          words: selectedWords,
          link,
          sources: plan.sources.filter((source) => lesson.sourceIds.includes(source.id)),
        },
        null,
        2,
      ),
    )
  } else {
    console.log(
      `今晚的雅思学习 · ${date} · 第 ${lesson.number} 天：${lesson.name}\n\n${lesson.focus}\n\n${tasks.map((task) => `- ${task.label}（${task.minutes} 分钟）：${task.text}`).join('\n')}\n\n今日词义：${selectedWords.map((word) => `${word.word} ${word.meaning}`).join('；')}\n\n[打开今天的完整课程](${link})\n\n来源：${plan.sources
        .filter((source) => lesson.sourceIds.includes(source.id))
        .map((source) => `[${source.name}](${source.url})`)
        .join('、')}。站内短文和任务为原创；官方练习在来源网站进行。`,
    )
  }
}
