# Login Demo Mobile App

登录系统的React Native移动端应用

## 技术栈

### 核心框架
- React Native 0.73.2
- React 18.2.0

### 导航与路由
- React Navigation 6.x
  - @react-navigation/native ^6.1.9
  - @react-navigation/native-stack ^6.9.17

### UI 组件库
- React Native Gesture Handler ^2.14.0
- React Native Safe Area Context ^4.8.2
- React Native Screens ^3.29.0
- React Native Vector Icons ^10.0.3

### 网络与存储
- Axios ^1.6.2 (网络请求)
- @react-native-async-storage/async-storage ^1.19.5 (本地存储)

### 构建工具
- Gradle 8.3.0
- Android Gradle Plugin 8.3.0
- Kotlin 1.9.22
- Android SDK: compileSdkVersion 34, targetSdkVersion 34
- NDK: arm64-v8a

### 开发工具
- TypeScript 5.2.2
- ESLint ^8.54.0
- Prettier ^3.1.0
- Jest ^29.7.0 (测试框架)
- patch-package ^8.0.1 (依赖补丁工具)

## 环境要求

- Node.js >= 18
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)

## 推荐模拟器配置

- **设备型号**: Pixel 6
- **API 版本**: API 34 (Android 14)
- **架构**: arm64-v8a

详细配置说明请参考 [CREATE_EMULATOR.md](./CREATE_EMULATOR.md)

## 安装依赖

```bash
npm install
```

安装完成后，补丁文件会自动应用（通过 `postinstall` 脚本）。

## 补丁说明

本项目使用 `patch-package` 来修复某些依赖库与 React Native 0.73.2 的兼容性问题：

- `react-native-gesture-handler`: 修复 BaseReactPackage 兼容性问题
- `react-native-screens`: 修复 BaseReactPackage 兼容性问题
- `react-native`: 添加 ViewManagerWithGeneratedInterface 兼容接口

补丁文件位于 `patches/` 目录，会在每次 `npm install` 后自动应用。

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

如果需要清理缓存：

```bash
npm start -- --reset-cache
```

## 项目结构

```
mobile/
├── src/
│   ├── api/          # API服务层
│   │   ├── index.js  # Axios配置和拦截器
│   │   ├── auth.js   # 认证相关API
│   │   └── user.js   # 用户相关API
│   ├── config/       # 配置文件
│   │   └── api.js    # API地址配置
│   ├── navigation/   # 导航配置
│   │   └── AppNavigator.js
│   ├── screens/      # 页面组件
│   │   ├── LoginScreen.js
│   │   └── ProfileScreen.js
│   ├── services/     # 业务服务
│   │   ├── AuthService.js
│   │   └── TokenManager.js
│   └── utils/        # 工具函数
│       ├── ErrorHandler.js
│       └── Storage.js
├── android/          # Android原生代码
│   ├── app/
│   │   └── src/main/java/com/logindemo/
│   │       ├── MainActivity.java
│   │       └── MainApplication.java
│   └── build.gradle
├── patches/          # patch-package 补丁文件
│   ├── react-native+0.73.2.patch
│   ├── react-native-gesture-handler+2.29.1.patch
│   └── react-native-screens+3.37.0.patch
├── App.js            # 应用入口
├── index.js          # 入口文件
└── package.json      # 项目配置
```

## API配置

默认API地址：`http://localhost:8080/api`

开发环境需要配置Android模拟器的网络代理或使用电脑IP地址。

详细配置说明请参考 [API_CONFIG_GUIDE.md](./API_CONFIG_GUIDE.md)

## 已知问题和解决方案

### 1. BaseReactPackage 兼容性问题

**问题**: `react-native-gesture-handler` 和 `react-native-screens` 在 React Native 0.73.2 中会出现 `BaseReactPackage` 找不到的编译错误。

**解决方案**: 已通过 `patch-package` 修复，将 `BaseReactPackage` 替换为 `TurboReactPackage`。补丁会在安装依赖时自动应用。

### 2. ViewManagerWithGeneratedInterface 兼容性问题

**问题**: 在新架构未启用时，某些库需要 `ViewManagerWithGeneratedInterface` 接口。

**解决方案**: 已通过补丁添加兼容接口。

### 3. 模拟器连接问题

**问题**: 模拟器无法连接到 Metro bundler。

**解决方案**: 
- 确保 Metro bundler 正在运行 (`npm start`)
- 运行 `adb reverse tcp:8081 tcp:8081` 设置端口转发
- 检查防火墙设置

## 相关文档

- [CREATE_EMULATOR.md](./CREATE_EMULATOR.md) - 创建 Android 模拟器指南
- [API_CONFIG_GUIDE.md](./API_CONFIG_GUIDE.md) - API 配置指南
- [USE_PHYSICAL_DEVICE.md](./USE_PHYSICAL_DEVICE.md) - 使用物理设备指南
- [ANDROID_SDK_SETUP.md](./ANDROID_SDK_SETUP.md) - Android SDK 设置指南
- [TESTING.md](./TESTING.md) - 测试文档

## 开发注意事项

1. **首次安装**: 运行 `npm install` 后，补丁会自动应用。如果遇到问题，可以手动运行 `npx patch-package`。

2. **清理构建**: 如果遇到构建问题，可以尝试：
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm start -- --reset-cache
   ```

3. **模拟器要求**: 推荐使用 Pixel 6 API 34 模拟器，架构为 arm64-v8a。

4. **依赖更新**: 更新依赖后，如果补丁失效，需要重新生成补丁文件。
