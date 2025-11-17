package com.logindemo.utils;

import org.springframework.stereotype.Component;

/**
 * 操作类型推断工具类
 * 根据请求路径和HTTP方法自动推断操作类型
 */
@Component
public class OperationTypeUtils {
    
    /**
     * 根据请求路径和HTTP方法推断操作类型
     * 
     * @param requestPath 请求路径，如 /api/auth/login
     * @param method HTTP方法，如 GET, POST, PUT, DELETE
     * @return 操作类型
     */
    public String inferOperationType(String requestPath, String method) {
        if (requestPath == null || method == null) {
            return "API_CALL";
        }
        
        // 移除/api前缀（如果存在）
        String path = requestPath.startsWith("/api") ? requestPath.substring(4) : requestPath;
        
        // 认证相关操作
        if (path.startsWith("/auth")) {
            if (path.equals("/auth/login") && "POST".equals(method)) {
                return "LOGIN";
            }
            if (path.equals("/auth/logout") && "POST".equals(method)) {
                return "LOGOUT";
            }
            if (path.equals("/auth/register") && "POST".equals(method)) {
                return "REGISTER";
            }
            if (path.equals("/auth/reset-password") && "POST".equals(method)) {
                return "PASSWORD_RESET";
            }
            if (path.startsWith("/auth/send-email-code") && "POST".equals(method)) {
                return "PASSWORD_RESET";
            }
            if (path.startsWith("/auth/send-sms-code") && "POST".equals(method)) {
                return "SMS_CODE_SEND";
            }
            if (path.startsWith("/auth/login-by-phone") && "POST".equals(method)) {
                return "LOGIN";
            }
        }
        
        // 用户相关操作
        if (path.startsWith("/users")) {
            if (path.equals("/users") && "POST".equals(method)) {
                return "USER_ADD";
            }
            if (path.matches("/users/\\d+") && "PUT".equals(method)) {
                return "USER_UPDATE";
            }
            if (path.matches("/users/\\d+") && "DELETE".equals(method)) {
                return "USER_DELETE";
            }
            if (path.matches("/users/\\d+/password") && "PUT".equals(method)) {
                return "PASSWORD_CHANGE";
            }
            if (path.matches("/users/\\d+/roles") && "POST".equals(method)) {
                return "ROLE_ASSIGN";
            }
            if (path.matches("/users/\\d+/roles") && "PUT".equals(method)) {
                return "ROLE_ASSIGN";
            }
        }
        
        // 角色相关操作
        if (path.startsWith("/roles")) {
            if (path.equals("/roles") && "POST".equals(method)) {
                return "ROLE_ADD";
            }
            if (path.matches("/roles/\\d+") && "PUT".equals(method)) {
                return "ROLE_UPDATE";
            }
            if (path.matches("/roles/\\d+") && "DELETE".equals(method)) {
                return "ROLE_DELETE";
            }
            if (path.matches("/roles/\\d+/menus") && "PUT".equals(method)) {
                return "ROLE_MENU_ASSIGN";
            }
        }
        
        // 菜单相关操作
        if (path.startsWith("/menus")) {
            if (path.equals("/menus") && "POST".equals(method)) {
                return "MENU_ADD";
            }
            if (path.matches("/menus/\\d+") && "PUT".equals(method)) {
                return "MENU_UPDATE";
            }
            if (path.matches("/menus/\\d+") && "DELETE".equals(method)) {
                return "MENU_DELETE";
            }
        }
        
        // 笔记相关操作
        if (path.startsWith("/notes")) {
            if (path.equals("/notes") && "POST".equals(method)) {
                return "NOTE_ADD";
            }
            if (path.matches("/notes/\\d+") && "PUT".equals(method)) {
                return "NOTE_UPDATE";
            }
            if (path.matches("/notes/\\d+") && "DELETE".equals(method)) {
                return "NOTE_DELETE";
            }
        }
        
        // 默认返回通用API调用类型
        return "API_CALL";
    }
    
    /**
     * 根据操作类型生成操作描述
     * 
     * @param operationType 操作类型
     * @param requestPath 请求路径
     * @param method HTTP方法
     * @return 操作描述
     */
    public String generateOperationDesc(String operationType, String requestPath, String method) {
        if (operationType == null) {
            return method + " " + requestPath;
        }
        
        // 根据操作类型返回中文描述
        switch (operationType) {
            case "LOGIN":
                return "用户登录";
            case "LOGOUT":
                return "用户登出";
            case "REGISTER":
                return "用户注册";
            case "PASSWORD_RESET":
                return "重置密码";
            case "PASSWORD_CHANGE":
                return "修改密码";
            case "USER_ADD":
                return "添加用户";
            case "USER_UPDATE":
                return "更新用户信息";
            case "USER_DELETE":
                return "删除用户";
            case "ROLE_ASSIGN":
                return "分配角色";
            case "ROLE_ADD":
                return "添加角色";
            case "ROLE_UPDATE":
                return "更新角色";
            case "ROLE_DELETE":
                return "删除角色";
            case "ROLE_MENU_ASSIGN":
                return "分配角色菜单权限";
            case "MENU_ADD":
                return "添加菜单";
            case "MENU_UPDATE":
                return "更新菜单";
            case "MENU_DELETE":
                return "删除菜单";
            case "NOTE_ADD":
                return "创建笔记";
            case "NOTE_UPDATE":
                return "更新笔记";
            case "NOTE_DELETE":
                return "删除笔记";
            case "SMS_CODE_SEND":
                return "发送短信验证码";
            default:
                return method + " " + requestPath;
        }
    }
}

