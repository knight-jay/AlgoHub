package io.github.algohub.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileDTO {
    private String phone;
    private String nickname;
    private String avatar;
    private String intro;
}
