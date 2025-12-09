// src/pages/SubmissionsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubmissionsPage.css';

const API_BASE_URL = 'http://localhost:5000/api';

const SubmissionsPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        problemType: 'all',  // 'all', 'code', 'quiz'
        status: 'all'        // 'all', 'accepted', 'wrong_answer'
    });
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // 加载提交历史
    useEffect(() => {
        loadSubmissions();
    }, [filter]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const params = {};

            if (filter.problemType !== 'all') {
                params.problemType = filter.problemType;
            }

            const response = await axios.get(`${API_BASE_URL}/submissions`, { params });

            let data = response.data.data || [];

            // 前端过滤状态
            if (filter.status !== 'all') {
                data = data.filter(s => s.status === filter.status);
            }

            setSubmissions(data);
        } catch (error) {
            console.error('加载提交历史失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 查看详情
    const viewDetails = async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/submissions/${id}`);
            setSelectedSubmission(response.data.data);
        } catch (error) {
            console.error('获取提交详情失败:', error);
        }
    };

    // 关闭详情
    const closeDetails = () => {
        setSelectedSubmission(null);
    };

    // 格式化时间
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN');
    };

    // 获取状态标签
    const getStatusBadge = (status, isCorrect) => {
        if (status === 'accepted' || isCorrect === 1) {
            return <span className="badge badge-success">✅ 通过</span>;
        } else if (status === 'wrong_answer' || isCorrect === 0) {
            return <span className="badge badge-error">❌ 错误</span>;
        } else if (status === 'runtime_error') {
            return <span className="badge badge-warning">⚠️ 运行错误</span>;
        } else if (status === 'timeout') {
            return <span className="badge badge-warning">⏱️ 超时</span>;
        } else {
            return <span className="badge badge-default">{status}</span>;
        }
    };

    return (
        <div className="submissions-page">
            <div className="submissions-header">
                <h1>📝 提交历史</h1>

                {/* 筛选器 */}
                <div className="filters">
                    <select
                        value={filter.problemType}
                        onChange={(e) => setFilter({...filter, problemType: e.target.value})}
                        className="filter-select"
                    >
                        <option value="all">全部类型</option>
                        <option value="code">💻 代码题</option>
                        <option value="quiz">📋 问答题</option>
                    </select>

                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({...filter, status: e.target.value})}
                        className="filter-select"
                    >
                        <option value="all">全部状态</option>
                        <option value="accepted">✅ 通过</option>
                        <option value="correct">✅ 正确</option>
                        <option value="wrong_answer">❌ 错误</option>
                        <option value="incorrect">❌ 不正确</option>
                    </select>

                    <button onClick={loadSubmissions} className="btn-refresh">
                        🔄 刷新
                    </button>
                </div>
            </div>

            {/* 加载中 */}
            {loading && (
                <div className="loading">加载中...</div>
            )}

            {/* 提交列表 */}
            {!loading && submissions.length === 0 && (
                <div className="empty-state">
                    <p>暂无提交记录</p>
                </div>
            )}

            {!loading && submissions.length > 0 && (
                <div className="submissions-list">
                    <table className="submissions-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>题目</th>
                            <th>类型</th>
                            <th>状态</th>
                            <th>语言</th>
                            <th>通过率</th>
                            <th>提交时间</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {submissions.map((submission) => (
                            <tr key={submission.id}>
                                <td>#{submission.id}</td>
                                <td className="problem-title">{submission.problem_title}</td>
                                <td>
                                    {submission.problem_type === 'code' ? '💻 代码' : '📋 问答'}
                                </td>
                                <td>{getStatusBadge(submission.status, submission.is_correct)}</td>
                                <td>{submission.language || '-'}</td>
                                <td>
                                    {submission.problem_type === 'code' && submission.total_tests ? (
                                        <span>{submission.passed_tests}/{submission.total_tests}</span>
                                    ) : submission.score ? (
                                        <span>{submission.score}分</span>
                                    ) : '-'}
                                </td>
                                <td>{formatDate(submission.submitted_at)}</td>
                                <td>
                                    <button
                                        onClick={() => viewDetails(submission.id)}
                                        className="btn-view"
                                    >
                                        查看
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 详情弹窗 */}
            {selectedSubmission && (
                <div className="modal-overlay" onClick={closeDetails}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>提交详情 #{selectedSubmission.id}</h2>
                            <button onClick={closeDetails} className="btn-close">✕</button>
                        </div>

                        <div className="modal-body">
                            {/* 基本信息 */}
                            <div className="detail-section">
                                <h3>📋 基本信息</h3>
                                <div className="detail-grid">
                                    <div><strong>题目:</strong> {selectedSubmission.problem_title}</div>
                                    <div><strong>类型:</strong> {selectedSubmission.problem_type === 'code' ? '代码题' : '问答题'}</div>
                                    <div><strong>状态:</strong> {getStatusBadge(selectedSubmission.status, selectedSubmission.is_correct)}</div>
                                    <div><strong>提交时间:</strong> {formatDate(selectedSubmission.submitted_at)}</div>
                                </div>
                            </div>

                            {/* 代码题详情 */}
                            {selectedSubmission.problem_type === 'code' && (
                                <>
                                    <div className="detail-section">
                                        <h3>💻 提交代码</h3>
                                        <pre className="code-block">
                                            <code>{selectedSubmission.submitted_code}</code>
                                        </pre>
                                    </div>

                                    <div className="detail-section">
                                        <h3>📊 执行结果</h3>
                                        <div className="detail-grid">
                                            <div><strong>通过测试:</strong> {selectedSubmission.passed_tests}/{selectedSubmission.total_tests}</div>
                                            <div><strong>执行时间:</strong> {selectedSubmission.execution_time}ms</div>
                                            <div><strong>内存使用:</strong> {(selectedSubmission.memory_used / 1024).toFixed(2)}KB</div>
                                        </div>
                                        {selectedSubmission.error_message && (
                                            <div className="error-message">
                                                <strong>错误信息:</strong>
                                                <pre>{selectedSubmission.error_message}</pre>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 问答题详情 */}
                            {selectedSubmission.problem_type === 'quiz' && (
                                <>
                                    <div className="detail-section">
                                        <h3>✍️ 提交答案</h3>
                                        <div className="answer-box">
                                            {selectedSubmission.submitted_answer}
                                        </div>
                                    </div>

                                    {selectedSubmission.ai_analysis && (
                                        <div className="detail-section">
                                            <h3>🤖 AI 分析</h3>
                                            <div className="ai-analysis">
                                                {selectedSubmission.ai_analysis}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionsPage;
