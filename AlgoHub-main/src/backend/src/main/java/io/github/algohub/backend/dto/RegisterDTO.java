package io.github.algohub.backend.dto;

import lombok.Data;

@Data
public class RegisterDTO {
    // 用户名
    private String username;
    // 密码
    private String password;
    // 确认密码
    private String confirmPassword;
    // 手机号
    private String phone;
    // 新增角色字段
    private String role;
    // 昵称
    private String nickname;
}