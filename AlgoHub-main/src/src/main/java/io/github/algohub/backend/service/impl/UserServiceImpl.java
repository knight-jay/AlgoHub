package io.github.algohub.backend.service.impl;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.dto.LoginDTO;
import io.github.algohub.backend.dto.LoginResponseDTO;
import io.github.algohub.backend.dto.RegisterDTO;
import io.github.algohub.backend.entity.User;
import io.github.algohub.backend.repository.UserRepository;
import io.github.algohub.backend.service.UserService;
import io.github.algohub.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    // 注册逻辑（新增角色处理）
    @Override
    public Result<String> register(RegisterDTO dto) {
        String username = dto.getUsername() == null ? "" : dto.getUsername().trim();
        String password = dto.getPassword() == null ? "" : dto.getPassword().trim();
        String confirmPassword = dto.getConfirmPassword() == null ? "" : dto.getConfirmPassword().trim();
        String phone = dto.getPhone() == null ? "" : dto.getPhone().trim();
        // 获取角色（默认学生）
        String role = dto.getRole() == null ? "STUDENT" : dto.getRole().trim().toUpperCase();

        // 1. 校验用户名
        if (username.length() < 3 || username.length() > 20) {
            return Result.error("用户名长度必须在3-20位之间");
        }
        // 2. 校验密码
        if (password.length() < 6 || password.length() > 20) {
            return Result.error("密码长度必须在6-20位之间");
        }
        // 3. 校验两次密码一致
        if (!password.equals(confirmPassword)) {
            return Result.error("两次输入的密码不一致");
        }
        // 4. 校验手机号（简单正则）
        String phoneRegex = "^1[3-9]\\d{9}$";
        if (!Pattern.matches(phoneRegex, phone)) {
            return Result.error("手机号格式不正确");
        }
        // 5. 校验用户名/手机号是否已存在
        if (userRepo.findByUsername(username) != null) {
            return Result.error("用户名已存在");
        }
        if (userRepo.findByPhone(phone) != null) {
            return Result.error("手机号已被注册");
        }
        // 6. 管理员角色校验（限制：仅手机号以100开头可注册管理员，防止恶意注册）
        if ("ADMIN".equals(role) && !phone.startsWith("100")) {
            return Result.error("无管理员注册权限，请联系系统管理员");
        }
        // 7. 角色合法性校验
        if (!"STUDENT".equals(role) && !"ADMIN".equals(role)) {
            return Result.error("角色只能是学生(STUDENT)或管理员(ADMIN)");
        }

        // 8. 加密密码 + 保存用户
        String encryptedPwd = DigestUtils.md5DigestAsHex(password.getBytes());
        User user = new User();
        user.setUsername(username);
        user.setPassword(encryptedPwd);
        user.setPhone(phone);
        user.setRole(role); // 设置注册角色
        user.setLocked(0); // 未锁定
        user.setCreateTime(LocalDateTime.now());
        userRepo.save(user);

        return Result.success("注册成功");
    }

    // 登录逻辑（新增角色匹配校验）
    @Override
    public Result<LoginResponseDTO> login(LoginDTO dto) {
        String username = dto.getUsername().trim();
        String password = dto.getPassword().trim();
        boolean rememberMe = dto.isRememberMe();
        // 获取登录角色（默认学生）
        String loginRole = dto.getRole() == null ? "STUDENT" : dto.getRole().trim().toUpperCase();

        // 1. 查询用户是否存在
        User user = userRepo.findByUsername(username);
        if (user == null) {
            return Result.error("账号不存在");
        }

        // 2. 校验账号是否被锁定
        if (user.getLocked() == 1) {
            return Result.error("账号已被锁定，请15分钟后再试");
        }

        // 3. 校验密码
        String encryptedPwd = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!encryptedPwd.equals(user.getPassword())) {
            return Result.error("密码错误");
        }

        // 4. 校验角色匹配（登录角色需与用户注册角色一致）
        if (!user.getRole().equals(loginRole)) {
            return Result.error("角色不匹配：当前账号是" + (user.getRole().equals("STUDENT") ? "学生" : "管理员") + "角色，请选择正确角色登录");
        }

        // 5. 根据「记住我」生成不同有效期的Token
        String token;
        if (rememberMe) {
            // 记住我：7天有效期
            token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole(), JwtUtil.REMEMBER_ME_EXPIRATION);
        } else {
            // 不记住我：24小时有效期
            token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        }

        // 6. 封装返回信息
        LoginResponseDTO.UserInfoDTO userInfo = new LoginResponseDTO.UserInfoDTO(
                user.getUsername(),
                user.getRole(),
                user.getAvatar()
        );
        LoginResponseDTO response = new LoginResponseDTO(token, userInfo);

        return Result.success(response);
    }
}