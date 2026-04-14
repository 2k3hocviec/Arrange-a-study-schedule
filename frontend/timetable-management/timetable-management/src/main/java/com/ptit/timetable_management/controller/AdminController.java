package com.ptit.timetable_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @PostMapping("/subjects/update")
    public ResponseEntity<?> updateSubject(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok("Thêm, sửa hoặc xóa thông tin môn học trong hệ thống");
    }

    @PostMapping("/schedule/generate")
    public ResponseEntity<?> generateSchedule(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok("Sắp xếp lịch học dựa trên phòng học và giảng viên");
    }

    @GetMapping("/rooms")
    public ResponseEntity<?> getAllRooms() {
        return ResponseEntity.ok("Danh sách thông tin các phòng học (sức chứa, thiết bị)");
    }

    @PutMapping("/schedule/change")
    public ResponseEntity<?> changeSchedule(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok("Cập nhật lại lịch học khi có yêu cầu thay đổi (Hủy/Cập nhật)");
    }
}