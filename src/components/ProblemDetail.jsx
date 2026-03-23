import React, { useState, useEffect } from 'react';
import { useJudgeStore } from '../store/judgeStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import './ProblemDetail.css';

const SCRIPTS_KEY = 'js-oj:interviewScripts';

const readScripts = () => {
    try {
        const raw = window.localStorage.getItem(SCRIPTS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
};

const writeScripts = (scripts) => {
    try {
        window.localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
    } catch (e) { console.warn('保存面试话术失败:', e); }
};

const ProblemDetail = () => {
    const { currentProblem, reviewQueue, addToReviewQueue, getReviewStatus } = useJudgeStore();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
    const [isExamplesExpanded, setIsExamplesExpanded] = useState(true);
    const [isConstraintsExpanded, setIsConstraintsExpanded] = useState(true);
    const [isHintsExpanded, setIsHintsExpanded] = useState(true);
    const [showScriptModal, setShowScriptModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [scriptDraft, setScriptDraft] = useState('');
    const [scriptContent, setScriptContent] = useState('');

    const reviewStatus = currentProblem ? getReviewStatus('code', currentProblem.id) : 'unreviewed';
    const isInReviewQueue = currentProblem
      ? Boolean(reviewQueue?.code?.[currentProblem.id])
      : false;
    const normalizedTitle = String(currentProblem?.title || '').toLowerCase();
    const isPromiseHighlightProblem = normalizedTitle.includes('promise');

    // Load saved script when problem changes
    useEffect(() => {
        if (currentProblem) {
            const scripts = readScripts();
            setScriptContent(scripts[currentProblem.id] || '');
        }
    }, [currentProblem?.id]);

    const openScriptModal = () => {
        if (!currentProblem) return;
        const scripts = readScripts();
        const saved = scripts[currentProblem.id] || '';
        setScriptContent(saved);
        setScriptDraft(saved);
        setIsEditing(!saved);
        setShowScriptModal(true);
    };

    const handleSaveScript = () => {
        if (!currentProblem) return;
        const scripts = readScripts();
        scripts[currentProblem.id] = scriptDraft;
        writeScripts(scripts);
        setScriptContent(scriptDraft);
        setIsEditing(false);
    };

    const handleDeleteScript = () => {
        if (!currentProblem) return;
        const scripts = readScripts();
        delete scripts[currentProblem.id];
        writeScripts(scripts);
        setScriptContent('');
        setScriptDraft('');
        setIsEditing(true);
    };

    if (!currentProblem) {
        return (
            <div className="problem-detail">
                <div className="empty-state">
                    <p>请选择一道题目开始练习</p>
                </div>
            </div>
        );
    }

    return (
        <div className="problem-detail">
            <div className="problem-header">
                <h2 className="problem-title">{currentProblem.title}</h2>
                <div className="review-tools">
                    <span className={`review-status ${reviewStatus}`}>
                        {reviewStatus === 'reviewed' ? '已复习' : '未复习'}
                    </span>
                    <button
                        className={`review-btn ${isInReviewQueue ? 'in-queue' : ''}`}
                        onClick={() => addToReviewQueue('code', { id: currentProblem.id, title: currentProblem.title })}
                        disabled={isInReviewQueue}
                    >
                        {isInReviewQueue ? '已在复习队列' : '放入复习队列'}
                    </button>
                    <button
                        className={`interview-script-btn ${scriptContent ? 'has-content' : ''}`}
                        onClick={openScriptModal}
                    >
                        🎤 面试话术
                    </button>
                </div>
                <span className={`difficulty-tag ${currentProblem.difficulty?.toLowerCase()}`}>
          {currentProblem.difficulty}
        </span>
            </div>

            <div className="problem-section">
                <div className="section-header" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                    <h3>题目描述</h3>
                    <span className={`collapse-icon ${isDescriptionExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
                </div>
                {isDescriptionExpanded && (
                    <div className={`problem-description markdown-body${isPromiseHighlightProblem ? ' promise-highlight-description' : ''}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {currentProblem.description || ''}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {currentProblem.examples && currentProblem.examples.length > 0 && (
                <div className="problem-section">
                    <div className="section-header" onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}>
                        <h3>示例</h3>
                        <span className={`collapse-icon ${isExamplesExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
                    </div>
                    {isExamplesExpanded && (
                        <div>
                            {currentProblem.examples.map((example, index) => (
                                <div key={index} className="example-item">
                                    <div className="example-label">示例 {index + 1}:</div>
                                    <div className="example-content">
                                        <div className="example-io">
                                            <strong>输入:</strong>
                                            <code>{example.input}</code>
                                        </div>
                                        <div className="example-io">
                                            <strong>输出:</strong>
                                            <code>{example.output}</code>
                                        </div>
                                        {example.explanation && (
                                            <div className="example-explanation">
                                                <strong>解释:</strong>
                                                <span>{example.explanation}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {currentProblem.constraints && (
                <div className="problem-section">
                    <div className="section-header" onClick={() => setIsConstraintsExpanded(!isConstraintsExpanded)}>
                        <h3>约束条件</h3>
                        <span className={`collapse-icon ${isConstraintsExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
                    </div>
                    {isConstraintsExpanded && (
                        <ul className="constraints-list">
                            {currentProblem.constraints.map((constraint, index) => (
                                <li key={index}>{constraint}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {currentProblem.hints && currentProblem.hints.length > 0 && (
                <div className="problem-section">
                    <div className="section-header" onClick={() => setIsHintsExpanded(!isHintsExpanded)}>
                        <h3>提示</h3>
                        <span className={`collapse-icon ${isHintsExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
                    </div>
                    {isHintsExpanded && (
                        <ul className="hints-list">
                            {currentProblem.hints.map((hint, index) => (
                                <li key={index}>{hint}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {showScriptModal && (
                <div className="script-modal-overlay" onClick={() => setShowScriptModal(false)}>
                    <div className="script-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="script-modal-header">
                            <h3>🎤 面试话术 - {currentProblem.title}</h3>
                            <div className="script-modal-actions">
                                {!isEditing && scriptContent && (
                                    <>
                                        <button className="script-action-btn edit" onClick={() => { setScriptDraft(scriptContent); setIsEditing(true); }}>编辑</button>
                                        <button className="script-action-btn delete" onClick={handleDeleteScript}>删除</button>
                                    </>
                                )}
                                <button className="script-modal-close" onClick={() => setShowScriptModal(false)}>✕</button>
                            </div>
                        </div>
                        <div className="script-modal-body">
                            {isEditing ? (
                                <div className="script-editor">
                                    <textarea
                                        className="script-textarea"
                                        value={scriptDraft}
                                        onChange={(e) => setScriptDraft(e.target.value)}
                                        placeholder="在这里编写面试话术，支持 Markdown 格式..."
                                        autoFocus
                                    />
                                    <div className="script-editor-footer">
                                        <span className="script-hint">支持 Markdown 格式</span>
                                        <div className="script-editor-btns">
                                            <button className="script-action-btn cancel" onClick={() => {
                                                if (scriptContent) { setIsEditing(false); }
                                                else { setShowScriptModal(false); }
                                            }}>取消</button>
                                            <button className="script-action-btn save" onClick={handleSaveScript} disabled={!scriptDraft.trim()}>保存</button>
                                        </div>
                                    </div>
                                </div>
                            ) : scriptContent ? (
                                <div className="markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                        {scriptContent}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="script-empty">
                                    <p>暂无面试话术</p>
                                    <button className="script-action-btn save" onClick={() => setIsEditing(true)}>开始编写</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemDetail;
