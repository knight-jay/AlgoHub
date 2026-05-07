package io.github.algohub.backend.dto;

import lombok.Data;

@Data
public class CreateCommentDTO {
    private Long postId;
    private Long parentId;
    private String content;
}
