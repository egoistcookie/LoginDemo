/**
 * 认证相关API
 */
import api from './index';

/**
 * 用户名密码登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @param {string} captchaKey 验证码Key（可选）
 * @param {string} captchaCode 验证码（可选）
 * @returns {Promise} 登录响应
 */
export const login = (username, password, captchaKey, captchaCode) => {
  return api.post('/auth/login', {
    username,
    password,
    captchaKey,
    captchaCode,
  });
};

/**
 * 手机验证码登录
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @returns {Promise} 登录响应
 */
export const loginByPhone = (phone, code) => {
  return api.post('/auth/login-by-phone', {
    phone,
    code,
  });
};

/**
 * 用户注册
 * @param {object} registerData 注册数据
 * @returns {Promise} 注册响应
 */
export const register = registerData => {
  return api.post('/auth/register', registerData);
};

/**
 * 发送短信验证码
 * @param {string} phone 手机号
 * @returns {Promise} 响应
 */
export const sendSmsCode = phone => {
  return api.post('/auth/send-sms-code', {phone});
};

/**
 * 登出
 * @returns {Promise} 响应
 */
export const logout = () => {
  return api.post('/auth/logout');
};

/**
 * 刷新Token
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise} 响应
 */
export const refreshToken = refreshToken => {
  return api.post('/auth/refresh', null, {
    params: {refreshToken},
  });
};

/**
 * 验证Token有效性
 * @param {string} token Token
 * @returns {Promise} 响应
 */
export const validateToken = token => {
  return api.get('/auth/validate', {
    params: {token},
  });
};

/**
 * 获取用户菜单
 * @returns {Promise} 响应
 */
export const getUserMenu = () => {
  return api.get('/auth/user-menu');
};

