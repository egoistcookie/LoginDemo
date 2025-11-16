package com.logindemo.controller;

import com.logindemo.model.Note;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.service.NoteService;
import com.logindemo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

/**
 * 笔记控制器
 */
@RestController
@RequestMapping("/notes")
@Tag(name = "笔记相关接口")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private UserService userService;

    /**
     * 获取当前用户的所有笔记
     */
    @GetMapping
    @Operation(summary = "获取当前用户的所有笔记")
    public ApiResponse<List<Note>> getCurrentUserNotes() {
        // 从安全上下文中获取当前认证用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // 获取用户ID
        com.logindemo.model.User user = userService.getUserByUsername(username);
        Long userId = user.getId();
        
        List<Note> notes = noteService.getNotesByUserId(userId);
        return ApiResponse.success(notes);
    }

    /**
     * 获取指定笔记详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取指定笔记详情")
    public ApiResponse<Note> getNoteById(@PathVariable Long id) {
        Note note = noteService.getNoteById(id);
        return ApiResponse.success(note);
    }

    /**
     * 创建新笔记
     */
    @PostMapping
    @Operation(summary = "创建新笔记")
    public ApiResponse<Note> createNote(@Valid @RequestBody Note note) {
        Note createdNote = noteService.createNote(note);
        return ApiResponse.success(createdNote);
    }

    /**
     * 更新笔记
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新笔记")
    public ApiResponse<Note> updateNote(@PathVariable Long id, @Valid @RequestBody Note note) {
        Note updatedNote = noteService.updateNote(id, note);
        return ApiResponse.success(updatedNote);
    }

    /**
     * 删除笔记
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除笔记")
    public ApiResponse<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ApiResponse.success();
    }
}

