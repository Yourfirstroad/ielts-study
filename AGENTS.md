# IELTS Study 开发约定

先读 README.md、PRODUCT.md、design-model.yaml、docs/开发进度.md，核实当前运行服务。中文协作。若后续加入Git先检查已有改动。

- 用户目标：四级基础、学术类、6.5分、2027年2月；具体日期尚未确定。
- 技术栈按package-lock.json。业务位于src/features/study，路由在src/app/app.tsx，样式为tokens.css和study.css。
- 保持已确认的浅色墨绿色学习工作台。通用UI复用components/ui，不能将模板遗留的演示页面加入当前导航。
- 学习记录以STORAGE_KEY隔离，Zod校验；写入成功才显示成功，禁止覆盖损坏或其他窗口刚修改的数据。兼容已有备份。
- 日期按Asia/Shanghai，未来只预览。考试类型、日期、写作Task的草稿分别保存；词汇按实际当天记复习。
- 官方/自编内容明确标注，资料必须有来源。没有证据不提供真题、官方词表或雅思分数预测。
- 日期课程唯一源文件为src/data/plan.json；共用course-schema.ts校验和lessonTasks摘要。通过Vite同时发布courses/plan.json供提醒读取。原content.ts的7日起步版仅用于旧记录与明确标注的复习。
- 已批准30天课程、北京时间每日显示、21:00推送同一课及后续补充维护；按docs/每日课程维护.md操作。不得改写已发布日期的题目/词ID导致历史答案错配，不得上传访客记录。
- 构建npm run build，格式npm run format:check，核心流程npm run test:e2e。浏览器使用独立上下文，端口5186。
- GitHub Pages构建npm run build:pages到dist-pages，hash路由；npm run test:pages验证严格静态托管。普通Sites构建仍为dist和BrowserRouter；两者不要混用。
- 用户已授权公开源码与GitHub Pages发布到Yourfirstroad/ielts-study；禁止上传凭据、学习备份、测试截图或运行时数据。未来发布仍须在用户相应请求范围内。
- 预览仅本机；公网发布、云同步、付费AI和消息发送需在相应用户授权范围内实施。
- 用户本轮已授权完成后直接更新GitHub Pages；课程维护范围内验证后可提交、推送。其他范围不自动发布。不得删除用户数据。维护README和docs中的实际验收状态。
- 保留THIRD_PARTY_NOTICES.md。旧模板源码可供参考，但不属于已交付产品入口。
