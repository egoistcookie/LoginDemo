/**
 * 认证服务类
 * 
 * 这个类封装了所有与用户认证相关的业务逻辑，包括：
 * - 用户名密码登录
 * - 手机验证码登录
 * - 退出登录
 * - 检查登录状态
 * - 获取用户信息
 * 
 * 这是一个静态类，所有方法都是静态方法，可以直接通过类名调用，无需实例化。
 * 例如：AuthService.login(username, password)
 */

// 导入认证相关的API函数
// * as authApi: 导入auth.js中导出的所有函数，使用authApi作为命名空间
// 这样可以避免命名冲突，例如：authApi.login()
import * as authApi from '../api/auth';

// 导入Token管理服务
// TokenManager: 负责Token的存储、获取、刷新和清除
import TokenManager from './TokenManager';

// 导入本地存储工具类
// Storage: 封装了AsyncStorage，提供简单的存储接口
import Storage from '../utils/Storage';

// 导入存储键名常量
// STORAGE_KEYS: 定义了本地存储中使用的键名，如ACCESS_TOKEN、REFRESH_TOKEN等
import {STORAGE_KEYS} from '../config/api';

/**
 * AuthService类 - 认证服务
 * 
 * 这是一个静态类，所有方法都是静态方法。
 * 静态方法可以直接通过类名调用，不需要创建类的实例。
 */
class AuthService {
  /**
   * 用户名密码登录
   * @param {string} username 用户名
   * @param {string} password 密码
   * @param {string} captchaKey 验证码Key（可选）
   * @param {string} captchaCode 验证码（可选）
   * @returns {Promise<object>} 登录结果，包含userInfo和tokens
   */
  /**
   * 用户名密码登录
   * 
   * 这个静态方法处理用户名密码登录的完整流程：
   * 1. 调用API进行登录验证
   * 2. 如果登录成功，保存Token和用户信息到本地存储
   * 3. 返回登录结果
   * 
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} [captchaKey] - 验证码Key（可选参数）
   * @param {string} [captchaCode] - 验证码（可选参数）
   * @returns {Promise<object>} 登录结果对象
   *   - success: boolean - 是否登录成功
   *   - user: object - 用户信息（成功时）
   *   - accessToken: string - 访问令牌（成功时）
   *   - refreshToken: string - 刷新令牌（成功时）
   *   - message: string - 错误消息（失败时）
   */
  static async login(username, password, captchaKey, captchaCode) {
    try {
      // 调用登录API
      // authApi.login是异步函数，需要使用await等待响应
      const response = await authApi.login(username, password, captchaKey, captchaCode);
      
      // 检查响应状态码
      // 200表示登录成功
      if (response.data.code === 200) {
        // 解构赋值：从响应数据中提取Token和用户信息
        // response.data.data包含：accessToken, refreshToken, user
        const {accessToken, refreshToken, user} = response.data.data;
        
        // 保存Token到本地存储
        // TokenManager.saveTokens会将Token保存到AsyncStorage中
        await TokenManager.saveTokens(accessToken, refreshToken);
        
        // 保存用户信息到本地存储（如果存在）
        // user对象包含用户的基本信息（id, username, email等）
        if (user) {
          // Storage.setItem会将对象序列化为JSON字符串后存储
          await Storage.setItem(STORAGE_KEYS.USER_INFO, user);
        }
        
        // 返回成功结果
        return {
          success: true,
          user, // 用户信息
          accessToken, // 访问令牌
          refreshToken, // 刷新令牌
        };
      }
      
      // 如果API返回的状态码不是200，返回失败结果
      return {
        success: false,
        // 使用API返回的错误消息，如果没有则使用默认消息
        message: response.data.message || '登录失败',
      };
    } catch (error) {
      // 如果API调用失败（网络错误、超时等），捕获异常并返回失败结果
      return {
        success: false,
        // 使用错误对象的message属性，如果没有则使用默认消息
        message: error.message || '登录失败，请稍后重试',
      };
    }
  }

