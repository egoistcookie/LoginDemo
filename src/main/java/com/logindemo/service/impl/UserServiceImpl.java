package com.logindemo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logindemo.exception.BusinessException;
import com.logindemo.mapper.MockDataMapper;
import com.logindemo.mapper.UserMapper;
import com.logindemo.model.Menu;
import com.logindemo.model.MockData;
import com.logindemo.model.User;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.RegisterRequest;
import com.logindemo.model.dto.WechatQrcodeResponse;
import com.logindemo.model.dto.WechatStatusResponse;
import com.logindemo.service.MenuService;
import com.logindemo.service.UserService;
import com.logindemo.utils.JwtUtils;
import com.logindemo.utils.PasswordUtils;
import com.logindemo.utils.RedisUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private MenuService menuService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordUtils passwordUtils;

    @Autowired
    private RedisUtils redisUtils;
    
    @Autowired
    private MockDataMapper mockDataMapper;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private com.logindemo.service.CaptchaService captchaService;

    @Value("${login.max-attempts}")
    private int maxLoginAttempts;

    @Value("${login.lock-duration}")
    private int lockDuration;

    /**
     * 登录失败次数Redis Key前缀
     */
    private static final String LOGIN_ATTEMPT_PREFIX = "login:attempt:";
    
    /**
     * 用户锁定Redis Key前缀
     */
    private static final String USER_LOCK_PREFIX = "user:lock:";

    /**
     * Token黑名单Redis Key前缀
     */
    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("开始用户注册流程，用户名: {}, 邮箱: {}, 手机号: {}", 
                request.getUsername(), request.getEmail(), request.getPhone());
        
        try {
            // 检查用户名是否已存在
            logger.debug("检查用户名是否已存在: {}", request.getUsername());
            if (Objects.nonNull(userMapper.findByUsername(request.getUsername()))) {
                logger.warn("用户名已存在: {}", request.getUsername());
                throw new BusinessException(400, "用户名已存在");
            }

            // 检查邮箱是否已存在
            logger.debug("检查邮箱是否已存在: {}", request.getEmail());
            if (Objects.nonNull(userMapper.findByEmail(request.getEmail()))) {
                logger.warn("邮箱已被注册: {}", request.getEmail());
                throw new BusinessException(400, "邮箱已被注册");
            }

            // 检查手机号是否已存在
            logger.debug("检查手机号是否已存在: {}", request.getPhone());
            if (Objects.nonNull(request.getPhone()) && !request.getPhone().isEmpty() 
                    && Objects.nonNull(userMapper.findByPhone(request.getPhone()))) {
                logger.warn("手机号已被注册: {}", request.getPhone());
                throw new BusinessException("手机号已被注册");
            }

            // 创建用户
            logger.debug("开始创建用户对象");
            User user = new User();
            user.setUsername(request.getUsername());
            logger.debug("密码加密中...");
            user.setPassword(passwordUtils.encode(request.getPassword()));
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setStatus(1); // 启用状态
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            // 保存用户
            logger.debug("保存用户到数据库");
            userMapper.insert(user);
            logger.info("用户保存成功，ID: {}", user.getId());

            // 生成Token
            logger.debug("为用户生成Token");
            String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
            String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());

            // 构建响应
            logger.debug("构建认证响应");
            AuthResponse response = new AuthResponse();
            response.setAccessToken(accessToken);
            response.setRefreshToken(refreshToken);
            response.setExpiresIn(jwtUtils.getExpirationTime());

            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo();
            userInfo.setId(user.getId());
            userInfo.setUsername(user.getUsername());
            userInfo.setEmail(user.getEmail());
            userInfo.setPhone(user.getPhone());
            response.setUser(userInfo);

            logger.info("用户注册流程完成，ID: {}", user.getId());
            return response;
        } catch (BusinessException e) {
            logger.error("注册业务异常: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("注册过程中发生系统异常", e);
            throw new BusinessException("注册失败，请稍后重试");
        }
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername();

        // 检查用户是否被锁定
        checkUserLocked(username);

        // 检查是否需要验证码
        boolean requiresCaptcha = captchaService.requiresCaptcha(username);
        if (requiresCaptcha) {
            // 如果需要验证码，验证验证码
            if (request.getCaptchaKey() == null || request.getCaptchaCode() == null) {
                throw new BusinessException("请输入验证码");
            }
            if (!captchaService.validateCaptcha(request.getCaptchaKey(), request.getCaptchaCode())) {
                // 验证码错误，记录失败次数
                recordLoginAttempt(username);
                throw new BusinessException("验证码错误");
            }
        }

        // 根据用户名查询用户
        User user = userMapper.findByUsername(username);
        if (Objects.isNull(user)) {
            // 记录失败次数
            recordLoginAttempt(username);
            throw new BusinessException("用户名或密码错误");
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }

        // 验证密码
        if (!passwordUtils.matches(request.getPassword(), user.getPassword())) {
            // 记录失败次数
            recordLoginAttempt(username);
            throw new BusinessException("用户名或密码错误");
        }

        // 清除登录失败记录
        redisUtils.delete(LOGIN_ATTEMPT_PREFIX + username);

        // 生成Token
        String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());

        // 构建响应
        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(jwtUtils.getExpirationTime());

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhone());
        response.setUser(userInfo);

        return response;
    }

    @Override
    public void logout(String token) {
        // 将Token加入黑名单
        Long userId = jwtUtils.getUserIdFromToken(token);
        long expiresTime = jwtUtils.getExpireTime();
        redisUtils.set(TOKEN_BLACKLIST_PREFIX + token, userId, expiresTime / 1000);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // 验证刷新Token
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new BusinessException("刷新Token无效");
        }

        // 获取用户信息
        Long userId = jwtUtils.getUserIdFromToken(refreshToken);
        String username = jwtUtils.getUsernameFromToken(refreshToken);

        // 检查用户是否存在
        User user = userMapper.selectById(userId);
        if (Objects.isNull(user) || user.getStatus() == 0) {
            throw new BusinessException("用户不存在或已被禁用");
        }

        // 生成新的访问Token
        String newAccessToken = jwtUtils.generateAccessToken(userId, username);

        // 构建响应
        AuthResponse response = new AuthResponse();
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(jwtUtils.getExpirationTime());

        return response;
    }

    @Override
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public User getUserByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Override
    public boolean validateToken(String token) {
        // 检查Token是否在黑名单中
        if (redisUtils.hasKey(TOKEN_BLACKLIST_PREFIX + token)) {
            return false;
        }
        // 验证Token
        return jwtUtils.validateToken(token);
    }

    @Override
    public List<User> getAllUsers() {
        logger.info("获取所有用户列表");
        try {
            return userMapper.selectList(null);
        } catch (Exception e) {
            logger.error("获取用户列表失败", e);
            throw new BusinessException("获取用户列表失败");
        }
    }

    @Override
    @Transactional
    public boolean updateUser(User user) {
        logger.info("更新用户信息，用户ID: {}", user.getId());
        try {
            // 检查用户是否存在
            User existingUser = userMapper.selectById(user.getId());
            if (Objects.isNull(existingUser)) {
                logger.warn("用户不存在，ID: {}", user.getId());
                throw new BusinessException("用户不存在");
            }

            // 检查邮箱是否被其他用户使用
            if (!existingUser.getEmail().equals(user.getEmail())) {
                User userWithSameEmail = userMapper.findByEmail(user.getEmail());
                if (Objects.nonNull(userWithSameEmail) && !userWithSameEmail.getId().equals(user.getId())) {
                    logger.warn("邮箱已被其他用户使用: {}", user.getEmail());
                    throw new BusinessException(400, "邮箱已被使用");
                }
            }

            // 检查手机号是否被其他用户使用
            if (Objects.nonNull(user.getPhone()) && (Objects.isNull(existingUser.getPhone()) || !existingUser.getPhone().equals(user.getPhone()))) {
                if (userMapper.selectCount(new QueryWrapper<User>().eq("phone", user.getPhone()).ne("id", user.getId())) > 0) {
                    logger.warn("手机号已被其他用户使用: {}", user.getPhone());
                    throw new BusinessException(400, "手机号已被其他用户使用: " + user.getPhone());
                }
            }

            // 设置更新时间
            user.setUpdatedAt(LocalDateTime.now());
            
            // 不更新密码字段（密码更新应该有专门的方法）
            user.setPassword(existingUser.getPassword());
            
            int result = userMapper.updateById(user);
            logger.info("用户更新成功，ID: {}", user.getId());
            return result > 0;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("更新用户失败，ID: {}", user.getId(), e);
            throw new BusinessException(400, "更新用户失败");
        }
    }

    @Override
    @Transactional
    public boolean addUser(User user) {
        logger.info("添加新用户，用户名: {}", user.getUsername());
        try {
            // 检查用户名是否已存在
            if (Objects.nonNull(userMapper.findByUsername(user.getUsername()))) {
                logger.warn("用户名已存在: {}", user.getUsername());
                throw new BusinessException("用户名已存在");
            }

            // 检查邮箱是否已存在
            if (Objects.nonNull(userMapper.findByEmail(user.getEmail()))) {
                logger.warn("邮箱已被注册: {}", user.getEmail());
                throw new BusinessException("邮箱已被注册");
            }

            // 检查手机号是否已存在
            if (Objects.nonNull(user.getPhone()) && !user.getPhone().isEmpty()
                    && Objects.nonNull(userMapper.findByPhone(user.getPhone()))) {
                logger.warn("手机号已被注册: {}", user.getPhone());
                throw new BusinessException("手机号已被注册");
            }

            // 设置创建和更新时间
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            // 如果密码未加密，进行加密
            if (!user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordUtils.encode(user.getPassword()));
            }
            
            int result = userMapper.insert(user);
            logger.info("用户添加成功，ID: {}", user.getId());
            return result > 0;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("添加用户失败，用户名: {}", user.getUsername(), e);
            throw new BusinessException("添加用户失败");
        }
    }

    @Override
    @Transactional
    public boolean deleteUser(Long id) {
        logger.info("删除用户，ID: {}", id);
        try {
            // 检查用户是否存在
            User user = userMapper.selectById(id);
            if (Objects.isNull(user)) {
                logger.warn("用户不存在，ID: {}", id);
                throw new BusinessException("用户不存在");
            }
            
            int result = userMapper.deleteById(id);
            logger.info("用户删除成功，ID: {}", id);
            return result > 0;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("删除用户失败，ID: {}", id, e);
            throw new BusinessException("删除用户失败");
        }
    }

    /**
     * 检查用户是否被锁定
     */
    private void checkUserLocked(String username) {
        if (redisUtils.hasKey(USER_LOCK_PREFIX + username)) {
            long remainingTime = redisUtils.getExpire(USER_LOCK_PREFIX + username);
            logger.debug("用户[{}]账户已被锁定，剩余锁定时间: {}秒", username, remainingTime);
            throw new BusinessException("账户已被锁定，请" + remainingTime + "秒后再试");
        }
    }

    /**
     * 记录登录失败次数，超过限制则锁定账户
     */
    private void recordLoginAttempt(String username) {
        Long attempts = redisUtils.increment(LOGIN_ATTEMPT_PREFIX + username, 3600); // 1小时内的失败次数
        logger.debug("用户[{}]登录失败，当前失败次数: {}", username, attempts);
        if (attempts >= maxLoginAttempts) {
            // 锁定账户
            redisUtils.set(USER_LOCK_PREFIX + username, "locked", lockDuration);
            logger.info("用户[{}]登录失败次数超过限制({}次)，账户已被锁定{}秒", 
                       username, maxLoginAttempts, lockDuration);
            // 清除失败记录
            redisUtils.delete(LOGIN_ATTEMPT_PREFIX + username);
            throw new BusinessException("登录失败次数过多，账户已被锁定" + lockDuration + "秒");
        }
    }
    
    @Override
    public Map<String, Object> convertUserToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("status", user.getStatus());
        map.put("createdAt", user.getCreatedAt());
        map.put("updatedAt", user.getUpdatedAt());
        return map;
    }
    
    @Override
    public List<Menu> getUserMenus(String username) {
        // 获取用户的角色ID列表
        List<Long> roleIds = userMapper.selectRoleIdsByUsername(username);
        
        // 根据角色ID列表获取菜单树
        return menuService.getUserMenuTree(roleIds);
    }
    
    @Override
    public boolean updatePassword(Long userId, String newPassword) {
        logger.info("更新用户密码，用户ID: {}", userId);
        try {
            // 检查用户是否存在
            User existingUser = userMapper.selectById(userId);
            if (Objects.isNull(existingUser)) {
                logger.warn("用户不存在，ID: {}", userId);
                throw new BusinessException("用户不存在");
            }
            
            // 对新密码进行加密
            String encodedPassword = passwordUtils.encode(newPassword);
            
            // 创建更新对象
            User updateUser = new User();
            updateUser.setId(userId);
            updateUser.setPassword(encodedPassword);
            updateUser.setUpdatedAt(LocalDateTime.now());
            
            // 更新密码
            int result = userMapper.updateById(updateUser);
            logger.info("用户密码更新成功，ID: {}", userId);
            return result > 0;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("更新用户密码失败，ID: {}", userId, e);
            throw new BusinessException("更新密码失败");
        }
    }
    
    @Override
    public void sendSmsCode(String phone) {
        logger.info("发送短信验证码，手机号: {}", phone);
        
        // 检查手机号格式
        if (!phone.matches("^1[3-9]\\d{9}$")) {
            throw new BusinessException("手机号格式不正确");
        }
        
        // 检查用户是否存在（手机号登录需要用户已注册）
        User user = userMapper.findByPhone(phone);
        if (Objects.isNull(user)) {
            throw new BusinessException("该手机号未注册");
        }
        
        // 检查是否在1分钟内已发送过验证码（防止频繁发送）
        MockData existingData = mockDataMapper.findByTypeAndKey("sms_code", phone);
        if (Objects.nonNull(existingData)) {
            long secondsSinceCreation = java.time.Duration.between(
                existingData.getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (secondsSinceCreation < 60) {
                throw new BusinessException("验证码发送过于频繁，请稍后再试");
            }
        }
        
        // 生成6位随机验证码
        String code = String.format("%06d", (int)(Math.random() * 1000000));
        
        // 保存到mock_data表（5分钟有效）
        MockData mockData = new MockData();
        mockData.setDataType("sms_code");
        mockData.setDataKey(phone);
        mockData.setDataValue(code);
        mockData.setStatus("active");
        mockData.setExpireTime(LocalDateTime.now().plusMinutes(5));
        mockData.setCreatedAt(LocalDateTime.now());
        mockData.setUpdatedAt(LocalDateTime.now());
        
        // 如果有旧数据，先更新状态为已使用
        if (Objects.nonNull(existingData)) {
            mockDataMapper.updateStatus(existingData.getId(), "used");
        }
        
        mockDataMapper.insert(mockData);
        
        logger.info("短信验证码已生成并保存，手机号: {}, 验证码: {}", phone, code);
        // 注意：实际生产环境应该调用短信服务发送验证码，这里只是保存到数据库
    }
    
    @Override
    public AuthResponse loginByPhone(String phone, String code) {
        logger.info("手机验证码登录，手机号: {}", phone);
        
        // 验证手机号格式
        if (!phone.matches("^1[3-9]\\d{9}$")) {
            throw new BusinessException("手机号格式不正确");
        }
        
        // 从mock_data表查询验证码
        MockData mockData = mockDataMapper.findByTypeAndKey("sms_code", phone);
        if (Objects.isNull(mockData)) {
            throw new BusinessException("验证码不存在或已过期");
        }
        
        // 检查验证码是否过期
        if (Objects.nonNull(mockData.getExpireTime()) && 
            mockData.getExpireTime().isBefore(LocalDateTime.now())) {
            mockDataMapper.updateStatus(mockData.getId(), "expired");
            throw new BusinessException("验证码已过期");
        }
        
        // 检查验证码是否已使用
        if ("used".equals(mockData.getStatus())) {
            throw new BusinessException("验证码已被使用");
        }
        
        // 验证验证码
        if (!code.equals(mockData.getDataValue())) {
            throw new BusinessException("验证码错误");
        }
        
        // 标记验证码为已使用
        mockDataMapper.updateStatus(mockData.getId(), "used");
        
        // 根据手机号查询用户
        User user = userMapper.findByPhone(phone);
        if (Objects.isNull(user)) {
            throw new BusinessException("用户不存在");
        }
        
        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }
        
        // 生成Token
        String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());
        
        // 构建响应
        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(jwtUtils.getExpirationTime());
        
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhone());
        response.setUser(userInfo);
        
        logger.info("手机验证码登录成功，用户ID: {}, 用户名: {}", user.getId(), user.getUsername());
        return response;
    }
    
    @Override
    public WechatQrcodeResponse getWechatQrcode() {
        logger.info("获取微信登录二维码");
        
        // 生成唯一的ticket
        String ticket = "WX_TICKET_" + System.currentTimeMillis() + "_" + 
                        String.format("%04d", (int)(Math.random() * 10000));
        
        // 生成二维码URL（实际应该调用微信API生成，这里使用模拟URL）
        String qrcodeUrl = "https://via.placeholder.com/200x200?text=WeChat+QRCode+" + ticket;
        
        // 保存到mock_data表（2分钟有效）
        MockData mockData = new MockData();
        mockData.setDataType("wechat_qrcode");
        mockData.setDataKey(ticket);
        mockData.setDataValue(qrcodeUrl);
        
        // extraData存储状态信息
        try {
            Map<String, Object> extraMap = new HashMap<>();
            extraMap.put("status", "waiting");
            extraMap.put("userId", null);
            mockData.setExtraData(objectMapper.writeValueAsString(extraMap));
        } catch (Exception e) {
            logger.error("序列化extraData失败", e);
            mockData.setExtraData("{\"status\":\"waiting\",\"userId\":null}");
        }
        
        mockData.setStatus("active");
        mockData.setExpireTime(LocalDateTime.now().plusMinutes(2));
        mockData.setCreatedAt(LocalDateTime.now());
        mockData.setUpdatedAt(LocalDateTime.now());
        
        mockDataMapper.insert(mockData);
        
        // 构建响应
        WechatQrcodeResponse response = new WechatQrcodeResponse();
        response.setQrcodeUrl(qrcodeUrl);
        response.setTicket(ticket);
        response.setExpireSeconds(120L);
        
        logger.info("微信登录二维码已生成，ticket: {}", ticket);
        return response;
    }
    
    @Override
    public WechatStatusResponse getWechatStatus(String ticket) {
        logger.debug("查询微信扫码状态，ticket: {}", ticket);
        
        // 从mock_data表查询二维码数据
        MockData mockData = mockDataMapper.findByTypeAndKey("wechat_qrcode", ticket);
        if (Objects.isNull(mockData)) {
            WechatStatusResponse response = new WechatStatusResponse();
            response.setStatus("expired");
            return response;
        }
        
        // 检查是否过期
        if (Objects.nonNull(mockData.getExpireTime()) && 
            mockData.getExpireTime().isBefore(LocalDateTime.now())) {
            mockDataMapper.updateStatus(mockData.getId(), "expired");
            WechatStatusResponse response = new WechatStatusResponse();
            response.setStatus("expired");
            return response;
        }
        
        // 解析extraData获取状态
        String status = "waiting";
        Long userId = null;
        
        try {
            if (Objects.nonNull(mockData.getExtraData()) && !mockData.getExtraData().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> extraMap = (Map<String, Object>) objectMapper.readValue(
                    mockData.getExtraData(), Map.class);
                status = (String) extraMap.getOrDefault("status", "waiting");
                userId = extraMap.get("userId") != null ? 
                    Long.valueOf(extraMap.get("userId").toString()) : null;
            }
        } catch (Exception e) {
            logger.error("解析extraData失败", e);
        }
        
        WechatStatusResponse response = new WechatStatusResponse();
        
        // 如果是等待状态，模拟扫码流程（实际应该由微信回调触发）
        if ("waiting".equals(status)) {
            // 模拟：30秒后自动变为已扫描状态（实际应该由微信回调设置）
            long secondsSinceCreation = java.time.Duration.between(
                mockData.getCreatedAt(), LocalDateTime.now()).getSeconds();
            
            // 模拟扫码确认流程：超过15秒认为已扫描，超过30秒认为已确认（仅用于演示）
            if (secondsSinceCreation > 30) {
                // 模拟用户确认登录
                status = "confirmed";
                
                // 查找或创建测试用户（实际应该根据微信用户信息查找）
                User user = userMapper.findByPhone("13800138000");
                if (Objects.isNull(user)) {
                    // 如果没有找到用户，创建一个测试用户
                    user = new User();
                    user.setUsername("wechat_user_" + System.currentTimeMillis());
                    user.setPassword(passwordUtils.encode("123456"));
                    user.setEmail("wechat@example.com");
                    user.setPhone("13800138000");
                    user.setStatus(1);
                    user.setCreatedAt(LocalDateTime.now());
                    user.setUpdatedAt(LocalDateTime.now());
                    userMapper.insert(user);
                }
                
                userId = user.getId();
                
                // 生成Token
                String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
                String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());
                
                // 构建认证响应
                AuthResponse authResponse = new AuthResponse();
                authResponse.setAccessToken(accessToken);
                authResponse.setRefreshToken(refreshToken);
                authResponse.setExpiresIn(jwtUtils.getExpirationTime());
                
                AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo();
                userInfo.setId(user.getId());
                userInfo.setUsername(user.getUsername());
                userInfo.setEmail(user.getEmail());
                userInfo.setPhone(user.getPhone());
                authResponse.setUser(userInfo);
                
                response.setAuthResponse(authResponse);
                
                // 更新mock_data状态
                try {
                    Map<String, Object> extraMap = new HashMap<>();
                    extraMap.put("status", "confirmed");
                    extraMap.put("userId", userId);
                    mockData.setExtraData(objectMapper.writeValueAsString(extraMap));
                } catch (Exception e) {
                    logger.error("更新extraData失败", e);
                }
                mockData.setStatus("used");
                mockData.setUpdatedAt(LocalDateTime.now());
                mockDataMapper.updateById(mockData);
                
            } else if (secondsSinceCreation > 15) {
                status = "scanned";
            }
        } else if ("confirmed".equals(status) && Objects.nonNull(userId)) {
            // 如果已确认，构建认证响应
            User user = userMapper.selectById(userId);
            if (Objects.nonNull(user)) {
                String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
                String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());
                
                AuthResponse authResponse = new AuthResponse();
                authResponse.setAccessToken(accessToken);
                authResponse.setRefreshToken(refreshToken);
                authResponse.setExpiresIn(jwtUtils.getExpirationTime());
                
                AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo();
                userInfo.setId(user.getId());
                userInfo.setUsername(user.getUsername());
                userInfo.setEmail(user.getEmail());
                userInfo.setPhone(user.getPhone());
                authResponse.setUser(userInfo);
                
                response.setAuthResponse(authResponse);
            }
        }
        
        response.setStatus(status);
        return response;
    }
}