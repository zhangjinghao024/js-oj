import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { fetchProjectIntroQa, saveProjectIntroQa } from '../api/judgeApi';
import qunarProjectQa from './qunarProjectQa';
import './ProjectIntroPage.css';

class QaAnswerMarkdownBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.content !== this.props.content) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <p className="project-qa-answer-fallback">{this.props.content}</p>;
    }

    return this.props.children;
  }
}

const createQaItem = (actionIndex = 0) => ({
  id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  question: '',
  answer: '',
  actionIndex
});

const initialProjects = [
  {
    id: 'qunar-train-ticket',
    title: '去哪儿旅行 App（火车票业务）',
    techStack: ['React Native', 'Redux'],
    description:
      '面向铁路出行场景的跨平台移动应用，为用户提供完整的火车票购买、抢票及订单管理服务。支持 iOS / Android / 鸿蒙 / H5 多端运行，服务百万级用户。',
    actions: [
      '参与火车票抢票核心业务开发：针对填单页、详情页、列表页等 6 大核心页面代码重复率高的问题，抽离 RobbingCell、Modal、Card、Label 等通用组件至 Common 库，设计 UI 与业务特性分离的多态 Style 方案。',
      '参与火车 App 页面秒开率提升与性能优化：将页面启动链路拆解为跳转/数据/计算/渲染四阶段。优化 QP 包预加载策略（预加载占比提升至 94.4%）；制定三级接口优先级，延迟非核心请求，异步串行改并行；引入计算缓存与算法降阶，长任务分批执行；非可视组件延迟挂载，结合批量更新与 useMemo 优化首帧渲染。',
      '参与火车票业务针对鸿蒙单框架进行 RN 适配，对齐线上版本，实现火车部分原生桥接层：适配多项 H5 与原生通信 SDK（含日历提醒、本地存储、语音助手），并完成折叠屏体验优化。'
    ],
    outcomes: [
      '抢票 UI 组件复用量均 >3，同类 UI 需求开发周期从 2 天缩短至 1 天。',
      '安卓用户秒开率提升 39.2 个百分点（43.6% -> 82.8%）；90% 用户在 1.35 秒内可操作页面，日均为总用户节省等待耗时约 339 小时。',
      '纯血鸿蒙渠道每周为业务贡献 4000+ 票量，折叠屏 L2T 转化率提升 2.3%。'
    ],
    references: [
      {
        id: 'ref-robbing-cell',
        type: 'file',
        title: 'RobbingCell（RobOrderCell.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/3/RobOrderCell.js',
        line: 113
      },
      {
        id: 'ref-modal-js',
        type: 'file',
        title: 'Modal（Modal.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/0/Modal.js',
        line: 29
      },
      {
        id: 'ref-card',
        type: 'file',
        title: 'Card（CombineAndCrossInfoCard.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/2/CombineAndCrossInfoCard.js',
        line: 17
      },
      {
        id: 'ref-label',
        type: 'file',
        title: 'Label（DiscountLabel.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/4/DiscountLabel.js',
        line: 41
      }
    ],
    qa: qunarProjectQa
  },
  {
    id: 'train-ai-node',
    title: 'train-ai-node：火车票AI工作助手',
    techStack: ['Node.js', 'Zod', 'MCP SDK'],
    description:
      '火车票AI工作助手通过标准化的 MCP 工具集和自动化任务调度，为 AI 智能体提供统一的企业内部系统集成能力，实现开发值班流程的智能化和自动化。',
    actions: [
      '搭建体系，统一咨询入口：基于飞书的生态基础搭建机器人，统一火车多个业务咨询入口（前端、国际火车、小汽船），基于 aily 智能体平台创建 10+ 技能工作流。',
      '高阶技能解决复杂咨询：基于 MCP 协议实现自动化查询 app 发布崩溃和错误堆栈、搜索代码库、WebSocket 实时查询用户请求轨迹、提出解决建议等技能。',
      '丰富标准文档知识库：实现业务配置和埋点实时同步到知识库功能。'
    ],
    outcomes: [
      '火车 AI 提效覆盖五一、国庆、春运三大高峰，机器人拦截 31% 工单量，年化节省 300+ pd。',
      '沉淀的多技能架构（Qtrace、代码搜索、Qconfig 等）已复用至多条业务线。'
    ],
    references: [],
    qa: [
      {
        id: 'train-ai-node-qa-1',
        question: '这个项目解决了什么核心问题？',
        answer:
          '通过标准化 MCP 工具和自动化调度，把分散的企业内部系统能力统一给 AI 智能体，降低值班咨询处理的人力成本和响应延迟。',
        actionIndex: 0
      },
      {
        id: 'train-ai-node-qa-2',
        question: '你是如何统一多业务咨询入口的？',
        answer:
          '基于飞书生态搭建机器人并统一入口，覆盖前端、国际火车、小汽船等业务咨询场景，在 aily 智能体平台沉淀 10+ 技能工作流。',
        actionIndex: 0
      },
      {
        id: 'train-ai-node-qa-3',
        question: '为什么选择飞书机器人 + aily 平台的方案，而不是自己搭建一套完整的智能体系统？',
        answer:
          '1. 飞书机器人是公司内部已有的 IM 生态，用户无需切换工具，接入成本最低；\n2. aily 平台提供了智能体托管、意图识别和多轮对话能力，避免重复造轮子；\n3. 自建系统需要额外维护对话管理、模型调度等基础设施，周期长且与业务目标不匹配；\n4. 飞书机器人天然支持卡片消息、审批流等交互形式，适合值班场景的信息展示。',
        actionIndex: 0
      },
      {
        id: 'train-ai-node-qa-4',
        question: '10+ 技能工作流具体包括哪些？是如何划分和组织的？',
        answer:
          '按值班场景划分为几类：\n- **问题诊断类**：崩溃堆栈查询、用户请求轨迹追踪（Qtrace）、错误日志搜索；\n- **代码排查类**：代码库关键字搜索、配置项查询（Qconfig）；\n- **信息查询类**：发版状态查询、埋点配置查询、业务文档检索；\n- **辅助决策类**：问题归因分析、解决方案建议。\n每个技能对应一个 MCP Tool，通过 Zod 定义输入 schema，智能体根据用户问题自动匹配调用。',
        actionIndex: 0
      },
      {
        id: 'train-ai-node-qa-5',
        question: 'MCP 协议在项目中的价值是什么？为什么不直接用 REST API？',
        answer:
          '1. MCP 提供标准化的 Tool schema（name/description/inputSchema），AI 智能体可以自动理解工具能力，无需为每个 API 写适配层；\n2. REST API 缺乏语义描述层，智能体无法自主决定调用哪个接口、传什么参数；\n3. MCP 的 Tool/Resource/Prompt 三层抽象天然适配 AI Agent 场景；\n4. 新增技能只需定义 Zod schema 并注册到 MCP Server，接入成本从天级降到小时级；\n5. 标准协议使得技能可以跨业务线复用，不同团队无需重复对接。',
        actionIndex: 1
      },
      {
        id: 'train-ai-node-qa-6',
        question: '基于 MCP 实现崩溃堆栈查询这个技能，具体的技术流程是什么？',
        answer:
          '1. 用户描述问题（如"某用户下单崩溃了"），智能体从对话中提取关键参数（App 版本、时间范围等）；\n2. 智能体调用崩溃查询 Tool，参数经 Zod schema 校验后发送到 MCP Server；\n3. Server 内部调用公司崩溃监控平台的 API，拉取匹配的崩溃记录和堆栈信息；\n4. 对堆栈进行结构化处理（提取关键帧、过滤系统栈、关联源码文件），返回给智能体；\n5. 智能体结合堆栈信息和知识库文档，生成问题分析和修复建议返回给用户。',
        actionIndex: 1
      },
      {
        id: 'train-ai-node-qa-7',
        question: 'WebSocket 实时查询用户请求轨迹是怎么实现的？为什么用 WebSocket？',
        answer:
          '1. Qtrace 系统提供 WebSocket 接口，可以实时推送用户请求链路数据；\n2. MCP Tool 内部建立 WebSocket 连接，订阅指定用户/请求 ID 的轨迹；\n3. 收到数据后解析请求链路（服务调用关系、各环节耗时、错误节点），结构化返回；\n4. 用 WebSocket 而非轮询的原因：链路追踪数据是流式产生的，推送模式实时性更高、延迟更低；\n5. 连接管理上需要处理超时断开、异常重连，以及 MCP Tool 同步调用与 WebSocket 异步推送之间的适配（通过 Promise 包装，设定超时上限）。',
        actionIndex: 1
      },
      {
        id: 'train-ai-node-qa-8',
        question: 'Zod 在项目中具体起了什么作用？为什么不直接用 TypeScript 类型？',
        answer:
          '1. TypeScript 类型只在编译时检查，运行时被擦除；Zod 提供运行时参数校验，拦截 AI 传入的非法参数；\n2. MCP SDK 原生集成 Zod，Tool 的 inputSchema 用 Zod 定义后自动转为 JSON Schema 暴露给客户端；\n3. 用 z.infer 从 schema 推导 TS 类型，避免类型定义和校验规则的重复维护；\n4. Zod 的结构化错误信息方便智能体理解参数错误并自动修正重试；\n5. 支持 enum、regex 等丰富校验规则，比手写 if-else 更声明式、更易维护。',
        actionIndex: 1
      },
      {
        id: 'train-ai-node-qa-9',
        question: '知识库实时同步是怎么实现的？如何保证数据一致性？',
        answer:
          '1. 监听配置中心（Qconfig）的变更事件，触发增量同步，而非全量覆盖；\n2. 埋点配置变更通过定时任务轮询检测差异，发现变更后拉取最新数据；\n3. 同步流程：变更检测 → 数据拉取 → 格式转换（转为知识库要求的文档结构）→ 写入知识库；\n4. 一致性保障：记录同步版本号，写入失败时自动重试，并通过飞书消息告警通知；\n5. 好处是值班同学咨询时，机器人总能基于最新的配置和埋点信息回答，避免信息滞后。',
        actionIndex: 2
      },
      {
        id: 'train-ai-node-qa-10',
        question: '"拦截 31% 工单量"是怎么定义和统计的？',
        answer:
          '1. "成功拦截"定义：用户通过机器人获得回答后，未在一定时间窗口内再提交人工工单；\n2. 数据来源：飞书机器人会话记录 + 工单系统提交记录，通过用户 ID 关联；\n3. 对比方式：接入机器人前后同期的工单量变化，并排除业务量自然增长的干扰；\n4. 在五一、国庆、春运三个高峰期分别统计，验证效果在不同流量压力下的稳定性；\n5. 年化 300+ pd 的计算：年化拦截咨询量 × 人工平均处理时长，换算为人日。',
        actionIndex: 2
      },
      {
        id: 'train-ai-node-qa-11',
        question: '多技能架构是如何做到跨业务线复用的？',
        answer:
          '1. 每个技能封装为独立 MCP Tool，与具体业务逻辑解耦，只依赖通用的内部系统接口；\n2. 通过 Zod schema 定义标准化输入输出，其他业务线配置对应参数即可接入；\n3. MCP Server 支持多实例部署，不同业务线独立运行互不影响；\n4. 复用时的挑战：不同业务线的内部系统接口不完全一致，需要做适配层；知识库内容业务强相关，各业务线需自行维护；\n5. 目前 Qtrace、代码搜索、Qconfig 等通用技能已被多条业务线直接复用。',
        actionIndex: 2
      },
      {
        id: 'train-ai-node-qa-12',
        question: '如果重新设计这个系统，你会做哪些改进？',
        answer:
          '1. 引入更完善的技能编排引擎，支持多步推理的确定性工作流，而非完全依赖 AI 自主编排；\n2. 增加用户反馈闭环机制，自动收集回答满意度用于优化技能和 prompt；\n3. 引入 RAG 检索增强生成，提升知识库查询的准确性和召回率；\n4. 建立技能级别的监控看板，追踪每个技能的调用成功率、耗时和用户满意度；\n5. 考虑支持多模态输入（截图、日志文件上传），覆盖更多排查场景。',
        actionIndex: 2
      }
    ]
  },
  {
    id: 'train-ticket-admin-system',
    title: '火车票业务管理后台系统',
    techStack: ['Next.js', 'Ant Design', 'Koa'],
    description:
      '火车票业务的 B 端后台管理系统，服务于内部运营、技术、产品等同学，包括订单查询、营销活动、代理商管理、用户请求轨迹查询等功能。',
    actions: [
      '参与开发项目的 BFF 层架构，实现前后端解耦和微服务路由聚合，解决 SSR 鉴权、多环境切换、接口统一管理等问题。',
      '参与搭建后台系统的组件化架构，实现 Layout、PageHeader、Content 等核心组件，落地统一布局和动态菜单，支撑 50+ 页面的快速开发。'
    ],
    outcomes: [
      '通过 BFF 层统一鉴权、路由与接口编排，提升后台系统在多环境与多服务场景下的稳定性和可维护性。',
      '通过组件化与统一布局方案沉淀后台基建，显著降低新页面接入成本，并支撑 50+ 页面规模化迭代。'
    ],
    references: [],
    qa: [
      {
        id: 'train-admin-qa-1',
        question: '这个后台系统主要服务哪些角色和场景？',
        answer:
          '系统面向运营、技术、产品等内部角色，覆盖订单查询、营销活动配置、代理商管理、用户请求轨迹查询等核心业务场景。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-2',
        question: '为什么要引入 BFF 层？不用 BFF 直接前端调后端微服务有什么问题？',
        answer:
          '1. 后台系统对接多个后端微服务（订单、营销、代理商、轨迹查询等），前端直接调用会导致接口散落在各页面，维护成本高；\n2. 不同微服务的鉴权方式、数据格式不统一，前端需要各自适配，重复逻辑多；\n3. SSR 场景下服务端渲染需要在 Node 层完成数据预取和鉴权，没有 BFF 层就要把这些逻辑塞进 Next.js 的 getServerSideProps 里，耦合严重；\n4. 多环境切换（开发/测试/预发/线上）时，各微服务的域名和路径不同，BFF 层统一做路由映射，前端只需关注相对路径；\n5. BFF 还承担了接口编排能力，一个页面需要的数据可能来自多个微服务，BFF 聚合后返回，减少前端请求数。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-3',
        question: 'BFF 层的 SSR 鉴权是怎么实现的？为什么 SSR 场景下鉴权比 CSR 更复杂？',
        answer:
          '1. CSR 下鉴权通常靠浏览器自动携带 Cookie，前端请求直接带上凭证即可；\n2. SSR 下页面在 Node 服务端渲染，getServerSideProps 中发起的请求不在浏览器环境，没有自动的 Cookie 携带机制；\n3. 解决方案：在 BFF 层拦截用户请求，从 req.headers.cookie 中提取鉴权信息，透传给后端微服务；\n4. 同时在 BFF 层做统一的登录态校验，未登录时返回 302 重定向到登录页，避免每个页面单独处理；\n5. 还需要处理 Token 刷新逻辑，BFF 层检测到 Token 过期时自动用 Refresh Token 换取新 Token，对前端页面透明。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-4',
        question: '多环境切换具体是怎么实现的？开发/测试/预发/线上的路由是怎么管理的？',
        answer:
          '1. 在 BFF 层维护一份环境配置表，key 是微服务名，value 是各环境对应的域名和基础路径；\n2. 通过环境变量（如 NODE_ENV 或自定义的 APP_ENV）决定当前使用哪套配置；\n3. BFF 的路由代理层根据请求路径前缀匹配到对应的微服务，再拼接目标环境的实际地址进行转发；\n4. 前端代码完全不感知后端服务地址，所有请求统一走 /api/* 前缀，由 BFF 层解析和转发；\n5. 这样切换环境只需改 BFF 的环境变量，不需要前端重新构建或修改代码。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-5',
        question: 'BFF 层用 Koa 实现，为什么选 Koa 而不是 Express？和 Next.js 自带的 API Routes 有什么区别？',
        answer:
          '1. Koa 的洋葱模型中间件机制更清晰，适合做请求拦截、鉴权、日志、错误处理等分层逻辑；\n2. Koa 原生支持 async/await，中间件写起来比 Express 的回调风格更直观；\n3. Next.js 的 API Routes 适合轻量接口，但不适合做复杂的路由代理、微服务聚合和统一鉴权，缺乏中间件编排能力；\n4. Koa 作为独立的 BFF 服务，可以和 Next.js 的 SSR 服务解耦部署，也可以合并部署，灵活性更高；\n5. 实际架构中 Koa 和 Next.js 跑在同一个 Node 进程里，Koa 处理 /api/* 请求，其余交给 Next.js 处理页面渲染。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-6',
        question: 'BFF 层的接口统一管理是怎么做的？怎么避免 BFF 变成一个臃肿的"透传层"？',
        answer:
          '1. 按微服务域划分路由模块（如 /api/order/*、/api/marketing/*、/api/agent/*），每个模块独立维护；\n2. 公共逻辑（鉴权、日志、错误格式化）通过 Koa 中间件统一处理，路由模块只关注业务编排；\n3. 对于简单的 CRUD 接口，BFF 确实是透传，但这是合理的——统一了鉴权和错误处理；\n4. 对于复杂场景（如订单详情页需要聚合订单信息+用户信息+轨迹数据），BFF 做接口编排，并行请求多个微服务后合并返回；\n5. 原则是：BFF 只做"前端视角的接口适配"，不做业务逻辑，业务逻辑留在后端微服务。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-7',
        question: 'Next.js 的 SSR 在这个后台系统中解决了什么问题？后台系统为什么需要 SSR？',
        answer:
          '1. 后台系统用 SSR 主要不是为了 SEO，而是为了首屏数据预取——页面打开直接带数据，不需要先加载空壳再请求接口；\n2. SSR 统一了鉴权时机，在服务端就能判断登录态，未登录直接重定向，不会出现页面闪烁后跳转的体验问题；\n3. 部分页面（如订单查询）的筛选条件在 URL 上，SSR 可以在服务端根据 URL 参数直接查询数据，分享链接时对方打开即有结果；\n4. Next.js 的文件系统路由简化了 50+ 页面的路由管理，不需要手动维护路由表；\n5. 不过也有取舍：纯操作类页面（如表单配置）没必要 SSR，这些页面用 CSR 即可，通过 dynamic import 按需切换。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-8',
        question: 'Layout、PageHeader、Content 这些核心组件是怎么设计的？它们之间的关系是什么？',
        answer:
          '1. Layout 是最外层骨架组件，负责侧边栏导航 + 顶栏 + 内容区的整体布局，所有页面共享同一个 Layout 实例；\n2. PageHeader 嵌套在 Layout 的内容区顶部，提供面包屑、页面标题、操作按钮区等标准化页头能力；\n3. Content 是内容区容器，统一处理内边距、滚动、加载状态等，业务页面的实际内容渲染在 Content 内部；\n4. 三者通过 Next.js 的嵌套 Layout 机制组合：_app → Layout → 页面组件内部使用 PageHeader + Content；\n5. 这样新页面只需关注业务内容本身，页头和布局自动继承，开发一个新页面只需要写业务表格/表单即可。',
        actionIndex: 1
      },
      {
        id: 'train-admin-qa-9',
        question: '动态菜单是怎么实现的？菜单数据从哪来？权限怎么控制？',
        answer:
          '1. 菜单数据由后端接口返回，包含菜单树结构（层级、路径、图标、名称）和当前用户的权限标识；\n2. Layout 组件初始化时请求菜单接口，拿到数据后递归渲染 Ant Design 的 Menu 组件；\n3. 权限控制：后端只返回当前用户有权限的菜单项，前端不做菜单过滤，保证权限判断在服务端；\n4. 路由守卫：即使用户手动输入 URL 访问无权限页面，BFF 层也会校验权限并返回 403；\n5. 菜单高亮和展开状态通过 Next.js 的 router.pathname 自动匹配，页面切换时菜单状态自动同步。',
        actionIndex: 1
      },
      {
        id: 'train-admin-qa-10',
        question: '50+ 页面的快速开发是怎么做到的？有没有沉淀出页面模板或脚手架？',
        answer:
          '1. 大多数后台页面本质上是"筛选条件 + 数据表格 + 操作按钮"的 CRUD 模式，针对这种模式封装了通用的列表页模板；\n2. 模板内置了筛选表单、分页表格、批量操作、导出等能力，业务页面只需配置 columns 和 API 地址；\n3. 表单类页面也有对应模板，基于 Ant Design Form 封装，统一了校验规则、提交逻辑和加载状态；\n4. 通过约定式目录结构，新建页面只需在 pages 目录下新增文件，路由自动生效，菜单配置由后端统一管理；\n5. 这样一个标准 CRUD 页面的开发时间从 2-3 天压缩到半天以内。',
        actionIndex: 1
      },
      {
        id: 'train-admin-qa-11',
        question: 'Ant Design 的 Table 组件在大数据量场景下有没有遇到性能问题？怎么处理的？',
        answer:
          '1. 订单查询页可能返回几百上千条数据，直接渲染会导致 DOM 节点过多，滚动卡顿；\n2. 首先通过分页控制单页数据量，默认每页 20-50 条，减少一次性渲染的节点数；\n3. 对于需要展示大量数据的场景（如导出预览），使用虚拟滚动（virtual scroll），只渲染可视区域内的行；\n4. 列较多时通过 fixed columns 固定关键列，减少横向滚动时的重绘范围；\n5. 复杂单元格（如带 Tooltip、Tag 组合的列）用 React.memo 包裹自定义 render 函数，避免无关列更新导致整行重渲染。',
        actionIndex: 1
      },
      {
        id: 'train-admin-qa-12',
        question: '如果重新设计这个后台系统，你会做哪些改进？',
        answer:
          '1. 引入微前端架构（如 qiankun），让不同业务模块可以独立开发和部署，避免 50+ 页面都在一个仓库里导致构建变慢；\n2. BFF 层考虑引入 GraphQL 替代部分 REST 接口，让前端按需查询字段，减少过度获取；\n3. 组件层面引入 Schema 驱动的低代码方案，标准 CRUD 页面通过 JSON 配置生成，进一步降低开发成本；\n4. 增加操作审计日志能力，记录用户在后台的每次关键操作，便于追溯和合规；\n5. 前端监控方面增加页面性能采集和错误上报，目前对后台系统的线上质量感知不够。',
        actionIndex: 1
      },
      {
        id: 'train-admin-qa-13',
        question: 'Next.js 的 getServerSideProps 和 getStaticProps 有什么区别？在这个项目中你是怎么选择的？',
        answer:
          '1. getServerSideProps 每次请求都在服务端执行，适合需要实时数据的页面（如订单查询、轨迹查询）；\n2. getStaticProps 在构建时执行，生成静态页面，适合数据不常变化的页面；\n3. 后台系统的大多数页面都需要实时数据和鉴权，所以主要用 getServerSideProps；\n4. 少数配置说明类页面（如帮助文档）可以用 getStaticProps + ISR（增量静态再生成），减少服务端压力；\n5. 需要注意 getServerSideProps 会增加 TTFB（首字节时间），如果数据预取耗时长会影响首屏体验，所以对非核心数据采用客户端 fetch 补充。',
        actionIndex: 0
      },
      {
        id: 'train-admin-qa-14',
        question: '如果让你设计一个通用的 B 端后台前端架构，你会怎么规划技术选型和分层？',
        answer:
          '1. 视图层：React + Ant Design（或类似组件库），提供标准化 UI 能力；\n2. 路由与渲染：Next.js 做文件路由和按需 SSR/CSR，简化路由管理；\n3. BFF 层：Koa/Express 做接口聚合、鉴权、环境路由，隔离前后端耦合；\n4. 状态管理：轻量方案优先（React Context + SWR/React Query），后台系统一般不需要重型状态管理；\n5. 基建层：统一 Layout/权限/菜单/请求拦截/错误处理，让业务页面只关注自身逻辑；\n6. 工程化：Monorepo（如果有多个子系统）、CI/CD、代码规范、单元测试覆盖核心逻辑。',
        actionIndex: 1
      }
    ]
  }
];

