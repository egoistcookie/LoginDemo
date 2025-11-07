# Android SDK 环境配置脚本
# 使用方法：powershell -ExecutionPolicy Bypass -File setup-android-env.ps1

param(
    [string]$SdkPath = ""
)

Write-Host "=== Android SDK 环境配置 ===" -ForegroundColor Cyan
Write-Host ""

# 如果没有提供路径，尝试查找
if ([string]::IsNullOrEmpty($SdkPath)) {
    Write-Host "正在查找 Android SDK..." -ForegroundColor Yellow
    
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk",
        "C:\Android\Sdk",
        "$env:ProgramFiles\Android\Sdk",
        "$env:ProgramFiles(x86)\Android\android-sdk"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $adbPath = Join-Path $path "platform-tools\adb.exe"
            if (Test-Path $adbPath) {
                $SdkPath = $path
                Write-Host "找到 SDK: $SdkPath" -ForegroundColor Green
                break
            }
        }
    }
    
    if ([string]::IsNullOrEmpty($SdkPath)) {
        Write-Host "未找到 Android SDK，请手动指定路径" -ForegroundColor Red
        Write-Host ""
        Write-Host "使用方法：" -ForegroundColor Yellow
        Write-Host "  .\setup-android-env.ps1 -SdkPath 'C:\Users\你的用户名\AppData\Local\Android\Sdk'" -ForegroundColor Yellow
        exit 1
    }
}

# 验证 SDK 路径
if (-not (Test-Path $SdkPath)) {
    Write-Host "错误: SDK 路径不存在: $SdkPath" -ForegroundColor Red
    exit 1
}

Write-Host "SDK 路径: $SdkPath" -ForegroundColor Green
Write-Host ""

# 检查必要的目录
$platformTools = Join-Path $SdkPath "platform-tools"
$emulator = Join-Path $SdkPath "emulator"

Write-Host "检查必要的组件..." -ForegroundColor Yellow

if (Test-Path "$platformTools\adb.exe") {
    Write-Host "  ✓ platform-tools 存在" -ForegroundColor Green
} else {
    Write-Host "  ✗ platform-tools 不存在" -ForegroundColor Red
    Write-Host "    请通过 Android Studio → SDK Manager → SDK Tools 安装 Android SDK Platform-Tools" -ForegroundColor Yellow
    exit 1
}

if (Test-Path "$emulator\emulator.exe") {
    Write-Host "  ✓ emulator 存在" -ForegroundColor Green
} else {
    Write-Host "  ✗ emulator 不存在" -ForegroundColor Red
    Write-Host "    请通过 Android Studio → SDK Manager → SDK Tools 安装 Android Emulator" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 配置当前会话的环境变量
Write-Host "配置当前会话环境变量..." -ForegroundColor Yellow
$env:ANDROID_HOME = $SdkPath
$env:PATH = "$platformTools;$emulator;$env:PATH"
Write-Host "  ✓ ANDROID_HOME = $SdkPath" -ForegroundColor Green
Write-Host "  ✓ PATH 已更新（仅当前会话）" -ForegroundColor Green
Write-Host ""

# 验证配置
Write-Host "验证配置..." -ForegroundColor Yellow
$adbCheck = Get-Command adb -ErrorAction SilentlyContinue
if ($adbCheck) {
    Write-Host "  ✓ adb 可用: $($adbCheck.Source)" -ForegroundColor Green
    $adbVersion = & adb version 2>&1 | Select-Object -First 1
    Write-Host "    $adbVersion" -ForegroundColor Gray
} else {
    Write-Host "  ✗ adb 不可用" -ForegroundColor Red
}

$emulatorCheck = Get-Command emulator -ErrorAction SilentlyContinue
if ($emulatorCheck) {
    Write-Host "  ✓ emulator 可用: $($emulatorCheck.Source)" -ForegroundColor Green
    
    # 检查可用的模拟器
    Write-Host ""
    Write-Host "检查可用的模拟器..." -ForegroundColor Yellow
    $avds = & emulator -list-avds 2>&1
    if ($avds -and $avds.Count -gt 0) {
        Write-Host "  找到 $($avds.Count) 个模拟器:" -ForegroundColor Green
        $avds | ForEach-Object { Write-Host "    - $_" -ForegroundColor Gray }
    } else {
        Write-Host "  ⚠ 没有找到可用的模拟器" -ForegroundColor Yellow
        Write-Host "    请打开 Android Studio → AVD Manager 创建模拟器" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ emulator 不可用" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 配置完成 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "重要提示：" -ForegroundColor Yellow
Write-Host "1. 当前配置仅对当前 PowerShell 会话有效" -ForegroundColor Yellow
Write-Host "2. 要永久配置，请手动设置系统环境变量：" -ForegroundColor Yellow
Write-Host "   - ANDROID_HOME = $SdkPath" -ForegroundColor Gray
Write-Host "   - PATH 中添加: $platformTools" -ForegroundColor Gray
Write-Host "   - PATH 中添加: $emulator" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 设置系统环境变量后，需要重启终端/IDE 才能生效" -ForegroundColor Yellow
Write-Host ""
Write-Host "现在可以尝试运行: npm run android" -ForegroundColor Green


