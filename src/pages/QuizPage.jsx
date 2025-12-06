import React, { useState } from 'react';
import { submitQuizAnswer, speechToText } from '../api/judgeApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceRecorder from '../components/VoiceRecorder';
import './QuizPage.css';

// 模拟问答题数据 - 按分类组织
const mockQuizzesByCategory = {
    'HTML': [
        {
            id: 'html1',
            title: 'HTML5 新增的语义化标签',
            difficulty: 'Easy',
            category: 'HTML',
            question: `请列举 HTML5 中新增的语义化标签，并说明它们的作用。`,
            tags: ['HTML5', '语义化', '标签'],
            points: 10,
            referenceAnswer: `**HTML5 新增的语义化标签：**
1. **<header>**：页面或区域的头部
2. **<nav>**：导航链接
3. **<article>**：独立的内容
4. **<section>**：文档中的节
5. **<aside>**：侧边栏内容
6. **<footer>**：页面或区域的底部`,
            hints: ['header、nav、footer', 'article、section、aside']
        },
        {
            id: 'html2',
            title: '块级元素和行内元素的区别',
            difficulty: 'Easy',
            category: 'HTML',
            question: `请说明块级元素和行内元素的区别，并各举3个例子。`,
            tags: ['元素类型', '布局'],
            points: 10,
            referenceAnswer: `**区别：**
1. 块级元素独占一行，行内元素不换行
2. 块级元素可设置宽高，行内元素不可以
3. 块级元素可包含块级和行内，行内只能包含行内

**块级：** div、p、h1-h6
**行内：** span、a、img`,
            hints: ['独占一行 vs 不换行', '可设置宽高 vs 不可设置']
        }
    ],
    'CSS': [
        {
            id: 'css1',
            title: 'CSS 盒模型',
            difficulty: 'Easy',
            category: 'CSS',
            question: `请解释 CSS 盒模型的组成部分，以及标准盒模型和 IE 盒模型的区别。`,
            tags: ['盒模型', '布局', '基础'],
            points: 10,
            referenceAnswer: `**盒模型组成：**
1. Content（内容）
2. Padding（内边距）
3. Border（边框）
4. Margin（外边距）

**区别：**
- 标准盒模型：width = content
- IE盒模型：width = content + padding + border`,
            hints: ['四个组成部分', 'box-sizing 属性']
        },
        {
            id: 'css2',
            title: 'Flex 布局',
            difficulty: 'Medium',
            category: 'CSS',
            question: `请说明 Flex 布局的主要属性及其作用。`,
            tags: ['Flex', '布局', '响应式'],
            points: 15,
            referenceAnswer: `**容器属性：**
1. flex-direction：主轴方向
2. justify-content：主轴对齐
3. align-items：交叉轴对齐
4. flex-wrap：换行

**项目属性：**
1. flex-grow：放大比例
2. flex-shrink：缩小比例
3. flex-basis：默认大小`,
            hints: ['容器属性 vs 项目属性', '主轴和交叉轴']
        }
    ],
    'JavaScript': [
        {
            id: 'q1',
            title: 'JavaScript 的数据类型有哪些？',
            difficulty: 'Easy',
            category: 'JavaScript',
            question: `请列举 JavaScript 中的所有数据类型，并简要说明每种类型的特点。`,
            tags: ['数据类型', '基础'],
            points: 10,
            referenceAnswer: `JavaScript 有 8 种数据类型：

**基本数据类型（7种）：**
1. **Number**：数字类型，包括整数和浮点数
2. **String**：字符串类型
3. **Boolean**：布尔类型，true/false
4. **Undefined**：未定义类型
5. **Null**：空类型
6. **Symbol**：符号类型（ES6新增）
7. **BigInt**：大整数类型（ES2020新增）

**引用数据类型（1种）：**
8. **Object**：对象类型，包括普通对象、数组、函数、日期等

**特点：**
- 基本类型存储在栈中，按值访问
- 引用类型存储在堆中，按引用访问
- 使用 typeof 可以检测大部分类型（但 null 会返回 'object'）`,
            hints: [
                '基本类型有7种',
                '引用类型主要是Object',
                'ES6新增了Symbol',
                'ES2020新增了BigInt'
            ]
        },
        {
            id: 'q2',
            title: '解释 JavaScript 的闭包（Closure）',
            difficulty: 'Medium',
            category: 'JavaScript',
            question: `什么是闭包？闭包的应用场景有哪些？请举例说明。`,
            tags: ['闭包', '作用域', '核心概念'],
            points: 15,
            referenceAnswer: `**闭包定义：**
闭包是指有权访问另一个函数作用域中变量的函数。

**应用场景：**
1. 数据私有化
2. 函数柯里化
3. 防抖节流
4. 模块化`,
            hints: [
                '函数嵌套是关键',
                '内部函数访问外部变量',
                '可以实现数据私有化'
            ]
        },
        {
            id: 'q3',
            title: 'Promise 的三种状态及状态转换',
            difficulty: 'Medium',
            category: 'JavaScript',
            question: `请说明 Promise 的三种状态，以及状态之间如何转换？`,
            tags: ['Promise', '异步', '状态'],
            points: 15,
            referenceAnswer: `**Promise 的三种状态：**
1. Pending（进行中）
2. Fulfilled（已成功）
3. Rejected（已失败）

**状态转换特点：**
- 单向性：只能从 Pending 转换
- 不可逆：状态改变后不会再变
- 唯一性：只能转换一次`,
            hints: [
                '三种状态：pending、fulfilled、rejected',
                '状态转换是单向且不可逆的'
            ]
        },
        {
            id: 'q4',
            title: 'var、let、const 的区别',
            difficulty: 'Easy',
            category: 'JavaScript',
            question: `请详细说明 var、let、const 三种变量声明方式的区别。`,
            tags: ['变量声明', 'ES6', '作用域'],
            points: 10,
            referenceAnswer: `**主要区别：**
1. 作用域：var 函数作用域，let/const 块级作用域
2. 变量提升：var 存在，let/const 不存在
3. 重复声明：var 允许，let/const 不允许
4. 修改值：const 不可修改（基本类型）`,
            hints: [
                'var 是函数作用域',
                'let 和 const 是块级作用域'
            ]
        },
        {
            id: 'q5',
            title: '事件循环（Event Loop）机制',
            difficulty: 'Hard',
            category: 'JavaScript',
            question: `请详细解释 JavaScript 的事件循环机制。`,
            tags: ['Event Loop', '异步', '宏任务', '微任务'],
            points: 20,
            referenceAnswer: `**执行顺序：**
1. 执行同步代码
2. 执行所有微任务
3. 执行一个宏任务
4. 重复步骤 2-3

**宏任务：** setTimeout、setInterval
**微任务：** Promise.then、MutationObserver`,
            hints: [
                '同步代码先执行',
                '微任务优先于宏任务'
            ]
        }
    ],
    'React': [
        {
            id: 'react1',
            title: 'React Hooks 的使用规则',
            difficulty: 'Medium',
            category: 'React',
            question: `请说明 React Hooks 的使用规则，以及为什么要遵守这些规则。`,
            tags: ['Hooks', '规则', 'React'],
            points: 15,
            referenceAnswer: `**Hooks 使用规则：**
1. 只在最顶层使用 Hooks
2. 只在 React 函数中调用 Hooks
3. 不要在循环、条件或嵌套函数中调用

**原因：**
- React 依赖 Hooks 调用顺序来管理状态
- 保证每次渲染时 Hooks 调用顺序一致`,
            hints: ['顶层调用', '不在循环和条件中使用']
        },
        {
            id: 'react2',
            title: 'useEffect 的使用场景',
            difficulty: 'Medium',
            category: 'React',
            question: `请说明 useEffect 的主要使用场景和注意事项。`,
            tags: ['useEffect', 'Hooks', '副作用'],
            points: 15,
            referenceAnswer: `**使用场景：**
1. 数据获取
2. 订阅/取消订阅
3. DOM 操作
4. 定时器

**注意事项：**
1. 依赖数组的正确使用
2. 清理函数的返回
3. 避免无限循环`,
            hints: ['处理副作用', '依赖数组', '清理函数']
        },
        {
            id: 'react3',
            title: 'React 组件通信方式',
            difficulty: 'Medium',
            category: 'React',
            question: `请列举 React 中常见的组件通信方式。`,
            tags: ['组件通信', 'props', 'context'],
            points: 15,
            referenceAnswer: `**通信方式：**
1. Props（父→子）
2. 回调函数（子→父）
3. Context API（跨层级）
4. Redux/Zustand（全局状态）
5. Event Bus（发布订阅）`,
            hints: ['props 和回调', 'Context API', '状态管理库']
        }
    ]
};

