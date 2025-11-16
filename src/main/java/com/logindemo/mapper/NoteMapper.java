package com.logindemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logindemo.model.Note;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 笔记Mapper接口
 */
@Mapper
public interface NoteMapper extends BaseMapper<Note> {
    
    /**
     * 根据用户ID查询所有笔记
     */
    List<Note> findByUserId(@Param("userId") Long userId);
}

