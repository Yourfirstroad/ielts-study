import { courseSource } from './curriculum'
import { answerWordCount, type PracticeGuide } from './course-schema'

export function GuidedPractice({
  guide,
  kind,
}: {
  guide: PracticeGuide
  kind: 'speaking' | 'task1' | 'task2'
}) {
  const speaking = kind === 'speaking'
  return (
    <section className="panel guided-practice" aria-label="从零开始练习">
      <span className="pill">
        中文带练 · {speaking ? '口语' : kind === 'task1' ? '学术类 Task 1' : 'Task 2'}
      </span>
      <h2>不知道怎么开始？跟着这四步。</h2>
      <p className="caption">
        今晚用 10
        分钟做一小步。下面的参考回答由本站原创编写，非官方范文，未经考官评分。示例经历可替换，不需要逐字背诵。
      </p>
      <h3>1 · 读懂题目，先想中文（2 分钟）</h3>
      <p>{guide.explain}</p>
      <ol className="guide-outline">
        {guide.outline.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <h3>2 · 用简单句填空（3 分钟）</h3>
      <p>先在下方的{speaking ? '口语笔记' : '英文草稿'}里填好方括号，再增加一句原因或细节。</p>
      <p className="guide-frame" lang="en">
        {guide.practice.frame}
      </p>
      <details className="guide-details">
        <summary>卡住了？看填空示例</summary>
        <p lang="en">{guide.practice.answer}</p>
        <p>{guide.practice.transfer}</p>
      </details>
      <dl className="guide-phrases">
        {guide.phrases.map(([en, zh]) => (
          <div key={en}>
            <dt lang="en">{en}</dt>
            <dd>{zh}</dd>
          </div>
        ))}
      </dl>
      <h3>3 · 对照参考，理解每一段（3 分钟）</h3>
      <details className="guide-details guide-model">
        <summary>展开参考答案与中文拆解</summary>
        <p className="caption">
          本站原创 · 约 {answerWordCount(guide)} 词（按空格统计）。
          {speaking
            ? '这是起步短回答；熟悉后加入细节，逐步练习持续表达 1–2 分钟，实际时长请用录音检查。'
            : '这是完整篇章示范；今晚只模仿其中一段。完整限时训练请另留时间。'}
        </p>
        {guide.paragraphs.map(([en, zh, why], index) => (
          <div className="guide-paragraph" key={en}>
            <h4>
              第 {index + 1} 段 · {guide.outline[index] ?? '补充细节'}
            </h4>
            <p lang="en">{en}</p>
            <p>
              <strong>中文理解：</strong>
              {zh}
            </p>
            <p className="guide-note">
              <strong>为什么这样说 / 写：</strong>
              {why}
            </p>
          </div>
        ))}
      </details>
      <h3>4 · 换成自己的表达（2 分钟）</h3>
      <p>{guide.practice.transfer}</p>
      <p>
        {speaking
          ? '合上参考答案，只看 4 个关键词说一遍并录音。听回放，找出一次停顿或一个说不清的词，再说一遍。'
          : kind === 'task1'
            ? '合上参考，独立写一句总趋势和两句数据比较；逐个核对年份、数值和单位。不要推测图表没有提供的原因。'
            : '合上参考，独立写出“观点 → 为什么 → 具体例子”。初学者先完成 3 句，再逐步扩展主体段；完整练习时覆盖题目所有要求。'}
      </p>
      <details className="guide-details">
        <summary>完成后怎么检查</summary>
        <ul>
          <li>
            {speaking
              ? '四个提示点都提到了吗？是否有一个具体经历或细节？'
              : '回应了题目全部问题吗？观点是否前后一致，例子是否支持观点？'}
          </li>
          <li>
            {speaking
              ? '先追求意思清楚，再减少重复、补充细节；口语还要检查发音。'
              : '每段有没有清楚的中心？检查主谓一致、时态、拼写和搭配。'}
          </li>
          <li>
            参考答案只是一个可行思路；不同观点只要有清楚的解释，也可以成立。本站不自动批改或估分。
          </li>
        </ul>
      </details>
      <div className="guide-sources">
        <h3>官方材料 · 看要求，也看示范</h3>
        <p className="caption">
          下列来源用于核对题型与评分要求，不代表官方认可本站题目或答案。点击在新窗口打开。
        </p>
        {guide.sourceIds.map((id) => {
          const source = courseSource(id)
          return (
            <div key={id}>
              <a
                className="source-link"
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.name} ↗
              </a>
              <p className="caption">{source.note}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
