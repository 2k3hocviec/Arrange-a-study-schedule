import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { availableCourses, formatTime, hasTimeConflict, MAX_CREDITS, REGISTRATION_OPEN } from "./studentData";

const StudentRegister = ({ registeredIds = [], setRegisteredIds }) => {
  const [keyword, setKeyword] = useState("");
  const registeredCourses = useMemo(
    () => availableCourses.filter((course) => registeredIds.includes(course.id)),
    [registeredIds],
  );
  const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0);

  const filteredCourses = availableCourses.filter((course) =>
    `${course.id} ${course.name} ${course.teacher}`.toLowerCase().includes(keyword.toLowerCase()),
  );

  const registerCourse = (course) => {
    if (!REGISTRATION_OPEN) return toast.error("Hiện chưa trong thời gian mở đăng ký.");
    if (registeredIds.includes(course.id)) return toast.error("Bạn đã đăng ký môn này.");
    if (course.registered >= course.capacity) return toast.error("Lớp học phần đã hết chỗ trống.");
    if (totalCredits + course.credits > MAX_CREDITS) return toast.error(`Không được vượt quá ${MAX_CREDITS} tín chỉ.`);
    if (hasTimeConflict(course, registeredCourses)) return toast.error("Không được đăng ký trùng thời gian học.");

    setRegisteredIds([...registeredIds, course.id]);
    toast.success(`Đã đăng ký ${course.name}`);
  };

  const cancelCourse = (course) => {
    setRegisteredIds(registeredIds.filter((id) => id !== course.id));
    toast.success(`Đã hủy ${course.name}`);
  };

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "8px" }}>SV_BM 2 - ĐĂNG KÝ MÔN HỌC</h2>
      <p style={{ color: "#7f8c8d", marginBottom: "20px" }}>
        Tổng tín chỉ đã đăng ký: <strong>{totalCredits}/{MAX_CREDITS}</strong> · Trạng thái đăng ký: <strong style={{ color: REGISTRATION_OPEN ? "#27ae60" : "#e74c3c" }}>{REGISTRATION_OPEN ? "Đang mở" : "Đã đóng"}</strong>
      </p>

      <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.08)" }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo mã môn, tên môn, giảng viên..."
          style={{ width: "100%", padding: "12px", border: "1px solid #dfe6e9", borderRadius: "8px", marginBottom: "16px", boxSizing: "border-box" }}
        />

        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #3498db", color: "#34495e" }}>
              <th style={{ padding: "12px" }}>STT</th>
              <th>Mã môn học</th>
              <th>Tên môn học</th>
              <th>Số tín chỉ</th>
              <th>Thời gian</th>
              <th>Còn chỗ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course, index) => {
              const isRegistered = registeredIds.includes(course.id);
              const remaining = course.capacity - course.registered - (isRegistered ? 1 : 0);
              return (
                <tr key={course.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{index + 1}</td>
                  <td>{course.id}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>
                  <td>{formatTime(course)}</td>
                  <td style={{ color: remaining > 0 ? "#27ae60" : "#e74c3c", fontWeight: "bold" }}>{Math.max(remaining, 0)}</td>
                  <td>
                    {isRegistered ? (
                      <button onClick={() => cancelCourse(course)} style={{ background: "#e67e22", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}>Hủy</button>
                    ) : (
                      <button onClick={() => registerCourse(course)} style={{ background: "#27ae60", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}>Đăng ký</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRegister;
