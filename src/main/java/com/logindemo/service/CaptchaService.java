package com.logindemo.service;

import java.awt.image.BufferedImage;

/**
 * 图形验证码服务接口
 */
public interface CaptchaService {
    
    /**
     * 生成验证码图片
     * @param captchaKey 验证码唯一标识（通常是UUID）
     * @return 验证码图片
     */
    BufferedImage generateCaptchaImage(String captchaKey);
    
    /**
     * 生成验证码文本
     * @param captchaKey 验证码唯一标识
     * @return 验证码文本
     */
    String generateCaptchaText(String captchaKey);
    
    /**
     * 验证验证码
     * @param captchaKey 验证码唯一标识
     * @param captchaCode 用户输入的验证码
     * @return 验证是否通过
     */
    boolean validateCaptcha(String captchaKey, String captchaCode);
    
    /**
     * 删除验证码（验证成功后或过期后调用）
     * @param captchaKey 验证码唯一标识
     */
    void deleteCaptcha(String captchaKey);
    
    /**
     * 检查是否需要验证码（基于登录失败次数）
     * @param username 用户名
     * @return 是否需要验证码
     */
    boolean requiresCaptcha(String username);
}

