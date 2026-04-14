package com.ptit.timetable_management.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String email;

    // Vai trò khớp với ENUM trong SQL: 'Sinh viên', 'Giảng viên', 'Quản trị viên', 'Admin hệ thống'
    private String role;
}