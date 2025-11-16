package com.logindemo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logindemo.exception.BusinessException;
import com.logindemo.mapper.NoteMapper;
import com.logindemo.mapper.UserMapper;
import com.logindemo.model.Note;
import com.logindemo.model.User;
import com.logindemo.service.NoteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 笔记服务实现类
 */
@Service
public class NoteServiceImpl extends ServiceImpl<NoteMapper, Note> implements NoteService {

    private static final Logger logger = LoggerFactory.getLogger(NoteServiceImpl.class);

    @Autowired
    private NoteMapper noteMapper;

    @Autowired
    private UserMapper userMapper;

    /**
     * 获取当前登录用户的ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException("未登录或登录已过期");
        }
        String username = authentication.getName();
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user.getId();
    }

    @Override
    public List<Note> getNotesByUserId(Long userId) {
        logger.info("获取用户笔记列表，用户ID: {}", userId);
        Long currentUserId = getCurrentUserId();
        // 只能查询自己的笔记
        if (!userId.equals(currentUserId)) {
            throw new BusinessException("无权访问其他用户的笔记");
        }
        return noteMapper.findByUserId(userId);
    }

    @Override
    public Note getNoteById(Long id) {
        logger.info("获取笔记详情，笔记ID: {}", id);
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new BusinessException("笔记不存在");
        }
        Long currentUserId = getCurrentUserId();
        // 验证所有权
        if (!note.getUserId().equals(currentUserId)) {
            throw new BusinessException("无权访问该笔记");
        }
        return note;
    }

    @Override
    @Transactional
    public Note createNote(Note note) {
        logger.info("创建笔记，标题: {}", note.getTitle());
        Long currentUserId = getCurrentUserId();
        // 自动设置userId为当前用户
        note.setUserId(currentUserId);
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());
        
        // 验证标题不能为空
        if (note.getTitle() == null || note.getTitle().trim().isEmpty()) {
            throw new BusinessException("笔记标题不能为空");
        }
        
        int result = noteMapper.insert(note);
        if (result > 0) {
            logger.info("笔记创建成功，ID: {}", note.getId());
            return note;
        } else {
            throw new BusinessException("创建笔记失败");
        }
    }

    @Override
    @Transactional
    public Note updateNote(Long id, Note note) {
        logger.info("更新笔记，笔记ID: {}", id);
        Long currentUserId = getCurrentUserId();
        
        // 查询原笔记
        Note existingNote = noteMapper.selectById(id);
        if (existingNote == null) {
            throw new BusinessException("笔记不存在");
        }
        
        // 验证所有权
        if (!existingNote.getUserId().equals(currentUserId)) {
            throw new BusinessException("无权修改该笔记");
        }
        
        // 更新字段
        existingNote.setTitle(note.getTitle());
        existingNote.setContent(note.getContent());
        existingNote.setUpdatedAt(LocalDateTime.now());
        
        // 验证标题不能为空
        if (existingNote.getTitle() == null || existingNote.getTitle().trim().isEmpty()) {
            throw new BusinessException("笔记标题不能为空");
        }
        
        int result = noteMapper.updateById(existingNote);
        if (result > 0) {
            logger.info("笔记更新成功，ID: {}", id);
            return existingNote;
        } else {
            throw new BusinessException("更新笔记失败");
        }
    }

    @Override
    @Transactional
    public void deleteNote(Long id) {
        logger.info("删除笔记，笔记ID: {}", id);
        Long currentUserId = getCurrentUserId();
        
        // 查询笔记
        Note note = noteMapper.selectById(id);
        if (note == null) {
            throw new BusinessException("笔记不存在");
        }
        
        // 验证所有权
        if (!note.getUserId().equals(currentUserId)) {
            throw new BusinessException("无权删除该笔记");
        }
        
        int result = noteMapper.deleteById(id);
        if (result > 0) {
            logger.info("笔记删除成功，ID: {}", id);
        } else {
            throw new BusinessException("删除笔记失败");
        }
    }
}

