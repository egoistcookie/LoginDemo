/**
 * 认证相关工具类
 * 处理Token和用户信息的存储与读取
 */

import { setStorage, getStorage, removeStorage } from './storage';
import { STORAGE_KEYS } from '../config/api';

/**
 * 保存Token
 * @param {string} accessToken 访问令牌
 * @param {string} refreshToken 刷新令牌
 */
export const saveToken = (accessToken, refreshToken) => {
  setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
};

/**
 * 获取访问令牌
 * @returns {string|null} 访问令牌
 */
export const getAccessToken = () => {
  return getStorage(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * 获取刷新令牌
 * @returns {string|null} 刷新令牌
 */
export const getRefreshToken = () => {
  return getStorage(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * 清除Token
 */
export const clearToken = () => {
  removeStorage(STORAGE_KEYS.ACCESS_TOKEN);
  removeStorage(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * 保存用户信息
 * @param {object} userInfo 用户信息对象
 */
export const saveUserInfo = (userInfo) => {
  setStorage(STORAGE_KEYS.USER_INFO, userInfo);
};

/**
 * 获取用户信息
 * @returns {object|null} 用户信息对象
 */
export const getUserInfo = () => {
  return getStorage(STORAGE_KEYS.USER_INFO);
};

/**
 * 清除用户信息
 */
export const clearUserInfo = () => {
  removeStorage(STORAGE_KEYS.USER_INFO);
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  const token = getAccessToken();
  return token !== null && token !== undefined;
};

/**
 * 退出登录，清除所有认证信息
 */
export const logout = () => {
  clearToken();
  clearUserInfo();
};

export default {
  saveToken,
  getAccessToken,
  getRefreshToken,
  clearToken,
  saveUserInfo,
  getUserInfo,
  clearUserInfo,
  isLoggedIn,
  logout,
};

