# JavaScript 手写题判题系统 - 前端

基于 React + Vite + Zustand 开发的 JavaScript 手写题在线判题系统前端页面。

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **Zustand** - 状态管理
- **Monaco Editor** - 代码编辑器
- **Axios** - HTTP 客户端

## 功能特性

- ✅ 题目列表展示和选择
- ✅ 题目详情查看(描述、示例、约束条件)
- ✅ Monaco 代码编辑器集成
- ✅ 代码运行(示例测试)
- ✅ 代码提交(完整测试)
- ✅ 实时测试结果展示
- ✅ 多测试用例结果对比
- ✅ 错误信息展示

## 项目结构

```
src/
├── api/
│   └── judgeApi.js          # API 接口
├── components/
│   ├── CodeEditor.jsx       # 代码编辑器组件
│   ├── ProblemList.jsx      # 题目列表组件
│   ├── ProblemList.css
│   ├── ProblemDetail.jsx    # 题目详情组件
│   ├── ProblemDetail.css
│   ├── TestResult.jsx       # 测试结果组件
│   └── TestResult.css
├── store/
│   └── judgeStore.js        # Zustand 状态管理
├── App.jsx                  # 主应用组件
├── App.css
├── main.jsx                 # 入口文件
└── index.css                # 全局样式
```

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

访问: http://localhost:3000

## 构建生产版本

```bash
npm run build
```

## API 接口说明

前端需要后端提供以下接口:

### 1. 获取题目列表
```
GET /api/problems
Response: { problems: Array }
```

### 2. 获取题目详情
```
GET /api/problems/:id
Response: { problem: Object }
```

### 3. 运行代码(示例测试)
```
POST /api/run
Body: { problemId, code }
Response: { status, testResults, ... }
```

### 4. 提交代码(完整测试)
```
POST /api/judge
Body: { problemId, code }
Response: { status, passedTests, totalTests, testResults, ... }
```

## 后端接口数据格式

### 题目对象格式
```javascript
{
  id: string,
  title: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  description: string,
  examples: [
    {
      input: string,
      output: string,
      explanation?: string
    }
  ],
  constraints: string[],
  hints?: string[],
  template: string  // 代码模板
}
```

### 判题结果格式
```javascript
{
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded',
  message?: string,
  error?: string,
  passedTests?: number,
  totalTests?: number,
  testResults: [
    {
      passed: boolean,
      input: any,
      expected: any,
      actual: any,
      error?: string,
      executionTime?: number
    }
  ]
}
```

## 注意事项

1. 确保后端服务运行在 `http://localhost:5000`
2. 如果后端端口不同,请修改 `vite.config.js` 中的代理配置
3. Monaco Editor 首次加载可能较慢,请耐心等待
4. 建议使用现代浏览器(Chrome、Firefox、Edge 最新版)

## 后续优化建议

- [ ] 添加用户认证功能
- [ ] 支持代码保存和历史记录
- [ ] 添加代码执行时间和内存统计
- [ ] 支持多语言(不仅限于 JavaScript)
- [ ] 添加题目难度筛选和搜索
- [ ] 支持暗色主题切换
- [ ] 添加代码格式化功能
- [ ] 支持键盘快捷键
