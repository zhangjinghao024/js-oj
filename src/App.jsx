import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useJudgeStore } from './store/judgeStore';
import { fetchProblems, submitCode, runCode, fetchRecords } from './api/judgeApi';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import CodeEditor from './components/CodeEditor';
import TestResult from './components/TestResult';
import ProblemSubmissions from './components/ProblemSubmissions'; // ⭐ 新增
import QuizPage from './pages/QuizPage';
import ProjectIntroPage from './pages/ProjectIntroPage';
import ReviewPage from './pages/ReviewPage';
import './App.css';

const loadLeetCodePage = () => import('./pages/LeetCodePage');
const LeetCodePage = lazy(loadLeetCodePage);

const PAGE_STORAGE_KEY = 'js-oj:currentPage';
const TODAY_TASKS_STORAGE_KEY = 'js-oj:todayTasks';
const VALID_PAGES = new Set(['review', 'coding', 'quiz', 'leetcode', 'intro']);
const TASK_PRIORITY_META = {
  high: '高优',
  medium: '中优',
  low: '低优'
};
const TASK_PRIORITY_NEXT = {
  high: 'medium',
  medium: 'low',
  low: 'high'
};

const reorderTasksInTab = (tasks, tab, draggedTaskId, targetTaskId) => {
  if (!draggedTaskId) return tasks;

  const matcher = tab === 'completed'
    ? (task) => task.completed
    : (task) => !task.completed;
  const visibleTasks = tasks.filter(matcher);
  const draggedIndex = visibleTasks.findIndex((task) => task.id === draggedTaskId);
  if (draggedIndex < 0) return tasks;

  const reorderedVisible = [...visibleTasks];
  const [movedTask] = reorderedVisible.splice(draggedIndex, 1);

  if (targetTaskId) {
    const targetIndex = reorderedVisible.findIndex((task) => task.id === targetTaskId);
    if (targetIndex < 0) return tasks;
    reorderedVisible.splice(targetIndex, 0, movedTask);
  } else {
    reorderedVisible.push(movedTask);
  }

  const visibleTaskSet = new Set(visibleTasks.map((task) => task.id));
  let visibleCursor = 0;
  return tasks.map((task) => (
    visibleTaskSet.has(task.id) ? reorderedVisible[visibleCursor++] : task
  ));
};

const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeTasks = (rawTasks) => {
  if (!Array.isArray(rawTasks)) return [];
  return rawTasks
    .filter((task) => task && typeof task === 'object')
    .map((task, index) => {
      const title = typeof task.title === 'string' ? task.title.trim() : '';
      const priority = Object.prototype.hasOwnProperty.call(TASK_PRIORITY_META, task.priority)
        ? task.priority
        : 'medium';
      return {
        id: typeof task.id === 'string' ? task.id : `today-task-${Date.now()}-${index}`,
        title,
        priority,
        completed: Boolean(task.completed),
        createdAt: typeof task.createdAt === 'number' ? task.createdAt : Date.now()
      };
    })
    .filter((task) => Boolean(task.title));
};

const readTasksByDate = (dateKey) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(TODAY_TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return [];
    return normalizeTasks(parsed[dateKey]);
  } catch (err) {
    console.warn('读取今日任务失败:', err);
    return [];
  }
};

const writeTasksByDate = (dateKey, tasks) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(TODAY_TASKS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const dateMap = parsed && typeof parsed === 'object' ? parsed : {};
    dateMap[dateKey] = tasks;
    window.localStorage.setItem(TODAY_TASKS_STORAGE_KEY, JSON.stringify(dateMap));
  } catch (err) {
    console.warn('保存今日任务失败:', err);
  }
};

const getInitialPage = () => {
  if (typeof window === 'undefined') return 'review';
  try {
    const savedPage = window.localStorage.getItem(PAGE_STORAGE_KEY);
    return VALID_PAGES.has(savedPage) ? savedPage : 'review';
  } catch (err) {
    console.warn('读取页面状态失败:', err);
    return 'review';
  }
};

