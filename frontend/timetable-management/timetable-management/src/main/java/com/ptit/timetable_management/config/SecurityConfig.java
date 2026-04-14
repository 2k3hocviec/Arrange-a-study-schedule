package com.ptit.timetable_management.config;

import com.ptit.timetable_management.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt để React gọi API POST/PUT dễ dàng
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:3000")); // Cho phép ReactJS
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                    config.setAllowedHeaders(List.of("*"));
                    return config;
                }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // API login công khai
                        .requestMatchers("/api/student/**").hasRole("Sinh viên")
                        .requestMatchers("/api/teacher/**").hasRole("Giảng viên")
                        .requestMatchers("/api/admin/**").hasRole("Quản trị viên")
                        .requestMatchers("/api/sysadmin/**").hasRole("Admin hệ thống")
                        .anyRequest().authenticated()
                )
                .httpBasic(basic -> {}); // Hỗ trợ xác thực cơ bản để test

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Dùng bản này để test với mật khẩu lưu dạng text trong DB cho nhanh
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}