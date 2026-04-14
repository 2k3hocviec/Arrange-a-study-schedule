package com.ptit.timetable_management.controller;

import com.ptit.timetable_management.entity.User;
import com.ptit.timetable_management.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final UserRepository userRepository;

    public AuthRestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password))
                .map(user -> ResponseEntity.ok(Map.of(
                        "username", user.getUsername(),
                        "role", user.getRole(), // Sẽ trả về: 'Sinh viên', 'Giảng viên', 'Quản trị viên', 'Admin hệ thống'
                        "fullName", user.getFullName(),
                        "status", "success"
                )))
                .orElse(ResponseEntity.status(401).body(Map.of(
                        "status", "error",
                        "message", "Sai tài khoản hoặc mật khẩu"
                )));
    }
}