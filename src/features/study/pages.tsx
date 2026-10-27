import { useEffect, useRef, useState, type ReactNode, type ComponentProps } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Library,
  Mic,
  PenLine,
  Play,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sprout,
  Target,
  TrendingUp,
  Volume2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { addDays, dayDiff, stateSchema, useStudy, type StudyState } from './store'
import { sources, taskDefs, topics, words, type Source, type Word } from './content'

export function Action({ className = '', ...props }: ComponentProps<typeof Button>) {
  return <Button className={`action ${className}`} {...props} />
}
function External({ source, label }: { source: Source; label?: string }) {
  return (
    <a className="source-link" href={source.url} target="_blank" rel="noopener noreferrer">
      {label || source.name}
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  )
}
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>
}
const icons = {
  vocabulary: BookOpen,
  listening: Headphones,
  reading: Library,
  speaking: Mic,
  writing: PenLine,
}
const navigation = [
  { path: '/', title: '今日学习', icon: LayoutDashboard },
  { path: '/vocabulary', title: '词汇复习', icon: BookOpen },
  { path: '/practice', title: '听说读写', icon: Headphones },
  { path: '/resources', title: '资料书架', icon: Library },
  { path: '/progress', title: '学习记录', icon: TrendingUp },
  { path: '/settings', title: '目标设置', icon: Settings2 },
]
function prettyDate(date: string) {
  return new Date(date + 'T12:00:00+08:00').toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}
