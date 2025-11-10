/**
 * API客户端配置文件
 * 
 * 这个文件创建并配置了axios实例，用于发送HTTP请求。
 * 
 * 主要功能：
 * 1. 创建axios实例，配置baseURL和timeout
 * 2. 请求拦截器：自动在请求头中添加Token
 * 3. 响应拦截器：自动处理Token过期和错误响应
 * 
 * 工作流程：
 * 1. 发送请求 → 请求拦截器添加Token → 发送到服务器
 * 2. 收到响应 → 响应拦截器处理错误 → 返回给调用者
 * 3. 如果Token过期（401）→ 自动刷新Token → 重新发送原请求
 */

// 导入axios库
// axios: 流行的JavaScript HTTP客户端库，用于发送HTTP请求
import axios from 'axios';

// 导入API配置
// API_BASE_URL: API的基础URL，根据环境自动选择（开发/测试/生产）
// API_TIMEOUT: API请求的超时时间（毫秒）
import {API_BASE_URL, API_TIMEOUT} from '../config/api';

// 导入Token管理服务
// TokenManager: 负责Token的存储、获取和刷新
import TokenManager from '../services/TokenManager';

/**
 * 创建axios实例
 * 
 * axios.create() 创建一个新的axios实例，可以独立配置。
 * 这样可以有多个axios实例，每个实例有不同的配置。
 * 
 * 配置说明：
 * - baseURL: 所有请求的基础URL，后续请求会自动拼接这个URL
 * - timeout: 请求超时时间（毫秒），超过这个时间没有响应会报错
 * - headers: 默认请求头，所有请求都会包含这些头部信息
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL, // API基础URL，例如：'http://10.0.2.2:8080/api'
  timeout: API_TIMEOUT, // 超时时间，例如：30000毫秒（30秒）
  headers: {
    'Content-Type': 'application/json', // 请求体格式为JSON
  },
});

/**
 * 请求拦截器
 * 
 * 请求拦截器会在请求发送到服务器之前执行。
 * 这里用于自动在请求头中添加Token。
 * 
 * 工作流程：
 * 1. 每次发送请求前，从本地存储获取Token
 * 2. 如果Token存在，添加到请求头的Authorization字段
 * 3. 返回配置对象，继续发送请求
 * 
 * 格式：Authorization: Bearer <token>
 */
apiClient.interceptors.request.use(
  /**
   * 请求成功时的处理函数
   * 
   * @param {object} config - axios请求配置对象
   * @returns {Promise<object>} 修改后的配置对象
   */
  async config => {
    // 从本地存储获取访问令牌
    // TokenManager.getAccessToken是异步函数，需要使用await
    const token = await TokenManager.getAccessToken();
    
    // 如果Token存在，添加到请求头
    if (token) {
      // 设置Authorization请求头
      // Bearer是OAuth 2.0标准的Token类型标识
      // 格式：Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 返回配置对象，axios会使用这个配置发送请求
    return config;
  },
  /**
   * 请求失败时的处理函数
   * 
   * @param {Error} error - 错误对象
   * @returns {Promise<Error>} 拒绝的Promise
   */
  error => {
    // 如果请求配置出错，直接拒绝Promise
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 
 * 响应拦截器会在收到服务器响应后执行。
 * 这里用于：
 * 1. 处理Token过期（401错误）
 * 2. 自动刷新Token并重新发送请求
 * 3. 统一处理错误响应
 */
apiClient.interceptors.response.use(
  /**
   * 响应成功时的处理函数
   * 
   * @param {object} response - axios响应对象
   * @returns {object} 响应对象
   */
  response => {
    // 如果响应成功，直接返回响应对象
    // 不做任何处理，让调用者自己处理响应数据
    return response;
  },
  /**
   * 响应失败时的处理函数
   * 
   * @param {Error} error - axios错误对象
   * @returns {Promise<object|Error>} 
   *   - 如果Token刷新成功：返回重新发送请求的响应
   *   - 如果Token刷新失败：返回拒绝的Promise
   */
  async error => {
    // 保存原始请求配置
    // 如果Token刷新成功，需要重新发送这个请求
    const originalRequest = error.config;

    // 检查是否是401错误（未授权，通常是Token过期）
    // 并且这个请求还没有重试过（避免无限循环）
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 标记这个请求已经重试过
      // 这样可以避免在刷新Token失败时再次尝试刷新，导致无限循环
      originalRequest._retry = true;

      try {
        // 尝试刷新Token
        // TokenManager.refreshAccessToken会调用刷新Token的API
        const refreshed = await TokenManager.refreshAccessToken();
        
        // 如果Token刷新成功
        if (refreshed) {
          // 获取新的访问令牌
          const newToken = await TokenManager.getAccessToken();
          
          // 更新原始请求的Authorization头，使用新的Token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // 重新发送原始请求
          // apiClient(originalRequest) 等同于 apiClient.request(originalRequest)
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 如果Token刷新失败，记录错误
        console.error('Token刷新失败:', refreshError);
        
        // 这里可以通过事件总线或导航服务跳转到登录页
        // 但为了解耦，这里只是记录错误，让调用者处理
        
        // 返回拒绝的Promise，让调用者知道请求失败
        return Promise.reject(error);
      }
    }

    // 处理其他类型的错误（非401错误，或Token刷新失败）
    if (error.response) {
      // 服务器返回了错误响应（有状态码）
      // 解构赋值：从error.response中提取status和data
      const {status, data} = error.response;
      
      // 设置错误消息
      // 优先使用服务器返回的错误消息，如果没有则使用默认消息
      const errorMessage = data?.message || `请求失败: ${status}`;
      error.message = errorMessage;
    } else if (error.request) {
      // 请求已发出但没有收到响应（网络问题）
      error.message = '网络错误，请检查网络连接';
    } else {
      // 请求配置出错（在发送请求之前就出错了）
      error.message = error.message || '请求失败';
    }

    // 返回拒绝的Promise，让调用者处理错误
    return Promise.reject(error);
  },
);

// 导出API客户端实例，供其他文件导入使用
// 其他文件可以通过 import api from './api/index' 来使用
export default apiClient;
