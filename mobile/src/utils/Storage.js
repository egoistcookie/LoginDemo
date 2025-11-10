/**
 * 本地存储工具类
 * 
 * 这个类封装了AsyncStorage，提供了更简单易用的存储接口。
 * AsyncStorage是React Native提供的异步本地存储API，类似于Web的localStorage。
 * 
 * 主要功能：
 * 1. 存储和获取对象（自动JSON序列化/反序列化）
 * 2. 存储和获取字符串（不进行序列化）
 * 3. 删除指定键的数据
 * 4. 清空所有数据
 * 5. 获取所有键名
 * 
 * 这是一个静态类，所有方法都是静态方法，可以直接通过类名调用。
 * 例如：Storage.setItem('key', value)
 */

// 导入AsyncStorage
// AsyncStorage: React Native提供的异步本地存储API
// 数据会持久化保存在设备上，即使应用关闭后重新打开也能读取
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage类 - 本地存储工具
 * 
 * 这是一个静态类，所有方法都是静态方法。
 * 静态方法可以直接通过类名调用，不需要创建类的实例。
 */
class Storage {
  /**
   * 存储数据（对象）
   * 
   * 这个方法会将值序列化为JSON字符串后存储。
   * 适用于存储对象、数组等复杂数据类型。
   * 
   * 工作原理：
   * 1. 使用JSON.stringify将值转换为JSON字符串
   * 2. 将JSON字符串存储到AsyncStorage
   * 
   * @param {string} key - 存储的键名
   * @param {any} value - 要存储的值（可以是对象、数组、字符串等）
   * @returns {Promise<void>} 无返回值
   * @throws {Error} 如果存储失败会抛出错误
   */
  static async setItem(key, value) {
    try {
      // 使用JSON.stringify将值序列化为JSON字符串
      // JSON.stringify可以将JavaScript对象、数组等转换为JSON字符串
      // 例如：{name: 'John'} → '{"name":"John"}'
      const jsonValue = JSON.stringify(value);
      
      // 将JSON字符串存储到AsyncStorage
      // AsyncStorage.setItem是异步操作，需要使用await等待完成
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      // 如果存储失败，记录错误并重新抛出
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  /**
   * 获取数据（对象）
   * 
   * 这个方法会从AsyncStorage读取JSON字符串，然后反序列化为JavaScript对象。
   * 适用于读取之前用setItem存储的对象、数组等复杂数据。
   * 
   * 工作原理：
   * 1. 从AsyncStorage读取JSON字符串
   * 2. 使用JSON.parse将JSON字符串转换为JavaScript对象
   * 
   * @param {string} key - 存储的键名
   * @returns {Promise<any>} 
   *   - 解析后的值（对象、数组等）
   *   - null: 如果键不存在或读取失败
   */
  static async getItem(key) {
    try {
      // 从AsyncStorage读取JSON字符串
      const jsonValue = await AsyncStorage.getItem(key);
      
      // 如果jsonValue不为null，则解析为JavaScript对象
      // jsonValue != null: 检查jsonValue不是null也不是undefined
      // JSON.parse: 将JSON字符串转换为JavaScript对象
      // 例如：'{"name":"John"}' → {name: 'John'}
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      // 如果读取或解析失败，记录错误并返回null
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  /**
   * 存储字符串（不进行JSON序列化）
   * 
   * 这个方法直接将字符串存储到AsyncStorage，不进行JSON序列化。
   * 适用于存储Token、简单的字符串值等。
   * 
   * 注意：如果存储的是对象，应该使用setItem而不是setString。
   * 
   * @param {string} key - 存储的键名
   * @param {string} value - 要存储的字符串值
   * @returns {Promise<void>} 无返回值
   * @throws {Error} 如果存储失败会抛出错误
   */
  static async setString(key, value) {
    try {
      // 直接将字符串存储到AsyncStorage，不进行序列化
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // 如果存储失败，记录错误并重新抛出
      console.error('Storage setString error:', error);
      throw error;
    }
  }

  /**
   * 获取字符串
   * 
   * 这个方法直接从AsyncStorage读取字符串，不进行JSON反序列化。
   * 适用于读取Token、简单的字符串值等。
   * 
   * 注意：如果读取的是对象，应该使用getItem而不是getString。
   * 
   * @param {string} key - 存储的键名
   * @returns {Promise<string|null>} 
   *   - string: 字符串值（如果存在）
   *   - null: 如果键不存在或读取失败
   */
  static async getString(key) {
    try {
      // 直接从AsyncStorage读取字符串
      return await AsyncStorage.getItem(key);
    } catch (error) {
      // 如果读取失败，记录错误并返回null
      console.error('Storage getString error:', error);
      return null;
    }
  }

  /**
   * 删除指定键的数据
   * 
   * 这个方法会删除AsyncStorage中指定键的数据。
   * 
   * @param {string} key - 要删除的键名
   * @returns {Promise<void>} 无返回值
   * @throws {Error} 如果删除失败会抛出错误
   */
  static async removeItem(key) {
    try {
      // 从AsyncStorage删除指定键的数据
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // 如果删除失败，记录错误并重新抛出
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   * 
   * 这个方法会删除AsyncStorage中的所有数据。
   * 
   * 警告：这个操作不可逆，会删除所有存储的数据！
   * 通常只在以下情况使用：
   * - 用户退出登录
   * - 应用卸载前的清理
   * - 调试和测试
   * 
   * @returns {Promise<void>} 无返回值
   * @throws {Error} 如果清空失败会抛出错误
   */
  static async clear() {
    try {
      // 清空AsyncStorage中的所有数据
      await AsyncStorage.clear();
    } catch (error) {
      // 如果清空失败，记录错误并重新抛出
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  /**
   * 获取所有键名
   * 
   * 这个方法返回AsyncStorage中所有存储的键名数组。
   * 可以用于调试、数据迁移等场景。
   * 
   * @returns {Promise<string[]>} 键名数组
   *   如果获取失败，返回空数组[]
   */
  static async getAllKeys() {
    try {
      // 获取AsyncStorage中所有存储的键名
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      // 如果获取失败，记录错误并返回空数组
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }
}

// 导出Storage类，供其他文件导入使用
export default Storage;
