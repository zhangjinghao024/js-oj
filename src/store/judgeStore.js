import { create } from 'zustand';

const LAST_PROBLEM_ID_KEY = 'js-oj:lastProblemId';
const CODE_DRAFTS_KEY = 'js-oj:codeDrafts';

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