  /**
   * 手机验证码登录
   * 
   * 这个静态方法处理手机验证码登录的完整流程：
   * 1. 调用API进行手机号+验证码登录验证
   * 2. 如果登录成功，保存Token和用户信息到本地存储
   * 3. 返回登录结果
   * 
   * 工作流程与login方法类似，只是使用的API不同。
   * 
   * @param {string} phone - 手机号（11位数字）
   * @param {string} code - 短信验证码（通常是6位数字）
   * @returns {Promise<object>} 登录结果对象
   *   - success: boolean - 是否登录成功
   *   - user: object - 用户信息（成功时）
   *   - accessToken: string - 访问令牌（成功时）
   *   - refreshToken: string - 刷新令牌（成功时）
   *   - message: string - 错误消息（失败时）
   */
  static async loginByPhone(phone, code) {
    try {
      const response = await authApi.loginByPhone(phone, code);
      
      if (response.data.code === 200) {
        const {accessToken, refreshToken, user} = response.data.data;
        
        // 保存Token
        await TokenManager.saveTokens(accessToken, refreshToken);
        
        // 保存用户信息
        if (user) {
          await Storage.setItem(STORAGE_KEYS.USER_INFO, user);
        }
        
        return {
          success: true,
          user,
          accessToken,
          refreshToken,
        };
      }
      
      return {
        success: false,
        message: response.data.message || '登录失败',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败，请稍后重试',
      };
    }
  }

  /**
   * 退出登录
   * 
   * 这个静态方法处理用户退出登录的流程：
   * 1. 调用服务器API通知服务器用户退出（可选，即使失败也不影响）
   * 2. 清除本地存储的Token和用户信息
   * 
   * 注意：即使服务器API调用失败，也会清除本地数据，确保用户能够退出登录。
   * 
   * @returns {Promise<void>} 无返回值
   */
  static async logout() {
    try {
      // 调用登出API通知服务器
      // 这个API调用是可选的，即使失败也不影响本地退出登录
      await authApi.logout();
    } catch (error) {
      // 如果API调用失败，记录错误但不抛出异常
      // 这样即使服务器不可用，用户也能正常退出登录
      console.error('登出API调用失败:', error);
      // 即使API调用失败，也要清除本地数据
    } finally {
      // finally块中的代码无论成功或失败都会执行
      // 清除本地存储的Token和用户信息
      // TokenManager.clearTokens会删除ACCESS_TOKEN、REFRESH_TOKEN和USER_INFO
      await TokenManager.clearTokens();
    }
  }

  /**
   * 检查用户是否已登录
   * 
   * 这个静态方法通过检查本地存储中是否有有效的访问令牌来判断用户是否已登录。
   * 
   * 工作原理：
   * - 调用TokenManager.hasToken()检查是否有Token
   * - 如果有Token且不为空，返回true
   * - 如果没有Token或Token为空，返回false
   * 
   * 注意：这个方法只检查本地是否有Token，不验证Token是否有效。
   * Token的有效性验证由服务器在API请求时进行。
   * 
   * @returns {Promise<boolean>} 
   *   - true: 用户已登录（本地有Token）
   *   - false: 用户未登录（本地没有Token）
   */
  static async isAuthenticated() {
    // 委托给TokenManager检查是否有Token
    return await TokenManager.hasToken();
  }

  /**
   * 获取本地保存的用户信息
   * 
   * 这个静态方法从本地存储中读取用户信息。
   * 用户信息是在登录成功时保存的。
   * 
   * 注意：这个方法返回的是本地存储的用户信息，可能与服务器上的信息不同步。
   * 如果需要最新的用户信息，应该调用API获取。
   * 
   * @returns {Promise<object|null>} 
   *   - object: 用户信息对象（包含id, username, email, phone等）
   *   - null: 本地没有保存用户信息
   */
  static async getStoredUserInfo() {
    // 从本地存储中读取用户信息
    // Storage.getItem会自动将JSON字符串反序列化为对象
    return await Storage.getItem(STORAGE_KEYS.USER_INFO);
  }
}

export default AuthService;

