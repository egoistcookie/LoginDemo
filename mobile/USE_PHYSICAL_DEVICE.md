# 使用真机调试指南

## 步骤 1：启用开发者选项

1. 打开手机的"设置"
2. 找到"关于手机"（About phone）
3. 连续点击"版本号"（Build number）7次
4. 返回设置，找到"开发者选项"（Developer options）

## 步骤 2：启用 USB 调试

1. 在"开发者选项"中，启用"USB 调试"（USB debugging）
2. 可选：启用"USB 安装"（USB install）和"USB 调试（安全设置）"

## 步骤 3：连接手机

1. 用 USB 线连接手机到电脑
2. 手机上会弹出"允许 USB 调试"提示，点击"允许"
3. 可选：勾选"始终允许来自这台计算机"

## 步骤 4：验证连接

```powershell
adb devices
```

应该能看到你的设备，例如：
```
List of devices attached
ABC123XYZ    device
```

## 步骤 5：运行应用

```powershell
cd LoginDemo/mobile
npm run android
```

## 常见问题

### Q: adb devices 显示 "unauthorized"？
A: 手机上点击"允许 USB 调试"提示

### Q: 找不到设备？
A: 
- 检查 USB 线是否支持数据传输（不是只能充电的线）
- 尝试更换 USB 端口
- 重新安装手机驱动

### Q: 网络连接问题？
A: 真机需要配置电脑的局域网 IP，修改 `src/config/api.js`：
```javascript
const DEV_API_URL = 'http://192.168.x.x:8080/api';  // 替换为你的电脑IP
```

