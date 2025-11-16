package com.logindemo.service;

import com.logindemo.model.Note;
import java.util.List;

/**
 * 笔记服务接口
 */
public interface NoteService {
    
    /**
     * 获取当前用户的所有笔记
     */
    List<Note> getNotesByUserId(Long userId);
    
    /**
     * 根据ID获取笔记（需验证所有权）
     */
    Note getNoteById(Long id);
    
    /**
     * 创建笔记（自动设置userId为当前用户）
     */
    Note createNote(Note note);
    
    /**
     * 更新笔记（验证所有权）
     */
    Note updateNote(Long id, Note note);
    
    /**
     * 删除笔记（验证所有权）
     */
    void deleteNote(Long id);
}

