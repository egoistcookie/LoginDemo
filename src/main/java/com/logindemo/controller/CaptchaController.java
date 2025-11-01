package com.logindemo.controller;

import com.logindemo.model.dto.ApiResponse;
import com.logindemo.service.CaptchaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 验证码控制器
 */
@RestController
@RequestMapping("/captcha")
@Tag(name = "验证码相关接口")
public class CaptchaController {

    private static final Logger logger = LoggerFactory.getLogger(CaptchaController.class);

    @Autowired
    private CaptchaService captchaService;

    /**
     * 获取图形验证码
     */
    @GetMapping("/image")
    @Operation(summary = "获取图形验证码图片")
    public ApiResponse<Map<String, String>> getCaptchaImage() {
        try {
            // 生成唯一标识
            String captchaKey = UUID.randomUUID().toString();
            
            // 生成验证码图片
            BufferedImage image = captchaService.generateCaptchaImage(captchaKey);
            
            // 将图片转换为Base64
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "png", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            Map<String, String> result = new HashMap<>();
            result.put("captchaKey", captchaKey);
            result.put("image", "data:image/png;base64," + base64Image);
            
            logger.debug("生成验证码图片，captchaKey: {}", captchaKey);
            return ApiResponse.success(result);
        } catch (IOException e) {
            logger.error("生成验证码图片失败", e);
            throw new RuntimeException("生成验证码失败");
        }
    }

    /**
     * 检查是否需要验证码
     */
    @GetMapping("/required")
    @Operation(summary = "检查是否需要验证码")
    public ApiResponse<Boolean> checkCaptchaRequired(@RequestParam(value = "username", required = false) String username) {
        boolean required = false;
        if (username != null && !username.isEmpty()) {
            required = captchaService.requiresCaptcha(username);
        }
        logger.debug("检查是否需要验证码，用户名: {}, 需要: {}", username, required);
        return ApiResponse.success(required);
    }
}