const QuizPage = () => {
    // 将分类数据转换为扁平的题目列表
    const allQuizzes = Object.values(mockQuizzesByCategory).flat();

    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [showHints, setShowHints] = useState(false);

    // 分类展开/折叠状态
    const [expandedCategories, setExpandedCategories] = useState({
        'HTML': true,
        'CSS': true,
        'JavaScript': true,
        'React': true
    });

    // AI 分析相关状态
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const currentQuiz = allQuizzes[currentQuizIndex];

    // 切换分类展开/折叠
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // 选择题目
    const selectQuiz = (quizId) => {
        const index = allQuizzes.findIndex(q => q.id === quizId);
        if (index !== -1) {
            setCurrentQuizIndex(index);
            setUserAnswer('');
            setShowAnswer(false);
            setShowHints(false);
            setAnalysisResult(null);
        }
    };

    // 获取分类图标
    const getCategoryIcon = (category) => {
        const icons = {
            'HTML': '📄',
            'CSS': '🎨',
            'JavaScript': '⚡',
            'React': '⚛️'
        };
        return icons[category] || '📚';
    };

    // 获取分类颜色
    const getCategoryColor = (category) => {
        const colors = {
            'HTML': '#e34c26',
            'CSS': '#264de4',
            'JavaScript': '#f7df1e',
            'React': '#61dafb'
        };
        return colors[category] || '#667eea';
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return '#52c41a';
            case 'medium':
                return '#faad14';
            case 'hard':
                return '#f5222d';
            default:
                return '#666';
        }
    };

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) {
            alert('请先输入你的答案');
            return;
        }

        try {
            setIsAnalyzing(true);
            setAnalysisResult(null);

            console.log('🚀 开始提交答案到 AI 分析...');
            console.log('题目 ID:', currentQuiz.id);
            console.log('答案长度:', userAnswer.length);

            const result = await submitQuizAnswer(currentQuiz.id, userAnswer);

            console.log('✅ AI 分析返回结果:', result);

            if (result.success && result.hasAIAnalysis) {
                setAnalysisResult(result);
                setShowAnswer(true);
            } else {
                alert('AI 分析服务暂时不可用，请稍后重试');
            }
        } catch (error) {
            console.error('❌ 提交答案失败:', error);
            alert('提交失败: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNextQuiz = () => {
        if (currentQuizIndex < allQuizzes.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
            setUserAnswer('');
            setShowAnswer(false);
            setShowHints(false);
            setAnalysisResult(null);
        }
    };

    const handlePrevQuiz = () => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(currentQuizIndex - 1);
            setUserAnswer('');
            setShowAnswer(false);
            setShowHints(false);
            setAnalysisResult(null);
        }
    };

    const handleReset = () => {
        setUserAnswer('');
        setShowAnswer(false);
        setShowHints(false);
        setAnalysisResult(null);
    };

    const handleVoiceInput = async (audioData) => {
        try {
            console.log('🎤 开始语音识别...');

            const result = await speechToText(audioData);

            if (result.success && result.text) {
                console.log('✅ 语音识别成功:', result.text);
                setUserAnswer(prev => {
                    const newText = prev ? prev + ' ' + result.text : result.text;
                    return newText;
                });
            } else {
                alert('语音识别失败，请重试');
            }
        } catch (error) {
            console.error('❌ 语音识别失败:', error);
            alert('语音识别失败: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="quiz-page">
            <div className="quiz-container">
                {/* 左侧：分类题目列表 */}
                <aside className="quiz-sidebar">
                    <h3 className="quiz-list-title">📚 题目分类</h3>
                    <div className="quiz-categories">
                        {Object.keys(mockQuizzesByCategory).map(category => (
                            <div key={category} className="category-section">
                                {/* 分类标题 */}
                                <div
                                    className="category-header"
                                    onClick={() => toggleCategory(category)}
                                    style={{ borderLeftColor: getCategoryColor(category) }}
                                >
                                    <div className="category-title">
                                        <span className="category-icon">{getCategoryIcon(category)}</span>
                                        <span className="category-name">{category}</span>
                                        <span className="category-count">
                                            ({mockQuizzesByCategory[category].length})
                                        </span>
                                    </div>
                                    <span className={`category-arrow ${expandedCategories[category] ? 'expanded' : ''}`}>
                                        ▼
                                    </span>
                                </div>

                                {/* 题目列表 */}
                                {expandedCategories[category] && (
                                    <div className="quiz-items">
                                        {mockQuizzesByCategory[category].map((quiz, index) => {
                                            const globalIndex = allQuizzes.findIndex(q => q.id === quiz.id);
                                            return (
                                                <div
                                                    key={quiz.id}
                                                    className={`quiz-item ${currentQuizIndex === globalIndex ? 'active' : ''}`}
                                                    onClick={() => selectQuiz(quiz.id)}
                                                >
                                                    <div className="quiz-item-header">
                                                        <span className="quiz-number">#{index + 1}</span>
                                                        <span
                                                            className="quiz-difficulty"
                                                            style={{ color: getDifficultyColor(quiz.difficulty) }}
                                                        >
                                                            {quiz.difficulty}
                                                        </span>
                                                    </div>
                                                    <div className="quiz-title">{quiz.title}</div>
                                                    <div className="quiz-meta">
                                                        <span className="quiz-points">🏆 {quiz.points}分</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 右侧：题目详情和答题区 */}
                <main className="quiz-main">
                    {currentQuiz && (
                        <>
                            {/* 题目信息 */}
                            <div className="quiz-detail">
                                <div className="quiz-detail-header">
                                    <h2>{currentQuiz.title}</h2>
                                    <div className="quiz-badges">
                                        <span
                                            className="badge badge-difficulty"
                                            style={{ backgroundColor: getDifficultyColor(currentQuiz.difficulty) }}
                                        >
                                            {currentQuiz.difficulty}
                                        </span>
                                        <span
                                            className="badge badge-category"
                                            style={{ backgroundColor: getCategoryColor(currentQuiz.category) }}
                                        >
                                            {getCategoryIcon(currentQuiz.category)} {currentQuiz.category}
                                        </span>
                                        <span className="badge badge-points">🏆 {currentQuiz.points}分</span>
                                    </div>
                                </div>

                                <div className="quiz-tags">
                                    {currentQuiz.tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="quiz-question">
                                    <h3>📋 题目</h3>
                                    <p className="question-text">{currentQuiz.question}</p>
                                </div>

                                {/* 提示按钮 */}
                                <div className="hints-section">
                                    <button
                                        className="btn-hints"
                                        onClick={() => setShowHints(!showHints)}
                                    >
                                        💡 {showHints ? '隐藏提示' : '显示提示'}
                                    </button>
                                    {showHints && (
                                        <div className="hints-content">
                                            {currentQuiz.hints.map((hint, index) => (
                                                <div key={index} className="hint-item">
                                                    <span className="hint-number">{index + 1}</span>
                                                    <span className="hint-text">{hint}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 答题区 */}
                            <div className="answer-section">
                                <div className="answer-header">
                                    <h3>✍️ 你的答案</h3>
                                    <VoiceRecorder onTranscriptReceived={handleVoiceInput} />
                                </div>
                                <textarea
                                    className="answer-textarea"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="在此输入你的答案... 或点击右上角语音输入按钮 🎤"
                                    rows={10}
                                />

                                <div className="answer-actions">
                                    <button className="btn btn-secondary" onClick={handleReset}>
                                        清空
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmitAnswer}
                                        disabled={!userAnswer.trim() || isAnalyzing}
                                    >
                                        {isAnalyzing ? '🤖 AI 分析中...' : '🤖 AI 分析'}
                                    </button>
                                </div>
                            </div>

                            {/* AI 分析结果 */}
                            {analysisResult && analysisResult.hasAIAnalysis && (
                                <div className="ai-analysis-section">
                                    <h3>🤖 AI 分析结果</h3>

                                    <div className="ai-analysis-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h2: ({node, ...props}) => <h2 className="ai-h2" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="ai-h3" {...props} />,
                                                ul: ({node, ...props}) => <ul className="ai-ul" {...props} />,
                                                li: ({node, ...props}) => <li className="ai-li" {...props} />,
                                                p: ({node, ...props}) => <p className="ai-p" {...props} />,
                                                strong: ({node, ...props}) => <strong className="ai-strong" {...props} />
                                            }}
                                        >
                                            {analysisResult.aiAnalysis}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* 参考答案 */}
                            {showAnswer && analysisResult && (
                                <div className="reference-answer">
                                    <h3>📖 参考答案</h3>
                                    <div className="answer-content">
                                        <pre>{analysisResult.quiz?.referenceAnswer || currentQuiz.referenceAnswer}</pre>
                                    </div>
                                </div>
                            )}

                            {/* 导航按钮 */}
                            <div className="quiz-navigation">
                                <button
                                    className="btn btn-nav"
                                    onClick={handlePrevQuiz}
                                    disabled={currentQuizIndex === 0}
                                >
                                    ← 上一题
                                </button>
                                <span className="quiz-progress">
                                    {currentQuizIndex + 1} / {allQuizzes.length}
                                </span>
                                <button
                                    className="btn btn-nav"
                                    onClick={handleNextQuiz}
                                    disabled={currentQuizIndex === allQuizzes.length - 1}
                                >
                                    下一题 →
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default QuizPage;