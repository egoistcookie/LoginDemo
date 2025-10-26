package com.logindemo.exception;

/**
 * 业务异常基类
 */
public class BusinessException extends RuntimeException {
    
    private int code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }
    
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    
    public int getCode() {
        return code;
    }
}

/**
 * 用户不存在异常
 */
class UserNotFoundException extends BusinessException {
    public UserNotFoundException() {
        super(404, "用户不存在");
    }
}

/**
 * 密码错误异常
 */
class PasswordErrorException extends BusinessException {
    public PasswordErrorException() {
        super(401, "密码错误");
    }
}

/**
 * 用户被锁定异常
 */
class UserLockedException extends BusinessException {
    public UserLockedException(String message) {
        super(403, message);
    }
}

/**
 * 用户已存在异常
 */
class UserExistException extends BusinessException {
    public UserExistException(String message) {
        super(409, message);
    }
}