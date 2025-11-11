/**
 * 小程序入口文件
 */

import { isLoggedIn } from './utils/auth';

App({
  /**
   * 小程序初始化
   */
  onLaunch() {
    console.log('小程序启动');
    
    // 检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 小程序显示
   */
  onShow() {
    console.log('小程序显示');
  },

  /**
   * 小程序隐藏
   */
  onHide() {
    console.log('小程序隐藏');
  },

  /**
   * 检查登录状态
   * 如果未登录，跳转到登录页
   */
  checkLoginStatus() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentRoute = currentPage ? currentPage.route : '';

    // 如果当前不在登录页且未登录，跳转到登录页
    if (currentRoute !== 'pages/login/login' && !isLoggedIn()) {
      wx.reLaunch({
        url: '/pages/login/login',
      });
    }
  },

  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
  },
});

