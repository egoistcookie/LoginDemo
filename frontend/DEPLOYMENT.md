# 前端部署指南 - 阿里云服务器

本文档介绍如何将前端项目部署到已有 Nginx 服务的阿里云服务器。

## 一、部署前准备

### 1. 确认配置

**重要**：`frontend/src/config.js` 已自动配置为生产环境模式：
- **生产环境**：自动使用相对路径 `/api`（通过 Nginx 代理）
- **开发环境**：使用完整 URL `http://120.77.92.36:8080/api`

构建时会自动检测 `NODE_ENV=production`，使用相对路径，无需手动修改。

### 2. 服务器环境

- **服务器 IP**：120.77.92.36
- **操作系统**：Linux（已安装 Nginx）
- **现有服务**：域名 `www.egoistcookie.top` 已在使用
- **部署方式**：通过 IP 地址访问，与现有域名服务共用 80 端口
- **部署路径**：`/home/projectJar/frontend/`

## 二、本地构建

### 1. 安装依赖（如果还没有）

```bash
cd frontend
npm install
```

### 2. 构建生产版本

```bash
npm run build
```

构建完成后，会在 `frontend/build` 目录下生成静态文件。

### 3. 验证构建结果

检查 `build` 目录是否包含以下文件：
- `index.html`
- `static/` 目录（包含 JS、CSS 等资源文件）

## 三、上传到服务器

### 方法 1：使用 SCP（推荐）

```bash
# Windows PowerShell
scp -r build/* root@120.77.92.36:/home/projectJar/frontend/

# Linux/Mac
scp -r build/* root@120.77.92.36:/home/projectJar/frontend/
```

### 方法 2：使用 SFTP 工具

使用 FileZilla、WinSCP 等工具：
- **服务器地址**：120.77.92.36
- **端口**：22
- **协议**：SFTP
- **上传目录**：`/home/projectJar/frontend/`

## 四、Nginx 配置（与现有服务共存）

### 重要说明

服务器上已有 Nginx 服务，配置文件位于 `/etc/nginx/nginx.conf`。我们将添加新的 server 块，通过 IP 地址访问，不影响现有域名服务。

### 配置步骤

#### 1. SSH 登录服务器

```bash
ssh root@120.77.92.36
```

#### 2. 创建前端部署目录（如果还没有）

```bash
sudo mkdir -p /home/projectJar/frontend
```

#### 3. 编辑 Nginx 配置

```bash
sudo nano /etc/nginx/nginx.conf
```

#### 4. 在 http 块的最后，添加新的 server 块

在现有配置的最后一个 `server` 块之后、最后的 `}` 之前添加：

```nginx
# 登录演示系统 - 通过 IP 访问
server {
    listen 80;
    server_name 120.77.92.36;  # 使用 IP，不会与现有域名冲突

    # 前端静态文件目录
    root /home/projectJar/frontend;
    index index.html;

    # 日志配置
    access_log /var/log/nginx/logindemo-frontend_access.log;
    error_log /var/log/nginx/logindemo-frontend_error.log;

    # 客户端最大请求体大小
    client_max_body_size 10M;

    # Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript 
               image/svg+xml;

    # 静态资源缓存（长期缓存）
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API 请求代理到后端 Spring Boot 应用
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲配置
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # React Router 支持 - 所有路由都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### 5. 保存并退出

- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

#### 6. 测试配置

```bash
sudo nginx -t
```

如果显示 `syntax is ok` 和 `test is successful`，说明配置正确。

#### 7. 重新加载 Nginx

```bash
sudo systemctl reload nginx
```

## 五、工作原理

通过 `server_name` 指令，Nginx 可以在同一个 80 端口上区分不同的服务：

- **访问 `http://www.egoistcookie.top`** → 现有服务（端口 5000）
- **访问 `http://120.77.92.36`** → 登录演示系统前端
- **访问 `http://120.77.92.36/api/`** → 代理到后端（端口 8080）

两个服务互不影响，共用 80 端口。

## 六、验证部署

### 1. 检查服务状态

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查端口监听
sudo netstat -tlnp | grep :80
```

### 2. 访问测试

在浏览器中访问：
- **登录系统**：`http://120.77.92.36`
- **现有服务**：`http://www.egoistcookie.top`（确认不受影响）

### 3. 检查日志