function App() {
  const {
    setProblems,
    currentProblem,
    userCode,
    setUserCode,
    setJudging,
    setJudgeResult,
    clearResult,
    setRecords,
    updateProblemRecord,
    saveDraft,
    problems,
    records,
    addToReviewQueue,
    selectProblem,
    reviewQueue,
    dailyAttempts,
    logDailyAttempt
  } = useJudgeStore();

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const saveDraftTimerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewReminder, setShowReviewReminder] = useState(false);

  // 侧边栏宽度调整相关状态
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // ⭐ 用于强制刷新提交历史
  const [submissionKey, setSubmissionKey] = useState(0);

  const handleOpenLeetCode = () => {
    loadLeetCodePage();
    setCurrentPage('leetcode');
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(PAGE_STORAGE_KEY, currentPage);
    } catch (err) {
      console.warn('保存页面状态失败:', err);
    }
  }, [currentPage]);

  // 加载题目列表和记录
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 加载题目列表
        const problemsData = await fetchProblems();
        setProblems(problemsData.problems || []);

        // 加载记录
        try {
          const recordsData = await fetchRecords();
          setRecords(recordsData.records || {});
        } catch (recordErr) {
          console.warn('加载记录失败:', recordErr);
          setRecords({});
        }

        setError(null);
      } catch (err) {
        console.error('加载题目失败:', err);
        setError('加载题目失败,请检查后端服务是否启动');
        // 使用模拟数据
        setProblems(getMockProblems());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setProblems, setRecords]);

  // 每日复习提醒（首次打开或次日唤醒）
  useEffect(() => {
    const STORAGE_KEY = 'js-oj:reviewReminderDate';
    const getTodayKey = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const checkAndShow = () => {
      try {
        const todayKey = getTodayKey();
        const lastShown = window.localStorage.getItem(STORAGE_KEY);
        if (lastShown !== todayKey) {
          window.localStorage.setItem(STORAGE_KEY, todayKey);
          setShowReviewReminder(true);
        }
      } catch (err) {
        console.warn('复习提醒检查失败:', err);
      }
    };

    checkAndShow();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndShow();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  const stats = useMemo(() => {
    let passed = 0;
    let attempted = 0;
    let unattempted = 0;
    problems.forEach((problem) => {
      const record = records[problem.id];
      const isPassed = record?.isPassed || false;
      const totalAttempts = record?.totalAttempts || 0;
      if (isPassed) passed += 1;
      else if (totalAttempts > 0) attempted += 1;
      else unattempted += 1;
    });
    const total = problems.length || 0;
    return { passed, attempted, unattempted, total };
  }, [problems, records]);

  const todayProgressList = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const entries = Object.values(dailyAttempts?.code?.[todayKey] || {});
    return entries.map((item) => ({ id: item.id, title: item.title }));
  }, [dailyAttempts]);

  const todayProgress = todayProgressList.length;
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [showTodayTaskModal, setShowTodayTaskModal] = useState(false);
  const [todayTaskTab, setTodayTaskTab] = useState('pending');
  const [todayTasks, setTodayTasks] = useState(() => readTasksByDate(getLocalDateKey()));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);
  const todayTaskInputRef = useRef(null);

  const filteredProblems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return problems
      .map((problem, index) => ({ problem, index }))
      .filter(({ problem }) => {
        if (keyword && !problem.title?.toLowerCase().includes(keyword)) {
          return false;
        }
        return true;
      });
  }, [problems, searchTerm]);

  const progressPassed = stats.total ? (stats.passed / stats.total) * 100 : 0;
  const progressAttempted = stats.total ? (stats.attempted / stats.total) * 100 : 0;
  const progressUnattempted = Math.max(0, 100 - progressPassed - progressAttempted);
  const pendingTasks = useMemo(
    () => todayTasks.filter((task) => !task.completed),
    [todayTasks]
  );
  const completedTasks = useMemo(
    () => todayTasks.filter((task) => task.completed),
    [todayTasks]
  );
  const displayedTasks = todayTaskTab === 'completed' ? completedTasks : pendingTasks;
  const completedTaskCount = completedTasks.length;
  const totalTaskCount = todayTasks.length;
  const taskProgress = totalTaskCount ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;
  const todayDateLabel = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(new Date());

  useEffect(() => {
    writeTasksByDate(getLocalDateKey(), todayTasks);
  }, [todayTasks]);

  useEffect(() => {
    if (!showTodayTaskModal) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowTodayTaskModal(false);
        setEditingTaskId(null);
        setEditingTaskTitle('');
        setDraggingTaskId(null);
        setDragOverTaskId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const rafId = window.requestAnimationFrame(() => {
      todayTaskInputRef.current?.focus();
    });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.cancelAnimationFrame(rafId);
    };
  }, [showTodayTaskModal]);

  // 自动保存当前题目的代码草稿
  useEffect(() => {
    if (!currentProblem) return;
    if (saveDraftTimerRef.current) {
      clearTimeout(saveDraftTimerRef.current);
    }
    saveDraftTimerRef.current = setTimeout(() => {
      saveDraft(currentProblem.id, userCode);
    }, 500);

    return () => {
      if (saveDraftTimerRef.current) {
        clearTimeout(saveDraftTimerRef.current);
      }
    };
  }, [currentProblem?.id, userCode, saveDraft]);

  // 处理拖拽调整宽度
  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.body.classList.add('resizing');
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX - (sidebarRef.current?.getBoundingClientRect().left || 0);

      // 限制最小和最大宽度
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 运行代码(只运行示例测试用例)
  const handleRunCode = async () => {
    if (!currentProblem || !userCode.trim()) {
      alert('请先选择题目并编写代码');
      return;
    }

    try {
      setJudging(true);
      clearResult();
      const result = await runCode(currentProblem.id, userCode);
      setJudgeResult(result);
      setActiveTab('result');
    } catch (err) {
      console.error('运行代码失败:', err);
      setJudgeResult({
        status: 'Error',
        message: '运行失败: ' + (err.response?.data?.error || err.message)
      });
      setActiveTab('result');
    } finally {
      setJudging(false);
    }
  };

  // 提交代码(运行所有测试用例)
  const handleSubmit = async () => {
    if (!currentProblem || !userCode.trim()) {
      alert('请先选择题目并编写代码');
      return;
    }

    try {
      setJudging(true);
      clearResult();

      console.log('🚀 开始提交代码到 AI 分析...');
      console.log('题目 ID:', currentProblem.id);
      console.log('代码长度:', userCode.length);

      const result = await submitCode(currentProblem.id, userCode);

      console.log('✅ AI 分析返回结果:', result);
      console.log('结果类型:', typeof result);
      console.log('AI 分析内容:', result.aiAnalysis);
      console.log('是否有 AI 分析:', result.hasAIAnalysis);
      console.log('📊 题目记录:', result.record);

      setJudgeResult(result);

      if (currentProblem) {
        addToReviewQueue('code', {
          id: currentProblem.id,
          title: currentProblem.title
        });
        logDailyAttempt('code', {
          id: currentProblem.id,
          title: currentProblem.title
        });
      }

      // 更新记录到 store
      if (result.record) {
        updateProblemRecord(currentProblem.id, result.record);
      }

      // ⭐ 刷新提交历史
      setSubmissionKey(prev => prev + 1);

      setActiveTab('result');
    } catch (err) {
      console.error('❌ 提交代码失败:', err);
      console.error('错误详情:', err.response?.data);
      setJudgeResult({
        status: 'Error',
        message: '提交失败: ' + (err.response?.data?.error || err.message)
      });
      setActiveTab('result');
    } finally {
      setJudging(false);
    }
  };

  // 重置代码
  const [showResetModal, setShowResetModal] = useState(false);

  const handleReset = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setUserCode(currentProblem?.template || '');
    clearResult();
    setShowResetModal(false);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const closeTodayTaskModal = () => {
    setShowTodayTaskModal(false);
    setEditingTaskId(null);
    setEditingTaskTitle('');
    setDraggingTaskId(null);
    setDragOverTaskId(null);
  };

  const openTodayTaskModal = () => {
    setTodayTasks(readTasksByDate(getLocalDateKey()));
    setTodayTaskTab('pending');
    setEditingTaskId(null);
    setEditingTaskTitle('');
    setDraggingTaskId(null);
    setDragOverTaskId(null);
    setShowTodayTaskModal(true);
  };

  const handleAddTodayTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const nextTask = {
      id: `today-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      priority: newTaskPriority,
      completed: false,
      createdAt: Date.now()
    };
    setTodayTasks((prev) => [nextTask, ...prev]);
    setNewTaskTitle('');
    setTodayTaskTab('pending');
  };

  const handleToggleTask = (taskId) => {
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
      setEditingTaskTitle('');
    }
    setTodayTasks((prev) => prev.map((task) => (
      task.id === taskId
        ? {
          ...task,
          completed: !task.completed
        }
        : task
    )));
  };

  const handleCycleTaskPriority = (taskId) => {
    setTodayTasks((prev) => prev.map((task) => (
      task.id === taskId
        ? {
          ...task,
          priority: TASK_PRIORITY_NEXT[task.priority] || 'high'
        }
        : task
    )));
  };

  const handleStartEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const handleSaveEditedTask = (taskId) => {
    const title = editingTaskTitle.trim();
    if (!title) {
      handleCancelEditTask();
      return;
    }
    setTodayTasks((prev) => prev.map((task) => (
      task.id === taskId
        ? {
          ...task,
          title
        }
        : task
    )));
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const handleEditTaskInputKeyDown = (event, taskId) => {
    if (event.isComposing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveEditedTask(taskId);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelEditTask();
    }
  };

  const handleTaskDragStart = (event, taskId) => {
    if (editingTaskId) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
    setDragOverTaskId(null);
  };

  const handleTaskDragOver = (event, taskId) => {
    if (!draggingTaskId || draggingTaskId === taskId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setDragOverTaskId(taskId);
  };

  const handleTaskDrop = (event, targetTaskId) => {
    if (!draggingTaskId) return;
    event.preventDefault();
    event.stopPropagation();
    setTodayTasks((prev) => reorderTasksInTab(prev, todayTaskTab, draggingTaskId, targetTaskId));
    setDraggingTaskId(null);
    setDragOverTaskId(null);
  };

  const handleTaskListDragOver = (event) => {
    if (!draggingTaskId) return;
    event.preventDefault();
    if (dragOverTaskId !== null) {
      setDragOverTaskId(null);
    }
  };

  const handleTaskListDrop = (event) => {
    if (!draggingTaskId) return;
    event.preventDefault();
    setTodayTasks((prev) => reorderTasksInTab(prev, todayTaskTab, draggingTaskId, null));
    setDraggingTaskId(null);
    setDragOverTaskId(null);
  };

  const handleTaskDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverTaskId(null);
  };

  const handleTaskInputKeyDown = (event) => {
    if (event.isComposing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTodayTask();
    }
  };

  if (loading) {
    return (
        <div className="app-loading">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
    );
  }

  return (
      <div className="app">
        {/* 导航栏 - 始终显示 */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
            </div>
            <button
              className={`nav-btn nav-btn-center ${showTodayTaskModal ? 'active' : ''}`}
              onClick={openTodayTaskModal}
            >
              📋 今日任务
            </button>
            <nav className="header-nav">
              <button
                className={`nav-btn ${currentPage === 'coding' ? 'active' : ''}`}
                onClick={() => setCurrentPage('coding')}
              >
                💻 手写题
              </button>
              <button
                className={`nav-btn ${currentPage === 'quiz' ? 'active' : ''}`}
                onClick={() => setCurrentPage('quiz')}
              >
                📝 八股文
              </button>
              <button
                className={`nav-btn ${currentPage === 'leetcode' ? 'active' : ''}`}
                onMouseEnter={loadLeetCodePage}
                onFocus={loadLeetCodePage}
                onClick={handleOpenLeetCode}
              >
                ✅ LeetCode 记录
              </button>
              <button
                className={`nav-btn ${currentPage === 'intro' ? 'active' : ''}`}
                onClick={() => setCurrentPage('intro')}
              >
                📌 项目介绍
              </button>
            </nav>
          </div>
          {error && <div className="error-banner">{error}</div>}
        </header>

        {/* 根据当前页面渲染不同内容 */}
        {currentPage === 'quiz' ? (
          <QuizPage />
        ) : currentPage === 'review' ? (
          <ReviewPage
            onGoCode={(id) => {
              const index = problems.findIndex((problem) => problem.id === id);
              if (index >= 0) {
                selectProblem(index);
                setCurrentPage('coding');
              }
            }}
            onGoQuiz={(id) => {
              try {
                window.localStorage.setItem('js-oj:pendingQuizId', id);
              } catch (err) {
                console.warn('保存待跳转题目失败:', err);
              }
              setCurrentPage('quiz');
            }}
          />
        ) : currentPage === 'leetcode' ? (
          <Suspense
            fallback={(
              <div className="leetcode-loading">
                <div className="leetcode-loading-card">
                  <div className="leetcode-loading-title">LeetCode 页面加载中...</div>
                  <div className="leetcode-loading-bar"></div>
                </div>
              </div>
            )}
          >
            <LeetCodePage />
          </Suspense>
        ) : currentPage === 'intro' ? (
          <ProjectIntroPage />
        ) : (
          <div className="coding-page">
              <section className="coding-topbar">
                <div className="problem-progress">
                  <div className="progress-stats">
                    <span className="progress-item passed">已通过 {stats.passed}</span>
                    <span className="progress-item attempted">尝试 {stats.attempted}</span>
                    <span className="progress-item unattempted">未做 {stats.unattempted}</span>
                    <span className="progress-total">总计 {stats.total}</span>
                  </div>
                  <div className="progress-bar">
                    <span className="progress-segment passed" style={{ width: `${progressPassed}%` }} />
                    <span className="progress-segment attempted" style={{ width: `${progressAttempted}%` }} />
                    <span className="progress-segment unattempted" style={{ width: `${progressUnattempted}%` }} />
                  </div>
                </div>
                <div className="coding-today-progress" onClick={() => setShowTodayModal(true)}>
                  <span className="today-label">今日进度</span>
                  <span className="today-count">{todayProgress}</span>
                  <span className="today-unit">题</span>
                </div>
                <div className="problem-filters">
                  <input
                    className="problem-search"
                    type="text"
                    placeholder="搜索题目..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </section>
              <div className="app-container">
              {/* 左侧: 题目列表 - 可拖拽调整宽度 */}
              <aside
                  ref={sidebarRef}
                  className="sidebar"
                  style={{ width: `${sidebarWidth}px` }}
              >
                <ProblemList items={filteredProblems} />

                {/* 拖拽手柄 */}
                <div
                    className="resizer"
                    onMouseDown={handleMouseDown}
                    title="拖拽调整宽度"
                />
              </aside>

              {/* 中间: 题目详情和代码编辑器 */}
              <main className="main-content">
                <div className="content-tabs">
                  <button
                      className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                      onClick={() => setActiveTab('description')}
                  >
                    题目描述
                  </button>
                  <button
                      className={`tab-button ${activeTab === 'result' ? 'active' : ''}`}
                      onClick={() => setActiveTab('result')}
                  >
                    测试结果
                  </button>
                  {/* ⭐ 新增提交历史标签 */}
                  <button
                      className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
                      onClick={() => setActiveTab('submissions')}
                  >
                    提交历史
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'description' ? (
                      <ProblemDetail />
                  ) : activeTab === 'result' ? (
                      <TestResult />
                  ) : (
                      // ⭐ 显示提交历史
                      <ProblemSubmissions
                          problemId={currentProblem?.id}
                          key={submissionKey}
                      />
                  )}
                </div>

                <div className="editor-section">
                  <div className="editor-header">
                    <h3>代码编辑器</h3>
                    <div className="editor-actions">
                      <button className="btn btn-secondary" onClick={handleReset}>
                        重置
                      </button>
                      <button
                          className="btn btn-success"
                          onClick={handleSubmit}
                          title="提交代码给 AI 分析"
                      >
                        提交
                      </button>
                    </div>
                  </div>
                  <CodeEditor
                      value={userCode}
                      onChange={(value) => setUserCode(value || '')}
                      height="400px"
                  />
                </div>
              </main>
            </div>
          </div>
        )}
        {showResetModal && (
            <div className="reset-modal-overlay" onClick={handleCancelReset}>
              <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reset-modal-header">
                  <h3>确认重置</h3>
                  <button className="reset-modal-close" onClick={handleCancelReset}>✕</button>
                </div>
                <div className="reset-modal-body">
                  <p>确定要重置当前代码吗？重置后将恢复为题目模板。</p>
                </div>
                <div className="reset-modal-footer">
                  <button className="reset-btn cancel" onClick={handleCancelReset}>取消</button>
                  <button className="reset-btn confirm" onClick={handleConfirmReset}>确定重置</button>
                </div>
              </div>
            </div>
        )}
        {showReviewReminder && (
            <div className="reset-modal-overlay" onClick={() => setShowReviewReminder(false)}>
              <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reset-modal-header">
                  <h3>今日复习提醒</h3>
                  <button className="reset-modal-close" onClick={() => setShowReviewReminder(false)}>✕</button>
                </div>
                <div className="reset-modal-body">
                  <p>记得去复习，保持连续性。</p>
                </div>
                <div className="reset-modal-footer">
                  <button className="reset-btn confirm" onClick={() => {
                    setShowReviewReminder(false);
                    setCurrentPage('review');
                  }}>
                    去复习
                  </button>
                </div>
              </div>
            </div>
        )}
        {showTodayModal && (
            <div className="reset-modal-overlay" onClick={() => setShowTodayModal(false)}>
              <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reset-modal-header">
                  <h3>今日已尝试题目</h3>
                  <button className="reset-modal-close" onClick={() => setShowTodayModal(false)}>✕</button>
                </div>
                <div className="reset-modal-body">
                  {todayProgressList.length === 0 ? (
                    <p>今天还没有尝试过题目。</p>
                  ) : (
                    <ul className="today-list">
                      {todayProgressList.map((item) => (
                        <li key={item.id}>{item.title}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
        )}
        {showTodayTaskModal && (
            <div className="today-task-overlay" onClick={closeTodayTaskModal}>
              <div
                className="today-task-modal"
                role="dialog"
                aria-modal="true"
                aria-label="今日任务"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="today-task-header">
                  <div>
                    <p className="today-task-date">{todayDateLabel}</p>
                    <h3>今日任务</h3>
                  </div>
                  <button
                    className="today-task-close"
                    onClick={closeTodayTaskModal}
                    aria-label="关闭今日任务"
                  >
                    ✕
                  </button>
                </div>

                <div className="today-task-progress">
                  <div className="today-task-progress-text">
                    <span>{completedTaskCount}/{totalTaskCount} 已完成</span>
                    <span>{taskProgress}%</span>
                  </div>
                  <div className="today-task-progress-track">
                    <span className="today-task-progress-fill" style={{ width: `${taskProgress}%` }} />
                  </div>
                </div>

                <div className="today-task-tabs">
                  <button
                    className={`today-task-tab ${todayTaskTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setTodayTaskTab('pending')}
                  >
                    待完成 ({pendingTasks.length})
                  </button>
                  <button
                    className={`today-task-tab ${todayTaskTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setTodayTaskTab('completed')}
                  >
                    已完成 ({completedTasks.length})
                  </button>
                </div>

                <div
                  className="today-task-list"
                  onDragOver={handleTaskListDragOver}
                  onDrop={handleTaskListDrop}
                >
                  {displayedTasks.length === 0 ? (
                    <div className="today-task-empty">
                      {todayTaskTab === 'pending' ? '暂无待完成任务，开始添加你的第一个任务吧。' : '还没有已完成任务。'}
                    </div>
                  ) : (
                    displayedTasks.map((task) => (
                      <div
                        className={`today-task-item ${task.completed ? 'completed' : ''} ${draggingTaskId === task.id ? 'dragging' : ''} ${dragOverTaskId === task.id ? 'drag-over' : ''}`}
                        key={task.id}
                        onDragOver={(event) => handleTaskDragOver(event, task.id)}
                        onDrop={(event) => handleTaskDrop(event, task.id)}
                      >
                        <button
                          className={`today-task-check ${task.completed ? 'checked' : ''}`}
                          onClick={() => handleToggleTask(task.id)}
                          aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
                        >
                          {task.completed ? '✓' : ''}
                        </button>
                        <button
                          type="button"
                          className="today-task-drag-handle"
                          draggable={editingTaskId !== task.id}
                          onDragStart={(event) => handleTaskDragStart(event, task.id)}
                          onDragEnd={handleTaskDragEnd}
                          aria-label="拖动任务调整顺序"
                          title="拖动排序"
                        >
                          ⋮⋮
                        </button>
                        {editingTaskId === task.id ? (
                          <input
                            className="today-task-edit-input"
                            type="text"
                            value={editingTaskTitle}
                            onChange={(event) => setEditingTaskTitle(event.target.value)}
                            onKeyDown={(event) => handleEditTaskInputKeyDown(event, task.id)}
                            onBlur={() => handleSaveEditedTask(task.id)}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className="today-task-title"
                            onClick={() => handleStartEditTask(task)}
                            title="点击编辑任务"
                          >
                            {task.title}
                          </button>
                        )}
                        <button
                          type="button"
                          className={`today-task-priority ${task.priority}`}
                          onClick={() => handleCycleTaskPriority(task.id)}
                          title="点击切换优先级"
                          aria-label={`当前优先级 ${TASK_PRIORITY_META[task.priority] || TASK_PRIORITY_META.medium}，点击切换`}
                        >
                          {TASK_PRIORITY_META[task.priority] || TASK_PRIORITY_META.medium}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="today-task-quick-add">
                  <select
                    className="today-task-priority-select"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    aria-label="选择任务优先级"
                  >
                    <option value="high">高优</option>
                    <option value="medium">中优</option>
                    <option value="low">低优</option>
                  </select>
                  <input
                    ref={todayTaskInputRef}
                    className="today-task-input"
                    type="text"
                    placeholder="快速添加任务，按 Enter 保存"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleTaskInputKeyDown}
                  />
                </div>

                <div className="today-task-footer">点击任务可编辑 · 点击优先级可切换 · 拖动可排序 · Esc 关闭 · Enter 添加任务</div>
              </div>
            </div>
        )}
      </div>
  );
}

// 模拟数据
function getMockProblems() {
  return [
    {
      id: '1',
      title: '两数之和',
      difficulty: 'Easy',
      description: '给定一个整数数组 nums 和一个整数目标值 target,请你在该数组中找出和为目标值 target 的那两个整数,并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案。但是,数组中同一个元素在答案里不能重复出现。',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: '因为 nums[0] + nums[1] == 9 ,返回 [0, 1]'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9'
      ],
      template: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // 请在这里编写你的代码\n    \n}'
    },
    {
      id: '2',
      title: '实现数组去重',
      difficulty: 'Easy',
      description: '实现一个函数,对数组进行去重,返回一个新数组。',
      examples: [
        {
          input: '[1, 2, 2, 3, 4, 4, 5]',
          output: '[1, 2, 3, 4, 5]'
        }
      ],
      template: '/**\n * @param {any[]} arr\n * @return {any[]}\n */\nfunction unique(arr) {\n    // 请在这里编写你的代码\n    \n}'
    }
  ];
}

export default App;
