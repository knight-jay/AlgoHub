package backend.exception;

import backend.common.Result;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.ConnectException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 网络异常
    @ExceptionHandler(ConnectException.class)
    public Result<String> handleConnectException() {
        return Result.error("网络错误，请稍后重试");
    }

    // JWT 过期
    @ExceptionHandler(ExpiredJwtException.class)
    public Result<String> handleExpiredJwtException() {
        return Result.error(401, "登录已过期，请重新登录");
    }

    // JWT 无效
    @ExceptionHandler({MalformedJwtException.class, UnsupportedJwtException.class, SignatureException.class, IllegalArgumentException.class})
    public Result<String> handleInvalidJwtException() {
        return Result.error(401, "登录状态异常，请重新登录");
    }

    // 服务器异常
    @ExceptionHandler(Exception.class)
    public Result<String> handleException(Exception e) {
        e.printStackTrace();
        return Result.error("注册失败，请联系管理员");
    }
}