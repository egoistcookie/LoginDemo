package com.logindemo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.logindemo.exception.BusinessException;
import com.logindemo.mapper.UserMapper;
import com.logindemo.model.User;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.RegisterRequest;
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
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordUtils passwordUtils;

    @Autowired
    private RedisUtils redisUtils;

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
                throw new BusinessException("用户名已存在");
            }

            // 检查邮箱是否已存在
            logger.debug("检查邮箱是否已存在: {}", request.getEmail());
            if (Objects.nonNull(userMapper.findByEmail(request.getEmail()))) {
                logger.warn("邮箱已被注册: {}", request.getEmail());
                throw new BusinessException("邮箱已被注册");
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

    /**
     * 检查用户是否被锁定
     */
    private void checkUserLocked(String username) {
        if (redisUtils.hasKey(USER_LOCK_PREFIX + username)) {
            long remainingTime = redisUtils.getExpire(USER_LOCK_PREFIX + username);
            throw new BusinessException("账户已被锁定，请" + remainingTime + "秒后再试");
        }
    }

    /**
     * 记录登录失败次数，超过限制则锁定账户
     */
    private void recordLoginAttempt(String username) {
        Long attempts = redisUtils.increment(LOGIN_ATTEMPT_PREFIX + username, 3600); // 1小时内的失败次数
        if (attempts >= maxLoginAttempts) {
            // 锁定账户
            redisUtils.set(USER_LOCK_PREFIX + username, "locked", lockDuration);
            // 清除失败记录
            redisUtils.delete(LOGIN_ATTEMPT_PREFIX + username);
            throw new BusinessException("登录失败次数过多，账户已被锁定" + lockDuration + "秒");
        }
    }
}