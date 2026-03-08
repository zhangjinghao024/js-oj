import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useJudgeStore } from '../store/judgeStore';
import './TestResult.css';

const getCodeTextFromPreNode = (node) => {
  const codeNode = node?.children?.find((child) => child?.tagName === 'code');
  if (!codeNode || !Array.isArray(codeNode.children)) return '';
  return codeNode.children
    .map((child) => (typeof child?.value === 'string' ? child.value : ''))
    .join('')
    .replace(/\n+$/, '')
    .trim();
};

const shouldRenderCompactCodeChip = (codeText) => {
  if (!codeText) return false;
  if (codeText.includes('\n')) return false;
  if (codeText.length > 60) return false;
  return true;
};

const TestResult = () => {
  const { judgeResult, testResults, isJudging } = useJudgeStore();

  // 🔍 调试信息
  console.log('🔍 TestResult 渲染');
  console.log('judgeResult:', judgeResult);
  console.log('judgeResult.aiAnalysis:', judgeResult?.aiAnalysis);
  console.log('judgeResult.hasAIAnalysis:', judgeResult?.hasAIAnalysis);
  console.log('是否显示 AI 分析:', !!judgeResult?.aiAnalysis);

  if (isJudging) {
    return (
        <div className="test-result">
          <div className="judging-state">
            <div className="spinner"></div>
            <p>🤖 AI 正在分析代码...</p>
          </div>
        </div>
    );
  }

  if (!judgeResult) {
    return (
        <div className="test-result">
          <div className="empty-result">
            <p>点击【提交】进行 AI 分析</p>
          </div>
        </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
      case 'passed':
        return '#52c41a';
      case 'Wrong Answer':
      case 'failed':
        return '#f5222d';
      case 'Runtime Error':
        return '#fa8c16';
      case 'Time Limit Exceeded':
        return '#faad14';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Accepted' || status === 'passed') {
      return '✓';
    } else if (status === 'Wrong Answer' || status === 'failed') {
      return '✗';
    } else {
      return '!';
    }
  };

  return (
      <div className="test-result">
        {/* 只有运行测试用例时才显示测试结果头部 */}
        {judgeResult.passedTests !== undefined && (
            <div className="result-header">
              <div
                  className="result-status"
                  style={{ color: getStatusColor(judgeResult.status) }}
              >
                <span className="status-icon">{getStatusIcon(judgeResult.status)}</span>
                <span className="status-text">{judgeResult.status}</span>
              </div>
              <div className="result-stats">
                <span>通过: {judgeResult.passedTests}/{judgeResult.totalTests}</span>
              </div>
            </div>
        )}

        {judgeResult.message && !judgeResult.aiAnalysis && (
            <div className="result-message">
              {judgeResult.message}
            </div>
        )}

        {/* AI 分析结果 */}
        {judgeResult.aiAnalysis && (
            <>
              <div className="ai-analysis">
                <div className="ai-analysis-header">
                  <span className="ai-icon">🤖</span>
                  <h4>AI 代码分析</h4>
                </div>
                <div className="ai-analysis-content">
                  <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // 自定义样式
                        h2: ({node, ...props}) => <h2 className="ai-h2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="ai-h3" {...props} />,
                        ul: ({node, ...props}) => <ul className="ai-ul" {...props} />,
                        ol: ({node, ...props}) => <ol className="ai-ol" {...props} />,
                        li: ({node, ...props}) => <li className="ai-li" {...props} />,
                        p: ({node, ...props}) => <p className="ai-p" {...props} />,
                        strong: ({node, ...props}) => <strong className="ai-strong" {...props} />,
                        pre: ({ node, children, ...props }) => {
                          const codeText = getCodeTextFromPreNode(node);
                          if (shouldRenderCompactCodeChip(codeText)) {
                            return <code className="ai-code-chip">{codeText}</code>;
                          }
                          return <pre className="ai-pre-block" {...props}>{children}</pre>;
                        },
                        code: ({node, inline, ...props}) =>
                            inline ?
                                <code className="ai-code-inline" {...props} /> :
                                <code className="ai-code-block" {...props} />
                      }}
                  >
                    {judgeResult.aiAnalysis}
                  </ReactMarkdown>
                </div>
              </div>

              {/* 通过记录 */}
              {judgeResult.record && (
                  <div className="problem-record">
                    <div className="record-item">
                      <span className="record-label">题目状态:</span>
                      <span className={`record-value ${judgeResult.record.isPassed ? 'passed' : 'not-passed'}`}>
                  {judgeResult.record.isPassed ? '✅ 已通过' : '❌ 未通过'}
                </span>
                    </div>
                    <div className="record-item">
                      <span className="record-label">通过次数:</span>
                      <span className="record-value">{judgeResult.record.passedCount} 次</span>
                    </div>
                    <div className="record-item">
                      <span className="record-label">总尝试次数:</span>
                      <span className="record-value">{judgeResult.record.totalAttempts} 次</span>
                    </div>
                  </div>
              )}
            </>
        )}

        {judgeResult.error && (
            <div className="result-error">
              <h4>错误信息:</h4>
              <pre>{judgeResult.error}</pre>
            </div>
        )}

        {testResults && testResults.length > 0 && (
            <div className="test-cases">
              <h4>测试用例结果:</h4>
              <div className="test-cases-list">
                {testResults.map((test, index) => (
                    <div
                        key={index}
                        className={`test-case-item ${test.passed ? 'passed' : 'failed'}`}
                    >
                      <div className="test-case-header">
                  <span className="test-case-icon">
                    {test.passed ? '✓' : '✗'}
                  </span>
                        <span className="test-case-title">测试用例 {index + 1}</span>
                        {test.executionTime && (
                            <span className="execution-time">{test.executionTime}ms</span>
                        )}
                      </div>

                      <div className="test-case-content">
                        <div className="test-io">
                          <strong>输入:</strong>
                          <code>{JSON.stringify(test.input)}</code>
                        </div>

                        <div className="test-io">
                          <strong>预期输出:</strong>
                          <code>{JSON.stringify(test.expected)}</code>
                        </div>

                        <div className="test-io">
                          <strong>实际输出:</strong>
                          <code className={test.passed ? 'correct' : 'incorrect'}>
                            {JSON.stringify(test.actual)}
                          </code>
                        </div>

                        {test.error && (
                            <div className="test-error">
                              <strong>错误:</strong>
                              <pre>{test.error}</pre>
                            </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  );
};

export default TestResult;
