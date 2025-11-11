/**
 * 用户信息展示页面组件
 * 
 * 这个组件用于显示当前登录用户的详细信息，包括：
 * - 用户头像（显示用户名首字母）
 * - 用户ID
 * - 用户名
 * - 邮箱
 * - 手机号
 * 
 * 主要功能：
 * - 页面加载时自动获取用户信息
 * - 显示用户详细信息
 * - 提供退出登录功能
 * 
 * 组件接收的props：
 * - navigation: React Navigation提供的导航对象，用于页面跳转
 * - updateAuthState: 更新认证状态的函数，退出登录后调用
 */

// 导入React核心功能
// React: React库的核心
// useEffect: 用于处理副作用（如API调用），在组件挂载时执行
// useState: 用于管理组件的状态
import React, {useEffect, useState} from 'react';

// 导入React Native的基础UI组件
// View: 布局容器
// Text: 文本显示组件
// StyleSheet: 样式表
// TouchableOpacity: 可触摸的按钮组件
// Alert: 弹出提示框组件
// ActivityIndicator: 加载指示器（转圈动画）
// ScrollView: 可滚动视图容器
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

// 导入API函数
// getCurrentUser: 获取当前登录用户信息的API函数
import {getCurrentUser} from '../api/user';

// 导入认证服务
// AuthService: 提供认证相关的业务逻辑，如退出登录
import AuthService from '../services/AuthService';

/**
 * ProfileScreen组件 - 用户信息页面
 * 
 * 这是一个函数式组件，使用React Hooks管理状态。
 * 
 * @param {object} props - 组件属性
 * @param {object} props.navigation - React Navigation的导航对象
 * @param {Function} props.updateAuthState - 更新认证状态的函数
 * @returns {JSX.Element} 用户信息页面的JSX结构
 */
