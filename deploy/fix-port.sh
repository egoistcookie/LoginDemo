#!/bin/bash

# 快速修复端口问题的脚本

set -e

APP_PORT=8080

echo "=== 端口问题修复工具 ==="
echo "目标端口: $APP_PORT"
echo ""

# 检查是否为root用户（需要root权限来杀死进程）
if [ "$EUID" -ne 0 ]; then
    echo "❌ 需要root权限运行此脚本"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 检查端口占用..."
if netstat -tulpn 2>/dev/null | grep -q ":$APP_PORT "; then
    echo "   🔴 端口 $APP_PORT 被占用"
    PORT_INFO=$(netstat -tulpn 2>/dev/null | grep ":$APP_PORT ")
    echo "   占用详情: $PORT_INFO"

    # 提取进程ID
    PID=$(echo "$PORT_INFO" | awk '{print $7}' | cut -d'/' -f1)

    if [ -n "$PID" ] && [ "$PID" != "-" ]; then
        echo "   进程ID: $PID"

        # 显示进程信息
        PROCESS_INFO=$(ps -p "$PID" -o pid,ppid,cmd 2>/dev/null || echo "无法获取进程信息")
        echo "   进程信息: $PROCESS_INFO"

        echo ""
        echo "2. 正在终止占用进程..."
        if kill -TERM "$PID" 2>/dev/null; then
            echo "   ✓ 已发送终止信号 (SIGTERM)"
            sleep 2

            # 检查进程是否还在运行
            if ps -p "$PID" > /dev/null 2>&1; then
                echo "   进程仍在运行，发送强制终止信号 (SIGKILL)..."
                kill -KILL "$PID" 2>/dev/null || true
                sleep 1
            fi

            if ! ps -p "$PID" > /dev/null 2>&1; then
                echo "   ✅ 进程已终止"
            else
                echo "   ⚠️ 无法终止进程，可能需要手动处理"
            fi
        else
            echo "   ❌ 无法终止进程 $PID"
        fi
    else
        echo "   ⚠️ 无法确定进程ID，尝试使用fuser"
        if command -v fuser &> /dev/null; then
            echo "   使用fuser终止端口占用..."
            fuser -k "$APP_PORT/tcp" 2>/dev/null || echo "   fuser未找到占用进程"
        fi
    fi
elif ss -tulpn 2>/dev/null | grep -q ":$APP_PORT "; then
    echo "   🔴 端口 $APP_PORT 被占用 (ss命令检测)"
    PORT_INFO=$(ss -tulpn 2>/dev/null | grep ":$APP_PORT ")
    echo "   占用详情: $PORT_INFO"
    echo "   尝试终止..."
    fuser -k "$APP_PORT/tcp" 2>/dev/null || echo "   无法终止进程"
else
    echo "   ✅ 端口 $APP_PORT 未被占用"
fi

echo ""
echo "3. 最终检查..."
sleep 1
if netstat -tulpn 2>/dev/null | grep -q ":$APP_PORT "; then
    echo "   ❌ 端口 $APP_PORT 仍被占用"
    echo "   请手动检查: netstat -tulpn | grep :$APP_PORT"
else
    echo "   ✅ 端口 $APP_PORT 现已可用"
fi

echo ""
echo "4. 启动服务..."
echo "   运行以下命令启动Spring Boot应用："
echo "   sudo systemctl start login-service"
echo ""
echo "   或直接运行："
echo "   sudo systemctl restart login-service"
echo ""
echo "   查看启动日志："
echo "   sudo journalctl -u login-service -f"

echo ""
echo "=== 修复完成 ==="
