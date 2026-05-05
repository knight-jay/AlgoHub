package io.github.algohub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 用户名 唯一 3-20位 字母数字下划线
    @Column(unique = true, nullable = false, length = 20)
    private String username;

    // 加密密码
    @Column(nullable = false)
    private String password;

    // 手机号 唯一
    @Column(unique = true, nullable = false, length = 11)
    private String phone;

    // 昵称
    private String nickname;

    // 个人简介
    private String intro;

    // 角色 STUDENT / ADMIN / MASTER
    @Column(nullable = false)
    private String role = "STUDENT";

    // 是否锁定 0正常 1锁定
    private Integer locked = 0;

    // 创建时间
    private LocalDateTime createTime;

    // 更新时间
    private LocalDateTime updateTime;
}