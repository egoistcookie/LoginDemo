package com.logindemo.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

/**
 * Spring Security配置类
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * CORS配置源
     * 当使用Spring Security时，CORS必须在Security配置中处理，不能通过@Bean过滤器方式
     * 因为Spring Security会接管所有HTTP请求，包括预检请求(OPTIONS)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 允许的域名模式 - 生产环境建议替换为具体域名，如：https://yourdomain.com
        // 使用setAllowedOriginPatterns而不是setAllowedOrigins以支持通配符
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // 允许的HTTP方法 - 必须包含OPTIONS用于预检请求
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 允许的请求头 - *表示允许所有请求头
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 是否允许发送凭据（cookies、authorization headers等）
        // 设置为true时，allowedOrigins不能使用通配符*
        configuration.setAllowCredentials(true);

        // 暴露给客户端的响应头 - 客户端可以访问这些响应头
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // 创建CORS配置源并注册到所有路径
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 配置CORS - 必须在Spring Security中配置，不能在应用级别单独配置
            // 这是因为Spring Security会拦截所有请求，包括CORS预检请求
            .cors().configurationSource(corsConfigurationSource())
            .and()
            // 禁用CSRF，因为使用JWT
            .csrf().disable()
            // 禁用默认的Session管理，使用无状态的JWT认证
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            // 配置授权规则
            .authorizeRequests()
            // 允许所有人访问的接口
            .antMatchers(
                "/auth/login", 
                "/auth/register", 
                "/auth/validate",
                "/auth/send-sms-code",
                "/auth/login-by-phone",
                "/auth/send-email-code",
                "/auth/reset-password",
                "/auth/wechat/qrcode",
                "/auth/wechat/status",
                "/captcha/**",
                "/swagger-ui/**", 
                "/v3/api-docs/**"
            ).permitAll()
            // 其他接口需要认证
            .anyRequest().authenticated();

        // 在UsernamePasswordAuthenticationFilter之前添加JWT过滤器
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}