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

    private boolean isAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return "ADMIN".equals(role);
    }

    @GetMapping("/users")
    public Result<?> listUsers(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        List<User> users = userRepo.findAll();
        users.forEach(u -> u.setPassword(null));
        return Result.success(users);
    }

    @PutMapping("/users/{id}/status")
    public Result<String> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return Result.error("用户不存在");
        }
        Integer locked = body.get("locked");
        if (locked == null || (locked != 0 && locked != 1)) {
            return Result.error("参数错误：locked 必须为 0 或 1");
        }
        user.setLocked(locked);
        userRepo.save(user);
        return Result.success(locked == 1 ? "账号已禁用" : "账号已启用");
    }

    @PutMapping("/users/{id}/role")
    public Result<String> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return Result.error("用户不存在");
        }
        String role = body.get("role");
        if (role == null || (!"STUDENT".equals(role.toUpperCase()) && !"ADMIN".equals(role.toUpperCase()))) {
            return Result.error("参数错误：role 必须为 STUDENT 或 ADMIN");
        }
        user.setRole(role.toUpperCase());
        userRepo.save(user);
        return Result.success("角色修改成功");
    }
}
