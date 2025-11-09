/**
 * API配置文件
 * 根据环境变量切换不同的API地址
 */

import {Platform} from 'react-native';

// ========== 配置说明 ==========
// Android模拟器：使用 10.0.2.2 访问宿主机 localhost
// Android真机：使用电脑的局域网IP地址（例如：192.168.1.100）
// iOS模拟器：使用 localhost 或 127.0.0.1
// iOS真机：使用电脑的局域网IP地址
// ==============================

// 开发环境API地址配置
const DEV_API_CONFIG = {
  // Android模拟器地址（10.0.2.2 是 Android 模拟器访问宿主机 localhost 的特殊IP）
  androidEmulator: 'http://10.0.2.2:8080/api',
  
  // Android真机地址（需要替换为你的电脑局域网IP）
  // 获取IP方法：Windows: ipconfig，Mac/Linux: ifconfig
  // 例如：http://192.168.1.100:8080/api
  androidDevice: 'http://10.0.2.2:8080/api', // 默认使用模拟器地址，真机需要修改
  
  // iOS模拟器地址
  iosSimulator: 'http://localhost:8080/api',
  
  // iOS真机地址（需要替换为你的电脑局域网IP）
  iosDevice: 'http://localhost:8080/api', // 默认使用localhost，真机需要修改
};

// 测试环境API地址
const TEST_API_URL = 'https://test-api.example.com/api';

// 生产环境API地址
const PROD_API_URL = 'https://api.example.com/api';

// 手动指定API地址（优先级最高，如果设置了此值，将忽略自动检测）
// 设置为 null 或 undefined 则使用自动检测
const MANUAL_API_URL = null; // 例如: 'http://192.168.1.100:8080/api'

/**
 * 检测是否为模拟器
 * 注意：这是一个简单的检测方法，可能不够准确
 * 更可靠的方法是使用 react-native-device-info 库
 */
const isEmulator = () => {
  if (Platform.OS === 'android') {
    // Android模拟器通常包含 'sdk' 或 'emulator' 在设备名称中
    // 这里简化处理，实际项目中建议使用 react-native-device-info
    return true; // 默认假设是模拟器，真机需要手动修改配置
  } else if (Platform.OS === 'ios') {
    // iOS模拟器检测
    return __DEV__; // 开发环境通常是模拟器
  }
  return false;
};

/**
 * 获取开发环境API地址
 */
const getDevApiUrl = () => {
  // 如果手动指定了API地址，优先使用
  if (MANUAL_API_URL) {
    return MANUAL_API_URL;
  }

  if (Platform.OS === 'android') {
    return isEmulator()
      ? DEV_API_CONFIG.androidEmulator
      : DEV_API_CONFIG.androidDevice;
  } else if (Platform.OS === 'ios') {
    return isEmulator()
      ? DEV_API_CONFIG.iosSimulator
      : DEV_API_CONFIG.iosDevice;
  }

  // 默认返回Android模拟器地址
  return DEV_API_CONFIG.androidEmulator;
};

/**
 * 获取当前环境
 */
const getEnvironment = () => {
  // 可以通过环境变量或配置文件设置
  return __DEV__ ? 'development' : 'production';
};

/**
 * 根据环境返回对应的API地址
 */
export const API_BASE_URL = (() => {
  const env = getEnvironment();
  switch (env) {
    case 'development':
      return getDevApiUrl();
    case 'test':
      return TEST_API_URL;
    case 'production':
      return PROD_API_URL;
    default:
      return getDevApiUrl();
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

