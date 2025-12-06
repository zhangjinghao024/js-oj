import axios from 'axios';

// 根据环境变量决定使用代理还是直接调用
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment
    ? 'http://localhost:5001/api'  // 开发环境直接调用后端（改成5001）
    : '/api';                       // 生产环境使用代理

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
    config => {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    error => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    response => {
      console.log('API Response:', response.status, response.config.url);
      return response;
    },
    error => {
      console.error('API Response Error:', error.response?.status, error.message);
      return Promise.reject(error);
    }
);

// 获取题目列表
export const fetchProblems = async () => {
  const response = await api.get('/problems');
  return response.data;
};

// 获取单个题目详情
export const fetchProblemDetail = async (problemId) => {
  const response = await api.get(`/problems/${problemId}`);
  return response.data;
};

// 提交代码 - 只进行 AI 分析（不运行测试用例）
export const submitCode = async (problemId, code) => {
  const response = await api.post('/analyze', {
    problemId,
    code
  });
  return response.data;
};

// 运行代码(只运行示例测试用例)
export const runCode = async (problemId, code) => {
  const response = await api.post('/run', {
    problemId,
    code
  });
  return response.data;
};

// 获取所有题目的记录
export const fetchRecords = async () => {
  const response = await api.get('/records');
  return response.data;
};

// 获取单个题目的记录
export const fetchProblemRecord = async (problemId) => {
  const response = await api.get(`/records/${problemId}`);
  return response.data;
};

// 重置题目记录
export const resetProblemRecord = async (problemId) => {
  const response = await api.delete(`/records/${problemId}`);
  return response.data;
};

// 完整判题（运行测试用例 + AI 分析）
export const fullJudge = async (problemId, code) => {
  const response = await api.post('/judge', {
    problemId,
    code
  });
  return response.data;
};

// ========== 问答题相关 API ==========

// 获取问答题列表
export const fetchQuizzes = async () => {
  const response = await api.get('/quizzes');
  return response.data;
};

// 获取单个问答题详情
export const fetchQuizDetail = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data;
};

// 提交问答题答案并获取 AI 分析
export const submitQuizAnswer = async (quizId, userAnswer) => {
  const response = await api.post('/quizzes/analyze', {
    quizId,
    userAnswer
  });
  return response.data;
};

// 语音转文字
export const speechToText = async (audioData) => {
  const response = await api.post('/speech-to-text', {
    audioData
  });
  return response.data;
};

export default api;