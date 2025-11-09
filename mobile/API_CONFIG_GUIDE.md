# Android 模拟器 API 配置指南

## 为什么使用 `10.0.2.2`？

Android 模拟器使用特殊的网络配置：
- **`10.0.2.2`** 是 Android 模拟器访问宿主机（你的电脑）`localhost` 的特殊 IP 地址
- 模拟器无法直接使用 `localhost` 或 `127.0.0.1` 访问宿主机
- 这是 Android 模拟器的标准配置，无需修改

## 当前配置

配置文件位置：`src/config/api.js`

### Android 模拟器（默认）
```javascript
androidEmulator: 'http://10.0.2.2:8080/api'
```
✅ **已配置完成，无需修改**

### Android 真机
如果需要使用真机调试，需要修改 `androidDevice` 配置：

1. **获取电脑的局域网 IP**
   ```powershell
   # Windows
   ipconfig
   
   # 查找 IPv4 地址，例如：192.168.1.100
   ```

2. **修改配置文件**
   ```javascript
   androidDevice: 'http://192.168.1.100:8080/api', // 替换为你的IP
   ```

3. **确保手机和电脑在同一局域网**

## 配置方式

### 方式 1：自动检测（推荐）

配置文件会自动检测平台（Android/iOS）和运行环境（模拟器/真机），选择对应的 API 地址。

**当前默认配置：**
- Android 模拟器：`http://10.0.2.2:8080/api` ✅

### 方式 2：手动指定（临时测试）

如果需要临时使用特定地址，可以修改 `MANUAL_API_URL`：

```javascript
const MANUAL_API_URL = 'http://192.168.1.100:8080/api';
```

设置后，将忽略自动检测，始终使用此地址。

## 验证配置

### 1. 检查当前使用的 API 地址

在应用中添加日志查看：

```javascript
import {API_BASE_URL} from './src/config/api';
console.log('当前API地址:', API_BASE_URL);
```

### 2. 测试连接

启动应用后，尝试登录，查看网络请求是否成功。

### 3. 常见问题排查

#### 问题：无法连接到后端

**检查清单：**
1. ✅ 后端服务是否运行在 `localhost:8080`？
2. ✅ 模拟器是否已启动？
3. ✅ API 地址是否正确配置？
4. ✅ 防火墙是否阻止了连接？

**Android 模拟器：**
- 使用 `http://10.0.2.2:8080/api` ✅
- 不要使用 `localhost` 或 `127.0.0.1` ❌

**真机调试：**
- 使用电脑的局域网 IP（例如：`http://192.168.1.100:8080/api`）
- 确保手机和电脑在同一 WiFi 网络
- 确保防火墙允许 8080 端口

#### 问题：网络请求超时

1. 检查后端服务是否正常运行
2. 检查网络连接
3. 增加超时时间（在 `api.js` 中修改 `API_TIMEOUT`）

## 配置示例

### 示例 1：仅使用 Android 模拟器（当前配置）
```javascript
androidEmulator: 'http://10.0.2.2:8080/api'  // ✅ 已配置
```

### 示例 2：同时支持模拟器和真机
```javascript
androidEmulator: 'http://10.0.2.2:8080/api',      // 模拟器
androidDevice: 'http://192.168.1.100:8080/api',   // 真机（替换为你的IP）
```

### 示例 3：使用手动指定地址
```javascript
const MANUAL_API_URL = 'http://192.168.1.100:8080/api';
```

## 总结

✅ **Android 模拟器配置已完成**
- 地址：`http://10.0.2.2:8080/api`
- 无需修改，直接使用

📱 **如需真机调试**
- 修改 `androidDevice` 配置
- 使用电脑的局域网 IP 地址

🔧 **临时测试**
- 使用 `MANUAL_API_URL` 手动指定地址

