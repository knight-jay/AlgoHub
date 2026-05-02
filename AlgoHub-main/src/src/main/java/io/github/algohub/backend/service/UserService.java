package io.github.algohub.backend.service;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.dto.LoginDTO;
import io.github.algohub.backend.dto.LoginResponseDTO;
import io.github.algohub.backend.dto.RegisterDTO;

public interface UserService {
    Result<String> register(RegisterDTO dto);
    Result<LoginResponseDTO> login(LoginDTO dto);
}