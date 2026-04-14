package com.ptit.timetable_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    @GetMapping("/schedule")
    public ResponseEntity<?> getTeachingSchedule() {
        return ResponseEntity.ok("Trả về lịch giảng dạy cá nhân của giảng viên");
    }

    @PostMapping("/register-schedule")
    public ResponseEntity<?> registerSchedule(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok("Ghi nhận đăng ký lịch dạy cho các môn được phân công");
    }

    @PostMapping("/report-busy")
    public ResponseEntity<?> reportBusy(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok("Đã ghi nhận lịch bận để làm dữ liệu đầu vào xếp lịch");
    }
}