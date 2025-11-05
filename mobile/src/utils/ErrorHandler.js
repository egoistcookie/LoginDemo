/**
 * 错误处理工具
 * 统一处理应用中的错误，提供用户友好的错误提示
 */
import {Alert} from 'react-native';

class ErrorHandler {
  /**
   * 处理API错误
   * @param {Error} error 错误对象
   * @param {string} defaultMessage 默认错误消息
   */
  static handleApiError(error, defaultMessage = '操作失败，请稍后重试') {
    let message = defaultMessage;

    if (error.response) {
      // 服务器返回了错误响应
      const {status, data} = error.response;
      
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误';
          break;
        case 401:
          message = '登录已过期，请重新登录';
          break;
        case 403:
          message = '没有权限执行此操作';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误，请稍后重试';
          break;
        case 503:
          message = '服务暂时不可用，请稍后重试';
          break;
        default:
          message = data?.message || `请求失败: ${status}`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message = '网络连接失败，请检查网络设置';
    } else {
      // 请求配置出错
      message = error.message || defaultMessage;
    }

    return message;
  }

  /**
   * 显示错误提示
   * @param {Error} error 错误对象
   * @param {string} defaultMessage 默认错误消息
   */
  static showError(error, defaultMessage = '操作失败，请稍后重试') {
    const message = this.handleApiError(error, defaultMessage);
    Alert.alert('错误', message);
  }

  /**
   * 显示成功提示
   * @param {string} message 成功消息
   */
  static showSuccess(message) {
    Alert.alert('成功', message);
  }

  /**
   * 显示确认对话框
   * @param {string} title 标题
   * @param {string} message 消息
   * @param {Function} onConfirm 确认回调
   * @param {Function} onCancel 取消回调
   */
  static showConfirm(title, message, onConfirm, onCancel) {
    Alert.alert(title, message, [
      {
        text: '取消',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: '确定',
        onPress: onConfirm,
      },
    ]);
  }
}

export default ErrorHandler;

