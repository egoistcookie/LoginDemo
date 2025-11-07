# Android 环境检查脚本
Write-Host "=== Android 开发环境检查 ===" -ForegroundColor Cyan
Write-Host ""

# 检查 ANDROID_HOME
Write-Host "1. 检查 ANDROID_HOME 环境变量:" -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "   ✓ ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "   ✗ ANDROID_HOME 未设置" -ForegroundColor Red
}

# 检查 adb
Write-Host "`n2. 检查 adb 命令:" -ForegroundColor Yellow
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if ($adbPath) {
    Write-Host "   ✓ adb 已找到: $($adbPath.Source)" -ForegroundColor Green
} else {
    Write-Host "   ✗ adb 未找到，请检查 PATH 环境变量" -ForegroundColor Red
}

# 检查模拟器工具
Write-Host "`n3. 检查模拟器工具:" -ForegroundColor Yellow
$emulatorPath = Get-Command emulator -ErrorAction SilentlyContinue
if ($emulatorPath) {
    Write-Host "   ✓ emulator 已找到: $($emulatorPath.Source)" -ForegroundColor Green
} else {
    Write-Host "   ✗ emulator 未找到" -ForegroundColor Red
}

# 检查已连接的设备
Write-Host "`n4. 检查已连接的设备:" -ForegroundColor Yellow
if ($adbPath) {
    $devices = & adb devices 2>&1
    if ($devices -match "device$") {
        Write-Host "   ✓ 找到已连接的设备" -ForegroundColor Green
        $devices | ForEach-Object { Write-Host "     $_" }
    } else {
        Write-Host "   ✗ 没有找到已连接的设备或模拟器" -ForegroundColor Red
    }
} else {
    Write-Host "   - 跳过（adb 不可用）" -ForegroundColor Gray
}

# 检查可用的模拟器
Write-Host "`n5. 检查可用的模拟器:" -ForegroundColor Yellow
if ($emulatorPath) {
    $avds = & emulator -list-avds 2>&1
    if ($avds -and $avds.Count -gt 0) {
        Write-Host "   ✓ 找到 $($avds.Count) 个模拟器:" -ForegroundColor Green
        $avds | ForEach-Object { Write-Host "     - $_" }
    } else {
        Write-Host "   ✗ 没有找到可用的模拟器" -ForegroundColor Red
        Write-Host "     请打开 Android Studio 创建模拟器" -ForegroundColor Yellow
    }
} else {
    Write-Host "   - 跳过（emulator 不可用）" -ForegroundColor Gray
}

# 常见 SDK 路径检查
Write-Host "`n6. 检查常见 SDK 安装位置:" -ForegroundColor Yellow
$commonPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "$env:ProgramFiles\Android\Sdk"
)

$foundSdk = $false
foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "   ✓ 找到 SDK: $path" -ForegroundColor Green
        $foundSdk = $true
        
        # 检查 platform-tools
        $platformTools = Join-Path $path "platform-tools\adb.exe"
        if (Test-Path $platformTools) {
            Write-Host "     ✓ platform-tools 存在" -ForegroundColor Green
        } else {
            Write-Host "     ✗ platform-tools 不存在" -ForegroundColor Red
        }
        
        # 检查 emulator
        $emulatorExe = Join-Path $path "emulator\emulator.exe"
        if (Test-Path $emulatorExe) {
            Write-Host "     ✓ emulator 存在" -ForegroundColor Green
        } else {
            Write-Host "     ✗ emulator 不存在" -ForegroundColor Red
        }
        break
    }
}

if (-not $foundSdk) {
    Write-Host "   ✗ 未找到 Android SDK" -ForegroundColor Red
    Write-Host "     请安装 Android Studio 或单独安装 Android SDK" -ForegroundColor Yellow
}

Write-Host "`n=== 检查完成 ===" -ForegroundColor Cyan


