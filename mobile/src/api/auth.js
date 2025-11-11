/**
 * 认证相关API函数
 * 
 * 这个文件定义了所有与用户认证相关的API接口函数。
 * 这些函数封装了HTTP请求的细节，提供了简洁的接口供业务层调用。
 * 
 * 主要功能：
 * - 用户名密码登录
 * - 手机验证码登录
 * - 用户注册
 * - 发送短信验证码
 * - 退出登录
 * - 刷新Token
 * - 验证Token有效性
 * - 获取用户菜单
 * 
 * 所有函数都返回Promise，需要使用async/await或.then()来处理异步结果。
 */

// 导入API客户端
// api: axios实例，已经配置了baseURL、拦截器等
// 所有API请求都会通过这个实例发送
import api from './index';

/**
 * 用户名密码登录
 * 
 * 这个函数调用登录API，使用用户名和密码进行身份验证。
 * 
 * API端点：POST /auth/login
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} [captchaKey] - 验证码Key（可选参数）
 * @param {string} [captchaCode] - 验证码（可选参数）
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构：
 *   {
 *     data: {
 *       code: 200,
 *       message: '登录成功',
 *       data: {
 *         accessToken: '访问令牌',
 *         refreshToken: '刷新令牌',
 *         user: {用户信息对象}
 *       }
 *     }
 *   }
 */
export const login = (username, password, captchaKey, captchaCode) => {
  // 调用API的post方法发送POST请求
  // 第一个参数：API端点路径（相对于baseURL）
  // 第二个参数：请求体数据（会被序列化为JSON）
  return api.post('/auth/login', {
    username, // ES6简写：等同于 username: username
    password,
    captchaKey,
    captchaCode,
  });
};

/**
 * 手机验证码登录
 * 
 * 这个函数调用手机验证码登录API，使用手机号和验证码进行身份验证。
 * 
 * API端点：POST /auth/login-by-phone
 * 
 * @param {string} phone - 手机号（11位数字）
 * @param {string} code - 短信验证码（通常是6位数字）
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构与login函数相同
 */
export const loginByPhone = (phone, code) => {
  // 调用API的post方法发送POST请求
  return api.post('/auth/login-by-phone', {
    phone,
    code,
  });
};

/**
 * 用户注册
 * 
 * 这个函数调用注册API，创建新用户账户。
 * 
 * API端点：POST /auth/register
 * 
 * @param {object} registerData - 注册数据对象
 *   通常包含：username, password, email, phone等字段
 * @returns {Promise<object>} axios响应对象
 */
export const register = registerData => {
  // 调用API的post方法发送POST请求
  // registerData对象会被序列化为JSON作为请求体
  return api.post('/auth/register', registerData);
};

/**
 * 发送短信验证码
 * 
 * 这个函数调用发送短信验证码API，向指定手机号发送验证码。
 * 
 * API端点：POST /auth/send-sms-code
 * 
 * @param {string} phone - 手机号（11位数字）
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构：
 *   {
 *     data: {
 *       code: 200,
 *       message: '验证码已发送'
 *     }
 *   }
 */
export const sendSmsCode = phone => {
  // 调用API的post方法发送POST请求
  // 请求体包含手机号
  return api.post('/auth/send-sms-code', {phone});
};

/**
 * 退出登录
 * 
 * 这个函数调用退出登录API，通知服务器用户退出登录。
 * 
 * API端点：POST /auth/logout
 * 
 * 注意：这个API调用是可选的，即使失败也不影响本地退出登录。
 * 实际的Token清除工作由AuthService.logout()完成。
 * 
 * @returns {Promise<object>} axios响应对象
 */
export const logout = () => {
  // 调用API的post方法发送POST请求
  // 不需要请求体数据，所以不传第二个参数
  return api.post('/auth/logout');
};

/**
 * 刷新Token
 * 
 * 当访问令牌过期时，可以使用刷新令牌获取新的访问令牌。
 * 
 * API端点：POST /auth/refresh
 * 
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构：
 *   {
 *     data: {
 *       code: 200,
 *       data: {
 *         accessToken: '新的访问令牌',
 *         refreshToken: '新的刷新令牌'
 *       }
 *     }
 *   }
 */
export const refreshToken = refreshToken => {
  // 调用API的post方法发送POST请求
  // 第一个参数：API端点路径
  // 第二个参数：请求体（这里传null，因为refreshToken作为查询参数）
  // 第三个参数：请求配置对象
  return api.post('/auth/refresh', null, {
    params: {refreshToken}, // 将refreshToken作为查询参数传递
  });
};

/**
 * 验证Token有效性
 * 
 * 这个函数调用验证Token API，检查Token是否有效。
 * 
 * API端点：GET /auth/validate
 * 
 * @param {string} token - 要验证的Token
 * @returns {Promise<object>} axios响应对象
 */
export const validateToken = token => {
  // 调用API的get方法发送GET请求
  // 第一个参数：API端点路径
  // 第二个参数：请求配置对象
  return api.get('/auth/validate', {
    params: {token}, // 将token作为查询参数传递
  });
};

/**
 * 获取用户菜单
 * 
 * 这个函数调用获取用户菜单API，获取当前用户的权限菜单列表。
 * 
 * API端点：GET /auth/user-menu
 * 
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构：
 *   {
 *     data: {
 *       code: 200,
 *       data: [菜单项数组]
 *     }
 *   }
 */
export const getUserMenu = () => {
  // 调用API的get方法发送GET请求
  // 不需要参数，直接调用
  return api.get('/auth/user-menu');
};
