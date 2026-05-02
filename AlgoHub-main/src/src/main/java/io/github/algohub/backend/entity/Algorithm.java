package io.github.algohub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "algorithms")
@Data
public class Algorithm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "usage_intro", columnDefinition = "TEXT")
    private String usageIntro;

    @Column(name = "cpp_template", columnDefinition = "TEXT")
    private String cppTemplate;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(length = 20)
    private String difficulty = "medium";

    @Column(length = 255)
    private String tags;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private AlgorithmCategory category;
}
