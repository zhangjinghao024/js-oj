import { create } from 'zustand';

const LAST_PROBLEM_ID_KEY = 'js-oj:lastProblemId';
const CODE_DRAFTS_KEY = 'js-oj:codeDrafts';
const REVIEW_QUEUE_KEY = 'js-oj:reviewQueue';
const DAILY_ATTEMPTS_KEY = 'js-oj:dailyAttempts';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const readLastProblemId = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_PROBLEM_ID_KEY);
  } catch (err) {
    console.warn('读取上次题目失败:', err);
    return null;
  }
};

const writeLastProblemId = (problemId) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_PROBLEM_ID_KEY, problemId);
  } catch (err) {
    console.warn('保存上次题目失败:', err);
  }
};

const readCodeDrafts = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CODE_DRAFTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('读取代码草稿失败:', err);
    return {};
  }
};

const writeCodeDrafts = (drafts) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CODE_DRAFTS_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.warn('保存代码草稿失败:', err);
  }
};

const readReviewQueue = () => {
  if (typeof window === 'undefined') {
    return { code: {}, quiz: {}, leetcode: {} };
  }
  try {
    const raw = window.localStorage.getItem(REVIEW_QUEUE_KEY);
    if (!raw) return { code: {}, quiz: {}, leetcode: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { code: {}, quiz: {}, leetcode: {} };
    }
    return {
      code: parsed.code || {},
      quiz: parsed.quiz || {},
      leetcode: parsed.leetcode || {}
    };
  } catch (err) {
    console.warn('读取复习队列失败:', err);
    return { code: {}, quiz: {}, leetcode: {} };
  }
};

const writeReviewQueue = (queue) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('保存复习队列失败:', err);
  }
};

const readDailyAttempts = () => {
  if (typeof window === 'undefined') {
    return { code: {}, quiz: {} };
  }
  try {
    const raw = window.localStorage.getItem(DAILY_ATTEMPTS_KEY);
    if (!raw) return { code: {}, quiz: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { code: {}, quiz: {} };
    }
    return {
      code: parsed.code || {},
      quiz: parsed.quiz || {}
    };
  } catch (err) {
    console.warn('读取今日进度失败:', err);
    return { code: {}, quiz: {} };
  }
};

const writeDailyAttempts = (attempts) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DAILY_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (err) {
    console.warn('保存今日进度失败:', err);
  }
};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getReviewStatusFromEntry = (entry) => {
  if (!entry?.lastReviewedAt) return 'unreviewed';
  return Date.now() - entry.lastReviewedAt < THREE_DAYS_MS ? 'reviewed' : 'unreviewed';
};

const getDraftForId = (problemId) => {
  if (!problemId) return null;
  const drafts = readCodeDrafts();
  return Object.prototype.hasOwnProperty.call(drafts, problemId) ? drafts[problemId] : null;
};

const saveDraftForId = (problemId, code) => {
  if (!problemId) return;
  const drafts = readCodeDrafts();
  drafts[problemId] = code;
  writeCodeDrafts(drafts);
};

export const useJudgeStore = create((set, get) => ({
  // 题目列表
  problems: [],
  currentProblem: null,
  currentProblemIndex: 0,

  // 用户代码
  userCode: '',

  // 判题结果
  judgeResult: null,
  isJudging: false,

  // 测试用例结果
  testResults: [],

  // 题目记录
  records: {},

  // 复习队列
  reviewQueue: readReviewQueue(),

  // 今日尝试记录
  dailyAttempts: readDailyAttempts(),

  // 设置题目列表
  setProblems: (problems) => {
    const lastProblemId = readLastProblemId();
    const lastIndex = lastProblemId
      ? problems.findIndex((problem) => problem.id === lastProblemId)
      : -1;
    const currentProblemIndex = lastIndex >= 0 ? lastIndex : 0;
    const currentProblem = problems[currentProblemIndex] || null;
    const draft = currentProblem ? getDraftForId(currentProblem.id) : null;
    const userCode = draft !== null ? draft : (currentProblem?.template || '');

    set({
      problems,
      currentProblemIndex,
      currentProblem,
      userCode,
      judgeResult: null,
      testResults: []
    });
  },

  // 设置记录
  setRecords: (records) => set({ records }),

  // 更新单个题目的记录
  updateProblemRecord: (problemId, record) => set((state) => ({
    records: {
      ...state.records,
      [problemId]: record
    }
  })),

  // 放入复习队列
  addToReviewQueue: (type, item) => set((state) => {
    const queue = state.reviewQueue || { code: {}, quiz: {}, leetcode: {} };
    const bucket = queue[type] || {};
    const existing = bucket[item.id];
    const nextEntry = {
      id: item.id,
      title: item.title,
      link: item.link,
      addedAt: existing?.addedAt || Date.now(),
      lastReviewedAt: existing?.lastReviewedAt || null
    };
    const nextQueue = {
      ...queue,
      [type]: {
        ...bucket,
        [item.id]: nextEntry
      }
    };
    writeReviewQueue(nextQueue);
    return { reviewQueue: nextQueue };
  }),

  // 标记已复习
  markReviewed: (type, id) => set((state) => {
    const queue = state.reviewQueue || { code: {}, quiz: {}, leetcode: {} };
    const bucket = queue[type] || {};
    const existing = bucket[id];
    if (!existing) return { reviewQueue: queue };
    const nextQueue = {
      ...queue,
      [type]: {
        ...bucket,
        [id]: {
          ...existing,
          lastReviewedAt: Date.now()
        }
      }
    };
    writeReviewQueue(nextQueue);
    return { reviewQueue: nextQueue };
  }),

  // 获取复习状态
  getReviewStatus: (type, id) => {
    const queue = get().reviewQueue || { code: {}, quiz: {}, leetcode: {} };
    const entry = queue[type]?.[id];
    return getReviewStatusFromEntry(entry);
  },

  // 记录今日提交
  logDailyAttempt: (type, item) => set((state) => {
    const todayKey = getTodayKey();
    const attempts = state.dailyAttempts || { code: {}, quiz: {} };
    const bucket = attempts[type] || {};
    const todayBucket = bucket[todayKey] || {};
    const nextBucket = {
      ...todayBucket,
      [item.id]: { id: item.id, title: item.title }
    };
    const nextAttempts = {
      ...attempts,
      [type]: {
        ...bucket,
        [todayKey]: nextBucket
      }
    };
    writeDailyAttempts(nextAttempts);
    return { dailyAttempts: nextAttempts };
  }),

  // 选择题目
  selectProblem: (index) => set((state) => {
    const current = state.currentProblem;
    if (current) {
      saveDraftForId(current.id, state.userCode);
    }

    const selected = state.problems[index];
    if (selected) {
      writeLastProblemId(selected.id);
    }

    const draft = selected ? getDraftForId(selected.id) : null;
    const userCode = draft !== null ? draft : (selected?.template || '');

    return {
      currentProblemIndex: index,
      currentProblem: selected || null,
      userCode,
      judgeResult: null,
      testResults: []
    };
  }),

  // 更新用户代码
  setUserCode: (code) => set({ userCode: code }),

  // 持久化代码草稿
  saveDraft: (problemId, code) => saveDraftForId(problemId, code),

  // 设置判题中状态
  setJudging: (isJudging) => set({ isJudging }),

  // 设置判题结果
  setJudgeResult: (result) => set({
    judgeResult: result,
    testResults: result?.testResults || []
  }),

  // 清空结果
  clearResult: () => set({ judgeResult: null, testResults: [] })
}));
