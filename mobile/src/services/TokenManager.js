/**
 * Token管理服务
 * 负责Token的存储、获取、刷新和清除
 */
import Storage from '../utils/Storage';
import {STORAGE_KEYS} from '../config/api';

class TokenManager {
  /**
   * 保存Token
   * @param {string} accessToken 访问令牌
   * @param {string} refreshToken 刷新令牌
   */
  static async saveTokens(accessToken, refreshToken) {
    try {
      await Storage.setString(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await Storage.setString(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('保存Token失败:', error);
      throw error;
    }
  }

  /**
   * 获取访问令牌
   * @returns {Promise<string|null>} 访问令牌
   */
  static async getAccessToken() {
    try {
      return await Storage.getString(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('获取AccessToken失败:', error);
      return null;
    }
  }

  /**
   * 获取刷新令牌
   * @returns {Promise<string|null>} 刷新令牌
   */
  static async getRefreshToken() {
    try {
      return await Storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('获取RefreshToken失败:', error);
      return null;
    }
  }

  /**
   * 清除所有Token
   */
  static async clearTokens() {
    try {
      await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.USER_INFO);
    } catch (error) {
      console.error('清除Token失败:', error);
    }
  }

  /**
   * 刷新Token
   * @returns {Promise<boolean>} 是否刷新成功
   */
  static async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      // 使用动态导入避免循环依赖
      const {default: api} = await import('../api/index');
      const response = await api.post('/auth/refresh', null, {
        params: {refreshToken},
      });

      if (response.data.code === 200) {
        const {accessToken, refreshToken: newRefreshToken} = response.data.data;
        await this.saveTokens(accessToken, newRefreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('刷新Token失败:', error);
      // 刷新失败，清除所有Token
      await this.clearTokens();
      return false;
    }
  }

  /**
   * 检查是否有有效的Token
   * @returns {Promise<boolean>} 是否有Token
   */
  static async hasToken() {
    const token = await this.getAccessToken();
    return token != null && token.length > 0;
  }
}

export default TokenManager;

