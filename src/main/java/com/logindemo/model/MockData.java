package com.logindemo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Mock挡板数据实体类
 */
@Data
@TableName("mock_data")
public class MockData implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 数据类型：sms_code-短信验证码, wechat_qrcode-微信二维码
     */
    private String dataType;
    
    /**
     * 数据键：手机号或ticket
     */
    private String dataKey;
    
    /**
     * 数据值：验证码或二维码URL
     */
    private String dataValue;
    
    /**
     * 额外数据：JSON格式
     */
    private String extraData;
    
    /**
     * 状态：active-有效, expired-过期, used-已使用
     */
    private String status;
    
    /**
     * 过期时间
     */
    private LocalDateTime expireTime;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}

