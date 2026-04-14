package com.ptit.timetable_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @GetMapping("/timetable")
    public ResponseEntity<?> getTimetable() {
        return ResponseEntity.ok("Trả về dữ liệu thời khóa biểu cá nhân của sinh viên");
    }

    @PostMapping("/enroll-course")
    public ResponseEntity<?> enrollCourse(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok("Đã nhận yêu cầu đăng ký môn học, đang kiểm tra điều kiện tín chỉ");
    }

    @GetMapping("/course-info/{id}")
    public ResponseEntity<?> getCourseInfo(@PathVariable String id) {
        return ResponseEntity.ok("Trả về chi tiết: môn học, phòng, giảng viên và thời gian");
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        return ResponseEntity.ok("Danh sách thông báo liên quan đến các môn đã đăng ký");
    }
}