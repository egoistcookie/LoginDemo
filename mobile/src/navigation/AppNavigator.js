/**
 * 应用导航配置组件
 * 
 * 这个文件负责管理整个应用的页面路由和导航逻辑。
 * 
 * 主要功能：
 * 1. 根据用户的登录状态决定显示哪个页面（登录页或主页）
 * 2. 在应用启动时检查用户的登录状态
 * 3. 提供导航引用，供其他组件使用
 * 4. 管理页面之间的导航和状态更新
 * 
 * 导航流程：
 * - 应用启动 → 检查登录状态 → 显示登录页或主页
 * - 登录成功 → 更新认证状态 → 自动跳转到主页
 * - 退出登录 → 更新认证状态 → 自动跳转到登录页
 */

// 导入React核心功能
// React: React库的核心
// useEffect: 用于处理副作用（如API调用、订阅等）
// useState: 用于管理组件的状态
// useRef: 用于创建引用（虽然这里导入了但实际使用的是React.createRef）
import React, {useEffect, useState, useRef} from 'react';

// 导入React Navigation的核心组件
// NavigationContainer: 导航容器，包裹所有导航器，提供导航上下文
import {NavigationContainer} from '@react-navigation/native';

// 导入原生栈导航器创建函数
// createNativeStackNavigator: 创建原生栈导航器，提供页面堆栈管理
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// 导入React Native的基础UI组件
// View: 布局容器
// ActivityIndicator: 加载指示器（转圈动画）
// Text: 文本显示
// StyleSheet: 样式表
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';

// 导入认证服务
// AuthService: 提供认证相关的业务逻辑，如检查登录状态
import AuthService from '../services/AuthService';

// 导入页面组件
// LoginScreen: 登录页面组件
import LoginScreen from '../screens/LoginScreen';
// ProfileScreen: 个人资料页面组件
import ProfileScreen from '../screens/ProfileScreen';

/**
 * 创建原生栈导航器
 * 
 * Stack是一个导航器对象，包含Navigator和Screen组件。
 * 栈导航器的工作原理类似于浏览器的历史记录：
 * - 每次导航到新页面时，新页面会被推入栈顶
 * - 返回时，当前页面会从栈中弹出，显示上一个页面
 */
const Stack = createNativeStackNavigator();

/**
 * 创建导航引用
 * 
 * navigationRef是一个React引用对象，用于在组件外部访问导航功能。
 * 这在某些场景下很有用，比如：
 * - 在非React组件中（如工具函数、服务类）进行导航
 * - 在深层嵌套的组件中访问导航功能
 * 
 * 使用方式：
 * import {navigationRef} from './navigation/AppNavigator';
 * navigationRef.current?.navigate('Profile');
 */
export const navigationRef = React.createRef();

/**
 * AppNavigator组件 - 应用导航器
 * 
 * 这是应用的核心导航组件，负责：
 * 1. 检查用户的登录状态
 * 2. 根据登录状态显示不同的页面
 * 3. 提供状态更新函数给子组件
 * 
 * @returns {JSX.Element} 导航容器和页面配置
 */
