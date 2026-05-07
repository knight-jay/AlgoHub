package io.github.algohub.backend.dto;

import lombok.Data;

@Data
public class CreatePostDTO {
    private String title;
    private String content;
}
