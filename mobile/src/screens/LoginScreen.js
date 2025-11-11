/**
 * 登录页面组件
 * 
 * 这个组件提供了两种登录方式：
 * 1. 账号密码登录：用户输入用户名和密码进行登录
 * 2. 手机验证码登录：用户输入手机号和验证码进行登录
 * 
 * 主要功能：
 * - 切换登录方式（选项卡）
 * - 表单验证
 * - 发送短信验证码（带倒计时）
 * - 处理登录逻辑
 * - 登录成功后跳转到主页
 * 
 * 组件接收的props：
 * - navigation: React Navigation提供的导航对象，用于页面跳转
 * - updateAuthState: 更新认证状态的函数，登录成功后调用
 */

// 导入React核心功能
// React: React库的核心
// useState: React Hook，用于在函数组件中管理状态
import React, {useState} from 'react';

// 导入React Native的基础UI组件
// View: 布局容器，类似于HTML的div
// Text: 文本显示组件
// TextInput: 文本输入框组件
// TouchableOpacity: 可触摸的按钮组件，按下时有透明度变化效果
// StyleSheet: 样式表，用于定义组件样式
// Alert: 弹出提示框组件
// ActivityIndicator: 加载指示器（转圈动画）
// KeyboardAvoidingView: 键盘避让视图，当键盘弹出时自动调整布局
// Platform: 平台检测工具，用于判断当前是iOS还是Android
// ScrollView: 可滚动视图容器
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// 导入认证服务
// AuthService: 提供登录相关的业务逻辑
import AuthService from '../services/AuthService';

// 导入API函数
// sendSmsCode: 发送短信验证码的API函数
import {sendSmsCode} from '../api/auth';

/**
 * LoginScreen组件 - 登录页面
 * 
 * 这是一个函数式组件，使用React Hooks管理状态。
 * 
 * @param {object} props - 组件属性
 * @param {object} props.navigation - React Navigation的导航对象
 * @param {Function} props.updateAuthState - 更新认证状态的函数
 * @returns {JSX.Element} 登录页面的JSX结构
 */
