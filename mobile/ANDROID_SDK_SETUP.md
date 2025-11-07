# Android SDK 环境配置指南（SDK 36+）

## 重要说明
从 Android SDK 26+ 开始，Google **移除了传统的 `tools` 目录**，这是正常的！
现在只需要配置以下目录到 PATH：
- `platform-tools`（包含 adb）
- `emulator`（包含模拟器工具）

## 步骤 1：找到你的 Android SDK 路径

SDK 通常安装在以下位置之一：
- `C:\Users\你的用户名\AppData\Local\Android\Sdk`
- `C:\Android\Sdk`
- Android Studio 安装目录下的 `Sdk` 文件夹

## 步骤 2：配置环境变量

### 方法 A：通过系统设置（推荐）

1. 右键"此电脑" → "属性" → "高级系统设置"
2. 点击"环境变量"
3. 在"系统变量"中：
   - 新建变量 `ANDROID_HOME`，值为你的 SDK 路径（例如：`C:\Users\你的用户名\AppData\Local\Android\Sdk`）
   - 编辑 `Path` 变量，添加以下路径：
     ```
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\emulator
     ```

### 方法 B：通过 PowerShell（临时，仅当前会话）

```powershell
$sdkPath = "你的SDK路径"  # 例如: "C:\Users\Administrator\AppData\Local\Android\Sdk"
$env:ANDROID_HOME = $sdkPath
$env:PATH += ";$sdkPath\platform-tools;$sdkPath\emulator"
```

## 步骤 3：验证配置

运行以下命令验证：

```powershell
# 检查 adb
adb version

# 检查模拟器工具
emulator -list-avds
```

## 步骤 4：创建模拟器（如果还没有）

1. 打开 Android Studio
2. 打开 AVD Manager（Tools → Device Manager）
3. 点击 "Create Device"
4. 选择设备型号和系统镜像
5. 完成创建

## 步骤 5：运行 React Native 应用

配置完成后，重新打开终端运行：

```bash
cd LoginDemo/mobile
npm run android
```

## 常见问题

### Q: 找不到 platform-tools 或 emulator？
A: 打开 Android Studio → SDK Manager → SDK Tools，确保安装了：
- Android SDK Platform-Tools
- Android Emulator

### Q: 仍然提示找不到 adb？
A: 
1. 确认 SDK 路径正确
2. 重启终端/IDE（环境变量需要重启才能生效）
3. 检查 PATH 中是否包含 `%ANDROID_HOME%\platform-tools`

### Q: 没有模拟器？
A: 在 Android Studio 的 AVD Manager 中创建模拟器，或使用真机调试。


