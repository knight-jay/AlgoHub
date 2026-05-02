package io.github.algohub.backend.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            setErrorResponse(response, Result.error(401, "未登录，请先登录"));
            return false;
        }
        token = token.substring(7);

        try {
            if (jwtUtil.isTokenExpired(token)) {
                setErrorResponse(response, Result.error(401, "登录已过期，请重新登录"));
                return false;
            }
            Claims claims = jwtUtil.extractClaims(token);
            request.setAttribute("userId", claims.get("userId", Long.class));
            request.setAttribute("username", claims.get("username", String.class));
            request.setAttribute("role", claims.get("role", String.class));
            return true;
        } catch (ExpiredJwtException e) {
            setErrorResponse(response, Result.error(401, "登录已过期，请重新登录"));
            return false;
        } catch (JwtException e) {
            setErrorResponse(response, Result.error(401, "登录状态异常，请重新登录"));
            return false;
        }
    }

    private void setErrorResponse(HttpServletResponse response, Result<?> result) {
        try {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            ObjectMapper objectMapper = new ObjectMapper();
            response.getWriter().write(objectMapper.writeValueAsString(result));
            response.getWriter().flush();
        } catch (Exception e) {
            // 响应写入失败时忽略，避免覆盖原始错误
        }
    }
}
