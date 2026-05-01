package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    // 根据用户名查询
    User findByUsername(String username);
    // 根据手机号查询
    User findByPhone(String phone);
    // 判断用户名是否存在
    boolean existsByUsername(String username);
    // 判断手机号是否存在
    boolean existsByPhone(String phone);
}