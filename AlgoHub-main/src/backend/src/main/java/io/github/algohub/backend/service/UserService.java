package io.github.algohub.backend.service;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.dto.*;
import io.github.algohub.backend.entity.User;

public interface UserService {
    Result<String> register(RegisterDTO dto);
    Result<LoginResponseDTO> login(LoginDTO dto);
    User getCurrentUser(Long userId);
    Result<String> updateProfile(Long userId, UpdateProfileDTO dto);
    Result<String> changePassword(Long userId, ChangePasswordDTO dto);
    Result<String> resetPasswordByPhone(ForgotPasswordDTO dto);
}
