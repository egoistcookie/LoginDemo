import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import axios from 'axios';

// 设置axios基础配置
axios.defaults.baseURL = '/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 请求拦截器，添加Token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器，处理Token过期等错误
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token过期，清除本地存储并跳转到登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      } else if (error.response.status === 400 && error.response.data && error.response.data.message) {
        // 对于400错误，如果有错误信息，将其传递给Promise rejection
        error.message = error.response.data.message;
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查用户是否已认证
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // 验证Token有效性
          const response = await axios.get('/auth/validate', {
            params: { token }
          });
          setIsAuthenticated(response.data.data);
        } catch (error) {
          setIsAuthenticated(false);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };
    checkAuth();
  }, []);

  // 自定义受保护的路由组件
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainPage setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;