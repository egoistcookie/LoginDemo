package com.logindemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logindemo.model.Role;
import org.apache.ibatis.annotations.Mapper;

/**
 * 角色Mapper
 */
@Mapper
public interface RoleMapper extends BaseMapper<Role> {
}