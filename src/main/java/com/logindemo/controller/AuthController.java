package com.logindemo.controller;

import com.logindemo.model.dto.ApiResponse;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.RegisterRequest;
import com.logindemo.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/auth")
@Api(tags = "认证相关接口")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @ApiOperation("用户注册")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ApiResponse.success(response);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @ApiOperation("用户登录")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ApiResponse.success(response);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @ApiOperation("用户登出")
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
    @ApiOperation("刷新Token")
    public ApiResponse<AuthResponse> refreshToken(@RequestParam("refreshToken") String refreshToken) {
        AuthResponse response = userService.refreshToken(refreshToken);
        return ApiResponse.success(response);
    }

    /**
     * 验证Token有效性
     */
    @GetMapping("/validate")
    @ApiOperation("验证Token有效性")
    public ApiResponse<Boolean> validateToken(@RequestParam("token") String token) {
        boolean isValid = userService.validateToken(token);
        return ApiResponse.success(isValid);
    }
}