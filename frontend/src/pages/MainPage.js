import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, message, Menu } from 'antd';
import { LogoutOutlined, UserOutlined, HomeOutlined, UserAddOutlined, UnorderedListOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';
import UsersListPage from './UsersListPage';
import RolesListPage from './RolesListPage';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

const MainPage = ({ setIsAuthenticated }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('home-dashboard');

  // 菜单项数据
  const menuItems = [
    {
      key: 'home',
      title: '首页',
      icon: <HomeOutlined />,
      children: [
        { key: 'home-dashboard', title: '数据看板' },
        { key: 'home-stats', title: '统计报表' },
        { key: 'home-overview', title: '概览信息' }
      ]
    },
    {
      key: 'users',
      title: '人员管理',
      icon: <UserAddOutlined />,
      children: [
        { key: 'users-list', title: '用户列表' },
        { key: 'users-add', title: '添加用户' },
        { key: 'users-import', title: '导入用户' }
      ]
    },
    {
      key: 'roles',
      title: '角色管理',
      icon: <UserOutlined />,
      children: [
        { key: 'roles-list', title: '角色列表' },
        { key: 'roles-add', title: '创建角色' },
        { key: 'roles-permissions', title: '权限配置' }
      ]
    },
    {
      key: 'menus',
      title: '菜单管理',
      icon: <UnorderedListOutlined />,
      children: [
        { key: 'menus-list', title: '菜单列表' },
        { key: 'menus-add', title: '添加菜单' },
        { key: 'menus-sort', title: '排序设置' }
      ]
    },
    {
      key: 'more',
      title: '未完待续',
      icon: <SettingOutlined />,
      children: [
        { key: 'more-settings', title: '系统设置' },
        { key: 'more-help', title: '帮助文档' },
        { key: 'more-about', title: '关于系统' }
      ]
    }
  ];

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

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    console.log('点击菜单:', key);
    setActivePage(key);
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
      
      <Layout>
        {/* 侧边导航菜单 */}
        <Sider 
          width={250} 
          theme="light" 
          className="sider"
          collapsible
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
        >
          <div className="logo" style={{ padding: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
            系统菜单
          </div>
          <Menu
            mode="inline"
            theme="light"
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
            // 由于antd v5的Menu组件API变更，这里使用items属性而不是直接遍历
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.title,
              children: item.children?.map(child => ({
                key: child.key,
                label: child.title
              }))
            }))}
          />
        </Sider>

        <Content className="content">
          {activePage === 'users-list' ? (
            <UsersListPage />
          ) : activePage === 'roles-list' ? (
            <RolesListPage />
          ) : (
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
          )}
        </Content>
      </Layout>
      
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
        
        .sider {
          overflow: auto;
          height: calc(100vh - 64px);
        }
        
        .content {
          padding: 24px;
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