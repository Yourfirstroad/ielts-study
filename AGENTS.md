# IELTS Study 开发约定

先读 README.md、PRODUCT.md、design-model.yaml、docs/开发进度.md，核实当前运行服务。中文协作。若后续加入Git先检查已有改动。

- 用户目标：四级基础、学术类、6.5分、2027年2月；具体日期尚未确定。
- 技术栈按package-lock.json。业务位于src/features/study，路由在src/app/app.tsx，样式为tokens.css和study.css。
- 保持已确认的浅色墨绿色学习工作台。通用UI复用components/ui，不能将模板遗留的演示页面加入当前导航。
- 学习记录以STORAGE_KEY隔离，Zod校验；写入成功才显示成功，禁止覆盖损坏或其他窗口刚修改的数据。兼容已有备份。
- 日期按Asia/Shanghai，未来只预览。考试类型、日期、写作Task的草稿分别保存；词汇按实际当天记复习。
- 官方/自编内容明确标注，资料必须有来源。没有证据不提供真题、官方词表或雅思分数预测。
- 新课程编辑content.ts并更新来源与核查日期；当前7日主题循环不应描述为后台自动更新。
- 构建npm run build，格式npm run format:check，核心流程npm run test:e2e。浏览器使用独立上下文，端口5186。
- 预览仅本机；公网发布、云同步、付费AI和消息发送需在相应用户授权范围内实施。
- 不自动提交、推送、删除用户数据。维护README和docs中的实际验收状态。
- 保留THIRD_PARTY_NOTICES.md。旧模板源码可供参考，但不属于已交付产品入口。