const LoginScreen = ({navigation, updateAuthState}) => {
  /**
   * 状态管理
   * 
   * useState Hook用于在函数组件中添加状态。
   * 每次状态更新时，组件会重新渲染。
   */

  // activeTab: 当前激活的选项卡
  // 'password': 账号密码登录
  // 'phone': 手机验证码登录
  const [activeTab, setActiveTab] = useState('password');

  // loading: 登录按钮的加载状态
  // true: 正在登录，显示加载动画，禁用按钮
  // false: 可以点击登录
  const [loading, setLoading] = useState(false);

  // smsLoading: 发送验证码按钮的加载状态
  // true: 正在发送验证码，显示加载动画，禁用按钮
  // false: 可以点击发送
  const [smsLoading, setSmsLoading] = useState(false);

  // countdown: 验证码倒计时（秒）
  // 0: 可以发送验证码
  // >0: 显示倒计时，禁用发送按钮
  const [countdown, setCountdown] = useState(0);

  // 密码登录表单的状态
  // username: 用户名输入框的值
  const [username, setUsername] = useState('');
  // password: 密码输入框的值
  const [password, setPassword] = useState('');

  // 手机验证码登录表单的状态
  // phone: 手机号输入框的值
  const [phone, setPhone] = useState('');
  // code: 验证码输入框的值
  const [code, setCode] = useState('');

  /**
   * 发送短信验证码
   * 
   * 这个函数处理发送验证码的逻辑：
   * 1. 验证手机号是否为空
   * 2. 验证手机号格式是否正确（11位，以1开头，第二位是3-9）
   * 3. 调用API发送验证码
   * 4. 如果成功，开始60秒倒计时
   * 5. 倒计时期间禁用发送按钮
   * 
   * @returns {Promise<void>}
   */
  const handleSendSmsCode = async () => {
    // 检查手机号是否为空
    if (!phone) {
      // Alert.alert: 显示原生提示框
      // 参数：标题，内容
      Alert.alert('提示', '请输入手机号');
      return; // 提前返回，不执行后续代码
    }

    // 验证手机号格式
    // 正则表达式：^1[3-9]\d{9}$
    // ^: 字符串开始
    // 1: 必须以1开头
    // [3-9]: 第二位必须是3-9之间的数字
    // \d{9}: 后面9位必须是数字
    // $: 字符串结束
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    // 设置加载状态为true，禁用按钮并显示加载动画
    setSmsLoading(true);
    try {
      // 调用API发送验证码
      // sendSmsCode是异步函数，需要使用await等待结果
      const response = await sendSmsCode(phone);
      
      // 检查响应状态码
      // 200表示成功
      if (response.data.code === 200) {
        Alert.alert('成功', '验证码已发送');
        
        // 开始60秒倒计时
        setCountdown(60);
        
        // setInterval: 定时器，每隔1000毫秒（1秒）执行一次
        const timer = setInterval(() => {
          // 使用函数式更新，prev是当前countdown的值
          setCountdown(prev => {
            // 如果倒计时小于等于1，清除定时器并返回0
            if (prev <= 1) {
              clearInterval(timer); // 清除定时器，停止倒计时
              return 0;
            }
            // 否则返回prev - 1，倒计时减1
            return prev - 1;
          });
        }, 1000); // 每1000毫秒执行一次
      } else {
        // 如果API返回错误，显示错误信息
        Alert.alert('错误', response.data.message || '发送验证码失败');
      }
    } catch (error) {
      // 如果API调用失败（网络错误等），显示错误信息
      Alert.alert('错误', error.message || '发送验证码失败');
    } finally {
      // finally块中的代码无论成功或失败都会执行
      // 设置加载状态为false，恢复按钮可用
      setSmsLoading(false);
    }
  };

  /**
   * 密码登录处理函数
   * 
   * 这个函数处理账号密码登录的逻辑：
   * 1. 验证用户名和密码是否都已输入
   * 2. 调用AuthService.login进行登录
   * 3. 如果登录成功，更新认证状态并跳转到主页
   * 4. 如果登录失败，显示错误提示
   * 
   * @returns {Promise<void>}
   */
  const handlePasswordLogin = async () => {
    // 验证表单：检查用户名和密码是否都已输入
    if (!username || !password) {
      Alert.alert('提示', '请输入用户名和密码');
      return;
    }

    // 设置加载状态为true，禁用登录按钮并显示加载动画
    setLoading(true);
    try {
      // 调用认证服务进行登录
      // AuthService.login是异步函数，返回登录结果
      const result = await AuthService.login(username, password);
      
      // 检查登录是否成功
      if (result.success) {
        // 登录成功，更新认证状态
        // updateAuthState是父组件传递的函数，用于通知导航器更新状态
        if (updateAuthState) {
          updateAuthState(true);
        }
        
        // 重置导航栈，跳转到主页
        // navigation.reset: 重置导航栈，清除历史记录
        // index: 0 - 当前页面在栈中的索引
        // routes: 新的路由栈，只包含Profile页面
        navigation.reset({
          index: 0,
          routes: [{name: 'Profile'}],
        });
      } else {
        // 登录失败，显示错误信息
        Alert.alert('登录失败', result.message);
      }
    } catch (error) {
      // 如果登录过程中出错（网络错误等），显示错误提示
      Alert.alert('错误', error.message || '登录失败，请稍后重试');
    } finally {
      // 无论成功或失败，都要恢复加载状态
      setLoading(false);
    }
  };

  /**
   * 手机验证码登录处理函数
   * 
   * 这个函数处理手机验证码登录的逻辑：
   * 1. 验证手机号和验证码是否都已输入
   * 2. 调用AuthService.loginByPhone进行登录
   * 3. 如果登录成功，更新认证状态并跳转到主页
   * 4. 如果登录失败，显示错误提示
   * 
   * @returns {Promise<void>}
   */
  const handlePhoneLogin = async () => {
    // 验证表单：检查手机号和验证码是否都已输入
    if (!phone || !code) {
      Alert.alert('提示', '请输入手机号和验证码');
      return;
    }

    // 设置加载状态为true
    setLoading(true);
    try {
      // 调用认证服务进行手机号登录
      const result = await AuthService.loginByPhone(phone, code);
      
      // 检查登录是否成功
      if (result.success) {
        // 登录成功，更新认证状态
        if (updateAuthState) {
          updateAuthState(true);
        }
        
        // 重置导航栈，跳转到主页
        navigation.reset({
          index: 0,
          routes: [{name: 'Profile'}],
        });
      } else {
        // 登录失败，显示错误信息
        Alert.alert('登录失败', result.message);
      }
    } catch (error) {
      // 如果登录过程中出错，显示错误提示
      Alert.alert('错误', error.message || '登录失败，请稍后重试');
    } finally {
      // 恢复加载状态
      setLoading(false);
    }
  };

  /**
   * 渲染方法
   * 
   * 返回登录页面的JSX结构
   * 
   * 组件结构说明：
   * - KeyboardAvoidingView: 键盘避让视图，当键盘弹出时自动调整布局
   *   behavior: iOS使用'padding'，Android使用'height'
   * - ScrollView: 可滚动视图，当内容超出屏幕时可以滚动查看
   *   keyboardShouldPersistTaps="handled": 键盘显示时允许点击其他区域
   */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* 主要内容容器 */}
        <View style={styles.content}>
          {/* 页面标题 */}
          <Text style={styles.title}>登录</Text>

          {/* 选项卡容器：用于切换登录方式 */}
          <View style={styles.tabContainer}>
            {/* 账号密码选项卡 */}
            {/* 样式数组：可以组合多个样式，activeTab === 'password'时应用activeTab样式（高亮显示） */}
            {/* 点击时切换到密码登录 */}
            <TouchableOpacity
              style={[styles.tab, activeTab === 'password' && styles.activeTab]}
              onPress={() => setActiveTab('password')}>
              {/* 如果当前选项卡激活，应用激活样式 */}
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'password' && styles.activeTabText,
                ]}>
                账号密码
              </Text>
            </TouchableOpacity>
            
            {/* 手机验证码选项卡 */}
            <TouchableOpacity
              style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
              onPress={() => setActiveTab('phone')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'phone' && styles.activeTabText,
                ]}>
                手机验证码
              </Text>
            </TouchableOpacity>
          </View>

          {/* 密码登录表单：只有当activeTab === 'password'时才显示 */}
          {activeTab === 'password' && (
            <View style={styles.form}>
              {/* 用户名输入框 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>用户名</Text>
                {/* value: 输入框的值，绑定到username状态 */}
                {/* onChangeText: 当输入内容改变时调用setUsername更新username状态 */}
                {/* autoCapitalize: 自动大写设置，"none"表示不自动大写 */}
                <TextInput
                  style={styles.input}
                  placeholder="请输入用户名"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* 密码输入框 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>密码</Text>
                {/* secureTextEntry: 安全文本输入，true表示显示为密文（圆点），用于密码输入 */}
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* 登录按钮 */}
              {/* disabled: 禁用状态，loading时禁用按钮，防止重复提交 */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePasswordLogin}
                disabled={loading}>
                {/* 条件渲染：如果正在加载，显示加载动画，否则显示文字 */}
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>登录</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 手机验证码登录表单：只有当activeTab === 'phone'时才显示 */}
          {activeTab === 'phone' && (
            <View style={styles.form}>
              {/* 手机号输入框 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>手机号</Text>
                {/* keyboardType: 键盘类型，"phone-pad"表示数字键盘，适合输入手机号 */}
                {/* maxLength: 最大输入长度，11表示手机号最多11位 */}
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>

              {/* 验证码输入框和发送按钮 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>验证码</Text>
                {/* 验证码容器：输入框和按钮横向排列 */}
                <View style={styles.codeContainer}>
                  {/* 验证码输入框 */}
                  {/* keyboardType: "number-pad"表示纯数字键盘 */}
                  {/* maxLength: 验证码通常是6位 */}
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="请输入验证码"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  {/* 发送验证码按钮 */}
                  {/* 如果正在发送或倒计时中，应用禁用样式 */}
                  {/* 正在发送或倒计时中时禁用按钮 */}
                  <TouchableOpacity
                    style={[
                      styles.codeButton,
                      (smsLoading || countdown > 0) && styles.codeButtonDisabled,
                    ]}
                    onPress={handleSendSmsCode}
                    disabled={smsLoading || countdown > 0}>
                    {/* 条件渲染：如果正在发送，显示加载动画，否则显示倒计时或"获取验证码"文字 */}
                    {smsLoading ? (
                      <ActivityIndicator size="small" color="#1890ff" />
                    ) : (
                      <Text style={styles.codeButtonText}>
                        {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* 登录按钮 */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePhoneLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>登录</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  // 滚动内容容器样式
  scrollContent: {
    flexGrow: 1, // 内容可以增长，填满可用空间
  },
  // 主要内容容器样式
  content: {
    flex: 1, // 占满父容器
    padding: 20, // 内边距20像素
    justifyContent: 'center', // 垂直居中对齐
  },
  // 标题样式
  title: {
    fontSize: 32, // 字体大小32
    fontWeight: 'bold', // 粗体
    textAlign: 'center', // 文本居中
    marginBottom: 40, // 底部外边距40像素
    color: '#1890ff', // 蓝色文字
  },
  // 选项卡容器样式
  tabContainer: {
    flexDirection: 'row', // 横向排列
    marginBottom: 30, // 底部外边距30像素
    backgroundColor: '#fff', // 白色背景
    borderRadius: 8, // 圆角8像素
    padding: 4, // 内边距4像素
  },
  // 选项卡样式
  tab: {
    flex: 1, // 平均分配空间
    paddingVertical: 12, // 垂直内边距12像素
    alignItems: 'center', // 水平居中
    borderRadius: 6, // 圆角6像素
  },
  // 激活状态的选项卡样式
  activeTab: {
    backgroundColor: '#1890ff', // 蓝色背景
  },
  // 选项卡文字样式
  tabText: {
    fontSize: 16, // 字体大小16
    color: '#666', // 灰色文字
  },
  // 激活状态的选项卡文字样式
  activeTabText: {
    color: '#fff', // 白色文字
    fontWeight: 'bold', // 粗体
  },
  // 表单容器样式
  form: {
    backgroundColor: '#fff', // 白色背景
    borderRadius: 8, // 圆角8像素
    padding: 20, // 内边距20像素
  },
  // 输入框容器样式
  inputContainer: {
    marginBottom: 20, // 底部外边距20像素
  },
  // 标签样式
  label: {
    fontSize: 14, // 字体大小14
    color: '#333', // 深灰色文字
    marginBottom: 8, // 底部外边距8像素
  },
  // 输入框样式
  input: {
    borderWidth: 1, // 边框宽度1像素
    borderColor: '#d9d9d9', // 浅灰色边框
    borderRadius: 6, // 圆角6像素
    paddingHorizontal: 12, // 水平内边距12像素
    paddingVertical: 10, // 垂直内边距10像素
    fontSize: 16, // 字体大小16
  },
  // 验证码容器样式
  codeContainer: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中对齐
  },
  // 验证码输入框样式
  codeInput: {
    flex: 1, // 占据剩余空间
    marginRight: 10, // 右边距10像素
  },
  // 验证码按钮样式
  codeButton: {
    paddingHorizontal: 16, // 水平内边距16像素
    paddingVertical: 10, // 垂直内边距10像素
    backgroundColor: '#f0f0f0', // 浅灰色背景
    borderRadius: 6, // 圆角6像素
    borderWidth: 1, // 边框宽度1像素
    borderColor: '#1890ff', // 蓝色边框
  },
  // 验证码按钮禁用状态样式
  codeButtonDisabled: {
    opacity: 0.6, // 透明度0.6，显示为半透明
  },
  // 验证码按钮文字样式
  codeButtonText: {
    color: '#1890ff', // 蓝色文字
    fontSize: 14, // 字体大小14
  },
  // 登录按钮样式
  button: {
    backgroundColor: '#1890ff', // 蓝色背景
    borderRadius: 6, // 圆角6像素
    paddingVertical: 14, // 垂直内边距14像素
    alignItems: 'center', // 水平居中
    marginTop: 10, // 顶部外边距10像素
  },
  // 登录按钮禁用状态样式
  buttonDisabled: {
    opacity: 0.6, // 透明度0.6
  },
  // 登录按钮文字样式
  buttonText: {
    color: '#fff', // 白色文字
    fontSize: 16, // 字体大小16
    fontWeight: 'bold', // 粗体
  },
});

// 导出LoginScreen组件，供其他文件导入使用
export default LoginScreen;
