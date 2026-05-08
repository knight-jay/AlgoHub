package io.github.algohub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "post_reports")
@Data
public class PostReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id")
    private Long postId;

    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", insertable = false, updatable = false)
    private User reporter;

    @Column(length = 200)
    private String reason;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "handler_id")
    private Long handlerId;

    @Column(name = "handle_note", length = 200)
    private String handleNote;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "handle_time")
    private LocalDateTime handleTime;
}
