/**
 * Token管理服务类
 * 
 * 这个类负责管理应用的认证令牌（Token），包括：
 * - 访问令牌（Access Token）：用于API请求的身份验证
 * - 刷新令牌（Refresh Token）：用于刷新过期的访问令牌
 * 
 * 主要功能：
 * 1. 保存Token到本地存储
 * 2. 从本地存储获取Token
 * 3. 刷新过期的Token
 * 4. 清除所有Token（退出登录时）
 * 5. 检查是否有有效的Token
 * 
 * 这是一个静态类，所有方法都是静态方法，可以直接通过类名调用。
 * 例如：TokenManager.saveTokens(accessToken, refreshToken)
 */

// 导入本地存储工具类
// Storage: 封装了AsyncStorage，提供简单的存储接口
import Storage from '../utils/Storage';

// 导入存储键名常量
// STORAGE_KEYS: 定义了本地存储中使用的键名
// 例如：ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO
import {STORAGE_KEYS} from '../config/api';

/**
 * TokenManager类 - Token管理服务
 * 
 * 这是一个静态类，所有方法都是静态方法。
 * 静态方法可以直接通过类名调用，不需要创建类的实例。
 */
class TokenManager {
  /**
   * 保存Token到本地存储
   * 
   * 这个方法将访问令牌和刷新令牌保存到本地存储中。
   * Token会持久化保存，即使应用关闭后重新打开也能读取。
   * 
   * @param {string} accessToken - 访问令牌，用于API请求的身份验证
   * @param {string} refreshToken - 刷新令牌，用于刷新过期的访问令牌
   * @returns {Promise<void>} 无返回值
   * @throws {Error} 如果保存失败会抛出错误
   */
  static async saveTokens(accessToken, refreshToken) {
    try {
      // 使用Storage.setString保存访问令牌
      // setString不会进行JSON序列化，直接保存字符串
      // 因为Token本身就是字符串，不需要序列化
      await Storage.setString(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      
      // 使用Storage.setString保存刷新令牌
      await Storage.setString(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      // 如果保存失败，记录错误并重新抛出
      // 这样调用者可以知道保存失败了
      console.error('保存Token失败:', error);
      throw error;
    }
  }

  /**
   * 获取访问令牌
   * 
   * 这个方法从本地存储中读取访问令牌。
   * 访问令牌用于API请求的身份验证，通常有较短的过期时间。
   * 
   * @returns {Promise<string|null>} 
   *   - string: 访问令牌（如果存在）
   *   - null: 本地没有保存访问令牌
   */
  static async getAccessToken() {
    try {
      // 从本地存储中读取访问令牌
      // Storage.getString直接返回字符串，不需要反序列化
      return await Storage.getString(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      // 如果读取失败，记录错误并返回null
      // 返回null而不是抛出错误，使调用者更容易处理
      console.error('获取AccessToken失败:', error);
      return null;
    }
  }

  /**
   * 获取刷新令牌
   * 
   * 这个方法从本地存储中读取刷新令牌。
   * 刷新令牌用于刷新过期的访问令牌，通常有较长的过期时间。
   * 
   * @returns {Promise<string|null>} 
   *   - string: 刷新令牌（如果存在）
   *   - null: 本地没有保存刷新令牌
   */
  static async getRefreshToken() {
    try {
      // 从本地存储中读取刷新令牌
      return await Storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      // 如果读取失败，记录错误并返回null
      console.error('获取RefreshToken失败:', error);
      return null;
    }
  }

  /**
   * 清除所有Token和用户信息
   * 
   * 这个方法会删除本地存储中的所有认证相关数据：
   * - 访问令牌
   * - 刷新令牌
   * - 用户信息
   * 
   * 通常在用户退出登录时调用。
   * 
   * @returns {Promise<void>} 无返回值
   */
  static async clearTokens() {
    try {
      // 删除访问令牌
      await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // 删除刷新令牌
      await Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      // 删除用户信息
      await Storage.removeItem(STORAGE_KEYS.USER_INFO);
    } catch (error) {
      // 如果清除失败，记录错误但不抛出异常
      // 这样即使清除失败也不会影响退出登录流程
      console.error('清除Token失败:', error);
    }
  }

  /**
   * 刷新访问令牌
   * 
   * 当访问令牌过期时（通常是401错误），可以使用刷新令牌获取新的访问令牌。
   * 
   * 工作流程：
   * 1. 从本地存储获取刷新令牌
   * 2. 调用API刷新Token
   * 3. 如果成功，保存新的Token
   * 4. 如果失败，清除所有Token（需要重新登录）
   * 
   * 注意：使用动态导入（import）来避免循环依赖问题。
   * TokenManager → api/index → TokenManager（循环依赖）
   * 
   * @returns {Promise<boolean>} 
   *   - true: Token刷新成功
   *   - false: Token刷新失败（需要重新登录）
   */
  static async refreshAccessToken() {
    try {
      // 获取刷新令牌
      const refreshToken = await this.getRefreshToken();
      
      // 如果没有刷新令牌，无法刷新，返回false
      if (!refreshToken) {
        return false;
      }

      // 使用动态导入避免循环依赖
      // 动态导入会在运行时加载模块，而不是在编译时
      // 这样可以避免 TokenManager → api/index → TokenManager 的循环依赖
      const {default: api} = await import('../api/index');
      
      // 调用刷新Token的API
      // 将refreshToken作为查询参数传递
      const response = await api.post('/auth/refresh', null, {
        params: {refreshToken},
      });

      // 检查响应状态码
      // 200表示刷新成功
      if (response.data.code === 200) {
        // 从响应中提取新的Token
        // 解构赋值：从response.data.data中提取accessToken和refreshToken
        // refreshToken: newRefreshToken 表示将refreshToken重命名为newRefreshToken
        const {accessToken, refreshToken: newRefreshToken} = response.data.data;
        
        // 保存新的Token
        await this.saveTokens(accessToken, newRefreshToken);
        
        // 返回true表示刷新成功
        return true;
      }

      // 如果API返回的状态码不是200，返回false
      return false;
    } catch (error) {
      // 如果刷新过程中出错，记录错误
      console.error('刷新Token失败:', error);
      
      // 刷新失败，清除所有Token
      // 这样用户需要重新登录
      await this.clearTokens();
      
      // 返回false表示刷新失败
      return false;
    }
  }

  /**
   * 检查是否有有效的Token
   * 
   * 这个方法通过检查本地存储中是否有访问令牌来判断用户是否已登录。
   * 
   * 注意：这个方法只检查本地是否有Token，不验证Token是否有效。
   * Token的有效性验证由服务器在API请求时进行。
   * 
   * @returns {Promise<boolean>} 
   *   - true: 本地有Token（可能已登录）
   *   - false: 本地没有Token（未登录）
   */
  static async hasToken() {
    // 获取访问令牌
    const token = await this.getAccessToken();
    
    // 检查Token是否存在且不为空
    // token != null: 检查token不是null也不是undefined
    // token.length > 0: 检查token不是空字符串
    return token != null && token.length > 0;
  }
}

// 导出TokenManager类，供其他文件导入使用
export default TokenManager;
