// src/api/submissionApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * 获取提交历史
 */
export const getSubmissions = async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/submissions`, { params });
    return response.data;
};

/**
 * 获取单个提交详情
 */
export const getSubmissionById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/submissions/${id}`);
    return response.data;
};

/**
 * 获取题目统计
 */
export const getProblemStats = async (problemId) => {
    const response = await axios.get(`${API_BASE_URL}/problems/${problemId}/stats`);
    return response.data;
};

/**
 * 获取用户统计
 */
export const getUserStats = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/stats`);
    return response.data;
};

/**
 * 获取最近提交
 */
export const getRecentSubmissions = async (limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/submissions/recent`, {
        params: { limit }
    });
    return response.data;
};

/**
 * 删除提交记录
 */
export const deleteSubmission = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/submissions/${id}`);
    return response.data;
};
