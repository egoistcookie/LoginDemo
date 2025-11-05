/**
 * API客户端
 * 配置axios实例，处理请求拦截和响应拦截
 */
import axios from 'axios';
import {API_BASE_URL, API_TIMEOUT} from '../config/api';
import TokenManager from '../services/TokenManager';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加Token
apiClient.interceptors.request.use(
  async config => {
    // 获取Token并添加到请求头
    const token = await TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 响应拦截器：处理Token过期和错误
apiClient.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 如果是401错误且未重试过，尝试刷新Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新Token
        const refreshed = await TokenManager.refreshAccessToken();
        if (refreshed) {
          // Token刷新成功，重新发送原请求
          const newToken = await TokenManager.getAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Token刷新失败，跳转到登录页
        console.error('Token刷新失败:', refreshError);
        // 这里可以通过事件总线或导航服务跳转到登录页
        return Promise.reject(error);
      }
    }

    // 处理其他错误
    if (error.response) {
      // 服务器返回了错误响应
      const {status, data} = error.response;
      const errorMessage = data?.message || `请求失败: ${status}`;
      error.message = errorMessage;
    } else if (error.request) {
      // 请求已发出但没有收到响应
      error.message = '网络错误，请检查网络连接';
    } else {
      // 请求配置出错
      error.message = error.message || '请求失败';
    }

    return Promise.reject(error);
  },
);

export default apiClient;

