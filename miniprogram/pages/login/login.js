/**
 * 登录页面
 */

import { post } from '../../utils/api';
import { saveToken, saveUserInfo, isLoggedIn } from '../../utils/auth';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
    loading: false,
    errorMessage: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('登录页面加载');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 如果已经登录，跳转到用户信息页
    if (isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/profile/profile',
      });
    }
  },

  /**
   * 用户名输入
   */
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value,
      errorMessage: '',
    });
  },

  /**
   * 密码输入
   */
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
      errorMessage: '',
    });
  },

  /**
   * 登录
   */
  async handleLogin() {
    const { username, password } = this.data;

    // 验证输入
    if (!username || !username.trim()) {
      this.setData({
        errorMessage: '请输入用户名',
      });
      wx.showToast({
        title: '请输入用户名',
        icon: 'none',
      });
      return;
    }

    if (!password || !password.trim()) {
      this.setData({
        errorMessage: '请输入密码',
      });
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
      });
      return;
    }

    // 设置加载状态
    this.setData({
      loading: true,
      errorMessage: '',
    });

    try {
      // 调用登录接口
      const response = await post('/auth/login', {
        username: username.trim(),
        password: password.trim(),
      }, {
        needAuth: false, // 登录接口不需要认证
      });

      // 保存Token和用户信息
      if (response.accessToken) {
        saveToken(response.accessToken, response.refreshToken);
      }
      if (response.user) {
        saveUserInfo(response.user);
      }

      // 登录成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500,
      }); 

      // 跳转到用户信息页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/profile/profile',
        });
      }, 1500);
    } catch (error) {
      // 提取错误信息，优先使用从API返回的详细错误信息
      let errorMessage = '登录失败，请重试';
      
      // 优先使用 error.message（API返回的详细错误信息）
      if (error?.message) {
        errorMessage = error.message;
      } 
      // 如果响应数据中有message字段，也尝试使用
      else if (error?.responseData?.message) {
        errorMessage = error.responseData.message;
      }
      // 兼容其他错误格式
      else if (error?.errMsg) {
        errorMessage = error.errMsg;
      } 
      else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('登录失败:', error);
      console.error('错误详情:', {
        message: error?.message,
        responseData: error?.responseData,
        statusCode: error?.statusCode,
        errMsg: error?.errMsg,
      });
      
      this.setData({
        loading: false,
        errorMessage: errorMessage,
      });
    }
  },
});

