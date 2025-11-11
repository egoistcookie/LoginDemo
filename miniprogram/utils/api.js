/**
 * API请求封装
 * 统一处理HTTP请求，自动添加Token，统一错误处理
 */

import { API_BASE_URL, API_TIMEOUT } from '../config/api';
import { getAccessToken, logout as authLogout } from './auth';

/**
 * 发起HTTP请求
 * @param {object} options 请求配置
 * @param {string} options.url 请求地址（相对路径）
 * @param {string} options.method 请求方法，默认GET
 * @param {object} options.data 请求数据
 * @param {object} options.header 请求头
 * @param {boolean} options.needAuth 是否需要认证，默认true
 * @returns {Promise} 请求Promise
 */
export const request = (options) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      needAuth = true,
    } = options;

    // 构建完整的请求URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header,
    };

    // 如果需要认证，添加Token
    if (needAuth) {
      const token = getAccessToken();
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`;
      }
    }

    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });

    // 发起请求
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: requestHeader,
      timeout: API_TIMEOUT,
      success: (res) => {
        wx.hideLoading();

        // HTTP状态码检查
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 检查业务状态码
          if (res.data && res.data.code === 200) {
            resolve(res.data.data);
          } else {
            // 业务错误
            const errorMsg = res.data?.message || '请求失败';
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000,
            });
            reject(new Error(errorMsg));
          }
        } else if (res.statusCode === 401) {
          // 未授权，Token过期或无效
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000,
          });
          // 清除本地认证信息
          authLogout();
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login',
          });
          reject(new Error('未授权'));
        } else {
          // 其他HTTP错误
          const errorMsg = `请求失败 (${res.statusCode})`;
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000,
          });
          reject(new Error(errorMsg));
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('请求失败:', error);
        
        let errorMsg = '网络请求失败';
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络连接';
          } else if (error.errMsg.includes('fail')) {
            errorMsg = '网络连接失败，请检查网络设置';
          }
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000,
        });
        reject(error);
      },
    });
  });
};

/**
 * GET请求
 * @param {string} url 请求地址
 * @param {object} params 请求参数
 * @param {object} options 其他选项
 * @returns {Promise}
 */
export const get = (url, params = {}, options = {}) => {
  // 将参数拼接到URL上
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return request({
    url: fullUrl,
    method: 'GET',
    ...options,
  });
};

/**
 * POST请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 其他选项
 * @returns {Promise}
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options,
  });
};

/**
 * PUT请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 其他选项
 * @returns {Promise}
 */
export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options,
  });
};

/**
 * DELETE请求
 * @param {string} url 请求地址
 * @param {object} options 其他选项
 * @returns {Promise}
 */
export const del = (url, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    ...options,
  });
};

export default {
  request,
  get,
  post,
  put,
  delete: del,
};

