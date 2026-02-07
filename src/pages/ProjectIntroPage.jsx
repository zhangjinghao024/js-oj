import React from 'react';
import './ProjectIntroPage.css';

const ProjectIntroPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h2>📌 项目介绍</h2>
          <p>这里先放一个轻量的介绍区，后续再完善功能。</p>
        </div>
      </header>

      <section className="card intro-hero">
        <h3>JavaScript 手写题判题系统</h3>
        <p>
          一个用于练习前端手写题与八股文的个人项目，支持代码编辑、运行和提交结果展示。
        </p>
        <div className="hero-tags">
          <span>React</span>
          <span>Vite</span>
          <span>Zustand</span>
          <span>Node.js</span>
        </div>
      </section>

      <section className="card">
        <h3>模块一览</h3>
        <div className="module-grid">
          <div className="module-item">
            <h4>手写题</h4>
            <p>在线代码编辑与判题，支持示例运行与完整提交。</p>
          </div>
          <div className="module-item">
            <h4>八股文</h4>
            <p>前端知识点问答整理，支持记录参考答案。</p>
          </div>
          <div className="module-item">
            <h4>LeetCode 记录</h4>
            <p>轻量记录已完成题目与链接，方便复习。</p>
          </div>
          <div className="module-item">
            <h4>项目介绍</h4>
            <p>项目背景与规划入口。</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>待完善</h3>
        <ul className="todo-list">
          <li>补充项目目标与里程碑</li>
          <li>展示技术架构图与数据流</li>
          <li>接入部署地址与截图</li>
        </ul>
      </section>
    </div>
  );
};

export default ProjectIntroPage;
