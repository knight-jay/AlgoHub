package backend.dto;

import lombok.Data;

@Data
public class LoginDTO {
    private String username;
    private String password;
    private boolean rememberMe = false;
    private String role;
}