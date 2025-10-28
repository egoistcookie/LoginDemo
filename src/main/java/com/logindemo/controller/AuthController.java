package com.logindemo.controller;

import com.logindemo.model.dto.ApiResponse;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.RegisterRequest;
import com.logindemo.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "认证相关接口")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("收到注册请求，用户名: {}, 邮箱: {}", request.getUsername(), request.getEmail());
        try {
            AuthResponse response = userService.register(request);
            logger.info("注册成功，用户名: {}", request.getUsername());
            return ApiResponse.success(response);
        } catch (Exception e) {
            logger.error("注册失败，用户名: {}, 错误信息: {}", request.getUsername(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ApiResponse.success(response);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出")
    public ApiResponse<?> logout(@RequestHeader("Authorization") String authorization) {
        // 从Authorization头中提取Token
        String token = authorization.substring("Bearer ".length());
        userService.logout(token);
        return ApiResponse.success();
    }

    /**
     * 刷新Token
     */
    @PostMapping("/refresh")
    @Operation(summary = "刷新Token")
    public ApiResponse<AuthResponse> refreshToken(@RequestParam("refreshToken") String refreshToken) {
        AuthResponse response = userService.refreshToken(refreshToken);
        return ApiResponse.success(response);
    }

    /**
     * 验证Token有效性
     */
    @GetMapping("/validate")
    @Operation(summary = "验证Token有效性")
    public ApiResponse<Boolean> validateToken(@RequestParam("token") String token) {
        boolean isValid = userService.validateToken(token);
        return ApiResponse.success(isValid);
    }
}