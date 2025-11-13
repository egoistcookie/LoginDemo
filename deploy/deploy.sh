#!/bin/bash

# LoginDemo Spring Boot 应用部署脚本
# 使用方法: ./deploy.sh [选项]
# 
# 选项:
#   -h, --help      显示帮助信息
#   -i, --install   安装服务（首次部署）
#   -u, --update    更新服务（重新部署）
#   -r, --restart   重启服务
#   -s, --stop      停止服务
#   -l, --logs      查看日志

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量（请根据实际情况修改）
APP_NAME="login-service"
APP_USER="logindemo"
APP_GROUP="logindemo"
APP_DIR="/opt/logindemo"
JAR_FILE="login-service-1.0.0.jar"
SERVICE_FILE="/etc/systemd/system/${APP_NAME}.service"
LOG_DIR="${APP_DIR}/logs"
CONFIG_DIR="${APP_DIR}/config"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "请使用 root 权限运行此脚本"
        exit 1
    fi
}

# 检查 Java 是否安装
check_java() {
    # 检查Java是否安装
    if ! command -v java &> /dev/null; then
        echo "错误: 未检测到Java环境，请确保已安装JDK。"
        exit 1
    fi

    # 获取Java版本信息
    JAVA_VERSION_OUTPUT=$(java -version 2>&1)
    # 提取主版本号 (兼容不同输出格式，如 openjdk "21.0.1" 或 java version "1.8.0")
    # 优先使用更新的版本输出格式
    if [[ $JAVA_VERSION_OUTPUT == *"version \""* ]]; then
        # 处理类似 openjdk version "21.0.1" 或 java version "1.8.0_392" 的格式
        JAVA_MAJOR_VERSION=$(echo "$JAVA_VERSION_OUTPUT" | awk -F[\"\.] '/version/ {if ($2 == "1") print $3; else print $2}')
    else
        # 备用提取方法
        JAVA_MAJOR_VERSION=$(echo "$JAVA_VERSION_OUTPUT" | grep -oP 'version "\K[^"]+' | cut -d '.' -f1)
    fi

    echo "检测到当前JDK主版本: $JAVA_MAJOR_VERSION"

    # 检查版本是否为21
    if [[ "$JAVA_MAJOR_VERSION" != "21" ]]; then
        echo "错误: 当前JDK版本 ($JAVA_MAJOR_VERSION) 不符合要求，本应用需要 JDK 21。"
        exit 1
    else
        echo "✓ JDK版本检查通过 (21)。"
    fi
}

# 创建应用用户和目录
create_app_user() {
    if ! id "$APP_USER" &>/dev/null; then
        print_info "创建应用用户: $APP_USER"
        useradd -r -s /bin/false -d "$APP_DIR" "$APP_USER"
    else
        print_info "用户 $APP_USER 已存在"
    fi
    
    # 创建目录结构
    mkdir -p "$APP_DIR" "$LOG_DIR" "$CONFIG_DIR"
    chown -R "$APP_USER:$APP_GROUP" "$APP_DIR"
    print_info "应用目录创建完成: $APP_DIR"
}

# 安装服务
install_service() {
    print_info "开始安装服务..."
    
    check_root
    check_java
    create_app_user
    
    # 检查 JAR 文件是否存在
    if [ ! -f "$JAR_FILE" ]; then
        print_error "JAR 文件不存在: $JAR_FILE"
        print_info "请确保 JAR 文件在当前目录，或使用 -u 选项更新服务"
        exit 1
    fi
    
    # 复制 JAR 文件
    print_info "复制 JAR 文件到 $APP_DIR"
    cp "$JAR_FILE" "$APP_DIR/"
    chown "$APP_USER:$APP_GROUP" "$APP_DIR/$JAR_FILE"
    
    # 复制配置文件（如果存在）
    if [ -f "application-prod.yml" ]; then
        print_info "复制生产环境配置文件"
        cp application-prod.yml "$CONFIG_DIR/"
        chown "$APP_USER:$APP_GROUP" "$CONFIG_DIR/application-prod.yml"
    else
        print_warn "未找到 application-prod.yml，请手动创建配置文件"
    fi
    
    # 创建 systemd 服务文件
    print_info "创建 systemd 服务文件"
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=LoginDemo Spring Boot Application
After=network.target mysql.service redis.service

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$APP_DIR

ExecStart=$JAVA_HOME/bin/java -jar $APP_DIR/$JAR_FILE \\
  --spring.config.location=classpath:/application.yml,file:$CONFIG_DIR/application-prod.yml \\
  --spring.profiles.active=prod

Environment="JAVA_HOME=$JAVA_HOME"
Environment="PATH=$JAVA_HOME/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

StandardOutput=journal
StandardError=journal
SyslogIdentifier=$APP_NAME

Restart=always
RestartSec=10

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
    
    # 重新加载 systemd
    systemctl daemon-reload
    
    # 启用并启动服务
    systemctl enable "$APP_NAME"
    systemctl start "$APP_NAME"
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if systemctl is-active --quiet "$APP_NAME"; then
        print_info "服务安装成功并已启动"
        print_info "查看服务状态: systemctl status $APP_NAME"
        print_info "查看日志: journalctl -u $APP_NAME -f"
    else
        print_error "服务启动失败，请检查日志: journalctl -u $APP_NAME"
        exit 1
    fi
}

# 更新服务
update_service() {
    print_info "开始更新服务..."
    
    check_root
    
    # 检查 JAR 文件是否存在
    if [ ! -f "$JAR_FILE" ]; then
        print_error "JAR 文件不存在: $JAR_FILE"
        exit 1
    fi
    
    # 停止服务
    if systemctl is-active --quiet "$APP_NAME"; then
        print_info "停止服务..."
        systemctl stop "$APP_NAME"
    fi
    
    # 备份旧 JAR 文件
    if [ -f "$APP_DIR/$JAR_FILE" ]; then
        BACKUP_FILE="${APP_DIR}/${JAR_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "备份旧 JAR 文件: $BACKUP_FILE"
        cp "$APP_DIR/$JAR_FILE" "$BACKUP_FILE"
    fi
    
    # 复制新 JAR 文件
    print_info "复制新 JAR 文件"
    cp "$JAR_FILE" "$APP_DIR/"
    chown "$APP_USER:$APP_GROUP" "$APP_DIR/$JAR_FILE"
    
    # 更新配置文件（如果存在）
    if [ -f "application-prod.yml" ]; then
        print_info "更新配置文件"
        cp application-prod.yml "$CONFIG_DIR/"
        chown "$APP_USER:$APP_GROUP" "$CONFIG_DIR/application-prod.yml"
    fi
    
    # 启动服务
    print_info "启动服务..."
    systemctl start "$APP_NAME"
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if systemctl is-active --quiet "$APP_NAME"; then
        print_info "服务更新成功并已启动"
    else
        print_error "服务启动失败，请检查日志: journalctl -u $APP_NAME"
        print_warn "如需回滚，请使用备份文件: $BACKUP_FILE"
        exit 1
    fi
}

# 重启服务
restart_service() {
    print_info "重启服务..."
    check_root
    systemctl restart "$APP_NAME"
    sleep 2
    if systemctl is-active --quiet "$APP_NAME"; then
        print_info "服务重启成功"
    else
        print_error "服务重启失败，请检查日志: journalctl -u $APP_NAME"
        exit 1
    fi
}

# 停止服务
stop_service() {
    print_info "停止服务..."
    check_root
    systemctl stop "$APP_NAME"
    print_info "服务已停止"
}

# 查看日志
view_logs() {
    print_info "查看服务日志（按 Ctrl+C 退出）..."
    journalctl -u "$APP_NAME" -f
}

# 显示帮助信息
show_help() {
    cat << EOF
LoginDemo Spring Boot 应用部署脚本

使用方法:
    $0 [选项]

选项:
    -h, --help      显示此帮助信息
    -i, --install   安装服务（首次部署）
    -u, --update    更新服务（重新部署）
    -r, --restart   重启服务
    -s, --stop      停止服务
    -l, --logs      查看日志

示例:
    $0 --install    # 首次安装服务
    $0 --update     # 更新服务
    $0 --restart    # 重启服务
    $0 --logs       # 查看日志

配置文件:
    应用目录: $APP_DIR
    配置文件: $CONFIG_DIR/application-prod.yml
    日志目录: $LOG_DIR

EOF
}

# 主函数
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            ;;
        -i|--install)
            install_service
            ;;
        -u|--update)
            update_service
            ;;
        -r|--restart)
            restart_service
            ;;
        -s|--stop)
            stop_service
            ;;
        -l|--logs)
            view_logs
            ;;
        *)
            print_error "未知选项: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"

