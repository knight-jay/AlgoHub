package backend.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import backend.common.Result;
import backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    // 核心：完整实现preHandle方法，修复所有语法错误
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. 获取请求头中的Token（格式：Bearer + 空格 + token）
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            setErrorResponse(response, Result.error(401, "未登录，请先登录"));
            return false;
        }
        // 去掉Bearer前缀（从第7位开始截取，因为"Bearer "是7个字符：B e a r e r 空格）
        token = token.substring(7);

        // 2. 验证Token是否过期
        if (jwtUtil.isTokenExpired(token)) {
            setErrorResponse(response, Result.error(401, "登录已过期，请重新登录"));
            return false;
        }

        // 3. 解析Token并将用户信息存入请求（供后续接口使用）
        Claims claims = jwtUtil.extractClaims(token);
        request.setAttribute("userId", claims.get("userId"));
        request.setAttribute("username", claims.get("username"));
        request.setAttribute("role", claims.get("role"));

        return true;
    }

    // 封装错误响应（修复JSON序列化逻辑）
    private void setErrorResponse(HttpServletResponse response, Result<?> result) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        // 初始化ObjectMapper，修复实例化问题
        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    // 可选：实现接口的其他空方法（避免报错）
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, org.springframework.web.servlet.ModelAndView modelAndView) throws Exception {
        // 空实现即可
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 空实现即可
    }
}