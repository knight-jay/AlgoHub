package io.github.algohub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private UserInfoDTO userInfo;

    @Data
    @AllArgsConstructor
    public static class UserInfoDTO {
        private String username;
        private String role;
    }
}