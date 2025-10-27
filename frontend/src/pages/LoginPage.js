import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Typography, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const LoginPage = ({ setIsAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', values);
      if (response.data.code === 200) {
        // 保存Token到本地存储
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        
        // 设置认证状态
        setIsAuthenticated(true);
        
        // 显示成功消息
        message.success('登录成功');
        
        // 跳转到主页
        navigate('/');
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || '登录失败');
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form">
        <Title level={2} className="login-form-title">用户登录</Title>
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            className="form-item-margin"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
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
      </Card>
    </div>
  );
};

export default LoginPage;