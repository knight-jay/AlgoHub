package io.github.algohub.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // 密钥（生产环境建议放到配置文件/配置中心）
    private static final Key KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // 默认有效期：24小时（不记住我）
    private static final long DEFAULT_EXPIRATION = 24 * 60 * 60 * 1000;
    // 记住我有效期：7天
    public static final long REMEMBER_ME_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

    // 重载：默认有效期生成Token（兼容原有逻辑）
    public String generateToken(Long userId, String username, String role) {
        return generateToken(userId, username, role, DEFAULT_EXPIRATION);
    }

    // 核心：自定义有效期生成Token
    public String generateToken(Long userId, String username, String role, long expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role);
        return createToken(claims, username, expiration);
    }

    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(KEY)
                .compact();
    }

    // 解析令牌
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 验证令牌是否过期
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // 从令牌中获取用户名
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // 新增：获取Token过期时间（可选，用于前端展示）
    public Date extractExpiration(String token) {
        return extractClaims(token).getExpiration();
    }
}