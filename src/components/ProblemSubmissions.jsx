// src/components/ProblemSubmissions.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import './ProblemSubmissions.css';

const API_BASE_URL = 'http://localhost:5001/api';
const FALLBACK_CODE = '// 本次提交未记录代码';

const getCodeLineCount = (code) => {
    if (!code || typeof code !== 'string') return 1;
    return code.split(/\r?\n/).length;
};

const getCodeEditorHeight = (lineCount) => {
    const estimated = lineCount * 22 + 28;
    const clamped = Math.max(220, Math.min(520, estimated));
    return `${clamped}px`;
};

const ProblemSubmissions = ({ problemId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const copyTimerRef = useRef(null);

    // 加载该题目的提交历史
    useEffect(() => {
        if (!problemId) return;

        loadSubmissions();
    }, [problemId]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                window.clearTimeout(copyTimerRef.current);
                copyTimerRef.current = null;
            }
        };
    }, []);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/submissions`, {
                params: {
                    problemId,
                    limit: 10  // 只显示最近 10 次
                }
            });

            setSubmissions(response.data.data || []);
        } catch (error) {
            console.error('加载提交历史失败:', error);
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    const getResultContent = (submission) => {
        if (!submission) return null;
        const raw =
            submission.resultContent ??
            submission.result_content ??
            submission.aiAnalysis ??
            submission.ai_analysis ??
            submission.result ??
            submission.message ??
            submission.output;

        if (raw === undefined || raw === null) return null;
        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            return trimmed.length > 0 ? trimmed : null;
        }
        try {
            return JSON.stringify(raw, null, 2);
        } catch {
            return String(raw);
        }
    };

    // 查看详情
    const viewDetails = async (submission) => {
        setSelectedSubmission(submission);
        if (!submission?.id) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/submissions/${submission.id}`);
            const detail = response.data?.data || response.data;
            if (detail) {
                setSelectedSubmission({ ...submission, ...detail });
            }
        } catch (error) {
            console.error('获取提交详情失败:', error);
        }
    };

    // 关闭详情
    const closeDetails = () => {
        setSelectedSubmission(null);
        setCodeCopied(false);
        if (copyTimerRef.current) {
            window.clearTimeout(copyTimerRef.current);
            copyTimerRef.current = null;
        }
    };

    // 格式化时间
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        // 小于 1 分钟
        if (diff < 60000) {
            return '刚刚';
        }
        // 小于 1 小时
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} 分钟前`;
        }
        // 小于 1 天
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)} 小时前`;
        }
        // 其他
        return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    // 获取状态标签
    const getStatusBadge = (status) => {
        if (status === 'accepted') {
            return <span className="status-badge success">✅ 通过</span>;
        } else if (status === 'wrong_answer') {
            return <span className="status-badge error">❌ 错误</span>;
        } else if (status === 'runtime_error') {
            return <span className="status-badge warning">⚠️ 运行错误</span>;
        } else if (status === 'timeout') {
            return <span className="status-badge warning">⏱️ 超时</span>;
        } else {
            return <span className="status-badge default">{status}</span>;
        }
    };

    const handleCopyCode = async (code) => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            setCodeCopied(true);
            if (copyTimerRef.current) {
                window.clearTimeout(copyTimerRef.current);
            }
            copyTimerRef.current = window.setTimeout(() => {
                setCodeCopied(false);
                copyTimerRef.current = null;
            }, 1200);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    if (loading) {
        return <div className="problem-submissions-loading">加载提交历史...</div>;
    }

    if (submissions.length === 0) {
        return (
            <div className="problem-submissions-empty">
                <p>📝 还没有提交记录</p>
                <p className="hint">提交代码后，历史记录会显示在这里</p>
            </div>
        );
    }

    return (
        <div className="problem-submissions">
            <div className="submissions-header">
                <h3>📊 提交历史</h3>
                <button className="btn-refresh" onClick={loadSubmissions}>
                    🔄 刷新
                </button>
            </div>

            <div className="submissions-list">
                {submissions.map((submission, index) => (
                    <div key={submission.id} className="submission-item">
                        <div className="submission-info">
                            <div className="submission-number">#{submissions.length - index}</div>
                            <div className="submission-status">
                                {getStatusBadge(submission.status)}
                            </div>
                            <div className="submission-result">
                                {submission.passedTests !== undefined && (
                                    <span className="test-result">
                                        {submission.passedTests}/{submission.totalTests} 通过
                                    </span>
                                )}
                                {submission.executionTime && (
                                    <span className="execution-time">
                                        {submission.executionTime}ms
                                    </span>
                                )}
                            </div>
                            <div className="submission-time">
                                {formatDate(submission.submittedAt)}
                            </div>
                            <button
                                className="btn-view-detail"
                                onClick={() => viewDetails(submission)}
                            >
                                查看代码
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 详情弹窗 */}
            {selectedSubmission && (() => {
                const resultContent = getResultContent(selectedSubmission);
                const submittedCode = selectedSubmission.submittedCode || FALLBACK_CODE;
                const codeLineCount = getCodeLineCount(submittedCode);
                const codeEditorHeight = getCodeEditorHeight(codeLineCount);
                return (
                <div className="modal-overlay" onClick={closeDetails}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>提交详情</h3>
                            <button onClick={closeDetails} className="btn-close">✕</button>
                        </div>

                        <div className="modal-body">
                            {/* 状态信息 */}
                            <div className="detail-section">
                                <div className="detail-row">
                                    <span className="detail-label">状态：</span>
                                    {getStatusBadge(selectedSubmission.status)}
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">通过测试：</span>
                                    <span>{selectedSubmission.passedTests}/{selectedSubmission.totalTests}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">执行时间：</span>
                                    <span>{selectedSubmission.executionTime}ms</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">提交时间：</span>
                                    <span>{new Date(selectedSubmission.submittedAt).toLocaleString('zh-CN')}</span>
                                </div>
                            </div>

                            {/* 提交代码 */}
                            <div className="detail-section">
                                <div className="detail-header">
                                    <h4>提交代码</h4>
                                    <button
                                        className="btn-copy"
                                        onClick={() => handleCopyCode(selectedSubmission.submittedCode)}
                                    >
                                        {codeCopied ? '复制成功' : '一键复制'}
                                    </button>
                                </div>
                                <div className="submission-code-panel">
                                    <div className="submission-code-toolbar">
                                        <span className="submission-code-lang">JavaScript</span>
                                        <span className="submission-code-meta">{codeLineCount} 行代码</span>
                                    </div>
                                    <div className="submission-code-editor">
                                        <Editor
                                            height={codeEditorHeight}
                                            language="javascript"
                                            value={submittedCode}
                                            theme="vs-dark"
                                            options={{
                                                readOnly: true,
                                                minimap: { enabled: false },
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false,
                                                wordWrap: 'on',
                                                fontSize: 13,
                                                lineHeight: 22,
                                                tabSize: 2,
                                                automaticLayout: true,
                                                padding: { top: 12, bottom: 12 },
                                                folding: true,
                                                renderValidationDecorations: 'off'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 结果内容 */}
                            {resultContent && (
                                <div className="detail-section">
                                    <h4>结果内容</h4>
                                    <pre className="result-box">
                                        {resultContent}
                                    </pre>
                                </div>
                            )}

                            {/* 错误信息 */}
                            {selectedSubmission.errorMessage && (
                                <div className="detail-section">
                                    <h4>错误信息</h4>
                                    <div className="error-box">
                                        {selectedSubmission.errorMessage}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                );
            })()}
        </div>
    );
};

export default ProblemSubmissions;
