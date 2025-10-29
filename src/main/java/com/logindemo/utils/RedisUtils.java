package com.logindemo.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import java.util.concurrent.TimeUnit;

/**
 * Redis工具类
 */
@Component
public class RedisUtils {

    private static final Logger logger = LoggerFactory.getLogger(RedisUtils.class);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 设置键值对
     */
    public void set(String key, Object value, long expire) {
        try {
            redisTemplate.opsForValue().set(key, value, expire, TimeUnit.SECONDS);
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis设置键值对失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，忽略操作继续执行
        }
    }

    /**
     * 获取值
     */
    public Object get(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis获取值失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，返回null
            return null;
        }
    }

    /**
     * 删除键
     */
    public boolean delete(String key) {
        try {
            return redisTemplate.delete(key);
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis删除键失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，返回false
            return false;
        }
    }

    /**
     * 判断键是否存在
     */
    public boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis判断键是否存在失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，默认返回false（假设键不存在）
            return false;
        }
    }

    /**
     * 递增
     */
    public Long increment(String key, long expire) {
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count == 1) {
                try {
                    redisTemplate.expire(key, expire, TimeUnit.SECONDS);
                } catch (RedisConnectionFailureException e) {
                    logger.error("Redis设置过期时间失败，key: {}, error: {}", key, e.getMessage(), e);
                }
            }
            return count;
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis递增操作失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，返回1（假设是第一次尝试）
            return 1L;
        }
    }

    /**
     * 递减
     */
    public Long decrement(String key) {
        try {
            return redisTemplate.opsForValue().decrement(key);
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis递减操作失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，返回0
            return 0L;
        }
    }

    /**
     * 设置过期时间
     */
    public boolean expire(String key, long expire) {
        try {
            return redisTemplate.expire(key, expire, TimeUnit.SECONDS);
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis设置过期时间失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，返回false
            return false;
        }
    }

    /**
     * 获取剩余过期时间
     */
    public Long getExpire(String key) {
        try {
            return redisTemplate.getExpire(key, TimeUnit.SECONDS);
        } catch (RedisConnectionFailureException e) {
            logger.error("Redis获取剩余过期时间失败，key: {}, error: {}", key, e.getMessage(), e);
            // Redis不可用时，返回-1（表示没有设置过期时间）
            return -1L;
        }
    }
}