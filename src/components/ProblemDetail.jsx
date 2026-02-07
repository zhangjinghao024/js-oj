import React, { useState } from 'react';
import { useJudgeStore } from '../store/judgeStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import './ProblemDetail.css';

const ProblemDetail = () => {
    const { currentProblem, reviewQueue, addToReviewQueue, getReviewStatus } = useJudgeStore();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
    const [isExamplesExpanded, setIsExamplesExpanded] = useState(true);
    const [isConstraintsExpanded, setIsConstraintsExpanded] = useState(true);
    const [isHintsExpanded, setIsHintsExpanded] = useState(true);

    const reviewStatus = currentProblem ? getReviewStatus('code', currentProblem.id) : 'unreviewed';
    const isInReviewQueue = currentProblem
      ? Boolean(reviewQueue?.code?.[currentProblem.id])
      : false;

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
                    <div className="problem-description markdown-body">
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
        </div>
    );
};

export default ProblemDetail;
