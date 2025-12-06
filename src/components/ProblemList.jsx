import React from 'react';
import { useJudgeStore } from '../store/judgeStore';
import './ProblemList.css';

const ProblemList = () => {
    const { problems, currentProblemIndex, selectProblem, records } = useJudgeStore();

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

    return (
        <div className="problem-list">
            <h3 className="problem-list-title">题目列表</h3>
            <div className="problem-items">
                {problems.map((problem, index) => {
                    const record = records[problem.id];
                    const isPassed = record?.isPassed || false;
                    const passedCount = record?.passedCount || 0;
                    const totalAttempts = record?.totalAttempts || 0;
                    const hasAttempted = totalAttempts > 0;

                    return (
                        <div
                            key={problem.id}
                            className={`problem-item ${currentProblemIndex === index ? 'active' : ''} ${isPassed ? 'passed' : hasAttempted ? 'attempted' : ''}`}
                            onClick={() => selectProblem(index)}
                        >
                            <div className="problem-info">
                                <span className="problem-number">#{index + 1}</span>
                                <span className="problem-name">{problem.title}</span>

                                {/* 已通过 */}
                                {isPassed && (
                                    <span className="problem-status passed-status" title={`已通过 ${passedCount} 次 / 共尝试 ${totalAttempts} 次`}>
                    ✅ {passedCount}
                  </span>
                                )}

                                {/* 尝试过但未通过 */}
                                {!isPassed && hasAttempted && (
                                    <span className="problem-status attempted-status" title={`尝试 ${totalAttempts} 次，尚未通过`}>
                    ❌ {totalAttempts}
                  </span>
                                )}
                            </div>

                            <span
                                className="problem-difficulty"
                                style={{ color: getDifficultyColor(problem.difficulty) }}
                            >
                {problem.difficulty}
              </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProblemList;