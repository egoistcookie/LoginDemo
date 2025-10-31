package com.logindemo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.FieldFill;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 菜单实体类
 */
@Data
@TableName("menus")
public class Menu implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long parentId; // 父菜单ID，0表示顶级菜单
    
    private String name; // 菜单名称
    
    @TableField(value = "`key`")
    private String key;
    
    private String path;
    
    private String component;
    
    private String icon; // 菜单图标
    
    private boolean visible; // 是否可见
    
    private Integer sortOrder; // 排序序号
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    // 非数据库字段，用于前端展示子菜单
    @TableField(exist = false)
    private List<Menu> children;
}