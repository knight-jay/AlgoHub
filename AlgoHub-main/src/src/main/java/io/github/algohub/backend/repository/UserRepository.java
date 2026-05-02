package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByPhone(String phone);
    boolean existsByUsername(String username);
    boolean existsByPhone(String phone);
    List<User> findByRole(String role);
}
