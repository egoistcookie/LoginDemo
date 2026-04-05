// API配置
const config = {
  // API基础URL
  // 开发环境：使用完整URL（直接访问后端）
  // 生产环境：使用相对路径（通过Nginx代理）
  // 可以通过环境变量 REACT_APP_API_BASE_URL 覆盖
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || (
    process.env.NODE_ENV === 'production' 
      ? '/api'  // 生产环境：使用相对路径，通过Nginx代理
      : 'http://egoistcookie.top:8080/api'  // 开发环境：使用本地后端
  ),

  // 其他配置可以在这里添加
  APP_NAME: '登录演示系统',
  VERSION: '1.0.0'
};

export default config;
