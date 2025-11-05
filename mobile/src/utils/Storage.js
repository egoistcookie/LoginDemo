/**
 * 本地存储工具类
 * 封装AsyncStorage，提供简单的存储接口
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  /**
   * 存储数据
   * @param {string} key 键名
   * @param {any} value 值（会自动序列化为JSON）
   */
  static async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  /**
   * 获取数据
   * @param {string} key 键名
   * @returns {Promise<any>} 解析后的值
   */
  static async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  /**
   * 存储字符串（不进行JSON序列化）
   * @param {string} key 键名
   * @param {string} value 字符串值
   */
  static async setString(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setString error:', error);
      throw error;
    }
  }

  /**
   * 获取字符串
   * @param {string} key 键名
   * @returns {Promise<string|null>} 字符串值
   */
  static async getString(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getString error:', error);
      return null;
    }
  }

  /**
   * 删除数据
   * @param {string} key 键名
   */
  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  static async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  /**
   * 获取所有键名
   * @returns {Promise<string[]>} 键名数组
   */
  static async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }
}

export default Storage;