const getSafeActionIndex = (actionIndex, fallbackIndex, actionCount) => {
  if (actionCount <= 0) return -1;
  if (Number.isInteger(actionIndex) && actionIndex >= 0 && actionIndex < actionCount) {
    return actionIndex;
  }
  return fallbackIndex % actionCount;
};

const normalizeQaList = (qaList = [], actionCount = 0) => qaList
  .filter((item) => item && typeof item === 'object')
  .map((item, index) => ({
    id: typeof item.id === 'string' ? item.id : `qa-restored-${Date.now()}-${index}`,
    question: typeof item.question === 'string' ? item.question : '',
    answer: typeof item.answer === 'string' ? item.answer : '',
    actionIndex: getSafeActionIndex(item.actionIndex, index, actionCount)
  }));

const mergeQaMapToProjects = (projects, qaMap) => projects.map((project) => {
  const remoteQa = qaMap?.[project.id];
  if (!Array.isArray(remoteQa)) return project;
  return {
    ...project,
    qa: normalizeQaList(remoteQa, Array.isArray(project.actions) ? project.actions.length : 0)
  };
});

const buildQaGroups = (project) => {
  const actions = Array.isArray(project.actions) ? project.actions : [];
  if (actions.length === 0) {
    return [
      {
        actionIndex: -1,
        actionLabel: '未配置行动',
        items: project.qa.map((item, qaIndex) => ({ item, qaIndex }))
      }
    ];
  }

  const groups = actions.map((actionLabel, actionIndex) => ({
    actionIndex,
    actionLabel,
    items: []
  }));

  project.qa.forEach((item, qaIndex) => {
    const actionIndex = getSafeActionIndex(item.actionIndex, qaIndex, actions.length);
    groups[actionIndex].items.push({
      item: {
        ...item,
        actionIndex
      },
      qaIndex
    });
  });

  return groups;
};

