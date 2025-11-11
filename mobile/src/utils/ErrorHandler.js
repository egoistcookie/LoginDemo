/**
 * 错误处理工具类
 * 
 * 这个类提供了统一的错误处理机制，用于：
 * - 处理API请求错误
 * - 将技术错误转换为用户友好的提示信息
 * - 显示错误、成功和确认对话框
 * 
 * 主要功能：
 * 1. 解析API错误并生成友好的错误消息
 * 2. 显示错误提示框
 * 3. 显示成功提示框
 * 4. 显示确认对话框
 * 
 * 这是一个静态类，所有方法都是静态方法，可以直接通过类名调用。
 * 例如：ErrorHandler.showError(error)
 */

// 导入React Native的Alert组件
// Alert: 用于显示原生提示框（对话框）
import {Alert} from 'react-native';

/**
 * ErrorHandler类 - 错误处理工具
 * 
 * 这是一个静态类，所有方法都是静态方法。
 * 静态方法可以直接通过类名调用，不需要创建类的实例。
 */
class ErrorHandler {
  /**
   * 处理API错误
   * 
   * 这个方法解析axios错误对象，根据不同的错误类型返回用户友好的错误消息。
   * 
   * 错误类型：
   * 1. error.response: 服务器返回了错误响应（有状态码）
   * 2. error.request: 请求已发出但没有收到响应（网络问题）
   * 3. 其他: 请求配置出错
   * 
   * @param {Error} error - axios错误对象
   * @param {string} [defaultMessage='操作失败，请稍后重试'] - 默认错误消息
   * @returns {string} 用户友好的错误消息
   */
  static handleApiError(error, defaultMessage = '操作失败，请稍后重试') {
    // 初始化错误消息为默认值
    let message = defaultMessage;

    // 检查是否有服务器响应（error.response存在）
    // 这表示请求已发送，服务器也返回了响应，但状态码表示错误
    if (error.response) {
      // 服务器返回了错误响应
      // 解构赋值：从error.response中提取status和data
      const {status, data} = error.response;
      
      // 根据HTTP状态码返回不同的错误消息
      // switch语句：根据status的值执行不同的代码块
      switch (status) {
        case 400:
          // 400 Bad Request: 请求参数错误
          // 优先使用服务器返回的错误消息，如果没有则使用默认消息
          message = data?.message || '请求参数错误';
          break;
        case 401:
          // 401 Unauthorized: 未授权，通常是Token过期
          message = '登录已过期，请重新登录';
          break;
        case 403:
          // 403 Forbidden: 禁止访问，没有权限
          message = '没有权限执行此操作';
          break;
        case 404:
          // 404 Not Found: 请求的资源不存在
          message = '请求的资源不存在';
          break;
        case 500:
          // 500 Internal Server Error: 服务器内部错误
          message = '服务器内部错误，请稍后重试';
          break;
        case 503:
          // 503 Service Unavailable: 服务暂时不可用
          message = '服务暂时不可用，请稍后重试';
          break;
        default:
          // 其他状态码：使用服务器返回的消息或默认消息
          message = data?.message || `请求失败: ${status}`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      // 这通常表示网络连接问题
      message = '网络连接失败，请检查网络设置';
    } else {
      // 请求配置出错
      // 这通常是在发送请求之前就出错了
      // 使用错误对象的message属性，如果没有则使用默认消息
      message = error.message || defaultMessage;
    }

    // 返回处理后的错误消息
    return message;
  }

  /**
   * 显示错误提示框
   * 
   * 这个方法会调用handleApiError处理错误，然后显示一个原生的错误提示框。
   * 
   * @param {Error} error - axios错误对象
   * @param {string} [defaultMessage='操作失败，请稍后重试'] - 默认错误消息
   */
  static showError(error, defaultMessage = '操作失败，请稍后重试') {
    // 调用handleApiError处理错误，获取用户友好的错误消息
    const message = this.handleApiError(error, defaultMessage);
    
    // 使用Alert.alert显示错误提示框
    // 参数：标题，内容
    Alert.alert('错误', message);
  }

  /**
   * 显示成功提示框
   * 
   * 这个方法显示一个原生的成功提示框，用于告知用户操作成功。
   * 
   * @param {string} message - 成功消息内容
   */
  static showSuccess(message) {
    // 使用Alert.alert显示成功提示框
    // 参数：标题，内容
    Alert.alert('成功', message);
  }

  /**
   * 显示确认对话框
   * 
   * 这个方法显示一个原生的确认对话框，包含"取消"和"确定"两个按钮。
   * 用户可以选择确认或取消操作。
   * 
   * @param {string} title - 对话框标题
   * @param {string} message - 对话框内容
   * @param {Function} [onConfirm] - 确认按钮的回调函数（可选）
   * @param {Function} [onCancel] - 取消按钮的回调函数（可选）
   */
  static showConfirm(title, message, onConfirm, onCancel) {
    // 使用Alert.alert显示确认对话框
    // 参数：标题，内容，按钮配置数组
    Alert.alert(title, message, [
      {
        text: '取消', // 按钮文字
        style: 'cancel', // 按钮样式：取消样式（通常显示为灰色，在iOS上会显示在左侧）
        onPress: onCancel, // 点击取消按钮时执行的函数
      },
      {
        text: '确定', // 按钮文字
        onPress: onConfirm, // 点击确定按钮时执行的函数
      },
    ]);
  }
}

// 导出ErrorHandler类，供其他文件导入使用
export default ErrorHandler;
