import { curriculum, lessons } from './curriculum'

export const sources = {
  academic: {
    name: 'IELTS · 学术类官方样题',
    url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test',
    note: '免费；阅读、写作及听说样题与答案。',
  },
  general: {
    name: 'IELTS · 培训类官方样题',
    url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/general-training-test',
    note: '免费；G 类阅读与书信写作样题。',
  },
  listening: {
    name: 'British Council · 听力练习',
    url: 'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/listening',
    note: '免费官方样题；在来源页打开音频、题目、答案和原文。',
  },
  tests: {
    name: 'British Council · 四科练习',
    url: 'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests',
    note: '免费练习入口；部分扩展服务可能需要注册。',
  },
  books: {
    name: 'Cambridge English · 官方备考书',
    url: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/',
    note: '书籍介绍免费；教材和真题集需要自行购买正版。',
  },
  types: {
    name: 'British Council · A / G 类区别',
    url: 'https://takeielts.britishcouncil.org/what-is-ielts/how-it-works/test-types',
    note: '按学校或接收机构要求选择考试类型。',
  },
  format: {
    name: 'IELTS · 学术类考试结构',
    url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test',
    note: '核对考试结构、时长和各科要求。',
  },
}
export type Source = { name: string; url: string; note: string }
export type Word = {
  id: string
  word: string
  meaning: string
  phrase: string
  example: string
  topic: number
}
const wordRows = [
  [
    [
      'acquire',
      'v. 获得；学会',
      'acquire knowledge',
      'Students acquire knowledge through practice.',
    ],
    [
      'assessment',
      'n. 评估',
      'continuous assessment',
      'Continuous assessment can reveal gaps in understanding.',
    ],
    [
      'curriculum',
      'n. 课程体系',
      'a balanced curriculum',
      'A balanced curriculum includes arts and science.',
    ],
    [
      'independent',
      'adj. 独立的',
      'independent learning',
      'Independent learning requires careful planning.',
    ],
    [
      'concentrate',
      'v. 集中注意力',
      'concentrate on a task',
      'I find it easier to concentrate in the library.',
    ],
    [
      'qualification',
      'n. 资格；学历',
      'a professional qualification',
      'The course leads to a professional qualification.',
    ],
    [
      'participate',
      'v. 参与',
      'participate in discussions',
      'All students should participate in discussions.',
    ],
    [
      'feedback',
      'n. 反馈',
      'constructive feedback',
      'Constructive feedback helps me improve my writing.',
    ],
    [
      'approach',
      'n. 方法；v. 接近',
      'an effective approach',
      'This approach encourages students to ask questions.',
    ],
    [
      'retain',
      'v. 保留；记住',
      'retain information',
      'Short review sessions help learners retain information.',
    ],
  ],
  [
    [
      'sustainable',
      'adj. 可持续的',
      'sustainable development',
      'Cities need a plan for sustainable development.',
    ],
    [
      'emission',
      'n. 排放',
      'carbon emissions',
      'Better public transport may reduce carbon emissions.',
    ],
    [
      'conservation',
      'n. 保护；节约',
      'wildlife conservation',
      'Wildlife conservation requires long-term funding.',
    ],
    ['renewable', 'adj. 可再生的', 'renewable energy', 'The town invests in renewable energy.'],
    ['resource', 'n. 资源', 'natural resources', 'We should use natural resources carefully.'],
    ['habitat', 'n. 栖息地', 'protect a habitat', 'New roads can damage an animal’s habitat.'],
    ['consume', 'v. 消耗；消费', 'consume energy', 'Older buildings often consume more energy.'],
    ['waste', 'n. 废弃物；v. 浪费', 'reduce food waste', 'Planning meals can reduce food waste.'],
    [
      'preserve',
      'v. 保护；保存',
      'preserve biodiversity',
      'Local projects can help preserve biodiversity.',
    ],
    [
      'impact',
      'n. 影响',
      'environmental impact',
      'The report examines the environmental impact of tourism.',
    ],
  ],
  [
    [
      'access',
      'n. 使用机会；v. 访问',
      'access to information',
      'Students need reliable access to information.',
    ],
    [
      'innovation',
      'n. 创新',
      'technological innovation',
      'Technological innovation can change how we work.',
    ],
    [
      'privacy',
      'n. 隐私',
      'protect privacy',
      'Users should know how an app protects their privacy.',
    ],
    [
      'reliable',
      'adj. 可靠的',
      'a reliable source',
      'Check whether the website is a reliable source.',
    ],
    ['efficient', 'adj. 高效的', 'an efficient system', 'An efficient system saves staff time.'],
    ['automate', 'v. 使自动化', 'automate routine tasks', 'Software can automate routine tasks.'],
    ['device', 'n. 设备', 'a mobile device', 'The lesson can be viewed on a mobile device.'],
    ['replace', 'v. 替代', 'replace an old system', 'The company plans to replace its old system.'],
    [
      'benefit',
      'n. 益处；v. 受益',
      'benefit from technology',
      'Rural communities may benefit from online services.',
    ],
    ['digital', 'adj. 数字的', 'digital skills', 'Many jobs require basic digital skills.'],
  ],
  [
    ['commute', 'v. 通勤', 'commute to work', 'I commute to work by train.'],
    [
      'congestion',
      'n. 拥堵',
      'traffic congestion',
      'Traffic congestion is a daily problem in the city.',
    ],
    [
      'infrastructure',
      'n. 基础设施',
      'transport infrastructure',
      'Transport infrastructure needs regular maintenance.',
    ],
    [
      'affordable',
      'adj. 负担得起的',
      'affordable housing',
      'Young workers often struggle to find affordable housing.',
    ],
    ['resident', 'n. 居民', 'local residents', 'Local residents asked for a safer crossing.'],
    ['pedestrian', 'n. 行人', 'pedestrian safety', 'The new crossing improves pedestrian safety.'],
    [
      'accessible',
      'adj. 易到达的；可使用的',
      'accessible public transport',
      'Accessible public transport helps more people travel independently.',
    ],
    ['urban', 'adj. 城市的', 'urban planning', 'Urban planning should include green spaces.'],
    [
      'facility',
      'n. 设施',
      'public facilities',
      'The neighbourhood has several public facilities.',
    ],
    ['expand', 'v. 扩大', 'expand a network', 'The city will expand its bus network.'],
  ],
  [
    ['balanced', 'adj. 均衡的', 'a balanced diet', 'A balanced diet includes a variety of foods.'],
    [
      'sedentary',
      'adj. 久坐的',
      'a sedentary lifestyle',
      'A sedentary lifestyle can leave little time for movement.',
    ],
    [
      'physical',
      'adj. 身体的',
      'physical activity',
      'Walking is a simple form of physical activity.',
    ],
    [
      'wellbeing',
      'n. 身心健康',
      'mental wellbeing',
      'Time with friends can support mental wellbeing.',
    ],
    ['habit', 'n. 习惯', 'develop a habit', 'It takes practice to develop a new habit.'],
    ['prevent', 'v. 预防；阻止', 'prevent problems', 'Regular checks can help prevent problems.'],
    [
      'routine',
      'n. 常规；惯例',
      'a daily routine',
      'A daily routine makes study time more predictable.',
    ],
    [
      'nutritious',
      'adj. 有营养的',
      'nutritious meals',
      'The café serves affordable, nutritious meals.',
    ],
    [
      'moderate',
      'adj. 适度的',
      'moderate exercise',
      'She prefers moderate exercise to competitive sport.',
    ],
    [
      'maintain',
      'v. 维持',
      'maintain a balance',
      'Students need to maintain a balance between study and rest.',
    ],
  ],
  [
    [
      'flexible',
      'adj. 灵活的',
      'flexible working hours',
      'Flexible working hours help some parents manage childcare.',
    ],
    [
      'productivity',
      'n. 生产效率',
      'improve productivity',
      'Clear priorities can improve productivity.',
    ],
    [
      'collaborate',
      'v. 协作',
      'collaborate with colleagues',
      'Designers collaborate with colleagues on new products.',
    ],
    [
      'responsibility',
      'n. 责任',
      'take responsibility',
      'Team members should take responsibility for their tasks.',
    ],
    ['occupation', 'n. 职业', 'choose an occupation', 'It can take time to choose an occupation.'],
    ['income', 'n. 收入', 'a stable income', 'A stable income helps people plan their spending.'],
    [
      'opportunity',
      'n. 机会',
      'career opportunities',
      'Further training can create career opportunities.',
    ],
    ['deadline', 'n. 截止日期', 'meet a deadline', 'We divided the work to meet the deadline.'],
    ['motivate', 'v. 激励', 'motivate employees', 'Useful feedback can motivate employees.'],
    ['balance', 'n. 平衡', 'work-life balance', 'A shorter commute may improve work-life balance.'],
  ],
  [
    [
      'heritage',
      'n. 遗产',
      'cultural heritage',
      'The museum helps visitors understand local cultural heritage.',
    ],
    ['tradition', 'n. 传统', 'a local tradition', 'The festival celebrates a local tradition.'],
    [
      'diverse',
      'adj. 多样的',
      'diverse backgrounds',
      'The class includes people from diverse backgrounds.',
    ],
    [
      'community',
      'n. 社区；群体',
      'a local community',
      'The library is important to the local community.',
    ],
    [
      'destination',
      'n. 目的地',
      'a tourist destination',
      'The town has become a popular tourist destination.',
    ],
    [
      'authentic',
      'adj. 真实的；地道的',
      'an authentic experience',
      'Visitors often look for an authentic experience.',
    ],
    [
      'perspective',
      'n. 视角',
      'a different perspective',
      'Living abroad can offer a different perspective.',
    ],
    [
      'exchange',
      'n. 交流；v. 交换',
      'cultural exchange',
      'Student visits encourage cultural exchange.',
    ],
    [
      'adapt',
      'v. 适应',
      'adapt to a new environment',
      'It takes time to adapt to a new environment.',
    ],
    [
      'respect',
      'v. 尊重；n. 尊重',
      'respect local customs',
      'Travellers should respect local customs.',
    ],
  ],
]
const legacyWords: Word[] = wordRows.flatMap((group, topic) =>
  group.map(([word, meaning, phrase, example]) => ({
    id: word,
    word,
    meaning,
    phrase,
    example,
    topic,
  })),
)
export const words: Word[] = [
  ...legacyWords,
  ...curriculum.wordBank.filter((word) => !legacyWords.some((old) => old.id === word.id)),
]
const legacyTopics = [
  {
    name: '学习与教育',
    en: 'Learning & education',
    focus: '把单词放进自己的学习经历里。',
    readingTitle: 'A quieter way to learn',
    text: 'A college library opened a quiet study room last autumn. Students can leave their phones in lockers outside, although this is optional. The room has individual desks and no group tables. During the first month, staff collected comments from visitors. Many students said they could concentrate for longer, but some wanted more opportunities to discuss difficult questions. The library therefore kept the quiet room and added a separate discussion area. Staff have not yet compared examination results before and after the change. Their next survey will ask students which spaces they use and why. The aim is to support different approaches to learning, rather than to make everyone study in the same way.',
    questions: [
      [
        'Students must put their phones in lockers.',
        'FALSE',
        '文中说 although this is optional，说明并非强制。',
      ],
      [
        'The library added a place for discussion.',
        'TRUE',
        '对应 added a separate discussion area。',
      ],
      [
        'Students achieved higher examination scores.',
        'NOT GIVEN',
        '文中没有提供考试分数，且尚未比较结果。',
      ],
    ],
    speaking: 'Describe a skill you would like to learn.',
    cues: [
      'What the skill is',
      'Why you want to learn it',
      'How you would learn it',
      'Why it would be useful',
    ],
    writing:
      'Some people believe that university students should only study subjects related to their future jobs. Others think they should study a wider range of subjects. Discuss both views and give your own opinion.',
    listen: 'Note Completion：先做一段填空，重点检查单复数和数字。',
  },
  {
    name: '环境与能源',
    en: 'Environment & energy',
    focus: '用原因、影响和解决办法组织观点。',
    readingTitle: 'The community repair table',
    text: 'Once a month, volunteers in a small town organise a repair event. Residents bring broken household objects, and volunteers help them understand what went wrong. Visitors do not pay for advice, but they must buy any replacement parts. The organisers record the number of objects repaired; they do not weigh the waste avoided. Some repairs fail because the correct parts are unavailable. Even so, participants often say they have learnt useful skills. A local school has recently asked to attend a session. The organisers hope that learning how objects work will encourage people to consider repair before buying replacements.',
    questions: [
      ['Advice at the event is free.', 'TRUE', '对应 Visitors do not pay for advice。'],
      ['Every object is successfully repaired.', 'FALSE', '文中说 Some repairs fail。'],
      [
        'The event prevents one tonne of waste each month.',
        'NOT GIVEN',
        '没有重量数据，组织者并不称重。',
      ],
    ],
    speaking: 'Describe a place in nature that you enjoy visiting.',
    cues: ['Where it is', 'When you go there', 'What you do there', 'How the place makes you feel'],
    writing:
      'Some people think individuals should take responsibility for protecting the environment. Others believe governments should take the lead. Discuss both views and give your opinion.',
    listen: 'Short Answer Questions：预读题目，圈出字数限制，复听定位关键词。',
  },
  {
    name: '科技与生活',
    en: 'Technology & everyday life',
    focus: '讲清科技带来的便利与限制。',
    readingTitle: 'Learning with an app',
    text: 'A language teacher invited her students to try a vocabulary app for two weeks. The app reminded learners to review words they had previously studied. It also allowed them to write their own example sentences. Some students used it on the bus, while others preferred to review at home. At the end of the trial, the teacher asked everyone to describe their experience. Several students found the reminders helpful, but two turned them off because there were too many notifications. The teacher did not require anyone to continue using the app. She suggested combining digital practice with conversation and reading.',
    questions: [
      [
        'Students could add their own sentences.',
        'TRUE',
        '对应 write their own example sentences。',
      ],
      ['All students kept notifications switched on.', 'FALSE', '文中有两名学生关闭提醒。'],
      ['The app cost each student ten pounds.', 'NOT GIVEN', '全文没有说明费用。'],
    ],
    speaking: 'Describe a piece of technology that you find useful.',
    cues: [
      'What it is',
      'How often you use it',
      'What you use it for',
      'How it has changed your life',
    ],
    writing:
      'Online learning is becoming more common. Do the advantages of this development outweigh the disadvantages?',
    listen: 'Multiple Choice (one answer)：记录你被干扰选项误导的原因。',
  },
  {
    name: '城市与交通',
    en: 'Cities & transport',
    focus: '用具体例子支撑城市生活观点。',
    readingTitle: 'A different journey to work',
    text: 'A company moved its office closer to a railway station. Before the move, most employees drove to work. Managers expected more people to use the train afterwards, so they provided information about routes and tickets. Three months later, a staff survey found that several employees had changed their usual journey. Others still drove because train services from their neighbourhoods were infrequent. The company then introduced flexible starting times. This allowed some staff to travel on a later train. Managers plan to repeat the survey next year. They have not published any figures about changes in the company’s carbon emissions.',
    questions: [
      ['The new office is closer to a railway station.', 'TRUE', '首句直接说明位置变化。'],
      ['All employees now travel by train.', 'FALSE', 'Others still drove 与题目相反。'],
      ['Carbon emissions fell by twenty percent.', 'NOT GIVEN', '没有发布排放变化数字。'],
    ],
    speaking: 'Describe a journey that you make regularly.',
    cues: [
      'Where you go',
      'How you travel',
      'What you notice on the way',
      'What you would change about it',
    ],
    writing:
      'Governments should spend more money on public transport than on building new roads. To what extent do you agree or disagree?',
    listen: 'Plan/Map/Diagram Labelling：先找起点，再听方位和转向表达。',
  },
  {
    name: '健康与习惯',
    en: 'Health & habits',
    focus: '练习有分寸的表达：may、can、tend to。',
    readingTitle: 'Walking at lunchtime',
    text: 'Staff at a publishing company started an informal lunchtime walking group. The route takes about twenty minutes and passes through a public garden. Participation is voluntary, and employees can join whenever their schedules allow. On rainy days, the group usually stays indoors. The organiser says that the walks give colleagues from different departments a chance to talk. She has not measured changes in fitness or productivity. A few employees suggested adding a shorter route for busy days. The group will try this next month and ask participants which option they prefer. Its main purpose is to make breaks more sociable.',
    questions: [
      [
        'Employees have to join the walking group.',
        'FALSE',
        'Participation is voluntary，参加自愿。',
      ],
      ['The route passes through a public garden.', 'TRUE', '第二句明确提及。'],
      ['Participants became more productive.', 'NOT GIVEN', '组织者没有测量生产效率变化。'],
    ],
    speaking: 'Describe a habit that you would like to develop.',
    cues: [
      'What the habit is',
      'Why you chose it',
      'What might make it difficult',
      'How you plan to keep it',
    ],
    writing:
      'Some people believe employers should encourage staff to exercise during the working day. To what extent do you agree or disagree?',
    listen: 'Sentence Completion：先预测词性，再核对拼写与答案字数。',
  },
  {
    name: '工作与协作',
    en: 'Work & collaboration',
    focus: '用观点、理由、例子写一个完整段落。',
    readingTitle: 'Choosing where to work',
    text: 'A small design team tried a flexible working arrangement for six weeks. Team members could work from home on two days each week, but everyone attended the office on Wednesdays. This shared day was used for planning and reviewing unfinished work. Some employees appreciated the shorter commute, while others missed informal conversations. At the end of the trial, the manager asked for written feedback. The team decided to continue the arrangement and add an optional online meeting on Mondays. No comparison of sales figures was included in the review. The manager explained that the trial focused on communication and staff experience.',
    questions: [
      ['Everyone attended the office on Wednesdays.', 'TRUE', '与原文一致。'],
      ['The Monday online meeting was compulsory.', 'FALSE', '会议是 optional，非强制。'],
      ['Sales increased during the trial.', 'NOT GIVEN', '评估不包含销售额比较。'],
    ],
    speaking: 'Describe a time when you worked with other people.',
    cues: [
      'What you were doing',
      'Who you worked with',
      'What your responsibility was',
      'What you learned',
    ],
    writing:
      'Working from home has become possible for many employees. Discuss the advantages and disadvantages of this development.',
    listen: 'Table Completion：根据表头预测信息类别；错题逐句复听。',
  },
  {
    name: '文化与交流',
    en: 'Culture & connection',
    focus: '复盘本周：把熟悉的话题说得更具体。',
    readingTitle: 'Stories behind the exhibits',
    text: 'A local museum asked residents to lend everyday objects for a temporary exhibition. Each object was displayed with a short story written by its owner. The collection included cooking tools, photographs and travel tickets. Visitors could listen to a few of the stories through headphones, but not every exhibit had an audio recording. The museum offered free entry to the exhibition. Staff collected comments to learn which stories visitors found interesting. They did not ask visitors to rank the financial value of the objects. When the exhibition ends, all borrowed items will be returned to their owners.',
    questions: [
      ['Every exhibit had an audio recording.', 'FALSE', 'not every exhibit 明确否定。'],
      ['Visitors did not have to pay to enter.', 'TRUE', '对应 free entry。'],
      ['The travel tickets were the most valuable objects.', 'NOT GIVEN', '没有给出价值排名。'],
    ],
    speaking: 'Describe a cultural event that you enjoyed.',
    cues: ['What the event was', 'Where it took place', 'Who you went with', 'Why you enjoyed it'],
    writing:
      'International tourism can bring benefits to local communities, but it can also cause problems. Discuss both sides and give your opinion.',
    listen: '复做本周错题最多的一组；第二遍记录原文中的同义替换。',
  },
]
export const topics = [...legacyTopics, ...lessons]
export const taskDefs = [
  {
    id: 'vocabulary',
    label: '词汇',
    title: '学会 10 个词，记住常用搭配',
    minutes: 10,
    path: '/vocabulary',
    hint: '朗读 → 回忆释义 → 用自己的经历造句',
  },
  {
    id: 'listening',
    label: '听力',
    title: '听一段官方材料，找出漏听原因',
    minutes: 15,
    path: '/practice/listening',
    hint: '先做题，再对答案，最后带着原文复听',
  },
  {
    id: 'reading',
    label: '阅读',
    title: '读一篇短文，练习定位证据',
    minutes: 15,
    path: '/practice/reading',
    hint: '完成判断题，再到官方样题中迁移练习',
  },
  {
    id: 'speaking',
    label: '口语',
    title: '准备 1 分钟，连续说 2 分钟',
    minutes: 10,
    path: '/practice/speaking',
    hint: '围绕一个话题展开，记录卡住的表达',
  },
  {
    id: 'writing',
    label: '写作',
    title: '写一个有理由和例子的段落',
    minutes: 10,
    path: '/practice/writing',
    hint: '今日微练习；完整限时作文另留 40 分钟',
  },
] as const
