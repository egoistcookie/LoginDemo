/**
 * 认证服务
 * 封装认证相关的业务逻辑
 */
import * as authApi from '../api/auth';
import TokenManager from './TokenManager';
import Storage from '../utils/Storage';
import {STORAGE_KEYS} from '../config/api';

class AuthService {
  /**
   * 用户名密码登录
   * @param {string} username 用户名
   * @param {string} password 密码
   * @param {string} captchaKey 验证码Key（可选）
   * @param {string} captchaCode 验证码（可选）
   * @returns {Promise<object>} 登录结果，包含userInfo和tokens
   */
  static async login(username, password, captchaKey, captchaCode) {
    try {
      const response = await authApi.login(username, password, captchaKey, captchaCode);
      
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
   * 手机验证码登录
   * @param {string} phone 手机号
   * @param {string} code 验证码
   * @returns {Promise<object>} 登录结果
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
   * 登出
   * @returns {Promise<void>}
   */
  static async logout() {
    try {
      // 调用登出API
      await authApi.logout();
    } catch (error) {
      console.error('登出API调用失败:', error);
      // 即使API调用失败，也要清除本地数据
    } finally {
      // 清除本地Token和用户信息
      await TokenManager.clearTokens();
    }
  }

  /**
   * 检查是否已登录
   * @returns {Promise<boolean>}
   */
  static async isAuthenticated() {
    return await TokenManager.hasToken();
  }

  /**
   * 获取保存的用户信息
   * @returns {Promise<object|null>}
   */
  static async getStoredUserInfo() {
    return await Storage.getItem(STORAGE_KEYS.USER_INFO);
  }
}

export default AuthService;

