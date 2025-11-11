# LoginDemo 微信小程序

这是 LoginDemo 后端服务的微信小程序前端，实现了基本的登录和用户信息展示功能。

## 项目结构

```
miniprogram/
├── app.js                 # 小程序入口文件
├── app.json               # 小程序全局配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置文件
├── sitemap.json          # 站点地图配置
├── config/               # 配置文件目录
│   └── api.js           # API配置
├── utils/                # 工具类目录
│   ├── api.js           # API请求封装
│   ├── auth.js          # 认证工具
│   └── storage.js       # 本地存储工具
└── pages/                # 页面目录
    ├── login/           # 登录页面
    │   ├── login.js
    │   ├── login.wxml
    │   ├── login.wxss
    │   └── login.json
    └── profile/          # 用户信息页面
        ├── profile.js
        ├── profile.wxml
        ├── profile.wxss
        └── profile.json
```

## 功能特性

- ✅ 用户登录（用户名密码）
- ✅ Token自动管理
- ✅ 用户信息展示
- ✅ 退出登录
- ✅ 自动登录状态检查
- ✅ 网络请求统一封装
- ✅ 错误处理

## 快速开始

### 1. 环境准备

- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 确保后端服务已启动（默认端口：8080）

### 2. 配置API地址

编辑 `miniprogram/config/api.js`，修改API地址：

```javascript
// 注意：微信小程序中不能使用localhost，需要使用电脑的局域网IP地址
// Windows: ipconfig 查看IP
// Mac/Linux: ifconfig 查看IP
const DEV_API_URL = 'http://192.168.1.100:8080/api'; // 替换为你的电脑IP
```

### 3. 打开项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram` 目录
4. 使用测试号或正式AppID
5. 点击"确定"

### 4. 开发设置

在微信开发者工具中：
1. 点击右上角"详情"
2. 在"本地设置"中勾选"不校验合法域名"
3. 开始开发调试

## API接口

### 登录接口

- **URL**: `POST /auth/login`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "accessToken": "访问令牌",
      "refreshToken": "刷新令牌",
      "expiresIn": 3600000,
      "user": {
        "id": 1,
        "username": "用户名",
        "email": "邮箱",
        "phone": "手机号"
      }
    }
  }
  ```

### 获取用户信息接口

- **URL**: `GET /users/me`
- **请求头**: `Authorization: Bearer {accessToken}`
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱",
      "phone": "手机号"
    }
  }
  ```

## 调试说明

详细的调试指南请参考 [DEBUG.md](./DEBUG.md)

## 注意事项

1. **API地址配置**：开发阶段必须使用局域网IP地址，不能使用localhost
2. **域名校验**：开发阶段需要在开发者工具中关闭域名校验
3. **生产环境**：发布前需要在小程序后台配置服务器域名白名单
4. **Token管理**：Token自动存储在本地，过期后需要重新登录

## 技术栈

- 微信小程序原生框架
- ES6+ JavaScript
- 微信小程序API

## 开发规范

- 使用ES6模块化（import/export）
- 统一使用Promise/async-await处理异步
- 统一的错误处理和用户提示
- 代码注释清晰

## 许可证

MIT