export function Layout() {
  const s = useStudy()
  const location = useLocation()
  useEffect(() => {
    document.title = `${navigation.find((n) => n.path !== '/' && location.pathname.startsWith(n.path))?.title || '今日学习'} · IELTS Study`
    window.scrollTo(0, 0)
  }, [location.pathname])
  return (
    <div className="study-app">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          const main = document.getElementById('main')
          main?.focus()
          main?.scrollIntoView()
        }}
      >
        跳到主要内容
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <BookOpen size={23} />
          </span>
          <span>
            IELTS<span className="brand-light"> Study</span>
            <small>我的雅思学习站</small>
          </span>
        </Link>
        <div className="workspace-label">个人学习空间</div>
        <nav aria-label="主要导航">
          {navigation.map(({ path, title, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'}>
              <Icon size={19} aria-hidden="true" />
              {title}
            </NavLink>
          ))}
        </nav>
        <div className="side-goal">
          <Sprout size={23} />
          <strong>每天一点，向目标靠近。</strong>
          <p>
            {s.data.profile.level}
            <br />
            目标 {s.data.profile.target.toFixed(1)} ·{' '}
            {s.data.profile.examMonth.replace('-', ' 年 ')} 月
          </p>
          <Link to="/settings">
            调整学习目标 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="side-foot">
          <span className="status-dot" />
          学习记录保存在此浏览器
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            我的备考 /{' '}
            <strong>
              {navigation.find((n) => n.path !== '/' && location.pathname.startsWith(n.path))
                ?.title || '今日学习'}
            </strong>
          </span>
          <span className="top-profile">
            <GraduationCap size={17} />
            {s.data.profile.track === 'academic' ? 'Academic 学术类' : 'General 培训类'}
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {s.error && (
            <div className="error-banner" role="alert">
              <p>{s.error}</p>
              <Action variant="outline" onClick={s.exportData}>
                导出原始备份
              </Action>
              <Action variant="outline" onClick={() => location && window.location.reload()}>
                刷新记录
              </Action>
            </div>
          )}
          <Outlet />
        </main>
        <footer className="page-footer">
          个人备考工具 · 非 IELTS 官方产品{' '}
          <span>
            内容核查：2026-10-26 · <Link to="/resources">查看来源与使用说明</Link>
          </span>
        </footer>
      </div>
    </div>
  )
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  )
}
function DateControl() {
  const s = useStudy()
  return (
    <div className="date-control">
      <Action
        variant="ghost"
        size="icon"
        aria-label="前一天"
        disabled={s.selected <= s.data.profile.startDate}
        onClick={() => s.setSelected(addDays(s.selected, -1))}
      >
        <ChevronLeft />
      </Action>
      <label className="date-input">
        <CalendarDays size={17} />
        <input
          aria-label="学习日期"
          type="date"
          min={s.data.profile.startDate}
          value={s.selected}
          onChange={(e) => {
            if (
              /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) &&
              e.target.value >= s.data.profile.startDate
            )
              s.setSelected(e.target.value)
          }}
        />
      </label>
      <Action
        variant="ghost"
        size="icon"
        aria-label="后一天"
        onClick={() => s.setSelected(addDays(s.selected, 1))}
      >
        <ChevronRight />
      </Action>
      {s.selected !== s.actual && (
        <Action variant="ghost" onClick={() => s.setSelected(s.actual)}>
          今天
        </Action>
      )}
    </div>
  )
}
function Complete({ id }: { id: string }) {
  const s = useStudy()
  const done = s.day.completed.includes(id as never)
  return (
    <Action
      variant={done ? 'secondary' : 'default'}
      disabled={s.selected > s.actual}
      onClick={() => {
        const completed = done
          ? s.day.completed.filter((x) => x !== id)
          : [...s.day.completed, id as (typeof s.day.completed)[number]]
        if (s.updateDay({ completed })) toast.success(done ? '已撤销完成标记' : '已记录本项完成')
      }}
    >
      {done ? <CheckCircle2 size={17} /> : <Check size={17} />}
      {done ? '已完成 · 撤销' : '标记完成'}
    </Action>
  )
}
export function TodayPage() {
  const s = useStudy()
  const topic = topics[s.topicIndex]
  const count = s.day.completed.length
  const minutes = taskDefs
    .filter((t) => s.day.completed.includes(t.id))
    .reduce((n, t) => n + t.minutes, 0)
  const due = words.filter((w) => s.data.reviews[w.id]?.due <= s.actual).length
  const first = taskDefs.find((t) => !s.day.completed.includes(t.id)) || taskDefs[0]
  return (
    <>
      <PageHeading
        title={
          s.selected === s.actual
            ? '今天，也向 6.5 靠近一点。'.replace('6.5', s.data.profile.target.toFixed(1))
            : '按自己的节奏，继续学习。'
        }
        description={`${prettyDate(s.selected)} · 北京时间 · 第 ${Math.max(1, dayDiff(s.selected, s.data.profile.startDate) + 1)} 天`}
      >
        <DateControl />
      </PageHeading>
      <div className="dashboard-grid">
        <div className="main-column">
          <section className="study-hero">
            <div className="hero-content">
              <span className="pill light">
                <Sprout size={14} />
                {s.cycle === 1 ? '起步周 · 建立学习节奏' : `第 ${s.cycle} 周 · 主题循环与巩固`}
              </span>
              <h2>
                {topic.name}
                <span>{topic.en}</span>
              </h2>
              <p>
                {topic.focus}
                <br />
                给自己一个专注的小时，从一个小任务开始。
              </p>
              <Action asChild className="hero-button">
                <Link to={first.path}>
                  {count === 5 ? '再复习一遍' : count ? '继续今日学习' : '开始今日学习'}
                  <ArrowRight size={17} />
                </Link>
              </Action>
            </div>
            <div className="hero-time">
              <span>今日计划</span>
              <strong>
                60<small>分钟</small>
              </strong>
              <div className="hero-divider" />
              <span>
                词汇 · 听力 · 阅读
                <br />
                口语 · 写作
              </span>
            </div>
          </section>
          <div className="section-heading">
            <h2>今日学习清单</h2>
            <span>{count} / 5 项完成</span>
          </div>
          <div className="task-list">
            {taskDefs.map((t) => {
              const Icon = icons[t.id]
              const done = s.day.completed.includes(t.id)
              return (
                <article className={`task-row ${done ? 'done' : ''}`} key={t.id}>
                  <button
                    className="check-control"
                    disabled={s.selected > s.actual}
                    role="checkbox"
                    aria-checked={done}
                    aria-label={`${t.label}完成状态`}
                    onClick={() =>
                      s.updateDay({
                        completed: done
                          ? s.day.completed.filter((x) => x !== t.id)
                          : [...s.day.completed, t.id],
                      })
                    }
                  >
                    {done && <Check size={16} />}
                  </button>
                  <span className="task-icon">
                    <Icon size={20} />
                  </span>
                  <div className="task-text">
                    <div>
                      <span className="task-label">{t.label}</span>
                      <span className="duration">
                        <Clock3 size={13} />
                        {t.minutes} 分钟
                      </span>
                    </div>
                    <h3>
                      <Link to={t.path}>{t.title}</Link>
                    </h3>
                    <p>{t.hint}</p>
                  </div>
                  <Link to={t.path} className="task-arrow" aria-label={`进入${t.label}练习`}>
                    <ArrowRight size={19} />
                  </Link>
                </article>
              )
            })}
          </div>
          <div className="daily-note">
            <ShieldCheck size={22} />
            <div>
              <strong>知道为什么学，也知道从哪里学。</strong>
              <p>每项练习都附来源。站内短文、词表与任务由本站编写，官方样题在原站打开。</p>
              <Link to="/resources">
                查看资料来源 <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
        <aside className="right-column">
          <Panel>
            <div className="section-heading">
              <h2>我的备考目标</h2>
              <Target size={18} />
            </div>
            <div className="target-score">
              {s.data.profile.target.toFixed(1)}
              <span>目标总分</span>
            </div>
            <div className="target-detail">
              <span>考试类型</span>
              <strong>{s.data.profile.track === 'academic' ? '学术类 A 类' : '培训类 G 类'}</strong>
            </div>
            <div className="target-detail">
              <span>预计考试</span>
              <strong>{s.data.profile.examDate || s.data.profile.examMonth}</strong>
            </div>
            <div className="target-detail">
              <span>目前基础</span>
              <strong>{s.data.profile.level}</strong>
            </div>
            <p className="caption">
              {s.data.profile.examDate
                ? `距考试 ${Math.max(0, dayDiff(s.data.profile.examDate, s.actual))} 天`
                : `距考试月开始 ${Math.max(0, dayDiff(s.data.profile.examMonth + '-01', s.actual))} 天 · 具体日期待定`}
            </p>
          </Panel>
          <Panel>
            <div className="section-heading">
              <h2>今天的积累</h2>
              <CheckCircle2 size={18} />
            </div>
            <div className="progress-number">
              {count}
              <span> / 5 项</span>
            </div>
            <progress value={count} max={5} aria-label="今日完成进度" />
            <p className="caption">
              已完成任务的计划用时 {minutes} / 60 分钟
              <br />
              用时为计划值，不代表实际学习时长。
            </p>
            <Link className="plain-link" to="/progress">
              查看学习记录 <ArrowRight size={15} />
            </Link>
          </Panel>
          <Panel className="review-card">
            <BookOpen size={24} />
            <h2>{due ? `${due} 个单词等待复习` : '让学过的词留下来'}</h2>
            <p>先尝试回忆，再看释义。标记熟悉程度后，复习日期会随之调整。</p>
            <Link className="plain-link" to="/vocabulary?filter=due">
              打开复习清单 <ArrowRight size={15} />
            </Link>
          </Panel>
          <div className="reminder">
            <Clock3 size={17} />
            <div>
              <strong>每天 21:00 · 学习提醒</strong>
              <p>提醒通过当前聊天的日程发送；网页内查看和记录学习。</p>
            </div>
          </div>
        </aside>
      </div>
      <Panel className="week-panel">
        <div className="section-heading">
          <h2>起步周主题</h2>
          <span>7 天内容，可循环巩固</span>
        </div>
        <div className="week-grid">
          {topics.map((t, i) => (
            <button
              className={i === s.topicIndex ? 'active' : ''}
              key={t.en}
              onClick={() =>
                s.setSelected(addDays(s.data.profile.startDate, (s.cycle - 1) * 7 + i))
              }
            >
              <span>第 {i + 1} 天</span>
              <strong>{t.name}</strong>
              {i === s.topicIndex && <span className="week-selected">当前主题</span>}
            </button>
          ))}
        </div>
        <p className="caption">
          内置 7 组主题、70
          个词和配套微练习。第二周起重复主题并复习，不会自动联网生成新课程。官方样题与正版教材用于后续扩展。
        </p>
      </Panel>
    </>
  )
}
function speak(word: string) {
  if (!('speechSynthesis' in window)) {
    toast.error('此浏览器不支持朗读，请打开词典听发音。')
    return
  }
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-GB'
  utterance.rate = 0.85
  utterance.onerror = () => toast.error('朗读不可用，请到词典页面听发音。')
  speechSynthesis.speak(utterance)
}
function WordCard({ word, hide }: { word: Word; hide: boolean }) {
  const s = useStudy()
  const [shown, setShown] = useState(false)
  const r = s.data.reviews[word.id]
  return (
    <article className="word-card">
      <div className="word-head">
        <div>
          <span className="caption">{topics[word.topic].name}</span>
          <h2 lang="en">{word.word}</h2>
        </div>
        <Action
          variant="ghost"
          size="icon"
          aria-label={`朗读 ${word.word}`}
          onClick={() => speak(word.word)}
        >
          <Volume2 size={20} />
        </Action>
      </div>
      {hide && !shown ? (
        <button className="reveal-word" onClick={() => setShown(true)}>
          试着回忆释义，再点击揭晓
        </button>
      ) : (
        <div className="word-answer">
          <p className="meaning">{word.meaning}</p>
          <strong lang="en">{word.phrase}</strong>
          <p lang="en" className="example">
            {word.example}
          </p>
        </div>
      )}
      <div className="word-meta">
        <a
          href={`https://dictionary.cambridge.org/dictionary/english/${word.word}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          查词与真人发音 <ArrowUpRight size={13} />
        </a>
        <span>{r ? `下次 ${r.due.slice(5)}` : '还未学习'}</span>
      </div>
      <div className="word-actions">
        <Action variant="outline" onClick={() => s.review(word.id, false)}>
          还不熟悉
        </Action>
        <Action variant="secondary" onClick={() => s.review(word.id, true)}>
          <Check size={15} />
          {r?.last === s.actual && r.known ? '今天已掌握' : '我记住了'}
        </Action>
      </div>
    </article>
  )
}
export function VocabularyPage() {
  const s = useStudy()
  const location = useLocation()
  const [filter, setFilter] = useState(
    new URLSearchParams(location.search).get('filter') === 'due' ? 'due' : 'today',
  )
  const [query, setQuery] = useState('')
  const [hide, setHide] = useState(false)
  const list = words.filter(
    (w) =>
      (filter === 'all' ||
        (filter === 'today' && w.topic === s.topicIndex) ||
        (filter === 'due' && s.data.reviews[w.id]?.due <= s.actual) ||
        (filter === 'learning' && !!s.data.reviews[w.id])) &&
      `${w.word} ${w.meaning} ${w.phrase}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      <PageHeading
        title="把词汇，变成能用的表达。"
        description={`${topics[s.topicIndex].name} · 10 个主题词 · 词表为本站精选，非官方必背清单`}
      >
        <DateControl />
      </PageHeading>
      <div className="toolbar">
        <div className="segments" aria-label="词汇筛选">
          {[
            ['today', '今日词汇'],
            ['due', '到期复习'],
            ['learning', '已学词汇'],
            ['all', '全部 70 词'],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              className={filter === id ? 'active' : ''}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="搜索单词"
            placeholder="搜索单词或中文"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="section-heading">
        <span>显示 {list.length} 个词 · 复习记录按北京时间今天保存</span>
        <label className="checkbox-label">
          <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} />
          回忆模式
        </label>
      </div>
      {list.length ? (
        <div className="word-grid">
          {list.map((w) => (
            <WordCard key={`${w.id}-${hide}`} word={w} hide={hide} />
          ))}
        </div>
      ) : (
        <Panel className="empty-state">
          <BookOpen size={32} />
          <h2>{query ? '没有找到匹配的单词' : '这里暂时没有待学词汇'}</h2>
          <p>
            {query
              ? '试试更短的英文或中文关键词。'
              : '可以先学习今日词汇，复习日期到了会出现在这里。'}
          </p>
          <Action
            onClick={() => {
              setQuery('')
              setFilter('today')
            }}
          >
            查看今日词汇
          </Action>
        </Panel>
      )}
      <div className="bottom-actions">
        <p className="caption">
          例句为本站原创。朗读使用浏览器语音；词典链接提供释义核对与发音。
          <br />
          记住后按 1、3、7、14、30 天逐步复习；不熟悉则次日复习。
        </p>
        <Complete id="vocabulary" />
      </div>
    </>
  )
}

function Draft({
  id,
  label,
  placeholder,
  rows = 8,
}: {
  id: string
  label: string
  placeholder: string
  rows?: number
}) {
  const s = useStudy()
  const saved = s.day.drafts[id] || ''
  const [value, setValue] = useState(saved)
  const [status, setStatus] = useState('')
  useEffect(() => {
    setValue(saved)
    setStatus('')
  }, [s.selected, s.data.profile.track, id, saved])
  const count = value.trim() ? value.trim().split(/\s+/).length : 0
  return (
    <div className="draft">
      <label htmlFor={`draft-${id}`}>{label}</label>
      <textarea
        id={`draft-${id}`}
        rows={rows}
        maxLength={50000}
        value={value}
        placeholder={placeholder}
        disabled={s.selected > s.actual}
        onChange={(e) => {
          const v = e.target.value
          setValue(v)
          const ok = s.updateDay({ drafts: { ...s.day.drafts, [id]: v } })
          setStatus(ok ? '已自动保存' : '保存失败，请复制内容备份')
        }}
      />
      <div className="draft-foot">
        <span>{count} 个空格分隔词</span>
        <span role="status">{status || (saved ? '草稿已保存在此浏览器' : '输入后自动保存')}</span>
      </div>
    </div>
  )
}
function Timer() {
  const [duration, setDuration] = useState(60)
  const [left, setLeft] = useState(60)
  const [running, setRunning] = useState(false)
  const end = useRef(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const n = Math.max(0, Math.ceil((end.current - Date.now()) / 1000))
      setLeft(n)
      if (n === 0) {
        setRunning(false)
        toast.success('计时结束，记录一下需要改进的表达。')
      }
    }, 200)
    return () => clearInterval(id)
  }, [running])
  return (
    <div className="timer">
      <label>
        练习阶段
        <select
          aria-label="计时阶段"
          value={duration}
          onChange={(e) => {
            const n = Number(e.target.value)
            setDuration(n)
            setLeft(n)
            setRunning(false)
          }}
        >
          <option value={60}>准备 · 1 分钟</option>
          <option value={120}>回答 · 2 分钟</option>
        </select>
      </label>
      <span className="timer-value" role="timer">
        {Math.floor(left / 60)
          .toString()
          .padStart(2, '0')}
        :{(left % 60).toString().padStart(2, '0')}
      </span>
      <div className="button-row">
        <Action
          onClick={() => {
            if (running) {
              setRunning(false)
            } else {
              const n = left || duration
              setLeft(n)
              end.current = Date.now() + n * 1000
              setRunning(true)
            }
          }}
        >
          <Play size={16} />
          {running ? '暂停计时' : left === 0 ? '重新开始' : '开始计时'}
        </Action>
        <Action
          variant="outline"
          aria-label="重置计时"
          onClick={() => {
            setRunning(false)
            setLeft(duration)
          }}
        >
          <RotateCcw size={16} />
        </Action>
      </div>
      <p className="caption">计时结束后可切换阶段。当前版本不录音、不自动评分。</p>
    </div>
  )
}
export function PracticePage() {
  const { kind } = useParams()
  const s = useStudy()
  const [writingTask, setWritingTask] = useState('task2')
  const topic = topics[s.topicIndex]
  const def = taskDefs.find((t) => t.id === kind)
  if (!def || kind === 'vocabulary') return <Navigate to="/practice/listening" replace />
  const source = s.data.profile.track === 'academic' ? sources.academic : sources.general
  const reading = s.day.reading
  const score = topic.questions.filter((q, i) => reading[i] === q[1]).length
  return (
    <>
      <PageHeading
        title="练习一次，就多理解一点。"
        description={`${prettyDate(s.selected)} · ${topic.name} · ${s.data.profile.track === 'academic' ? '学术类' : '培训类'}`}
      >
        <DateControl />
      </PageHeading>
      <nav className="practice-tabs" aria-label="练习科目">
        {taskDefs
          .filter((t) => t.id !== 'vocabulary')
          .map((t) => {
            const Icon = icons[t.id]
            return (
              <NavLink key={t.id} to={t.path}>
                <Icon size={18} />
                {t.label}
              </NavLink>
            )
          })}
      </nav>
      <div className="practice-layout">
        <div className="main-column">
          {kind === 'listening' && (
            <>
              <Panel>
                <span className="pill">官方材料 · 外部练习</span>
                <h2>带着问题听，再带着原文复听。</h2>
                <p className="lead">{topic.listen}</p>
                <ol className="steps">
                  <li>
                    <strong>预读 2 分钟</strong>
                    <p>在官方页面找到对应题型。看清字数要求，预测答案词性。</p>
                  </li>
                  <li>
                    <strong>首听与答题 5 分钟</strong>
                    <p>在原站播放音频，按录音节奏答题，先不看原文。</p>
                  </li>
                  <li>
                    <strong>核对与复听 8 分钟</strong>
                    <p>查看答案和 transcript，记录拼写、同义替换或连读造成的错误。</p>
                  </li>
                </ol>
                <External source={sources.listening} label="打开官方听力材料" />
                <p className="caption">
                  音频与答案在来源页提供。外部页面需要联网，本站不托管原站音频。
                </p>
              </Panel>
              <Panel>
                <Draft
                  id="listening"
                  label="听力复盘"
                  placeholder="题型与题号：\n我的答案 / 正确答案：\n漏听原因：\n原文中的表达："
                />
              </Panel>
            </>
          )}
          {kind === 'reading' && (
            <>
              <Panel>
                <div className="section-heading">
                  <span className="pill">本站原创 · 热身短文</span>
                  <span className="caption">非官方真题</span>
                </div>
                <h2 lang="en">{topic.readingTitle}</h2>
                <p lang="en" className="reading-text">
                  {topic.text}
                </p>
                <p className="caption">
                  判断规则：TRUE 与原文一致；FALSE 与原文矛盾；NOT GIVEN
                  缺少足够信息。完成后再做官方阅读样题。
                </p>
              </Panel>
              <Panel>
                <h2>判断信息是否有依据</h2>
                <p>每题选择一个答案，并在原文中定位证据。</p>
                {topic.questions.map((q, i) => (
                  <fieldset className="question" key={q[0]}>
                    <legend lang="en">
                      {i + 1}. {q[0]}
                    </legend>
                    <div className="answer-options">
                      {(['TRUE', 'FALSE', 'NOT GIVEN'] as const).map((a) => (
                        <label key={a}>
                          <input
                            type="radio"
                            name={`reading-${i}`}
                            value={a}
                            checked={reading[i] === a}
                            disabled={s.selected > s.actual}
                            onChange={() => {
                              const values = [...reading]
                              values[i] = a
                              s.updateDay({ reading: values, readingChecked: false })
                            }}
                          />
                          {a}
                        </label>
                      ))}
                    </div>
                    {s.day.readingChecked && (
                      <p className={reading[i] === q[1] ? 'answer-correct' : 'answer-wrong'}>
                        {reading[i] === q[1] ? '答对了' : '需要复盘'} · {q[1]}：{q[2]}
                      </p>
                    )}
                  </fieldset>
                ))}
                <Action
                  disabled={reading.some((a) => !a) || s.selected > s.actual}
                  onClick={() => s.updateDay({ readingChecked: true })}
                >
                  核对答案
                </Action>
                {s.day.readingChecked && (
                  <p className="result" role="status">
                    答对 {score} / 3 题。此结果仅用于热身练习，不换算雅思分数。
                  </p>
                )}
                <div className="resource-inline">
                  <External source={source} label="继续练习官方阅读样题" />
                </div>
              </Panel>
            </>
          )}
          {kind === 'speaking' && (
            <>
              <Panel className="cue-card">
                <span className="pill">Part 2 · 本站自编话题</span>
                <h2 lang="en">{topic.speaking}</h2>
                <p>You should say:</p>
                <ul lang="en">
                  {topic.cues.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <div className="tip-box">
                  先用关键词组织内容，再尝试说满 1–2
                  分钟。优先讲真实、具体的经历，避免逐字背诵整篇答案。
                </div>
              </Panel>
              <Panel>
                <h2>练习后，听听自己的表达</h2>
                <p>
                  可用手机录音回听，依次检查：是否有长时间停顿、有没有重复用词、句子是否完整、发音是否清楚。
                </p>
                <Draft
                  id="speaking"
                  label="口语笔记"
                  placeholder="我卡住的表达：\n下一次想换一种说法的句子：\n我的具体例子："
                  rows={6}
                />
                <External source={source} label="查看官方口语样题" />
              </Panel>
            </>
          )}
          {kind === 'writing' && (
            <>
              <Panel>
                <div className="section-heading">
                  <h2>写作工作区</h2>
                  <div className="segments">
                    <button
                      className={writingTask === 'task2' ? 'active' : ''}
                      onClick={() => setWritingTask('task2')}
                    >
                      Task 2
                    </button>
                    <button
                      className={writingTask === 'task1' ? 'active' : ''}
                      onClick={() => setWritingTask('task1')}
                    >
                      Task 1
                    </button>
                  </div>
                </div>
                <span className="pill">
                  本站原创题目 ·{' '}
                  {writingTask === 'task2'
                    ? '观点段落练习'
                    : s.data.profile.track === 'academic'
                      ? '图表描述练习'
                      : '书信练习'}
                </span>
                {writingTask === 'task2' ? (
                  <>
                    <p className="writing-prompt" lang="en">
                      {topic.writing}
                    </p>
                    <p>
                      今晚先用 10 分钟写一个 80–120 词的主体段：观点 → 原因 → 具体例子。完整 Task 2
                      训练另安排约 40 分钟，至少 250 词。
                    </p>
                  </>
                ) : s.data.profile.track === 'academic' ? (
                  <>
                    <p lang="en" className="writing-prompt">
                      The table shows how people in a fictional town travelled to work in three
                      different years. Summarise the information by selecting and reporting the main
                      features, and make comparisons where relevant.
                    </p>
                    <div className="table-scroll">
                      <table>
                        <caption>自编训练数据：通勤方式占比（%）</caption>
                        <thead>
                          <tr>
                            <th>Year</th>
                            <th>Car</th>
                            <th>Bus</th>
                            <th>Bicycle</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>2010</td>
                            <td>50</td>
                            <td>30</td>
                            <td>20</td>
                          </tr>
                          <tr>
                            <td>2015</td>
                            <td>40</td>
                            <td>40</td>
                            <td>20</td>
                          </tr>
                          <tr>
                            <td>2020</td>
                            <td>30</td>
                            <td>45</td>
                            <td>25</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      今晚先写 2–3 句概述，对比最明显的变化。完整 Task 1 至少 150 词，建议约 20
                      分钟。
                    </p>
                  </>
                ) : (
                  <>
                    <p className="writing-prompt" lang="en">
                      You will attend a course in another city. Write a letter to the accommodation
                      office. Explain when you will arrive, describe the accommodation you need, and
                      ask about the cost.
                    </p>
                    <p>先写开头和一个请求段。完整 Task 1 至少 150 词，建议约 20 分钟。</p>
                  </>
                )}
                <External source={source} label="核对官方写作样题与要求" />
              </Panel>
              <Panel>
                <Draft
                  key={`${s.selected}-${s.data.profile.track}-${writingTask}`}
                  id={`writing-${writingTask}`}
                  label="我的英文草稿"
                  placeholder="Write your ideas here…"
                  rows={14}
                />
                <details className="self-check">
                  <summary>写完后，用这四点自查</summary>
                  <ul>
                    <li>是否回应了题目要求，并提供支持细节？</li>
                    <li>段落顺序是否清楚，连接是否自然？</li>
                    <li>词汇是否准确，搭配是否自然？</li>
                    <li>句子是否完整，语法和标点是否正确？</li>
                  </ul>
                  <p className="caption">本站提供字数与草稿保存，不进行自动批改或估分。</p>
                </details>
              </Panel>
            </>
          )}
          <div className="bottom-actions">
            <span className="caption">
              {s.selected > s.actual
                ? '正在预览未来任务，尚不能记录完成。'
                : '完成实际练习后，再标记今日任务。'}
            </span>
            <Complete id={def.id} />
          </div>
        </div>
        <aside className="right-column">
          {kind === 'speaking' ? (
            <Panel>
              <h2>给自己两分钟</h2>
              <Timer />
            </Panel>
          ) : (
            <Panel>
              <span className="pill">本次练习</span>
              <h2>
                {def.label} · {def.minutes} 分钟
              </h2>
              <p>{def.hint}</p>
              <div className="tip-box">
                第一周重在熟悉题型和找出薄弱处。正确率只是当前练习反馈，不等同于考试成绩。
              </div>
            </Panel>
          )}
          <Panel>
            <h2>可查证的来源</h2>
            <p>{kind === 'listening' ? sources.listening.note : source.note}</p>
            <External source={kind === 'listening' ? sources.listening : source} />
            <p className="caption">
              参考来源核查于 2026-10-26。外站内容可能调整；链接不可用时可从资料书架访问总入口。
            </p>
          </Panel>
          <Panel>
            <h2>用上今天的词</h2>
            <div className="mini-words">
              {words
                .filter((w) => w.topic === s.topicIndex)
                .slice(0, 4)
                .map((w) => (
                  <div key={w.id}>
                    <strong lang="en">{w.word}</strong>
                    <span>{w.meaning}</span>
                  </div>
                ))}
            </div>
            <Link to="/vocabulary" className="plain-link">
              去复习词汇 <ArrowRight size={15} />
            </Link>
          </Panel>
        </aside>
      </div>
    </>
  )
}

export function ResourcesPage() {
  const [filter, setFilter] = useState('all')
  const books = [
    {
      title: 'The Official Cambridge Guide to IELTS',
      type: '方法与综合训练',
      desc: '用于理解题型、练习方法和四科能力。建议每周选择一个薄弱技能学习，不需要从头背书。',
    },
    {
      title: 'IELTS 21 Academic',
      type: '学术类真题练习',
      desc: 'Cambridge 官方页面列出的学术类真题集。完成基础热身后，按 Test 分段练习并复盘，模拟阶段再做整套。',
    },
    {
      title: 'Mindset for IELTS',
      type: '分级课程教材',
      desc: '适合需要系统课程的学习者。先根据试读和水平选级别；第一版先用免费官方样题，不必同时购买多套教材。',
    },
  ]
  return (
    <>
      <PageHeading
        title="每一份材料，都有出处。"
        description="官方样题建立标准，主题练习帮助起步。资料核查日期：2026-10-26。"
      />
      <div className="toolbar">
        <div className="segments">
          {[
            ['all', '全部资料'],
            ['free', '免费练习'],
            ['books', '备考书籍'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={filter === id ? 'active' : ''}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {filter !== 'books' && (
        <>
          <div className="section-heading">
            <h2>官方练习与考试说明</h2>
            <span>原始链接 · 新窗口打开</span>
          </div>
          <div className="resource-list">
            {Object.entries(sources)
              .filter(([key]) => key !== 'books')
              .map(([key, source]) => (
                <article key={key} className="resource-row">
                  <div className="resource-icon">
                    <ShieldCheck size={23} />
                  </div>
                  <div>
                    <h3>{source.name}</h3>
                    <p>{source.note}</p>
                    <External source={source} label="访问原始来源" />
                  </div>
                  <span className="pill">免费入口</span>
                </article>
              ))}
          </div>
        </>
      )}
      {filter !== 'free' && (
        <>
          <div className="section-heading spaced">
            <h2>适合当前计划的书籍</h2>
            <span>正版付费 · 按需选择</span>
          </div>
          <div className="book-list">
            {books.map((book, i) => (
              <article className="book-row" key={book.title}>
                <div className="book-index">
                  <BookOpen size={25} />
                  <span>0{i + 1}</span>
                </div>
                <div>
                  <span className="caption">{book.type}</span>
                  <h3 lang="en">{book.title}</h3>
                  <p>{book.desc}</p>
                  <External source={sources.books} label="查看 Cambridge 官方介绍" />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <Panel className="source-policy">
        <h2>这里如何选择和使用资料</h2>
        <p>
          站内 70
          个主题词、例句、短文和写作题为本站编排的入门内容，不是官方词表或预测真题。词典链接用于核对释义与发音；官方考试材料始终保留原站链接。
        </p>
        <p>
          每日 60 分钟与复习间隔是本站建议，可根据实际完成情况调整。7
          组内置主题会循环使用，当前版本没有后台爬取、自动更新课程或自动评分功能。英文整本书阅读暂作为扩展，优先完成与考试题型对应的材料。
        </p>
      </Panel>
    </>
  )
}
export function ProgressPage() {
  const s = useStudy()
  const days = Object.entries(s.data.days)
    .filter(
      ([, d]) =>
        d.completed.length ||
        Object.values(d.drafts).some(Boolean) ||
        d.reading.some(Boolean) ||
        d.notes ||
        d.vocabulary?.length,
    )
    .sort(([a], [b]) => b.localeCompare(a))
  const completed = days.reduce((sum, [, d]) => sum + d.completed.length, 0)
  const activeDays = new Set(days.map(([key]) => key.split('|')[0])).size
  const learned = Object.keys(s.data.reviews).length
  let streak = 0
  const activity = new Set(days.map(([k]) => k.slice(0, 10)))
  let cursor = activity.has(s.actual) ? s.actual : addDays(s.actual, -1)
  while (activity.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return (
    <>
      <PageHeading
        title="每一次练习，都算数。"
        description="这里记录真实保存的学习活动，不根据打卡次数推测雅思分数。"
      >
        <Action variant="outline" onClick={s.exportData}>
          <Download size={17} />
          导出学习备份
        </Action>
      </PageHeading>
      <div className="stat-grid">
        <Panel>
          <span>有记录的学习日</span>
          <strong className="stat-value">
            {activeDays}
            <small>天</small>
          </strong>
        </Panel>
        <Panel>
          <span>已完成任务</span>
          <strong className="stat-value">
            {completed}
            <small>项</small>
          </strong>
        </Panel>
        <Panel>
          <span>已学词汇</span>
          <strong className="stat-value">
            {learned}
            <small>/ 70</small>
          </strong>
        </Panel>
        <Panel>
          <span>连续学习</span>
          <strong className="stat-value">
            {streak}
            <small>天</small>
          </strong>
        </Panel>
      </div>
      <Panel className="roadmap">
        <h2>走向 {s.data.profile.examMonth.replace('-', ' 年 ')} 月的备考安排</h2>
        <p>以下为建议阶段。每天 60 分钟是基础安排；模拟考试需另留整段时间。</p>
        <div className="roadmap-grid">
          {[
            [
              '现在起 · 约 2 周',
              '摸清基础',
              '熟悉题型，做一次官方样题诊断；整理拼写、语法和听力薄弱点。',
            ],
            [
              '之后至考前 6 周',
              '专项提高',
              '主题词汇持续复习；练习阅读定位、听力同义替换、口语展开与写作论证。',
            ],
            [
              '考前 6–2 周',
              '限时与复盘',
              '用正版真题按考试时间训练，记录错因；每周完成完整写作与口语练习。',
            ],
            [
              '最后 2 周',
              '模拟与巩固',
              '安排整套模拟，复习反复出错的内容，确认考试流程与实际日期。',
            ],
          ].map(([time, title, text]) => (
            <div key={title}>
              <span className="caption">{time}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </Panel>
      <div className="section-heading spaced">
        <h2>学习记录</h2>
        <span>按日期保存 · 可继续编辑</span>
      </div>
      {days.length ? (
        <div className="history-list">
          {days.map(([key, d]) => {
            const [date, track] = key.split('|')
            return (
              <article className="history-row" key={key}>
                <CalendarDays size={22} />
                <div>
                  <h3>
                    {date} <small>{track === 'academic' ? 'A 类' : 'G 类'}</small>
                  </h3>
                  <p>
                    {d.completed.length
                      ? d.completed
                          .map((id) => taskDefs.find((t) => t.id === id)?.label)
                          .join(' · ')
                      : d.vocabulary?.length
                        ? `已复习 ${d.vocabulary.length} 个单词`
                        : '已保存练习草稿'}
                  </p>
                </div>
                <strong>{d.completed.length} / 5</strong>
                <Action
                  variant="outline"
                  onClick={() => {
                    if (
                      s.commit((state) => ({
                        ...state,
                        profile: { ...state.profile, track: track as 'academic' | 'general' },
                      }))
                    )
                      s.setSelected(date)
                  }}
                  asChild
                >
                  <Link to="/">继续学习</Link>
                </Action>
              </article>
            )
          })}
        </div>
      ) : (
        <Panel className="empty-state">
          <Sprout size={34} />
          <h2>你的第一条学习记录，从今天开始。</h2>
          <p>完成一项任务，或保存一段练习，都会出现在这里。</p>
          <Action asChild>
            <Link to="/">开始今日学习</Link>
          </Action>
        </Panel>
      )}
    </>
  )
}
export function SettingsPage() {
  const s = useStudy()
  const [profile, setProfile] = useState(s.data.profile)
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState<StudyState | null>(null)
  const upload = useRef<HTMLInputElement>(null)
  useEffect(() => setProfile(s.data.profile), [s.data.profile])
  async function importFile(file?: File) {
    if (!file) return
    try {
      if (file.size > 2000000) throw new Error()
      const parsed = stateSchema.parse(JSON.parse(await file.text()))
      setPending(parsed)
    } catch {
      toast.error('备份无效：请选择本站导出的 JSON 文件，文件需小于 2 MB。')
    } finally {
      if (upload.current) upload.current.value = ''
    }
  }
  return (
    <>
      <PageHeading
        title="让计划适合你。"
        description="你的目标与学习记录都保存在当前浏览器，不需要注册账号。"
      />
      <div className="settings-grid">
        <Panel>
          <h2>备考目标</h2>
          <form
            className="settings-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (profile.examDate && !profile.examDate.startsWith(profile.examMonth)) {
                setFormError('具体考试日期必须在预计考试月份内。')
                return
              }
              if ((profile.examDate || profile.examMonth + '-31') < s.actual) {
                setFormError('请选择今天或以后的考试日期 / 月份。')
                return
              }
              const result = stateSchema.safeParse({ ...s.data, profile })
              if (!result.success) {
                setFormError('请检查目标分数、月份和日期格式。')
                return
              }
              if (s.commit((d) => ({ ...d, profile }))) {
                setFormError('')
                toast.success('学习目标已保存')
              }
            }}
          >
            <label>
              目标总分
              <select
                value={profile.target}
                onChange={(e) => setProfile({ ...profile, target: Number(e.target.value) })}
              >
                {[5, 5.5, 6, 6.5, 7, 7.5, 8].map((n) => (
                  <option key={n} value={n}>
                    {n.toFixed(1)} 分
                  </option>
                ))}
              </select>
            </label>
            <label>
              考试类型
              <select
                value={profile.track}
                onChange={(e) =>
                  setProfile({ ...profile, track: e.target.value as 'academic' | 'general' })
                }
              >
                <option value="academic">学术类 A 类 · 本科 / 研究生留学</option>
                <option value="general">培训类 G 类 · 按机构要求选择</option>
              </select>
            </label>
            <label>
              当前英语基础
              <input
                value={profile.level}
                required
                maxLength={100}
                onChange={(e) => setProfile({ ...profile, level: e.target.value })}
              />
            </label>
            <div className="form-pair">
              <label>
                预计考试月份
                <input
                  type="month"
                  required
                  value={profile.examMonth}
                  onChange={(e) =>
                    setProfile({ ...profile, examMonth: e.target.value, examDate: '' })
                  }
                />
              </label>
              <label>
                具体考试日期（可留空）
                <input
                  type="date"
                  value={profile.examDate}
                  onChange={(e) => setProfile({ ...profile, examDate: e.target.value })}
                />
              </label>
            </div>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <Action type="submit">保存学习目标</Action>
            <p className="caption">
              切换 A / G 类后，任务与草稿分别保存；词汇复习记录共用。四级水平不直接换算成雅思分数。
            </p>
          </form>
        </Panel>
        <div className="main-column">
          <Panel>
            <h2>学习记录与备份</h2>
            <p>
              换浏览器、清理网站数据或换地址都可能让你看不到原来的记录。定期导出备份，可以在同一网站中恢复。
            </p>
            <div className="button-row">
              <Action variant="outline" onClick={s.exportData}>
                <Download size={17} />
                导出备份
              </Action>
              <Action variant="outline" onClick={() => upload.current?.click()}>
                导入备份
              </Action>
            </div>
            <input
              className="file-input"
              ref={upload}
              type="file"
              accept=".json,application/json"
              aria-label="选择备份文件"
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
            <p className="caption">
              仅保存在本浏览器；未接入云端同步。导入前会展示内容摘要并让你确认。
            </p>
          </Panel>
          <Panel>
            <h2>每天 21:00 的提醒</h2>
            <p>
              学习提醒由当前聊天中的日程负责。网页用于练习与记录，当前没有独立邮件、手机推送或课程自动抓取服务。
            </p>
            <p className="caption">
              所有日期与复习安排按北京时间计算。初始课程从第一次打开网页当天开始。
            </p>
          </Panel>
          <Panel>
            <h2>选择哪一种雅思？</h2>
            <p>
              你用于本科或研究生留学，因此默认学术类。两类听力与口语相同，阅读和写作不同；报名时核对学校的总分和单项要求。
            </p>
            <External source={sources.types} />
          </Panel>
        </div>
      </div>
      <Dialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>用备份恢复学习记录？</DialogTitle>
            <DialogDescription>
              此操作会替换当前浏览器的学习记录与目标设置。建议先导出当前备份。
            </DialogDescription>
          </DialogHeader>
          <p>
            备份内包含 {Object.keys(pending?.days || {}).length} 条每日记录、
            {Object.keys(pending?.reviews || {}).length} 个词汇记录，目标 {pending?.profile.target}{' '}
            分。
          </p>
          <DialogFooter>
            <Action variant="outline" onClick={() => setPending(null)}>
              取消
            </Action>
            <Action
              onClick={() => {
                if (pending && s.commit(() => pending, true)) {
                  s.setSelected(s.actual)
                  setPending(null)
                  toast.success('备份已恢复')
                }
              }}
            >
              确认恢复
            </Action>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
