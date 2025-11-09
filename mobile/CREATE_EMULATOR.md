# 创建 Android 模拟器指南

## 方法 1：使用 Android Studio（推荐）

1. **打开 Android Studio**
2. **打开 AVD Manager**
   - 点击菜单：`Tools` → `Device Manager`
   - 或点击工具栏的 AVD Manager 图标
3. **创建虚拟设备**
   - 点击 `Create Device` 按钮
   - 选择设备型号（推荐：**Pixel 6**）
   - 点击 `Next`
4. **选择系统镜像**
   - 选择一个已下载的系统镜像（推荐：**API 34** - Android 14）
   - 如果没有，点击 `Download` 下载
   - 点击 `Next`
5. **配置设备**
   - 可以保持默认设置
   - 点击 `Finish`
6. **启动模拟器**
   - 在 AVD Manager 中点击播放按钮启动模拟器
   - 或运行：`emulator -avd 模拟器名称`

## 方法 2：使用命令行（需要先安装系统镜像）

```powershell
# 1. 列出可用的系统镜像
sdkmanager --list | Select-String "system-images"

# 2. 安装系统镜像（推荐：Android 14 API 34，arm64-v8a 架构）
sdkmanager "system-images;android-34;google_apis;arm64-v8a"

# 3. 创建模拟器（推荐：Pixel 6 API 34）
avdmanager create avd -n "Pixel_6_API_34" -k "system-images;android-34;google_apis;arm64-v8a" -d "pixel_6"

# 4. 启动模拟器
emulator -avd Pixel_6_API_34
```

**注意**: 本项目推荐使用 arm64-v8a 架构，与项目配置的 `reactNativeArchitectures=arm64-v8a` 保持一致。

## 验证模拟器

创建后，运行以下命令验证：

```powershell
# 列出所有模拟器
emulator -list-avds

# 应该能看到你创建的模拟器名称
```

## 启动模拟器

```powershell
# 方式 1：通过名称启动
emulator -avd 模拟器名称

# 方式 2：直接运行 React Native（会自动启动）
cd LoginDemo/mobile
npm run android
```