```bash
# 查看访问日志
sudo tail -f /var/log/nginx/logindemo-frontend_access.log

# 查看错误日志
sudo tail -f /var/log/nginx/logindemo-frontend_error.log
```

## 七、后端服务部署

### 1. 打包后端项目

```bash
# 在项目根目录执行
mvn clean package -DskipTests
```

### 2. 上传 jar 包

```bash
scp target/login-service-1.0.0.jar root@120.77.92.36:/home/projectJar/
```

### 3. 启动后端服务

```bash
# SSH 登录服务器
ssh root@120.77.92.36

# 停止旧服务（如果有）
pkill -f login-service

# 启动新服务
cd /home/projectJar
nohup java -jar login-service-1.0.0.jar > /dev/null 2>&1 &

# 查看日志
tail -f logs/application.log
```

### 4. 验证后端服务

```bash
# 检查端口
netstat -tlnp | grep 8080

# 测试 API
curl http://127.0.0.1:8080/api/auth/validate
```

## 八、常见问题

### 1. 页面空白或 404

**原因**：React Router 需要服务器支持前端路由。

**解决**：确保 Nginx 配置中有：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. API 请求失败 404

**原因**：后端服务未运行或版本过旧。

**解决**：
1. 检查后端服务是否运行：`ps aux | grep login-service`
2. 重新打包并上传最新版本
3. 重启后端服务

### 3. 静态资源加载失败

**原因**：文件路径或权限问题。

**解决**：
```bash
# 检查文件是否存在
ls -la /home/projectJar/frontend/

# 设置正确的权限
sudo chown -R nginx:nginx /home/projectJar/frontend/
# 或
sudo chown -R www-data:www-data /home/projectJar/frontend/
```

### 4. Nginx 配置冲突

**原因**：server_name 重复或配置语法错误。

**解决**：
```bash
# 测试配置
sudo nginx -t

# 查看错误信息
sudo tail -50 /var/log/nginx/error.log
```

### 5. 端口被占用

**原因**：80 端口已被其他服务占用。

**解决**：
```bash
# 查看端口占用
sudo netstat -tlnp | grep :80

# 如果是 Nginx，重新加载即可
sudo systemctl reload nginx
```

## 九、更新部署

### 更新前端

```bash
# 1. 本地重新构建
cd frontend
npm run build

# 2. 上传到服务器
scp -r build/* root@120.77.92.36:/home/projectJar/frontend/

# 3. 清除浏览器缓存或强制刷新（Ctrl+Shift+R）
```

### 更新后端

```bash
# 1. 本地重新打包
mvn clean package -DskipTests

# 2. 上传到服务器
scp target/login-service-1.0.0.jar root@120.77.92.36:/home/projectJar/

# 3. 重启后端服务
ssh root@120.77.92.36
pkill -f login-service
cd /home/projectJar
nohup java -jar login-service-1.0.0.jar > /dev/null 2>&1 &
```

## 十、性能优化建议

1. **启用 Gzip 压缩**：已在配置中包含
2. **静态资源缓存**：已配置 1 年缓存
3. **HTTP/2**：如果配置 HTTPS，可启用 HTTP/2
4. **CDN 加速**：考虑使用阿里云 CDN

## 十一、安全建议

1. **配置 HTTPS**：使用 Let's Encrypt 免费证书
2. **防火墙规则**：只开放必要端口
3. **定期更新**：及时更新系统和软件包
4. **日志监控**：定期检查访问和错误日志

## 十二、快速命令参考

```bash
# 构建前端
cd frontend && npm run build

# 上传前端
scp -r build/* root@120.77.92.36:/home/projectJar/frontend/

# 打包后端
mvn clean package -DskipTests

# 上传后端
scp target/login-service-1.0.0.jar root@120.77.92.36:/home/projectJar/

# 重启后端
ssh root@120.77.92.36 "pkill -f login-service && cd /home/projectJar && nohup java -jar login-service-1.0.0.jar > /dev/null 2>&1 &"

# 重新加载 Nginx
ssh root@120.77.92.36 "sudo systemctl reload nginx"

# 查看日志
ssh root@120.77.92.36 "tail -f /home/projectJar/logs/application.log"
```

---

**部署完成后：**
- 前端访问：`http://120.77.92.36`
- 现有服务：`http://www.egoistcookie.top`（不受影响）
- 两个服务共用 80 端口，通过域名/IP 区分
