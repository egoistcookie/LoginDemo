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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
          <Title level={2}>
            <UserOutlined /> 欢迎回来，{userInfo?.username || '用户'}
          </Title>
          
          {/* 旋转地球效果 */}
          <div className="earth-container">
            <div className="earth"></div>
          </div>
          
          {userInfo && (
            <div>
              <Paragraph>ID: {userInfo.id}</Paragraph>
              <Paragraph>邮箱: {userInfo.email}</Paragraph>
              <Paragraph>手机号: {userInfo.phone || '未设置'}</Paragraph>
            </div>
          )}
        </div>
      </Content>
      
      <style jsx>{`
        .main-container {
          min-height: 100vh;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 24px;
        }
        
        .content {
          padding: 40px;
          background-color: #f0f2f5;
          min-height: calc(100vh - 64px);
        }
        
        .earth-container {
          width: 200px;
          height: 200px;
          perspective: 1000px;
        }
        
        .earth {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-image: 
            radial-gradient(circle at 50% 50%, #0077b6, #023e8a 70%),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 10px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 10px);
          background-size: cover, 100% 100%, 100% 100%;
          background-position: center;
          box-shadow: 0 0 30px rgba(0, 123, 255, 0.5);
          animation: rotate 20s linear infinite;
          position: relative;
          overflow: hidden;
        }
        
        .earth::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
          pointer-events: none;
        }
        
        @keyframes rotate {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </Layout>
  );
};

export default MainPage;