import rawPlan from '../../data/plan.json'
import { courseSchema } from './course-schema'

// This same public file is read by the 21:00 reminder; there is no second lesson generator.
export const curriculum = courseSchema.parse(rawPlan)
export const lessons = curriculum.lessons
export const courseStart = lessons[0].date
export const courseEnd = lessons[lessons.length - 1].date
export const getLesson = (date: string) => lessons.find((lesson) => lesson.date === date)
export const courseSource = (id: string) => curriculum.sources.find((source) => source.id === id)!
