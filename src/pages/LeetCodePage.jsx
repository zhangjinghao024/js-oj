import React, { useMemo, useState } from 'react';
import './LeetCodePage.css';

const initialRecords = [];

function normalizeLink(link) {
  const trimmed = link.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const LeetCodePage = () => {
  const [records, setRecords] = useState(initialRecords);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [filter, setFilter] = useState('');

  const filteredRecords = useMemo(() => {
    const keyword = filter.trim().toLowerCase();
    if (!keyword) return records;
    return records.filter((item) => item.title.toLowerCase().includes(keyword));
  }, [filter, records]);

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const normalizedLink = normalizeLink(link);
    if (!trimmedTitle || !normalizedLink) return;

    setRecords((prev) => [
      {
        id: Date.now(),
        title: trimmedTitle,
        link: normalizedLink
      },
      ...prev
    ]);
    setTitle('');
    setLink('');
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h2>✅ LeetCode 记录</h2>
          <p>简单记录做过的题目与链接，方便回顾。</p>
        </div>
        <input
          className="page-search"
          type="text"
          placeholder="搜索题目..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </header>

      <section className="card">
        <h3>添加记录</h3>
        <form className="record-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="题目名称，比如 Two Sum"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="题目链接，比如 leetcode.com/problems/two-sum"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button type="submit" className="primary-btn">添加</button>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>记录列表</h3>
          <span className="record-count">共 {filteredRecords.length} 题</span>
        </div>
        {filteredRecords.length === 0 ? (
          <div className="empty-state">暂无记录，先从第一题开始吧。</div>
        ) : (
          <ul className="record-list">
            {filteredRecords.map((item) => (
              <li key={item.id} className="record-item">
                <span className="record-title">{item.title}</span>
                <a
                  className="record-link"
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  打开链接
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default LeetCodePage;
