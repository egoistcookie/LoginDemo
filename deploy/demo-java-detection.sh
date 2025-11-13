#!/bin/bash

# 演示Java检测逻辑的脚本
# 模拟deploy.sh中的check_java函数行为

set -e

echo "=== Java检测逻辑演示 ==="
echo ""

# 模拟check_java函数的逻辑
echo "1. 检查JAVA_HOME环境变量..."
if [ -n "$JAVA_HOME" ]; then
    echo "   ✓ 检测到JAVA_HOME: $JAVA_HOME"
    local java_cmd="$JAVA_HOME/bin/java"
    if [ -x "$java_cmd" ]; then
        echo "   ✓ Java可执行文件存在: $java_cmd"
        echo "   → 将使用: $JAVA_HOME/bin/java"
    else
        echo "   ✗ JAVA_HOME设置不正确: $java_cmd"
    fi
else
    echo "   ✗ 未设置JAVA_HOME环境变量"
    echo ""
    echo "2. 尝试自动查找Java安装..."
    local java_paths=("/usr/lib/jvm/jdk-21/bin/java" "/usr/lib/jvm/java-21/bin/java" "/usr/java/jdk-21/bin/java")

    for java_path in "${java_paths[@]}"; do
        if [ -x "$java_path" ]; then
            echo "   ✓ 找到Java安装: $java_path"
            local inferred_java_home="$(dirname "$(dirname "$java_path")")"
            echo "   → 将设置JAVA_HOME: $inferred_java_home"
            echo "   → 将使用: $java_path"
            break
        fi
    done
fi

echo ""
echo "3. 验证Java版本..."
if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    JAVA_VERSION=$("$JAVA_HOME/bin/java" -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    echo "   ✓ Java版本: $JAVA_VERSION"
    echo "   ✓ 使用路径: $JAVA_HOME/bin/java"
elif command -v java &> /dev/null; then
    echo "   ✓ 在PATH中找到Java"
    java -version
else
    echo "   ✗ 未找到可用的Java"
fi

echo ""
echo "=== 部署脚本行为 ==="
echo "• 优先使用JAVA_HOME环境变量"
echo "• 自动查找常见安装位置 (/usr/lib/jvm/jdk-21)"
echo "• systemd服务将使用: \$JAVA_HOME/bin/java"
echo "• 环境变量将传递给服务进程"
