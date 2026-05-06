package io.github.algohub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_categories")
@Data
public class ResourceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "create_time")
    private LocalDateTime createTime;
}
