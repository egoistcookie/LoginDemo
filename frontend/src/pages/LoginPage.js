import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, Button, Checkbox, message, Typography, Card, Tabs, Spin } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, WechatOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { TabPane } = Tabs;

const LoginPage = ({ setIsAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [smsLoading, setSmsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [wechatQrcode, setWechatQrcode] = useState('');
  const [wechatLoading, setWechatLoading] = useState(false);
  const [qrcodeStatus, setQrcodeStatus] = useState('waiting'); // waiting, scanned, expired, success
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const navigate = useNavigate();
  const [passwordForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const qrcodeTimerRef = useRef(null);
  const statusPollTimerRef = useRef(null);

  // 自动登录处理函数
  const handleAutoLogin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', credentials);
      if (response.data.code === 200) {
        // 保存Token到本地存储
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        
        // 设置认证状态
        setIsAuthenticated(true);
        
        // 显示成功消息
        message.success('自动登录成功');
        
        // 跳转到主页
        navigate('/');
      } else {
        message.error(response.data.message || '登录失败，请手动输入账号密码');
      }
    } catch (error) {
      // 错误时不显示消息，允许用户手动登录
      console.log('自动登录失败，允许手动登录', error);
    } finally {
      setLoading(false);
    }
  }, [navigate, setIsAuthenticated]);

  // 自动登录功能 - 只在页面刷新时触发，不在用户主动登出后触发
  useEffect(() => {
    // 检查是否是用户主动登出
    const isUserInitiatedLogout = sessionStorage.getItem('userInitiatedLogout') === 'true';
    
    // 如果是用户主动登出，清除标志但不执行自动登录
    if (isUserInitiatedLogout) {
      // 清除登出标志，以便下次页面刷新时可以正常自动登录
      sessionStorage.removeItem('userInitiatedLogout');
      return; // 直接返回，不执行自动登录
    }
    
    // 如果不是用户主动登出，执行自动登录
    // 默认的测试账号
    const defaultCredentials = {
      username: '1111',
      password: '111111'
    };
    
    // 直接调用登录方法
    handleAutoLogin(defaultCredentials);
  }, [handleAutoLogin]);

  // 获取验证码图片
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const response = await axios.get('/captcha/image');
      if (response.data.code === 200) {
        setCaptchaKey(response.data.data.captchaKey);
        setCaptchaImage(response.data.data.image);
      } else {
        message.error(response.data.message || '获取验证码失败');
      }
    } catch (error) {
      console.error('获取验证码失败:', error);
      message.error('获取验证码失败，请稍后重试');
    } finally {
      setCaptchaLoading(false);
    }
  };

  // 检查是否需要验证码
  const checkCaptchaRequired = async (username) => {
    if (!username) {
      setCaptchaRequired(false);
      return;
    }
    try {
      const response = await axios.get(`/captcha/required?username=${encodeURIComponent(username)}`);
      if (response.data.code === 200) {
        const required = response.data.data;
        setCaptchaRequired(required);
        if (required && !captchaImage) {
          // 如果需要验证码且还没有获取，自动获取
          fetchCaptcha();
        }
      }
    } catch (error) {
      console.error('检查验证码需求失败:', error);
      // 失败时不显示错误，默认不需要验证码
      setCaptchaRequired(false);
    }
  };

  // 账号密码登录
  const onPasswordLogin = async (values) => {
    setLoading(true);
    try {
      // 如果需要验证码，添加验证码信息
      const loginData = { ...values };
      if (captchaRequired) {
        loginData.captchaKey = captchaKey;
        loginData.captchaCode = values.captchaCode;
      }
      
      const response = await axios.post('/auth/login', loginData);
      if (response.data.code === 200) {
        // 登录成功，清除验证码状态
        setCaptchaRequired(false);
        setCaptchaKey('');
        setCaptchaImage('');
        handleLoginSuccess(response.data.data);
      } else {
        message.error(response.data.message || '登录失败');
        // 登录失败后重新获取验证码
        if (captchaRequired) {
          fetchCaptcha();
        }
      }
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.message || '登录失败';
        message.error(errorMsg);
        // 如果返回需要验证码的错误，检查是否需要验证码
        if (errorMsg.includes('验证码')) {
          const username = passwordForm.getFieldValue('username');
          if (username) {
            checkCaptchaRequired(username);
          }
        }
        // 登录失败后重新获取验证码
        if (captchaRequired) {
          fetchCaptcha();
        }
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 发送手机验证码
  const sendSmsCode = async () => {
    try {
      const phone = phoneForm.getFieldValue('phone');
      if (!phone) {
        message.error('请输入手机号');
        return;
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        message.error('请输入正确的手机号');
        return;
      }

      setSmsLoading(true);
      const response = await axios.post('/auth/send-sms-code', { phone });
      if (response.data.code === 200) {
        message.success('验证码已发送');
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        // 保存定时器引用以便清理
        qrcodeTimerRef.current = timer;
      } else {
        message.error(response.data.message || '发送验证码失败');
      }
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || '发送验证码失败');
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setSmsLoading(false);
    }
  };

  // 手机验证码登录
  const onPhoneLogin = async (values) => {
    console.log('手机验证码登录，表单值:', values);
    if (!values.phone || !values.code) {
      message.error('请输入手机号和验证码');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/auth/login-by-phone', {
        phone: values.phone,
        code: values.code
      });
      if (response.data.code === 200) {
        handleLoginSuccess(response.data.data);
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      console.error('手机验证码登录错误:', error);
      if (error.response) {
        message.error(error.response.data.message || '登录失败');
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取微信登录二维码
  const fetchWechatQrcode = async () => {
    setWechatLoading(true);
    setQrcodeStatus('waiting');
    try {
      const response = await axios.get('/auth/wechat/qrcode');
      if (response.data.code === 200) {
        setWechatQrcode(response.data.data.qrcodeUrl);
        const ticket = response.data.data.ticket;
        // 开始轮询检查扫码状态
        startPollingStatus(ticket);
      } else {
        message.error(response.data.message || '获取二维码失败');
        setQrcodeStatus('expired');
      }
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || '获取二维码失败');
      } else {
        message.error('网络错误，请稍后重试');
      }
      setQrcodeStatus('expired');
    } finally {
      setWechatLoading(false);
    }
  };

  // 轮询检查微信扫码状态
  const startPollingStatus = (ticket) => {
    // 清除之前的定时器
    if (statusPollTimerRef.current) {
      clearInterval(statusPollTimerRef.current);
    }

    let pollCount = 0;
    const maxPollCount = 120; // 最多轮询2分钟（120次，每次1秒）

    statusPollTimerRef.current = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPollCount) {
        clearInterval(statusPollTimerRef.current);
        setQrcodeStatus('expired');
        message.error('二维码已过期，请刷新');
        return;
      }

      try {
        const response = await axios.get(`/auth/wechat/status?ticket=${ticket}`);
        if (response.data.code === 200) {
          const status = response.data.data.status;
          
          if (status === 'scanned') {
            setQrcodeStatus('scanned');
          } else if (status === 'confirmed') {
            clearInterval(statusPollTimerRef.current);
            setQrcodeStatus('success');
            // 登录成功
            const authData = response.data.data.authResponse;
            handleLoginSuccess(authData);
          } else if (status === 'expired') {
            clearInterval(statusPollTimerRef.current);
            setQrcodeStatus('expired');
            message.error('二维码已过期');
          }
        }
      } catch (error) {
        // 轮询错误不显示消息，继续轮询
        console.error('轮询状态失败:', error);
      }
    }, 1000);
  };

  // 登录成功处理
  const handleLoginSuccess = (data) => {
    // 清除轮询定时器
    if (statusPollTimerRef.current) {
      clearInterval(statusPollTimerRef.current);
    }

    // 保存Token到本地存储
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // 设置认证状态
    setIsAuthenticated(true);
    
    // 显示成功消息
    message.success('登录成功');
    
    // 跳转到主页
    navigate('/');
  };

  // 切换登录方式时处理
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // 切换到微信登录时，自动获取二维码
    if (key === 'wechat' && !wechatQrcode) {
      fetchWechatQrcode();
    }
    
    // 清除之前的轮询
    if (statusPollTimerRef.current) {
      clearInterval(statusPollTimerRef.current);
      statusPollTimerRef.current = null;
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (qrcodeTimerRef.current) {
        clearInterval(qrcodeTimerRef.current);
      }
      if (statusPollTimerRef.current) {
        clearInterval(statusPollTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="login-container">
      <Card className="login-form">
        <Title level={2} className="login-form-title">用户登录</Title>
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
          {/* 账号密码登录 */}
          <TabPane tab={<span><UserOutlined />账号密码</span>} key="password">
            <Form
              form={passwordForm}
              name="password_login"
              initialValues={{ remember: true, username: '1111', password: '111111' }}
              onFinish={onPasswordLogin}
            >
              <Form.Item
                name="username"
                className="form-item-margin"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="site-form-item-icon" />} 
                  placeholder="用户名"
                  onBlur={(e) => {
                    const username = e.target.value;
                    if (username) {
                      checkCaptchaRequired(username);
                    }
                  }}
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                className="form-item-margin"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="密码"
                />
              </Form.Item>
              
              {captchaRequired && (
                <Form.Item
                  name="captchaCode"
                  className="form-item-margin"
                  rules={[{ required: true, message: '请输入验证码!' }]}
                >
                  <div className="captcha-container">
                    <Input
                      placeholder="请输入验证码"
                      maxLength={4}
                      className="captcha-input"
                      onPressEnter={() => passwordForm.submit()}
                      autoComplete="off"
                    />
                    {captchaLoading ? (
                      <div style={{ 
                        width: '110px', 
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Spin size="small" />
                      </div>
                    ) : captchaImage ? (
                      <div className="captcha-image-container">
                        <img
                          src={captchaImage}
                          alt="验证码"
                          className="captcha-image"
                          onClick={fetchCaptcha}
                          title="点击刷新验证码"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={fetchCaptcha}
                          style={{ 
                            padding: '0',
                            minWidth: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="刷新验证码"
                        />
                      </div>
                    ) : (
                      <Button 
                        size="small" 
                        onClick={fetchCaptcha}
                        style={{ height: '40px', minWidth: '110px' }}
                      >
                        获取验证码
                      </Button>
                    )}
                  </div>
                </Form.Item>
              )}
              
              <Form.Item className="form-item-margin">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
              </Form.Item>
              
              <Form.Item className="form-item-margin">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={loading}
                  block
                >
                  登录
                </Button>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  还没有账号？ <Link to="/register">立即注册</Link>
                </div>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 手机验证码登录 */}
          <TabPane tab={<span><MobileOutlined />手机验证码</span>} key="phone">
            <Form
              form={phoneForm}
              name="phone_login"
              onFinish={onPhoneLogin}
            >
              <Form.Item
                name="phone"
                className="form-item-margin"
                rules={[
                  { required: true, message: '请输入手机号!' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号!' }
                ]}
              >
                <Input 
                  prefix={<MobileOutlined className="site-form-item-icon" />} 
                  placeholder="手机号" 
                  maxLength={11}
                />
              </Form.Item>
              
              <Form.Item
                className="form-item-margin"
                rules={[{ required: true, message: '请输入验证码!' }]}
              >
                <div className="sms-code-container">
                  <Form.Item
                    name="code"
                    noStyle
                    rules={[{ required: true, message: '请输入验证码!' }]}
                  >
                    <Input
                      className="sms-code-input"
                      placeholder="验证码"
                      maxLength={6}
                    />
                  </Form.Item>
                  <Button
                    style={{ height: '40px', minWidth: '120px', flexShrink: 0 }}
                    onClick={sendSmsCode}
                    loading={smsLoading}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                  </Button>
                </div>
              </Form.Item>
              
              <Form.Item className="form-item-margin">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={loading}
                  block
                >
                  登录
                </Button>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  还没有账号？ <Link to="/register">立即注册</Link>
                </div>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 微信扫码登录 */}
          <TabPane tab={<span><WechatOutlined />微信扫码</span>} key="wechat">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {wechatLoading ? (
                <Spin size="large" tip="加载中..." />
              ) : wechatQrcode ? (
                <div>
                  <div
                    style={{
                      width: '200px',
                      height: '200px',
                      margin: '0 auto 20px',
                      padding: '10px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <img
                      src={wechatQrcode}
                      alt="微信登录二维码"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  {qrcodeStatus === 'waiting' && (
                    <Typography.Text type="secondary">
                      请使用微信扫一扫二维码登录
                    </Typography.Text>
                  )}
                  {qrcodeStatus === 'scanned' && (
                    <Typography.Text type="warning">
                      已扫描，请在手机上确认登录
                    </Typography.Text>
                  )}
                  {qrcodeStatus === 'expired' && (
                    <div>
                      <Typography.Text type="danger" style={{ display: 'block', marginBottom: 10 }}>
                        二维码已过期
                      </Typography.Text>
                      <Button type="primary" onClick={fetchWechatQrcode}>
                        刷新二维码
                      </Button>
                    </div>
                  )}
                  {qrcodeStatus === 'success' && (
                    <Typography.Text type="success">
                      登录成功，正在跳转...
                    </Typography.Text>
                  )}
                </div>
              ) : (
                <div>
                  <Button type="primary" onClick={fetchWechatQrcode}>
                    获取二维码
                  </Button>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;