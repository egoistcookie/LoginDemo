# 部署文件说明

本目录包含 LoginDemo Spring Boot 应用部署所需的所有配置文件和脚本。

## 🚨 重要：Java环境配置

**部署脚本现已优化，支持以下Java检测顺序：**

1. ✅ **优先使用JAVA_HOME环境变量**（推荐）
2. 🔍 **自动查找常见安装位置**
3. 🔄 **回退到PATH查找**

**如果遇到Java相关错误，请先配置Java环境：**

## 🩺 故障诊断工具

### 端口和启动问题诊断
```bash
# 诊断Spring Boot应用无法启动的原因
chmod +x diagnose-port.sh
./diagnose-port.sh
```

### 快速修复端口占用
```bash
# 自动检测并修复端口8080占用问题
chmod +x fix-port.sh
sudo ./fix-port.sh
```

### 常见问题解决方案

**如果Spring Boot应用无法启动，可能是以下原因：**

1. **端口被占用**（最常见）
2. **Java环境问题**
3. **配置文件错误**
4. **权限问题**

**请按以下顺序排查：**

1. **运行诊断脚本**：
   ```bash
   ./diagnose-port.sh  # 诊断端口和系统状态
   ```

2. **如果端口被占用**：
   ```bash
   sudo ./fix-port.sh  # 自动修复端口问题
   ```

3. **检查Java环境**：
   ```bash
   java -version
   echo $JAVA_HOME
   ```

4. **查看详细启动日志**：
   ```bash
   sudo journalctl -u login-service -f
   ```

### 其他工具

#### 测试Java环境
```bash
chmod +x test-java.sh
./test-java.sh
```

#### 查看Java检测逻辑演示
```bash
# 查看脚本如何检测Java（不需要实际执行）
chmod +x demo-java-detection.sh
./demo-java-detection.sh
```

### 方法1：永久设置Java环境变量（推荐）
```bash
# 给脚本执行权限
chmod +x setup-java-permanent.sh

# 运行永久Java环境配置（需要root权限）
sudo ./setup-java-permanent.sh
```

### 方法3：手动永久配置
```bash
# 直接编辑系统环境文件（需要root权限）
sudo nano /etc/environment

# 添加以下行：
JAVA_HOME=/usr/lib/jvm/jdk-21
PATH="/usr/lib/jvm/jdk-21/bin:$PATH"

# 保存并退出，然后重新加载环境
source /etc/environment
```

### 方法4：临时设置（仅当前会话）
```bash
# 设置环境变量
export JAVA_HOME=/usr/lib/jvm/jdk-21
export PATH=$JAVA_HOME/bin:$PATH

# 或添加到系统环境变量
echo "JAVA_HOME=/usr/lib/jvm/jdk-21" >> /etc/environment
echo "PATH=\"$JAVA_HOME/bin:\$PATH\"" >> /etc/environment

# 使用update-alternatives设置默认Java
sudo update-alternatives --install /usr/bin/java java $JAVA_HOME/bin/java 1
sudo update-alternatives --install /usr/bin/javac javac $JAVA_HOME/bin/javac 1
sudo update-alternatives --set java $JAVA_HOME/bin/java
sudo update-alternatives --set javac $JAVA_HOME/bin/javac
```

### 方法3：临时设置（仅当前会话）
```bash
export PATH=$PATH:/usr/lib/jvm/jdk-21/bin
```

配置完成后，重新运行部署脚本：
```bash
sudo ./deploy.sh --install  # 首次安装
# 或
sudo ./deploy.sh --update   # 更新现有安装
```

## 文件列表

### 1. login-service.service
systemd 服务文件模板，用于将 Spring Boot 应用注册为系统服务。

**使用方法：**
```bash
sudo cp login-service.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable login-service
sudo systemctl start login-service
```

**注意事项：**
- 需要根据实际情况修改文件中的路径和用户配置
- 确保应用用户和目录已创建

### 2. nginx.conf.example
Nginx 反向代理配置示例文件。

**使用方法：**
- Ubuntu/Debian: 复制到 `/etc/nginx/sites-available/` 并创建符号链接
- CentOS/RHEL: 复制到 `/etc/nginx/conf.d/`

**配置前需要修改：**
- `server_name`: 替换为实际域名
- SSL 证书路径（如果使用 HTTPS）
- 后端服务地址和端口

### 3. Dockerfile
Docker 镜像构建文件，使用多阶段构建优化镜像大小。

**使用方法：**
```bash
cd LoginDemo
docker build -t logindemo:1.0.0 -f deploy/Dockerfile .
```

### 4. docker-compose.yml
Docker Compose 配置文件，包含完整的服务栈（MySQL、Redis、应用、Nginx）。

**使用方法：**
```bash
cd LoginDemo/deploy
# 修改配置文件中的密码和配置
docker-compose up -d
```

**注意事项：**
- 首次使用前必须修改所有密码（MySQL、Redis）
- 确保 SQL 初始化文件路径正确
- 生产环境建议使用外部数据库和 Redis

### 5. deploy.sh
自动化部署脚本，简化部署流程。

**功能：**
- 安装服务（首次部署）
- 更新服务（重新部署）
- 重启/停止服务
- 查看日志

**使用方法：**
```bash
chmod +x deploy.sh
sudo ./deploy.sh --install   # 首次安装
sudo ./deploy.sh --update    # 更新服务
sudo ./deploy.sh --restart   # 重启服务
sudo ./deploy.sh --logs      # 查看日志
```

**注意事项：**
- 需要 root 权限运行
- 脚本中的配置变量需要根据实际情况修改
- 确保 JAR 文件在当前目录或指定路径

## 部署方式选择

### 方式一：传统部署（推荐生产环境）
使用 systemd 服务管理，适合稳定生产环境。

**步骤：**
1. 使用 `deploy.sh --install` 安装服务
2. 配置 Nginx（可选）
3. 完成部署

### 方式二：Docker 部署
使用 Docker Compose 一键部署所有服务，适合快速部署和开发环境。

**步骤：**
1. 修改 `docker-compose.yml` 中的配置
2. 运行 `docker-compose up -d`
3. 完成部署

## 安全建议

1. **修改默认密码**：所有配置文件中的密码必须修改
2. **JWT Secret**：使用强密码（至少64字符）
3. **防火墙配置**：只开放必要端口
4. **SSL/TLS**：生产环境必须使用 HTTPS
5. **定期备份**：数据库和配置文件

## 相关文档

详细部署说明请参考主文档：[../DEPLOYMENT.md](../DEPLOYMENT.md)