const getQaGroupKey = (projectId, actionIndex) => `${projectId}:${actionIndex}`;
const getQaDropTargetKey = (projectId, actionIndex, qaId = '__end__') => (
  `${projectId}:${actionIndex}:${qaId}`
);

const reorderProjectQa = (project, dragMeta, dropMeta) => {
  if (!project || !dragMeta || !dropMeta) return project;
  const { qaId: draggedQaId } = dragMeta;
  const { targetActionIndex, targetQaId, position = 'before' } = dropMeta;
  if (typeof draggedQaId !== 'string' || draggedQaId.length === 0) return project;
  if (typeof targetQaId === 'string' && targetQaId === draggedQaId && position === 'before') {
    return project;
  }

  const actions = Array.isArray(project.actions) ? project.actions : [];
  const actionCount = actions.length;
  const groupOrder = actionCount > 0
    ? actions.map((_, actionIndex) => actionIndex)
    : [-1];

  if (!groupOrder.includes(targetActionIndex)) return project;

  const groups = groupOrder.reduce((result, actionIndex) => ({
    ...result,
    [actionIndex]: []
  }), {});
  const itemMap = new Map();

  project.qa.forEach((item, qaIndex) => {
    const actionIndex = actionCount > 0
      ? getSafeActionIndex(item.actionIndex, qaIndex, actionCount)
      : -1;
    groups[actionIndex].push(item.id);
    if (actionIndex === item.actionIndex) {
      itemMap.set(item.id, item);
      return;
    }
    itemMap.set(item.id, {
      ...item,
      actionIndex
    });
  });

  if (!itemMap.has(draggedQaId)) return project;

  groupOrder.forEach((actionIndex) => {
    groups[actionIndex] = groups[actionIndex].filter((itemId) => itemId !== draggedQaId);
  });

  const targetGroup = groups[targetActionIndex];
  if (!Array.isArray(targetGroup)) return project;

  let insertIndex = targetGroup.length;
  if (typeof targetQaId === 'string') {
    const targetIndex = targetGroup.findIndex((itemId) => itemId === targetQaId);
    if (targetIndex >= 0) {
      insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    }
  }
  targetGroup.splice(insertIndex, 0, draggedQaId);

  const draggedItem = itemMap.get(draggedQaId);
  itemMap.set(draggedQaId, {
    ...draggedItem,
    actionIndex: targetActionIndex
  });

  const reorderedQa = [];
  groupOrder.forEach((actionIndex) => {
    groups[actionIndex].forEach((itemId) => {
      const item = itemMap.get(itemId);
      if (item) reorderedQa.push(item);
    });
  });

  const hasSameQaOrder = reorderedQa.length === project.qa.length
    && reorderedQa.every((item, index) => (
      item.id === project.qa[index].id
      && item.actionIndex === project.qa[index].actionIndex
    ));
  if (hasSameQaOrder) return project;

  return {
    ...project,
    qa: reorderedQa
  };
};

