package backend.controller;

import backend.common.Result;
import backend.dto.LoginDTO;
import backend.dto.LoginResponseDTO;
import backend.dto.RegisterDTO;
import backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // 用户注册接口
    @PostMapping("/register")
    public Result<String> register(@RequestBody RegisterDTO dto) {
        return userService.register(dto);
    }

    // 用户登录接口
    @PostMapping("/login")
    public Result<LoginResponseDTO> login(@RequestBody LoginDTO dto) {
        return userService.login(dto);
    }
}