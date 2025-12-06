import { create } from 'zustand';

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
  setProblems: (problems) => set({ problems, currentProblem: problems[0] || null }),

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
  selectProblem: (index) => set((state) => ({
    currentProblemIndex: index,
    currentProblem: state.problems[index],
    userCode: '',
    judgeResult: null,
    testResults: []
  })),

  // 更新用户代码
  setUserCode: (code) => set({ userCode: code }),

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