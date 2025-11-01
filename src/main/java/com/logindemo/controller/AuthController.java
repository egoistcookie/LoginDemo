package com.logindemo.controller;

import com.logindemo.model.Menu;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.PhoneLoginRequest;
import com.logindemo.model.dto.RegisterRequest;
import com.logindemo.model.dto.SmsCodeRequest;
import com.logindemo.model.dto.WechatQrcodeResponse;
import com.logindemo.model.dto.WechatStatusResponse;
import com.logindemo.service.MenuService;
import com.logindemo.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

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
    
    @Autowired
    private MenuService menuService;

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
     * 获取当前登录用户的菜单
     */
    @GetMapping("/user-menu")
    @Operation(summary = "获取当前用户的菜单")
    public ApiResponse<List<Menu>> getUserMenu() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            List<Menu> menus = userService.getUserMenus(username);
            return ApiResponse.success(menus);
        }
        return ApiResponse.success(null);
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

    /**
     * 发送短信验证码
     */
    @PostMapping("/send-sms-code")
    @Operation(summary = "发送短信验证码")
    public ApiResponse<?> sendSmsCode(@Valid @RequestBody SmsCodeRequest request) {
        logger.info("收到发送短信验证码请求，手机号: {}", request.getPhone());
        try {
            userService.sendSmsCode(request.getPhone());
            logger.info("短信验证码发送成功，手机号: {}", request.getPhone());
            return ApiResponse.success();
        } catch (Exception e) {
            logger.error("发送短信验证码失败，手机号: {}, 错误信息: {}", 
                    request.getPhone(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 手机验证码登录
     */
    @PostMapping("/login-by-phone")
    @Operation(summary = "手机验证码登录")
    public ApiResponse<AuthResponse> loginByPhone(@Valid @RequestBody PhoneLoginRequest request) {
        logger.info("收到手机验证码登录请求，手机号: {}", request.getPhone());
        try {
            AuthResponse response = userService.loginByPhone(request.getPhone(), request.getCode());
            logger.info("手机验证码登录成功，手机号: {}", request.getPhone());
            return ApiResponse.success(response);
        } catch (Exception e) {
            logger.error("手机验证码登录失败，手机号: {}, 错误信息: {}", 
                    request.getPhone(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 获取微信登录二维码
     */
    @GetMapping("/wechat/qrcode")
    @Operation(summary = "获取微信登录二维码")
    public ApiResponse<WechatQrcodeResponse> getWechatQrcode() {
        logger.info("收到获取微信登录二维码请求");
        try {
            WechatQrcodeResponse response = userService.getWechatQrcode();
            logger.info("微信登录二维码获取成功，ticket: {}", response.getTicket());
            return ApiResponse.success(response);
        } catch (Exception e) {
            logger.error("获取微信登录二维码失败，错误信息: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 查询微信扫码状态
     */
    @GetMapping("/wechat/status")
    @Operation(summary = "查询微信扫码状态")
    public ApiResponse<WechatStatusResponse> getWechatStatus(@RequestParam("ticket") String ticket) {
        logger.debug("收到查询微信扫码状态请求，ticket: {}", ticket);
        try {
            WechatStatusResponse response = userService.getWechatStatus(ticket);
            return ApiResponse.success(response);
        } catch (Exception e) {
            logger.error("查询微信扫码状态失败，ticket: {}, 错误信息: {}", 
                    ticket, e.getMessage(), e);
            throw e;
        }
    }
}