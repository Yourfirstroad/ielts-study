import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { words } from './content'
import { getLesson, lessons } from './curriculum'
import type { DailyLesson } from './course-schema'

export const STORAGE_KEY = 'ielts-study-78a4ab06:study:v1'
export function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
export function addDays(date: string, days: number) {
  const d = new Date(date + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
export function dayDiff(a: string, b: string) {
  return Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000)
}
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const n = new Date(v + 'T00:00:00Z')
    return !isNaN(+n) && n.toISOString().slice(0, 10) === v
  }, '日期无效')
const text = z.string().max(50000)
export function studyDateFromSearch(search: string) {
  const requested = new URLSearchParams(search).get('date')
  return requested && date.safeParse(requested).success ? requested : undefined
}
const wordId = z.string().refine((id) => words.some((w) => w.id === id), '未知词汇')
const daySchema = z
  .object({
    completed: z
      .array(z.enum(['vocabulary', 'listening', 'reading', 'speaking', 'writing']))
      .max(5)
      .refine((ids) => new Set(ids).size === ids.length),
    drafts: z.record(z.string().max(60), text),
    reading: z.array(z.enum(['', 'TRUE', 'FALSE', 'NOT GIVEN'])).length(3),
    readingChecked: z.boolean(),
    notes: text,
    vocabulary: z.array(wordId).max(words.length).optional(),
  })
  .strict()
export const stateSchema = z
  .object({
    version: z.literal(1),
    profile: z
      .object({
        target: z.number().min(4).max(9).multipleOf(0.5),
        track: z.enum(['academic', 'general']),
        examMonth: z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/),
        examDate: z.union([z.literal(''), date]),
        startDate: date,
        level: z.string().max(100),
      })
      .strict()
      .refine((p) => !p.examDate || p.examDate.startsWith(p.examMonth), '考试日期与月份不一致'),
    days: z.record(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}\|(academic|general)$/)
        .refine((v) => date.safeParse(v.slice(0, 10)).success),
      daySchema,
    ),
    courseDays: z
      .record(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}\|(academic|general)$/)
          .refine((v) => date.safeParse(v.slice(0, 10)).success),
        daySchema,
      )
      .optional(),
    reviews: z.record(
      wordId,
      z
        .object({ step: z.number().int().min(0).max(5), due: date, last: date, known: z.boolean() })
        .strict(),
    ),
  })
  .strict()
