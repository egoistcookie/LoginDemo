# Login Demo Mobile App

登录系统的React Native移动端应用

## 技术栈

- React Native 0.72.6
- React Navigation 6.x
- Axios (网络请求)
- AsyncStorage (本地存储)
- React Native Vector Icons (图标)

## 环境要求

- Node.js >= 18
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)

## 安装依赖

```bash
npm install
# 或
yarn install
```

## 运行

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

## 开发服务器

```bash
npm start
```

## 项目结构

```
mobile/
├── src/
│   ├── api/          # API服务层
│   ├── components/   # 通用组件
│   ├── screens/      # 页面组件
│   ├── navigation/   # 导航配置
│   ├── services/     # 业务服务
│   ├── utils/        # 工具函数
│   └── config/       # 配置文件
├── android/          # Android原生代码
└── ios/              # iOS原生代码
```

## API配置

默认API地址：`http://localhost:8080/api`

开发环境需要配置Android模拟器的网络代理或使用电脑IP地址。

