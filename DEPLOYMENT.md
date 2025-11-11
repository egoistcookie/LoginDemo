# Spring Boot 云服务器部署指导文档

## 目录

1. [部署前准备](#部署前准备)
2. [服务器环境配置](#服务器环境配置)
3. [项目打包](#项目打包)
4. [生产环境配置](#生产环境配置)
5. [服务启动与管理](#服务启动与管理)
6. [Nginx 反向代理配置](#nginx-反向代理配置可选)
7. [监控与维护](#监控与维护)
8. [常见问题排查](#常见问题排查)
9. [Docker 部署方案](#docker-部署方案可选)

---

## 部署前准备

### 云服务器选择建议

- **推荐配置**：
  - CPU: 2核及以上
  - 内存: 4GB及以上
  - 硬盘: 40GB及以上（SSD推荐）
  - 带宽: 5Mbps及以上

- **云服务商选择**：
  - 阿里云 ECS
  - 腾讯云 CVM
  - 华为云 ECS
  - AWS EC2
  - 其他云服务商

### 操作系统要求

- **推荐系统**：Ubuntu 20.04 LTS / Ubuntu 22.04 LTS / CentOS 7 / CentOS 8
- **系统架构**：x86_64
- **权限要求**：root 或具有 sudo 权限的用户

### 必需软件清单

在部署前，确保服务器已安装以下软件：

- JDK 21
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+（用于本地打包，服务器上可选）
- Nginx（可选，用于反向代理）

---

## 服务器环境配置

### 1. JDK 21 安装配置

#### Ubuntu/Debian 系统

```bash
# 更新软件包列表
sudo apt update

# 安装 OpenJDK 21
sudo apt install -y openjdk-21-jdk

# 验证安装
java -version
javac -version

# 配置 JAVA_HOME（可选，但推荐）
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### CentOS/RHEL 系统

```bash
# 安装 OpenJDK 21
sudo yum install -y java-21-openjdk java-21-openjdk-devel

# 或者使用 dnf（CentOS 8+）
sudo dnf install -y java-21-openjdk java-21-openjdk-devel

# 验证安装
java -version
javac -version

# 配置 JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. MySQL 安装与配置

#### Ubuntu/Debian 系统

```bash
# 安装 MySQL
sudo apt update
sudo apt install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置（设置 root 密码等）
sudo mysql_secure_installation
```

#### CentOS/RHEL 系统

```bash
# 安装 MySQL
sudo yum install -y mysql-server
# 或 CentOS 8+
sudo dnf install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取临时 root 密码
sudo grep 'temporary password' /var/log/mysqld.log

# 登录并修改密码
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_strong_password';
```

#### 创建数据库和用户

```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE login_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权（推荐使用专用用户，而非 root）
CREATE USER 'logindemo'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON login_demo.* TO 'logindemo'@'localhost';
FLUSH PRIVILEGES;

-- 如果需要远程连接（不推荐生产环境）
CREATE USER 'logindemo'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON login_demo.* TO 'logindemo'@'%';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

#### 导入数据库结构

```bash
# 将 SQL 文件上传到服务器后执行
mysql -u logindemo -p login_demo < init.sql
mysql -u logindemo -p login_demo < init_ddl.sql
mysql -u logindemo -p login_demo < init_ddm.sql
```

### 3. Redis 安装与配置

#### Ubuntu/Debian 系统

```bash
# 安装 Redis
sudo apt update
sudo apt install -y redis-server

# 启动 Redis 服务
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 验证 Redis 运行状态
redis-cli ping
# 应返回 PONG
```

#### CentOS/RHEL 系统

```bash
# 安装 EPEL 仓库（如果未安装）
sudo yum install -y epel-release
# 或 CentOS 8+
sudo dnf install -y epel-release

# 安装 Redis
sudo yum install -y redis
# 或 CentOS 8+
sudo dnf install -y redis

# 启动 Redis 服务
sudo systemctl start redis
sudo systemctl enable redis

# 验证 Redis 运行状态
redis-cli ping
```

#### Redis 安全配置

```bash
# 编辑 Redis 配置文件
sudo vi /etc/redis/redis.conf
# 或 CentOS
sudo vi /etc/redis.conf

# 设置密码（取消注释并修改）
requirepass your_redis_password

# 绑定到本地（生产环境推荐）
bind 127.0.0.1

# 重启 Redis
sudo systemctl restart redis-server
# 或 CentOS
sudo systemctl restart redis

# 测试连接（需要密码）
redis-cli -a your_redis_password ping
```

### 4. 防火墙端口配置

#### Ubuntu/Debian (UFW)

```bash
# 启用防火墙
sudo ufw enable

# 开放必要端口
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 8080/tcp     # Spring Boot 应用
sudo ufw allow 80/tcp       # HTTP（如果使用 Nginx）
sudo ufw allow 443/tcp      # HTTPS（如果使用 Nginx）

# 查看防火墙状态
sudo ufw status
```

#### CentOS/RHEL (firewalld)

```bash
# 启动防火墙
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 开放必要端口
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# 重载防火墙配置
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-ports
```

---

## 项目打包

### 本地打包步骤

在本地开发机器上执行以下步骤：

```bash
# 进入项目目录
cd LoginDemo

# 清理并打包（跳过测试）
mvn clean package -DskipTests

# 打包完成后，JAR 文件位于：
# target/login-service-1.0.0.jar
```

### 打包文件说明

打包完成后会生成以下文件：

- `target/login-service-1.0.0.jar` - 可执行的 JAR 文件（包含所有依赖）
- `target/login-service-1.0.0.jar.original` - 原始 JAR 文件（不包含依赖，通常不使用）

**注意**：部署时只需要 `login-service-1.0.0.jar` 文件。

### 上传到服务器的方法

#### 方法 1：使用 SCP（推荐）

```bash
# 在本地机器执行
scp target/login-service-1.0.0.jar user@your-server-ip:/opt/logindemo/
```

#### 方法 2：使用 SFTP

```bash
# 使用 FileZilla、WinSCP 等工具
# 服务器地址：your-server-ip
# 端口：22
# 协议：SFTP
# 上传到：/opt/logindemo/
```

#### 方法 3：使用 Git（如果项目在 Git 仓库中）

```bash
# 在服务器上
cd /opt/logindemo
git clone your-repository-url
cd LoginDemo
mvn clean package -DskipTests
```

---

## 生产环境配置

### 1. 创建应用目录结构

```bash
# 创建应用目录
sudo mkdir -p /opt/logindemo
sudo mkdir -p /opt/logindemo/logs
sudo mkdir -p /opt/logindemo/config

# 设置权限
sudo chown -R $USER:$USER /opt/logindemo
```

### 2. 上传 JAR 文件

```bash
# 将 JAR 文件上传到服务器
# 假设文件已上传到 /opt/logindemo/login-service-1.0.0.jar
```

### 3. 配置生产环境 application.yml

创建生产环境配置文件 `/opt/logindemo/config/application-prod.yml`：

```bash
# 复制配置文件模板
cp src/main/resources/application-prod.yml /opt/logindemo/config/
```

**重要配置项**：

- **数据库连接**：修改为生产环境的数据库地址、用户名、密码
- **Redis 连接**：修改为生产环境的 Redis 地址、密码
- **JWT Secret**：**必须修改**为强密码（至少64字符）
- **日志级别**：生产环境建议设置为 INFO
- **CORS 配置**：限制允许的域名，不要使用 `*`

参考 `application-prod.yml` 模板文件进行配置。

### 4. 使用外部配置文件启动

Spring Boot 支持通过命令行参数指定配置文件：

```bash
java -jar login-service-1.0.0.jar \
  --spring.config.location=classpath:/application.yml,file:/opt/logindemo/config/application-prod.yml \
  --spring.profiles.active=prod
```

---

## 服务启动与管理

### 使用 systemd 创建服务

创建 systemd 服务文件 `/etc/systemd/system/login-service.service`：

```bash
sudo vi /etc/systemd/system/login-service.service
```

参考 `deploy/login-service.service` 文件内容。

### 服务管理命令

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start login-service

# 停止服务
sudo systemctl stop login-service

# 重启服务
sudo systemctl restart login-service

# 查看服务状态
sudo systemctl status login-service

# 设置开机自启动
sudo systemctl enable login-service

# 取消开机自启动
sudo systemctl disable login-service

# 查看服务日志
sudo journalctl -u login-service -f

# 查看最近100行日志
sudo journalctl -u login-service -n 100
```

### 日志查看与管理

应用日志文件位置：`/opt/logindemo/logs/application.log`

```bash
# 实时查看日志
tail -f /opt/logindemo/logs/application.log

# 查看最近100行日志
tail -n 100 /opt/logindemo/logs/application.log

# 搜索错误日志
grep ERROR /opt/logindemo/logs/application.log

# 按日期查看日志（如果配置了日志轮转）
ls -lh /opt/logindemo/logs/
```

---

## Nginx 反向代理配置（可选）

### Nginx 安装

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### CentOS/RHEL

```bash
sudo yum install -y nginx
# 或 CentOS 8+
sudo dnf install -y nginx

sudo systemctl start nginx
sudo systemctl enable nginx
```

### 反向代理配置

创建 Nginx 配置文件 `/etc/nginx/sites-available/logindemo`（Ubuntu）或 `/etc/nginx/conf.d/logindemo.conf`（CentOS）：

参考 `deploy/nginx.conf.example` 文件。

```bash
# Ubuntu
sudo vi /etc/nginx/sites-available/logindemo
sudo ln -s /etc/nginx/sites-available/logindemo /etc/nginx/sites-enabled/

# CentOS
sudo vi /etc/nginx/conf.d/logindemo.conf
```

### 测试和重载配置

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重载 Nginx 配置
sudo systemctl reload nginx
```

### SSL 证书配置（HTTPS）

#### 使用 Let's Encrypt（免费）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx
# 或 CentOS
sudo yum install -y certbot python3-certbot-nginx

# 获取证书（自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 证书自动续期（已自动配置）
```

#### 手动配置 SSL

在 Nginx 配置文件中添加 SSL 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL 配置优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置
}
```

---

## 监控与维护

### 服务健康检查

#### 检查服务是否运行

```bash
# 检查进程
ps aux | grep login-service

# 检查端口是否监听
netstat -tlnp | grep 8080
# 或使用 ss
ss -tlnp | grep 8080

# 检查服务状态
sudo systemctl status login-service
```

#### API 健康检查

```bash
# 如果配置了健康检查端点
curl http://localhost:8080/api/actuator/health

# 或测试登录接口
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### 日志监控

#### 设置日志轮转

编辑 `/etc/logrotate.d/logindemo`：

```
/opt/logindemo/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 user user
    sharedscripts
    postrotate
        systemctl reload login-service > /dev/null 2>&1 || true
    endscript
}
```

### 性能监控建议

- **JVM 监控**：使用 `jstat`、`jmap`、`jstack` 等工具
- **系统监控**：使用 `top`、`htop`、`iostat` 等工具
- **应用监控**：集成 Spring Boot Actuator（需要添加依赖）
- **日志聚合**：使用 ELK Stack、Loki 等工具

---

## 常见问题排查

### 启动失败排查

#### 1. 检查 Java 版本

```bash
java -version
# 确保是 Java 21
```

#### 2. 检查端口占用

```bash
# 检查 8080 端口是否被占用
sudo lsof -i :8080
# 或
sudo netstat -tlnp | grep 8080
```

#### 3. 检查日志

```bash
# 查看 systemd 日志
sudo journalctl -u login-service -n 100

# 查看应用日志
tail -n 100 /opt/logindemo/logs/application.log
```

#### 4. 检查配置文件

```bash
# 验证配置文件语法
java -jar login-service-1.0.0.jar --spring.config.location=file:/opt/logindemo/config/application-prod.yml --spring.profiles.active=prod --debug
```

### 数据库连接问题

#### 1. 检查 MySQL 服务状态

```bash
sudo systemctl status mysql
# 或 CentOS
sudo systemctl status mysqld
```

#### 2. 测试数据库连接

```bash
mysql -u logindemo -p -h localhost login_demo
```

#### 3. 检查防火墙

```bash
# 确保 MySQL 端口（3306）未被防火墙阻止
sudo ufw status
# 或
sudo firewall-cmd --list-ports
```

#### 4. 检查数据库用户权限

```sql
-- 登录 MySQL
mysql -u root -p

-- 检查用户权限
SHOW GRANTS FOR 'logindemo'@'localhost';
```

### Redis 连接问题

#### 1. 检查 Redis 服务状态

```bash
sudo systemctl status redis-server
# 或 CentOS
sudo systemctl status redis
```

#### 2. 测试 Redis 连接

```bash
redis-cli -a your_redis_password ping
```

#### 3. 检查 Redis 配置

```bash
# 查看 Redis 配置
redis-cli -a your_redis_password CONFIG GET requirepass
redis-cli -a your_redis_password CONFIG GET bind
```

### 端口占用问题

#### 查找占用端口的进程

```bash
# 查找占用 8080 端口的进程
sudo lsof -i :8080
sudo netstat -tlnp | grep 8080
sudo ss -tlnp | grep 8080
```

#### 终止进程

```bash
# 使用进程 ID 终止
sudo kill -9 <PID>

# 或使用服务命令
sudo systemctl stop <service-name>
```

### 内存不足问题

#### 检查内存使用

```bash
free -h
top
```

#### 调整 JVM 内存参数

编辑 systemd 服务文件，修改 JVM 参数：

```ini
Environment="JAVA_OPTS=-Xms512m -Xmx1024m"
```

---

## Docker 部署方案（可选）

### Dockerfile 编写

参考 `deploy/Dockerfile` 文件。

### Docker Compose 配置

参考 `deploy/docker-compose.yml` 文件，包含：
- Spring Boot 应用容器
- MySQL 容器
- Redis 容器
- Nginx 容器（可选）

### 容器化部署步骤

#### 1. 构建镜像

```bash
cd LoginDemo
docker build -t logindemo:1.0.0 -f deploy/Dockerfile .
```

#### 2. 使用 Docker Compose 启动

```bash
cd LoginDemo/deploy
docker-compose up -d
```

#### 3. 查看容器状态

```bash
docker-compose ps
docker-compose logs -f
```

#### 4. 停止服务

```bash
docker-compose down
```

### Docker 部署的优势

- **环境一致性**：开发、测试、生产环境一致
- **快速部署**：一键启动所有服务
- **资源隔离**：各服务独立运行
- **易于扩展**：可以轻松扩展多个实例

---

## 快速部署脚本

项目提供了自动化部署脚本 `deploy/deploy.sh`，可以简化部署过程。

**使用前请仔细阅读脚本内容，并根据实际情况修改配置。**

```bash
# 赋予执行权限
chmod +x deploy/deploy.sh

# 执行部署脚本
./deploy/deploy.sh
```

---

## 安全建议

1. **修改默认密码**：数据库、Redis 等服务的默认密码必须修改
2. **JWT Secret**：使用强密码（至少64字符），定期更换
3. **防火墙配置**：只开放必要的端口
4. **SSL/TLS**：生产环境必须使用 HTTPS
5. **定期更新**：及时更新系统和软件包
6. **日志审计**：定期检查日志，发现异常行为
7. **备份策略**：定期备份数据库和配置文件

---

## 附录

### 相关文件位置

- 主文档：`DEPLOYMENT.md`
- 生产配置模板：`src/main/resources/application-prod.yml`
- 服务文件：`deploy/login-service.service`
- Nginx 配置：`deploy/nginx.conf.example`
- Docker 文件：`deploy/Dockerfile`、`deploy/docker-compose.yml`
- 部署脚本：`deploy/deploy.sh`

### 参考资源

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Redis 官方文档](https://redis.io/documentation)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker 官方文档](https://docs.docker.com/)

---

**文档版本**：1.0  
**最后更新**：2024年

