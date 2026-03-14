# 前端面试备考系统 - 前端

基于 React + Vite + Zustand 开发的前端面试备考工具，集成手写题练习、知识点问答、语音口答、项目介绍 Q&A 管理等功能。

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **Zustand** - 状态管理
- **Monaco Editor** - 代码编辑器
- **react-markdown** - Markdown 渲染
- **Axios** - HTTP 客户端

## 页面功能

| 页面 | 路由 key | 说明 |
|------|----------|------|
| 复习看板 | `review` | 今日任务管理，支持拖拽排序和优先级切换 |
| 手写题练习 | `coding` | Monaco 编辑器 + 判题 + AI 讲解 + 提交历史 |
| 知识问答 | `quiz` | 前端知识点 Quiz，支持文字/语音作答，AI 评分 |
| 项目介绍 | `intro` | 按项目分组的面试 Q&A，支持在线编辑答案 |
| LeetCode 刷题 | `leetcode` | 内嵌 LeetCode 页面（懒加载） |

## 项目结构

```
src/
├── pages/
│   ├── ReviewPage.jsx         # 复习看板
│   ├── QuizPage.jsx           # 知识问答
│   ├── ProjectIntroPage.jsx   # 项目介绍 Q&A
│   ├── LeetCodePage.jsx       # LeetCode 刷题
│   └── SubmissionsPage.jsx    # 提交历史
├── components/
│   ├── CodeEditor.jsx         # Monaco 代码编辑器
│   ├── ProblemList.jsx        # 手写题列表
│   ├── ProblemDetail.jsx      # 题目详情
│   ├── ProblemSubmissions.jsx # 题目提交历史
│   ├── TestResult.jsx         # 判题结果展示
│   └── VoiceRecorder.jsx      # 语音录制组件
├── api/
│   └── judgeApi.js            # 后端接口封装
├── store/
│   └── judgeStore.js          # Zustand 全局状态
├── App.jsx                    # 主应用（页面路由 & 导航）
└── main.jsx                   # 入口文件
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务

```bash
npm run dev
```

访问 `http://localhost:3000`

> 需要后端服务同时运行在 `http://localhost:5000`，参考后端 README。

### 3. 构建生产版本

```bash
npm run build
```

## 主要功能说明

### 复习看板

- 今日学习任务的增删改、拖拽排序
- 任务优先级（高/中/低）一键切换
- 完成 / 未完成分 Tab 展示

### 手写题练习

- Monaco 编辑器，语法高亮 + 自动补全
- 示例运行（仅跑样例）& 完整提交（全量测试用例）
- AI 代码讲解（调用后端 DashScope）
- 每题提交历史展示

### 知识问答

- 前端知识点题库，随机出题
- 支持文字输入或**语音录制**作答
- AI 评分 + 参考答案展示

### 项目介绍 Q&A

- 按项目 & 行动分组展示问答
- 答案支持 Markdown 渲染
- 在线编辑答案，实时保存到后端

## 注意事项

- 语音录制需要浏览器麦克风权限
- Monaco Editor 首次加载可能较慢
- 建议使用 Chrome / Edge 最新版

## 许可证

MIT License
