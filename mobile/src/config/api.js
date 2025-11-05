/**
 * API配置文件
 * 根据环境变量切换不同的API地址
 */

// 开发环境API地址
// Android模拟器使用 10.0.2.2 访问本地host
// 真机使用电脑的局域网IP地址
const DEV_API_URL = 'http://10.0.2.2:8080/api';

// 测试环境API地址
const TEST_API_URL = 'https://test-api.example.com/api';

// 生产环境API地址
const PROD_API_URL = 'https://api.example.com/api';

// 获取当前环境
const getEnvironment = () => {
  // 可以通过环境变量或配置文件设置
  return __DEV__ ? 'development' : 'production';
};

// 根据环境返回对应的API地址
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
  ACCESS_TOKEN: '@auth:accessToken',
  REFRESH_TOKEN: '@auth:refreshToken',
  USER_INFO: '@auth:userInfo',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  STORAGE_KEYS,
};

