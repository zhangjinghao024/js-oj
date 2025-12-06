import React, { useEffect, useState } from 'react';
import { useJudgeStore } from './store/judgeStore';
import { fetchProblems, submitCode, runCode, fetchRecords } from './api/judgeApi';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import CodeEditor from './components/CodeEditor';
import TestResult from './components/TestResult';
import './App.css';

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
    updateProblemRecord
  } = useJudgeStore();

  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // 更新记录到 store
      if (result.record) {
        updateProblemRecord(currentProblem.id, result.record);
      }

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
  const handleReset = () => {
    if (confirm('确定要重置代码吗?')) {
      setUserCode(currentProblem?.template || '');
      clearResult();
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
        <header className="app-header">
          <h1>JavaScript 手写题判题系统</h1>
          {error && <div className="error-banner">{error}</div>}
        </header>

        <div className="app-container">
          {/* 左侧: 题目列表 */}
          <aside className="sidebar">
            <ProblemList />
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
            </div>

            <div className="tab-content">
              {activeTab === 'description' ? (
                  <ProblemDetail />
              ) : (
                  <TestResult />
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
                      className="btn btn-primary"
                      onClick={handleRunCode}
                      title="运行示例测试用例"
                  >
                    运行示例
                  </button>
                  <button
                      className="btn btn-success"
                      onClick={handleSubmit}
                      title="提交代码给 AI 分析"
                  >
                    🤖 AI 分析
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