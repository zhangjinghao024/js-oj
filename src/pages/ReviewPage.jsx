import React, { useMemo, useState } from 'react';
import { useJudgeStore } from '../store/judgeStore';
import './ReviewPage.css';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const DAILY_LIMIT = 10;

const getDayStart = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
};

const getStatus = (entry) => {
  if (!entry?.lastReviewedAt) return 'unreviewed';
  return Date.now() - entry.lastReviewedAt < THREE_DAYS_MS ? 'reviewed' : 'unreviewed';
};

const sortEntries = (a, b) => {
  const statusA = getStatus(a);
  const statusB = getStatus(b);
  if (statusA !== statusB) return statusA === 'unreviewed' ? -1 : 1;
  const timeA = a.lastReviewedAt || 0;
  const timeB = b.lastReviewedAt || 0;
  if (timeA !== timeB) return timeA - timeB;
  return (a.addedAt || 0) - (b.addedAt || 0);
};

const ReviewSection = ({
  title,
  items,
  visibleCount,
  onMore,
  onMarkReviewed,
  renderExtra,
  onGoReview,
  showGoReview
}) => {
  const visibleItems = items.slice(0, visibleCount);

  return (
    <section className="review-card">
      <div className="review-card-header">
        <div>
          <h3>{title}</h3>
          <p>今日默认展示 {DAILY_LIMIT} 道，可追加查看</p>
        </div>
        {renderExtra}
      </div>

      {items.length === 0 ? (
        <div className="review-empty">暂无复习内容</div>
      ) : (
        <ul className="review-list">
          {visibleItems.map((item) => {
            const status = getStatus(item);
            return (
              <li key={item.id} className="review-item">
                <div>
                  <div className="review-title">{item.title}</div>
                  {item.link && (
                    <a
                      className="review-link"
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      打开链接
                    </a>
                  )}
                </div>
                <div className="review-actions">
                  <span className={`review-status ${status}`}>
                    {status === 'reviewed' ? '已复习' : '未复习'}
                  </span>
                  {showGoReview && (
                    <button
                      className="review-btn review-btn-ghost"
                      onClick={() => onGoReview(item.id)}
                    >
                      去复习
                    </button>
                  )}
                  <button
                    className="review-btn"
                    onClick={() => onMarkReviewed(item.id)}
                  >
                    标记已复习
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > visibleCount && (
        <button className="review-more" onClick={onMore}>
          追加 10 题
        </button>
      )}
    </section>
  );
};

const ReviewPage = ({ onGoCode, onGoQuiz }) => {
  const { reviewQueue, markReviewed, addToReviewQueue } = useJudgeStore();
  const [codeCount, setCodeCount] = useState(DAILY_LIMIT);
  const [quizCount, setQuizCount] = useState(DAILY_LIMIT);
  const [leetcodeCount, setLeetcodeCount] = useState(DAILY_LIMIT);

  const todayStart = getDayStart(new Date());
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const yesterdayHistory = useMemo(() => {
    const result = [];
    const pushItems = (type, items) => {
      items.forEach((item) => {
        if (item.lastReviewedAt && item.lastReviewedAt >= yesterdayStart && item.lastReviewedAt < todayStart) {
          result.push({ ...item, type });
        }
      });
    };
    pushItems('手写题', Object.values(reviewQueue?.code || {}));
    pushItems('八股文', Object.values(reviewQueue?.quiz || {}));
    pushItems('LeetCode', Object.values(reviewQueue?.leetcode || {}));
    return result.sort((a, b) => (b.lastReviewedAt || 0) - (a.lastReviewedAt || 0));
  }, [reviewQueue, yesterdayStart, todayStart]);

  const codeItems = useMemo(() => {
    const items = Object.values(reviewQueue?.code || {});
    return items.sort(sortEntries);
  }, [reviewQueue]);

  const quizItems = useMemo(() => {
    const items = Object.values(reviewQueue?.quiz || {});
    return items.sort(sortEntries);
  }, [reviewQueue]);

  const leetcodeItems = useMemo(() => {
    const items = Object.values(reviewQueue?.leetcode || {});
    return items.sort(sortEntries);
  }, [reviewQueue]);

  const handleAddLeetCodePlan = () => {
    addToReviewQueue('leetcode', {
      id: 'top-100-liked',
      title: 'LeetCode 热题 100（Top 100 Liked）',
      link: 'https://leetcode.cn/studyplan/top-100-liked/'
    });
  };

  return (
    <div className="review-page">
      <header className="review-header">
        <div>
          <h2>📚 今日复习</h2>
          <p>按照复习队列与最近复习时间自动排序。</p>
        </div>
      </header>

      <section className="review-card">
        <div className="review-card-header">
          <div>
            <h3>昨日复习历史</h3>
            <p>仅展示昨日已复习的内容</p>
          </div>
        </div>
        {yesterdayHistory.length === 0 ? (
          <div className="review-empty">昨日没有复习记录</div>
        ) : (
          <ul className="review-list">
            {yesterdayHistory.map((item) => (
              <li key={`${item.type}-${item.id}`} className="review-item">
                <div>
                  <div className="review-title">{item.title}</div>
                  <span className="review-type">{item.type}</span>
                </div>
                <div className="review-actions">
                  <span className="review-status reviewed">已复习</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReviewSection
        title="手写题"
        items={codeItems}
        visibleCount={codeCount}
        onMore={() => setCodeCount((prev) => prev + DAILY_LIMIT)}
        onMarkReviewed={(id) => markReviewed('code', id)}
        onGoReview={onGoCode}
        showGoReview
      />

      <ReviewSection
        title="八股文"
        items={quizItems}
        visibleCount={quizCount}
        onMore={() => setQuizCount((prev) => prev + DAILY_LIMIT)}
        onMarkReviewed={(id) => markReviewed('quiz', id)}
        onGoReview={onGoQuiz}
        showGoReview
      />

      <ReviewSection
        title="LeetCode"
        items={leetcodeItems}
        visibleCount={leetcodeCount}
        onMore={() => setLeetcodeCount((prev) => prev + DAILY_LIMIT)}
        onMarkReviewed={(id) => markReviewed('leetcode', id)}
        renderExtra={(
          <button className="review-btn" onClick={handleAddLeetCodePlan}>
            加入学习计划
          </button>
        )}
      />
    </div>
  );
};

export default ReviewPage;
