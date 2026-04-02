import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { submitProjectQaAnswer } from '../api/judgeApi';
import './ProjectQaPage.css';

const PROJECT_QA_RED_DOTS_KEY = 'js-oj:projectQaRedDots';
const PROJECT_QA_EXPANDED_KEY = 'js-oj:projectQaExpandedSections';
const PROJECT_QA_SELECTED_KEY = 'js-oj:projectQaSelectedId';
const PROJECT_QA_ANSWERS_KEY = 'js-oj:projectQaAnswers';

const readRedDots = () => {
  try {
    const raw = window.localStorage.getItem(PROJECT_QA_RED_DOTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const writeRedDots = (dots) => {
  try {
    window.localStorage.setItem(PROJECT_QA_RED_DOTS_KEY, JSON.stringify(dots));
  } catch (e) { console.warn('保存红点状态失败:', e); }
};

const writeExpandedSections = (sections) => {
  try {
    window.localStorage.setItem(PROJECT_QA_EXPANDED_KEY, JSON.stringify(sections));
  } catch (e) { console.warn('保存展开状态失败:', e); }
};

const readSelectedId = () => {
  try {
    return window.localStorage.getItem(PROJECT_QA_SELECTED_KEY);
  } catch { return null; }
};

const writeSelectedId = (id) => {
  try {
    window.localStorage.setItem(PROJECT_QA_SELECTED_KEY, id);
  } catch (e) { console.warn('保存选中状态失败:', e); }
};

const readAnswers = () => {
  try {
    const raw = window.localStorage.getItem(PROJECT_QA_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const writeAnswers = (answers) => {
  try {
    window.localStorage.setItem(PROJECT_QA_ANSWERS_KEY, JSON.stringify(answers));
  } catch (e) { console.warn('保存答案失败:', e); }
};

const OBSIDIAN_BASE = '/Users/zhangjinghao/Library/Mobile Documents/iCloud~md~obsidian/Documents/zhangjh024';

const SECTION_ICONS = {
  '组件库 & 多态 Style': '🧩',
  '秒开率性能优化': '⚡',
  '秒开率 → 原理延伸': '🔬',
  '鸿蒙 RN 适配': '📱',
  'train-ai-node（火车票 AI 工作助手）': '🤖',
  '火车票业务管理后台系统': '🖥️'
};

const RESUME_DESCRIPTIONS = {
  '组件库 & 多态 Style': '针对填单页、详情页、列表页等6大核心页面代码重复率高的问题，抽离 RobbingCell、Modal、Card、Label 等通用组件至 Common 库，设计 UI 与业务特性分离的多态 Style 方案。',
  '秒开率性能优化': '将页面启动链路拆解为跳转/数据/计算/渲染四阶段：优化QP包预加载策略，预加载占比提升至94.4%；制定三级接口优先级，延迟非核心请求，异步操作串行改并行；引入计算缓存与算法降阶；非可视组件延迟挂载，批量更新+useMemo优化首帧渲染。安卓用户秒开率提升39.2个百分点（从43.6%提升至82.8%），90%的用户只需要1.35秒内就能操作页面。',
  '秒开率 → 原理延伸': '将页面启动链路拆解为跳转/数据/计算/渲染四阶段，涉及 useMemo、批量更新、事件循环、Redux 等 React/JS 核心原理。',
  '鸿蒙 RN 适配': '参与火车票业务针对鸿蒙单框架进行RN适配，对齐线上版本，实现火车部分原生桥接层：适配了多项原生通信sdk包括日历提醒、本地存储、语音助手；折叠屏用户体验优化等。纯血鸿蒙渠道每周为业务贡献4000+票量，折叠屏 L2T 转化率提升2.3%。',
  'train-ai-node（火车票 AI 工作助手）': '基于飞书生态搭建机器人，统一火车多个业务咨询入口，基于 aily 智能体平台创建10+工作流技能。基于 MCP 协议实现自动化查询app发布崩溃和错误堆栈、搜索代码库、WebSocket实时查询用户请求轨迹等技能。机器人拦截31%工单量，年化节省300+pd。',
  '火车票业务管理后台系统': '参与开发了项目的 BFF 层架构，实现了前后端解耦和微服务路由聚合，解决了 SSR 鉴权、多环境切换、接口统一管理等问题。参与搭建了后台系统的组件化架构，实现了 Layout、PageHeader、Content 等核心组件，实现了统一布局、动态菜单，支撑了 50+ 页面的快速开发。'
};

const PROJECT_QA_SECTIONS = [
  {
    project: '项目1：去哪儿旅行 App（火车票业务）',
    categories: [
      {
        title: '组件库 & 多态 Style',
        questions: [
          {
            id: 'p1-style-1',
            title: '多态 Style 方案怎么实现的？和直接传 style 的区别？',
            tags: ['组件设计', '多态', 'Style 方案', 'Props 设计'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动1/07 你的多态 Style 方案具体怎么实现的？多态 Style 方案和普通的 props 传 style 有什么区别？为什么不直接传 style？.md'
          },
          {
            id: 'p1-style-2',
            title: '6个页面怎么判断哪些该抽象、哪些不该？',
            tags: ['抽象设计', '组件复用', '业务判断'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动1/06 6个页面的差异点在哪？你怎么判断哪些该抽象、哪些不该？.md'
          },
          {
            id: 'p1-style-3',
            title: 'Common 库怎么管理的？版本怎么控制？',
            tags: ['包管理', '版本控制', 'Common 库', 'Monorepo'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动1/05 Common 库怎么管理的？独立仓库还是 monorepo？版本怎么控制？.md'
          }
        ]
      },
      {
        title: '秒开率性能优化',
        questions: [
          {
            id: 'p1-perf-1',
            title: '四阶段拆解：每个阶段的瓶颈和度量方式？',
            tags: ['性能优化', '启动链路', '度量体系', '瓶颈分析'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/01 你提到将页面启动链路拆解为"跳转／数据／计算／渲染"四阶段，能具体讲讲每个阶段的时间占比和瓶颈分别是什么吗？你是怎么度量每个阶段耗时的？.md'
          },
          {
            id: 'p1-perf-2',
            title: 'QP 包预加载怎么优化到 94.4% 的？',
            tags: ['预加载', 'QP 包', '策略优化'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/02 QP 包预加载占比从多少提升到了 94.4%？之前为什么没有达到这个水平？你具体做了哪些策略优化？.md'
          },
          {
            id: 'p1-perf-3',
            title: '三级接口优先级怎么划分的？',
            tags: ['接口优化', '优先级策略', '请求调度'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/03 "三级接口优先级"具体是怎么划分的？每一级分别对应哪些接口？优先级的判定标准是什么？.md'
          },
          {
            id: 'p1-perf-4',
            title: '串行改并行改了哪些？数据依赖怎么处理？',
            tags: ['异步优化', '并行请求', '数据依赖', 'Promise'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/04 "异步串行改并行"具体改了哪些场景？改并行后有没有遇到数据依赖的问题？怎么处理的？.md'
          },
          {
            id: 'p1-perf-5',
            title: '非可视组件延迟挂载是怎么做的？',
            tags: ['渲染优化', '延迟挂载', '首帧渲染', 'shouldRenderComponent']
          },
          {
            id: 'p1-perf-6',
            title: '这个项目你怎么推动的？你的角色？',
            tags: ['项目管理', '跨团队协作', '角色定位'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/09 整个秒开率优化项目你是怎么推动的？涉及多少人？你在里面的角色是什么？.md'
          }
        ]
      },
      {
        title: '秒开率 → 原理延伸',
        questions: [
          {
            id: 'p1-ext-1',
            title: 'useMemo 原理，什么时候该用？',
            tags: ['React', 'useMemo', '性能优化', 'Hooks'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/10 你在优化中用到了 useMemo，能结合你的项目场景讲讲 useMemo 的工作原理吗？什么时候该用，什么时候不该用？.md'
          },
          {
            id: 'p1-ext-2',
            title: 'React 批量更新机制，17 vs 18？',
            tags: ['React', '批量更新', 'React 18', 'Concurrent'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/11 你提到"批量更新"来优化首帧渲染，React 的批量更新机制是怎么工作的？React 17 和 React 18 有什么区别？在 RN 中表现一样吗？.md'
          },
          {
            id: 'p1-ext-3',
            title: 'JS 事件循环怎么调度并行请求？',
            tags: ['JavaScript', '事件循环', '异步', 'Event Loop'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/12 你将异步请求从串行改并行，JavaScript 的事件循环是怎么调度这些并行请求的？它们真的是"并行"吗？.md'
          },
          {
            id: 'p1-ext-4',
            title: 'Redux dispatch 同步还是异步？',
            tags: ['Redux', '状态管理', 'dispatch', '中间件'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动2/13 你在项目中用 Redux 做状态管理，Redux 的 dispatch 是同步的还是异步的？在性能优化中有没有遇到 Redux 相关的性能问题？.md'
          }
        ]
      },
      {
        title: '鸿蒙 RN 适配',
        questions: [
          {
            id: 'p1-hm-1',
            title: '鸿蒙技术架构总览，RN 怎么跑起来的？',
            tags: ['HarmonyOS', 'React Native', '架构', '跨平台'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动3/01 能整体介绍一下火车票业务在鸿蒙上的技术架构吗？RN 在鸿蒙上是怎么跑起来的？.md'
          },
          {
            id: 'p1-hm-2',
            title: '以日历提醒为例，讲桥接完整链路',
            tags: ['Native Bridge', '日历', 'JS-Native 通信'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动3/03 你实现的原生桥接层，以"日历提醒"为例，能详细讲讲从 JS 调用到原生能力执行的完整链路吗？.md'
          },
          {
            id: 'p1-hm-3',
            title: 'RN vs H5 调用原生能力的区别？',
            tags: ['RN', 'H5', 'SDK 适配', '通信协议'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动3/04 你适配了多个RN／H5 与原生通信的 SDK，这些通信走的是什么协议？H5 页面和 RN 页面调用原生能力的方式有什么区别？.md'
          },
          {
            id: 'p1-hm-4',
            title: '折叠屏怎么做的？转化率怎么提升的？',
            tags: ['折叠屏', '响应式', 'L2T 转化率', 'UX'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动3/07 折叠屏 L2T 转化率提升了 2.3%，具体做了哪些事情才提升了转化率？技术实现上怎么检测和响应折叠／展开状态？.md'
          },
          {
            id: 'p1-hm-5',
            title: 'JSBridge 底层原理',
            tags: ['JSBridge', 'WebView', '原生通信', '原理'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动3/09 JSBridge 的底层原理是什么？为什么需要 JSBridge 而不是直接调用？.md'
          },
          {
            id: 'p1-hm-6',
            title: '纯血鸿蒙 vs Android 兼容模式的区别？',
            tags: ['HarmonyOS', 'AOSP', '架构对比', '适配'],
            obsidianFile: '01.去哪儿旅行火车app🚂/行动3/13 鸿蒙的"纯血"架构和之前 Android 兼容模式有什么本质区别？这对 RN 适配意味着什么？.md'
          }
        ]
      }
    ]
  },
  {
    project: '项目2：train-ai-node（火车票 AI 工作助手）',
    categories: [
      {
        title: 'train-ai-node（火车票 AI 工作助手）',
        questions: [
          {
            id: 'p2-ai-1',
            title: '这个项目解决了什么核心问题？',
            tags: ['项目背景', '业务价值', 'AI 工程化'],
            obsidianFile: '02.train_ai_node🤖/行动1/01 这个项目解决了什么核心问题？.md'
          },
          {
            id: 'p2-ai-2',
            title: '为什么选飞书 + aily 而不是自建？',
            tags: ['技术选型', '飞书生态', 'aily 平台', '成本评估'],
            obsidianFile: '02.train_ai_node🤖/行动1/03 为什么选择飞书机器人 + aily 平台的方案，而不是自己搭建一套完整的智能体系统？.md'
          },
          {
            id: 'p2-ai-3',
            title: 'MCP 协议的价值？为什么不用 REST API？',
            tags: ['MCP', '协议设计', 'REST API', '工具集成'],
            obsidianFile: '02.train_ai_node🤖/行动2/01 MCP 协议在项目中的价值是什么？为什么不直接用 REST API？.md'
          },
          {
            id: 'p2-ai-4',
            title: '崩溃堆栈查询的技术流程？',
            tags: ['MCP', '崩溃分析', '自动化', '技能实现'],
            obsidianFile: '02.train_ai_node🤖/行动2/03 基于 MCP 实现崩溃堆栈查询这个技能，具体的技术流程是什么？.md'
          },
          {
            id: 'p2-ai-5',
            title: 'WebSocket 实时轨迹查询怎么实现的？',
            tags: ['WebSocket', '实时通信', '用户轨迹', 'Qtrace'],
            obsidianFile: '02.train_ai_node🤖/行动2/04 WebSocket 实时查询用户请求轨迹是怎么实现的？为什么用 WebSocket？.md'
          },
          {
            id: 'p2-ai-6',
            title: '31% 工单拦截率怎么定义和统计的？',
            tags: ['数据统计', '业务指标', 'ROI', '效果验证'],
            obsidianFile: '02.train_ai_node🤖/行动3/02 "拦截 31% 工单量"是怎么定义和统计的？.md'
          }
        ]
      }
    ]
  },
  {
    project: '项目3：火车票业务管理后台系统',
    categories: [
      {
        title: '火车票业务管理后台系统',
        questions: [
          {
            id: 'p3-bff-1',
            title: '为什么引入 BFF？不用会怎样？',
            tags: ['BFF', '架构设计', '微服务', '前后端解耦'],
            obsidianFile: '03.火车票后台管理系统🖥️/行动1/02 为什么要引入 BFF 层？不用 BFF 直接前端调后端微服务有什么问题？.md'
          },
          {
            id: 'p3-bff-2',
            title: 'SSR 鉴权怎么实现的？为什么比 CSR 复杂？',
            tags: ['SSR', '鉴权', 'Cookie', '服务端渲染'],
            obsidianFile: '03.火车票后台管理系统🖥️/行动1/03 BFF 层的 SSR 鉴权是怎么实现的？为什么 SSR 场景下鉴权比 CSR 更复杂？.md'
          },
          {
            id: 'p3-bff-3',
            title: '为什么选 Koa？和 API Routes 的区别？',
            tags: ['Koa', 'Express', 'Next.js', 'API Routes'],
            obsidianFile: '03.火车票后台管理系统🖥️/行动1/05 BFF 层用 Koa 实现，为什么选 Koa 而不是 Express？和 Next.js 自带的 API Routes 有什么区别？.md'
          },
          {
            id: 'p3-bff-4',
            title: '动态菜单怎么实现的？权限怎么控制？',
            tags: ['动态菜单', 'RBAC', '权限控制', '组件化'],
            obsidianFile: '03.火车票后台管理系统🖥️/行动2/02 动态菜单是怎么实现的？菜单数据从哪来？权限怎么控制？.md'
          },
          {
            id: 'p3-bff-5',
            title: '50+ 页面怎么快速开发的？',
            tags: ['脚手架', '页面模板', '快速开发', 'Ant Design'],
            obsidianFile: '03.火车票后台管理系统🖥️/行动2/03 50+ 页面的快速开发是怎么做到的？有没有沉淀出页面模板或脚手架？.md'
          }
        ]
      }
    ]
  }
];

const allQuestions = PROJECT_QA_SECTIONS.flatMap((proj) =>
  proj.categories.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, categoryTitle: cat.title }))
  )
);

const questionIndexMap = new Map(allQuestions.map((q, i) => [q.id, i]));

const QUICK_ANSWERS = {
  'p1-style-1': `**核心：** 通过 \`type\` 属性 + 样式映射表实现一套组件适配多业务场景。

**三层样式优先级：**
- **base style**：所有场景共用（内边距、字体）
- **type style**：业务差异化（抢票页红色、订单页灰色）
- **custom style**：style props 个性化微调

**vs 直接传 style：** ①一致性无法保证（10人10种红色） ②关注点未分离（调用方不该知道具体色值） ③样式组合复杂（variant 涉及背景/文字/边框/hover 联动）`,

  'p1-style-2': `**核心：** 抽"结构稳定、语义一致"的共性，保留"业务语义不同"的差异。

**三个判断标准：**
1. **稳定重复** → 抽（Card/Modal/Label/Cell 等骨架组件）
2. **差异可配置化** → 用 props/插槽做同一组件（文案/颜色/图标不同）
3. **业务语义不同** → 不强行抽（数据源、状态流转、交互目标不同）

**最终做法：** 底层通用组件（结构复用） + 上层业务页面各自拼装（逻辑独立）`,

  'p1-style-3': `**核心：** 独立公共包，npm 发包管理，业务项目按版本依赖接入。

**为什么独立仓库：**
- 职责边界清晰（Common 库只管通用组件，业务项目只管页面逻辑）
- 多业务线统一复用
- 版本隔离，业务方按版本选择升级

**发布流程：** Common 库开发自测 → 发新版本到 npm → 业务项目升级依赖 → 先试接再推广`,

  'p1-perf-1': `**核心：** 启动链路拆为跳转→数据→计算→渲染四阶段，TTI<1s 即秒开。

**度量：** RenderMarker 机制（核心组件挂 qRenderMarker），P50/P90 分位分析。

**四阶段优化：**
- **跳转：** QP 预加载 + 骨架屏先行
- **数据（耗时最大）：** P0/P1/P2 三级分级 + 预请求 + 串行改并行 + 减少桥通信
- **计算：** 哈希索引避免重复计算 + 长任务拆分/Worker
- **渲染：** 非首屏延后挂载 + isCoreDataReady 跳过无效渲染 + 批量更新 + useMemo`,

  'p1-perf-2': `**核心：** QP 预加载从 ~72% → 94.4%，关键是提前触发、减少阻塞、监控兜底。

**之前为什么低：**
1. 触发时机过晚（等二屏渲染完才触发）
2. preload.js 请求阻塞 JS chunk 下载
3. 低内存设备预加载被系统回收

**三个策略：**
1. **提前触发：** 一屏渲染完 idle 时就预加载 train_rn
2. **延迟非关键初始化：** CalendarUtil/CityList 加 setTimeout，让 chunk 先下完
3. **兜底重试：** 失败/超时监控，进入频道页时补加载核心 bundle`,

  'p1-perf-3': `**核心：** 按"对首屏影响程度"分三级，控制请求时序和资源分配。

- **P0（核心）：** 首屏主体不可缺（车次主列表），走最前面同步链路
- **P1（重要）：** 首屏可见不阻塞主框架（优惠券/成功率），主列表返回后并行异步
- **P2（非关键）：** 不影响首屏决策（埋点/弹窗/营销），首帧后延迟触发

**落地：** 监听列表首项 useEffect 回调 → 延迟 100ms 触发 P1/P2 + 1500ms 兜底定时器，flag 互斥只触发一次`,

  'p1-perf-4': `**核心：** 按依赖关系分类——强依赖串行、共享前置并行、无依赖提前预取。

**两个典型场景：**
1. **OTA 初始化：** 先拿 dynamicData → 优惠券/多方案/核心报价位 Promise.all 并行 → 非核心并行
2. **列表页增强数据：** 首页选完条件就通过 TrainListFirstScreenPreSearch 预取，Promise 存入带 TTL 的 LRU Cache，进列表页直接读

**getData 统一入口：** 缓存已有同步返回、Promise 在等就 await、未命中才发新请求`,

  'p1-perf-5': `**核心：** 首帧只挂载用户可见的核心组件，弹窗/浮层等非可视组件延后到首屏渲染完成后再集中挂载。

**机制：trainListFirstFrameFlag**
1. 初始值 true → PageModalsAdapter.shouldRenderComponent 检测到 flag，**屏蔽 14 个弹窗组件挂载**
2. 列表数据回来、首屏渲染完成后，afterPageInitShowCallback 里一次 dispatch 将 flag 设为 false
3. 所有订阅该 state 的 Adapter 同步收到通知 → **14 个弹窗同一轮 commit 集中挂载**（而非分散触发 14 次渲染）

**更细粒度：scheduleComponent**
- 通过 InteractionManager.runAfterInteractions 等 Native 入场动画结束后再挂载
- 避免 JS 线程和动画线程竞争，保证入场动画流畅

**本质：** 把组件挂载的控制权从"数据就绪立刻挂"改为"首帧之后、动画之后再挂"，用一个 flag + 单次 dispatch 实现批量延迟`,

  'p1-perf-6': `**角色：** 核心执行者，独立负责前端性能专项，方案自己设计。

**四步推动：**
1. **技术调研：** 分段埋点量化四阶段瓶颈
2. **制定方案：** 按 ROI 排优先级，和产品一起分批迭代
3. **落地验证：** 灰度/AB 实验，先大数据量线路试再全量
4. **沉淀防劣化：** 秒开率下降自动告警，策略服务端可配

**团队：** 前端我一人 + 产品一位 + Native 配合。mentor Review 方向性建议，具体方案实现都是我来`,

  'p1-ext-1': `**核心：** useMemo = 跳过昂贵计算 + 保持引用稳定。两者缺其一慎用。

**原理：** 依赖数组 Object.is 浅比较，没变返回缓存值，存在 Fiber memoizedState 上。

**项目场景：**
- 骨架屏：空依赖固定引用，父组件 re-render 跳过子树 diff
- 日历栏：精确依赖 foldHeader/calendarBarData，隔离滚动产生的无关 state 变化

**该用：** 计算有开销、高频 re-render、返回值传 memo 子组件
**不该用：** O(1) 简单计算、组件很少 re-render、依赖每次都变`,

  'p1-ext-2': `**核心：** 批量更新 = 多次 setState 合并一次 re-render，本质是控制渲染时机。

**17 vs 18：**
- **17：** 只在合成事件/生命周期自动批量。setTimeout/Promise 不行，需 unstable_batchedUpdates
- **18：** Automatic Batching 所有上下文自动合并，不想合并用 flushSync

**项目实践（React 16/17）：**
- trainListFirstFrameFlag=true → 首帧屏蔽 14 个弹窗（shouldRenderComponent 返回 false）
- 数据就绪后一次 dispatch → flag=false → 14 个弹窗同一轮 commit 集中挂载`,

  'p1-ext-3': `**核心：** 不是并行是并发。JS 单线程，网络 I/O 由 OS/Native 层处理不占 JS 线程。

**原理：** Promise.all 同一 tick 发出多个请求，总耗时 = max(T1..Tn) 而非累加。

**事件循环：** 调用栈清空 → 清空所有微任务 → 取一个宏任务 → 循环

**RN 注意：** Native→JS 回调短时间涌入会排队造成卡顿，需做优先级控制（skipTypes）和节流（pauseMinorTask）`,

  'p1-ext-4': `**核心：** dispatch 本身同步（reducer 同步执行），中间件可拦截推迟触达 reducer 时机。

**中间件：** thunk（dispatch 函数包裹异步）+ promise（payload 是 Promise 等 resolve）

**性能问题：** 一次 dispatch 通知几十个 Adapter，同步遍历+对比+setState 阻塞 JS 线程

**三层解法：**
1. **scheduleUpdate：** 每 N 个组件 yield 一个微任务，让出线程给动画帧
2. **renderRelatedStateChanged：** 精确声明关心的 state 字段，其他变化跳过
3. **首帧 flag：** trainListFirstFrameFlag 屏蔽非关键组件的 shouldRenderComponent`,

  'p1-hm-1': `**核心：** 同一份 JS Bundle + 鸿蒙版运行环境 + 组件映射 ArkUI + ArkTS 重写 Native Module。

**四层架构：**
- **JS 业务层：** 跨平台复用，改动最小
- **RN 框架层：** RNOH 将渲染指令映射到 ArkUI（View→Column/Row）
- **原生桥接层（我的工作）：** 日历/存储/语音用 ArkTS 重写
- **鸿蒙系统层：** HarmonyOS NEXT 系统 API

**通信：** JS ↔ NAPI(C++) ↔ ArkTS（等同于 Android 的 JNI）
**成果：** 纯血鸿蒙每周贡献 4000+ 票量`,

  'p1-hm-2': `**核心：** JS 侧接口签名三端对齐，业务代码零改动，只有底层实现不同。

**日历提醒完整链路：**
1. JS 调 NativeModules.CalendarReminderModule.addReminder(params)
2. Bridge 序列化（NAPI）→ Native 侧
3. ArkTS TurboModule 解析参数 → 调 @ohos.calendarManager
4. 权限预检（READ/WRITE_CALENDAR），拒绝返回错误码
5. Promise resolve/reject 原路返回

**三个模块对比：** 日历=单次 Promise（难点：权限）| 存储=单次 Promise（难点：8KB 限制，策略路由）| 语音=EventEmitter 事件流（难点：生命周期+时序）`,

  'p1-hm-3': `**一句话：** RN 走 C++ Bridge（NAPI），引擎级通信；H5 走 JSBridge（WebView 消息通道），字符串传递。

**核心区别：**
- **通道：** RN=NAPI 接近函数调用 / H5=postMessage+URL Scheme
- **注册：** RN=TurboModule 编译时 / H5=BridgeHandler 运行时
- **类型：** RN=框架自动解析有约束 / H5=全字符串手动 JSON.parse+校验
- **性能：** RN ~1-2ms / H5 ~5-10ms
- **回调：** RN=Promise/EventEmitter 原生 / H5=callbackId 手动映射

**设计：** 公共 Service 层不感知来源，RN/H5 入口各写薄适配层`,

  'p1-hm-4': `**核心：** 先建可观测性找断点，再修业务层布局，2.3% 提升主要来自提单流程修复。

**我做的（业务层）：**
1. **埋点：** 关键节点加折叠屏专属埋点（global.isFold），单独拉漏斗
2. **检测：** QFoldScreenManager.getSplitMode() + Dimensions change 监听
3. **修复：** 提单页键盘+半折叠遮挡提交按钮 → 相对宽度 + KeyboardAvoidingView

**基础架构做的：** 翻书模式（foldStatusChange + 铰链避让 + 容器分割）
**诚实说：** 2.3% 不全是我的功劳，但提单环节是高意向用户，修复边际价值最高`,

  'p1-hm-5': `**为什么需要：** WebView 是沙箱，JS 和 Native 内存/语言不互通。

**JS → Native（三种）：**
1. URL Scheme 拦截（早期，有长度限制和丢消息风险）
2. **注入全局方法（主流）：** Native 往 window 注入对象，调方法穿透到 Native
3. postMessage（现代方案）

**Native → JS：** runJavaScript 注入 JS 代码，触发预注册回调

**回调机制：** callbackId + Map 存 resolve → Native 完成后 runJavaScript 调 callback → resolve 触发 → await 拿到结果`,

  'p1-hm-6': `**核心：** 旧鸿蒙=Android 套壳（有 AOSP），纯血=全部自研（微内核+ArkUI+ArkTS），APK 跑不了。

**对 RN 影响（全部推倒重来）：**
1. **引擎重写：** Java 代码全废，需 RNOH（C++ + ArkTS）
2. **Native Module 重写：** 系统 API 全变（SharedPreferences→@ohos.data.preferences）
3. **三方库失效：** 底层有 Java/Kotlin 的库全不能用

**新机会：** 分布式数据同步、元服务卡片、统一折叠屏 API、方舟 AOT 启动更快`,

  'p2-ai-1': `**一句话：** 通过 MCP 工具 + 飞书智能体，统一内部系统能力给 AI，降低值班咨询的人力成本和响应延迟。拦截 31% 工单量，年化节省 300+ pd。`,

  'p2-ai-2': `**核心：** 用户在飞书，入口就在飞书；Aily 提供够用的基础设施；时间窗口两个月。

**三个考量：**
1. **用户触达：** 飞书服务台零切换成本
2. **避免造轮子：** Aily 封装对话管理/工作流编排，我们专注业务技能
3. **时间约束：** 8-10 月从零到自助率 28%，快速验证核心假设

**防锁定：** 核心工具能力在自己的 Node.js 服务里，Aily 只做编排入口`,

  'p2-ai-3': `**一句话：** REST 给程序员用，MCP 给 LLM 用。两个并存各服务各的场景。

**MCP 优势：**
1. **自动发现：** Agent 调 tools/list 拿到所有工具 + schema
2. **Schema 即文档：** Zod .describe() 让 LLM 理解参数含义
3. **生态复用：** Cursor/Claude Desktop 直接接入，零适配
4. **新增三步：** 定义 Zod schema + callback → import 加入数组 → 完成

**实现：** Zod（.coerce 类型转换 + .transform 值映射）→ registerTool → 三种传输（stdio/HTTP/SSE）`,

  'p2-ai-4': `**核心：** 三个 MCP 工具串联，AI 自主决策调用顺序（ReAct 模式）。

**流程：**
1. **query_apm_error：** 平台/时间/类型 → 崩溃列表（isAuto=true 批量 8 次查询）
2. **query_apm_detail：** bugId → 错误类型/影响用户/堆栈
3. **query_apm_code_detail（核心）：** Source Map + 混淆堆栈 → source-map 库 originalPositionFor → 原始文件:行号 + 前后 2 行源码

**细节：** RN 堆栈"函数名@文件索引:列号:类型"，先 line=文件索引查，未命中退化 line=1（单行打包）`,

  'p2-ai-5': `**为什么 WebSocket：** QTracer 数据流式推送，REST 轮询不够实时。

**流程：**
1. HTTP 拿动态 WebSocket URL
2. 建连发送 traceId 订阅消息
3. 持续监听，收到 finish 信号或超时（30s/60s）关闭
4. 提取 ####RECEIVE / ####RESULT 字段，Markdown 返回 AI

**小设计：** 支持直接传 URL，自动提取 traceId 参数`,

  'p2-ai-6': `**定义：** 机器人拦截率 = 机器人工单量 ÷（机器人 + 人工工单量）

**数据：** Q3 实测 28.33%（目标 20%，达标率 142%），年化预估 31%
**统计来源：** 飞书服务台后台自动区分，无需自己埋点
**年化收益：** 6150 工单 × 31% ÷ 3.33个/天 ≈ 572 人天 - 61 投入 → ~102 万元`,

  'p3-bff-1': `**一句话：** BFF = 前端专属中间层，前端只跟 BFF 打交道。

**解决四个问题：**
1. **鉴权统一：** login.middleware 拦截所有 /api/*，cookie 透传，后端无感
2. **环境解耦：** PM2 ecosystem 注入环境变量，前端零改动
3. **接口收口：** 通用代理端点 + _path 参数，BFF 路由到微服务
4. **SSR 适配：** 服务端手动取 cookie 透传

**vs Gateway：** Gateway 是后端大门（限流/熔断），BFF 是前端管家（数据裁剪/SSR）`,

  'p3-bff-2': `**核心问题：** 浏览器自动带 cookie，Node.js（getServerSideProps）不会 → BFF 收到"裸请求"→ 401。

**解法：** \`headers: { Cookie: ctx?.req?.headers?.cookie || '' }\` — 手动从请求上下文取 cookie 塞进 Node.js 请求头。

**配套：** SSR 鉴权失败直接 302 重定向（用户连 HTML 都拿不到，比 CSR 更安全）`,

  'p3-bff-3': `**vs Express：** Koa 原生 async/await + 洋葱模型，try/catch 处理错误。

**vs API Routes：** 没有中间件机制，14 个接口都要重复写鉴权；Koa 一个 server.use() 全局生效。

**架构：** bodyParser → loginMiddleWare → router.routes → Next.js handle，顺序明确。API 和页面共享中间件链，requireDirectory 自动注册路由。`,

  'p3-bff-4': `**核心：** 前端 menu.tsx 定义完整结构，后端返回有权限的 key 列表（下划线拼接层级），前端匹配过滤。

**流程：** 调权限接口 → 去重 → 匹配 menu.tsx → 按 weight 排序 → 渲染

**四级权限：**
1. 一级（markets）→ 模块可见
2. 二级（markets_vouchers）→ 子菜单
3. 三级（markets_vouchers_list）→ 页面可访问（否则重定向首页）
4. 四级（markets_vouchers_list_goOnline）→ 按钮（operationAuthority.isShow()）`,

  'p3-bff-5': `**核心：** 没有脚手架，但三个统一让新模块只改业务字段。

**三个统一：**
1. **组件骨架：** Layout（_app.tsx 全局）+ PageHeader + Content，布局不用写
2. **数据请求：** getServerSideProps 统一结构 + withResponse + useMemo + useReducer
3. **目录规范：** list/create/update/detail/copy + components/

**新模块 = 复制 + 改标题/接口路径/columns/SearchForm，骨架代码一行不动**`
};

const ProjectQaPage = () => {
  const [redDots, setRedDots] = useState(readRedDots);
  const [selectedId, setSelectedId] = useState(() => readSelectedId() || allQuestions[0]?.id);
  const [expandedSections, setExpandedSections] = useState({});
  const [answers, setAnswers] = useState(readAnswers);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [quickAnswerOpen, setQuickAnswerOpen] = useState(true);
  const answerTimerRef = useRef(null);

  const totalCount = allQuestions.length;

  const selectedQuestion = useMemo(
    () => allQuestions.find((q) => q.id === selectedId),
    [selectedId]
  );

  const selectedIndex = selectedId ? questionIndexMap.get(selectedId) : -1;

  const handleSelectQuestion = useCallback((id) => {
    setSelectedId(id);
    writeSelectedId(id);
    setAiResult(null);
  }, []);

  const handleToggleRedDot = useCallback((e, id) => {
    e.stopPropagation();
    setRedDots((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeRedDots(next);
      return next;
    });
  }, []);

  const handleToggleSection = useCallback((title) => {
    setExpandedSections((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      writeExpandedSections(next);
      return next;
    });
  }, []);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      const prevQ = allQuestions[selectedIndex - 1];
      setSelectedId(prevQ.id);
      writeSelectedId(prevQ.id);
    }
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex < allQuestions.length - 1) {
      const nextQ = allQuestions[selectedIndex + 1];
      setSelectedId(nextQ.id);
      writeSelectedId(nextQ.id);
    }
  }, [selectedIndex]);

  const handleOpenObsidian = useCallback((obsidianFile) => {
    const uri = `obsidian://open?vault=zhangjh024&file=${encodeURIComponent(obsidianFile.replace('.md', ''))}`;
    window.open(uri, '_blank');
  }, []);

  const handleAnswerChange = useCallback((e) => {
    const value = e.target.value;
    setAnswers((prev) => {
      const next = { ...prev, [selectedId]: value };
      clearTimeout(answerTimerRef.current);
      answerTimerRef.current = setTimeout(() => writeAnswers(next), 500);
      return next;
    });
  }, [selectedId]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedQuestion || !answers[selectedId]?.trim() || analyzing) return;
    setAnalyzing(true);
    setAiResult(null);
    try {
      const result = await submitProjectQaAnswer(
        selectedQuestion.title,
        answers[selectedId],
        selectedQuestion.obsidianFile
      );
      setAiResult(result);
    } catch (err) {
      setAiResult({ success: false, analysis: '请求失败: ' + (err.message || '网络错误') });
    } finally {
      setAnalyzing(false);
    }
  }, [selectedQuestion, selectedId, answers, analyzing]);

  useEffect(() => {
    return () => clearTimeout(answerTimerRef.current);
  }, []);

  return (
    <div className="pqa-page">
      <div className="pqa-layout">
        <div className="pqa-sidebar">
          <div className="pqa-sidebar-title">题目列表</div>
          <div className="pqa-categories">
            {PROJECT_QA_SECTIONS.map((proj) => (
              <div key={proj.project} className="pqa-project-group">
                <div className="pqa-project-label">{proj.project}</div>
                {proj.categories.map((cat) => {
                  const isExpanded = expandedSections[cat.title] === true;
                  const catDone = cat.questions.filter((q) => redDots[q.id]).length;
                  return (
                    <div key={cat.title} className="pqa-category-section">
                      <button
                        className="pqa-category-header"
                        onClick={() => handleToggleSection(cat.title)}
                      >
                        <span className="pqa-category-title">
                          <span>{SECTION_ICONS[cat.title] || '📋'}</span>
                          <span>{cat.title}</span>
                        </span>
                        <span className="pqa-category-right">
                          <span>{catDone}/{cat.questions.length}</span>
                          <span className={`pqa-category-arrow ${isExpanded ? 'expanded' : ''}`}>
                            ▼
                          </span>
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="pqa-items">
                          {cat.questions.map((q, idx) => (
                            <button
                              key={q.id}
                              className={`pqa-list-item ${selectedId === q.id ? 'active' : ''}`}
                              onClick={() => handleSelectQuestion(q.id)}
                            >
                              <div className="pqa-list-item-top">
                                <div className="pqa-list-meta">
                                  <span
                                    className={`pqa-red-dot ${redDots[q.id] ? 'active' : ''}`}
                                    onClick={(e) => handleToggleRedDot(e, q.id)}
                                    title={redDots[q.id] ? '标记为未掌握' : '标记为已掌握'}
                                  />
                                  <span className="pqa-list-number">#{idx + 1}</span>
                                </div>
                              </div>
                              <div className="pqa-list-title">{q.title}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="pqa-main">
          {selectedQuestion ? (
            <>
              <div className="pqa-main-header">
                <div className="pqa-main-header-left">
                  <h3>{selectedQuestion.title}</h3>
                  {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                    <div className="pqa-tags">
                      {selectedQuestion.tags.map((tag) => (
                        <span key={tag} className="pqa-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className={`pqa-mastery-badge ${redDots[selectedId] ? 'mastered' : 'pending'}`}
                >
                  {redDots[selectedId] ? '已掌握' : '待复习'}
                </span>
              </div>

              <div className="pqa-info-row">
                <div className="pqa-main-card pqa-resume-card">
                  <div className="pqa-main-label">简历描述</div>
                  <p className="pqa-rich-text">
                    {RESUME_DESCRIPTIONS[selectedQuestion.categoryTitle] || '暂无简历描述'}
                  </p>
                </div>

                {selectedQuestion.obsidianFile && (
                  <div className="pqa-main-card pqa-obsidian-card">
                    <div className="pqa-main-label">详细答案</div>
                    <button
                      className="pqa-obsidian-link"
                      onClick={() => handleOpenObsidian(selectedQuestion.obsidianFile)}
                    >
                      <span className="pqa-obsidian-icon">📖</span>
                      <span>在 Obsidian 中查看</span>
                    </button>
                  </div>
                )}
              </div>

              {QUICK_ANSWERS[selectedId] && (
                <div className="pqa-quick-answer-section">
                  <button
                    className="pqa-quick-answer-toggle"
                    onClick={() => setQuickAnswerOpen((v) => !v)}
                  >
                    <span className="pqa-quick-answer-toggle-left">
                      <span className="pqa-quick-answer-icon">⚡</span>
                      <span className="pqa-main-label" style={{ marginBottom: 0 }}>快速答案</span>
                      <span className="pqa-quick-answer-hint">1 分钟速记版</span>
                    </span>
                    <span className={`pqa-category-arrow ${quickAnswerOpen ? 'expanded' : ''}`}>▼</span>
                  </button>
                  {quickAnswerOpen && (
                    <div className="pqa-quick-answer-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {QUICK_ANSWERS[selectedId]}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              <div className="pqa-answer-section">
                <div className="pqa-main-label">我的回答</div>
                <textarea
                  className="pqa-answer-textarea"
                  placeholder="在这里写下你的回答...（Enter 提交，Shift+Enter 换行）"
                  value={answers[selectedId] || ''}
                  onChange={handleAnswerChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitAnswer();
                    }
                  }}
                />
                <button
                  className="pqa-submit-btn"
                  disabled={!answers[selectedId]?.trim() || analyzing}
                  onClick={handleSubmitAnswer}
                >
                  {analyzing ? '评价中...' : '提交回答'}
                </button>
              </div>

              {analyzing && (
                <div className="pqa-analyzing">
                  <div className="pqa-analyzing-spinner" />
                  <span>Claude 正在评价你的回答...</span>
                </div>
              )}

              {aiResult && !analyzing && (
                <div className={`pqa-ai-result ${aiResult.success ? '' : 'error'}`}>
                  <div className="pqa-ai-result-header">
                    <span className="pqa-ai-result-icon">{aiResult.success ? '🤖' : '⚠️'}</span>
                    <span className="pqa-ai-result-title">AI 评价</span>
                    {aiResult.model && (
                      <span className="pqa-ai-result-model">{aiResult.model}</span>
                    )}
                  </div>
                  <div className="pqa-ai-result-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiResult.analysis}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="pqa-main-nav">
                <button
                  className="pqa-op-btn neutral"
                  disabled={selectedIndex <= 0}
                  onClick={handlePrev}
                >
                  上一题
                </button>
                <span className="pqa-main-progress">
                  {selectedIndex + 1} / {totalCount}
                </span>
                <button
                  className="pqa-op-btn primary"
                  disabled={selectedIndex >= allQuestions.length - 1}
                  onClick={handleNext}
                >
                  下一题
                </button>
              </div>
            </>
          ) : (
            <div className="pqa-empty-detail">
              <h3>选择一道题目开始练习</h3>
              <p>从左侧题目列表中选择一道题，口述你的回答。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectQaPage;
