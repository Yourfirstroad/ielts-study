import { z } from 'zod'

const date = z.iso.date()
const line = z.string().min(1).max(10000)
const question = z.tuple([line, z.enum(['TRUE', 'FALSE', 'NOT GIVEN']), line])
const guide = z.object({
  explain: line,
  outline: z.array(line).min(3),
  phrases: z.array(z.tuple([line, line])).min(3),
  paragraphs: z.array(z.tuple([line, line, line])).min(3),
  practice: z.object({ frame: line, answer: line, transfer: line }),
  sourceIds: z.array(line).min(2),
})
export type PracticeGuide = z.infer<typeof guide>
export const answerWordCount = (g: PracticeGuide) =>
  g.paragraphs
    .map((p) => p[0])
    .join(' ')
    .trim()
    .split(/\s+/).length
export const courseSchema = z
  .object({
    version: z.literal(1),
    timeZone: z.literal('Asia/Shanghai'),
    checkedAt: date,
    chartGuides: z.record(z.string(), guide),
    sources: z.array(
      z.object({ id: line, name: line, url: z.url().startsWith('https://'), note: line }),
    ),
    wordBank: z.array(
      z.object({
        id: line,
        word: line,
        meaning: line,
        phrase: line,
        example: line,
        topic: z.number().int().min(0),
      }),
    ),
    lessons: z
      .array(
        z.object({
          date,
          number: z.number().int().positive(),
          name: line,
          en: line,
          focus: line,
          wordIds: z.array(line).length(10),
          readingTitle: line,
          text: line,
          questions: z.array(question).length(3),
          readingTask: line,
          speaking: line,
          cues: z.array(line).length(4),
          speakingTask: line,
          speakingGuide: guide,
          writingGuide: guide,
          writing: line,
          writingTask: line,
          writingPart: z.enum(['task1', 'task2']),
          chart: z.object({
            title: line,
            headers: z.array(line).length(4),
            rows: z.array(z.array(line).length(4)).length(3),
          }),
          listen: line,
          listeningSource: line,
          sourceIds: z.array(line).min(3),
        }),
      )
      .min(30),
  })
  .superRefine((plan, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
    const wordIds = new Set(plan.wordBank.map((w) => w.id))
    const sourceIds = new Set(plan.sources.map((s) => s.id))
    if (wordIds.size !== plan.wordBank.length) fail('词汇编号重复')
    if (sourceIds.size !== plan.sources.length) fail('来源编号重复')
    const dates = new Set<string>()
    const titles = new Set<string>()
    plan.lessons.forEach((lesson, index) => {
      if (dates.has(lesson.date) || titles.has(lesson.readingTitle)) fail('日期或阅读标题重复')
      dates.add(lesson.date)
      titles.add(lesson.readingTitle)
      if (lesson.number !== index + 1) fail('课程编号必须连续')
      if (index && Date.parse(lesson.date) - Date.parse(plan.lessons[index - 1].date) !== 86400000)
        fail('课程日期必须连续')
      if (new Set(lesson.wordIds).size !== 10 || lesson.wordIds.some((id) => !wordIds.has(id)))
        fail('课程词汇无效')
      if ([...lesson.sourceIds, lesson.listeningSource].some((id) => !sourceIds.has(id)))
        fail('课程来源无效')
      if (lesson.text.trim().split(/\s+/).length < 60) fail('阅读短文过短')
      const chartGuide = plan.chartGuides[lesson.chart.title]
      if (!chartGuide) fail(`第 ${lesson.number} 天缺少图表讲解`)
      if (answerWordCount(lesson.writingGuide) < 250)
        fail(`第 ${lesson.number} 天 Task 2 参考答案不足 250 词`)
      if (chartGuide && answerWordCount(chartGuide) < 150) fail('Task 1 参考答案不足 150 词')
      for (const g of [lesson.speakingGuide, lesson.writingGuide, chartGuide]) {
        if (g?.sourceIds.some((id) => !sourceIds.has(id))) fail('讲解来源无效')
        if (g && g.outline.length !== g.paragraphs.length) fail('提纲与参考段落必须逐段对应')
      }
    })
  })
export type CoursePlan = z.infer<typeof courseSchema>
export type DailyLesson = CoursePlan['lessons'][number]

export function lessonTasks(lesson: DailyLesson) {
  return [
    {
      id: 'vocabulary',
      label: '词汇',
      minutes: 10,
      text: `${lesson.wordIds.join(' · ')}。${lesson.number > 15 ? '计划复习：先回忆，再查看释义。' : '学习搭配，用其中两个词造句。'}`,
    },
    { id: 'listening', label: '听力', minutes: 15, text: lesson.listen },
    {
      id: 'reading',
      label: '阅读',
      minutes: 15,
      text: `${lesson.readingTitle}：${lesson.readingTask}`,
    },
    {
      id: 'speaking',
      label: '口语',
      minutes: 10,
      text: `${lesson.speaking} ${lesson.speakingTask}`,
    },
    {
      id: 'writing',
      label: '写作',
      minutes: 10,
      text: `${lesson.writingPart === 'task1' ? 'Task 1' : 'Task 2'}：${lesson.writingTask}`,
    },
  ]
}
