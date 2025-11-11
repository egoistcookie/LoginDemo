/**
 * 用户相关API函数
 * 
 * 这个文件定义了所有与用户信息相关的API接口函数。
 * 这些函数封装了HTTP请求的细节，提供了简洁的接口供业务层调用。
 * 
 * 主要功能：
 * - 获取当前登录用户信息
 * - 更新用户信息
 * - 更新用户密码
 * 
 * 所有函数都返回Promise，需要使用async/await或.then()来处理异步结果。
 */

// 导入API客户端
// api: axios实例，已经配置了baseURL、拦截器等
// 所有API请求都会通过这个实例发送，并且会自动添加Token到请求头
import api from './index';

/**
 * 获取当前登录用户信息
 * 
 * 这个函数调用获取当前用户信息API，返回当前登录用户的详细信息。
 * 
 * API端点：GET /users/me
 * 
 * 注意：这个API需要用户已登录（请求头中需要有有效的Token）。
 * 
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构：
 *   {
 *     data: {
 *       code: 200,
 *       message: '获取成功',
 *       data: {
 *         id: 用户ID,
 *         username: '用户名',
 *         email: '邮箱',
 *         phone: '手机号',
 *         ...其他用户信息字段
 *       }
 *     }
 *   }
 */
export const getCurrentUser = () => {
  // 调用API的get方法发送GET请求
  // /users/me 是RESTful API的标准端点，表示获取当前用户的信息
  return api.get('/users/me');
};

/**
 * 更新用户信息
 * 
 * 这个函数调用更新用户信息API，修改指定用户的信息。
 * 
 * API端点：PUT /users/:id
 * 
 * 注意：
 * - 这个API需要用户已登录
 * - 通常只能更新自己的信息，不能更新其他用户的信息
 * 
 * @param {number} id - 用户ID
 * @param {object} userData - 要更新的用户数据对象
 *   可以包含以下字段（根据实际API文档）：
 *   - username: 用户名
 *   - email: 邮箱
 *   - phone: 手机号
 *   - avatar: 头像URL
 *   - ...其他可更新字段
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构：
 *   {
 *     data: {
 *       code: 200,
 *       message: '更新成功',
 *       data: {更新后的用户信息}
 *     }
 *   }
 */
export const updateUser = (id, userData) => {
  // 调用API的put方法发送PUT请求
  // 第一个参数：API端点路径，使用模板字符串动态插入用户ID
  // 第二个参数：请求体数据（要更新的用户数据）
  // PUT方法通常用于更新资源
  return api.put(`/users/${id}`, userData);
};

/**
 * 更新用户密码
 * 
 * 这个函数调用更新密码API，修改指定用户的密码。
 * 
 * API端点：PUT /users/:id/password
 * 
 * 注意：
 * - 这个API需要用户已登录
 * - 通常需要提供旧密码进行验证（根据实际API设计）
 * - 只能更新自己的密码，不能更新其他用户的密码
 * 
 * @param {number} id - 用户ID
 * @param {string} newPassword - 新密码
 * @returns {Promise<object>} axios响应对象
 *   响应数据结构：
 *   {
 *     data: {
 *       code: 200,
 *       message: '密码更新成功'
 *     }
 *   }
 */
export const updatePassword = (id, newPassword) => {
  // 调用API的put方法发送PUT请求
  // 第一个参数：API端点路径，使用模板字符串动态插入用户ID
  // 第二个参数：请求体数据（包含新密码）
  return api.put(`/users/${id}/password`, {newPassword});
};
