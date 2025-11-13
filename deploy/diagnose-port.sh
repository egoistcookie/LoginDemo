#!/bin/bash

# 端口诊断脚本
# 检查Spring Boot应用无法启动的原因

set -e

echo "=== Spring Boot应用启动诊断 ==="
echo ""

# 检查配置的端口
APP_PORT=8080
echo "1. 应用配置检查："
echo "   配置端口: $APP_PORT"
echo "   上下文路径: /api"
echo ""

# 检查端口占用
echo "2. 端口占用检查："
echo "   检查端口 $APP_PORT 占用情况..."

# 使用netstat检查端口（如果可用）
if command -v netstat &> /dev/null; then
    PORT_USAGE=$(netstat -tulpn 2>/dev/null | grep ":$APP_PORT " || echo "端口未被占用")
    if [[ "$PORT_USAGE" == *"端口未被占用"* ]]; then
        echo "   ✓ 端口 $APP_PORT 未被占用"
    else
        echo "   ✗ 端口 $APP_PORT 已被占用："
        echo "     $PORT_USAGE"
    fi
elif command -v ss &> /dev/null; then
    PORT_USAGE=$(ss -tulpn 2>/dev/null | grep ":$APP_PORT " || echo "端口未被占用")
    if [[ "$PORT_USAGE" == *"端口未被占用"* ]]; then
        echo "   ✓ 端口 $APP_PORT 未被占用"
    else
        echo "   ✗ 端口 $APP_PORT 已被占用："
        echo "     $PORT_USAGE"
    fi
else
    # 尝试使用lsof
    if command -v lsof &> /dev/null; then
        PORT_PROCESS=$(lsof -i :$APP_PORT 2>/dev/null || echo "无法确定端口占用")
        if [[ "$PORT_PROCESS" == *"无法确定端口占用"* ]]; then
            echo "   ✓ 端口 $APP_PORT 状态未知，但可能未被占用"
        else
            echo "   ✗ 端口 $APP_PORT 已被占用："
            echo "     $PORT_PROCESS"
        fi
    else
        echo "   ⚠ 无法检查端口占用（缺少netstat/ss/lsof工具）"
        echo "   尝试手动检查: netstat -tulpn | grep :$APP_PORT"
    fi
fi
echo ""

# 检查Java进程
echo "3. Java进程检查："
JAVA_PROCESSES=$(ps aux | grep java | grep -v grep || echo "无Java进程")
if [[ "$JAVA_PROCESSES" == *"无Java进程"* ]]; then
    echo "   ✓ 当前无Java进程运行"
else
    echo "   ⚠ 发现运行中的Java进程："
    echo "$JAVA_PROCESSES" | while read line; do
        echo "     $line"
    done
fi
echo ""

# 检查防火墙
echo "4. 防火墙检查："
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null | head -n 3 || echo "UFW状态未知")
    echo "   UFW状态: $UFW_STATUS"
elif command -v firewall-cmd &> /dev/null; then
    FIREWALL_STATUS=$(firewall-cmd --state 2>/dev/null || echo "firewalld状态未知")
    echo "   firewalld状态: $FIREWALL_STATUS"
else
    echo "   ⚠ 未检测到常用防火墙工具"
fi
echo ""

# 检查系统资源
echo "5. 系统资源检查："
echo "   可用内存: $(free -h 2>/dev/null | grep '^Mem:' | awk '{print $7}' || echo '未知')"
echo "   磁盘使用: $(df -h / 2>/dev/null | tail -n 1 | awk '{print $5}' || echo '未知')"
echo ""

# 提供解决方案
echo "6. 解决方案建议："

if netstat -tulpn 2>/dev/null | grep -q ":$APP_PORT "; then
    echo "   🔴 端口被占用 - 首要问题"
    echo "   💡 解决方案："
    echo "      1. 杀死占用进程: sudo fuser -k $APP_PORT/tcp"
    echo "      2. 或更改应用端口: 在application-prod.yml中设置不同端口"
    echo "      3. 或查找进程: ps aux | grep java"
elif ss -tulpn 2>/dev/null | grep -q ":$APP_PORT "; then
    echo "   🔴 端口被占用 - 首要问题"
    echo "   💡 解决方案："
    echo "      1. 杀死占用进程: sudo fuser -k $APP_PORT/tcp"
    echo "      2. 或更改应用端口"
else
    echo "   🟡 端口未被占用，可能存在其他问题"
    echo "   💡 检查建议："
    echo "      1. 查看详细日志: journalctl -u login-service -f"
    echo "      2. 检查Java版本: java -version"
    echo "      3. 检查配置文件: cat /opt/logindemo/config/application-prod.yml"
    echo "      4. 测试Java启动: java -jar login-service-1.0.0.jar --debug"
fi

echo ""
echo "7. 立即解决命令："
echo "   # 如果端口被占用，杀死进程："
echo "   sudo fuser -k $APP_PORT/tcp 2>/dev/null || echo '无进程占用端口'"
echo ""
echo "   # 检查是否有残留进程："
echo "   ps aux | grep java"
echo ""
echo "   # 重新启动服务："
echo "   sudo systemctl restart login-service"
echo ""
echo "   # 查看启动日志："
echo "   sudo journalctl -u login-service -n 50"
echo ""

echo "=== 诊断完成 ==="
