import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Button, message, Menu, Space } from 'antd';
import { LogoutOutlined, UserOutlined, HomeOutlined, UserAddOutlined, UnorderedListOutlined, SettingOutlined, 
         BarChartOutlined, FileTextOutlined, DatabaseOutlined, FileAddOutlined, DownloadOutlined,
         BookOutlined, InfoCircleOutlined, BulbOutlined, BulbFilled, FileSearchOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import UsersListPage from './UsersListPage';
import RolesListPage from './RolesListPage';
import MenusListPage from './MenusListPage';
import AuditLogPage from './AuditLogPage';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

const MainPage = ({ setIsAuthenticated }) => {
  const { theme, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('home-dashboard');
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  
  // 根据菜单key获取对应的图标
  const getMenuIcon = useCallback((menuKey) => {
    const iconMap = {
      'home': <HomeOutlined />,
      'dashboard': <BarChartOutlined />,
      'stats': <FileTextOutlined />,
      'overview': <DatabaseOutlined />,
      'users': <UserAddOutlined />,
      'users-list': <UserOutlined />,
      'users-add': <FileAddOutlined />,
      'users-import': <DownloadOutlined />,
      'roles': <UserOutlined />,
      'roles-list': <UserOutlined />,
      'roles-add': <FileAddOutlined />,
      'roles-permissions': <UnorderedListOutlined />,
      'menus': <UnorderedListOutlined />,
      'menus-list': <UnorderedListOutlined />,
      'menus-add': <FileAddOutlined />,
      'menus-sort': <SettingOutlined />,
      'more': <SettingOutlined />,
      'settings': <SettingOutlined />,
      'help': <BookOutlined />,
      'about': <InfoCircleOutlined />,
      'audit-logs': <FileSearchOutlined />
    };
    return iconMap[menuKey] || <UnorderedListOutlined />;
  }, []);
  
  // 构建菜单结构
  const buildMenuItems = useCallback((menus) => {
    return menus.map(menu => {
      const item = {
        key: menu.key,
        icon: getMenuIcon(menu.key),
        label: menu.name
      };
      
      if (menu.children && menu.children.length > 0) {
        item.children = buildMenuItems(menu.children);
      }
      
      return item;
    });
  }, [getMenuIcon]);

  // 获取用户信息和菜单
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取用户信息
        const userResponse = await axios.get('/users/me');
        if (userResponse.data.code === 200) {
          setUserInfo(userResponse.data.data);
        }
        
        // 获取用户菜单
        setMenuLoading(true);
        const menuResponse = await axios.get('/auth/user-menu');
        if (menuResponse.data.code === 200 && menuResponse.data.data) {
          const menus = menuResponse.data.data;
          const items = buildMenuItems(menus);
          setMenuItems(items);
          
          // 如果有菜单项，默认激活第一个
          if (items.length > 0) {
            const firstItem = items[0];
            if (firstItem.children && firstItem.children.length > 0) {
              setActivePage(firstItem.children[0].key);
            } else {
              setActivePage(firstItem.key);
            }
          }
        }
      } catch (error) {
        message.error('获取数据失败');
        console.error('Error fetching data:', error);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchData();
  }, [buildMenuItems]);

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
      
      // 设置明确的登出标志，表示这是用户主动登出而不是页面刷新
      sessionStorage.setItem('userInitiatedLogout', 'true');
      
      // 设置认证状态
      setIsAuthenticated(false);
      
      // 显示成功消息
      message.success('登出成功');
    } catch (error) {
      // 即使后端出错，也要清除本地状态
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.setItem('userInitiatedLogout', 'true');
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
        <Space>
          <Button
            type="text"
            icon={theme === 'dark' ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            style={{ color: 'white' }}
            title={theme === 'dark' ? '切换到浅色模式' : '切换到暗黑模式'}
          />
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            loading={loading}
          >
            登出
          </Button>
        </Space>
      </Header>
      
      <Layout>
        {/* 侧边导航菜单 */}
        <Sider 
          width={250} 
          theme={theme} 
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
            theme={theme}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            loading={menuLoading}
            selectedKeys={[activePage]}
          />
        </Sider>

        <Content className="content">
          {activePage === 'users-list' ? (
            <UsersListPage />
          ) : activePage === 'roles-list' ? (
            <RolesListPage />
          ) : activePage === 'menus-list' ? (
            <MenusListPage />
          ) : activePage === 'audit-logs' ? (
            <AuditLogPage />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
              <Title level={2}>
                <UserOutlined /> 欢迎回来，{userInfo?.username || '用户'}
              </Title>
              
              {/* 显示当前页面信息 */}
              <div className="current-page-info">
                <Paragraph>当前页面: {activePage}</Paragraph>
                {!menuLoading && menuItems.length === 0 && (
                  <Paragraph type="warning">暂无可用菜单权限</Paragraph>
                )}
              </div>
              
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

        .current-page-info {
          text-align: center;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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