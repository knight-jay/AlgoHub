package io.github.algohub.backend.service.impl;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.dto.*;
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

    @Override
    public Result<String> register(RegisterDTO dto) {
        String username = dto.getUsername() == null ? "" : dto.getUsername().trim();
        String password = dto.getPassword() == null ? "" : dto.getPassword().trim();
        String confirmPassword = dto.getConfirmPassword() == null ? "" : dto.getConfirmPassword().trim();
        String phone = dto.getPhone() == null ? "" : dto.getPhone().trim();
        String role = dto.getRole() == null ? "STUDENT" : dto.getRole().trim().toUpperCase();
        String nickname = dto.getNickname() == null ? "" : dto.getNickname().trim();

        if (username.length() < 3 || username.length() > 20) {
            return Result.error("用户名长度必须在3-20位之间");
        }
        if (username.contains(" ")) {
            return Result.error("用户名不能包含空格");
        }
        if (nickname.isEmpty()) {
            return Result.error("昵称不能为空");
        }
        if (password.length() < 6 || password.length() > 20) {
            return Result.error("密码长度必须在6-20位之间");
        }
        if (!password.equals(confirmPassword)) {
            return Result.error("两次输入的密码不一致");
        }
        String phoneRegex = "^\\d{11}$";
        if (!Pattern.matches(phoneRegex, phone)) {
            return Result.error("手机号格式不正确");
        }
        if (userRepo.findByUsername(username) != null) {
            return Result.error("用户名已存在");
        }
        if (userRepo.findByPhone(phone) != null) {
            return Result.error("手机号已被注册");
        }
        if (!"STUDENT".equals(role) && !"ADMIN".equals(role)) {
            return Result.error("角色只能是学生(STUDENT)或管理员(ADMIN)");
        }

        String encryptedPwd = DigestUtils.md5DigestAsHex(password.getBytes());
        User user = new User();
        user.setUsername(username);
        user.setPassword(encryptedPwd);
        user.setPhone(phone);
        user.setNickname(nickname);
        user.setRole(role);
        user.setLocked(0);
        user.setCreateTime(LocalDateTime.now());
        userRepo.save(user);

        return Result.success("注册成功");
    }

    @Override
    public Result<LoginResponseDTO> login(LoginDTO dto) {
        String username = dto.getUsername().trim();
        String password = dto.getPassword().trim();
        boolean rememberMe = dto.isRememberMe();
        String loginRole = dto.getRole() == null ? "STUDENT" : dto.getRole().trim().toUpperCase();

        User user = userRepo.findByUsername(username);
        if (user == null) {
            return Result.error("账号不存在");
        }
        if (user.getLocked() == 1) {
            return Result.error("账号已被锁定，请联系管理员");
        }
        String encryptedPwd = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!encryptedPwd.equals(user.getPassword())) {
            return Result.error("密码错误");
        }
        if (!user.getRole().equals(loginRole)) {
            return Result.error("角色不匹配：当前账号是" + (user.getRole().equals("STUDENT") ? "学生" : "管理员") + "角色，请选择正确角色登录");
        }

        String token;
        if (rememberMe) {
            token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole(), JwtUtil.REMEMBER_ME_EXPIRATION);
        } else {
            token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        }

        LoginResponseDTO.UserInfoDTO userInfo = new LoginResponseDTO.UserInfoDTO(
                user.getUsername(),
                user.getRole()
        );
        LoginResponseDTO response = new LoginResponseDTO(token, userInfo);
        return Result.success(response);
    }

    @Override
    public User getCurrentUser(Long userId) {
        return userRepo.findById(userId).orElse(null);
    }

    @Override
    public Result<String> updateProfile(Long userId, UpdateProfileDTO dto) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return Result.error("用户不存在");
        }
        boolean changed = false;
        if (dto.getPhone() != null) {
            String phone = dto.getPhone().trim();
            if (!Pattern.matches("^\\d{11}$", phone)) {
                return Result.error("请输入有效的手机号");
            }
            if (!phone.equals(user.getPhone())) {
                User existPhone = userRepo.findByPhone(phone);
                if (existPhone != null && !existPhone.getId().equals(userId)) {
                    return Result.error("该手机号已被其他用户使用");
                }
                user.setPhone(phone);
                changed = true;
            }
        }
        if (dto.getNickname() != null) {
            String nickname = dto.getNickname().trim();
            if (!nickname.equals(user.getNickname())) {
                user.setNickname(nickname);
                changed = true;
            }
        }
        if (dto.getIntro() != null) {
            String intro = dto.getIntro().trim();
            if (!intro.equals(user.getIntro())) {
                user.setIntro(intro);
                changed = true;
            }
        }
        if (!changed) {
            return Result.error("信息未发生修改");
        }
        user.setUpdateTime(LocalDateTime.now());
        userRepo.save(user);
        return Result.success("个人信息更新成功");
    }

    @Override
    public Result<String> changePassword(Long userId, ChangePasswordDTO dto) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return Result.error("用户不存在");
        }
        String oldPwd = DigestUtils.md5DigestAsHex(dto.getOldPassword().getBytes());
        if (!oldPwd.equals(user.getPassword())) {
            return Result.error("原密码错误");
        }
        String newPwd = dto.getNewPassword();
        if (oldPwd.equals(DigestUtils.md5DigestAsHex(newPwd.getBytes()))) {
            return Result.error("新密码不能与旧密码相同");
        }
        if (newPwd == null || newPwd.length() < 6 || newPwd.length() > 20) {
            return Result.error("新密码长度必须在6-20位之间");
        }
        if (!newPwd.equals(dto.getConfirmPassword())) {
            return Result.error("两次输入的新密码不一致");
        }
        user.setPassword(DigestUtils.md5DigestAsHex(newPwd.getBytes()));
        user.setUpdateTime(LocalDateTime.now());
        userRepo.save(user);
        return Result.success("密码修改成功");
    }
}
