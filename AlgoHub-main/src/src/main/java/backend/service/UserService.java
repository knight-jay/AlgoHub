package backend.service;

import backend.common.Result;
import backend.dto.LoginDTO;
import backend.dto.LoginResponseDTO;
import backend.dto.RegisterDTO;

public interface UserService {
    Result<String> register(RegisterDTO dto);
    Result<LoginResponseDTO> login(LoginDTO dto);
}