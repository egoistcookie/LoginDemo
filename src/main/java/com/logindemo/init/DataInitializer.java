package com.logindemo.init;

import com.logindemo.model.Menu;
import com.logindemo.model.RoleMenu;
import com.logindemo.service.MenuService;
import com.logindemo.service.RoleMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

/**
 * 数据初始化器
 */
@Component
public class DataInitializer implements ApplicationRunner {
    
    @Autowired
    private MenuService menuService;
    
    @Autowired
    private RoleMenuService roleMenuService;
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            // 初始化菜单数据
            initMenus();
            
            // 初始化角色菜单权限
            initRoleMenus();
        } catch (Exception e) {
            System.err.println("数据初始化过程中出现错误：");
            e.printStackTrace();
            System.out.println("系统将继续启动，但数据初始化可能不完整");
        }
    }
    
    /**
     * 初始化菜单数据
     */
    private void initMenus() {
        try {
            System.out.println("开始初始化菜单数据...");
            // 逐个保存菜单，而不是批量保存，这样可以更好地处理异常
            saveMenuIfNotExists(createHomeMenu());
            saveMenuIfNotExists(createDashboardMenu());
            saveMenuIfNotExists(createStatsMenu());
            saveMenuIfNotExists(createOverviewMenu());
            saveMenuIfNotExists(createUsersMenu());
            saveMenuIfNotExists(createUsersListMenu());
            saveMenuIfNotExists(createUsersAddMenu());
            saveMenuIfNotExists(createUsersImportMenu());
            saveMenuIfNotExists(createRolesMenu());
            saveMenuIfNotExists(createRolesListMenu());
            saveMenuIfNotExists(createRolesAddMenu());
            saveMenuIfNotExists(createRolesPermissionsMenu());
            System.out.println("菜单数据初始化完成");
        } catch (Exception e) {
            System.err.println("菜单数据初始化失败：");
            e.printStackTrace();
        }
    }
    
    /**
     * 保存菜单（如果不存在）
     */
    private void saveMenuIfNotExists(Menu menu) {
        try {
            // 检查菜单是否已存在
            Menu existing = menuService.getById(menu.getId());
            if (existing == null) {
                menuService.save(menu);
                System.out.println("保存菜单: " + menu.getName());
            } else {
                System.out.println("菜单已存在: " + menu.getName());
            }
        } catch (Exception e) {
            System.err.println("保存菜单失败: " + menu.getName());
            // 继续尝试其他菜单，不中断整个初始化过程
        }
    }
    
    // 创建各个菜单的方法，避免在初始化方法中直接硬编码大量菜单创建
    private Menu createHomeMenu() {
        Menu menu = new Menu();
        menu.setId(1L);
        menu.setParentId(0L);
        menu.setName("首页");
        menu.setKey("home");
        menu.setSortOrder(1);
        menu.setPath("/home");
        menu.setComponent("Home");
        menu.setIcon("HomeOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createDashboardMenu() {
        Menu menu = new Menu();
        menu.setId(2L);
        menu.setParentId(1L);
        menu.setName("数据看板");
        menu.setKey("dashboard");
        menu.setSortOrder(1);
        menu.setPath("/home/dashboard");
        menu.setComponent("Dashboard");
        menu.setIcon("BarChartOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createStatsMenu() {
        Menu menu = new Menu();
        menu.setId(3L);
        menu.setParentId(1L);
        menu.setName("统计报表");
        menu.setKey("stats");
        menu.setSortOrder(2);
        menu.setPath("/home/stats");
        menu.setComponent("Stats");
        menu.setIcon("FileTextOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createOverviewMenu() {
        Menu menu = new Menu();
        menu.setId(4L);
        menu.setParentId(1L);
        menu.setName("概览信息");
        menu.setKey("overview");
        menu.setSortOrder(3);
        menu.setPath("/home/overview");
        menu.setComponent("Overview");
        menu.setIcon("DatabaseOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createUsersMenu() {
        Menu menu = new Menu();
        menu.setId(5L);
        menu.setParentId(0L);
        menu.setName("人员管理");
        menu.setKey("users");
        menu.setSortOrder(2);
        menu.setPath("/users");
        menu.setComponent("Users");
        menu.setIcon("UserAddOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createUsersListMenu() {
        Menu menu = new Menu();
        menu.setId(6L);
        menu.setParentId(5L);
        menu.setName("用户列表");
        menu.setKey("users-list");
        menu.setSortOrder(1);
        menu.setPath("/users/list");
        menu.setComponent("UsersList");
        menu.setIcon("UserOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createUsersAddMenu() {
        Menu menu = new Menu();
        menu.setId(7L);
        menu.setParentId(5L);
        menu.setName("添加用户");
        menu.setKey("users-add");
        menu.setSortOrder(2);
        menu.setPath("/users/add");
        menu.setComponent("UsersAdd");
        menu.setIcon("FileAddOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createUsersImportMenu() {
        Menu menu = new Menu();
        menu.setId(8L);
        menu.setParentId(5L);
        menu.setName("导入用户");
        menu.setKey("users-import");
        menu.setSortOrder(3);
        menu.setPath("/users/import");
        menu.setComponent("UsersImport");
        menu.setIcon("DownloadOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createRolesMenu() {
        Menu menu = new Menu();
        menu.setId(9L);
        menu.setParentId(0L);
        menu.setName("角色管理");
        menu.setKey("roles");
        menu.setSortOrder(3);
        menu.setPath("/roles");
        menu.setComponent("Roles");
        menu.setIcon("UserOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createRolesListMenu() {
        Menu menu = new Menu();
        menu.setId(10L);
        menu.setParentId(9L);
        menu.setName("角色列表");
        menu.setKey("roles-list");
        menu.setSortOrder(1);
        menu.setPath("/roles/list");
        menu.setComponent("RolesList");
        menu.setIcon("UserOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createRolesAddMenu() {
        Menu menu = new Menu();
        menu.setId(11L);
        menu.setParentId(9L);
        menu.setName("创建角色");
        menu.setKey("roles-add");
        menu.setSortOrder(2);
        menu.setPath("/roles/add");
        menu.setComponent("RolesAdd");
        menu.setIcon("FileAddOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    private Menu createRolesPermissionsMenu() {
        Menu menu = new Menu();
        menu.setId(12L);
        menu.setParentId(9L);
        menu.setName("权限配置");
        menu.setKey("roles-permissions");
        menu.setSortOrder(3);
        menu.setPath("/roles/permissions");
        menu.setComponent("RolesPermissions");
        menu.setIcon("UnorderedListOutlined");
        menu.setVisible(true);
        return menu;
    }
    
    /**
     * 初始化角色菜单权限
     */
    private void initRoleMenus() {
        try {
            System.out.println("开始初始化角色菜单权限...");
            
            // 检查是否已有角色菜单权限数据
            boolean hasData = false;
            try {
                List<RoleMenu> existingRoleMenus = roleMenuService.list();
                hasData = existingRoleMenus != null && existingRoleMenus.size() > 0;
            } catch (Exception e) {
                System.out.println("无法检查角色菜单数据，继续初始化...");
            }
            
            if (!hasData) {
                // SYSTEM角色（ID为1）拥有全部菜单权限
                List<Long> allMenuIds = new ArrayList<>();
                for (long i = 1; i <= 12; i++) {
                    allMenuIds.add(i);
                }
                try {
                    roleMenuService.assignMenusToRole(1L, allMenuIds);
                    System.out.println("已为SYSTEM角色分配全部菜单权限");
                } catch (Exception e) {
                    System.err.println("为SYSTEM角色分配权限失败");
                }
                
                // USER角色（ID为2）只拥有用户列表菜单权限
                List<Long> userMenuIds = new ArrayList<>();
                userMenuIds.add(6L); // 用户列表菜单ID
                try {
                    roleMenuService.assignMenusToRole(2L, userMenuIds);
                    System.out.println("已为USER角色分配用户列表菜单权限");
                } catch (Exception e) {
                    System.err.println("为USER角色分配权限失败");
                }
            }
            
            System.out.println("角色菜单权限初始化完成");
        } catch (Exception e) {
            System.err.println("角色菜单权限初始化过程中出现错误：");
            e.printStackTrace();
        }
    }
}