/**
 * 本地存储工具类
 * 封装微信小程序的存储API
 */

/**
 * 同步存储数据
 * @param {string} key 存储的键名
 * @param {any} data 存储的数据
 */
export const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data);
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
};

/**
 * 同步获取数据
 * @param {string} key 存储的键名
 * @returns {any} 存储的数据，如果不存在返回null
 */
export const getStorage = (key) => {
  try {
    return wx.getStorageSync(key) || null;
  } catch (error) {
    console.error('获取数据失败:', error);
    return null;
  }
};

/**
 * 同步删除数据
 * @param {string} key 存储的键名
 */
export const removeStorage = (key) => {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    return false;
  }
};

/**
 * 清空所有存储数据
 */
export const clearStorage = () => {
  try {
    wx.clearStorageSync();
    return true;
  } catch (error) {
    console.error('清空存储失败:', error);
    return false;
  }
};

export default {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
};

