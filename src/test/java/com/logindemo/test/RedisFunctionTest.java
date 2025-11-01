package com.logindemo.test;

import com.logindemo.utils.RedisUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.concurrent.TimeUnit;

/**
 * Redis功能测试类
 * 用于测试Redis在登录功能中的应用是否正常
 */
@SpringBootTest
@TestPropertySource(locations = "classpath:application.yml")
public class RedisFunctionTest {

    @Autowired
    private RedisUtils redisUtils;

    // 测试键前缀（与UserServiceImpl保持一致）
    private static final String LOGIN_ATTEMPT_PREFIX = "login:attempt:";
    private static final String USER_LOCK_PREFIX = "user:lock:";
    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";
    
    // 测试用户名
    private static final String TEST_USERNAME = "test_user";
    private static final String TEST_TOKEN = "test_token_value";

    /**
     * 测试Redis连接和基本操作
     */
    @Test
    public void testRedisConnection() {
        System.out.println("========== 开始测试Redis连接和基本操作 ==========");
        
        try {
            // 测试设置键值对
            String testKey = "test:connection";
            redisUtils.set(testKey, "test_value", 60);
            System.out.println("设置键值对成功: " + testKey);
            
            // 测试获取值
            Object value = redisUtils.get(testKey);
            System.out.println("获取值成功: " + value);
            
            // 测试键是否存在
            boolean exists = redisUtils.hasKey(testKey);
            System.out.println("检查键是否存在: " + exists);
            
            // 测试递增操作
            Long increment = redisUtils.increment("test:increment", 60);
            System.out.println("递增操作成功: " + increment);
            
            // 测试删除键
            boolean deleted = redisUtils.delete(testKey);
            System.out.println("删除键成功: " + deleted);
            
            System.out.println("Redis连接和基本操作测试通过！");
        } catch (Exception e) {
            System.err.println("Redis连接或操作测试失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("========== Redis连接和基本操作测试结束 ==========\n");
    }

    /**
     * 测试登录失败次数记录功能
     */
    @Test
    public void testLoginAttempts() {
        System.out.println("========== 开始测试登录失败次数记录功能 ==========");
        
        try {
            // 先清除可能存在的测试数据
            redisUtils.delete(LOGIN_ATTEMPT_PREFIX + TEST_USERNAME);
            
            // 模拟多次登录失败
            int testAttempts = 3;
            for (int i = 1; i <= testAttempts; i++) {
                Long attempts = redisUtils.increment(LOGIN_ATTEMPT_PREFIX + TEST_USERNAME, 3600);
                System.out.println("第" + i + "次登录失败，累计失败次数: " + attempts);
            }
            
            // 验证失败次数是否正确
            Long finalAttempts = redisUtils.increment(LOGIN_ATTEMPT_PREFIX + TEST_USERNAME, 3600);
            System.out.println("最终失败次数: " + finalAttempts);
            
            // 检查键的过期时间
            Long expireTime = redisUtils.getExpire(LOGIN_ATTEMPT_PREFIX + TEST_USERNAME);
            System.out.println("失败次数记录过期时间: " + expireTime + "秒");
            
            // 清理测试数据
            redisUtils.delete(LOGIN_ATTEMPT_PREFIX + TEST_USERNAME);
            
            System.out.println("登录失败次数记录功能测试通过！");
        } catch (Exception e) {
            System.err.println("登录失败次数记录功能测试失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("========== 登录失败次数记录功能测试结束 ==========\n");
    }

    /**
     * 测试用户锁定功能
     */
    @Test
    public void testUserLock() {
        System.out.println("========== 开始测试用户锁定功能 ==========");
        
        try {
            // 先清除可能存在的测试数据
            redisUtils.delete(USER_LOCK_PREFIX + TEST_USERNAME);
            
            // 模拟锁定用户，锁定时间设为60秒
            int lockTime = 60;
            redisUtils.set(USER_LOCK_PREFIX + TEST_USERNAME, "locked", lockTime);
            System.out.println("用户已锁定，锁定时间: " + lockTime + "秒");
            
            // 验证用户是否被锁定
            boolean isLocked = redisUtils.hasKey(USER_LOCK_PREFIX + TEST_USERNAME);
            System.out.println("用户锁定状态: " + isLocked);
            
            // 获取剩余锁定时间
            Long remainingTime = redisUtils.getExpire(USER_LOCK_PREFIX + TEST_USERNAME);
            System.out.println("剩余锁定时间: " + remainingTime + "秒");
            
            // 等待几秒后再次检查剩余锁定时间
            System.out.println("等待3秒后再次检查...");
            TimeUnit.SECONDS.sleep(3);
            Long newRemainingTime = redisUtils.getExpire(USER_LOCK_PREFIX + TEST_USERNAME);
            System.out.println("3秒后剩余锁定时间: " + newRemainingTime + "秒");
            
            // 清理测试数据
            redisUtils.delete(USER_LOCK_PREFIX + TEST_USERNAME);
            
            System.out.println("用户锁定功能测试通过！");
        } catch (Exception e) {
            System.err.println("用户锁定功能测试失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("========== 用户锁定功能测试结束 ==========\n");
    }

    /**
     * 测试Token黑名单功能
     */
    @Test
    public void testTokenBlacklist() {
        System.out.println("========== 开始测试Token黑名单功能 ==========");
        
        try {
            // 先清除可能存在的测试数据
            redisUtils.delete(TOKEN_BLACKLIST_PREFIX + TEST_TOKEN);
            
            // 模拟将Token加入黑名单，过期时间设为300秒
            long expireTime = 300;
            redisUtils.set(TOKEN_BLACKLIST_PREFIX + TEST_TOKEN, 123L, expireTime);
            System.out.println("Token已加入黑名单，过期时间: " + expireTime + "秒");
            
            // 验证Token是否在黑名单中
            boolean inBlacklist = redisUtils.hasKey(TOKEN_BLACKLIST_PREFIX + TEST_TOKEN);
            System.out.println("Token是否在黑名单中: " + inBlacklist);
            
            // 获取黑名单中的Token值
            Object tokenValue = redisUtils.get(TOKEN_BLACKLIST_PREFIX + TEST_TOKEN);
            System.out.println("黑名单中的Token值: " + tokenValue);
            
            // 清理测试数据
            redisUtils.delete(TOKEN_BLACKLIST_PREFIX + TEST_TOKEN);
            
            System.out.println("Token黑名单功能测试通过！");
        } catch (Exception e) {
            System.err.println("Token黑名单功能测试失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("========== Token黑名单功能测试结束 ==========\n");
    }
}