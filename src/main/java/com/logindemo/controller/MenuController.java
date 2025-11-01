package com.logindemo.controller;

import com.logindemo.model.Menu;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 菜单控制器
 */
@RestController
@RequestMapping("/menus")
public class MenuController {
    
    @Autowired
    private MenuService menuService;
    
    /**
     * 获取所有菜单
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Menu>>> listAllMenus() {
        List<Menu> menus = menuService.listAllMenus();
        return ResponseEntity.ok(ApiResponse.success(menus));
    }
    
    // '/user-menu-tree'接口已移除，此功能在AuthController中实现
    
    /**
     * 添加新菜单
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Menu>> createMenu(@RequestBody Menu menu) {
        Menu createdMenu = menuService.saveMenu(menu);
        return ResponseEntity.ok(ApiResponse.success(createdMenu));
    }
    
    /**
     * 更新菜单
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Menu>> updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        menu.setId(id);
        Menu updatedMenu = menuService.saveMenu(menu);
        return ResponseEntity.ok(ApiResponse.success(updatedMenu));
    }
    
    /**
     * 删除菜单
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}