export type StudyState = z.infer<typeof stateSchema>
export type Day = z.infer<typeof daySchema>
export function emptyDay(): Day {
  return { completed: [], drafts: {}, reading: ['', '', ''], readingChecked: false, notes: '' }
}
export function initialState(): StudyState {
  return {
    version: 1,
    profile: {
      target: 6.5,
      track: 'academic',
      examMonth: '2027-02',
      examDate: '',
      startDate: today(),
      level: '四级左右基础',
    },
    days: {},
    reviews: {},
  }
}
function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return { data: raw ? stateSchema.parse(JSON.parse(raw)) : initialState(), error: '' }
  } catch {
    return {
      data: initialState(),
      error: '无法读取学习记录。原始数据已保留，请先导出备份，再导入有效记录；当前修改不会保存。',
    }
  }
}
type Store = {
  data: StudyState
  error: string
  selected: string
  setSelected: (date: string, legacy?: boolean) => void
  actual: string
  day: Day
  updateDay: (change: Partial<Day>) => boolean
  commit: (fn: (d: StudyState) => StudyState, recovering?: boolean) => boolean
  review: (id: string, known: boolean) => void
  topicIndex: number
  cycle: number
  lesson: DailyLesson | undefined
  wordIds: string[]
  exportData: () => void
}
const Context = createContext<Store | null>(null)
export function download(name: string, contents: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function StudyProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(readState)
  const [data, setData] = useState(loaded.data)
  const ref = useRef(data)
  const [error, setError] = useState(loaded.error)
  const blocked = useRef(!!loaded.error)
  const [actual, setActual] = useState(today())
  const [legacy, setLegacy] = useState(false)
  const [selected, changeSelected] = useState(() => {
    const query = window.location.hash.includes('?')
      ? window.location.hash.split('?')[1]
      : window.location.search
    return studyDateFromSearch(query) ?? today()
  })
  function setSelected(value: string, useLegacy = false) {
    setLegacy(useLegacy)
    changeSelected(value)
  }
  useEffect(() => {
    const refreshDate = () => {
      const next = today()
      if (actual !== next) {
        setActual(next)
        if (selected === actual) {
          changeSelected(next)
          setLegacy(false)
        }
      }
    }
    const id = setInterval(refreshDate, 30000)
    window.addEventListener('focus', refreshDate)
    document.addEventListener('visibilitychange', refreshDate)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', refreshDate)
      document.removeEventListener('visibilitychange', refreshDate)
    }
  }, [actual, selected])
  useEffect(() => {
    const fn = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        blocked.current = true
        setError('另一个窗口修改了学习记录。请刷新本页后继续，避免覆盖较新的内容。')
      }
    }
    window.addEventListener('storage', fn)
    return () => window.removeEventListener('storage', fn)
  }, [])
  function commit(fn: (d: StudyState) => StudyState, recovering = false) {
    if (blocked.current && !recovering) {
      toast.error('记录尚未保存，请先处理页面上方的数据提示。')
      return false
    }
    try {
      const next = stateSchema.parse(fn(ref.current))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      ref.current = next
      setData(next)
      blocked.current = false
      setError('')
      return true
    } catch {
      setError('保存失败：请检查浏览器存储空间或备份格式。之前的记录未被覆盖。')
      return false
    }
  }
  const key = `${selected}|${data.profile.track}`
  const lesson = legacy ? undefined : getLesson(selected)
  const collection = lesson ? 'courseDays' : 'days'
  const day = data[collection]?.[key] || emptyDay()
  function updateDay(change: Partial<Day>) {
    if (selected > actual) {
      toast.error('未来日期可以预览，暂不能打卡或保存练习。')
      return false
    }
    return commit((d) => ({
      ...d,
      [collection]: {
        ...d[collection],
        [key]: { ...(d[collection]?.[key] || emptyDay()), ...change },
      },
    }))
  }
  function review(id: string, known: boolean) {
    const old = ref.current.reviews[id]
    if (old?.last === actual && old.known === known) {
      toast('今天已记录这个单词，明天再巩固。')
      return
    }
    const step = known ? Math.min((old?.step || 0) + (old?.last === actual ? 0 : 1), 5) : 0
    const interval = known ? [1, 3, 7, 14, 30][Math.max(0, step - 1)] : 1
    if (
      commit((d) => {
        const dailyKey = `${actual}|${d.profile.track}`
        const dailyCollection = getLesson(actual) ? 'courseDays' : 'days'
        const daily = d[dailyCollection]?.[dailyKey] || emptyDay()
        return {
          ...d,
          [dailyCollection]: {
            ...d[dailyCollection],
            [dailyKey]: { ...daily, vocabulary: [...new Set([...(daily.vocabulary || []), id])] },
          },
          reviews: {
            ...d.reviews,
            [id]: { step, known, due: addDays(actual, interval), last: actual },
          },
        }
      })
    )
      toast.success(`已记录，${addDays(actual, interval)} 复习`)
  }
  const offset = Math.max(0, dayDiff(selected, data.profile.startDate))
  const topicIndex = lesson ? 7 + lessons.indexOf(lesson) : offset % 7
  function exportData() {
    try {
      const raw = blocked.current
        ? localStorage.getItem(STORAGE_KEY)
        : JSON.stringify(ref.current, null, 2)
      download(`ielts-backup-${actual}.json`, raw || JSON.stringify(ref.current))
      toast.success('备份已导出')
    } catch {
      toast.error('无法读取备份，请检查浏览器权限。')
    }
  }
  return (
    <Context.Provider
      value={{
        data,
        error,
        selected,
        setSelected,
        actual,
        day,
        updateDay,
        commit,
        review,
        topicIndex,
        cycle: Math.floor(offset / 7) + 1,
        lesson,
        wordIds: lesson?.wordIds ?? words.filter((w) => w.topic === topicIndex).map((w) => w.id),
        exportData,
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function useStudy() {
  const value = useContext(Context)
  if (!value) throw new Error('学习记录尚未初始化')
  return value
}
