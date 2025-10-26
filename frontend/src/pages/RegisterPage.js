import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/register', values);
      if (response.data.code === 200) {
        // 保存Token到本地存储
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        
        // 显示成功消息
        message.success('注册成功');
        
        // 跳转到主页
        navigate('/');
      } else {
        message.error(response.data.message || '注册失败');
      }
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || '注册失败');
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Card className="register-form">
        <Title level={2} className="register-form-title">用户注册</Title>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          scrollToFirstError
        >
          <Form.Item
            name="username"
            className="form-item-margin"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 4, message: '用户名至少4个字符' },
              { max: 50, message: '用户名最多50个字符' }
            ]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
          </Form.Item>
          
          <Form.Item
            name="password"
            className="form-item-margin"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符' }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="密码" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            className="form-item-margin"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="确认密码" />
          </Form.Item>
          
          <Form.Item
            name="email"
            className="form-item-margin"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '邮箱格式不正确!' }
            ]}
          >
            <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="邮箱" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            className="form-item-margin"
            rules={[
              { required: false },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' }
            ]}
          >
            <Input prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder="手机号（选填）" />
          </Form.Item>
          
          <Form.Item className="form-item-margin">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              注册
            </Button>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              已有账号？ <Link to="/login">立即登录</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;