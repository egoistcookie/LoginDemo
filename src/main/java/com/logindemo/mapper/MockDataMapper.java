package com.logindemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logindemo.model.MockData;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Mock数据Mapper接口
 */
@Mapper
public interface MockDataMapper extends BaseMapper<MockData> {
    
    /**
     * 根据类型和键查询数据
     */
    MockData findByTypeAndKey(@Param("dataType") String dataType, @Param("dataKey") String dataKey);
    
    /**
     * 删除过期的数据
     */
    int deleteExpiredData(@Param("expireTime") LocalDateTime expireTime);
    
    /**
     * 更新状态
     */
    int updateStatus(@Param("id") Long id, @Param("status") String status);
    
    /**
     * 根据类型和状态查询数据列表
     */
    List<MockData> findByTypeAndStatus(@Param("dataType") String dataType, @Param("status") String status);
}

