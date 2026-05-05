package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.entity.User;
import io.github.algohub.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepo;

    /** 角色层级数值：MASTER=3, ADMIN=2, STUDENT=1 */
    private int roleLevel(String role) {
        if ("MASTER".equals(role)) return 3;
        if ("ADMIN".equals(role)) return 2;
        return 1;
    }

    /** 当前用户是否为管理员及以上（ADMIN 或 MASTER） */
    private boolean isAdminOrAbove(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return "ADMIN".equals(role) || "MASTER".equals(role);
    }

    /** 当前用户是否为群主 */
    private boolean isMaster(HttpServletRequest request) {
        return "MASTER".equals(request.getAttribute("role"));
    }

    @GetMapping("/users")
    public Result<?> listUsers(HttpServletRequest request) {
        if (!isAdminOrAbove(request)) {
            return Result.error(403, "无权限，仅管理员及以上可操作");
        }
        List<User> users = userRepo.findAll();
        users.forEach(u -> u.setPassword(null));
        return Result.success(users);
    }

    @PutMapping("/users/{id}/status")
    public Result<String> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body, HttpServletRequest request) {
        if (!isAdminOrAbove(request)) {
            return Result.error(403, "无权限，仅管理员及以上可操作");
        }
        String currentRole = (String) request.getAttribute("role");
        User target = userRepo.findById(id).orElse(null);
        if (target == null) {
            return Result.error("用户不存在");
        }
        // 不可禁用同级或更高级别的用户
        if (roleLevel(target.getRole()) >= roleLevel(currentRole)) {
            return Result.error("无权操作：不可禁用同级或更高级别的用户");
        }
        Integer locked = body.get("locked");
        if (locked == null || (locked != 0 && locked != 1)) {
            return Result.error("参数错误：locked 必须为 0 或 1");
        }
        target.setLocked(locked);
        userRepo.save(target);
        return Result.success(locked == 1 ? "账号已禁用" : "账号已启用");
    }

    @PutMapping("/users/{id}/role")
    public Result<String> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String currentRole = (String) request.getAttribute("role");
        // 只有群主可以修改角色
        if (!isMaster(request)) {
            return Result.error(403, "无权限：仅群主可修改他人角色");
        }
        User target = userRepo.findById(id).orElse(null);
        if (target == null) {
            return Result.error("用户不存在");
        }
        // 不可修改同级或更高级别用户的角色
        if (roleLevel(target.getRole()) >= roleLevel(currentRole)) {
            return Result.error("无权操作：不可修改同级或更高级别用户的角色");
        }
        String newRole = body.get("role");
        if (newRole == null) {
            return Result.error("参数错误：role 不能为空");
        }
        newRole = newRole.toUpperCase();
        // 群主只能将用户在 STUDENT 和 ADMIN 之间切换，不能设置为 MASTER
        if (!"STUDENT".equals(newRole) && !"ADMIN".equals(newRole)) {
            return Result.error("参数错误：role 只能为 STUDENT 或 ADMIN");
        }
        target.setRole(newRole);
        userRepo.save(target);
        return Result.success("角色修改成功");
    }
}
