/**
 * API配置文件
 * 根据环境切换不同的API地址
 */

// 开发环境API地址配置
// 注意：微信小程序中，localhost需要使用电脑的局域网IP地址
// 获取IP方法：Windows: ipconfig，Mac/Linux: ifconfig
// 例如：http://192.168.1.100:8080/api
const DEV_API_URL = 'http://localhost:8080/api';

// 测试环境API地址
const TEST_API_URL = 'https://test-api.example.com/api';

// 生产环境API地址
const PROD_API_URL = 'https://api.example.com/api';

/**
 * 获取当前环境
 * 可以通过编译模式或环境变量设置
 */
const getEnvironment = () => {
  // 开发环境
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'development';
  }
  // 可以通过其他方式判断环境，这里简化处理
  return 'development';
};

/**
 * 根据环境返回对应的API地址
 */
export const API_BASE_URL = (() => {
  const env = getEnvironment();
  switch (env) {
    case 'development':
      return DEV_API_URL;
    case 'test':
      return TEST_API_URL;
    case 'production':
      return PROD_API_URL;
    default:
      return DEV_API_URL;
  }
})();

// API超时时间（毫秒）
export const API_TIMEOUT = 30000;

// Token存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  STORAGE_KEYS,
};

