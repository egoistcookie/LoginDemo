package com.logindemo.service.impl;

import com.google.code.kaptcha.impl.DefaultKaptcha;
import com.logindemo.service.CaptchaService;
import com.logindemo.utils.RedisUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;

/**
 * 图形验证码服务实现类
 */
@Service
public class CaptchaServiceImpl implements CaptchaService {

    private static final Logger logger = LoggerFactory.getLogger(CaptchaServiceImpl.class);

    @Autowired
    private DefaultKaptcha defaultKaptcha;

    @Autowired
    private RedisUtils redisUtils;

    /**
     * 验证码Redis Key前缀
     */
    private static final String CAPTCHA_PREFIX = "captcha:";

    /**
     * 登录失败次数Redis Key前缀
     */
    private static final String LOGIN_ATTEMPT_PREFIX = "login:attempt:";

    /**
     * 验证码过期时间（秒），默认5分钟
     */
    @Value("${captcha.expire-time:300}")
    private int captchaExpireTime;

    /**
     * 需要验证码的失败次数阈值，默认3次
     */
    @Value("${captcha.require-threshold:3}")
    private int requireThreshold;

    @Override
    public BufferedImage generateCaptchaImage(String captchaKey) {
        String captchaText = generateCaptchaText(captchaKey);
        BufferedImage image = defaultKaptcha.createImage(captchaText);
        logger.debug("生成验证码图片，captchaKey: {}", captchaKey);
        return image;
    }

    @Override
    public String generateCaptchaText(String captchaKey) {
        String captchaText = defaultKaptcha.createText();
        // 将验证码文本存储到Redis，设置过期时间
        redisUtils.set(CAPTCHA_PREFIX + captchaKey, captchaText.toLowerCase(), captchaExpireTime);
        logger.debug("生成验证码文本，captchaKey: {}, 验证码: {}", captchaKey, captchaText);
        return captchaText;
    }

    @Override
    public boolean validateCaptcha(String captchaKey, String captchaCode) {
        if (captchaKey == null || captchaCode == null) {
            return false;
        }

        Object storedCaptchaObj = redisUtils.get(CAPTCHA_PREFIX + captchaKey);
        if (storedCaptchaObj == null) {
            logger.debug("验证码不存在或已过期，captchaKey: {}", captchaKey);
            return false;
        }

        String storedCaptcha = storedCaptchaObj.toString();

        // 验证码不区分大小写
        boolean isValid = storedCaptcha.equalsIgnoreCase(captchaCode.trim());
        logger.debug("验证码验证结果，captchaKey: {}, 输入: {}, 存储: {}, 结果: {}", 
                    captchaKey, captchaCode, storedCaptcha, isValid);
        
        // 验证成功后删除验证码（无论成功失败，验证一次后都删除，防止重复使用）
        deleteCaptcha(captchaKey);
        
        return isValid;
    }

    @Override
    public void deleteCaptcha(String captchaKey) {
        redisUtils.delete(CAPTCHA_PREFIX + captchaKey);
        logger.debug("删除验证码，captchaKey: {}", captchaKey);
    }

    @Override
    public boolean requiresCaptcha(String username) {
        if (username == null) {
            return false;
        }
        
        // 获取登录失败次数
        String attemptKey = LOGIN_ATTEMPT_PREFIX + username;
        Object attemptsObj = redisUtils.get(attemptKey);
        
        if (attemptsObj == null) {
            return false;
        }
        
        try {
            // 处理不同的类型：可能是Long或String
            long attempts;
            if (attemptsObj instanceof Long) {
                attempts = (Long) attemptsObj;
            } else if (attemptsObj instanceof Number) {
                attempts = ((Number) attemptsObj).longValue();
            } else {
                attempts = Long.parseLong(attemptsObj.toString());
            }
            
            boolean requires = attempts >= requireThreshold;
            logger.debug("检查是否需要验证码，用户名: {}, 失败次数: {}, 阈值: {}, 需要: {}", 
                        username, attempts, requireThreshold, requires);
            return requires;
        } catch (Exception e) {
            logger.warn("解析登录失败次数失败，username: {}, attempts: {}", username, attemptsObj, e);
            return false;
        }
    }
}