const AppNavigator = () => {
  /**
   * 状态管理
   * 
   * useState是React Hook，用于在函数组件中添加状态。
   * 
   * isAuthenticated: 用户是否已登录
   * - false: 未登录，显示登录页
   * - true: 已登录，显示主页
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  /**
   * isLoading: 是否正在加载
   * - true: 正在检查登录状态，显示加载动画
   * - false: 检查完成，显示对应页面
   */
  const [isLoading, setIsLoading] = useState(true);

  // 打印日志，用于调试
  console.log('AppNavigator rendering, isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  /**
   * useEffect Hook - 副作用处理
   * 
   * useEffect在组件挂载后执行一次（因为依赖数组为空[]）。
   * 这里用于在应用启动时检查用户的登录状态。
   * 
   * 依赖数组说明：
   * - []: 空数组表示只在组件挂载时执行一次
   * - [value]: 当value变化时执行
   * - 无依赖数组: 每次渲染都执行（不推荐）
   */
  useEffect(() => {
    console.log('AppNavigator useEffect triggered, checking auth status...');
    // 检查登录状态
    checkAuthStatus();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  /**
   * 检查认证状态
   * 
   * 这是一个异步函数，用于检查用户是否已经登录。
   * 
   * 工作流程：
   * 1. 调用AuthService.isAuthenticated()检查是否有有效的Token
   * 2. 根据检查结果更新isAuthenticated状态
   * 3. 无论成功或失败，都要设置isLoading为false，显示页面
   * 
   * @returns {Promise<void>}
   */
  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      // 调用认证服务检查是否已登录
      // 这个方法会检查本地存储中是否有有效的Token
      const authenticated = await AuthService.isAuthenticated();
      console.log('Auth status result:', authenticated);
      // 更新认证状态
      setIsAuthenticated(authenticated);
    } catch (error) {
      // 如果检查过程中出错，默认设置为未登录状态
      console.error('检查登录状态失败:', error);
      setIsAuthenticated(false);
    } finally {
      // finally块中的代码无论成功或失败都会执行
      // 设置加载状态为false，显示页面
      console.log('Auth check completed, setting loading to false');
      setIsLoading(false);
    }
  };

  /**
   * 更新认证状态
   * 
   * 这个函数供子组件（如LoginScreen、ProfileScreen）调用，
   * 用于在登录或登出后更新导航器的认证状态。
   * 
   * 使用场景：
   * - 登录成功：updateAuthState(true) → 跳转到主页
   * - 退出登录：updateAuthState(false) → 跳转到登录页
   * 
   * @param {boolean} authenticated - 是否已认证
   */
  const updateAuthState = (authenticated) => {
    setIsAuthenticated(authenticated);
  };

  /**
   * 加载状态渲染
   * 
   * 如果正在检查登录状态，显示加载动画。
   * 这样可以避免在检查完成前显示错误的页面。
   */
  if (isLoading) {
    console.log('Showing loading screen...');
    return (
      <View style={styles.loadingContainer}>
        {/* ActivityIndicator: 显示加载动画（转圈） */}
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  // 打印日志，显示正在渲染导航
  console.log('Rendering navigation, isAuthenticated:', isAuthenticated);
  
  /**
   * 导航容器和页面配置
   * 
   * NavigationContainer: 导航容器，必须包裹所有导航器
   * Stack.Navigator: 栈导航器，管理页面堆栈
   * Stack.Screen: 页面配置，定义每个页面的名称和组件
   * 
   * 条件渲染：
   * - 如果已登录：显示ProfileScreen（主页）
   * - 如果未登录：显示LoginScreen（登录页）
   */
  return (
    <NavigationContainer ref={navigationRef}>
      {/* 
        Stack.Navigator: 栈导航器配置
        screenOptions: 所有页面的默认选项
        headerShown: false - 隐藏默认的导航栏头部
      */}
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {/* 
          条件渲染：根据isAuthenticated决定显示哪个页面
          使用三元运算符：条件 ? 真值 : 假值
        */}
        {isAuthenticated ? (
          // 如果已登录，显示主页
          <Stack.Screen name="Profile">
            {props => {
              console.log('Rendering ProfileScreen');
              // 将props和updateAuthState函数传递给ProfileScreen
              // {...props}: 展开props，传递导航相关的属性（如navigation）
              // updateAuthState: 允许ProfileScreen更新认证状态（用于退出登录）
              return <ProfileScreen {...props} updateAuthState={updateAuthState} />;
            }}
          </Stack.Screen>
        ) : (
          // 如果未登录，显示登录页
          <Stack.Screen name="Login">
            {props => {
              console.log('Rendering LoginScreen');
              // 将props和updateAuthState函数传递给LoginScreen
              // updateAuthState: 允许LoginScreen更新认证状态（用于登录成功）
              return <LoginScreen {...props} updateAuthState={updateAuthState} />;
            }}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * 样式表定义
 */
const styles = StyleSheet.create({
  // 加载容器的样式
  // 用于显示加载动画的容器
  loadingContainer: {
    flex: 1, // 占满整个屏幕
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: '#f5f5f5', // 浅灰色背景
  },
  // 加载文本的样式
  loadingText: {
    marginTop: 10, // 顶部外边距10像素
    color: '#666', // 灰色文字
  },
});

// 导出AppNavigator组件，供其他文件导入使用
export default AppNavigator;

