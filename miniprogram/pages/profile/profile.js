/**
 * 用户信息页面
 */

import { get } from '../../utils/api';
import { getUserInfo, logout as authLogout, isLoggedIn, saveUserInfo } from '../../utils/auth';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('用户信息页面加载');
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 检查登录状态
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login',
      });
      return;
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    // 先尝试从本地存储获取
    const localUserInfo = getUserInfo();
    if (localUserInfo) {
      this.setData({
        userInfo: localUserInfo,
        loading: false,
      });
    }

    try {
      // 从服务器获取最新用户信息
      const userInfo = await get('/users/me');
      
      // 保存到本地
      saveUserInfo(userInfo);

      this.setData({
        userInfo: userInfo,
        loading: false,
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      
      // 如果获取失败，使用本地存储的信息
      if (!this.data.userInfo) {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
        });
      }
      
      this.setData({
        loading: false,
      });
    } finally {
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除认证信息
          authLogout();
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login',
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
          });
        }
      },
    });
  },
});