const ProfileScreen = ({navigation, updateAuthState}) => {
  /**
   * 状态管理
   * 
   * useState Hook用于在函数组件中添加状态。
   */

  // userInfo: 用户信息对象
  // null: 初始值为null，表示还未加载用户信息
  // 加载成功后，包含用户的所有信息（id, username, email, phone等）
  const [userInfo, setUserInfo] = useState(null);

  // loading: 加载状态
  // true: 正在加载用户信息，显示加载动画
  // false: 加载完成，显示用户信息
  const [loading, setLoading] = useState(true);

  /**
   * useEffect Hook - 副作用处理
   * 
   * 在组件挂载后执行一次（因为依赖数组为空[]）。
   * 这里用于在页面加载时自动获取用户信息。
   */
  useEffect(() => {
    // 调用加载用户信息的函数
    loadUserInfo();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  /**
   * 加载用户信息
   * 
   * 这个函数从服务器获取当前登录用户的详细信息。
   * 
   * 工作流程：
   * 1. 设置loading为true，显示加载动画
   * 2. 调用API获取用户信息
   * 3. 如果成功，更新userInfo状态
   * 4. 如果失败，显示错误提示
   * 5. 无论成功或失败，都要设置loading为false
   * 
   * @returns {Promise<void>}
   */
  const loadUserInfo = async () => {
    try {
      // 设置加载状态为true
      setLoading(true);
      
      // 调用API获取当前用户信息
      // getCurrentUser是异步函数，需要使用await等待结果
      const response = await getCurrentUser();
      
      // 检查响应状态码
      // 200表示成功
      if (response.data.code === 200) {
        // 更新用户信息状态
        // response.data.data包含用户信息对象
        setUserInfo(response.data.data);
      } else {
        // 如果API返回错误，显示错误信息
        Alert.alert('错误', response.data.message || '获取用户信息失败');
      }
    } catch (error) {
      // 如果API调用失败（网络错误等），显示错误提示
      Alert.alert('错误', error.message || '获取用户信息失败');
    } finally {
      // finally块中的代码无论成功或失败都会执行
      // 设置加载状态为false，显示页面内容
      setLoading(false);
    }
  };

  /**
   * 处理退出登录
   * 
   * 这个函数处理用户退出登录的逻辑：
   * 1. 显示确认对话框
   * 2. 如果用户确认，调用AuthService.logout退出登录
   * 3. 更新认证状态为false
   * 4. 跳转到登录页
   * 
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    // Alert.alert: 显示原生确认对话框
    // 参数：标题，内容，按钮配置数组
    Alert.alert('确认', '确定要退出登录吗？', [
      {
        text: '取消', // 按钮文字
        style: 'cancel', // 按钮样式：取消样式（通常显示为灰色）
        // 没有onPress，点击后自动关闭对话框，不执行任何操作
      },
      {
        text: '确定', // 按钮文字
        // onPress: 点击确定按钮时执行的函数
        onPress: async () => {
          try {
            // 调用认证服务退出登录
            // AuthService.logout会清除本地存储的Token和用户信息
            await AuthService.logout();
            
            // 更新认证状态为false
            // updateAuthState是父组件传递的函数，用于通知导航器更新状态
            if (updateAuthState) {
              updateAuthState(false);
            }
            
            // 重置导航栈，跳转到登录页
            // navigation.reset: 重置导航栈，清除历史记录
            // index: 0 - 当前页面在栈中的索引
            // routes: 新的路由栈，只包含Login页面
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          } catch (error) {
            // 如果退出登录过程中出错，显示错误提示
            Alert.alert('错误', '登出失败');
          }
        },
      },
    ]);
  };

  /**
   * 加载状态渲染
   * 
   * 如果正在加载用户信息，显示加载动画。
   * 这样可以避免在数据加载完成前显示空白页面。
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* ActivityIndicator: 显示加载动画（转圈） */}
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  /**
   * 主要内容渲染
   * 
   * 返回用户信息页面的JSX结构
   * 
   * 组件结构说明：
   * - ScrollView: 可滚动视图，当内容超出屏幕时可以滚动
   * - View: 主要内容容器
   * - header: 头部区域，包含头像和用户名
   * - infoCard: 用户信息卡片，显示用户详细信息
   * - logoutButton: 退出登录按钮
   */
  return (
    <ScrollView style={styles.container}>
      {/* 主要内容容器 */}
      <View style={styles.content}>
        {/* 头部区域：头像和用户名 */}
        <View style={styles.header}>
          {/* 头像容器 */}
          <View style={styles.avatar}>
            {/* 
              头像文字：显示用户名首字母的大写
              userInfo?.username: 可选链操作符，如果userInfo或username为null/undefined，不会报错
              ?.charAt(0): 获取第一个字符
              .toUpperCase(): 转换为大写
              || 'U': 如果前面为null/undefined，则显示'U'作为默认值
            */}
            <Text style={styles.avatarText}>
              {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          {/* 用户名 */}
          <Text style={styles.username}>
            {/* 显示用户名，如果没有则显示"用户" */}
            {userInfo?.username || '用户'}
          </Text>
        </View>

        {/* 用户信息卡片 */}
        <View style={styles.infoCard}>
          {/* 卡片标题 */}
          <Text style={styles.cardTitle}>用户信息</Text>
          
          {/* 用户ID信息行 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>用户ID</Text>
            {/* 显示用户ID，如果没有则显示"-" */}
            <Text style={styles.infoValue}>{userInfo?.id || '-'}</Text>
          </View>

          {/* 分隔线 */}
          <View style={styles.divider} />

          {/* 用户名信息行 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>用户名</Text>
            <Text style={styles.infoValue}>{userInfo?.username || '-'}</Text>
          </View>

          {/* 分隔线 */}
          <View style={styles.divider} />

          {/* 邮箱信息行 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>邮箱</Text>
            <Text style={styles.infoValue}>{userInfo?.email || '-'}</Text>
          </View>

          {/* 分隔线 */}
          <View style={styles.divider} />

          {/* 手机号信息行 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>手机号</Text>
            <Text style={styles.infoValue}>{userInfo?.phone || '-'}</Text>
          </View>
        </View>

        {/* 退出登录按钮 */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/**
 * 样式表定义
 * 
 * StyleSheet.create() 是React Native推荐的样式定义方式，
 * 它会在编译时优化样式对象，提高性能。
 */
const styles = StyleSheet.create({
  // 容器样式：最外层容器
  container: {
    flex: 1, // 占满整个屏幕
    backgroundColor: '#f5f5f5', // 浅灰色背景
  },
  // 加载容器样式：显示加载动画的容器
  loadingContainer: {
    flex: 1, // 占满整个屏幕
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: '#f5f5f5', // 浅灰色背景
  },
  // 加载文本样式
  loadingText: {
    marginTop: 10, // 顶部外边距10像素
    color: '#666', // 灰色文字
  },
  // 内容容器样式
  content: {
    padding: 20, // 内边距20像素
  },
  // 头部容器样式
  header: {
    alignItems: 'center', // 水平居中
    marginBottom: 30, // 底部外边距30像素
    paddingTop: 40, // 顶部内边距40像素
  },
  // 头像容器样式
  avatar: {
    width: 80, // 宽度80像素
    height: 80, // 高度80像素
    borderRadius: 40, // 圆角40像素（圆形）
    backgroundColor: '#1890ff', // 蓝色背景
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    marginBottom: 16, // 底部外边距16像素
  },
  // 头像文字样式
  avatarText: {
    fontSize: 32, // 字体大小32
    color: '#fff', // 白色文字
    fontWeight: 'bold', // 粗体
  },
  // 用户名样式
  username: {
    fontSize: 24, // 字体大小24
    fontWeight: 'bold', // 粗体
    color: '#333', // 深灰色文字
  },
  // 信息卡片样式
  infoCard: {
    backgroundColor: '#fff', // 白色背景
    borderRadius: 8, // 圆角8像素
    padding: 20, // 内边距20像素
    marginBottom: 20, // 底部外边距20像素
  },
  // 卡片标题样式
  cardTitle: {
    fontSize: 18, // 字体大小18
    fontWeight: 'bold', // 粗体
    color: '#333', // 深灰色文字
    marginBottom: 16, // 底部外边距16像素
  },
  // 信息行样式：每行信息（标签+值）
  infoRow: {
    flexDirection: 'row', // 横向排列
    justifyContent: 'space-between', // 两端对齐（标签在左，值在右）
    alignItems: 'center', // 垂直居中对齐
    paddingVertical: 12, // 垂直内边距12像素
  },
  // 信息标签样式（左侧）
  infoLabel: {
    fontSize: 16, // 字体大小16
    color: '#666', // 灰色文字
  },
  // 信息值样式（右侧）
  infoValue: {
    fontSize: 16, // 字体大小16
    color: '#333', // 深灰色文字
    fontWeight: '500', // 中等粗细
  },
  // 分隔线样式
  divider: {
    height: 1, // 高度1像素
    backgroundColor: '#f0f0f0', // 浅灰色背景
  },
  // 退出登录按钮样式
  logoutButton: {
    backgroundColor: '#ff4d4f', // 红色背景
    borderRadius: 6, // 圆角6像素
    paddingVertical: 14, // 垂直内边距14像素
    alignItems: 'center', // 水平居中
  },
  // 退出登录按钮文字样式
  logoutButtonText: {
    color: '#fff', // 白色文字
    fontSize: 16, // 字体大小16
    fontWeight: 'bold', // 粗体
  },
});

// 导出ProfileScreen组件，供其他文件导入使用
export default ProfileScreen;
