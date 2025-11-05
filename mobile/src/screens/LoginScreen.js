/**
 * 登录页面
 */
import React, {useState} from 'react';
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
import AuthService from '../services/AuthService';
import {sendSmsCode} from '../api/auth';

const LoginScreen = ({navigation, updateAuthState}) => {
  const [activeTab, setActiveTab] = useState('password'); // 'password' 或 'phone'
  const [loading, setLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 密码登录表单
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 手机验证码登录表单
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  // 发送短信验证码
  const handleSendSmsCode = async () => {
    if (!phone) {
      Alert.alert('提示', '请输入手机号');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setSmsLoading(true);
    try {
      const response = await sendSmsCode(phone);
      if (response.data.code === 200) {
        Alert.alert('成功', '验证码已发送');
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Alert.alert('错误', response.data.message || '发送验证码失败');
      }
    } catch (error) {
      Alert.alert('错误', error.message || '发送验证码失败');
    } finally {
      setSmsLoading(false);
    }
  };

  // 密码登录
  const handlePasswordLogin = async () => {
    if (!username || !password) {
      Alert.alert('提示', '请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.login(username, password);
      if (result.success) {
        // 更新认证状态
        if (updateAuthState) {
          updateAuthState(true);
        }
        // 登录成功，导航会由AppNavigator自动处理
        navigation.reset({
          index: 0,
          routes: [{name: 'Profile'}],
        });
      } else {
        Alert.alert('登录失败', result.message);
      }
    } catch (error) {
      Alert.alert('错误', error.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 手机验证码登录
  const handlePhoneLogin = async () => {
    if (!phone || !code) {
      Alert.alert('提示', '请输入手机号和验证码');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.loginByPhone(phone, code);
      if (result.success) {
        // 更新认证状态
        if (updateAuthState) {
          updateAuthState(true);
        }
        // 登录成功
        navigation.reset({
          index: 0,
          routes: [{name: 'Profile'}],
        });
      } else {
        Alert.alert('登录失败', result.message);
      }
    } catch (error) {
      Alert.alert('错误', error.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>登录</Text>

          {/* 选项卡 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'password' && styles.activeTab]}
              onPress={() => setActiveTab('password')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'password' && styles.activeTabText,
                ]}>
                账号密码
              </Text>
            </TouchableOpacity>
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

          {/* 密码登录表单 */}
          {activeTab === 'password' && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>用户名</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入用户名"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>密码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePasswordLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>登录</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 手机验证码登录表单 */}
          {activeTab === 'phone' && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>手机号</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>验证码</Text>
                <View style={styles.codeContainer}>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="请输入验证码"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[
                      styles.codeButton,
                      (smsLoading || countdown > 0) && styles.codeButtonDisabled,
                    ]}
                    onPress={handleSendSmsCode}
                    disabled={smsLoading || countdown > 0}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1890ff',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#1890ff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    marginRight: 10,
  },
  codeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1890ff',
  },
  codeButtonDisabled: {
    opacity: 0.6,
  },
  codeButtonText: {
    color: '#1890ff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1890ff',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;

