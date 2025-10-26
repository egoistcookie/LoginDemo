import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, message } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const MainPage = ({ setIsAuthenticated }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/users/me');
        if (response.data.code === 200) {
          setUserInfo(response.data.data);
        }
      } catch (error) {
        message.error('获取用户信息失败');
      }
    };

    fetchUserInfo();
  }, []);

  // 登出
  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await axios.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // 清除本地存储
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // 设置认证状态
      setIsAuthenticated(false);
      
      // 显示成功消息
      message.success('登出成功');
    } catch (error) {
      // 即使后端出错，也要清除本地状态
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      message.success('登出成功');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="main-container">
      <Header className="header">
        <Title level={3} style={{ color: 'white', margin: 0 }}>登录系统</Title>
        <div>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            loading={loading}
          >
            登出
          </Button>
        </div>
      </Header>
      <Content className="content">
        <Title level={2}>
          <UserOutlined /> 欢迎回来，{userInfo?.username || '用户'}
        </Title>
        {userInfo && (
          <div>
            <Paragraph>ID: {userInfo.id}</Paragraph>
            <Paragraph>邮箱: {userInfo.email}</Paragraph>
            <Paragraph>手机号: {userInfo.phone || '未设置'}</Paragraph>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default MainPage;