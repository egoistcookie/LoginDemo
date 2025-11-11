/**
 * 应用根组件文件
 * 
 * 这是React Native应用的根组件，负责：
 * 1. 提供错误边界保护，捕获应用中的JavaScript错误
 * 2. 包裹手势处理器，使手势功能正常工作
 * 3. 渲染应用导航器，管理页面路由
 * 
 * 组件层次结构：
 * App (根组件)
 *   └── ErrorBoundary (错误边界)
 *       └── GestureHandlerRootView (手势处理根视图)
 *           └── AppNavigator (应用导航器)
 */

// 导入React核心库
// React是构建用户界面的JavaScript库，提供组件、状态管理等功能
import React from 'react';

// 导入手势处理器的根视图组件
// GestureHandlerRootView是react-native-gesture-handler库提供的根组件，
// 必须包裹在使用手势功能的组件外层，否则手势功能无法正常工作
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// 导入React Native的基础UI组件
// View: 类似于HTML的div，用于布局容器
// Text: 用于显示文本内容
// StyleSheet: 用于创建样式表，优化样式性能
import {View, Text, StyleSheet} from 'react-native';

// 导入应用导航器组件
// AppNavigator负责管理整个应用的页面路由和导航逻辑
import AppNavigator from './src/navigation/AppNavigator';

/**
 * 错误边界组件 (ErrorBoundary)
 * 
 * 这是一个React错误边界组件，用于捕获子组件树中发生的JavaScript错误。
 * 当子组件发生错误时，不会导致整个应用崩溃，而是显示友好的错误提示。
 * 
 * 工作原理：
 * 1. 使用getDerivedStateFromError捕获错误并更新状态
 * 2. 使用componentDidCatch记录错误信息到控制台
 * 3. 如果发生错误，渲染错误提示界面而不是崩溃
 */
class ErrorBoundary extends React.Component {
  /**
   * 构造函数
   * 初始化组件的状态
   * 
   * @param {object} props - 组件的属性
   */
  constructor(props) {
    super(props);
    // 初始化状态
    // hasError: 标记是否发生了错误
    // error: 存储错误对象
    this.state = {hasError: false, error: null};
  }

  /**
   * 静态方法：从错误中派生状态
   * 
   * 当子组件抛出错误时，React会调用这个方法。
   * 这个方法应该返回一个对象来更新组件的状态。
   * 
   * @param {Error} error - 捕获到的错误对象
   * @returns {object} 新的状态对象
   */
  static getDerivedStateFromError(error) {
    // 返回新状态，标记发生了错误并保存错误对象
    return {hasError: true, error};
  }

  /**
   * 生命周期方法：捕获错误
   * 
   * 当子组件抛出错误时，React会调用这个方法。
   * 通常用于记录错误信息、发送错误报告等。
   * 
   * @param {Error} error - 捕获到的错误对象
   * @param {object} errorInfo - 包含组件堆栈信息的对象
   */
  componentDidCatch(error, errorInfo) {
    // 将错误信息输出到控制台，方便调试
    console.error('应用错误:', error, errorInfo);
  }

  /**
   * 渲染方法
   * 
   * 根据是否有错误来决定渲染内容：
   * - 如果有错误：渲染错误提示界面
   * - 如果没有错误：渲染子组件
   * 
   * @returns {JSX.Element} 要渲染的JSX元素
   */
  render() {
    // 如果发生了错误，显示错误提示界面
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>应用出错</Text>
          <Text style={styles.errorText}>
            {/* 显示错误信息，如果没有则显示"未知错误" */}
            {this.state.error?.toString() || '未知错误'}
          </Text>
        </View>
      );
    }

    // 如果没有错误，正常渲染子组件
    return this.props.children;
  }
}

/**
 * App组件 - 应用的根组件
 * 
 * 这是一个函数式组件（使用箭头函数定义），是React推荐的组件写法。
 * 
 * 组件结构：
 * 1. ErrorBoundary: 错误边界，捕获所有子组件的错误
 * 2. GestureHandlerRootView: 手势处理根视图，使手势功能正常工作
 * 3. AppNavigator: 应用导航器，管理页面路由
 * 
 * @returns {JSX.Element} 应用的根JSX结构
 */
const App = () => {
  // 打印日志，用于调试，显示App组件正在渲染
  console.log('App component rendering...');
  
  return (
    // 错误边界：包裹整个应用，捕获所有错误
    <ErrorBoundary>
      {/* 
        手势处理根视图：必须包裹在使用手势功能的组件外层
        style={{flex: 1}}: 使视图占满整个屏幕
      */}
      <GestureHandlerRootView style={{flex: 1}}>
        {/* 应用导航器：管理页面路由和导航 */}
        <AppNavigator />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

/**
 * 样式表定义
 * 
 * StyleSheet.create() 是React Native推荐的样式定义方式，
 * 它会在编译时优化样式对象，提高性能。
 * 
 * 样式说明：
 * - flex: 1: 使容器占满父容器的所有可用空间
 * - justifyContent: 'center': 垂直方向居中对齐
 * - alignItems: 'center': 水平方向居中对齐
 */
const styles = StyleSheet.create({
  // 错误容器的样式
  // 用于显示错误提示的容器
  errorContainer: {
    flex: 1, // 占满整个屏幕
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: '#fff', // 白色背景
    padding: 20, // 内边距20像素
  },
  // 错误标题的样式
  // 显示"应用出错"标题
  errorTitle: {
    fontSize: 20, // 字体大小20
    fontWeight: 'bold', // 粗体
    color: '#ff0000', // 红色文字
    marginBottom: 10, // 底部外边距10像素
  },
  // 错误文本的样式
  // 显示具体的错误信息
  errorText: {
    fontSize: 14, // 字体大小14
    color: '#666', // 灰色文字
    textAlign: 'center', // 文本居中对齐
  },
});

// 导出App组件，供其他文件导入使用
export default App;

