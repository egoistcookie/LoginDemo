import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Tabs, Typography, Space } from 'antd';
import { MailOutlined, MobileOutlined, LockOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { TabPane } = Tabs;

const ForgotPasswordPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const navigate = useNavigate();
  const [emailForm] = Form.useForm();
  const [phoneForm] = Form.useForm();

  // 发送邮箱验证码
  const sendEmailCode = async () => {
    try {
      const email = emailForm.getFieldValue('email');
      if (!email) {
        message.error('请先输入邮箱');
        return;
      }
      
      await axios.post('/auth/send-email-code', { email });
      message.success('验证码已发送，请查收邮箱');
      setEmailCountdown(60);
      const timer = setInterval(() => {
        setEmailCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '发送失败');
    }
  };

  // 发送短信验证码
  const sendSmsCode = async () => {
    try {
      const phone = phoneForm.getFieldValue('phone');
      if (!phone) {
        message.error('请先输入手机号');
        return;
      }
      
      await axios.post('/auth/send-sms-code', { phone });
      message.success('验证码已发送，请查收短信');
      setPhoneCountdown(60);
      const timer = setInterval(() => {
        setPhoneCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '发送失败');
    }
  };

  // 邮箱重置密码
  const handleEmailReset = async (values) => {
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        type: 'email',
        account: values.email,
        code: values.code,
        newPassword: values.newPassword
      });
      message.success('密码重置成功，请使用新密码登录');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  // 手机号重置密码
  const handlePhoneReset = async (values) => {
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        type: 'phone',
        account: values.phone,
        code: values.code,
        newPassword: values.newPassword
      });
      message.success('密码重置成功，请使用新密码登录');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <Button
          type="text"
          icon={theme === 'dark' ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggleTheme}
          style={{ color: theme === 'dark' ? '#fff' : '#000' }}
          title={theme === 'dark' ? '切换到浅色模式' : '切换到暗黑模式'}
        />
      </div>
      <Card className="login-form" style={{ width: 420 }}>
        <Title level={2} className="login-form-title">找回密码</Title>
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          {/* 邮箱找回 */}
          <TabPane tab={<span><MailOutlined />邮箱找回</span>} key="email">
            <Form
              form={emailForm}
              layout="vertical"
              onFinish={handleEmailReset}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入注册邮箱"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="code"
                label="验证码"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="请输入验证码"
                    size="large"
                    style={{ flex: 1 }}
                  />
                  <Button
                    onClick={sendEmailCode}
                    disabled={emailCountdown > 0}
                    size="large"
                  >
                    {emailCountdown > 0 ? `${emailCountdown}秒` : '获取验证码'}
                  </Button>
                </div>
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少6位' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入新密码（至少6位）"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入新密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={loading}
                  block
                  size="large"
                >
                  重置密码
                </Button>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Space>
                    <Link to="/login">返回登录</Link>
                    <span>|</span>
                    <Link to="/register">注册账号</Link>
                  </Space>
                </div>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 手机号找回 */}
          <TabPane tab={<span><MobileOutlined />手机号找回</span>} key="phone">
            <Form
              form={phoneForm}
              layout="vertical"
              onFinish={handlePhoneReset}
              autoComplete="off"
            >
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                ]}
              >
                <Input
                  prefix={<MobileOutlined />}
                  placeholder="请输入注册手机号"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="code"
                label="验证码"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="请输入验证码"
                    size="large"
                    style={{ flex: 1 }}
                  />
                  <Button
                    onClick={sendSmsCode}
                    disabled={phoneCountdown > 0}
                    size="large"
                  >
                    {phoneCountdown > 0 ? `${phoneCountdown}秒` : '获取验证码'}
                  </Button>
                </div>
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少6位' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入新密码（至少6位）"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入新密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={loading}
                  block
                  size="large"
                >
                  重置密码
                </Button>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Space>
                    <Link to="/login">返回登录</Link>
                    <span>|</span>
                    <Link to="/register">注册账号</Link>
                  </Space>
                </div>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

