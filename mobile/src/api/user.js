/**
 * 用户相关API
 */
import api from './index';

/**
 * 获取当前登录用户信息
 * @returns {Promise} 用户信息响应
 */
export const getCurrentUser = () => {
  return api.get('/users/me');
};

/**
 * 更新用户信息
 * @param {number} id 用户ID
 * @param {object} userData 用户数据
 * @returns {Promise} 响应
 */
export const updateUser = (id, userData) => {
  return api.put(`/users/${id}`, userData);
};

/**
 * 更新用户密码
 * @param {number} id 用户ID
 * @param {string} newPassword 新密码
 * @returns {Promise} 响应
 */
export const updatePassword = (id, newPassword) => {
  return api.put(`/users/${id}/password`, {newPassword});
};