const ProjectIntroPage = () => {
  const [projectList, setProjectList] = useState(initialProjects);
  const [expandedProjectIds, setExpandedProjectIds] = useState([initialProjects[0].id]);
  const [editingProjectIds, setEditingProjectIds] = useState([]);
  const [savingProjectIds, setSavingProjectIds] = useState([]);
  const [draggingQaId, setDraggingQaId] = useState(null);
  const [dragOverTargetKey, setDragOverTargetKey] = useState(null);
  const [dragOverActionIndex, setDragOverActionIndex] = useState(null);
  const [qaAutoSaveErrorMap, setQaAutoSaveErrorMap] = useState({});
  const [activeQaEditorMap, setActiveQaEditorMap] = useState({});
  const [expandedQaGroupMap, setExpandedQaGroupMap] = useState({});
  const [pendingQuestionFocus, setPendingQuestionFocus] = useState(null);
  const [openAnswerIds, setOpenAnswerIds] = useState(new Set());
  const qaQuestionInputRefs = useRef({});
  const qaDragMetaRef = useRef(null);
  const qaAutoSaveQueueRef = useRef({});

  useEffect(() => {
    let isCancelled = false;
    const loadProjectQa = async () => {
      try {
        const response = await fetchProjectIntroQa();
        if (isCancelled) return;
        if (response?.success && response.qaMap) {
          setProjectList((prev) => mergeQaMapToProjects(prev, response.qaMap));
        }
      } catch (error) {
        console.warn('加载项目问答失败:', error);
      }
    };

    loadProjectQa();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pendingQuestionFocus) return;
    const key = `${pendingQuestionFocus.projectId}:${pendingQuestionFocus.qaId}`;
    const input = qaQuestionInputRefs.current[key];
    if (!input) return;
    input.focus();
    input.select();
    setPendingQuestionFocus(null);
  }, [pendingQuestionFocus, editingProjectIds, activeQaEditorMap, projectList]);

  const persistProjectQa = async (projectListSnapshot = projectList) => {
    const qaMap = projectListSnapshot.reduce((result, project) => {
      result[project.id] = project.qa;
      return result;
    }, {});
    const response = await saveProjectIntroQa(qaMap);
    return Boolean(response?.success);
  };

  const toggleProjectCard = (projectId) => {
    setExpandedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      }
      return [...prev, projectId];
    });
  };

  const isQaGroupExpanded = (projectId, actionIndex) => {
    const key = getQaGroupKey(projectId, actionIndex);
    if (Object.prototype.hasOwnProperty.call(expandedQaGroupMap, key)) {
      return expandedQaGroupMap[key];
    }
    return actionIndex <= 0;
  };

  const toggleQaGroup = (projectId, actionIndex) => {
    const key = getQaGroupKey(projectId, actionIndex);
    setExpandedQaGroupMap((prev) => {
      const current = Object.prototype.hasOwnProperty.call(prev, key)
        ? prev[key]
        : actionIndex <= 0;
      return {
        ...prev,
        [key]: !current
      };
    });
  };

  const saveProjectQaForId = async (projectId, options = {}) => {
    const {
      silent = false,
      projectListSnapshot = projectList
    } = options;
    try {
      setSavingProjectIds((prev) => (
        prev.includes(projectId) ? prev : [...prev, projectId]
      ));
      const saved = await persistProjectQa(projectListSnapshot);
      if (!saved) {
        if (!silent) {
          alert('保存失败，请检查后端服务是否已启动。');
        }
        return false;
      }
      setQaAutoSaveErrorMap((prev) => {
        if (!prev[projectId]) return prev;
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      return true;
    } catch (error) {
      console.error('保存项目问答失败:', error);
      if (!silent) {
        alert('保存失败，请检查后端服务日志。');
      }
      return false;
    } finally {
      setSavingProjectIds((prev) => prev.filter((id) => id !== projectId));
    }
  };

  const clearQaDragState = () => {
    qaDragMetaRef.current = null;
    setDraggingQaId(null);
    setDragOverTargetKey(null);
    setDragOverActionIndex(null);
  };

  const queueQaAutoSave = async (projectId, projectListSnapshot) => {
    const queue = qaAutoSaveQueueRef.current[projectId] || {
      inFlight: false,
      pending: false,
      latestProjectList: null
    };
    queue.latestProjectList = projectListSnapshot;
    qaAutoSaveQueueRef.current[projectId] = queue;

    if (queue.inFlight) {
      queue.pending = true;
      return;
    }

    queue.inFlight = true;
    do {
      queue.pending = false;
      const saved = await saveProjectQaForId(projectId, {
        silent: true,
        projectListSnapshot: queue.latestProjectList || projectListSnapshot
      });
      if (!saved) {
        setQaAutoSaveErrorMap((prev) => ({
          ...prev,
          [projectId]: '自动保存失败，请重试'
        }));
      }
    } while (queue.pending);
    queue.inFlight = false;
  };

  const markQaDropTarget = (projectId, actionIndex, qaId = '__end__') => {
    const nextTargetKey = getQaDropTargetKey(projectId, actionIndex, qaId);
    setDragOverTargetKey((prev) => (prev === nextTargetKey ? prev : nextTargetKey));
    setDragOverActionIndex((prev) => (prev === actionIndex ? prev : actionIndex));
  };

  const handleQaDragStart = (event, project, item, qaIndex) => {
    const actionIndex = getSafeActionIndex(item.actionIndex, qaIndex, project.actions.length);
    qaDragMetaRef.current = {
      projectId: project.id,
      qaId: item.id,
      sourceActionIndex: actionIndex
    };
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id);
    setDraggingQaId(item.id);
    setDragOverTargetKey(null);
    setDragOverActionIndex(actionIndex);
  };

  const handleQaDragEnd = () => {
    clearQaDragState();
  };

  const handleQaItemDragEnter = (event, projectId, actionIndex, qaId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    markQaDropTarget(projectId, actionIndex, qaId);
  };

  const handleQaItemDragOver = (event, projectId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  };

  const applyQaDrop = (projectId, dropMeta) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) {
      clearQaDragState();
      return;
    }

    let nextProjectList = null;
    let hasChanged = false;
    setProjectList((prev) => {
      nextProjectList = prev.map((project) => {
        if (project.id !== projectId) return project;
        const reorderedProject = reorderProjectQa(project, dragMeta, dropMeta);
        if (reorderedProject !== project) {
          hasChanged = true;
        }
        return reorderedProject;
      });
      return hasChanged && nextProjectList ? nextProjectList : prev;
    });

    setExpandedQaGroupMap((prev) => ({
      ...prev,
      [getQaGroupKey(projectId, dropMeta.targetActionIndex)]: true
    }));
    clearQaDragState();

    if (hasChanged && nextProjectList) {
      queueQaAutoSave(projectId, nextProjectList);
    }
  };

  const handleQaItemDrop = (event, projectId, actionIndex, qaId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    applyQaDrop(projectId, {
      targetActionIndex: actionIndex,
      targetQaId: qaId,
      position: 'before'
    });
  };

  const handleQaGroupTailDragEnter = (event, projectId, actionIndex) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    markQaDropTarget(projectId, actionIndex);
  };

  const handleQaGroupTailDragOver = (event, projectId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleQaGroupTailDrop = (event, projectId, actionIndex) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    applyQaDrop(projectId, {
      targetActionIndex: actionIndex,
      targetQaId: null,
      position: 'end'
    });
  };

  const toggleQaManage = async (projectId) => {
    const isManaging = editingProjectIds.includes(projectId);
    if (isManaging) {
      const saved = await saveProjectQaForId(projectId);
      if (!saved) {
        return;
      }
    }

    setEditingProjectIds((prev) => (
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    ));

    if (isManaging) {
      setActiveQaEditorMap((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      clearQaDragState();
    }
  };

  const updateQaField = (projectId, qaId, field, value) => {
    setProjectList((prev) => prev.map((project) => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        qa: project.qa.map((item) => (
          item.id === qaId ? { ...item, [field]: value } : item
        ))
      };
    }));
  };

  const addQaItem = (projectId) => {
    let newItemId = '';
    setProjectList((prev) => prev.map((project) => {
      if (project.id !== projectId) return project;
      const newItem = createQaItem(project.actions.length > 0 ? 0 : -1);
      newItemId = newItem.id;
      return {
        ...project,
        qa: [...project.qa, newItem]
      };
    }));
    return newItemId;
  };

  const removeQaItem = (projectId, qaId) => {
    setProjectList((prev) => prev.map((project) => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        qa: project.qa.filter((item) => item.id !== qaId)
      };
    }));
    setActiveQaEditorMap((prev) => {
      if (prev[projectId] !== qaId) return prev;
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  };

  const addQaFromDisplay = (projectId) => {
    setEditingProjectIds((prev) => (
      prev.includes(projectId) ? prev : [...prev, projectId]
    ));
    const newQaId = addQaItem(projectId);
    const targetProject = projectList.find((project) => project.id === projectId);
    const defaultActionIndex = targetProject && targetProject.actions.length > 0 ? 0 : -1;
    setExpandedQaGroupMap((prev) => ({
      ...prev,
      [getQaGroupKey(projectId, defaultActionIndex)]: true
    }));
    setActiveQaEditorMap((prev) => ({
      ...prev,
      [projectId]: newQaId
    }));
  };

  const addQaWhileManaging = (projectId) => {
    const newQaId = addQaItem(projectId);
    const targetProject = projectList.find((project) => project.id === projectId);
    const defaultActionIndex = targetProject && targetProject.actions.length > 0 ? 0 : -1;
    setExpandedQaGroupMap((prev) => ({
      ...prev,
      [getQaGroupKey(projectId, defaultActionIndex)]: true
    }));
    setActiveQaEditorMap((prev) => ({
      ...prev,
      [projectId]: newQaId
    }));
  };

  const openQaInlineEditor = (projectId, qaId, focusQuestion = false) => {
    const targetProject = projectList.find((project) => project.id === projectId);
    if (targetProject) {
      const qaIndex = targetProject.qa.findIndex((qaItem) => qaItem.id === qaId);
      if (qaIndex >= 0) {
        const actionIndex = getSafeActionIndex(
          targetProject.qa[qaIndex]?.actionIndex,
          qaIndex,
          targetProject.actions.length
        );
        setExpandedQaGroupMap((prev) => ({
          ...prev,
          [getQaGroupKey(projectId, actionIndex)]: true
        }));
      }
    }

    setEditingProjectIds((prev) => (
      prev.includes(projectId) ? prev : [...prev, projectId]
    ));
    setActiveQaEditorMap((prev) => ({
      ...prev,
      [projectId]: qaId
    }));
    if (focusQuestion) {
      setPendingQuestionFocus({ projectId, qaId });
    }
  };

  const saveQaItem = async (projectId) => {
    await toggleQaManage(projectId);
  };

  const openReference = (reference) => {
    if (reference.type === 'file' && reference.path) {
      const params = new URLSearchParams({ file: reference.path });
      if (reference.line) params.set('line', String(reference.line));
      window.location.href = `webstorm://open?${params.toString()}`;
      return;
    }

    if (reference.type === 'web' && reference.url) {
      window.open(reference.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="project-intro-page">
      <header className="project-intro-header">
        <div>
          <h2>📌 项目介绍</h2>
          <p>项目按卡片展示，点击卡片可展开或收起详情。</p>
        </div>
      </header>

      <section className="project-card-list">
        {projectList.map((project) => {
          const isExpanded = expandedProjectIds.includes(project.id);
          const isManagingQa = editingProjectIds.includes(project.id);
          const isSavingQa = savingProjectIds.includes(project.id);
          const qaGroups = buildQaGroups(project);
          return (
            <article key={project.id} className={`project-card ${isExpanded ? 'is-expanded' : ''}`}>
              <button
                type="button"
                className="project-card-trigger"
                onClick={() => toggleProjectCard(project.id)}
                aria-expanded={isExpanded}
              >
                <div className="project-card-header-main">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tech-stack">
                    {project.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>
                <span className="project-card-toggle-text">
                  {isExpanded ? '收起详情' : '展开详情'}
                </span>
              </button>

              {isExpanded && (
                <div className="project-card-detail">
                  <section className="project-detail-block">
                    <h4>行动</h4>
                    <ol>
                      {project.actions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="project-detail-block">
                    <h4>成果</h4>
                    <ol>
                      {project.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="project-detail-block project-qa-block">
                    <div className="project-qa-header">
                      <div>
                        <h4>项目问答</h4>
                        <p className="project-qa-tip">
                          {isManagingQa
                            ? '问答已按行动分组，可折叠展开；拖拽手柄可调整顺序，点击卡片可编辑单条问答。'
                            : '问答已按行动分组，可折叠展开；将光标移到问题卡片上可显示答案。'}
                        </p>
                        {qaAutoSaveErrorMap[project.id] && (
                          <p className="project-qa-save-error">{qaAutoSaveErrorMap[project.id]}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="project-qa-manage-btn"
                        onClick={() => toggleQaManage(project.id)}
                        disabled={isSavingQa}
                      >
                        {isSavingQa ? '保存中...' : isManagingQa ? '完成编辑' : '管理问答'}
                      </button>
                    </div>

                    {project.qa.length === 0 ? (
                      <p className="project-qa-empty">暂无问答。</p>
                    ) : (
                      <div className="project-qa-group-list">
                        {qaGroups.map((group) => {
                          const groupKey = getQaGroupKey(project.id, group.actionIndex);
                          const expanded = isQaGroupExpanded(project.id, group.actionIndex);
                          const groupTailDropKey = getQaDropTargetKey(project.id, group.actionIndex);
                          return (
                            <section key={groupKey} className="project-qa-group">
                              <button
                                type="button"
                                className="project-qa-group-toggle"
                                onClick={() => toggleQaGroup(project.id, group.actionIndex)}
                                aria-expanded={expanded}
                              >
                                <span className="project-qa-group-index">
                                  {group.actionIndex >= 0 ? `行动 ${group.actionIndex + 1}` : '未分组'}
                                </span>
                                <span className="project-qa-group-title">{group.actionLabel}</span>
                                <span className="project-qa-group-count">{group.items.length} 条</span>
                                <span className="project-qa-group-arrow">{expanded ? '收起' : '展开'}</span>
                              </button>

                              {expanded && (
                                <div className="project-qa-group-body">
                                  {group.items.length === 0 ? (
                                    isManagingQa ? (
                                      <div
                                        className={`project-qa-group-dropzone ${dragOverTargetKey === groupTailDropKey ? 'is-drag-over' : ''}`}
                                        onDragEnter={(event) => handleQaGroupTailDragEnter(
                                          event,
                                          project.id,
                                          group.actionIndex
                                        )}
                                        onDragOver={(event) => handleQaGroupTailDragOver(event, project.id)}
                                        onDrop={(event) => handleQaGroupTailDrop(
                                          event,
                                          project.id,
                                          group.actionIndex
                                        )}
                                      >
                                        拖到这里放到本行动末尾
                                      </div>
                                    ) : (
                                      <p className="project-qa-group-empty">暂无问答。</p>
                                    )
                                  ) : (
                                    <div
                                      className="project-qa-list"
                                      onDragEnter={(event) => handleQaGroupTailDragEnter(
                                        event,
                                        project.id,
                                        group.actionIndex
                                      )}
                                      onDragOver={(event) => handleQaGroupTailDragOver(event, project.id)}
                                    >
                                      {group.items.map(({ item, qaIndex }, groupItemIndex) => {
                                        const isInlineEditing = isManagingQa
                                          && activeQaEditorMap[project.id] === item.id;
                                        const qaActionIndex = getSafeActionIndex(
                                          item.actionIndex,
                                          qaIndex,
                                          project.actions.length
                                        );
                                        const itemDropKey = getQaDropTargetKey(
                                          project.id,
                                          qaActionIndex,
                                          item.id
                                        );
                                        return (
                                          <article
                                            key={item.id}
                                            className={`project-qa-item ${isInlineEditing ? 'is-inline-editing' : ''} ${draggingQaId === item.id ? 'is-dragging' : ''} ${dragOverTargetKey === itemDropKey ? 'is-drag-over' : ''} ${!isManagingQa && openAnswerIds.has(item.id) ? 'is-answer-open' : ''}`}
                                            tabIndex={0}
                                            onClick={() => {
                                              if (!isManagingQa) return;
                                              openQaInlineEditor(project.id, item.id);
                                            }}
                                            onDragEnter={(event) => {
                                              if (!isManagingQa) return;
                                              handleQaItemDragEnter(event, project.id, qaActionIndex, item.id);
                                            }}
                                            onDragOver={(event) => {
                                              if (!isManagingQa) return;
                                              handleQaItemDragOver(event, project.id);
                                            }}
                                            onDrop={(event) => {
                                              if (!isManagingQa) return;
                                              handleQaItemDrop(event, project.id, qaActionIndex, item.id);
                                            }}
                                          >
                                            {isInlineEditing ? (
                                              <div className="project-qa-inline-editor">
                                                <div className="project-qa-editor-item-header">
                                                  <span>问答 #{groupItemIndex + 1}</span>
                                                  <div className="project-qa-editor-item-actions">
                                                    <button
                                                      type="button"
                                                      className="project-qa-save-btn"
                                                      onClick={(event) => {
                                                        event.stopPropagation();
                                                        saveQaItem(project.id);
                                                      }}
                                                      disabled={isSavingQa}
                                                    >
                                                      {isSavingQa ? '保存中...' : '保存'}
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="project-qa-delete-btn"
                                                      onClick={(event) => {
                                                        event.stopPropagation();
                                                        removeQaItem(project.id, item.id);
                                                      }}
                                                      disabled={isSavingQa}
                                                    >
                                                      删除
                                                    </button>
                                                  </div>
                                                </div>
                                                {project.actions.length > 0 && (
                                                  <div className="project-qa-field-row">
                                                    <label htmlFor={`qa-action-${item.id}`}>所属行动</label>
                                                    <select
                                                      id={`qa-action-${item.id}`}
                                                      className="project-qa-select"
                                                      value={qaActionIndex}
                                                      onChange={(event) => updateQaField(
                                                        project.id,
                                                        item.id,
                                                        'actionIndex',
                                                        Number(event.target.value)
                                                      )}
                                                    >
                                                      {project.actions.map((_, actionIndex) => (
                                                        <option
                                                          key={`${item.id}-action-${actionIndex}`}
                                                          value={actionIndex}
                                                        >
                                                          行动 {actionIndex + 1}
                                                        </option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                )}
                                                <input
                                                  type="text"
                                                  className="project-qa-input"
                                                  placeholder="请输入问题"
                                                  value={item.question}
                                                  ref={(node) => {
                                                    const key = `${project.id}:${item.id}`;
                                                    if (node) {
                                                      qaQuestionInputRefs.current[key] = node;
                                                    } else {
                                                      delete qaQuestionInputRefs.current[key];
                                                    }
                                                  }}
                                                  onChange={(event) => updateQaField(
                                                    project.id,
                                                    item.id,
                                                    'question',
                                                    event.target.value
                                                  )}
                                                />
                                                <textarea
                                                  className="project-qa-textarea"
                                                  rows={6}
                                                  placeholder="请输入答案"
                                                  value={item.answer}
                                                  onChange={(event) => updateQaField(
                                                    project.id,
                                                    item.id,
                                                    'answer',
                                                    event.target.value
                                                  )}
                                                />
                                              </div>
                                            ) : (
                                              <>
                                                <div className="project-qa-item-head">
                                                  <h5
                                                    className="project-qa-question"
                                                    onClick={(event) => {
                                                      event.stopPropagation();
                                                      if (isManagingQa) {
                                                        openQaInlineEditor(project.id, item.id, true);
                                                      } else {
                                                        setOpenAnswerIds((prev) => {
                                                          const next = new Set(prev);
                                                          if (next.has(item.id)) {
                                                            next.delete(item.id);
                                                          } else {
                                                            next.add(item.id);
                                                          }
                                                          return next;
                                                        });
                                                      }
                                                    }}
                                                  >
                                                    {groupItemIndex + 1}. {item.question || '（未填写问题）'}
                                                  </h5>
                                                  {!isManagingQa && (
                                                    <button
                                                      type="button"
                                                      className="project-qa-edit-btn"
                                                      onClick={(event) => {
                                                        event.stopPropagation();
                                                        openQaInlineEditor(project.id, item.id);
                                                      }}
                                                      title="编辑此问答"
                                                    >
                                                      编辑
                                                    </button>
                                                  )}
                                                  {isManagingQa && (
                                                    <button
                                                      type="button"
                                                      className="project-qa-drag-handle"
                                                      draggable
                                                      onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                      }}
                                                      onDragStart={(event) => handleQaDragStart(
                                                        event,
                                                        project,
                                                        item,
                                                        qaIndex
                                                      )}
                                                      onDragEnd={handleQaDragEnd}
                                                      aria-label="拖拽调整问答顺序"
                                                      title="拖拽调整问答顺序"
                                                    >
                                                      ⋮⋮
                                                    </button>
                                                  )}
                                                </div>
                                                <div className="project-qa-answer">
                                                  <span className="project-qa-answer-label">答：</span>
                                                  <div className="project-qa-answer-markdown">
                                                    <QaAnswerMarkdownBoundary
                                                      content={typeof item.answer === 'string' && item.answer
                                                        ? item.answer.trim()
                                                        : '（未填写回答）'}
                                                    >
                                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {typeof item.answer === 'string' && item.answer
                                                          ? item.answer.trim()
                                                          : '（未填写回答）'}
                                                      </ReactMarkdown>
                                                    </QaAnswerMarkdownBoundary>
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                          </article>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {isManagingQa && group.items.length > 0 && (
                                    <div
                                      className={`project-qa-group-dropzone ${dragOverTargetKey === groupTailDropKey ? 'is-drag-over' : ''} ${dragOverActionIndex === group.actionIndex ? 'is-drag-over-action' : ''}`}
                                      onDragEnter={(event) => handleQaGroupTailDragEnter(
                                        event,
                                        project.id,
                                        group.actionIndex
                                      )}
                                      onDragOver={(event) => handleQaGroupTailDragOver(event, project.id)}
                                      onDrop={(event) => handleQaGroupTailDrop(
                                        event,
                                        project.id,
                                        group.actionIndex
                                      )}
                                    >
                                      拖到这里放到本行动末尾
                                    </div>
                                  )}
                                </div>
                              )}
                            </section>
                          );
                        })}
                      </div>
                    )}

                    {!isManagingQa && (
                      <div className="project-qa-display-actions">
                        <button
                          type="button"
                          className="project-qa-add-btn"
                          onClick={() => addQaFromDisplay(project.id)}
                          disabled={isSavingQa}
                        >
                          + 新增
                        </button>
                      </div>
                    )}

                    {isManagingQa && (
                      <div className="project-qa-editor-actions">
                        <button
                          type="button"
                          className="project-qa-add-btn"
                          onClick={() => addQaWhileManaging(project.id)}
                          disabled={isSavingQa}
                        >
                          + 新增问答
                        </button>
                        <button
                          type="button"
                          className="project-qa-save-btn"
                          onClick={() => toggleQaManage(project.id)}
                          disabled={isSavingQa}
                        >
                          {isSavingQa ? '保存中...' : '保存'}
                        </button>
                      </div>
                    )}
                  </section>

                  <section className="project-detail-block project-reference-block">
                    {Array.isArray(project.references) && project.references.length > 0 ? (
                      <ul className="project-reference-list compact">
                        {project.references.map((reference) => (
                          <li key={reference.id} className="project-reference-item compact">
                            <button
                              type="button"
                              className="project-reference-open-btn"
                              title={reference.type === 'file' ? reference.path : reference.url}
                              onClick={() => openReference(reference)}
                            >
                              <span className="project-reference-title">{reference.title}</span>
                              <span className="project-reference-open-text">
                                {reference.type === 'file' ? '打开' : '网页'}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="project-reference-empty">暂无参考文件。</p>
                    )}
                  </section>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default ProjectIntroPage;
